/* Base UI V1: faithful layout without touching decrypted content or AES key. */
(function(){
 'use strict';
 // Use the iconography selected in the approved visual reference.
 Object.assign(vectorPaths,{
   'shield-check':'<path d="M12 2 21 6v6c0 5-3.5 8.7-9 10-5.5-1.3-9-5-9-10V6l9-4Z"/><path d="m8 12 2.7 2.7L16.5 9"/>',
   'wrench':'<path d="M14.7 6.3a5.9 5.9 0 0 0-7.6 7.6L2.7 18.4a2 2 0 0 0 2.8 2.8l4.5-4.4a5.9 5.9 0 0 0 7.7-7.6l-3.6 3.6-3.1-1-1-3.1 3.7-3.4Z"/>'
 });
 const policy=sections.find(s=>s.id==='policy');if(policy)policy.icon='shield-check';
 const tools=sections.find(s=>s.id==='tools');if(tools)tools.icon='wrench';
 const oldRender=render;
 let upgrading=false;
 const iconButton=(icon,label,fn)=>`<button type="button" aria-label="${label}" title="${label}" onclick="${fn}">${ico(icon,23)}</button>`;
 render=function(){
   if(upgrading) return oldRender();
   upgrading=true;
   try{
     oldRender();
     nav.style.display='none';
     if(page==='home'){
       const hero=main.querySelector('.hero');
       if(hero){
         // Intro is visually outside the purple header, as in the approved image.
         const intro=document.createElement('section');
         intro.className='wg-home-intro';
         intro.innerHTML='<h1>Καλωσήρθες! 👋</h1><p>Ο πλήρης οδηγός για τη δουλειά σου,<br>πάντα μαζί σου.</p>';
         hero.after(intro);
         const quick=document.createElement('div');
         quick.className='wg-home-links';
         quick.innerHTML='<button onclick="go(\'search\')">Αναζήτηση</button><button onclick="go(\'favorites\')">Αγαπημένα</button><button onclick="go(\'profile\')">Ρυθμίσεις / Κλείδωμα</button>';
         main.querySelector('.tiles')?.after(quick);
       }
     }
     if(page==='detail'){
       const heading=main.querySelector('.head strong');
       if(heading) heading.textContent='Νέα παραγγελία';
       const back=main.querySelector('.head .back');
       if(back)back.setAttribute('onclick',"go('process')");
       const body=main.querySelector('.screenContent');
       if(body){
         const description=body.querySelector('.detailSub');
         const lead=body.querySelector('.leadIcon');
         const title=body.querySelector('.detailTitle');
         const banner=document.createElement('div');
         banner.className='wg-description-banner';
         banner.textContent=description?.textContent||'Ενδεικτική διαδικασία';
         const label=document.createElement('div');
         label.className='wg-sectionlabel';label.textContent='ΒΗΜΑΤΑ ΔΙΑΔΙΚΑΣΙΑΣ';
         body.prepend(label);body.prepend(banner);
         description?.remove();lead?.remove();title?.remove();
         body.classList.add('wg-detail-screen');
         // Show concise, readable steps rather than duplicate lengthy paragraphs.
         body.querySelectorAll('.step').forEach(step=>{
           const mainText=step.querySelector('p')?.textContent||step.querySelector('strong')?.textContent||'';
           const copy=document.createElement('div');copy.className='wg-step-copy';copy.textContent=mainText;
           step.querySelector(':scope > div:not(.number)')?.replaceWith(copy);
         });
         body.querySelector('.tip')?.remove();
         body.querySelector('.entry')?.remove();
         const info=document.createElement('p');info.className='wg-tinyhint';info.textContent='Ενδεικτική διαδικασία. Μπορείς να προσθέσεις τη δική σου από τη λίστα διαδικασιών.';
         body.append(info);
       }
     }
     if(page==='wg-procedure'){
       const heading=main.querySelector('.head');
       if(heading && !heading.querySelector('.wg-head-actions')){
         const actions=document.createElement('div');actions.className='wg-head-actions';
         // Functions set by procedures.js — available only after unlock.
         const edit=document.createElement('button');edit.title='Επεξεργασία διαδικασίας';edit.setAttribute('aria-label','Επεξεργασία διαδικασίας');edit.innerHTML=ico('edit',23);edit.onclick=()=>{const a=main.querySelector('.wg-detailactions button[onclick^="wgEditProcedure"]');a?.click()};
         const del=document.createElement('button');del.title='Διαγραφή διαδικασίας';del.setAttribute('aria-label','Διαγραφή διαδικασίας');del.innerHTML=ico('trash',23);del.onclick=()=>{const a=main.querySelector('.wg-detailactions button[onclick^="wgDeleteProcedure"]');a?.click()};
         actions.append(edit,del);heading.append(actions);
       }
     }
     if(page==='profile'){
       const content=main.querySelector('.screenContent');
       if(content&&!document.getElementById('wg-forget-device')){
         const button=document.createElement('button');button.id='wg-forget-device';button.className='wg-secondary';button.style.cssText='width:100%;margin-top:18px';
         button.textContent='🔒 Κλείδωμα αυτής της συσκευής';
         button.onclick=()=>{if(confirm('Να απαιτείται ξανά κωδικός στο iPhone; Οι διαδικασίες δεν θα διαγραφούν.'))window.wgForgetDevice()};
         content.appendChild(button);
         const note=document.createElement('p');note.className='smallNote';note.textContent='Η απομνημόνευση σύνδεσης είναι τοπική σε αυτή τη συσκευή. Αν έχει πρόσβαση κάποιος στο ξεκλείδωτο iPhone, μπορεί να ανοίξει το Work Guide.';content.appendChild(note);
       }
     }
   }finally{upgrading=false}
 };
 render();
})();
