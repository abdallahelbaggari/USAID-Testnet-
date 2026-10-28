/* GrowthBridge offline support: pages network-first, versioned files and icons cache-first; payments never cached. */
var CACHE = 'gb-v1';
var SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/gb.css?v=1', '/gb.js?v=1', '/gb-content.js?v=1'];
var LIVE = /^\/(approve|complete)(\/|$|\?)/;
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL).catch(function () {}); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return; var u = new URL(r.url); if (u.origin !== self.location.origin || LIVE.test(u.pathname)) return;
  if (/[?&]v=/.test(u.search) || /^\/icons\//.test(u.pathname)) { e.respondWith(caches.match(r).then(function (h) { return h || fetch(r).then(function (res) { if (res && res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); } return res; }); })); return; }
  e.respondWith(fetch(r).then(function (res) { if (res && res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); } return res; }).catch(function () { return caches.match(r).then(function (h) { return h || (r.mode === 'navigate' ? caches.match('/index.html') : Response.error()); }); }));
});
