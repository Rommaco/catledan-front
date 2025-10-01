// Service Worker Minimal para Catledan SaaS
console.log('🚀 Service Worker: Iniciando...');

// Instalación
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  self.skipWaiting();
});

// Activación
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  event.waitUntil(self.clients.claim());
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Solo interceptar requests del mismo origen
  if (request.url.startsWith(self.location.origin)) {
    console.log('📦 Service Worker: Interceptando', request.url);
    
    // Estrategia: Network First
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Si falla la red, mostrar página offline simple
          if (request.mode === 'navigate') {
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
          }
        })
    );
  }
});

console.log('✅ Service Worker: Listo');


