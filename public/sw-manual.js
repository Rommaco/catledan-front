// Service Worker Manual para Catledan SaaS
console.log('🚀 Service Worker Manual: Iniciando...');

// Instalación
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker Manual: Instalando...');
  self.skipWaiting();
});

// Activación
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker Manual: Activando...');
  event.waitUntil(self.clients.claim());
});

// Interceptar TODOS los requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  console.log('📦 Service Worker Manual: Interceptando request:', request.url);
  
  // Interceptar navegación
  if (request.mode === 'navigate') {
    console.log('🌐 Service Worker Manual: Interceptando navegación a', request.url);
    
    event.respondWith(
      fetch(request)
        .then(response => {
          console.log('✅ Service Worker Manual: Respuesta de red exitosa');
          return response;
        })
        .catch(error => {
          console.log('❌ Service Worker Manual: Error de red, mostrando página offline');
          
          // Mostrar página offline personalizada
          return new Response(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Catledan SaaS - Modo Offline</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0;
                  color: #166534;
                }
                .container {
                  text-align: center;
                  max-width: 500px;
                  padding: 2rem;
                  background: white;
                  border-radius: 1rem;
                  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                }
                .icon {
                  width: 80px;
                  height: 80px;
                  margin: 0 auto 1.5rem;
                  background: #fef3c7;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 2rem;
                }
                h1 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  margin-bottom: 0.5rem;
                  color: #166534;
                }
                p {
                  color: #6b7280;
                  margin-bottom: 2rem;
                  line-height: 1.6;
                }
                .retry-btn {
                  background: #22c55e;
                  color: white;
                  border: none;
                  padding: 0.75rem 1.5rem;
                  border-radius: 0.5rem;
                  font-weight: 500;
                  cursor: pointer;
                  transition: background-color 0.2s;
                }
                .retry-btn:hover {
                  background: #16a34a;
                }
                .status {
                  margin-top: 1rem;
                  padding: 0.5rem;
                  background: #fef3c7;
                  border-radius: 0.5rem;
                  font-size: 0.875rem;
                  color: #92400e;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">📱</div>
                <h1>Modo Offline</h1>
                <p>No tienes conexión a internet, pero puedes seguir trabajando con los datos que ya tienes guardados.</p>
                <button class="retry-btn" onclick="checkConnection()">
                  🔄 Verificar Conexión
                </button>
                <div class="status">
                  <strong>Estado:</strong> Sin conexión a internet<br>
                  <strong>Página solicitada:</strong> ${request.url}
                </div>
              </div>
              <script>
                function checkConnection() {
                  if (navigator.onLine) {
                    window.location.reload();
                  } else {
                    alert('Aún no hay conexión. Los datos se sincronizarán automáticamente cuando vuelva la conexión.');
                  }
                }
                window.addEventListener('online', () => {
                  window.location.reload();
                });
              </script>
            </body>
            </html>
          `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Para otros recursos, usar Network First
  event.respondWith(
    fetch(request)
      .then(response => {
        console.log('✅ Service Worker Manual: Recurso cargado desde red');
        return response;
      })
      .catch(error => {
        console.log('❌ Service Worker Manual: Error cargando recurso desde red');
        return new Response('Recurso no disponible offline', { status: 404 });
      })
  );
});

console.log('✅ Service Worker Manual: Listo para interceptar navegación');
