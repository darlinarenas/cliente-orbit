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

const STANDARD_SPECS = [
  ['Alcance', '', 'm'],
  ['Presión', '', 'PSI'],
  ['Uso', '', ''],
  ['Conexión', '', ''],
  ['Caudal', '', 'L/min'],
  ['Ángulo de riego', '', '°']
];

function imagePreview(url) {
  return url ? `<img class="admin-preview" src="${url}" onerror="this.style.display='none'">` : '💧';
}

function productPublicUrl(slug) {
  return `producto.html?slug=${encodeURIComponent(slug)}&qr=preview-admin`;
}

function slugifyLocal(value='') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

function specRowHTML(item = {}, index = 0) {
  return `<div class="card spec-row" style="background:#f8fcff">
    <div class="form-grid">
      <label>Dato técnico<input class="input spec-label" value="${escapeHTML(item.spec_label || '')}" placeholder="Ej: Alcance"></label>
      <label>Valor<input class="input spec-value" value="${escapeHTML(item.spec_value || '')}" placeholder="Ej: 0,1 - 4,5"></label>
      <label>Unidad<input class="input spec-unit" value="${escapeHTML(item.spec_unit || '')}" placeholder="Ej: m, PSI, pulg"></label>
      <label>Orden<input class="input spec-order" type="number" value="${item.sort_order ?? index + 1}"></label>
    </div>
    <button type="button" class="btn small light" onclick="this.closest('.spec-row').remove()">Eliminar dato</button>
  </div>`;
}

function addStandardSpecs() {
  const box = document.getElementById('specsBox');
  const current = [...document.querySelectorAll('.spec-label')].map(i => i.value.trim().toLowerCase());
  STANDARD_SPECS.forEach(([label, value, unit]) => {
    if (!current.includes(label.toLowerCase())) {
      box.insertAdjacentHTML('beforeend', specRowHTML({spec_label:label, spec_value:value, spec_unit:unit}, document.querySelectorAll('.spec-row').length));
    }
  });
}

function guideStepHTML(item = {}, index = 0) {
  return `<div class="card guide-row" style="background:#f8fcff">
    <div class="form-grid">
      <label>Número<input class="input guide-number" type="number" value="${item.step_number ?? index + 1}"></label>
      <label>Título<input class="input guide-title" value="${escapeHTML(item.title || '')}" placeholder="Ej: Mide la zona"></label>
    </div>
    <label>Descripción<textarea class="input guide-description" placeholder="Describe el paso">${escapeHTML(item.description || '')}</textarea></label>
    <label>URL imagen/video<input class="input guide-media" value="${escapeHTML(item.media_url || '')}" placeholder="Opcional"></label>
    <button type="button" class="btn small light" onclick="this.closest('.guide-row').remove()">Eliminar paso</button>
  </div>`;
}

function recommendationRowHTML(item = {}, index = 0) {
  return `<div class="card recommendation-row" style="background:#f8fcff">
    <div class="form-grid">
      <label>Nombre recomendado<input class="input rec-name" value="${escapeHTML(item.name || item.recommended_name || '')}" placeholder="Ej: Boquilla ajustable Orbit"></label>
      <label>Slug recomendado<input class="input rec-slug" value="${escapeHTML(item.slug || item.recommended_slug || '')}" placeholder="Ej: boquilla-ajustable-orbit"></label>
      <label>Tipo<input class="input rec-type" value="${escapeHTML(item.recommendation_type || '')}" placeholder="Necesario / Compatible / Premium"></label>
      <label>Cantidad<input class="input rec-quantity" value="${escapeHTML(item.quantity || '')}" placeholder="Ej: 1 unidad"></label>
      <label>URL foto<input class="input rec-image" value="${escapeHTML(item.image_url || item.main_image_url || '')}" placeholder="Opcional"></label>
      <label>Orden<input class="input rec-priority" type="number" value="${item.priority ?? index + 1}"></label>
    </div>
    <label>Motivo<textarea class="input rec-reason">${escapeHTML(item.reason || '')}</textarea></label>
    <button type="button" class="btn small light" onclick="this.closest('.recommendation-row').remove()">Eliminar recomendado</button>
  </div>`;
}

function faqRowHTML(item = {}) {
  return `<div class="card faq-row" style="background:#f8fcff">
    <label>Pregunta<input class="input faq-question" value="${escapeHTML(item.question || '')}"></label>
    <label>Respuesta<textarea class="input faq-answer">${escapeHTML(item.answer || '')}</textarea></label>
    <button type="button" class="btn small light" onclick="this.closest('.faq-row').remove()">Eliminar FAQ</button>
  </div>`;
}

function collectSpecs() {
  return [...document.querySelectorAll('.spec-row')].map((row, i) => ({
    spec_key: slugifyLocal(row.querySelector('.spec-label').value || `campo-${i+1}`),
    spec_label: row.querySelector('.spec-label').value.trim(),
    spec_value: row.querySelector('.spec-value').value.trim(),
    spec_unit: row.querySelector('.spec-unit').value.trim(),
    sort_order: Number(row.querySelector('.spec-order').value || i + 1)
  })).filter(x => x.spec_label && x.spec_value).sort((a,b)=>a.sort_order-b.sort_order);
}

function collectGuideSteps() {
  return [...document.querySelectorAll('.guide-row')].map((row, i) => ({
    step_number: Number(row.querySelector('.guide-number').value || i+1),
    title: row.querySelector('.guide-title').value.trim(),
    description: row.querySelector('.guide-description').value.trim(),
    media_url: row.querySelector('.guide-media').value.trim()
  })).filter(x => x.title || x.description || x.media_url).sort((a,b)=>a.step_number-b.step_number);
}

function collectRecommendations() {
  return [...document.querySelectorAll('.recommendation-row')].map((row, i) => ({
    name: row.querySelector('.rec-name').value.trim(),
    slug: row.querySelector('.rec-slug').value.trim(),
    recommendation_type: row.querySelector('.rec-type').value.trim(),
    quantity: row.querySelector('.rec-quantity').value.trim(),
    image_url: row.querySelector('.rec-image').value.trim(),
    reason: row.querySelector('.rec-reason').value.trim(),
    priority: Number(row.querySelector('.rec-priority').value || i+1)
  })).filter(x => x.name || x.slug).sort((a,b)=>a.priority-b.priority);
}

function collectFAQ() {
  return [...document.querySelectorAll('.faq-row')].map(row => ({
    question: row.querySelector('.faq-question').value.trim(),
    answer: row.querySelector('.faq-answer').value.trim()
  })).filter(x => x.question && x.answer);
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
      <div class="card" style="margin-top:16px"><h2>Estado</h2><p>Productos, ficha técnica, guía y recomendados se guardan en backend/data/orbit-db.json. No se usa localStorage para datos del proyecto.</p></div>`);
  } catch(e) {
    adminShell('Dashboard', `<div class="admin-top"><h1>Dashboard</h1><span class="pill">Error</span></div><div class="card"><p>${e.message}</p></div>`);
  }
}

async function loadProductsAdmin(){
  requireAdmin();
  const data = await api('/admin/products');
  adminShell('Productos', `<div class="admin-top"><h1>Productos</h1><button class="btn small" onclick="showProductForm()">Nuevo producto</button></div>
    <div id="productForm"></div>
    <div class="card"><table class="table"><thead><tr><th>Foto</th><th>SKU</th><th>Producto</th><th>Categoría</th><th>Ficha</th><th>Recomendados</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    ${data.products.map(p=>`<tr>
      <td>${imagePreview(p.main_image_url)}</td>
      <td>${escapeHTML(p.sku||'')}</td>
      <td>${escapeHTML(p.name||'')}</td>
      <td>${escapeHTML(p.category_name||'')}</td>
      <td><span class="badge">${(p.specs||[]).length} datos</span></td>
      <td><span class="badge">${(p.recommendations||[]).length || 0}</span></td>
      <td><span class="badge">${p.is_active?'Activo':'Inactivo'}</span></td>
      <td class="actions">
        <button class="btn small light" onclick="showProductForm(${p.id})">Editar</button>
        <a class="btn small light" href="${productPublicUrl(p.slug)}" target="_blank">Ver ficha</a>
        <button class="btn small light" onclick="generateQR(${p.id})">Crear QR</button>
      </td>
    </tr>`).join('')}
    </tbody></table></div>`);
}

async function showProductForm(id=null){
  let p = {
    sku:'',name:'',slug:'',short_name:'',category_name:'',line_name:'',
    short_description:'',long_description:'',main_image_url:'',
    difficulty_level:'',usage_type:'',installation_video_url:'',manual_pdf_url:'',
    is_active:true,ai_enabled:true,specs:[],
    installation_guide:{title:'',description:'',main_video_url:'',steps:[]},
    recommendations:[],faq:[]
  };
  if(id){ const data = await api('/admin/products/'+id); p={...p,...data.product}; }

  const guide = p.installation_guide || {title:'',description:'',main_video_url:'',steps:[]};

  document.getElementById('productForm').innerHTML = `<form class="card" onsubmit="saveProduct(event, ${id||'null'})" enctype="multipart/form-data">
    <h2>${id?'Editar':'Crear'} producto</h2>
    <p><b>Todo lo que ve el cliente sale de aquí.</b> Si no llenas alcance, presión, uso, conexión, guía o recomendados, el cliente no los verá.</p>

    <h3>Datos principales</h3>
    <div class="form-grid">
      <label>Nombre del producto<input class="input" id="productName" value="${escapeHTML(p.name||'')}" required></label>
      <label>SKU<input class="input" id="productSku" value="${escapeHTML(p.sku||'')}" required></label>
      <label>Categoría<input class="input" id="productCategory" value="${escapeHTML(p.category_name||'')}"></label>
      <label>Slug<input class="input" id="productSlug" value="${escapeHTML(p.slug||'')}" placeholder="se genera si lo dejas vacío"></label>
      <label>Imagen del producto<input class="input" id="productMainImage" type="file" accept="image/png,image/jpeg,image/webp"></label>
      <label>Estado del producto<select class="input" id="productActive"><option value="true" ${p.is_active!==false?'selected':''}>Activo</option><option value="false" ${p.is_active===false?'selected':''}>Inactivo</option></select></label>
      <label>Dificultad de instalación<input class="input" id="productDifficulty" value="${escapeHTML(p.difficulty_level||'')}" placeholder="Básico / Medio / Avanzado"></label>
      <label>Uso recomendado<input class="input" id="productUsage" value="${escapeHTML(p.usage_type||'')}" placeholder="Césped, jardín, maceteros..."></label>
      <label>Video instalación<input class="input" id="productVideo" value="${escapeHTML(p.installation_video_url||'')}"></label>
      <label>Manual PDF<input class="input" id="productManual" value="${escapeHTML(p.manual_pdf_url||'')}"></label>
    </div>
    ${p.main_image_url ? `<p><b>Foto actual:</b></p><img class="admin-preview" src="${p.main_image_url}">` : ''}

    <label>Descripción corta<textarea class="input" id="productShortDescription">${escapeHTML(p.short_description||'')}</textarea></label>
    <label>Descripción larga<textarea class="input" id="productLongDescription">${escapeHTML(p.long_description||'')}</textarea></label>

    <hr>
    <h3>Ficha técnica</h3>
    <p>Llena aquí los campos que pediste: alcance, presión, uso y conexión. También puedes agregar más.</p>
    <div class="actions">
      <button type="button" class="btn small light" onclick="addStandardSpecs()">Agregar Alcance / Presión / Uso / Conexión</button>
      <button type="button" class="btn small light" onclick="document.getElementById('specsBox').insertAdjacentHTML('beforeend', specRowHTML({}, document.querySelectorAll('.spec-row').length))">Agregar dato manual</button>
    </div>
    <div id="specsBox">${(p.specs||[]).map((s,i)=>specRowHTML(s,i)).join('')}</div>

    <hr>
    <h3>Guía de instalación</h3>
    <div class="form-grid">
      <label>Título de guía<input class="input" id="guideTitle" value="${escapeHTML(guide.title||'')}"></label>
      <label>Video principal de guía<input class="input" id="guideVideo" value="${escapeHTML(guide.main_video_url||p.installation_video_url||'')}"></label>
    </div>
    <label>Descripción de guía<textarea class="input" id="guideDescription">${escapeHTML(guide.description||'')}</textarea></label>
    <div id="guideBox">${(guide.steps||[]).map((s,i)=>guideStepHTML(s,i)).join('')}</div>
    <button type="button" class="btn small light" onclick="document.getElementById('guideBox').insertAdjacentHTML('beforeend', guideStepHTML({}, document.querySelectorAll('.guide-row').length))">Agregar paso de instalación</button>

    <hr>
    <h3>Completa tu instalación</h3>
    <p>Agrega los productos que quieres recomendar al cliente cuando escanee este producto.</p>
    <div id="recommendationsBox">${(p.recommendations||[]).map((r,i)=>recommendationRowHTML(r,i)).join('')}</div>
    <button type="button" class="btn small light" onclick="document.getElementById('recommendationsBox').insertAdjacentHTML('beforeend', recommendationRowHTML({}, document.querySelectorAll('.recommendation-row').length))">Agregar producto recomendado</button>

    <hr>
    <h3>Preguntas frecuentes</h3>
    <div id="faqBox">${(p.faq||[]).map(f=>faqRowHTML(f)).join('')}</div>
    <button type="button" class="btn small light" onclick="document.getElementById('faqBox').insertAdjacentHTML('beforeend', faqRowHTML({}))">Agregar FAQ</button>

    <div class="actions" style="margin-top:18px">
      <button class="btn small" data-action="save">Guardar producto</button>
      <button class="btn small light" data-action="save-generate-qr">Guardar + generar QR</button>
      <button type="button" class="btn small light" onclick="document.getElementById('productForm').innerHTML=''">Cancelar</button>
    </div>
  </form>`;
}

async function saveProduct(e,id){
  e.preventDefault();
  const action = e.submitter?.dataset?.action || 'save';
  const formData = new FormData();

  formData.append('name', document.getElementById('productName').value.trim());
  formData.append('sku', document.getElementById('productSku').value.trim());
  formData.append('slug', document.getElementById('productSlug').value.trim());
  formData.append('category_name', document.getElementById('productCategory').value.trim());
  formData.append('short_description', document.getElementById('productShortDescription').value.trim());
  formData.append('long_description', document.getElementById('productLongDescription').value.trim());
  formData.append('difficulty_level', document.getElementById('productDifficulty').value.trim());
  formData.append('usage_type', document.getElementById('productUsage').value.trim());
  formData.append('installation_video_url', document.getElementById('productVideo').value.trim());
  formData.append('manual_pdf_url', document.getElementById('productManual').value.trim());
  formData.append('is_active', document.getElementById('productActive').value);

  const guide = {
    title: document.getElementById('guideTitle').value.trim(),
    description: document.getElementById('guideDescription').value.trim(),
    main_video_url: document.getElementById('guideVideo').value.trim(),
    steps: collectGuideSteps()
  };

  formData.append('specs_json', JSON.stringify(collectSpecs()));
  formData.append('installation_guide_json', JSON.stringify(guide));
  formData.append('recommendations_json', JSON.stringify(collectRecommendations()));
  formData.append('faq_json', JSON.stringify(collectFAQ()));

  const file = document.getElementById('productMainImage').files[0];
  if(file) formData.append('main_image', file);

  const saved = id
    ? await api('/admin/products/'+id,{method:'PUT',body:formData})
    : await api('/admin/products',{method:'POST',body:formData});

  if(action === 'save-generate-qr'){
    await api('/admin/qr/generate',{method:'POST',body:JSON.stringify({productId:saved.product.id})});
    toast('Producto guardado y QR generado');
  } else {
    toast('Producto guardado');
  }
  loadProductsAdmin();
}

async function loadSimpleList(type,title,active){
  requireAdmin();
  const data = await api('/admin/'+type);
  const rows = (data.items||[]).map(i=>`<tr><td>${escapeHTML(i.name||i.title||'')}</td><td>${escapeHTML(i.slug||i.description||'')}</td><td><span class="badge">${i.is_active!==false?'Activo':'Inactivo'}</span></td></tr>`).join('');
  adminShell(active, `<div class="admin-top"><h1>${title}</h1><button class="btn small" onclick="toast('Formulario listo para siguiente sprint')">Nuevo</button></div><div class="card"><table class="table"><tbody>${rows||'<tr><td>Sin registros aún</td></tr>'}</tbody></table></div>`);
}

async function loadRecommendationsAdmin(){
  requireAdmin();
  const data=await api('/admin/recommendations');
  adminShell('Recomendaciones',`<div class="admin-top"><h1>Recomendaciones</h1><span class="pill">Se editan desde Productos</span></div><div class="card"><table class="table"><thead><tr><th>Producto origen</th><th>Recomendado</th><th>Tipo</th><th>Cantidad</th><th>Razón</th></tr></thead><tbody>${data.recommendations.map(r=>`<tr><td>${escapeHTML(r.source_name||'')}</td><td>${escapeHTML(r.recommended_name||'')}</td><td>${escapeHTML(r.recommendation_type||'')}</td><td>${escapeHTML(r.quantity||'')}</td><td>${escapeHTML(r.reason||'')}</td></tr>`).join('')}</tbody></table></div>`);
}

async function loadQRAdmin(){
  requireAdmin();
  const data = await api('/admin/qr');
  adminShell('QRs', `<div class="admin-top"><h1>Biblioteca de QR</h1><button class="btn small" onclick="generateQR()">Generar QR demo</button></div>
    <div class="card"><p>Cada QR queda asociado a SKU, producto y ficha pública.</p><table class="table"><thead><tr><th>QR</th><th>SKU</th><th>Producto</th><th>Vista</th><th>QR guardado</th><th>Acciones</th></tr></thead><tbody>
    ${data.qrs.map(q=>`<tr><td>${escapeHTML(q.qr_code)}</td><td>${escapeHTML(q.product_sku||'')}</td><td>${escapeHTML(q.product_name||'')}</td><td><a href="qr.html?qr=${encodeURIComponent(q.qr_code)}" target="_blank">Abrir ficha</a></td><td>${q.qr_image_url ? `<img class="admin-preview" src="${q.qr_image_url}">` : 'Pendiente'}</td><td class="actions"><button class="btn light" onclick="copyQRUrl('${q.qr_code}')">Copiar URL</button><button class="btn light" onclick="downloadQR(${q.id}, 'png', '${q.qr_code}')">PNG</button><button class="btn light" onclick="downloadQR(${q.id}, 'svg', '${q.qr_code}')">SVG</button><button class="btn light" onclick="downloadQR(${q.id}, 'pdf', '${q.qr_code}')">PDF</button></td></tr>`).join('')}
    </tbody></table></div>`);
}

async function generateQR(productId=1){await api('/admin/qr/generate',{method:'POST',body:JSON.stringify({productId})});toast('QR generado y guardado');loadQRAdmin();}
function copyQRUrl(qrCode){const url=`${location.origin}/qr.html?qr=${encodeURIComponent(qrCode)}`;navigator.clipboard.writeText(url);toast('URL copiada');}

async function downloadQR(id, format, code){
  const token=sessionStorage.getItem('orbit_admin_token');
  const response=await fetch(`${API_URL}/admin/qr/${id}/download?format=${format}`,{headers:{Authorization:`Bearer ${token}`}});
  if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.message||'No se pudo descargar el QR');}
  const blob=await response.blob();
  const url=window.URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=`${code||'orbit-qr'}.${format}`;
  document.body.appendChild(a);a.click();a.remove();
  window.URL.revokeObjectURL(url);
}

async function loadLeadsAdmin(){requireAdmin();const data=await api('/admin/leads');adminShell('Leads', `<div class="admin-top"><h1>Leads / Correos captados</h1><a class="btn small" href="${API_URL}/admin/leads/export/csv">Exportar CSV</a></div><div class="card"><table class="table"><thead><tr><th>Email</th><th>Nombre</th><th>Producto</th><th>Fuente</th><th>Marketing</th></tr></thead><tbody>${data.leads.map(l=>`<tr><td>${escapeHTML(l.email||'')}</td><td>${escapeHTML(l.name||'')}</td><td>${escapeHTML(l.product_name||'')}</td><td>${escapeHTML(l.source||'')}</td><td>${l.accepts_marketing?'Sí':'No'}</td></tr>`).join('')}</tbody></table></div>`);}
async function loadMediaAdmin(){requireAdmin();adminShell('Multimedia',`<h1>Multimedia</h1><div class="card"><p>Las imágenes principales de producto se cargan desde Productos > Crear/Editar.</p></div>`)}
async function uploadMedia(e){e.preventDefault();toast('Carga local preparada.');}
async function loadQuestionsAdmin(){requireAdmin();const data=await api('/admin/questions');adminShell('Preguntas IA',`<h1>Preguntas IA</h1><div class="card"><table class="table"><thead><tr><th>Pregunta</th><th>Respuesta</th><th>Fuente</th></tr></thead><tbody>${data.questions.map(q=>`<tr><td>${escapeHTML(q.question||'')}</td><td>${escapeHTML(q.answer||'')}</td><td>${escapeHTML(q.source||'')}</td></tr>`).join('')}</tbody></table></div>`)}
async function loadAnalyticsAdmin(){requireAdmin();const d=await api('/admin/analytics/overview');adminShell('Analíticas',`<h1>Analíticas</h1><div class="admin-grid"><div class="stat"><strong>${d.scans}</strong>Escaneos</div><div class="stat"><strong>${d.recommendation_clicks}</strong>Clicks recomendados</div><div class="stat"><strong>${d.questions}</strong>Preguntas</div><div class="stat"><strong>${d.leads}</strong>Leads</div></div>`)}
async function loadKnowledgeAdmin(){requireAdmin();adminShell('Base IA',`<h1>Base de conocimiento IA</h1><div class="card"><p>Espacio para contenido técnico controlado que usará Orbit Assistant.</p><textarea class="input" placeholder="Reglas, fichas, restricciones..."></textarea><button class="btn">Guardar</button></div>`)}
async function loadSettingsAdmin(){requireAdmin();adminShell('Configuración',`<h1>Configuración</h1><div class="card"><label>Nombre del sistema<input class="input" value="Orbit Assistant"></label><button class="btn">Guardar</button></div>`)}
async function loadUsersAdmin(){requireAdmin();adminShell('Usuarios',`<h1>Usuarios admin</h1><div class="card"><table class="table"><tr><td>admin@orbitassistant.cl</td><td>Super Admin</td><td>Activo</td></tr></table></div>`)}
window.addEventListener('unhandledrejection', function(e){console.warn(e.reason);toast(e.reason?.message || 'Error no controlado');});
