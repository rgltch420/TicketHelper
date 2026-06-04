import axios from "axios";

const authClient = axios.create({
  baseURL: "http://localhost:3001"
});

export async function login(email, password) {
  const response = await authClient.get("/users");

  const usuario = response.data.find((user) => {
    return user.email === email && user.password === password;
  });

  return usuario;
}

export async function getUsers() {
  const response = await fetch("http://localhost:3001/users");
  return await response.json();
}

export async function createUser(user) {
  const response = await fetch("http://localhost:3001/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

  return await response.json();
}
