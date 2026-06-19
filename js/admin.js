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

function escapeJS(value='') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ');
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
  const products = data.products || [];

  adminShell('Productos', `<div class="admin-top"><h1>Productos</h1><button class="btn small" onclick="showProductForm()">Nuevo producto</button></div>
    <div id="productForm"></div>

    <div class="card" style="margin-bottom:12px">
      <label>Buscar producto
        <input class="input" id="productSearch" placeholder="Buscar por nombre, SKU o categoría..." oninput="filterProductsAdmin()">
      </label>
      <small id="productSearchCount">${products.length} producto(s)</small>
    </div>

    <div class="card"><table class="table"><thead><tr><th>Foto</th><th>SKU</th><th>Producto</th><th>Categoría</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    ${products.map(p=>`<tr class="product-row" data-name="${escapeHTML((p.name||'').toLowerCase())}" data-sku="${escapeHTML((p.sku||'').toLowerCase())}" data-category="${escapeHTML((p.category_name||'').toLowerCase())}"><td>${imagePreview(p.main_image_url)}</td><td>${escapeHTML(p.sku||'')}</td><td>${escapeHTML(p.name||'')}</td><td>${escapeHTML(p.category_name||'')}</td><td><span class="badge">${p.is_active?'Activo':'Inactivo'}</span></td><td class="actions"><button class="btn small light" onclick="showProductForm(${p.id})">Editar</button><a class="btn small light" href="${productPublicUrl(p.slug)}" target="_blank">Ver ficha</a><button class="btn small light" onclick="generateQR(${p.id})">Crear QR</button><button class="btn small" style="background:#dc2626;color:white" onclick="openDeleteProductModal(${p.id}, '${escapeJS(p.name||'Producto sin nombre')}', '${escapeJS(p.sku||'')}')">Eliminar</button></td></tr>`).join('')}
    </tbody></table></div>

    <div id="deleteProductModal" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,.58);z-index:9999;align-items:center;justify-content:center;padding:18px">
      <div class="card" style="max-width:460px;width:100%;background:white;box-shadow:0 24px 70px rgba(0,0,0,.35)">
        <h2 style="margin-top:0;color:#dc2626">Eliminar producto</h2>
        <p>¿Estás seguro de eliminar este producto?</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px;margin:12px 0">
          <b id="deleteProductName"></b><br>
          <small id="deleteProductSku"></small>
        </div>
        <p style="font-size:14px;color:#64748b">Esta acción eliminará el producto de Supabase y no se puede deshacer.</p>
        <div class="actions" style="justify-content:flex-end">
          <button class="btn small light" onclick="closeDeleteProductModal()">Cancelar</button>
          <button class="btn small" style="background:#dc2626;color:white" onclick="deleteSelectedProduct()">Sí, eliminar</button>
        </div>
      </div>
    </div>`);
}

async function showProductForm(id=null){
  let p = {sku:'',name:'',slug:'',category_name:'Aspersores',short_description:'',long_description:'',main_image_url:'',difficulty_level:'',usage_type:'',installation_video_url:'',manual_pdf_url:'',alcance:'',alcance_unit:'m',presion:'',presion_unit:'PSI',uso:'',conexion:'',conexion_unit:'',installation_description:'',is_active:true};
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
      <label>Alcance<input class="input" id="productAlcance" value="${escapeHTML(p.alcance || (p.specs||[]).find(s=>s.spec_key==='alcance')?.spec_value || '')}" placeholder="Ej: 0,1 - 4,5"></label>
      <label>Unidad alcance<input class="input" id="productAlcanceUnit" value="${escapeHTML(p.alcance_unit || (p.specs||[]).find(s=>s.spec_key==='alcance')?.spec_unit || 'm')}" placeholder="m"></label>
      <label>Presión<input class="input" id="productPresion" value="${escapeHTML(p.presion || (p.specs||[]).find(s=>s.spec_key==='presion')?.spec_value || '')}" placeholder="Ej: 20 - 50"></label>
      <label>Unidad presión<input class="input" id="productPresionUnit" value="${escapeHTML(p.presion_unit || (p.specs||[]).find(s=>s.spec_key==='presion')?.spec_unit || 'PSI')}" placeholder="PSI"></label>
      <label>Uso<input class="input" id="productUso" value="${escapeHTML(p.uso || p.usage_type || (p.specs||[]).find(s=>s.spec_key==='uso')?.spec_value || '')}" placeholder="Césped, jardín, maceteros..."></label>
      <label>Conexión<input class="input" id="productConexion" value="${escapeHTML(p.conexion || (p.specs||[]).find(s=>s.spec_key==='conexion')?.spec_value || '')}" placeholder="Ej: 1/4"></label>
      <label>Unidad conexión<input class="input" id="productConexionUnit" value="${escapeHTML(p.conexion_unit || (p.specs||[]).find(s=>s.spec_key==='conexion')?.spec_unit || '')}" placeholder="pulg / mm"></label>
      <label>Dificultad<input class="input" id="productDifficulty" value="${escapeHTML(p.difficulty_level||'')}" placeholder="Básico / Medio / Avanzado"></label>
      <label>Video instalación<input class="input" id="productVideo" value="${escapeHTML(p.installation_video_url||'')}" placeholder="Link de YouTube, MP4 o guía visual"></label>
      <label>Manual PDF<input class="input" id="productManual" value="${escapeHTML(p.manual_pdf_url||'')}"></label>
    </div>
    ${p.main_image_url ? `<p><b>Foto actual:</b></p><img class="admin-preview" src="${p.main_image_url}">` : ''}
    <label>Descripción corta<textarea class="input" id="productShortDescription">${escapeHTML(p.short_description||'')}</textarea></label>
    <label>Descripción larga / ficha ampliada<textarea class="input" id="productLongDescription">${escapeHTML(p.long_description||'')}</textarea></label>
    <label>Guía de instalación / instrucciones internas<textarea class="input" id="productInstallationDescription" placeholder="Ej: cortar tubería, instalar conector, regular boquilla, probar presión...">${escapeHTML(p.installation_description||p.installation_guide?.description||'')}</textarea></label>
    <div class="card" style="background:#f7fbff"><b>Recomendaciones inteligentes</b><p>Al guardar, el backend buscará automáticamente productos relacionados ya creados: boquillas, conectores, tubería, programadores y filtros según el producto.</p></div>
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
  formData.append('alcance', document.getElementById('productAlcance').value.trim());
  formData.append('alcance_unit', document.getElementById('productAlcanceUnit').value.trim());
  formData.append('presion', document.getElementById('productPresion').value.trim());
  formData.append('presion_unit', document.getElementById('productPresionUnit').value.trim());
  formData.append('uso', document.getElementById('productUso').value.trim());
  formData.append('usage_type', document.getElementById('productUso').value.trim());
  formData.append('conexion', document.getElementById('productConexion').value.trim());
  formData.append('conexion_unit', document.getElementById('productConexionUnit').value.trim());
  formData.append('installation_description', document.getElementById('productInstallationDescription').value.trim());
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
    ${data.qrs.map(q=>`<tr><td>${escapeHTML(q.qr_code)}</td><td>${escapeHTML(q.product_sku||'')}</td><td>${escapeHTML(q.product_name||'')}</td><td><a href="${escapeHTML(q.qr_url || ('qr.html?qr=' + encodeURIComponent(q.qr_code)))}" target="_blank">Abrir ficha</a></td><td>${q.qr_image_url ? `<img class="admin-preview" src="${q.qr_image_url}">` : 'Pendiente'}</td><td class="actions"><button class="btn light" onclick="copyQRUrl('${q.qr_code}')">Copiar URL</button><button class="btn light" onclick="downloadQR(${q.id}, 'png', '${q.qr_code}')">PNG</button><button class="btn light" onclick="downloadQR(${q.id}, 'svg', '${q.qr_code}')">SVG</button><button class="btn light" onclick="downloadQR(${q.id}, 'pdf', '${q.qr_code}')">PDF</button></td></tr>`).join('')}
    </tbody></table></div>`);
}

async function generateQR(productId){
  if(!productId) return toast('Selecciona un producto para generar QR.');
  await api('/admin/qr/generate',{method:'POST',body:JSON.stringify({productId})});
  toast('QR generado y guardado en base de datos');
  loadQRAdmin();
}

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


let productToDelete = null;

function filterProductsAdmin(){
  const input = document.getElementById('productSearch');
  const count = document.getElementById('productSearchCount');
  if(!input) return;

  const text = input.value.trim().toLowerCase();
  let visible = 0;

  document.querySelectorAll('.product-row').forEach(row=>{
    const name = row.dataset.name || '';
    const sku = row.dataset.sku || '';
    const category = row.dataset.category || '';
    const show = !text || name.includes(text) || sku.includes(text) || category.includes(text);
    row.style.display = show ? '' : 'none';
    if(show) visible++;
  });

  if(count) count.textContent = `${visible} producto(s)`;
}

function openDeleteProductModal(id, name, sku){
  productToDelete = { id, name, sku };
  document.getElementById('deleteProductName').textContent = name || 'Producto sin nombre';
  document.getElementById('deleteProductSku').textContent = sku ? `SKU: ${sku}` : '';
  document.getElementById('deleteProductModal').style.display = 'flex';
}

function closeDeleteProductModal(){
  productToDelete = null;
  const modal = document.getElementById('deleteProductModal');
  if(modal) modal.style.display = 'none';
}

async function deleteSelectedProduct(){
  if(!productToDelete?.id) return;
  await api('/admin/products/' + productToDelete.id, { method:'DELETE' });
  toast('Producto eliminado');
  closeDeleteProductModal();
  loadProductsAdmin();
}

window.addEventListener('unhandledrejection', function(e){console.warn(e.reason);toast(e.reason?.message || 'Error no controlado');});
