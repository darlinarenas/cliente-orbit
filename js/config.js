
const API_URL = "https://orbit-backend-0y8l.onrender.com/api";

async function api(path, options = {}) {
  const token = sessionStorage.getItem('orbit_admin_token');
  const headers = options.headers || {};
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Error de conexión');
  return data;
}
function getParam(name) { return new URLSearchParams(window.location.search).get(name); }
function toast(message) {
  let box = document.querySelector('.toast');
  if (!box) { box = document.createElement('div'); box.className = 'toast'; document.body.appendChild(box); }
  box.textContent = message; box.classList.add('show');
  setTimeout(() => box.classList.remove('show'), 2800);
}
function escapeHTML(str='') {
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}


async function safeApi(path, fallback, options = {}) {
  return api(path, options);
}
