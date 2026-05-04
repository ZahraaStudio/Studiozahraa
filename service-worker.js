const CACHE_VERSION = 5;
const CACHE_NAME = "zahraa-studio-v" + CACHE_VERSION;
const URLS_TO_CACHE = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(URLS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("firebase") || event.request.url.includes("gstatic") ||
      event.request.url.includes("googleapis") || event.request.url.includes("firestore") ||
      event.request.url.includes("cloudinary") || event.request.url.includes("cdn.tailwindcss")) return;
  event.respondWith(
    fetch(event.request).then(res => {
      if (res.status === 200) caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
      return res;
    }).catch(() => caches.match(event.request))
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("push", (event) => {
  let data = { title: "استوديو الزهراء", body: "لديك رسالة جديدة" };
  try { if (event.data) data = event.data.json(); } catch(e) {}
  event.waitUntil(
    self.registration.showNotification(data.title || "استوديو الزهراء", {
      body: data.body || "",
      icon: "./icon-192.png",
      badge: "./icon-192.png",
      image: data.image || undefined,
      dir: "rtl", lang: "ar",
      vibrate: [300, 100, 300],
      requireInteraction: true,
      data: { link: data.link || "/" },
      actions: [{ action: "open", title: "فتح المتجر" }, { action: "dismiss", title: "إغلاق" }]
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const link = event.notification.data?.link || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) { if (c.url.includes(self.location.origin) && "focus" in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});
