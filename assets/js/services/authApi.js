import axios from "axios";

const authClient = axios.create({
    baseURL: "http://localhost:3001"
});

export async function login(email, password) {

    const response = await authClient.get("/users");

    console.log(response.data);

    const usuario = response.data.find(user => {
            return (
                user.email === email &&
                user.password === password
            );
        });
    return usuario;
}

export async function getUsers() {
    const response = await fetch(
        "http://localhost:3001/users"
    );
    return await response.json();
}