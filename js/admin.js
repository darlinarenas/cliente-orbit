
function adminShell(active, content) {
  const links = [
    ['panel-administrativo.html','Dashboard'],
    ['admin-productos.html','Productos'],
    ['admin-categorias.html','Categorías'],
    ['admin-lineas.html','Líneas'],
    ['admin-recomendaciones.html','Recomendaciones'],
    ['admin-compatibilidades.html','Compatibilidades'],
    ['admin-guias.html','Guías'],
    ['admin-multimedia.html','Multimedia'],
    ['admin-qrs.html','QRs'],
    ['admin-analiticas.html','Analíticas'],
    ['admin-preguntas.html','Preguntas IA'],
    ['admin-conocimiento.html','Base IA'],
    ['admin-usuarios.html','Usuarios'],
    ['admin-configuracion.html','Configuración'],
    ['admin-leads.html','Leads']
  ];
  document.getElementById('app').innerHTML = `<div class="admin-shell">
    <aside class="sidebar">
      <h2>Orbit Admin</h2><small>Panel privado</small>
      ${links.map(x=>`<a class="${active===x[1]?'active':''}" href="${x[0]}">${x[1]}</a>`).join('')}
      <button onclick="logoutAdmin()">Cerrar sesión</button>
    </aside>
    <main class="admin-main">${content}</main>
  </div>`;
}
async function loadDashboard(){
  requireAdmin();
  try {
    const d = await api('/admin/analytics/overview');
    adminShell('Dashboard', `<div class="admin-top"><h1>Dashboard</h1><span class="pill">Sistema premium</span></div>
      <div class="admin-grid">
        <div class="stat"><strong>${d.products}</strong>Productos</div>
        <div class="stat"><strong>${d.scans}</strong>Escaneos</div>
        <div class="stat"><strong>${d.questions}</strong>Preguntas</div>
        <div class="stat"><strong>${d.leads}</strong>Leads</div>
      </div>
      <div class="card" style="margin-top:16px"><h2>Estado</h2><p>Cliente sin login, QR directo, recomendaciones, multimedia, IA base y administrador protegido.</p></div>`);
  } catch(e) { adminShell('Dashboard', `<div class="admin-top"><h1>Dashboard</h1><span class="pill">Modo demo</span></div><div class="admin-grid"><div class="stat"><strong>6</strong>Productos</div><div class="stat"><strong>128</strong>Escaneos</div><div class="stat"><strong>34</strong>Preguntas</div><div class="stat"><strong>1</strong>Lead</div></div><div class="card" style="margin-top:16px"><p>Backend apagado. Enciéndelo para datos reales.</p></div>`); }
}
async function loadProductsAdmin(){
  requireAdmin();
  const data = await api('/admin/products');
  adminShell('Productos', `<div class="admin-top"><h1>Productos</h1><button class="btn small" onclick="showProductForm()">Nuevo producto</button></div>
    <div id="productForm"></div>
    <div class="card"><table class="table"><thead><tr><th>Foto</th><th>SKU</th><th>Producto</th><th>Categoría</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    ${data.products.map(p=>`<tr><td>${p.main_image_url?`<img class="admin-preview" src="${p.main_image_url}">`:'💧'}</td><td>${p.sku}</td><td>${p.name}</td><td>${p.category_name}</td><td><span class="badge">${p.is_active?'Activo':'Inactivo'}</span></td><td><button class="btn small light" onclick="showProductForm(${p.id})">Editar</button></td></tr>`).join('')}
    </tbody></table></div>`);
}
async function showProductForm(id=null){
  let p = {sku:'',name:'',slug:'',category_name:'Aspersores',short_description:'',main_image_url:''};
  if(id){ const data = await api('/admin/products/'+id); p=data.product; }
  document.getElementById('productForm').innerHTML = `<form class="card" onsubmit="saveProduct(event, ${id||'null'})">
    <h2>${id?'Editar':'Crear'} producto</h2>
    <div class="form-grid">
      <label>SKU<input class="input" id="sku" value="${p.sku||''}"></label>
      <label>Nombre<input class="input" id="name" value="${p.name||''}"></label>
      <label>Slug<input class="input" id="slug" value="${p.slug||''}"></label>
      <label>Categoría<input class="input" id="category_name" value="${p.category_name||''}"></label>
      <label>URL foto principal<input class="input" id="main_image_url" value="${p.main_image_url||''}"></label>
      <label>Estado<select class="input" id="is_active"><option value="true">Activo</option><option value="false">Inactivo</option></select></label>
    </div>
    <label>Descripción<textarea class="input" id="short_description">${p.short_description||''}</textarea></label>
    <button class="btn">Guardar producto</button>
  </form>`;
}
async function saveProduct(e,id){
  e.preventDefault();
  const payload={sku:sku.value,name:name.value,slug:slug.value,category_name:category_name.value,short_description:short_description.value,main_image_url:main_image_url.value,is_active:is_active.value==='true'};
  if(id) await api('/admin/products/'+id,{method:'PUT',body:JSON.stringify(payload)});
  else await api('/admin/products',{method:'POST',body:JSON.stringify(payload)});
  toast('Producto guardado'); loadProductsAdmin();
}
async function loadSimpleList(type,title,active){
  requireAdmin();
  const data = await api('/admin/'+type);
  const rows = (data.items||[]).map(i=>`<tr><td>${i.name||i.title}</td><td>${i.slug||i.description||''}</td><td><span class="badge">${i.is_active!==false?'Activo':'Inactivo'}</span></td></tr>`).join('');
  adminShell(active, `<div class="admin-top"><h1>${title}</h1><button class="btn small" onclick="toast('Formulario listo para siguiente sprint')">Nuevo</button></div><div class="card"><table class="table"><tbody>${rows||'<tr><td>Sin registros aún</td></tr>'}</tbody></table></div>`);
}
async function loadRecommendationsAdmin(){requireAdmin();const data=await api('/admin/recommendations');adminShell('Recomendaciones',`<div class="admin-top"><h1>Recomendaciones</h1><button class="btn small" onclick="toast('Crear recomendación en siguiente sprint')">Nueva recomendación</button></div><div class="card"><table class="table"><thead><tr><th>Producto origen</th><th>Recomendado</th><th>Tipo</th><th>Razón</th></tr></thead><tbody>${data.recommendations.map(r=>`<tr><td>${r.source_name}</td><td>${r.recommended_name}</td><td>${r.recommendation_type}</td><td>${r.reason}</td></tr>`).join('')}</tbody></table></div>`)}
async function loadQRAdmin(){
  requireAdmin();
  const data = await api('/admin/qr');
  adminShell('QRs', `<div class="admin-top"><h1>Generador QR</h1><button class="btn small" onclick="generateQR()">Generar QR demo</button></div>
    <div class="card"><p>El QR público abre el módulo cliente sin login.</p><table class="table"><thead><tr><th>QR</th><th>Producto</th><th>Ruta cliente</th><th>Descargar</th></tr></thead><tbody>
    ${data.qrs.map(q=>`<tr><td>${q.qr_code}</td><td>${q.product_name}</td><td><a href="qr.html?qr=${q.qr_code}" target="_blank">qr.html?qr=${q.qr_code}</a></td><td class="actions"><a class="btn light" href="${API_URL}/admin/qr/${q.id}/download?format=png">PNG</a><a class="btn light" href="${API_URL}/admin/qr/${q.id}/download?format=svg">SVG</a><a class="btn light" href="${API_URL}/admin/qr/${q.id}/download?format=pdf">PDF</a></td></tr>`).join('')}
    </tbody></table></div>`);
}
async function generateQR(){await api('/admin/qr/generate',{method:'POST',body:JSON.stringify({productId:1})});toast('QR generado');loadQRAdmin();}
async function loadLeadsAdmin(){
  requireAdmin();
  const data = await api('/admin/leads');
  adminShell('Leads', `<div class="admin-top"><h1>Leads / Correos captados</h1><a class="btn small" href="${API_URL}/admin/leads/export/csv">Exportar CSV</a></div>
    <div class="card"><table class="table"><thead><tr><th>Email</th><th>Nombre</th><th>Producto</th><th>Fuente</th><th>Marketing</th></tr></thead><tbody>
    ${data.leads.map(l=>`<tr><td>${l.email}</td><td>${l.name||''}</td><td>${l.product_name||''}</td><td>${l.source||''}</td><td>${l.accepts_marketing?'Sí':'No'}</td></tr>`).join('')}
    </tbody></table></div>`);
}
async function loadMediaAdmin(){requireAdmin();adminShell('Multimedia',`<h1>Multimedia</h1><div class="card"><p>Listo para imágenes de producto, galería, videos, PDFs, QR y mascota.</p><form onsubmit="uploadMedia(event)"><input class="input" id="mediaFile" type="file"><button class="btn">Subir archivo</button></form></div>`)}
async function uploadMedia(e){e.preventDefault();toast('Carga local preparada. En producción se conecta a Storage.');}
async function loadQuestionsAdmin(){requireAdmin();const data=await api('/admin/questions');adminShell('Preguntas IA',`<h1>Preguntas IA</h1><div class="card"><table class="table"><thead><tr><th>Pregunta</th><th>Respuesta</th><th>Fuente</th></tr></thead><tbody>${data.questions.map(q=>`<tr><td>${q.question}</td><td>${q.answer}</td><td>${q.source}</td></tr>`).join('')}</tbody></table></div>`)}
async function loadAnalyticsAdmin(){requireAdmin();const d=await api('/admin/analytics/overview');adminShell('Analíticas',`<h1>Analíticas</h1><div class="admin-grid"><div class="stat"><strong>${d.scans}</strong>Escaneos</div><div class="stat"><strong>${d.recommendation_clicks}</strong>Clicks recomendados</div><div class="stat"><strong>${d.questions}</strong>Preguntas</div><div class="stat"><strong>${d.leads}</strong>Leads</div></div>`)}
async function loadKnowledgeAdmin(){requireAdmin();adminShell('Base IA',`<h1>Base de conocimiento IA</h1><div class="card"><p>Espacio para contenido técnico controlado que usará Orbit Assistant.</p><textarea class="input" placeholder="Reglas, fichas, restricciones..."></textarea><button class="btn">Guardar base</button></div>`)}
async function loadSettingsAdmin(){requireAdmin();adminShell('Configuración',`<h1>Configuración</h1><div class="card"><label>Nombre del sistema<input class="input" value="Orbit Assistant"></label><label>Color principal<input class="input" value="#003f8f"></label><button class="btn">Guardar</button></div>`)}
async function loadUsersAdmin(){requireAdmin();adminShell('Usuarios',`<h1>Usuarios admin</h1><div class="card"><table class="table"><tr><td>admin@orbitassistant.cl</td><td>Super Admin</td><td>Activo</td></tr></table></div>`)}

window.addEventListener('unhandledrejection', function(e){
  console.warn(e.reason);
  toast('Backend apagado o no disponible. Enciende orbit-backend.');
});
