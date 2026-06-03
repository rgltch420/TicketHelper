export async function renderlogin() {
    const respuesta = await fetch(
        "./assets/js/views/login.html"
    );

    return await respuesta.text();
}