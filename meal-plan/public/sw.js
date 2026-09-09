/* Service worker minimale per l'installazione da home screen.
   Strategia:
   - navigazioni: network-first con fallback alla shell in cache (offline)
   - asset statici con hash: cache-first
   - richieste Convex (realtime/websocket e API): mai intercettate
*/
const CACHE = "dispensa-v1";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icona.svg"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((chiavi) =>
        Promise.all(chiavi.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const richiesta = evento.request;
  if (richiesta.method !== "GET") return;

  const url = new URL(richiesta.url);
  // Solo same-origin: Convex e OAuth devono passare diretti.
  if (url.origin !== self.location.origin) return;

  if (richiesta.mode === "navigate") {
    evento.respondWith(
      fetch(richiesta).catch(() =>
        caches.match("/index.html").then((r) => r ?? Response.error())
      )
    );
    return;
  }

  evento.respondWith(
    caches.match(richiesta).then((inCache) => {
      if (inCache !== undefined) return inCache;
      return fetch(richiesta).then((risposta) => {
        if (risposta.ok && risposta.type === "basic") {
          const copia = risposta.clone();
          void caches.open(CACHE).then((cache) => cache.put(richiesta, copia));
        }
        return risposta;
      });
    })
  );
});
