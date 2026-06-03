export async function renderDashboardAdmin() {

    const response = await fetch("./assets/js/views/dashboardAdmin.html");

    return await response.text();
}