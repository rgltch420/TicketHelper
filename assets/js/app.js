import { router } from "./router.js";
import { eliminarUsuario, obtenerUsuario } from "./utils/storage.js";

let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);

  const usuario = obtenerUsuario();

  if (!usuario) {
    return;
  }

  inactivityTimer = setTimeout(() => {
    eliminarUsuario();
    alert("Sesión cerrada por inactividad.");
    location.hash = "#login";
  }, 5 * 60 * 1000);
}

["click", "keydown", "mousemove"].forEach((eventName) => {
  document.addEventListener(eventName, resetInactivityTimer);
});

window.addEventListener("DOMContentLoaded", () => {
  router();
  resetInactivityTimer();
});

window.addEventListener("hashchange", () => {
  router();
  resetInactivityTimer();
});
