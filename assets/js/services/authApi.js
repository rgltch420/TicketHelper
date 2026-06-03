import axios from "axios";

const authClient = axios.create({
    baseURL: "http://localhost:3001"
});

export async function login(email, password) {

    const response =
        await authClient.get("/users");

    console.log(response.data);

    const usuario =
        response.data.find(user => {

            return (
                user.email === email &&
                user.password === password
            );
        });

    return usuario;
}