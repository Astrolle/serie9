
self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open("serie9").then((cache) => {
            return cache.addAll([
                "/",
                "/index.html",
                "/style.css",
                "/script.js",
                "/manifest.json",
                "/icon-192.png",
                "/icon-512.png"
            ]);
        })
    );
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
