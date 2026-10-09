// Ao publicar uma nova versão do app, altere o número abaixo.
const VERSAO = 'postes-v3';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './jspdf.umd.min.js', './jspdf.plugin.autotable.min.js', './logo-vale.png'];
const OPCIONAIS = [];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS).then(() => Promise.all(OPCIONAIS.map(u => c.add(u).catch(() => {}))))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Responde do cache (funciona sem internet) e atualiza o cache em segundo plano quando houver rede.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.open(VERSAO).then(async cache => {
      const salvo = await cache.match(e.request, { ignoreSearch: true });
      const rede = fetch(e.request)
        .then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; })
        .catch(() => salvo);
      return salvo || rede;
    })
  );
});
