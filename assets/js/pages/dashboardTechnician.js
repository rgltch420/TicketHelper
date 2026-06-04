import {
  getTickets,
  updateTicket,
  createTicket,
} from "../services/ticketApi.js";

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

  const asignados = myTickets.filter((ticket) => ticket.status === "asignado");
  const comenzados = myTickets.filter(
    (ticket) => ticket.status === "en proceso",
  );
  const solucionados = myTickets.filter(
    (ticket) => ticket.status === "solucionado",
  );

  container.innerHTML = `
    <div class="jira-board">
      ${renderTechnicianColumn("Asignado", asignados)}
      ${renderTechnicianColumn("Comenzado", comenzados)}
      ${renderTechnicianColumn("Solucionado", solucionados)}
    </div>
  `;

  addStatusEvents(usuario);
}

function renderTechnicianColumn(title, tickets) {
  let content = "";

  if (tickets.length === 0) {
    content = `<div class="jira-empty">Sin tickets</div>`;
  } else {
    tickets.forEach((ticket) => {
      content += `
        <div class="jira-ticket">
          <h4>${ticket.name}</h4>

          <p><strong>Tipo:</strong> ${ticket.type}</p>
          <p><strong>Cliente:</strong> ${ticket.clientName || "Sin cliente"}</p>
          <p><strong>Descripción:</strong> ${ticket.description}</p>

          <span class="badge-status ${getBadgeClass(ticket.status)}">
            ${getStatusLabel(ticket.status)}
          </span>

          <div class="jira-ticket-actions">
            <label>Cambiar estado:</label>

            <select class="status-technician-select" data-id="${ticket.id}">
              <option value="asignado" ${ticket.status === "asignado" ? "selected" : ""}>
                Asignado
              </option>

              <option value="en proceso" ${ticket.status === "en proceso" ? "selected" : ""}>
                Comenzado
              </option>

              <option value="solucionado" ${ticket.status === "solucionado" ? "selected" : ""}>
                Solucionado
              </option>
            </select>
          </div>
        </div>
      `;
    });
  }

  return `
    <section class="jira-column">
      <h3>${title}</h3>
      ${content}
    </section>
  `;
}

function getStatusLabel(status) {
  if (status === "en proceso") {
    return "Comenzado";
  }

  return status;
}

function getBadgeClass(status) {
  if (status === "asignado") {
    return "badge-asignado";
  }

  if (status === "en proceso") {
    return "badge-proceso";
  }

  if (status === "solucionado") {
    return "badge-solucionado";
  }

  return "badge-pendiente";
}

function addStatusEvents(usuario) {
  const selects = document.querySelectorAll(".status-technician-select");

  selects.forEach((select) => {
    select.addEventListener("change", async () => {
      const ticketId = select.dataset.id;
      const newStatus = select.value;

      await updateTicket(ticketId, {
        status: newStatus,
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
    const description = document
      .getElementById("technician-ticket-description")
      .value.trim();

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
      status: "asignado",
    };

    await createTicket(ticket);

    form.reset();

    await loadTechnicianTickets(usuario);
  });
}
