ORBIT ASSISTANT - ESTRUCTURA HTML/CSS/JS + BACKEND

Este ZIP adapta el máster Orbit Assistant a una estructura clásica como la del proyecto que enviaste:
assets/
css/
js/
orbit-backend/
archivos HTML sueltos

IMPORTANTE:
- El cliente que escanea QR NO inicia sesión.
- El QR abre directo el módulo cliente.
- El administrador SÍ inicia sesión.
- El admin permite productos, QR, recomendaciones, compatibilidades, multimedia, leads, preguntas IA y analíticas.
- La base está lista para migrar a PostgreSQL. Ahora corre con datos JSON demo para que puedas abrirlo rápido.

CÓMO CORRER:

1) Abre esta carpeta en Visual Studio Code.
2) Terminal:

cd orbit-backend
npm install
npm run dev

3) Abre index.html con Live Server.

URLs principales:

Cliente:
index.html
qr.html?qr=ASP-POP-001
producto.html?slug=aspersor-popup-orbit-ajustable&qr=ASP-POP-001
detalle-producto.html?slug=programador-digital-orbit&from=aspersor-popup-orbit-ajustable
proyecto.html

Admin:
admin-login.html

Credenciales:
admin@orbitassistant.cl
admin123

Backend:
http://localhost:4000/api/health

Si subimos a Vercel:
- El frontend HTML se sube directo.
- El backend Express se sube a Render.
- Luego cambiamos API_URL en js/config.js.
