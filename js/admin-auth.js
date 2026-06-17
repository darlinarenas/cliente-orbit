
async function loginAdmin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    const data = await api('/admin/auth/login', { method:'POST', body: JSON.stringify({ email, password }) });
    sessionStorage.setItem('orbit_admin_token', data.token);
    location.href = 'panel-administrativo.html';
  } catch(e) { toast(e.message); }
}
function requireAdmin() {
  if (!sessionStorage.getItem('orbit_admin_token')) location.href = 'admin-login.html';
}
function logoutAdmin() {
  sessionStorage.removeItem('orbit_admin_token');
  location.href = 'admin-login.html';
}
