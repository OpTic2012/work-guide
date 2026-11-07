/* Offline Work Guide — only encrypted content is cached */
const CACHE='workguide-photo-once-v4-20261107';
const ASSETS=['./','./index.html','./content.enc','./procedures.js','./procedures.css','./wg-photo-ui.css','./wg-photo-ui.js','./manifest.webmanifest','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/favicon-32.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const u=new URL(event.request.url);if(u.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));}return response}).catch(()=>caches.match('./index.html')));
  return;
 }
 if(u.pathname.endsWith('/content.enc')){
  event.respondWith(fetch(event.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put('./content.enc',copy));}return res}).catch(()=>caches.match('./content.enc')));
  return;
 }
 event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(c=>c||fetch(event.request)));
});
