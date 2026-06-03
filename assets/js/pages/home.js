export async function renderhome() {

    const response =
        await fetch("./src/views/home.html");

    return await response.text();
}
