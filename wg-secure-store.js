/* Work Guide v6. UI-independent encrypted storage. No password or key export. */
(function () {
 'use strict';
 const key=window.__wgProcedureKey;
 delete window.__wgProcedureKey;
 const encoder=new TextEncoder(),decoder=new TextDecoder();
 const PROC='wg_procedures_encrypted_v1',EXTRA='wg_personal_extras_encrypted_v1';
 const aadFor=name=>encoder.encode(name===PROC?'workguide-personal-procedures-v1':'workguide-personal-extras-v1');
 const clone=value=>JSON.parse(JSON.stringify(value));
 const encode=bytes=>{let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)};
 const decode=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 const emptyExtras=()=>({policies:[],contacts:[],favoriteRefs:[],profile:{name:''}});
 let data,baseline={},queue=Promise.resolve();
 function validateProcedures(items){
  if(!Array.isArray(items)||items.some(p=>!p||typeof p.id!=='string'||typeof p.title!=='string'||!Array.isArray(p.steps)||p.steps.some(s=>typeof s!=='string')))throw Error('Οι αποθηκευμένες διαδικασίες δεν είναι έγκυρες. Δεν έγινε αντικατάσταση δεδομένων.');
 }
 function validateExtras(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Μη έγκυρα πρόσθετα δεδομένα.');
  for(const name of ['policies','contacts','favoriteRefs'])if(!Array.isArray(value[name]))throw Error('Μη έγκυρα πρόσθετα δεδομένα: '+name);
  if(value.policies.some(p=>!p||typeof p.id!=='string'||typeof p.title!=='string'||typeof p.content!=='string')||value.contacts.some(p=>!p||typeof p.id!=='string'||typeof p.name!=='string'||typeof p.phone!=='string'))throw Error('Μη έγκυρες καταχωρίσεις.');
  if(value.favoriteRefs.some(p=>!p||!['procedures','policies','contacts'].includes(p.kind)||typeof p.id!=='string'))throw Error('Μη έγκυρα αγαπημένα.');
  if(!value.profile||typeof value.profile.name!=='string')throw Error('Μη έγκυρο προφίλ.');
 }
 async function unpack(name,raw){
  if(raw===null)return name===PROC?[]:emptyExtras();
  const packet=JSON.parse(raw);
  if(packet.version!==1||typeof packet.iv!=='string'||typeof packet.data!=='string')throw Error('Μη υποστηριζόμενη μορφή κρυπτογραφημένων δεδομένων.');
  const iv=decode(packet.iv);if(iv.length!==12)throw Error('Μη έγκυρο κρυπτογραφημένο αντίγραφο.');
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aadFor(name)},key,decode(packet.data));
  const value=JSON.parse(decoder.decode(plain));
  if(name===PROC)validateProcedures(value);else validateExtras(value);
  return value;
 }
 async function pack(name,value){
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aadFor(name)},key,encoder.encode(JSON.stringify(value))));
  return JSON.stringify({version:1,iv:encode(iv),data:encode(cipher)});
 }
 const ready=(async()=>{
  if(!key||!crypto?.subtle)throw Error('Δεν είναι διαθέσιμο το κλειδί της εφαρμογής. Κλείσε και άνοιξε ξανά το Work Guide.');
  baseline={[PROC]:localStorage.getItem(PROC),[EXTRA]:localStorage.getItem(EXTRA)};
  const [procedures,extras]=await Promise.all([unpack(PROC,baseline[PROC]),unpack(EXTRA,baseline[EXTRA])]);
  data={procedures,extras};
 })();
 // The UI reports loading failures; never replace an unreadable store with an empty array.
 ready.catch(()=>{});
 async function writeChanges(next,recovery=false){
  if(recovery)await ready.catch(()=>{});else await ready;
  validateProcedures(next.procedures);validateExtras(next.extras);
  const names=[EXTRA,PROC];
  for(const name of names)if(localStorage.getItem(name)!==baseline[name])throw Error('Τα δεδομένα άλλαξαν σε άλλο παράθυρο. Άνοιξε ξανά την εφαρμογή πριν αποθηκεύσεις.');
  const changes=[];
  if(JSON.stringify(next.extras)!==JSON.stringify(data?.extras))changes.push([EXTRA,await pack(EXTRA,next.extras)]);
  if(JSON.stringify(next.procedures)!==JSON.stringify(data?.procedures))changes.push([PROC,await pack(PROC,next.procedures)]);
  for(const name of names)if(localStorage.getItem(name)!==baseline[name])throw Error('Τα δεδομένα άλλαξαν σε άλλο παράθυρο. Άνοιξε ξανά την εφαρμογή.');
  const written=[];
  try{for(const [name,raw]of changes){localStorage.setItem(name,raw);written.push(name)}}
  catch(error){
   let rollbackFailed=false;
   for(const name of written.reverse()){try{if(baseline[name]===null)localStorage.removeItem(name);else localStorage.setItem(name,baseline[name])}catch(_){rollbackFailed=true}}
   if(rollbackFailed)throw Error('Απέτυχε η αποθήκευση και η πλήρης επαναφορά. Κράτησε αντίγραφο ασφαλείας και μην κάνεις άλλες αλλαγές.');
   throw Error('Δεν έγινε αποθήκευση. Έλεγξε τον διαθέσιμο χώρο. Τα προηγούμενα δεδομένα διατηρούνται.');
  }
  for(const [name,raw]of changes)baseline[name]=raw;
  data=clone(next);return clone(data);
 }
 function commit(next,recovery=false){const copy=clone(next);const operation=queue.then(()=>writeChanges(copy,recovery));queue=operation.catch(()=>{});return operation}
 function snapshot(){if(!data)throw Error('Η ασφαλής αποθήκευση δεν έχει φορτωθεί.');return clone(data)}
 async function exportBackup(){await queue;return {format:'workguide-encrypted-backup-v1',created:new Date().toISOString(),stores:{[PROC]:localStorage.getItem(PROC),[EXTRA]:localStorage.getItem(EXTRA)}}}
 async function restoreBackup(backup){
  await ready.catch(()=>{});if(!backup||backup.format!=='workguide-encrypted-backup-v1'||!backup.stores)throw Error('Δεν είναι αντίγραφο ασφαλείας Work Guide.');
  for(const name of [PROC,EXTRA])if(backup.stores[name]!==null&&typeof backup.stores[name]!=='string')throw Error('Ελλιπές αντίγραφο ασφαλείας.');
  const [procedures,extras]=await Promise.all([unpack(PROC,backup.stores[PROC]),unpack(EXTRA,backup.stores[EXTRA])]);
  return commit({procedures,extras},true);
 }
 window.wgSecureStore=Object.freeze({ready,snapshot,commit,exportBackup,restoreBackup});
})();
