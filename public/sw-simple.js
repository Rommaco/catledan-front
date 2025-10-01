// Service Worker Simple para Catledan SaaS
const CACHE_NAME = 'catledan-saas-v1.0.0';

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cache abierto');
        return cache.addAll([
          '/',
          '/dashboard',
          '/ganado',
          '/finanzas',
          '/cultivos',
          '/produccion-leche',
          '/reportes',
          '/configuracion'
        ]);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completa');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Error en instalación', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('🗑️ Service Worker: Eliminando cache antiguo', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activación completa');
        return self.clients.claim();
      })
  );
});

// Interceptación de requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Estrategia: Cache First para páginas
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('📦 Service Worker: Sirviendo desde cache', request.url);
            return cachedResponse;
          }

          // Si no hay cache, intentar red
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                // Cachear la respuesta exitosa
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
                return networkResponse;
              }
              throw new Error('Network response was not ok');
            })
            .catch(() => {
              // Fallback a página offline simple
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
            });
        })
    );
    return;
  }

  // Para otros recursos, usar Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          // Cachear respuestas exitosas
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Fallback a cache
        return caches.match(request);
      })
  );
});

console.log('🚀 Service Worker: Cargado y listo');
