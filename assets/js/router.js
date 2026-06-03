import { renderlogin } from "./pages/login.js";
import { renderhome } from "./pages/home.js";
import { login } from "./services/authApi.js";
import { renderClientView } from "./views/clientView.js";
import {
  guardarUsuario,
  obtenerUsuario,
  eliminarUsuario,
} from "./utils/storage.js";

export async function router() {
  const app = document.getElementById("app");

  const ruta = location.hash;

  // PROTEGER HOME

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
  // LOGIN
  app.innerHTML = await renderlogin();
  if (path === "#/cliente") {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      window.location.hash = "#/login";
      return;
    }

    if (user.role !== "cliente") {
      document.querySelector("#app").innerHTML = `
      <h2>Acceso denegado</h2>
      <p>No tienes permisos para ingresar a la vista de cliente.</p>
    `;
      return;
    }

    renderClientView(user);
  }
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    console.log(email, password);

    const usuario = await login(email, password);

    console.log(usuario);

    if (!usuario) {
      alert("Credenciales incorrectas");

      return;
    }

    guardarUsuario(usuario);

    location.hash = "#home";
  });
}
