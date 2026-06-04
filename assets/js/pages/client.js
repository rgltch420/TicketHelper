import { getTickets, createTicket, updateTicket } from "../services/ticketApi.js";

export function renderClientView() {
  const app = document.getElementById("app");
  const usuario = JSON.parse(localStorage.getItem("user"));

  app.innerHTML = `
    <section class="client-dashboard">
      <header class="topbar">
        <div>
          <h1 class="topbar-title">Ticket System</h1>
          <p class="topbar-subtitle">Client Workspace</p>
        </div>

        <div class="topbar-actions">
          <div class="user-chip">
            <span class="user-name">${usuario.name}</span>
            <span class="user-role">${usuario.role}</span>
          </div>

          <button id="logout-btn" class="btn btn-danger">Cerrar sesión</button>
        </div>
      </header>

      <div class="dashboard-grid">
        <aside class="panel form-panel">
          <div class="panel-header">
            <h2>Create Ticket</h2>
            <p>Registra una incidencia o solicitud. El administrador asignará un técnico.</p>
          </div>

          <form id="ticket-form" class="ticket-form">
            <input type="hidden" id="ticket-id" />

            <div class="form-group">
              <label for="ticket-name">Nombre del ticket</label>
              <input 
                type="text" 
                id="ticket-name" 
                placeholder="Ej. Error al iniciar sesión" 
                required
              />
            </div>

            <div class="form-group">
              <label for="ticket-type">Tipo de caso</label>
              <select id="ticket-type" required>
                <option value="">Seleccione</option>
                <option value="incidente">Incidente</option>
                <option value="requerimiento">Requerimiento</option>
                <option value="soporte">Soporte</option>
              </select>
            </div>

            <div class="form-group">
              <label for="ticket-description">Descripción</label>
              <textarea 
                id="ticket-description" 
                rows="6" 
                placeholder="Describe el problema o requerimiento..." 
                required
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="save-ticket-btn">
                Crear ticket
              </button>

              <button type="button" class="btn btn-secondary" id="cancel-edit-btn" style="display:none;">
                Cancelar
              </button>
            </div>

            <p id="ticket-message" class="ticket-message"></p>
          </form>
        </aside>

        <main class="panel list-panel">
          <div class="panel-header panel-header-inline">
            <div>
              <h2>My Tickets</h2>
              <p>Consulta los tickets creados por tu usuario</p>
            </div>
          </div>

          <div id="tickets-list" class="tickets-list">
            <p>Cargando tickets...</p>
          </div>
        </main>
      </div>
    </section>
  `;

  addClientEvents(usuario);
  loadClientTickets(usuario);
}

function addClientEvents(usuario) {
  const form = document.getElementById("ticket-form");
  const logoutBtn = document.getElementById("logout-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    location.hash = "#login";
  });

  cancelEditBtn.addEventListener("click", () => {
    resetForm();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const ticketId = document.getElementById("ticket-id").value;
    const name = document.getElementById("ticket-name").value.trim();
    const type = document.getElementById("ticket-type").value;
    const description = document.getElementById("ticket-description").value.trim();
    const message = document.getElementById("ticket-message");

    if (!name || !type || !description) {
      message.textContent = "Todos los campos son obligatorios.";
      return;
    }

    try {
      if (ticketId) {
        await updateTicket(ticketId, {
          name: name,
          type: type,
          description: description
        });

        message.textContent = "Ticket actualizado correctamente.";
      } else {
        const newTicket = {
          name: name,
          type: type,
          description: description,

          technicianId: null,
          technicianName: "",

          clientId: usuario.id,
          clientName: usuario.name,

          status: "pendiente"
        };

        await createTicket(newTicket);

        message.textContent = "Ticket creado correctamente. Queda pendiente de asignación por un administrador.";
      }

      resetForm();
      await loadClientTickets(usuario);

    } catch (error) {
      console.error(error);
      message.textContent = "No fue posible guardar el ticket.";
    }
  });
}

async function loadClientTickets(usuario) {
  const ticketsList = document.getElementById("tickets-list");

  try {
    const tickets = await getTickets();

    const myTickets = tickets.filter((ticket) => {
      return String(ticket.clientId) === String(usuario.id);
    });

    if (myTickets.length === 0) {
      ticketsList.innerHTML = `
        <div class="empty-state">
          <h3>No tienes tickets registrados</h3>
          <p>Crea tu primer ticket desde el formulario lateral.</p>
        </div>
      `;
      return;
    }

    ticketsList.innerHTML = myTickets.map((ticket) => {
      const canEdit = canClientEdit(ticket);
      const statusClass = getStatusClass(ticket.status);

      return `
        <article class="ticket-card">
          <div class="ticket-card-top">
            <div>
              <h3>${ticket.name}</h3>
              <p class="ticket-type">${ticket.type}</p>
            </div>

            <span class="status-badge ${statusClass}">
              ${ticket.status}
            </span>
          </div>

          <p class="ticket-description">
            ${ticket.description}
          </p>

          <div class="ticket-meta">
            <span><strong>Técnico:</strong> ${ticket.technicianName || "Sin asignar"}</span>
            <span><strong>Cliente:</strong> ${ticket.clientName}</span>
          </div>

          <div class="ticket-actions">
            ${
              canEdit
                ? `<button class="btn btn-secondary edit-ticket-btn" data-id="${ticket.id}">
                    Editar
                  </button>`
                : `<small class="blocked-text">
                    No editable. El ticket ya fue asignado a un técnico.
                  </small>`
            }
          </div>
        </article>
      `;
    }).join("");

    addEditEvents(myTickets);

  } catch (error) {
    console.error(error);

    ticketsList.innerHTML = `
      <div class="empty-state">
        <h3>Error cargando tickets</h3>
        <p>Verifica que json-server esté corriendo en el puerto 3002.</p>
      </div>
    `;
  }
}

function addEditEvents(tickets) {
  const buttons = document.querySelectorAll(".edit-ticket-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const ticketId = button.dataset.id;

      const ticket = tickets.find((item) => {
        return String(item.id) === String(ticketId);
      });

      if (!ticket) {
        return;
      }

      document.getElementById("ticket-id").value = ticket.id;
      document.getElementById("ticket-name").value = ticket.name;
      document.getElementById("ticket-type").value = ticket.type;
      document.getElementById("ticket-description").value = ticket.description;

      document.getElementById("save-ticket-btn").textContent = "Actualizar ticket";
      document.getElementById("cancel-edit-btn").style.display = "inline-block";
    });
  });
}

function canClientEdit(ticket) {
  const hasTechnician = ticket.technicianId !== null && ticket.technicianId !== "";
  const isClosed = ticket.status === "cerrado" || ticket.status === "solucionado";

  return !hasTechnician || isClosed;
}

function resetForm() {
  document.getElementById("ticket-form").reset();
  document.getElementById("ticket-id").value = "";
  document.getElementById("save-ticket-btn").textContent = "Crear ticket";
  document.getElementById("cancel-edit-btn").style.display = "none";
}

function getStatusClass(status) {
  if (status === "solucionado" || status === "cerrado") {
    return "status-done";
  }

  if (status === "asignado" || status === "en proceso") {
    return "status-process";
  }

  return "status-pending";
}