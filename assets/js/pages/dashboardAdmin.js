import { getTickets, createTicket, updateTicket, deleteTicket } from "../services/ticketApi.js";
import { getUsers } from "../services/authApi.js";

let editingId = null;

export async function renderDashboardAdmin() {
    const response = await fetch("./assets/js/views/dashboardAdmin.html");
    const html = await response.text();
    return html;
}

export async function initDashboardAdmin() {

    await loadUsers();
    loadStatusOptions();
    await loadTickets();

    const form = document.getElementById("ticket-form");
    form.addEventListener("submit", saveTicket);

    const technicianSelect = document.getElementById("technician-select");

    technicianSelect.addEventListener("change", loadStatusOptions);

}

// CARGAR TICKETS

async function loadTickets() {
    const tickets = await getTickets();
    const container = document.getElementById("tickets-container");

    const pendientes = tickets.filter(ticket => ticket.status === "pendiente");
    const asignados = tickets.filter(ticket => ticket.status === "asignado");
    const comenzados = tickets.filter(ticket => ticket.status === "en proceso");
    const solucionados = tickets.filter(ticket => ticket.status === "solucionado");

    container.innerHTML = `
    <div class="jira-board">
      ${renderColumn("Pendiente", pendientes)}
      ${renderColumn("Asignado", asignados)}
      ${renderColumn("Comenzado", comenzados)}
      ${renderColumn("Solucionado", solucionados)}
    </div>
  `;

    addEventsButtons();
}

function renderColumn(title, tickets) {
    let content = "";

    if (tickets.length === 0) {
        content = `<div class="jira-empty">Sin tickets</div>`;
    } else {
        tickets.forEach(function (ticket) {
            content += `
        <div class="jira-ticket">
          <h4>${ticket.name}</h4>

          <p><strong>Tipo:</strong> ${ticket.type}</p>
          <p><strong>Cliente:</strong> ${ticket.clientName || "Sin cliente"}</p>
          <p><strong>Técnico:</strong> ${ticket.technicianName || "Sin asignar"}</p>

          <span class="badge-status ${getBadgeClass(ticket.status)}">
            ${getStatusLabel(ticket.status)}
          </span>

          <div class="jira-ticket-actions">
            <button class="edit-btn" data-id="${ticket.id}">
              Editar
            </button>

            <button class="delete-btn" data-id="${ticket.id}">
              Eliminar
            </button>
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
    if (status === "pendiente") {
        return "badge-pendiente";
    }

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

// GUARDAR TICKET (CREAR O ACTUALIZAR)

async function saveTicket(event) {

    event.preventDefault();

    const technicianSelect = document.getElementById("technician-select");
    const clientSelect = document.getElementById("client-select");
    const statusSelect = document.getElementById("status-select");
    const users = await getUsers();

    const technician = users.find(function (user) {
        return user.id == technicianSelect.value;
    });

    const client = users.find(function (user) {
        return user.id == clientSelect.value;
    });

    let technicianId = null;
    let technicianName = "";

    if (technician) {
        technicianId = technician.id;
        technicianName = technician.name;
    }

    let clientId = null;
    let clientName = "";

    if (client) {
        clientId = client.id;
        clientName = client.name;
    }

    const ticket = {

        name: document.getElementById("ticket-name").value,
        type: document.getElementById("ticket-type").value,
        description: document.getElementById("ticket-description").value,
        technicianId: technicianId,
        technicianName: technicianName,
        clientId: clientId,
        clientName: clientName,
        status: statusSelect.value

    };

    if (editingId) {
        await updateTicket(editingId, ticket);
        editingId = null;
    } else {
        await createTicket(ticket);
    }

    document.getElementById("ticket-form").reset();

    await loadTickets();

}

// ELIMINAR TICKET

async function removeTicket(id) {

    const confirmDelete = confirm("¿Eliminar ticket?");

    if (!confirmDelete) {
        return;
    }

    await deleteTicket(id);
    await loadTickets();

}

// EDITAR TICKET: LLENAR FORMULARIO CON LOS DATOS DEL TICKET PARA EDITARLO

async function editTicket(id) {

    const tickets = await getTickets();

    const ticket = tickets.find(function (item) {
        return item.id == id;
    });

    document.getElementById("ticket-name").value = ticket.name;
    document.getElementById("ticket-type").value = ticket.type;
    document.getElementById("ticket-description").value = ticket.description;
    document.getElementById("technician-select").value = ticket.technicianId;
    document.getElementById("client-select").value = ticket.clientId;

    loadStatusOptions();

    document.getElementById("status-select").value = ticket.status;

    editingId = id;

}

// EVENTOS DE BOTONES

function addEventsButtons() {

    const editButtons = document.querySelectorAll(".edit-btn");

    editButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            editTicket(button.dataset.id);
        });
    });

    const deleteButtons = document.querySelectorAll(".delete-btn");

    deleteButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            removeTicket(button.dataset.id);
        });
    });

}

// CARGAR USUARIOS

async function loadUsers() {

    const users = await getUsers();
    const technicianSelect = document.getElementById("technician-select");
    const clientSelect = document.getElementById("client-select");

    technicianSelect.innerHTML = `
        <option value="">
            Seleccione técnico
        </option>
    `;

    clientSelect.innerHTML = `
        <option value="">
            Seleccione cliente
        </option>
    `;

    users.forEach(function (user) {

        if (user.role === "technician") {
            technicianSelect.innerHTML += `
                <option value="${user.id}">
                    ${user.name}
                </option>
            `;
        }

        if (user.role === "client") {
            clientSelect.innerHTML += `
                <option value="${user.id}">
                    ${user.name}
                </option>
            `;
        }

    });

}

function loadStatusOptions() {

    const technicianSelect = document.getElementById("technician-select");
    const statusSelect = document.getElementById("status-select");

    statusSelect.innerHTML = "";

    if (technicianSelect.value === "") {

        statusSelect.innerHTML += `
            <option value="pendiente">
                Pendiente
            </option>
        `;

        return;

    }

    statusSelect.innerHTML += `
        <option value="asignado">
            Asignado
        </option>

        <option value="en proceso">
            En proceso
        </option>

        <option value="solucionado">
            Solucionado
        </option>
    `;

}