export function guardarUsuario(usuario) {

    localStorage.setItem(
        "user",
        JSON.stringify(usuario)
    );
}

export function obtenerUsuario() {

    return JSON.parse(
        localStorage.getItem("user")
    );
}

export function eliminarUsuario() {

    localStorage.removeItem(
        "user"
    );
}
