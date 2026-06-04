import { renderlogin } from "./pages/login.js";
import { renderhome } from "./pages/home.js";
import { renderClientView } from "./pages/client.js";
import { renderRegister } from "./pages/register.js";
import { login, createUser } from "./services/authApi.js";
import { guardarUsuario, obtenerUsuario, eliminarUsuario } from "./utils/storage.js";
import { renderDashboardAdmin, initDashboardAdmin } from "./pages/dashboardAdmin.js";
import { renderDashboardTechnician, initDashboardTechnician } from "./pages/dashboardTechnician.js";

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

  if (ruta === "#dashboard-admin") {
    const usuario = obtenerUsuario();

    if (!usuario) {
      location.hash = "#login";
      return;
    }

    if (usuario.role !== "admin") {
      app.innerHTML = `
        <h2>Acceso denegado</h2>
        <p>No tienes permisos para ingresar al panel administrador.</p>
      `;
      return;
    }

    app.innerHTML = await renderDashboardAdmin();

    await initDashboardAdmin();

    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        eliminarUsuario();
        location.hash = "#login";
      });
    }

    return;
  }

  if (ruta === "#dashboard-technician") {
    const usuario = obtenerUsuario();

    if (!usuario) {
      location.hash = "#login";
      return;
    }

    if (usuario.role !== "technician") {
      app.innerHTML = `
        <h2>Acceso denegado</h2>
        <p>No tienes permisos para ingresar a la vista de técnico.</p>
      `;
      return;
    }

    app.innerHTML = await renderDashboardTechnician();

    await initDashboardTechnician();

    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        eliminarUsuario();
        location.hash = "#login";
      });
    }

    return;
  }

  if (ruta === "#register") {
    app.innerHTML = await renderRegister();

    const form = document.getElementById("register-form");
    const message = document.getElementById("register-message");
    const goLoginBtn = document.getElementById("go-login-btn");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("register-name").value.trim();
      const email = document.getElementById("register-email").value.trim();
      const password = document.getElementById("register-password").value.trim();

      if (!name || !email || !password) {
        message.textContent = "Todos los campos son obligatorios.";
        return;
      }

      const users = await fetch("http://localhost:3001/users");
      const usersList = await users.json();

      const emailExists = usersList.some((user) => {
        return user.email === email;
      });

      if (emailExists) {
        message.textContent = "Ya existe un usuario con ese correo.";
        return;
      }

      const newUser = {
        name: name,
        email: email,
        password: password,
        role: "client"
      };

      await createUser(newUser);

      message.textContent = "Usuario registrado correctamente. Ya puedes iniciar sesión.";

      form.reset();
    });

    goLoginBtn.addEventListener("click", () => {
      location.hash = "#login";
    });

    return;
  }

  if (ruta === "#login") {
    app.innerHTML = await renderlogin();

    const form = document.getElementById("login-form");
    const goRegisterBtn = document.getElementById("go-register-btn");

    if (goRegisterBtn) {
      goRegisterBtn.addEventListener("click", () => {
        location.hash = "#register";
      });
    }

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

      if (usuario.role === "admin") {
        location.hash = "#dashboard-admin";
        return;
      }

      if (usuario.role === "client") {
        location.hash = "#cliente";
        return;
      }

      if (usuario.role === "technician") {
        location.hash = "#dashboard-technician";
        return;
      }

      location.hash = "#home";
    });

    return;
  }

  location.hash = "#login";
}
