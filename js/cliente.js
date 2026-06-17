
let CURRENT_PRODUCT = null;
let CURRENT_QR = '';

function clientHeader() {
  return `<header class="client-header">
    <div class="brand"><div class="logo">O</div><div><b>Orbit Assistant</b><br><span>Cliente sin login</span></div></div>
    <span class="pill">QR activo</span>
  </header>`;
}
function bottomNav() {
  return `<nav class="bottom-nav">
    <button id="nav-inicio" onclick="location.href='index.html'"><span>🏠</span>Inicio</button>
    <button id="nav-producto" onclick="goSection('producto')"><span>💧</span>Producto</button>
    <button id="nav-ficha" onclick="goSection('ficha')"><span>📋</span>Ficha</button>
    <button id="nav-recomendados" onclick="goSection('recomendados')"><span>🛒</span>Completar</button>
    <button id="nav-chat" onclick="goSection('chat')"><span>🤖</span>Chat</button>
  </nav>`;
}
function setActiveNav(id) {
  document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.remove('active'));
  const btn = document.getElementById('nav-' + id);
  if (btn) btn.classList.add('active');
}
function goSection(id) {
  const el = document.getElementById(id);
  if (el) { el.scrollIntoView({behavior:'smooth', block:'start'}); setActiveNav(id); return; }
  if (id === 'producto') location.href = 'producto.html?slug=aspersor-popup-orbit-ajustable&qr=ASP-POP-001';
}
function loadIndex() {
  document.getElementById('app').innerHTML = `<div class="phone">${clientHeader()}<main class="screen">
    <div class="hero">
      <span class="pill">💧 Asesor inteligente en tienda</span>
      <h1>Escanea, entiende e instala mejor</h1>
      <p>Orbit Assistant muestra ficha técnica, instalación, productos compatibles y recomendaciones sin iniciar sesión.</p>
      <img class="mascot" src="assets/mascot/orbito.jpeg" onerror="this.style.display='none'">
      <button class="btn" onclick="location.href='qr.html?qr=ASP-POP-001'">Simular escaneo QR</button><br><br>
      <button class="btn light" onclick="location.href='proyecto.html'">Armar proyecto de riego</button>
    </div>
  </main><button class="mascot-float" onclick="location.href='qr.html?qr=ASP-POP-001'"><img src="assets/mascot/orbito.jpeg"></button>${bottomNav()}</div>`;
  setActiveNav('inicio');
}
async function loadQRPage() {
  const qr = getParam('qr') || 'ASP-POP-001';
  try {
    await api(`/qr/${encodeURIComponent(qr)}/scan`, {method:'POST', body:JSON.stringify({})});
    const data = await api(`/qr/${encodeURIComponent(qr)}`);
    location.href = `producto.html?slug=${encodeURIComponent(data.product.slug)}&qr=${encodeURIComponent(qr)}`;
  } catch(e) {
    location.href = `producto.html?slug=aspersor-popup-orbit-ajustable&qr=${encodeURIComponent(qr)}`;
  }
}
async function loadProductPage() {
  const slug = getParam('slug') || 'aspersor-popup-orbit-ajustable';
  CURRENT_QR = getParam('qr') || '';
  const app = document.getElementById('app');
  app.innerHTML = `<div class="phone">${clientHeader()}<main class="screen"><div class="card"><h1>Cargando...</h1><p>Buscando producto Orbit.</p></div></main>${bottomNav()}</div>`;

  const p = await safeApi(`/public/product/${slug}`, {product: DEMO_PRODUCT_OFFLINE});
  const r = await safeApi(`/public/product/${slug}/recommendations`, {recommendations: DEMO_RECOMMENDATIONS_OFFLINE});
  const g = await safeApi(`/public/product/${slug}/installation`, {guide: DEMO_GUIDE_OFFLINE});

  renderProduct(p.product, r.recommendations, g.guide);
}
function productVisual(product) {
  if (product.main_image_url) return `<img class="product-img" src="${product.main_image_url}">`;
  return `<div class="water"></div><div class="sprinkler"></div>`;
}
function renderProduct(product, recommendations, guide) {
  CURRENT_PRODUCT = product;
  const slug = product.slug;
  document.getElementById('app').innerHTML = `<div class="phone">
    ${clientHeader()}
    <main class="screen">
      <div class="hero">
        <span class="pill">💧 Producto escaneado</span>
        <h1>Escaneaste un producto Orbit</h1>
        <p>No necesitas iniciar sesión. Te muestro información, instalación, recomendados y asistente.</p>
        <img class="mascot" src="assets/mascot/orbito.jpeg" onerror="this.style.display='none'">
      </div>

      <section id="producto" class="card">
        <div class="product-stage">${productVisual(product)}</div>
        <span class="pill">💧 ${escapeHTML(product.category_name || 'Producto Orbit')}</span>
        <h1>${escapeHTML(product.name)}</h1>
        <p>${escapeHTML(product.short_description || '')}</p>
        <div class="specs">${(product.specs||[]).slice(0,4).map(s=>`<div class="spec"><small>${escapeHTML(s.spec_label)}</small><b>${escapeHTML(s.spec_value)} ${escapeHTML(s.spec_unit||'')}</b></div>`).join('')}</div>
      </section>

      <section id="ficha" class="card">
        <h2>Ficha técnica</h2>
        ${(product.specs||[]).map(s=>`<div style="display:flex;justify-content:space-between;border-bottom:1px solid #edf5ff;padding:12px 0;gap:10px"><span>${escapeHTML(s.spec_label)}</span><b>${escapeHTML(s.spec_value)} ${escapeHTML(s.spec_unit||'')}</b></div>`).join('')}
      </section>

      <section id="instalacion" class="card">
        <h2>${escapeHTML(guide.title || 'Guía de instalación')}</h2>
        <p>${escapeHTML(guide.description || '')}</p>
        <div class="card" style="margin-top:12px;background:#eef8ff"><b>▶ Video / video-fotos de instalación</b><p>Espacio listo para video MP4, YouTube o carrusel de fotos.</p></div>
        ${(guide.steps||[]).map(st=>`<div class="product-row"><div class="thumb">${st.step_number}</div><div><b>${escapeHTML(st.title)}</b><br><small>${escapeHTML(st.description)}</small></div></div>`).join('')}
      </section>

      <section id="recomendados" class="bundle">
        <h2>Completa tu instalación</h2>
        <p>Productos recomendados para evitar compras incompletas y aumentar ventas cruzadas.</p>
        ${recommendations.map(x=>`<a class="product-row" href="detalle-producto.html?slug=${encodeURIComponent(x.slug)}&from=${encodeURIComponent(slug)}"><div class="thumb">${x.icon||'💧'}</div><div><b>${escapeHTML(x.name)}</b><br><small>${escapeHTML(x.reason||x.short_description||'Producto compatible')}</small></div><span class="badge">${escapeHTML(x.recommendation_type||'Compatible')}</span></a>`).join('')}
      </section>

      ${leadBox(slug, CURRENT_QR, 'ficha_producto')}
      ${chatBox(slug)}
    </main>
    <button class="mascot-float" onclick="goSection('chat')" title="Preguntar a Orbit Assistant"><img src="assets/mascot/orbito.jpeg"></button>
    ${bottomNav()}
  </div>`;
  setActiveNav('producto');
}
function leadBox(slug, qr, source) {
  return `<section class="lead-box">
    <h3>¿Quieres recibir guías y novedades?</h3>
    <p>Deja tu correo si quieres recibir información útil de Orbit. No necesitas crear cuenta.</p>
    <input id="leadName" class="input" placeholder="Nombre opcional">
    <input id="leadEmail" class="input" placeholder="Correo electrónico">
    <label style="display:flex;gap:8px;font-size:13px;margin:8px 0"><input id="leadAccept" type="checkbox"> Acepto recibir información, guías y novedades de Orbit.</label>
    <button class="btn green" onclick="sendLead('${slug}','${qr}','${source}')">Enviar información a mi correo</button>
  </section>`;
}
async function sendLead(productSlug, qrCode, source) {
  const email = document.getElementById('leadEmail').value.trim();
  const name = document.getElementById('leadName').value.trim();
  const acceptsMarketing = document.getElementById('leadAccept').checked;
  if (!email || !acceptsMarketing) return toast('Ingresa correo y acepta recibir información.');
  try {
    await api('/public/leads', { method:'POST', body: JSON.stringify({ email, name, productSlug, qrCode, source, acceptsMarketing }) });
    toast('Correo registrado correctamente');
  } catch(e) {
    toast('Demo: correo capturado visualmente. Enciende backend para guardarlo real.');
  }
  document.getElementById('leadEmail').value='';
  document.getElementById('leadName').value='';
  document.getElementById('leadAccept').checked=false;
}
function chatBox(slug) {
  return `<section id="chat" class="card chat-card">
    <div class="chat-head"><img class="avatar" src="assets/mascot/orbito.jpeg" onerror="this.style.display='none'"><div><b style="color:var(--blue)">Orbit Assistant</b><p>Asesor disponible</p></div></div>
    <div id="messages" class="messages"><div class="msg bot">Hola 👋 Soy Orbit Assistant. Pregúntame qué necesitas para instalar este producto o completar tu compra.</div></div>
    <div class="quick">${['¿Qué necesito para instalarlo?','Tengo jardín de 50 m²','¿Necesita programador?','¿Qué accesorios compro?'].map(q=>`<button class="chip" onclick="askAssistant('${slug}', '${q}')">${q}</button>`).join('')}</div>
    <div class="inputbar"><input id="chatInput" placeholder="Escribe tu pregunta..." onkeydown="if(event.key==='Enter')sendChat('${slug}')"><button class="send" onclick="sendChat('${slug}')">➜</button></div>
  </section>`;
}
function addMsg(text, type) {
  const box = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
function sendChat(slug) {
  const input = document.getElementById('chatInput');
  const q = input.value.trim();
  if (!q) return;
  input.value = '';
  askAssistant(slug, q);
}
async function askAssistant(slug, question) {
  addMsg(question, 'user');
  try {
    const data = await api('/assistant/ask', { method:'POST', body: JSON.stringify({ productSlug: slug, question, sessionId: 'demo-session' }) });
    addMsg(data.answer, 'bot');
  } catch(e) {
    let answer = 'Para instalarlo bien te recomiendo: boquilla ajustable, conector 1/4, tubería de riego y programador Orbit si quieres automatizar.';
    const q = question.toLowerCase();
    if(q.includes('50')) answer = 'Para un jardín de 50 m² podrías considerar 4 a 6 aspersores, boquillas, conectores, tubería y un programador.';
    if(q.includes('programador')) answer = 'No es obligatorio, pero sí recomendable para ahorrar agua y automatizar horarios.';
    addMsg(answer, 'bot');
  }
}
function loadProjectPage() {
  document.getElementById('app').innerHTML = `<div class="phone">${clientHeader()}<main class="screen">
    <div class="card"><span class="pill">🌱 Modo proyecto</span><h1>Arma tu proyecto de riego</h1><p>Selecciona una opción y Orbit Assistant te sugerirá una compra más completa.</p>
    <div class="grid two" style="margin-top:12px">${['Jardín pequeño','Jardín mediano','Jardín grande','Quiero automático','Riego por goteo','Ahorrar agua'].map(x=>`<button class="btn light" onclick="projectResult('${x}')">${x}</button>`).join('')}</div></div>
    <div id="projectResult" class="card"><h2>Recomendación inicial</h2><p>Para empezar, escoge el tamaño de tu jardín.</p></div>
  </main><button class="mascot-float" onclick="location.href='producto.html?slug=aspersor-popup-orbit-ajustable&qr=ASP-POP-001'"><img src="assets/mascot/orbito.jpeg"></button>${bottomNav()}</div>`;
  setActiveNav('inicio');
}
function projectResult(type) {
  let msg = '2 a 3 aspersores, boquillas ajustables, conectores y tubería básica.';
  if(type.includes('mediano')) msg='4 a 6 aspersores, boquillas, conectores, tubería suficiente, filtro y programador Orbit.';
  if(type.includes('grande')) msg='Dividir en zonas, usar varios aspersores, programador, filtro, llave de paso y revisar presión disponible.';
  if(type.includes('automático')) msg='Aspersores, programador Orbit, conectores, tubería, filtro y configuración de horarios de riego.';
  if(type.includes('goteo')) msg='Kit de goteo, tubería, goteros, conectores, filtro y programador opcional.';
  if(type.includes('Ahorrar')) msg='Programador Orbit, boquillas eficientes, filtro y revisión de presión para evitar desperdicio.';
  document.getElementById('projectResult').innerHTML = `<h2>${type}</h2><p>${msg}</p><br><button class="btn" onclick="location.href='producto.html?slug=aspersor-popup-orbit-ajustable&qr=ASP-POP-001'">Ver producto recomendado</button>`;
}
