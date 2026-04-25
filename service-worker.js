const CACHE_NAME = "zahraa-store-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

/* 🔥 INSTALL */
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

/* 🔥 ACTIVATE */
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

/* 🔥 FETCH (FIX مهم) */
self.addEventListener("fetch", event => {

  // تجاهل requests الخاصة بـ Firebase أو Cloudinary
  if (
    event.request.url.includes("firebase") ||
    event.request.url.includes("gstatic") ||
    event.request.url.includes("cloudinary")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {

      const fetchPromise = fetch(event.request)
        .then(networkRes => {

          // خزّن النسخة الجديدة
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkRes.clone());
            return networkRes;
          });

        })
        .catch(() => cached);

      // رجّع الكاش فورًا + حدّث في الخلفية
      return cached || fetchPromise;
    })
  );

});
