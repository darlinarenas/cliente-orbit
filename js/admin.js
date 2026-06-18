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

function imagePreview(url) {
  return url ? `<img class="admin-preview" src="${url}" onerror="this.style.display='none'">` : '💧';
}

function productPublicUrl(slug) {
  return `producto.html?slug=${encodeURIComponent(slug)}&qr=preview-admin`;
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
  } catch(e) {
    adminShell('Dashboard', `<div class="admin-top"><h1>Dashboard</h1><span class="pill">Modo demo</span></div><div class="card"><p>${e.message}</p></div>`);
  }
}

async function loadProductsAdmin(){
  requireAdmin();
  const data = await api('/admin/products');
  adminShell('Productos', `<div class="admin-top"><h1>Productos</h1><button class="btn small" onclick="showProductForm()">Nuevo producto</button></div>
    <div id="productForm"></div>
    <div class="card"><table class="table"><thead><tr><th>Foto</th><th>SKU</th><th>Producto</th><th>Categoría</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    ${data.products.map(p=>`<tr><td>${imagePreview(p.main_image_url)}</td><td>${escapeHTML(p.sku||'')}</td><td>${escapeHTML(p.name||'')}</td><td>${escapeHTML(p.category_name||'')}</td><td><span class="badge">${p.is_active?'Activo':'Inactivo'}</span></td><td class="actions"><button class="btn small light" onclick="showProductForm(${p.id})">Editar</button><a class="btn small light" href="${productPublicUrl(p.slug)}" target="_blank">Ver ficha</a><button class="btn small light" onclick="generateQR(${p.id})">Crear QR</button></td></tr>`).join('')}
    </tbody></table></div>`);
}

async function showProductForm(id=null){
  let p = {sku:'',name:'',slug:'',category_name:'Aspersores',short_description:'',long_description:'',main_image_url:'',difficulty_level:'',usage_type:'',installation_video_url:'',manual_pdf_url:'',is_active:true};
  if(id){ const data = await api('/admin/products/'+id); p={...p,...data.product}; }

  document.getElementById('productForm').innerHTML = `<form class="card" onsubmit="saveProduct(event, ${id||'null'})" enctype="multipart/form-data">
    <h2>${id?'Editar':'Crear'} producto</h2>
    <div class="form-grid">
      <label>SKU<input class="input" id="productSku" value="${escapeHTML(p.sku||'')}" required></label>
      <label>Nombre<input class="input" id="productName" value="${escapeHTML(p.name||'')}" required></label>
      <label>Slug<input class="input" id="productSlug" value="${escapeHTML(p.slug||'')}" placeholder="se genera si lo dejas vacío"></label>
      <label>Categoría<input class="input" id="productCategory" value="${escapeHTML(p.category_name||'')}"></label>
      <label>Imagen principal del producto<input class="input" id="productMainImage" type="file" accept="image/png,image/jpeg,image/webp"></label>
      <label>Estado<select class="input" id="productActive"><option value="true" ${p.is_active!==false?'selected':''}>Activo</option><option value="false" ${p.is_active===false?'selected':''}>Inactivo</option></select></label>
      <label>Dificultad<input class="input" id="productDifficulty" value="${escapeHTML(p.difficulty_level||'')}" placeholder="Básico / Medio / Avanzado"></label>
      <label>Uso recomendado<input class="input" id="productUsage" value="${escapeHTML(p.usage_type||'')}" placeholder="Césped, jardín, maceteros..."></label>
      <label>Video instalación<input class="input" id="productVideo" value="${escapeHTML(p.installation_video_url||'')}"></label>
      <label>Manual PDF<input class="input" id="productManual" value="${escapeHTML(p.manual_pdf_url||'')}"></label>
    </div>
    ${p.main_image_url ? `<p><b>Foto actual:</b></p><img class="admin-preview" src="${p.main_image_url}">` : ''}
    <label>Descripción corta<textarea class="input" id="productShortDescription">${escapeHTML(p.short_description||'')}</textarea></label>
    <label>Descripción larga / ficha ampliada<textarea class="input" id="productLongDescription">${escapeHTML(p.long_description||'')}</textarea></label>
    <div class="actions">
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
  formData.append('sku', document.getElementById('productSku').value.trim());
  formData.append('name', document.getElementById('productName').value.trim());
  formData.append('slug', document.getElementById('productSlug').value.trim());
  formData.append('category_name', document.getElementById('productCategory').value.trim());
  formData.append('short_description', document.getElementById('productShortDescription').value.trim());
  formData.append('long_description', document.getElementById('productLongDescription').value.trim());
  formData.append('difficulty_level', document.getElementById('productDifficulty').value.trim());
  formData.append('usage_type', document.getElementById('productUsage').value.trim());
  formData.append('installation_video_url', document.getElementById('productVideo').value.trim());
  formData.append('manual_pdf_url', document.getElementById('productManual').value.trim());
  formData.append('is_active', document.getElementById('productActive').value);
  const file = document.getElementById('productMainImage').files[0];
  if(file) formData.append('main_image', file);

  const saved = id ? await api('/admin/products/'+id,{method:'PUT',body:formData}) : await api('/admin/products',{method:'POST',body:formData});

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

async function loadRecommendationsAdmin(){requireAdmin();const data=await api('/admin/recommendations');adminShell('Recomendaciones',`<div class="admin-top"><h1>Recomendaciones</h1><button class="btn small" onclick="toast('Crear recomendación en siguiente sprint')">Nueva recomendación</button></div><div class="card"><table class="table"><thead><tr><th>Producto origen</th><th>Recomendado</th><th>Tipo</th><th>Razón</th></tr></thead><tbody>${data.recommendations.map(r=>`<tr><td>${escapeHTML(r.source_name||'')}</td><td>${escapeHTML(r.recommended_name||'')}</td><td>${escapeHTML(r.recommendation_type||'')}</td><td>${escapeHTML(r.reason||'')}</td></tr>`).join('')}</tbody></table></div>`)}

async function loadQRAdmin(){
  requireAdmin();
  const data = await api('/admin/qr');
  adminShell('QRs', `<div class="admin-top"><h1>Biblioteca de QR</h1><button class="btn small" onclick="generateQR()">Generar QR demo</button></div>
    <div class="card"><p>Cada QR queda asociado a SKU, producto y ficha pública. Desde aquí puedes probarlo, copiar URL y descargarlo para etiqueta.</p><table class="table"><thead><tr><th>QR</th><th>SKU</th><th>Producto</th><th>Vista</th><th>QR guardado</th><th>Acciones</th></tr></thead><tbody>
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

async function loadMediaAdmin(){requireAdmin();adminShell('Multimedia',`<h1>Multimedia</h1><div class="card"><p>Listo para imágenes de producto, galería, videos, PDFs, QR y mascota.</p><form onsubmit="uploadMedia(event)"><input class="input" id="mediaFile" type="file"><button class="btn">Subir archivo</button></form></div>`)}
async function uploadMedia(e){e.preventDefault();toast('Carga local preparada. En producción se conecta a Storage.');}

async function loadQuestionsAdmin(){requireAdmin();const data=await api('/admin/questions');adminShell('Preguntas IA',`<h1>Preguntas IA</h1><div class="card"><table class="table"><thead><tr><th>Pregunta</th><th>Respuesta</th><th>Fuente</th></tr></thead><tbody>${data.questions.map(q=>`<tr><td>${escapeHTML(q.question||'')}</td><td>${escapeHTML(q.answer||'')}</td><td>${escapeHTML(q.source||'')}</td></tr>`).join('')}</tbody></table></div>`)}
async function loadAnalyticsAdmin(){requireAdmin();const d=await api('/admin/analytics/overview');adminShell('Analíticas',`<h1>Analíticas</h1><div class="admin-grid"><div class="stat"><strong>${d.scans}</strong>Escaneos</div><div class="stat"><strong>${d.recommendation_clicks}</strong>Clicks recomendados</div><div class="stat"><strong>${d.questions}</strong>Preguntas</div><div class="stat"><strong>${d.leads}</strong>Leads</div></div>`)}
async function loadKnowledgeAdmin(){requireAdmin();adminShell('Base IA',`<h1>Base de conocimiento IA</h1><div class="card"><p>Espacio para contenido técnico controlado que usará Orbit Assistant.</p><textarea class="input" placeholder="Reglas, fichas, restricciones..."></textarea><button class="btn">Guardar base</button></div>`)}
async function loadSettingsAdmin(){requireAdmin();adminShell('Configuración',`<h1>Configuración</h1><div class="card"><label>Nombre del sistema<input class="input" value="Orbit Assistant"></label><label>Color principal<input class="input" value="#003f8f"></label><button class="btn">Guardar</button></div>`)}
async function loadUsersAdmin(){requireAdmin();adminShell('Usuarios',`<h1>Usuarios admin</h1><div class="card"><table class="table"><tr><td>admin@orbitassistant.cl</td><td>Super Admin</td><td>Activo</td></tr></table></div>`)}

window.addEventListener('unhandledrejection', function(e){console.warn(e.reason);toast(e.reason?.message || 'Error no controlado');});
