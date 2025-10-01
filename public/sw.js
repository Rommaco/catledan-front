// Service Worker para Catledan SaaS - Modo Offline
const CACHE_NAME = 'catledan-saas-v1.0.0';
const OFFLINE_PAGES = [
  '/',
  '/dashboard',
  '/ganado',
  '/finanzas',
  '/cultivos',
  '/produccion-leche',
  '/reportes',
  '/configuracion'
];

// Assets críticos para funcionamiento offline
const CRITICAL_ASSETS = [
  '/favicon.ico',
  '/manifest.json'
];

// Estrategias de cache
const CACHE_STRATEGIES = {
  // Cache First: Para assets estáticos
  CACHE_FIRST: 'cache-first',
  // Network First: Para API calls
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate: Para páginas
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cache abierto');
        return cache.addAll([
          ...OFFLINE_PAGES,
          ...CRITICAL_ASSETS
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

  // No interceptar redirecciones de Next.js
  if (request.redirect === 'follow') {
    return;
  }

  // No interceptar requests de navegación que pueden causar redirecciones
  if (request.mode === 'navigate' && request.redirect === 'manual') {
    return;
  }

  // Estrategia para páginas (solo cuando no hay redirección)
  if (request.mode === 'navigate') {
    event.respondWith(handlePageRequest(request));
    return;
  }

  // Estrategia para API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Estrategia para assets estáticos
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    event.respondWith(handleAssetRequest(request));
    return;
  }

  // Estrategia por defecto: Network First
  event.respondWith(handleDefaultRequest(request));
});

// Manejo de requests de páginas
async function handlePageRequest(request) {
  try {
    // Intentar red primero con configuración específica para evitar problemas de redirección
    const networkResponse = await fetch(request, {
      redirect: 'follow',
      mode: 'navigate'
    });
    
    if (networkResponse.ok) {
      // Cachear la respuesta exitosa
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('🌐 Service Worker: Red no disponible, usando cache');
  }

  // Fallback a cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fallback a página offline
  const offlineResponse = await caches.match('/offline.html');
  if (offlineResponse) {
    return offlineResponse;
  }

  // Respuesta de fallback simple
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head><title>Modo Offline</title></head>
    <body>
      <h1>Modo Offline</h1>
      <p>No tienes conexión a internet, pero puedes seguir trabajando con los datos que ya tienes guardados.</p>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// Manejo de requests de API
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Para requests GET, usar Network First
  if (request.method === 'GET') {
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cachear respuestas exitosas
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
    } catch (error) {
      console.log('🌐 Service Worker: API no disponible, usando cache');
    }

    // Fallback a cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
  }

  // Para requests POST/PUT/DELETE, intentar red y guardar en cola si falla
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    try {
      return await fetch(request);
    } catch (error) {
      // Guardar en cola de sincronización
      await addToSyncQueue(request);
      return new Response(JSON.stringify({
        success: false,
        offline: true,
        message: 'Request guardado para sincronización cuando vuelva la conexión'
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return fetch(request);
}

// Manejo de assets estáticos
async function handleAssetRequest(request) {
  // Cache First para assets
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('🌐 Service Worker: Asset no disponible en red');
    return new Response('Asset no disponible', { status: 404 });
  }
}

// Manejo por defecto
async function handleDefaultRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Recurso no disponible', { status: 404 });
  }
}

// Cola de sincronización para requests offline
async function addToSyncQueue(request) {
  try {
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.clone().text() : null,
      timestamp: Date.now()
    };

    // Guardar en IndexedDB
    const db = await openIndexedDB();
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    await store.add(requestData);
    
    console.log('📝 Service Worker: Request guardado en cola de sincronización');
  } catch (error) {
    console.error('❌ Service Worker: Error guardando en cola de sincronización', error);
  }
}

// Abrir IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CatledanOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Crear store para cola de sincronización
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        syncStore.createIndex('timestamp', 'timestamp');
      }
      
      // Crear store para datos offline
      if (!db.objectStoreNames.contains('offlineData')) {
        const dataStore = db.createObjectStore('offlineData', { keyPath: 'id' });
        dataStore.createIndex('type', 'type');
        dataStore.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then((status) => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', data: status });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'SYNC_QUEUE':
      processSyncQueue().then((results) => {
        event.ports[0].postMessage({ type: 'SYNC_RESULTS', data: results });
      });
      break;
  }
});

// Obtener estado del cache
async function getCacheStatus() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  return {
    cacheName: CACHE_NAME,
    cachedItems: keys.length,
    lastUpdate: new Date().toISOString()
  };
}

// Limpiar cache
async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

// Procesar cola de sincronización
async function processSyncQueue() {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const requests = await store.getAll();
    
    const results = [];
    
    // Verificar que requests es un array
    if (!Array.isArray(requests)) {
      console.log('📝 Service Worker: No hay requests en la cola de sincronización');
      return [];
    }
    
    for (const requestData of requests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });
        
        if (response.ok) {
          // Eliminar de la cola si fue exitoso
          await store.delete(requestData.id);
          results.push({ id: requestData.id, success: true });
        }
      } catch (error) {
        results.push({ id: requestData.id, success: false, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Service Worker: Error procesando cola de sincronización', error);
    return [];
  }
}

console.log('🚀 Service Worker: Cargado y listo');
