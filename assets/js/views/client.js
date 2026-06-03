import axios from "axios";

const API_URL = "http://localhost:3002/tickets";

export function renderClientView(user) {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section class="client-view">
      <div class="client-header">
        <div>
          <h1>Panel del Cliente</h1>
          <p>Bienvenido, ${user.name || user.email}</p>
        </div>

        <button id="logoutBtn" class="btn btn-danger">
          Cerrar sesión
        </button>
      </div>

      <div class="client-layout">
        <form id="ticketForm" class="ticket-form">
          <h2>Crear ticket</h2>

          <input type="hidden" id="ticketId" />

          <label>
            Nombre del ticket
            <input 
              type="text" 
              id="ticketName" 
              placeholder="Ej: Problema con el sistema"
              required
            />
          </label>

          <label>
            Tipo de caso
            <select id="ticketType" required>
              <option value="">Seleccione una opción</option>
              <option value="incidente">Incidente</option>
              <option value="requerimiento">Requerimiento</option>
              <option value="soporte">Soporte</option>
            </select>
          </label>

          <label>
            Descripción
            <textarea 
              id="ticketDescription" 
              placeholder="Describe el problema o solicitud"
              required
            ></textarea>
          </label>

          <button type="submit" class="btn btn-primary" id="submitBtn">
            Crear ticket
          </button>

          <button type="button" class="btn btn-secondary hidden" id="cancelEditBtn">
            Cancelar edición
          </button>

          <p id="formMessage" class="form-message"></p>
        </form>

        <div class="tickets-container">
          <h2>Mis tickets</h2>
          <div id="ticketsList" class="tickets-list"></div>
        </div>
      </div>
    </section>
  `;

  loadClientTickets(user);
  setupClientEvents(user);
}
async function loadClientTickets(user) {
  const ticketsList = document.querySelector("#ticketsList");

  try {
    const response = await axios.get(API_URL);
    const tickets = response.data;

    const clientTickets = tickets.filter(
      ticket => String(ticket.clientId) === String(user.id)
    );

    if (clientTickets.length === 0) {
      ticketsList.innerHTML = `
        <p class="empty-message">
          Aún no tienes tickets registrados.
        </p>
      `;
      return;
    }

    ticketsList.innerHTML = clientTickets.map(ticket => {
      const canEdit = canClientEditTicket(ticket);

      return `
        <article class="ticket-card">
          <div class="ticket-card-header">
            <h3>${ticket.name}</h3>
            <span class="status">${ticket.status || "Sin asignar"}</span>
          </div>

          <p><strong>Tipo:</strong> ${ticket.type}</p>
          <p><strong>Descripción:</strong> ${ticket.description}</p>
          <p><strong>Técnico asignado:</strong> 
            ${ticket.technicianId ? ticket.technicianName || "Asignado" : "Pendiente por asignar"}
          </p>

          <div class="ticket-actions">
            ${
              canEdit
                ? `<button class="btn btn-warning edit-btn" data-id="${ticket.id}">
                    Editar
                   </button>`
                : `<small class="blocked-text">
                    No editable porque ya tiene técnico asignado.
                   </small>`
            }
          </div>
        </article>
      `;
    }).join("");

    setupEditButtons(clientTickets);

  } catch (error) {
    ticketsList.innerHTML = `
      <p class="error-message">
        No fue posible cargar los tickets.
      </p>
    `;
  }
}

function canClientEditTicket(ticket) {
  const hasTechnician = Boolean(ticket.technicianId);
  const isClosed = ticket.status === "cerrado" || ticket.status === "solucionado";

  return !hasTechnician || isClosed;
}
function setupClientEvents(user) {
  const form = document.querySelector("#ticketForm");
  const cancelEditBtn = document.querySelector("#cancelEditBtn");
  const logoutBtn = document.querySelector("#logoutBtn");

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const ticketId = document.querySelector("#ticketId").value;
    const name = document.querySelector("#ticketName").value.trim();
    const type = document.querySelector("#ticketType").value;
    const description = document.querySelector("#ticketDescription").value.trim();
    const message = document.querySelector("#formMessage");

    if (!name || !type || !description) {
      message.textContent = "Todos los campos son obligatorios.";
      message.className = "form-message error-message";
      return;
    }

    const ticketData = {
      name,
      type,
      description,
      clientId: user.id,
      clientName: user.name || user.email,
      technicianId: null,
      technicianName: "",
      status: "pendiente"
    };

    try {
      if (ticketId) {
        await axios.patch(`${API_URL}/${ticketId}`, {
          name,
          type,
          description
        });

        message.textContent = "Ticket actualizado correctamente.";
      } else {
        await axios.post(API_URL, ticketData);
        message.textContent = "Ticket creado correctamente.";
      }

      message.className = "form-message success-message";

      resetForm();
      loadClientTickets(user);

    } catch (error) {
      message.textContent = "No fue posible guardar el ticket.";
      message.className = "form-message error-message";
    }
  });

  cancelEditBtn.addEventListener("click", resetForm);

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.hash = "#/login";
  });
}

function setupEditButtons(tickets) {
  const buttons = document.querySelectorAll(".edit-btn");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const ticketId = button.dataset.id;
      const ticket = tickets.find(item => String(item.id) === String(ticketId));

      if (!ticket) return;

      document.querySelector("#ticketId").value = ticket.id;
      document.querySelector("#ticketName").value = ticket.name;
      document.querySelector("#ticketType").value = ticket.type;
      document.querySelector("#ticketDescription").value = ticket.description;

      document.querySelector("#submitBtn").textContent = "Actualizar ticket";
      document.querySelector("#cancelEditBtn").classList.remove("hidden");
    });
  });
}

function resetForm() {
  document.querySelector("#ticketForm").reset();
  document.querySelector("#ticketId").value = "";
  document.querySelector("#submitBtn").textContent = "Crear ticket";
  document.querySelector("#cancelEditBtn").classList.add("hidden");
}