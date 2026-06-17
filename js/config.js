
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


/* FALLBACK OFFLINE PARA QUE NO SALGA FAILED TO FETCH */
const DEMO_PRODUCT_OFFLINE = {
  id:1,
  sku:'ASP-POP-001',
  slug:'aspersor-popup-orbit-ajustable',
  name:'Aspersor Pop-Up Orbit ajustable',
  short_name:'Aspersor Pop-Up',
  category_name:'Aspersores',
  short_description:'Ideal para césped, jardines y áreas verdes pequeñas o medianas.',
  main_image_url:'',
  is_active:true,
  specs:[
    {spec_key:'alcance',spec_label:'Alcance',spec_value:'0,1 - 4,5',spec_unit:'m'},
    {spec_key:'presion',spec_label:'Presión',spec_value:'20 - 50',spec_unit:'PSI'},
    {spec_key:'uso',spec_label:'Uso',spec_value:'Césped / jardín',spec_unit:''},
    {spec_key:'conexion',spec_label:'Conexión',spec_value:'1/4',spec_unit:'pulg'}
  ]
};

const DEMO_RECOMMENDATIONS_OFFLINE = [
  {id:1, slug:'boquilla-ajustable-orbit', name:'Boquilla ajustable Orbit', recommendation_type:'Clave', reason:'Controla la salida y cobertura'},
  {id:2, slug:'conector-un-cuarto-orbit', name:'Conector 1/4 Orbit', recommendation_type:'Necesario', reason:'Une el aspersor a la línea'},
  {id:3, slug:'tuberia-riego-orbit', name:'Tubería de riego Orbit', recommendation_type:'Según área', reason:'Distribuye el agua por el jardín'},
  {id:4, slug:'programador-digital-orbit', name:'Programador digital Orbit', recommendation_type:'Premium', reason:'Automatiza horarios de riego'}
];

const DEMO_GUIDE_OFFLINE = {
  title:'Guía visual de instalación',
  description:'Sigue estos pasos antes de instalar.',
  steps:[
    {step_number:1,title:'Mide la zona',description:'Define el área de riego.'},
    {step_number:2,title:'Revisa presión',description:'Verifica que esté entre el rango recomendado.'},
    {step_number:3,title:'Conecta accesorios',description:'Usa boquilla, conector y tubería compatible.'},
    {step_number:4,title:'Prueba cobertura',description:'Ajusta el patrón para evitar desperdicio.'}
  ]
};

async function safeApi(path, fallback, options = {}) {
  try { return await api(path, options); }
  catch (e) {
    console.warn('Backend no disponible, usando demo:', e.message);
    return fallback;
  }
}
