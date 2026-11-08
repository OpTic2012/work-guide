/* Work Guide v6. Versioned new assets; existing encrypted records and device keys are never touched. */
const CACHE='workguide-ui-v6-1-fresh-20261108';
const ASSETS=['./','./index.html','./content.enc','./wg-theme-v6.css','./wg-theme-v6.1.css','./wg-app-v6.1.js','./wg-secure-store.js','./lucide.min.js','./ui-settings.json','./designer.html','./wg-designer.js','./backup.html','./wg-backup.js','./manifest.webmanifest','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/favicon-32.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})))).then(()=>self.skipWaiting())));
// Retain the previous app cache for rollback. IndexedDB and localStorage are not cache storage.
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(event.request.mode==='navigate'||url.pathname.endsWith('/content.enc')){
   try{const response=await fetch(event.request,{cache:'no-store'});if(!response.ok)throw Error('Network response unavailable');await cache.put(event.request,response.clone());return response}
   catch(error){const cached=await cache.match(event.request,{ignoreSearch:true});if(cached)return cached;if(event.request.mode==='navigate'){const relative=url.pathname.slice(scope.pathname.length);return await cache.match('./'+(relative||'index.html'))||await cache.match('./index.html')}throw error}
  }
  const cached=await cache.match(event.request,{ignoreSearch:true});if(cached)return cached;
  return fetch(event.request,{cache:'no-store'});
 })());
});



