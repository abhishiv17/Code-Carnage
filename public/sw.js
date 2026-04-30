self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // Simple pass-through for now, just enough to pass PWA installability requirements
});
