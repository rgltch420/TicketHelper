export async function renderDashboardTechnician() {
    const response = await fetch("./assets/js/views/dashboardTechnician.html");
    return await response.text();
}