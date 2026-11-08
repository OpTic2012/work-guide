/* Work Guide secure personal procedures add-on — loaded only AFTER successful unlock. */
(function () {
  'use strict';
  // Keep new actions in the same custom stroke-icon family as the original mockup.
  Object.assign(vectorPaths,{
    plus:'<path d="M12 5v14M5 12h14"/>',
    edit:'<path d="M11 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6"/><path d="m16 5 3 3m-11 8 3.3-.6L21 5.7a2.1 2.1 0 0 0-3-3L8.3 12.4 8 16Z"/>',
    trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6M10 10v7m4-7v7"/>',
    lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    save:'<path d="M4 3h14l3 3v15H3V3h1Z"/><path d="M7 3v7h10V3M7 21v-8h10v8"/>'
  });
  const STORAGE_KEY='wg_procedures_encrypted_v1';
  const AAD=new TextEncoder().encode('workguide-personal-procedures-v1');
  const key=window.__wgProcedureKey;
  delete window.__wgProcedureKey;
  const encoding=new TextEncoder(), decoding=new TextDecoder();
  let procedures=[], draft=null, selectedId=null, isReady=false, loadError='';
  const oldRender=render;
  const oldSearchResults=searchResults;
  const get=id=>document.getElementById(id);
  const safe=s=>esc(String(s??''));
  const encodeBase64=bytes=>{let text='';for(const b of bytes)text+=String.fromCharCode(b);return btoa(text)};
  const decodeBase64=text=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
  const makeId=()=>{
    if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
    return encodeBase64(crypto.getRandomValues(new Uint8Array(16))).replace(/[^a-zA-Z0-9]/g,'').slice(0,22);
  };
  function storage(){
    if(!key)throw Error('Δεν βρέθηκε το κλειδί κρυπτογράφησης. Κλείσε και άνοιξε ξανά την εφαρμογή.');
    if(!crypto?.subtle)throw Error('Δεν υποστηρίζεται η ασφαλής αποθήκευση σε αυτή τη συσκευή.');
  }
  async function readData(){
    storage();const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw){procedures=[];isReady=true;return;}
    const packet=JSON.parse(raw);
    if(packet.version!==1)throw Error('Η μορφή αποθήκευσης δεν υποστηρίζεται.');
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:decodeBase64(packet.iv),additionalData:AAD},key,decodeBase64(packet.data));
    const parsed=JSON.parse(decoding.decode(plain));
    if(!Array.isArray(parsed))throw Error('Τα αποθηκευμένα δεδομένα δεν είναι έγκυρα.');
    procedures=parsed.filter(p=>p && typeof p.title==='string' && Array.isArray(p.steps)).map(p=>({
      id:String(p.id||''), title:p.title,description:String(p.description||''),steps:p.steps.map(s=>String(s)),created:p.created||'',updated:p.updated||''
    }));
    isReady=true;
  }
  async function writeData(){
    storage();const iv=crypto.getRandomValues(new Uint8Array(12));
    const plain=encoding.encode(JSON.stringify(procedures));
    const cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:AAD},key,plain));
    localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,iv:encodeBase64(iv),data:encodeBase64(cipher)}));
  }
  function updateNav(){
    nav.innerHTML=[['home','house','Αρχική'],['process','book-open','Οδηγός'],['favorites','star','Αγαπημένα'],['profile','user','Προφίλ']]
      .map(([id,ic,label])=>`<button onclick="go('${id}')" class="${id==='process'?'active':''}">${ico(ic,25)}<span>${label}</span></button>`).join('');
  }
  function customPage(body){
    status.className='status';main.innerHTML=body;updateNav();main.scrollTop=0;
  }
  function back(label){return `<div class="head wg-photo-head"><button class="back" onclick="go('process')" aria-label="Πίσω στις διαδικασίες">${ico('arrow-left',22)}</button><strong>${safe(label)}</strong></div>`}
  function renderList(){
    let body=head('Διαδικασίες')+`<div class="screenContent wg-list-screen">
    <button class="wg-new" onclick="wgNewProcedure()">${ico('plus',19)} Νέα διαδικασία</button>
    ${loadError?`<div class="wg-private" role="alert">${safe(loadError)}<p>Αν άλλαξες κωδικό, παλιές τοπικές διαδικασίες ενδέχεται να μην ανοίγουν. Μην καθαρίσεις τα δεδομένα πριν κρατήσεις αντίγραφο.</p></div>`:''}
    <div class="wg-count">ΟΙ ΔΙΑΔΙΚΑΣΙΕΣ ΜΟΥ</div>
    ${!isReady?'<div class="empty">Φόρτωση προσωπικών διαδικασιών…</div>':procedures.map(p=>`<button class="entry" onclick="wgOpenProcedure('${safe(p.id)}')"><span class="sym">${ico('clipboard',24)}</span><span><div class="enTitle">${safe(p.title)}</div><div class="enDesc">${p.steps.length} ${p.steps.length===1?'βήμα':'βήματα'}</div></span><span class="chev">${ico('chevron-right',18)}</span></button>`).join('')}
    ${miniRow('clipboard','Νέα παραγγελία','4 βήματα · Παράδειγμα','detail')}
    <button class="entry" onclick="wgExampleCheck()"><span class="sym">${ico('clipboard',24)}</span><span><div class="enTitle">Έλεγχος εργασίας</div><div class="enDesc">3 βήματα · Παράδειγμα</div></span><span class="chev">${ico('chevron-right',18)}</span></button>
    <div class="wg-private">${ico('lock',18)} Οι δικές σου διαδικασίες αποθηκεύονται κρυπτογραφημένες σε αυτή τη συσκευή. Δεν ανεβαίνουν στο GitHub και δεν συγχρονίζονται αυτόματα.</div>
    <p class="wg-tinyhint">Αν διαγράψεις τα δεδομένα του Safari ή την εφαρμογή, οι καταχωρίσεις μπορεί να χαθούν. Πριν αλλάξεις κωδικό, κράτησε αντίγραφο των διαδικασιών σου.</p>
    </div>`;
    customPage(body);
  }
  function renderView(){
    const p=procedures.find(x=>x.id===selectedId);if(!p){page='process';render();return;}
    customPage(back(p.title)+`<div class="screenContent wg-detail-screen"><div class="wg-description-banner">${safe(p.description||'Προσωπική διαδικασία')}</div><div class="wg-sectionlabel">ΒΗΜΑΤΑ ΔΙΑΔΙΚΑΣΙΑΣ</div>
    ${p.steps.map((s,i)=>`<div class="step"><div class="number">${i+1}</div><div class="wg-step-copy" style="white-space:pre-wrap;overflow-wrap:anywhere">${safe(s)}</div></div>`).join('')}
    <div class="wg-detailactions"><button class="wg-save" onclick="wgEditProcedure('${safe(p.id)}')">${ico('edit',17)} Επεξεργασία</button><button class="wg-secondary" onclick="wgDeleteProcedure('${safe(p.id)}')">${ico('trash',17)} Διαγραφή</button></div>
    <button class="wg-secondary" style="margin-top:14px;width:100%" onclick="go('process')">Επιστροφή στις διαδικασίες</button>
    </div>`);
  }
  function renderExampleCheck(){
    const example=['Έλεγξε τις εκκρεμότητες της ημέρας.','Επιβεβαίωσε ότι τα εργαλεία εργασίας λειτουργούν.','Κατέγραψε όσα χρειάζονται παρακολούθηση.'];
    customPage(back('Έλεγχος εργασίας')+`<div class="screenContent wg-detail-screen"><div class="wg-description-banner">Ενδεικτικά βήματα ελέγχου εργασίας.</div><div class="wg-sectionlabel">ΒΗΜΑΤΑ ΔΙΑΔΙΚΑΣΙΑΣ</div>${example.map((s,i)=>`<div class="step"><div class="number">${i+1}</div><div class="wg-step-copy">${safe(s)}</div></div>`).join('')}<p class="wg-tinyhint">Παράδειγμα για την εμφάνιση. Χρησιμοποίησε το «Νέα διαδικασία» για να γράψεις τις δικές σου οδηγίες.</p></div>`);
  }
  function renderEditor(){
    if(!draft){page='process';render();return;}
    const edit=Boolean(draft.id);
    customPage(back(edit?'Επεξεργασία':'Νέα διαδικασία')+`<div class="screenContent"><h2 class="detailTitle" style="margin-top:2px">${edit?'Επεξεργασία διαδικασίας':'Δημιουργία διαδικασίας'}</h2><p class="detailSub">Γράψε έναν τίτλο και πρόσθεσε τα βήματα που θέλεις.</p>
      <label class="wg-form-label" for="wg-title">Τίτλος διαδικασίας *</label>
      <input class="wg-form-input" id="wg-title" maxlength="120" placeholder="π.χ. Πώς κάνω νέα παραγγελία" value="${safe(draft.title)}" oninput="wgField('title',this.value)" required>
      <label class="wg-form-label" for="wg-description">Περιγραφή (προαιρετική)</label>
      <textarea class="wg-form-area" id="wg-description" maxlength="600" placeholder="Πότε χρειάζεται αυτή η διαδικασία;" oninput="wgField('description',this.value)">${safe(draft.description)}</textarea>
      <label class="wg-form-label">Βήματα διαδικασίας *</label>
      <div id="wg-steps">${draft.steps.map((step,i)=>`<div class="wg-step-edit"><div class="wg-step-top"><span class="wg-step-num">${i+1}</span>Βήμα ${i+1}<div class="wg-step-actions"><button class="wg-smallbtn" aria-label="Μετακίνηση επάνω" onclick="wgMoveStep(${i},-1)" ${i===0?'disabled':''}>↑</button><button class="wg-smallbtn" aria-label="Μετακίνηση κάτω" onclick="wgMoveStep(${i},1)" ${i===draft.steps.length-1?'disabled':''}>↓</button><button class="wg-smallbtn wg-remove" aria-label="Διαγραφή βήματος" onclick="wgRemoveStep(${i})" ${draft.steps.length===1?'disabled':''}>×</button></div></div><textarea class="wg-form-area" maxlength="3000" placeholder="Γράψε τι πρέπει να γίνει σε αυτό το βήμα..." oninput="wgStepField(${i},this.value)">${safe(step)}</textarea></div>`).join('')}</div>
      <button class="wg-add-step" onclick="wgAddStep()">${ico('plus',17)} Προσθήκη βήματος</button>
      <p class="wg-error" id="wg-error" role="alert" aria-live="polite"></p>
      <div class="wg-btnrow"><button class="wg-secondary" onclick="wgCancel()">Άκυρο</button><button class="wg-save" id="wg-save" onclick="wgSaveProcedure()">${ico('save',16)} Αποθήκευση</button></div>
      <p class="wg-tinyhint">Τα βήματα αποθηκεύονται στο iPhone σου, όχι στο δημόσιο GitHub. Μην καταχωρείς ευαίσθητα εταιρικά δεδομένα χωρίς έγκριση.</p>
    </div>`);
  }
  // Hook only our feature pages; leave the original app and its icons/layout intact elsewhere.
  render=function(){
    if(page==='process'){renderList();return;}
    if(page==='wg-procedure'){renderView();return;}
    if(page==='wg-procedure-edit'){renderEditor();return;}
    if(page==='wg-example-check'){renderExampleCheck();return;}
    oldRender();
  };
  searchResults=function(){
    const existing=oldSearchResults();
    const q=query.toLocaleLowerCase('el').trim();
    const personal=procedures.filter(p=>!q||(p.title+' '+p.description+' '+p.steps.join(' ')).toLocaleLowerCase('el').includes(q));
    if(!personal.length)return existing;
    const html=personal.map(p=>`<button class="entry" onclick="wgOpenProcedure('${safe(p.id)}')"><span class="sym">${ico('clipboard',24)}</span><span><div class="enTitle">${safe(p.title)}</div><div class="enDesc">${p.steps.length} βήματα · Προσωπική διαδικασία</div></span><span class="chev">${ico('chevron-right',18)}</span></button>`).join('');
    return existing.includes('Δεν βρέθηκαν αποτελέσματα')?html:html+existing;
  };
  window.wgExampleCheck=()=>{page='wg-example-check';render();};
  window.wgNewProcedure=()=>{draft={id:null,title:'',description:'',steps:['']};page='wg-procedure-edit';render();};
  window.wgOpenProcedure=id=>{selectedId=id;page='wg-procedure';render();};
  window.wgEditProcedure=id=>{const p=procedures.find(x=>x.id===id);if(!p)return;draft=JSON.parse(JSON.stringify(p));page='wg-procedure-edit';render();};
  window.wgField=(field,value)=>{if(draft&&['title','description'].includes(field))draft[field]=value;};
  window.wgStepField=(i,value)=>{if(draft&&i>=0&&i<draft.steps.length)draft.steps[i]=value;};
  window.wgAddStep=()=>{draft.steps.push('');render();const areas=get('wg-steps')?.querySelectorAll('textarea');areas?.[areas.length-1]?.focus();};
  window.wgRemoveStep=i=>{if(draft.steps.length>1){draft.steps.splice(i,1);render();}};
  window.wgMoveStep=(i,d)=>{const j=i+d;if(j<0||j>=draft.steps.length)return;[draft.steps[i],draft.steps[j]]=[draft.steps[j],draft.steps[i]];render();};
  window.wgCancel=()=>{if(draft?.id){selectedId=draft.id;page='wg-procedure';}else page='process';draft=null;render();};
  window.wgSaveProcedure=async()=>{
    if(!draft)return;
    const title=draft.title.trim(), steps=draft.steps.map(s=>s.trim()).filter(Boolean), error=get('wg-error');
    if(!title){error.textContent='Γράψε τίτλο για τη διαδικασία.';get('wg-title')?.focus();return;}
    if(!steps.length){error.textContent='Γράψε τουλάχιστον ένα βήμα.';return;}
    if(!isReady||loadError){error.textContent='Η ασφαλής αποθήκευση δεν είναι διαθέσιμη. Κλείσε και άνοιξε ξανά την εφαρμογή.';return;}
    const btn=get('wg-save');btn.disabled=true;btn.textContent='Αποθήκευση…';
    const snapshot=procedures.slice(), now=new Date().toISOString();
    const item={id:draft.id||makeId(),title,description:draft.description.trim(),steps,created:draft.created||now,updated:now};
    procedures=procedures.filter(p=>p.id!==item.id);procedures.unshift(item);
    try{await writeData();selectedId=item.id;draft=null;page='wg-procedure';render();}
    catch(e){procedures=snapshot;error.textContent='Δεν έγινε αποθήκευση. Έλεγξε τον διαθέσιμο χώρο και δοκίμασε ξανά.';btn.disabled=false;btn.textContent='Αποθήκευση';console.warn('Secure procedure save error',e);}
  };
  window.wgDeleteProcedure=async id=>{
    const p=procedures.find(x=>x.id===id);if(!p)return;
    if(!confirm(`Να διαγραφεί η διαδικασία «${p.title}»;`))return;
    const snapshot=procedures.slice();procedures=procedures.filter(p=>p.id!==id);
    try{await writeData();page='process';render();}
    catch(e){procedures=snapshot;alert('Η διαγραφή δεν αποθηκεύτηκε. Δοκίμασε ξανά.');}
  };
  readData().catch(e=>{loadError='Δεν ήταν δυνατή η ανάγνωση των προσωπικών διαδικασιών.';console.warn('Secure procedure load error',e)}).finally(()=>{if(page==='process')render()});
})();
