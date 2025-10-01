// IndexedDB Manager para almacenamiento offline
export interface OfflineDataItem {
  id?: number;
  type: 'ganado' | 'finanza' | 'produccion' | 'cultivo' | 'reporte';
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
  action: 'create' | 'update' | 'delete';
}

export interface SyncQueueItem {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
  retries: number;
}

class IndexedDBManager {
  private dbName = 'CatledanOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('❌ IndexedDB: Error abriendo base de datos', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB: Base de datos abierta correctamente');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('🔧 IndexedDB: Actualizando esquema de base de datos');

        // Store para datos offline
        if (!db.objectStoreNames.contains('offlineData')) {
          const offlineStore = db.createObjectStore('offlineData', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          offlineStore.createIndex('type', 'type', { unique: false });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
          offlineStore.createIndex('synced', 'synced', { unique: false });
        }

        // Store para cola de sincronización
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('retries', 'retries', { unique: false });
        }

        // Store para cache de API responses
        if (!db.objectStoreNames.contains('apiCache')) {
          const cacheStore = db.createObjectStore('apiCache', { keyPath: 'url' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Guardar datos offline
  async saveOfflineData(item: Omit<OfflineDataItem, 'id'>): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const request = store.add({
        ...item,
        timestamp: Date.now(),
        synced: false
      });

      request.onsuccess = () => {
        console.log('💾 IndexedDB: Datos guardados offline', item.type);
        resolve(request.result as number);
      };

      request.onerror = () => {
        console.error('❌ IndexedDB: Error guardando datos offline', request.error);
        reject(request.error);
      };
    });
  }

  // Obtener datos offline por tipo
  async getOfflineData(type: OfflineDataItem['type']): Promise<OfflineDataItem[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('type');
      
      const request = index.getAll(type);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ IndexedDB: Error obteniendo datos offline', request.error);
        reject(request.error);
      };
    });
  }

  // Obtener todos los datos no sincronizados
  async getUnsyncedData(): Promise<OfflineDataItem[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('synced');
      
      const request = index.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ IndexedDB: Error obteniendo datos no sincronizados', request.error);
        reject(request.error);
      };
    });
  }

  // Marcar datos como sincronizados
  async markAsSynced(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.synced = true;
          const updateRequest = store.put(item);
          
          updateRequest.onsuccess = () => {
            console.log('✅ IndexedDB: Datos marcados como sincronizados', id);
            resolve();
          };
          
          updateRequest.onerror = () => {
            console.error('❌ IndexedDB: Error marcando como sincronizado', updateRequest.error);
            reject(updateRequest.error);
          };
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => {
        console.error('❌ IndexedDB: Error obteniendo item para marcar como sincronizado', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  // Eliminar datos sincronizados
  async deleteSyncedData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const index = store.index('synced');
      
      const request = index.getAll();

      request.onsuccess = () => {
        const syncedItems = request.result;
        const deletePromises = syncedItems.map(item => {
          return new Promise<void>((resolveDelete, rejectDelete) => {
            const deleteRequest = store.delete(item.id!);
            
            deleteRequest.onsuccess = () => resolveDelete();
            deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
          });
        });

        Promise.all(deletePromises)
          .then(() => {
            console.log('🗑️ IndexedDB: Datos sincronizados eliminados');
            resolve();
          })
          .catch(reject);
      };

      request.onerror = () => {
        console.error('❌ IndexedDB: Error obteniendo datos sincronizados para eliminar', request.error);
        reject(request.error);
      };
    });
  }

  // Guardar en cola de sincronización
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      const request = store.add({
        ...item,
        timestamp: Date.now(),
        retries: 0
      });

      request.onsuccess = () => {
        console.log('📝 IndexedDB: Item agregado a cola de sincronización');
        resolve(request.result as number);
      };

      request.onerror = () => {
        console.error('❌ IndexedDB: Error agregando a cola de sincronización', request.error);
        reject(request.error);
      };
    });
  }

  // Obtener cola de sincronización
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ IndexedDB: Error obteniendo cola de sincronización', request.error);
        reject(request.error);
      };
    });
  }

  // Eliminar item de cola de sincronización
  async removeFromSyncQueue(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('✅ IndexedDB: Item eliminado de cola de sincronización', id);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ IndexedDB: Error eliminando de cola de sincronización', request.error);
        reject(request.error);
      };
    });
  }

  // Cache de respuestas API
  async cacheApiResponse(url: string, response: Record<string, unknown>, ttl: number = 300000): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      
      const request = store.put({
        url,
        response,
        timestamp: Date.now(),
        ttl
      });

      request.onsuccess = () => {
        console.log('💾 IndexedDB: Respuesta API cacheada', url);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ IndexedDB: Error cacheando respuesta API', request.error);
        reject(request.error);
      };
    });
  }

  // Obtener respuesta API del cache
  async getCachedApiResponse(url: string): Promise<Record<string, unknown> | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readonly');
      const store = transaction.objectStore('apiCache');
      
      const request = store.get(url);

      request.onsuccess = () => {
        const result = request.result;
        if (result && (Date.now() - result.timestamp) < result.ttl) {
          console.log('📦 IndexedDB: Respuesta API obtenida del cache', url);
          resolve(result.response);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('❌ IndexedDB: Error obteniendo respuesta API del cache', request.error);
        reject(request.error);
      };
    });
  }

  // Limpiar cache expirado
  async cleanExpiredCache(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result;
        const now = Date.now();
        const deletePromises = items
          .filter(item => (now - item.timestamp) >= item.ttl)
          .map(item => {
            return new Promise<void>((resolveDelete, rejectDelete) => {
              const deleteRequest = store.delete(item.url);
              deleteRequest.onsuccess = () => resolveDelete();
              deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
            });
          });

        Promise.all(deletePromises)
          .then(() => {
            console.log('🧹 IndexedDB: Cache expirado limpiado');
            resolve();
          })
          .catch(reject);
      };

      request.onerror = () => {
        console.error('❌ IndexedDB: Error limpiando cache expirado', request.error);
        reject(request.error);
      };
    });
  }

  // Obtener estadísticas de almacenamiento
  async getStorageStats(): Promise<{
    offlineDataCount: number;
    syncQueueCount: number;
    cacheCount: number;
    totalSize: number;
  }> {
    if (!this.db) await this.init();

    const [offlineData, syncQueue, apiCache] = await Promise.all([
      this.getOfflineData('ganado'), // Solo para contar
      this.getSyncQueue(),
      new Promise<Record<string, unknown>[]>((resolve) => {
        const transaction = this.db!.transaction(['apiCache'], 'readonly');
        const store = transaction.objectStore('apiCache');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]);
      })
    ]);

    return {
      offlineDataCount: offlineData.length,
      syncQueueCount: syncQueue.length,
      cacheCount: apiCache.length,
      totalSize: 0 // TODO: Calcular tamaño real
    };
  }
}

// Instancia singleton
export const indexedDBManager = new IndexedDBManager();
