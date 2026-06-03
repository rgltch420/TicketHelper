import axios from "axios";

const TICKETS_URL = "http://localhost:3002/tickets";

export async function renderClientView() {
  const user = JSON.parse(localStorage.getItem("user"));

  const app = document.getElementById("app");

  app.innerHTML = `
    <section class="client-view">
      <div class="client-header">
        <div>
          <h1>Panel Cliente</h1>
          <p>Bienvenido, ${user.name || user.email}</p>
        </div>

        <button id="logout-btn">Cerrar sesión</button>
      </div>

      <form id="ticket-form" class="ticket-form">
        <h2>Crear ticket</h2>

        <input type="hidden" id="ticket-id">

        <label>Nombre del ticket</label>
        <input type="text" id="ticket-name" required>

        <label>Tipo de caso</label>
        <select id="ticket-type" required>
          <option value="">Seleccione...</option>
          <option value="incidente">Incidente</option>
          <option value="requerimiento">Requerimiento</option>
          <option value="soporte">Soporte</option>
        </select>

        <label>Descripción</label>
        <textarea id="ticket-description" required></textarea>

        <button type="submit" id="save-ticket-btn">Guardar ticket</button>
        <button type="button" id="cancel-edit-btn" style="display:none;">
          Cancelar edición
        </button>
      </form>

      <hr>

      <h2>Mis tickets</h2>
      <div id="tickets-list"></div>
    </section>
  `;

  await loadClientTickets(user);
  addClientEvents(user);
}
async function loadClientTickets(user) {
  const ticketsList = document.getElementById("tickets-list");

  try {
    const response = await axios.get(TICKETS_URL);
    const tickets = response.data;

    const myTickets = tickets.filter((ticket) => {
      return String(ticket.clientId) === String(user.id);
    });

    if (myTickets.length === 0) {
      ticketsList.innerHTML = "<p>No tienes tickets registrados.</p>";
      return;
    }

    ticketsList.innerHTML = myTickets
      .map((ticket) => {
        const canEdit = !ticket.technicianId || ticket.status === "cerrado";

        return `
        <div class="ticket-card">
          <h3>${ticket.name}</h3>
          <p><strong>Tipo:</strong> ${ticket.type}</p>
          <p><strong>Descripción:</strong> ${ticket.description}</p>
          <p><strong>Estado:</strong> ${ticket.status}</p>
          <p><strong>Técnico:</strong> ${ticket.technicianName || "Sin asignar"}</p>

          ${
            canEdit
              ? `<button class="edit-ticket-btn" data-id="${ticket.id}">
                  Editar
                </button>`
              : `<small>No puedes editar este ticket porque ya tiene técnico asignado.</small>`
          }
        </div>
      `;
      })
      .join("");

    addEditEvents(myTickets);
  } catch (error) {
    console.error(error);
    ticketsList.innerHTML = "<p>Error cargando tickets.</p>";
  }
}
function addClientEvents(user) {
  const form = document.getElementById("ticket-form");
  const logoutBtn = document.getElementById("logout-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const ticketId = document.getElementById("ticket-id").value;
    const name = document.getElementById("ticket-name").value;
    const type = document.getElementById("ticket-type").value;
    const description = document.getElementById("ticket-description").value;

    try {
      if (ticketId) {
        await axios.patch(`${TICKETS_URL}/${ticketId}`, {
          name,
          type,
          description,
        });
      } else {
        await axios.post(TICKETS_URL, {
          name,
          type,
          description,
          clientId: user.id,
          clientName: user.name || user.email,
          technicianId: null,
          technicianName: "",
          status: "pendiente",
        });
      }

      form.reset();
      document.getElementById("ticket-id").value = "";
      document.getElementById("save-ticket-btn").textContent = "Guardar ticket";
      cancelEditBtn.style.display = "none";

      await loadClientTickets(user);
    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el ticket");
    }
  });

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("user");
    location.hash = "#login";
  });

  cancelEditBtn.addEventListener("click", function () {
    form.reset();
    document.getElementById("ticket-id").value = "";
    document.getElementById("save-ticket-btn").textContent = "Guardar ticket";
    cancelEditBtn.style.display = "none";
  });
}

function addEditEvents(tickets) {
  const buttons = document.querySelectorAll(".edit-ticket-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      const ticketId = button.dataset.id;
      const ticket = tickets.find(
        (item) => String(item.id) === String(ticketId),
      );

      document.getElementById("ticket-id").value = ticket.id;
      document.getElementById("ticket-name").value = ticket.name;
      document.getElementById("ticket-type").value = ticket.type;
      document.getElementById("ticket-description").value = ticket.description;

      document.getElementById("save-ticket-btn").textContent =
        "Actualizar ticket";
      document.getElementById("cancel-edit-btn").style.display = "inline-block";
    });
  });
}
