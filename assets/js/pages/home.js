export async function renderhome() {

    const response =
        await fetch("./js/views/home.html");

    return await response.text();
}
