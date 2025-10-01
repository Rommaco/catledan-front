// Script de registro manual del Service Worker
console.log('🔧 Registrando Service Worker manualmente...');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw-offline-real.js', {
    scope: '/'
  })
  .then(registration => {
    console.log('✅ Service Worker OFFLINE REAL registrado manualmente:', registration);
  })
  .catch(error => {
    console.error('❌ Error registrando Service Worker manualmente:', error);
  });
} else {
  console.warn('⚠️ Service Workers no soportados en este navegador');
}
