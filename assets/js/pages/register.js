export async function renderRegister() {
  const response = await fetch("./assets/js/views/register.html");
  return await response.text();
}
