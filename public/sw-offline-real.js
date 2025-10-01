// Service Worker para Modo Offline REAL - Catledan SaaS
const CACHE_NAME = 'catledan-offline-v1';
const RUNTIME_CACHE = 'catledan-runtime-v1';

console.log('🚀 Service Worker Offline REAL: Iniciando...');

// Instalación - Cachear assets críticos
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando páginas críticas...');
        // No pre-cachear nada, dejar que se cachee dinámicamente
        return Promise.resolve();
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completa');
        return self.skipWaiting();
      })
  );
});

// Activación
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
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

// Estrategia de Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar requests del mismo origen
  if (url.origin !== self.location.origin) {
    return;
  }

  // Estrategia para navegación de páginas
  if (request.mode === 'navigate') {
    console.log('🌐 Service Worker: Navegación interceptada:', url.pathname);
    
    event.respondWith(
      // Stale While Revalidate: Sirve del cache mientras actualiza en background
      caches.open(RUNTIME_CACHE)
        .then((cache) => {
          return fetch(request)
            .then((networkResponse) => {
              console.log('✅ Service Worker: Respuesta de red OK, actualizando cache');
              // Actualizar cache con la nueva respuesta
              cache.put(request, networkResponse.clone());
              return networkResponse;
            })
            .catch(() => {
              console.log('⚠️ Service Worker: Red no disponible, buscando en cache');
              // Si falla la red, buscar en cache
              return cache.match(request)
                .then((cachedResponse) => {
                  if (cachedResponse) {
                    console.log('✅ Service Worker: Sirviendo desde cache');
                    return cachedResponse;
                  }
                  console.log('❌ Service Worker: No hay cache disponible');
                  // Solo aquí mostrar página offline si no hay nada cacheado
                  return new Response(`
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Catledan SaaS - Primera vez offline</title>
                      <style>
                        body {
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                          min-height: 100vh;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          margin: 0;
                        }
                        .container {
                          text-align: center;
                          max-width: 500px;
                          padding: 2rem;
                          background: white;
                          border-radius: 1rem;
                          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                        }
                        h1 { color: #166534; margin-bottom: 1rem; }
                        p { color: #6b7280; line-height: 1.6; }
                        .btn {
                          background: #22c55e;
                          color: white;
                          border: none;
                          padding: 0.75rem 1.5rem;
                          border-radius: 0.5rem;
                          font-weight: 500;
                          cursor: pointer;
                          margin-top: 1rem;
                        }
                        .btn:hover { background: #16a34a; }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <h1>📱 Primera Vez Offline</h1>
                        <p>Esta página aún no ha sido visitada con conexión.</p>
                        <p>Por favor, visita esta página al menos una vez con conexión para poder usarla offline.</p>
                        <button class="btn" onclick="window.location.reload()">🔄 Reintentar</button>
                      </div>
                      <script>
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
            });
        })
    );
    return;
  }

  // Estrategia para API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          console.log('✅ API: Respuesta exitosa');
          return response;
        })
        .catch(() => {
          console.log('⚠️ API: Red no disponible');
          // Para API, no hay fallback - los hooks manejarán el offline
          return new Response(JSON.stringify({
            offline: true,
            message: 'Modo offline activo - Los datos se guardarán localmente'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Estrategia para assets estáticos (JS, CSS, imágenes)
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    
    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('📦 Asset desde cache:', url.pathname);
                return cachedResponse;
              }
              
              return fetch(request)
                .then((networkResponse) => {
                  console.log('✅ Asset desde red, cacheando:', url.pathname);
                  cache.put(request, networkResponse.clone());
                  return networkResponse;
                })
                .catch(() => {
                  console.log('❌ Asset no disponible:', url.pathname);
                  return new Response('Asset no disponible', { status: 404 });
                });
            });
        })
    );
    return;
  }

  // Para todo lo demás, Network First con cache fallback
  event.respondWith(
    caches.open(RUNTIME_CACHE)
      .then((cache) => {
        return fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => {
            return cache.match(request);
          });
      })
  );
});

console.log('✅ Service Worker Offline REAL: Listo');
