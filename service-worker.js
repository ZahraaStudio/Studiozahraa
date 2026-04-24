const CACHE_NAME = "zahraa-store-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

// 🔥 Install
self.addEventListener("install", event => {
  self.skipWaiting(); // يجبر التفعيل فورًا
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 🔥 Activate (يمسح القديم فورًا)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 🔥 Fetch (ما يعتمدش على الكاش القديم)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, res.clone());
          return res;
        });
      })
      .catch(() => caches.match(event.request))
  );
});
