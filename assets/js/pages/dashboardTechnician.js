import { getTickets, updateTicket, createTicket } from "../services/ticketApi.js";

export async function renderDashboardTechnician() {
  const response = await fetch("./assets/js/views/dashboardTechnician.html");
  return await response.text();
}

export async function initDashboardTechnician() {
  const usuario = JSON.parse(localStorage.getItem("user"));

  document.getElementById("technician-name").textContent = usuario.name;
  document.getElementById("technician-email").textContent = usuario.email;

  await loadTechnicianTickets(usuario);
  addCreateTicketEvent(usuario);
}

async function loadTechnicianTickets(usuario) {
  const tickets = await getTickets();
  const container = document.getElementById("technician-tickets-container");

  const myTickets = tickets.filter((ticket) => {
    return String(ticket.technicianId) === String(usuario.id);
  });

  container.innerHTML = "";

  if (myTickets.length === 0) {
    container.innerHTML = `
      <p>No tienes tickets asignados todavía.</p>
    `;
    return;
  }

  myTickets.forEach((ticket) => {
    container.innerHTML += `
      <div>
        <h3>${ticket.name}</h3>

        <p><strong>Tipo:</strong> ${ticket.type}</p>
        <p><strong>Descripción:</strong> ${ticket.description}</p>
        <p><strong>Cliente:</strong> ${ticket.clientName || "Sin cliente"}</p>
        <p><strong>Estado actual:</strong> ${ticket.status}</p>

        <label>
          Cambiar estado:
        </label>

        <select class="status-technician-select" data-id="${ticket.id}">
          <option value="asignado" ${ticket.status === "asignado" ? "selected" : ""}>
            Asignado
          </option>

          <option value="en proceso" ${ticket.status === "en proceso" ? "selected" : ""}>
            En proceso
          </option>

          <option value="solucionado" ${ticket.status === "solucionado" ? "selected" : ""}>
            Solucionado
          </option>
        </select>

        <hr>
      </div>
    `;
  });

  addStatusEvents(usuario);
}

function addStatusEvents(usuario) {
  const selects = document.querySelectorAll(".status-technician-select");

  selects.forEach((select) => {
    select.addEventListener("change", async () => {
      const ticketId = select.dataset.id;
      const newStatus = select.value;

      await updateTicket(ticketId, {
        status: newStatus
      });

      await loadTechnicianTickets(usuario);
    });
  });
}

function addCreateTicketEvent(usuario) {
  const form = document.getElementById("technician-ticket-form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("technician-ticket-name").value.trim();
    const type = document.getElementById("technician-ticket-type").value;
    const description = document.getElementById("technician-ticket-description").value.trim();

    if (!name || !type || !description) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    const ticket = {
      name: name,
      type: type,
      description: description,
      technicianId: usuario.id,
      technicianName: usuario.name,
      clientId: null,
      clientName: "",
      status: "asignado"
    };

    await createTicket(ticket);

    form.reset();

    await loadTechnicianTickets(usuario);
  });
}
