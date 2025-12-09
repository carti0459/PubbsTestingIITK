// Service Worker for PUBBS PWA
// Provides offline capabilities, caching, and background sync

const CACHE_NAME = "pubbs-v1.0.0";
const STATIC_CACHE_NAME = "pubbs-static-v1.0.0";
const DYNAMIC_CACHE_NAME = "pubbs-dynamic-v1.0.0";

// Static assets to cache
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/assets/pubbs_logo.png",
  "/assets/logo.svg",
  "/minDashboard",
  "/login",
  "/register",
  "/profile",
  "/subscription",
  "/rides",
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^\/api\/.*$/,
  /^https:\/\/.*\.firebaseio\.com\/.*$/,
  /^https:\/\/.*\.googleapis\.com\/.*$/,
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),

      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith("pubbs-")
              );
            })
            .map((cacheName) => {
              return caches.delete(cacheName);
            })
        );
      }),

      // Take control of all clients
      self.clients.claim(),
    ])
  );
});

// Fetch event - handle network requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip Chrome extension requests
  if (request.url.startsWith("chrome-extension://")) {
    return;
  }

  event.respondWith(handleFetchRequest(request, url));
});

// Handle fetch requests with caching strategy
async function handleFetchRequest(request, url) {
  // Cache-first strategy for static assets
  if (STATIC_ASSETS.includes(url.pathname) || isStaticAsset(request)) {
    return handleStaticAssetRequest(request);
  }

  // Network-first strategy for API calls
  if (isApiRequest(request)) {
    return handleApiRequest(request);
  }

  // Stale-while-revalidate for other requests
  return handleDynamicRequest(request);
}

// Check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.match(
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/
    ) ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/_next/static/")
  );
}

// Check if request is for API
function isApiRequest(request) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(request.url));
}

// Handle static asset requests (cache-first)
async function handleStaticAssetRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return offline fallback if available
    if (request.destination === "document") {
      return caches.match("/");
    }

    return new Response("Network error", { status: 408 });
  }
}

// Handle API requests (network-first with cache fallback)
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(
      JSON.stringify({
        error: "Network unavailable",
        offline: true,
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Handle dynamic requests (stale-while-revalidate)
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Fetch in background to update cache
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Otherwise wait for network
  try {
    const networkResponse = await fetchPromise;
    if (networkResponse) {
      return networkResponse;
    }
  } catch (error) {}

  // Fallback to offline page for document requests
  if (request.destination === "document") {
    return caches.match("/");
  }

  return new Response("Network error", { status: 408 });
}

// Background sync for ride data
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-ride-data") {
    event.waitUntil(syncRideData());
  }

  if (event.tag === "sync-location-data") {
    event.waitUntil(syncLocationData());
  }
});

// Sync ride data when back online
async function syncRideData() {
  try {
    // Get pending ride updates from IndexedDB
    const pendingRides = await getPendingRideUpdates();

    for (const ride of pendingRides) {
      try {
        const response = await fetch("/api/rides/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ride),
        });

        if (response.ok) {
          await removePendingRideUpdate(ride.id);
        }
      } catch (error) {}
    }
  } catch (error) {}
}

// Sync location data
async function syncLocationData() {
  try {
    // Implementation for location sync
    // This would sync any pending location updates
  } catch (error) {}
}

// Push notification handling
self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body || "New notification from PUBBS",
    icon: "/assets/pubbs_logo.png",
    badge: "/assets/logo.svg",
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [
      {
        action: "view",
        title: "View",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "PUBBS", options)
  );
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
  }
});

// Helper functions for IndexedDB operations
async function getPendingRideUpdates() {
  // Implementation would get pending ride updates from IndexedDB
  return [];
}

async function removePendingRideUpdate(rideId) {
  // Implementation would remove synced ride update from IndexedDB
}
