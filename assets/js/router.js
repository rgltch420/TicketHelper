import { renderlogin } from "./pages/login.js";
import { renderhome } from "./pages/home.js";
import { renderClientView } from "./pages/client.js";
import { login } from "./services/authApi.js";
import {
  guardarUsuario,
  obtenerUsuario,
  eliminarUsuario,
} from "./utils/storage.js";

export async function router() {
  const app = document.getElementById("app");
  const ruta = location.hash || "#login";

  if (ruta === "#home") {
    const usuario = obtenerUsuario();

    if (!usuario) {
      location.hash = "#login";
      return;
    }

    app.innerHTML = await renderhome();

    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        eliminarUsuario();
        location.hash = "#login";
      });
    }

    return;
  }

  if (ruta === "#cliente") {
    const usuario = obtenerUsuario();

    if (!usuario) {
      location.hash = "#login";
      return;
    }

    if (usuario.role !== "client") {
      app.innerHTML = `
        <h2>Acceso denegado</h2>
        <p>No tienes permisos para ingresar a la vista de cliente.</p>
      `;
      return;
    }

    renderClientView();
    return;
  }

  if (ruta === "#login") {
    app.innerHTML = await renderlogin();

    const form = document.getElementById("login-form");

    if (!form) {
      console.error("No se encontró el formulario login-form");
      return;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const usuario = await login(email, password);

      if (!usuario) {
        alert("Credenciales incorrectas");
        return;
      }

      guardarUsuario(usuario);

      if (usuario.role === "client") {
        location.hash = "#cliente";
        return;
      }

      location.hash = "#home";
    });

    return;
  }

  location.hash = "#login";
}