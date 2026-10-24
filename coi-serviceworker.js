/* Включает COOP/COEP (require-corp) для многопоточных ядер (PSP), в т.ч. в Safari.
   Чужие ресурсы перезапрашиваются через CORS и получают заголовок CORP. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.cache==='only-if-cached'&&r.mode!=='same-origin')return;
  e.respondWith((async()=>{
    let res;
    const foreign=new URL(r.url).origin!==location.origin;
    if(foreign&&r.mode==='no-cors'){
      try{res=await fetch(new Request(r,{mode:'cors',credentials:'omit'}))}catch(_){res=await fetch(r)}
    }else res=await fetch(r);
    if(res.status===0||res.type==='opaque')return res;
    const h=new Headers(res.headers);
    h.set('Cross-Origin-Embedder-Policy','require-corp');
    h.set('Cross-Origin-Opener-Policy','same-origin');
    h.set('Cross-Origin-Resource-Policy','cross-origin');
    return new Response(res.body,{status:res.status,statusText:res.statusText,headers:h});
  })().catch(err=>{console.error(err);return fetch(r)}));
});
