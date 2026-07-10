// XPTO Gestão — Service Worker v1.0.0
// Cache-first for static assets, network-first for API calls

const CACHE_NAME = "xpto-cache-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/src/main.tsx",
  "/src/index.css",
];

// Assets that should be cache-first (fonts, icons, css)
const CACHE_FIRST_EXTENSIONS = [
  ".css",
  ".woff2",
  ".woff",
  ".ttf",
  ".svg",
  ".png",
  ".jpg",
  ".ico",
  ".json",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls (network-first, fallback to cache)
  if (url.pathname.startsWith("/api/") || url.port === "3001") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (cache-first)
  const isStatic = CACHE_FIRST_EXTENSIONS.some((ext) =>
    url.pathname.endsWith(ext),
  );
  if (isStatic || url.pathname.startsWith("/src/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation requests (network-first, fallback to index.html)
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/index.html"));
    return;
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503 });
  }
}
