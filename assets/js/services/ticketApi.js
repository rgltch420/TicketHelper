const API_URL = "http://localhost:3002/tickets";

export async function getTickets() {
    const response = await fetch(API_URL);
    return await response.json();
}

export async function createTicket(ticket) {

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(ticket)
    });

    return await response.json();

}

export async function updateTicket(id, ticket) {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(ticket)
    });

    return await response.json();

}

export async function deleteTicket(id) {
    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });
}