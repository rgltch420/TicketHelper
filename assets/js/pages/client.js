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
            <p>Reporta un incidente o solicitud</p>
          </div>

          <form id="ticket-form" class="ticket-form">
            <input type="hidden" id="ticket-id" />

            <div class="form-group">
              <label for="ticket-name">Nombre del ticket</label>
              <input type="text" id="ticket-name" placeholder="Ej. Error al iniciar sesión" required />
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
              <textarea id="ticket-description" rows="6" placeholder="Describe el problema..." required></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" id="save-ticket-btn">Crear ticket</button>
              <button type="button" class="btn btn-secondary" id="cancel-edit-btn" style="display:none;">
                Cancelar
              </button>
            </div>
          </form>
        </aside>

        <main class="panel list-panel">
          <div class="panel-header panel-header-inline">
            <div>
              <h2>My Tickets</h2>
              <p>Consulta y administra tus tickets</p>
            </div>
          </div>

          <div id="tickets-list" class="tickets-list">
            <article class="ticket-card">
              <div class="ticket-card-top">
                <div>
                  <h3>Problema con acceso al sistema</h3>
                  <p class="ticket-type">Incidente</p>
                </div>
                <span class="status-badge status-pending">Pendiente</span>
              </div>

              <p class="ticket-description">
                No puedo iniciar sesión con mis credenciales desde la mañana.
              </p>

              <div class="ticket-meta">
                <span><strong>Técnico:</strong> Sin asignar</span>
                <span><strong>Cliente:</strong> ${usuario.name}</span>
              </div>

              <div class="ticket-actions">
                <button class="btn btn-secondary">Editar</button>
              </div>
            </article>
          </div>
        </main>
      </div>
    </section>
  `;

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("user");
    location.hash = "#login";
  });
}