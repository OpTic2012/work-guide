/* Visual UI enhancement loaded after protected content and personal procedures. */
(function(){
'use strict';
const originalRender=render;
render=function(){
  originalRender();
  if(page==='detail'){
    const heading=main.querySelector('.head strong');
    if(heading)heading.textContent='Νέα παραγγελία';
    const content=main.querySelector('.screenContent');
    const title=content?.querySelector('.detailTitle');
    const desc=content?.querySelector('.detailSub');
    if(title&&desc){
      const banner=document.createElement('div');banner.className='wg-description-banner';banner.textContent=desc.textContent;
      const section=document.createElement('div');section.className='wg-sectionlabel';section.textContent='ΒΗΜΑΤΑ ΔΙΑΔΙΚΑΣΙΑΣ';
      content.insertBefore(banner,title);content.insertBefore(section,title);title.remove();desc.remove();
      const icon=content.querySelector('.leadIcon');if(icon)icon.remove();
      content.classList.add('wg-detail-screen');
    }
  }
  if(page==='profile'){
    const content=main.querySelector('.screenContent');
    if(content&&!document.getElementById('wg-forget-device')){
      const button=document.createElement('button');button.id='wg-forget-device';button.className='wg-secondary';
      button.style.cssText='display:block;width:100%;margin-top:19px;';
      button.textContent='🔒 Κλείδωμα αυτής της συσκευής';
      button.onclick=()=>{if(confirm('Να ζητά ξανά τον κωδικό στην επόμενη είσοδο; Οι διαδικασίες σου δεν θα διαγραφούν.'))window.wgForgetDevice()};
      content.appendChild(button);
      const note=document.createElement('p');note.className='smallNote';note.textContent='Η απομνημόνευση ισχύει μόνο σε αυτή τη συσκευή. Όποιος την ξεκλειδώσει μπορεί να ανοίξει το Work Guide χωρίς κωδικό.';
      content.appendChild(note);
    }
  }
};
render();
})();
