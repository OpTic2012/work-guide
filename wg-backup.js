/* Runs after the existing Work Guide unlock, in the same installed-app storage context. */
(function(){
 const panel=document.createElement('main');
 panel.style.cssText='font-family:system-ui,-apple-system,sans-serif;color:#291b3b;background:#fff;border-radius:24px;padding:28px;max-width:440px;margin:30px auto;line-height:1.6';
 panel.innerHTML='<h1 style="font-size:24px">Αντίγραφο ασφαλείας</h1><p>Κράτησε αντίγραφο των κρυπτογραφημένων προσωπικών καταχωρίσεών σου πριν την ενημέρωση.</p><button id="wg-export-backup" style="width:100%;padding:16px;border:0;border-radius:14px;background:#7534c7;color:#fff;font-size:16px">Λήψη αντιγράφου ασφαλείας</button><p id="wg-backup-status" role="status" aria-live="polite"></p><p>Μετά τη λήψη, ανέβασε τα αρχεία του φακέλου UPDATE και άνοιξε ξανά την υπάρχουσα εφαρμογή.</p>';
 for(const node of Array.from(document.body.children))if(!['SCRIPT','STYLE','LINK'].includes(node.tagName))node.style.display='none';
 document.body.style.cssText='margin:0;padding:max(20px,env(safe-area-inset-top)) 16px;background:#f5f0fb;min-height:100dvh;display:block';document.body.append(panel);
 panel.querySelector('#wg-export-backup').onclick=async()=>{
  const status=panel.querySelector('#wg-backup-status');
  try{const value=await window.wgSecureStore.exportBackup(),blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='WorkGuide_Encrypted_Backup_'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);status.textContent='Το αρχείο ετοιμάστηκε για λήψη. Αποθήκευσέ το στα Αρχεία του iPhone.'}
  catch(error){status.textContent='Δεν έγινε λήψη: '+error.message}
 };
})();
