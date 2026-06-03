export async function renderlogin() {
    const respuesta = await fetch(
        "./assets/javascript/views/login.html"
    );

    return await respuesta.text();
}