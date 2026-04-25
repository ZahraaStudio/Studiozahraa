const CACHE_NAME = "zahraa-store-v3";
const RUNTIME_CACHE = "zahraa-runtime-v3";

const urlsToCache = [
  "./",
  "./index.html",
  "./products.html",
  "./product.html",
  "./cart.html",
  "./checkout.html",
  "./orders.html",
  "./admin_zahraa.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

/* 🔥 INSTALL */
self.addEventListener("install", event => {
  console.log("Service Worker installing...");
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Cache opened");
      return cache.addAll(urlsToCache).catch(err => {
        console.log("Cache addAll error:", err);
        // تابع حتى لو فشل بعض الملفات
        return Promise.resolve();
      });
    })
  );
});

/* 🔥 ACTIVATE */
self.addEventListener("activate", event => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== RUNTIME_CACHE) {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/* 🔥 FETCH */
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل requests الخارجية والـ APIs
  if (
    url.origin !== self.location.origin ||
    request.url.includes("firebase") ||
    request.url.includes("gstatic") ||
    request.url.includes("cloudinary") ||
    request.url.includes("ibb.co") ||
    request.url.includes("googleapis.com") ||
    request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then(response => {
          // تحقق من أن الاستجابة صحيحة
          if (!response || response.status !== 200 || response.type === "error") {
            return response;
          }

          // انسخ الاستجابة
          const responseToCache = response.clone();

          // خزّن في الـ runtime cache
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // في حالة الفشل، حاول إرجاع صفحة بديلة من الكاش
          return caches.match("./index.html");
        });
    })
  );
});

/* 🔥 MESSAGE HANDLER */
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
