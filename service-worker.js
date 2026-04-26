const CACHE_VERSION = 3;
const CACHE_NAME = "zahraa-studio-v" + CACHE_VERSION;
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("✅ Service Worker: Cache opened - استوديو الزهراء");
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("✅ Service Worker: Deleting old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip Firebase and external API calls
  if (
    event.request.url.includes("firebase") ||
    event.request.url.includes("gstatic") ||
    event.request.url.includes("googleapis") || 
    event.request.url.includes("firestore") || 
    event.request.url.includes("cloudinary") ||
    event.request.url.includes("cdn.tailwindcss")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const clonedResponse = response.clone();

        // Cache successful responses
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        }

        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cachedResponse) => {
          return (
            cachedResponse ||
            new Response("Offline - Content not available", {
              status: 503,
              statusText: "Service Unavailable",
              headers: new Headers({
                "Content-Type": "text/plain",
              }),
            })
          );
        });
      })
  );
});

// Handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Background sync for offline orders (optional)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-orders") {
    event.waitUntil(
      // Handle offline order syncing here
      Promise.resolve()
    );
  }
});
