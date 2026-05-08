const CACHE_VERSION = 6; // تم التحديث لمسح الكاش القديم المسبب للمشاكل
const CACHE_NAME = "zahraa-studio-v" + CACHE_VERSION;
const URLS_TO_CACHE = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(URLS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // 1. تجاهل أي طلب مش GET (زي طلبات الـ AI)
  if (event.request.method !== "GET") return;

  const url = event.request.url;

  // 2. استثناء روابط الـ AI والخدمات الخارجية تماماً
  // هذا يمنع خطأ "Response body is already used" نهائياً
  if (
    url.includes("googleapis.com") || 
    url.includes("generativelanguage") || // خاص بـ Gemini AI
    url.includes("firebase") || 
    url.includes("firestore") || 
    url.includes("cloudinary") || 
    url.includes("gstatic") || 
    url.includes("cdn.tailwindcss")
  ) {
    return; // اترك المتصفح ينفذ الطلب مباشرة دون تدخل السيرفس وركر
  }

  // 3. استراتيجية (Cache First, then Network) للملفات الثابتة لضمان السرعة
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((res) => {
        // تخزين نسخة من الملفات الجديدة التي تنجح فقط
        if (res.status === 200 && res.type === 'basic') {
          let resClone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, resClone));
        }
        return res;
      }).catch(() => caches.match("./index.html")); // لو مفيش نت خالص
    })
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
