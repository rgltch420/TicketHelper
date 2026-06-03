import { renderlogin } from "./pages/login.js";
import { renderhome } from "./pages/home.js";

import { login } from "./services/authApi.js";

import {
    guardarUsuario,
    obtenerUsuario,
    eliminarUsuario
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

        const logoutBtn =
            document.getElementById("logout-btn");

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

const form =
    document.getElementById("login-form");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    console.log(email, password);

    const usuario =
        await login(email, password);

    console.log(usuario);

    if (!usuario) {

        alert("Credenciales incorrectas");

        return;
    }

    guardarUsuario(usuario);

    location.hash = "#home";
});}