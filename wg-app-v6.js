/* Work Guide v6 — approved UI, mounted only after the original WGL2 unlock. */
(async function(){
'use strict';
const iconMap={briefcase:'briefcase-business',book:'book-open',shield:'shield-check',check:'square-check',users:'users',help:'circle-help',tools:'wrench',megaphone:'megaphone',clipboard:'file-text',chevron:'chevron-right',left:'chevron-left',plus:'plus',search:'search',bell:'bell',home:'house',star:'star',user:'user',edit:'pencil',trash:'trash-2',upload:'upload',download:'download',save:'save',arrowUp:'chevron-up',arrowDown:'chevron-down',lock:'lock-keyhole',signal:'signal',wifi:'wifi'};
const icons=iconMap;
function ico(name,cl=''){return `<i data-lucide="${iconMap[name]||'file-text'}" class="svg ${cl}" aria-hidden="true"></i>`}
function refreshIcons(){if(typeof lucide!=='undefined')lucide.createIcons();}
const defaultSettings={
 version:1,
 app:{title:'Work Guide',subtitle:'Οδηγός Εργασίας',welcome:'Καλωσήρθες! 👋',intro:'Ο πλήρης οδηγός για τη δουλειά σου, πάντα μαζί σου.',search:'Αναζήτηση (π.χ. διαδικασία, πολιτική...)',purple:'#642bb4',purpleLight:'#a052ed',roundness:18,gap:12,cardHeight:128},
 cards:[
 {id:'procedures',title:'Διαδικασίες',subtitle:'Βήμα-βήμα οδηγίες',icon:'book',bg:'#dce7ff',fg:'#0861ff'},
 {id:'policies',title:'Αδειες & Bonus',subtitle:'',icon:'shield',bg:'#eddcfc',fg:'#7217d4'},
 {id:'team',title:'Ομάδα',subtitle:'Επαφές & ρόλοι',icon:'users',bg:'#dff9e9',fg:'#14b629'},
 {id:'faq',title:'Συχνές Ερωτήσεις',subtitle:'Γρήγορες απαντήσεις',icon:'help',bg:'#fff0df',fg:'#ff7b00'},
 {id:'tools',title:'Χρήσιμα Εργαλεία',subtitle:'Σύνδεσμοι & εφαρμογές',icon:'tools',bg:'#e3eeff',fg:'#0b68d2'},
 {id:'announcements',title:'Ανακοινώσεις',subtitle:'Νέα & ενημερώσεις',icon:'megaphone',bg:'#ffe5f1',fg:'#d72871'}
 ],
 procedures:[],
 policies:[],
 contacts:[],
 favoriteRefs:[],
 profile:{name:''},
 procedureUi:{buttonColor:'#651bb9',buttonLight:'#ac4bfa',title:'Διαδικασίες',newLabel:'Νέα διαδικασία',listLabel:'ΟΙ ΔΙΑΔΙΚΑΣΙΕΣ ΜΟΥ',layout:'list',showAdd:true,showCount:true},
 detailUi:{stepsLabel:'ΒΗΜΑΤΑ ΔΙΑΔΙΚΑΣΙΑΣ',bigSteps:false,showEdit:true}
};
function clone(a){return JSON.parse(JSON.stringify(a))}
function saneHex(s,fallback){return typeof s==='string'&&/^#[0-9a-fA-F]{6}$/.test(s)?s:fallback}
function textValue(s,fallback='',max=500){return typeof s==='string'?s.slice(0,max):fallback}
function strId(){return 'p-'+Math.random().toString(36).slice(2,11)}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function loadConfig(o){if(!o||typeof o!=='object'||Array.isArray(o)||o.version!==1)throw Error('Μη συμβατό αρχείο. Χρειάζεται JSON από το Work Guide Designer · Base UI.');const d=clone(defaultSettings),a=o.app||{};for(const k of ['title','subtitle','welcome','intro','search'])d.app[k]=textValue(a[k],d.app[k],250);d.app.purple=saneHex(a.purple,d.app.purple);d.app.purpleLight=saneHex(a.purpleLight,d.app.purpleLight);for(const k of ['roundness','gap','cardHeight']){const n=Number(a[k]);if(Number.isFinite(n)&&n>0)d.app[k]=Math.min(160,Math.max(4,n))}
if(Array.isArray(o.cards)){d.cards=o.cards.slice(0,16).map((c,i)=>({id:textValue(c.id,'card-'+i,60),title:textValue(c.title,'Κάρτα',90),subtitle:textValue(c.subtitle,'',120),icon:icons[c.icon]?c.icon:'clipboard',bg:saneHex(c.bg,'#f0eaff'),fg:saneHex(c.fg,'#6e3ccd')}));if(d.cards.length===0)d.cards=clone(defaultSettings.cards)}
if(Array.isArray(o.procedures)){d.procedures=o.procedures.filter(p=>p&&!['sample-order','sample-check'].includes(p.id)).slice(0,60).map((p,i)=>({id:textValue(p.id,'proc-'+i,60),title:textValue(p.title,'Νέα διαδικασία',100),description:textValue(p.description,'',400),steps:Array.isArray(p.steps)?p.steps.slice(0,60).map(s=>textValue(s,'',1500)):[]}))}
if(o.procedureUi&&typeof o.procedureUi==='object'){const p=o.procedureUi;d.procedureUi.buttonColor=saneHex(p.buttonColor,d.procedureUi.buttonColor);d.procedureUi.buttonLight=saneHex(p.buttonLight,d.procedureUi.buttonLight);for(const k of ['title','newLabel','listLabel'])d.procedureUi[k]=textValue(p[k],d.procedureUi[k],90);if(['list','tiles'].includes(p.layout))d.procedureUi.layout=p.layout;if(typeof p.showAdd==='boolean')d.procedureUi.showAdd=p.showAdd;if(typeof p.showCount==='boolean')d.procedureUi.showCount=p.showCount}
if(o.detailUi&&typeof o.detailUi==='object'){const p=o.detailUi;d.detailUi.stepsLabel=textValue(p.stepsLabel,d.detailUi.stepsLabel,90);if(typeof p.bigSteps==='boolean')d.detailUi.bigSteps=p.bigSteps;if(typeof p.showEdit==='boolean')d.detailUi.showEdit=p.showEdit}
if(Array.isArray(o.policies))d.policies=o.policies.filter(p=>p&&typeof p==='object').slice(0,100).map((p,i)=>({id:textValue(p.id,'policy-'+i,60),title:textValue(p.title,'',120),description:textValue(p.description,'',600),content:textValue(p.content,'',12000)}));
if(Array.isArray(o.contacts))d.contacts=o.contacts.filter(c=>c&&typeof c==='object').slice(0,300).map((c,i)=>({id:textValue(c.id,'contact-'+i,60),name:textValue(c.name,'',120),phone:textValue(c.phone,'',60),role:textValue(c.role,'',160)}));
if(Array.isArray(o.favoriteRefs))d.favoriteRefs=o.favoriteRefs.filter(r=>r&&['procedures','policies','contacts'].includes(r.kind)&&typeof r.id==='string').slice(0,600).map(r=>({kind:r.kind,id:r.id.slice(0,60)}));if(o.profile&&typeof o.profile==='object')d.profile.name=textValue(o.profile.name,'',120);
if(d.app.purple==='#651bb9')d.app.purple='#642bb4';if(d.app.purpleLight==='#ac4bfa')d.app.purpleLight='#a052ed';
const category=d.cards.find(c=>c.id==='policies');if(category){if(['Πολιτικές','Άδειες & Bonus','Αδειες &','Άδειες &'].includes(category.title))category.title='Αδειες & Bonus';if(category.subtitle==='Κανόνες & οδηγίες')category.subtitle='';}
return d}
function viewVars(){const a=config.app;return `--wg-purple:${a.purple};--wg-purple-light:${a.purpleLight};--wg-radius:${a.roundness}px;--wg-gap:${a.gap}px;--wg-card-height:${a.cardHeight}px;--wg-button:${config.procedureUi.buttonColor};--wg-button-light:${config.procedureUi.buttonLight}`}
function move(arr,i,delta){const next=i+delta;if(next<0||next>=arr.length)return i;[arr[i],arr[next]]=[arr[next],arr[i]];return next}
const esc=escapeHtml;
function navBar(screen){const active=screen==='profile'?'profile':screen==='favorites'||navContext==='favorites'?'favorites':'home';return `<nav class="wg-app-nav" aria-label="Κύρια πλοήγηση">${[['home','home','Αρχική'],['favorites','star','Αγαπημένα'],['profile','user','Προφίλ']].map(([id,icon,label])=>`<button type="button" data-nav="${id}" class="wg-app-tab ${active===id?'is-active':''}" ${active===id?'aria-current="page"':''}>${ico(icon)}<span>${label}</span></button>`).join('')}</nav>`}
function homePhone(){const a=config.app;return frame(`<div class="phone-home-hero"><div class="phone-logo-row"><span class="hero-logo"><span class="wg-briefcase" aria-hidden="true"><span class="wg-case-handle"></span><span class="wg-case-body"></span><span class="wg-case-lid"></span><span class="wg-case-latch"></span></span></span><div><div class="hero-app-title">${esc(a.title)}</div><div class="hero-app-subtitle">${esc(a.subtitle)}</div></div></div></div><div class="phone-home-intro"><div class="hero-welcome">${esc(a.welcome)}</div><div class="hero-description">${esc(a.intro)}</div></div><div class="home-cards">${config.cards.map((c,i)=>`<button type="button" aria-label="${esc(c.title)}" class="home-card ${activeTab==='home'&&selectedCard===i?'selected-card':''}" data-select-card="${i}" data-category="${esc(c.id)}" style="--card-bg:${c.bg};--card-fg:${c.fg}"><span class="iconholder">${ico(c.icon,'lg')}</span><span class="home-card-copy"><span class="home-card-title">${c.id==='policies'&&c.title==='Αδειες & Bonus'?'<span class="wg-title-line">Αδειες &amp;</span><span class="wg-title-line">Bonus</span>':esc(c.title)}</span>${c.subtitle?`<span class="home-card-desc">${esc(c.subtitle)}</span>`:''}</span></button>`).join('')}</div>`,'home')}
function header(title,edit=false,kind='procedure'){return `<div class="page-header ${edit&&config.detailUi.showEdit?'has-actions':''}"><button type="button" class="phone-icon" data-screen="${edit?(navContext==='favorites'?'favorites':kind==='contact'?'contacts':kind==='policy'?'policies':'procedures'):'home'}" aria-label="Πίσω">${ico('left')}</button><h3>${esc(title)}</h3>${edit&&config.detailUi.showEdit?`<span class="side-icons"><button class="phone-icon" data-${kind==='contact'?'contact':kind==='policy'?'policy':'phone'}-action="edit" aria-label="Επεξεργασία">${ico('edit')}</button><button class="phone-icon" data-${kind==='contact'?'contact':kind==='policy'?'policy':'phone'}-action="delete" aria-label="Διαγραφή">${ico('trash')}</button></span>`:`<span style="width:24px"></span>`}</div>`}
function proceduresPhone(){const u=config.procedureUi;return frame(header(u.title)+`<div class="page-body">${u.showAdd?`<button type="button" class="add-proc" data-action="add-proc">${ico('plus')} ${esc(u.newLabel)}</button>`:''}<div class="group-title">${esc(u.listLabel)}</div><div class="${u.layout==='tiles'?'proc-tile-list':''}">${config.procedures.map((p,i)=>`<button type="button" class="proc-row ${activeTab==='procedures'&&selectedProcedure===i?'active':''}" data-select-proc="${i}"><span class="proc-icon">${ico('clipboard')}</span><span class="proc-row-text"><strong>${esc(p.title)}</strong>${u.showCount?`<small>${p.steps.length} ${p.steps.length===1?'βήμα':'βήματα'}</small>`:''}</span>${ico('chevron','sm')}</button>`).join('')}</div>${config.procedures.length===0?'<p class="empty-note">Δεν έχεις προσθέσει ακόμη διαδικασίες.</p>':''}</div>`,'guide')}
function detailPhone(){const u=config.detailUi,p=config.procedures[selectedProcedure];if(!p)return frame(header('Διαδικασία')+'<div class="page-body"><p class="empty-note">Πρόσθεσε μια διαδικασία για να εμφανιστεί εδώ.</p></div>','guide');return frame(header(p.title,true)+`<div class="page-body">${favoriteToggle('procedures',p.id)}<div class="detail-desc">${esc(p.description)}</div><div class="step-title">${esc(u.stepsLabel)}</div>${p.steps.map((st,i)=>`<div class="step-view ${u.bigSteps?'big':''}" ><span class="num">${i+1}</span><p>${esc(st)}</p></div>`).join('')}${p.steps.length===0?'<p class="empty-note">Δεν υπάρχουν βήματα ακόμη.</p>':''}</div>`,'guide')}
function phoneEditor(){return frame(header(phoneDraft.id?'Επεξεργασία':'Νέα διαδικασία')+`<div class="page-body phone-form"><label>Τίτλος<input class="field" data-draft="title" value="${esc(phoneDraft.title)}"></label><label>Περιγραφή<textarea class="field area" data-draft="description">${esc(phoneDraft.description)}</textarea></label>${phoneDraft.steps.map((s,i)=>`<label>Βήμα ${i+1}<textarea class="field area" data-draft-step="${i}">${esc(s)}</textarea><span class="draft-actions"><button class="wg-button tiny" data-phone-up="${i}" ${i===0?'disabled':''}>↑</button><button class="wg-button tiny" data-phone-down="${i}" ${i===phoneDraft.steps.length-1?'disabled':''}>↓</button><button class="wg-button tiny danger" data-phone-remove="${i}" ${phoneDraft.steps.length===1?'disabled':''}>Αφαίρεση</button></span></label>`).join('')}<button class="wg-button full soft" data-phone-action="step">+ Προσθήκη βήματος</button><p role="alert" class="phone-error">${esc(phoneError)}</p><div class="row-buttons"><button class="wg-button" data-phone-action="cancel">Άκυρο</button><button class="wg-button primary" data-phone-action="save">Αποθήκευση</button></div></div>`,'edit')}
function policiesPhone(){return frame(header(config.cards.find(c=>c.id==='policies')?.title||'Αδειες & Bonus')+`<div class="page-body"><button type="button" class="add-proc" data-policy-action="new">${ico('plus')} Νέα καταχώριση</button><div class="group-title">ΑΔΕΙΕΣ &amp; BONUS</div>${config.policies.map((p,i)=>`<button type="button" class="proc-row" data-select-policy="${i}"><span class="proc-icon">${ico('shield')}</span><span class="proc-row-text"><strong>${esc(p.title)}</strong>${p.description?`<small>${esc(p.description)}</small>`:''}</span>${ico('chevron','sm')}</button>`).join('')}${config.policies.length?'':'<p class="empty-note">Δεν έχεις προσθέσει ακόμη καταχωρίσεις.</p>'}</div>`,'policies')}
function policyPhone(){const p=config.policies[selectedPolicy];if(!p)return policiesPhone();return frame(header(p.title,true,'policy')+`<div class="page-body">${favoriteToggle('policies',p.id)}${p.description?`<div class="detail-desc">${esc(p.description)}</div>`:''}<div class="policy-content">${esc(p.content)}</div></div>`,'policy-detail')}
function policyEditor(){return frame(header(policyDraft.id?'Επεξεργασία καταχώρισης':'Νέα καταχώριση',false,'policy').replace('data-screen="home"','data-screen="policies"')+`<div class="page-body phone-form"><label>Τίτλος καταχώρισης<input class="field" data-policy-field="title" value="${esc(policyDraft.title)}"></label><label>Σύντομη περιγραφή (προαιρετική)<textarea class="field area" data-policy-field="description">${esc(policyDraft.description)}</textarea></label><label>Περιεχόμενο<textarea class="field area policy-textarea" data-policy-field="content" rows="9" placeholder="Γράψε εδώ το περιεχόμενο…">${esc(policyDraft.content)}</textarea></label><p role="alert" class="phone-error">${esc(policyError)}</p><div class="row-buttons"><button class="wg-button" data-policy-action="cancel">Άκυρο</button><button class="wg-button primary" data-policy-action="save">Αποθήκευση</button></div></div>`,'policy-edit')}
function startPolicy(){policyDraft={id:null,title:'',description:'',content:''};policyError='';previewScreen='policy-edit';compare=false;renderApp()}
function contactsPhone(){return frame(header(config.cards.find(c=>c.id==='team')?.title||'Ομάδα')+`<div class="page-body"><button type="button" class="add-proc" data-contact-action="new">${ico('plus')} Νέα επαφή</button><div class="group-title">ΕΠΑΦΕΣ &amp; ΡΟΛΟΙ</div>${config.contacts.map((c,i)=>`<button type="button" class="proc-row" data-select-contact="${i}"><span class="proc-icon contact-person">${ico('user')}</span><span class="proc-row-text"><strong>${esc(c.name)}</strong>${c.role?`<small>${esc(c.role)}</small>`:''}<small class="contact-number">${esc(c.phone)}</small></span>${ico('chevron','sm')}</button>`).join('')}${config.contacts.length?'':'<p class="empty-note">Δεν έχεις προσθέσει ακόμη επαφές.</p>'}</div>`,'contacts')}
function contactPhone(){const c=config.contacts[selectedContact];if(!c)return contactsPhone();const number=c.phone.replace(/[^+0-9]/g,'');return frame(header(c.name,true,'contact')+`<div class="page-body">${favoriteToggle('contacts',c.id)}<div class="contact-info">${c.role?`<div class="contact-label">Ρόλος</div><div class="contact-value">${esc(c.role)}</div>`:''}<div class="contact-label">Τηλέφωνο</div><a class="contact-call" href="tel:${esc(number)}" aria-label="Κλήση στο ${esc(c.phone)}">${esc(c.phone)}</a></div></div>`,'contact-detail')}
function contactEditor(){return frame(header(contactDraft.id?'Επεξεργασία επαφής':'Νέα επαφή').replace('data-screen="home"','data-screen="contacts"')+`<div class="page-body phone-form"><label>Ονοματεπώνυμο<input class="field" data-contact-field="name" value="${esc(contactDraft.name)}" autocomplete="off" placeholder="Όνομα και επώνυμο"></label><label>Τηλέφωνο<input class="field" type="tel" inputmode="tel" data-contact-field="phone" value="${esc(contactDraft.phone)}" autocomplete="off" placeholder="Αριθμός τηλεφώνου"></label><label>Ρόλος (προαιρετικό)<input class="field" data-contact-field="role" value="${esc(contactDraft.role)}" placeholder="π.χ. Υπεύθυνος βάρδιας"></label><p role="alert" class="phone-error">${esc(contactError)}</p><div class="row-buttons"><button class="wg-button" data-contact-action="cancel">Άκυρο</button><button class="wg-button primary" data-contact-action="save">Αποθήκευση</button></div></div>`,'contact-edit')}
function startContact(){contactDraft={id:null,name:'',phone:'',role:''};contactError='';previewScreen='contact-edit';compare=false;renderApp()}
function favoriteToggle(kind,id){const active=config.favoriteRefs.some(r=>r.kind===kind&&r.id===id);return `<button type="button" class="wg-favorite-toggle ${active?'is-favorite':''}" data-favorite-kind="${kind}" data-favorite-id="${esc(id)}" aria-pressed="${active}">${ico('star','sm')}<span>${active?'Στα αγαπημένα':'Προσθήκη στα αγαπημένα'}</span></button>`}
// Runtime adapter: all record saves are awaited before a successful UI transition.
let config=clone(defaultSettings),activeTab='home',selectedCard=0,selectedProcedure=0,selectedPolicy=0,selectedContact=0;
let phoneDraft=null,policyDraft=null,contactDraft=null,phoneError='',policyError='',contactError='';
let previewScreen='home',navContext='home',compare=false,pendingDelete=null,pendingLock=false,pendingRestore=null;
let saving=false,storageError='',toastTimeout,legacy=null,legacyMode=null;
const store=window.wgSecureStore;
try{if(typeof main!=='undefined'&&typeof go==='function')legacy={main,go,back:null}}catch(_){}
const root=document.createElement('div');root.id='wg-designer';root.className='wg-production';root.lang='el';
root.innerHTML='<div id="stage"></div><div class="toast" id="toast" role="status" aria-live="polite"></div><input id="appearance-file" type="file" accept=".json,application/json" hidden><input id="backup-file" type="file" accept=".json,application/json" hidden>';
const $=selector=>root.querySelector(selector);
function showToast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),3800)}
function frame(contents,screen){return `<div class="phone-screen" data-view="${screen}" style="${viewVars()}"><div class="phone-scroll" ${pendingDelete||pendingLock||pendingRestore?'inert':''}>${contents}</div><div ${pendingDelete||pendingLock||pendingRestore?'inert':''}>${navBar(screen)}</div>${confirmationDialog()}</div>`}
function newRecordId(){if(typeof crypto.randomUUID==='function')return crypto.randomUUID();return 'wg-'+Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('')}
function appearanceOnly(value){const {procedures,policies,contacts,favoriteRefs,profile,...appearance}=value;return appearance}
function download(name,value){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function stampProcedures(next){const old=store.snapshot().procedures,now=new Date().toISOString();return next.map(p=>{const prior=old.find(x=>x.id===p.id);if(prior&&JSON.stringify(prior)===JSON.stringify(p))return clone(prior);return {...prior,...p,created:prior?.created||p.created||now,updated:now}})}
async function persist(candidate){
 if(saving)return false;
 saving=true;storageError='';root.setAttribute('aria-busy','true');root.inert=true;
 try{
  const previous=store.snapshot();
  const next={procedures:stampProcedures(candidate.procedures),extras:{...previous.extras,policies:clone(candidate.policies),contacts:clone(candidate.contacts),favoriteRefs:clone(candidate.favoriteRefs),profile:clone(candidate.profile),appearance:appearanceOnly(candidate)}};
  const saved=await store.commit(next);
  config={...candidate,procedures:saved.procedures,policies:saved.extras.policies,contacts:saved.extras.contacts,favoriteRefs:saved.extras.favoriteRefs,profile:saved.extras.profile};
  return true;
 }catch(error){storageError=error.message||'Δεν έγινε αποθήκευση. Δοκίμασε ξανά.';renderApp();return false}
 finally{saving=false;root.removeAttribute('aria-busy');root.inert=false}
}
function requestDelete(kind,index){const p=config[kind]?.[index];if(!p)return;pendingDelete={kind,id:p.id,label:p.title||p.name,screen:navContext==='favorites'?'favorites':kind};renderApp()}
function confirmationDialog(){
 let title='',body='',action='';
 if(pendingDelete){title='Διαγραφή καταχώρισης;';body='Να διαγραφεί το «'+pendingDelete.label+'»;';action='delete'}
 else if(pendingLock){title='Κλείδωμα συσκευής;';body='Θα χρειαστεί ξανά ο υπάρχων κωδικός. Οι καταχωρίσεις σου διατηρούνται.';action='lock'}
 else if(pendingRestore){title='Επαναφορά αντιγράφου;';body='Θα αντικατασταθούν οι προσωπικές καταχωρίσεις από το επιλεγμένο αντίγραφο. Κράτησε πρώτα ένα νέο αντίγραφο ασφαλείας.';action='restore'}
 else return '';
 return `<div class="wg-delete-overlay"><div class="wg-delete-dialog" role="alertdialog" aria-modal="true" aria-label="${esc(title)}"><h4>${esc(title)}</h4><p>${esc(body)}</p><div class="row-buttons"><button class="wg-button" data-confirm="cancel">Άκυρο</button><button class="wg-button ${action==='delete'?'danger':'primary'}" data-confirm="${action}">${action==='delete'?'Διαγραφή':action==='lock'?'Κλείδωμα':'Επαναφορά'}</button></div></div></div>`;
}
async function confirmAction(action){
 if(action==='cancel'){pendingDelete=null;pendingLock=false;pendingRestore=null;renderApp();return;}
 if(action==='delete'&&pendingDelete){
  const p=pendingDelete,candidate=clone(config);candidate[p.kind]=candidate[p.kind].filter(item=>item.id!==p.id);candidate.favoriteRefs=candidate.favoriteRefs.filter(r=>!(r.kind===p.kind&&r.id===p.id));
  if(!await persist(candidate))return;
  pendingDelete=null;previewScreen=p.screen;activeTab=p.kind;
  selectedProcedure=Math.max(0,Math.min(selectedProcedure,config.procedures.length-1));selectedPolicy=Math.max(0,Math.min(selectedPolicy,config.policies.length-1));selectedContact=Math.max(0,Math.min(selectedContact,config.contacts.length-1));
  renderApp();showToast('Η καταχώριση διαγράφηκε.');return;
 }
 if(action==='lock'&&pendingLock){pendingLock=false;await window.wgForgetDevice();return;}
 if(action==='restore'&&pendingRestore){
  const backup=pendingRestore;saving=true;
  try{await store.restoreBackup(backup);pendingRestore=null;location.reload()}catch(e){storageError=e.message;renderApp()}finally{saving=false}
 }
}
function prepareLegacy(page){
 if(!legacy)return false;
 try{legacy.go(page);legacy.back=legacy.main.querySelector('.head .back');return true}catch(_){return false}
}
function legacyHostMarkup(mode){legacyMode=mode;return '<div class="wg-legacy-host" id="wg-legacy-slot"></div>'}
function openLegacySection(id){
 if(!legacy||!prepareLegacy('home')){previewScreen='section';renderApp();return;}
 const index={faq:3,tools:4,announcements:5}[id],tiles=legacy.main.querySelectorAll('.tile');
 if(index===undefined||!tiles[index]){previewScreen='section';renderApp();return;}
 tiles[index].click();legacy.back=legacy.main.querySelector('.head .back');previewScreen='legacy';renderApp();
}
function fillLegacy(){
 const slot=$('#wg-legacy-slot');if(!slot||!legacy)return;
 const content=legacy.main.querySelector('.screenContent');if(!content)return;
 if(legacyMode==='favorites'&&!content.querySelector('.entry'))return;
 slot.append(content);
}
function legacyPhone(){const title=legacy?.main.querySelector('.head strong')?.textContent||config.cards[selectedCard]?.title||'Work Guide';return frame(header(title).replace('data-screen="home"','data-legacy-back="true"')+'<div class="page-body">'+legacyHostMarkup('section')+'</div>','legacy')}
function favoritesPhone(){
 const entries=config.favoriteRefs.map(ref=>({ref,item:config[ref.kind]?.find(p=>p.id===ref.id)})).filter(x=>x.item),names={procedures:'Διαδικασία',policies:'Αδειες & Bonus',contacts:'Επαφή'};
 const existing=prepareLegacy('favorites')&&legacy.main.querySelector('.screenContent .entry');
 return frame(header('Αγαπημένα')+`<div class="page-body">${entries.map(({ref,item})=>`<button class="proc-row" data-open-favorite-kind="${ref.kind}" data-open-favorite-id="${esc(ref.id)}"><span class="proc-icon">${ico(ref.kind==='contacts'?'user':ref.kind==='policies'?'shield':'clipboard')}</span><span class="proc-row-text"><strong>${esc(item.title||item.name)}</strong><small>${names[ref.kind]}</small></span>${ico('chevron','sm')}</button>`).join('')}${existing?legacyHostMarkup('favorites'):''}${!entries.length&&!existing?'<p class="empty-note">Δεν έχεις προσθέσει ακόμη αγαπημένα.</p>':''}</div>`,'favorites');
}
function profilePhone(){
 const existing=prepareLegacy('profile')&&legacy.main.querySelector('.screenContent');
 return frame(header('Προφίλ')+`<div class="page-body phone-form"><div class="wg-profile-avatar">${ico('user','xl')}</div><h4 class="wg-profile-title">${esc(config.profile.name||'Το προφίλ μου')}</h4><label>Όνομα<input class="field" data-profile-name value="${esc(config.profile.name)}" autocomplete="off" placeholder="Το όνομά σου"></label><button class="wg-button primary full" data-profile-action="save">Αποθήκευση</button><div class="divider"></div><button class="wg-button full" data-profile-action="lock">${ico('lock','sm')} Κλείδωμα αυτής της συσκευής</button><div class="wg-profile-tools"><button class="wg-button full" data-profile-action="backup">Αντίγραφο ασφαλείας</button><button class="wg-button full" data-profile-action="restore">Επαναφορά αντιγράφου</button><button class="wg-button full" data-profile-action="appearance">Εισαγωγή εμφάνισης JSON</button><a class="wg-button full" href="./designer.html" target="_blank" rel="noopener">Άνοιγμα Designer</a>${existing?'<details><summary>Πρόσθετες ρυθμίσεις</summary>'+legacyHostMarkup('profile')+'</details>':''}</div></div>`,'profile');
}
function sectionPhone(){return frame(header(config.cards[selectedCard]?.title||'Work Guide')+'<div class="page-body"><p class="empty-note">Δεν βρέθηκε το περιεχόμενο αυτής της ενότητας.</p></div>','section')}
function renderApp(){
 legacyMode=null;
 const views={home:homePhone,procedures:proceduresPhone,detail:detailPhone,edit:phoneEditor,policies:policiesPhone,'policy-detail':policyPhone,'policy-edit':policyEditor,contacts:contactsPhone,'contact-detail':contactPhone,'contact-edit':contactEditor,favorites:favoritesPhone,profile:profilePhone,legacy:legacyPhone,section:sectionPhone};
 $('#stage').innerHTML=(views[previewScreen]||homePhone)();
 fillLegacy();refreshIcons();
 if(storageError){const error=document.createElement('div');error.className='wg-storage-error';error.setAttribute('role','alert');error.textContent=storageError;$('.phone-scroll')?.prepend(error)}
 if(pendingDelete||pendingLock||pendingRestore)$('[data-confirm="cancel"]')?.focus();
 document.title=previewScreen==='home'?config.app.title:config.app.title+' — '+({'contacts':'Ομάδα','policies':'Αδειες & Bonus','favorites':'Αγαπημένα','profile':'Προφίλ','procedures':'Διαδικασίες'}[previewScreen]||'Οδηγός');
}
function route(screen){previewScreen=screen;navContext=['favorites','profile'].includes(screen)?screen:'home';phoneDraft=null;policyDraft=null;contactDraft=null;pendingDelete=null;pendingLock=false;pendingRestore=null;storageError='';renderApp()}
root.addEventListener('input',e=>{
 const t=e.target;
 if(phoneDraft){if(['title','description'].includes(t.dataset.draft))phoneDraft[t.dataset.draft]=t.value;if(t.dataset.draftStep!==undefined)phoneDraft.steps[Number(t.dataset.draftStep)]=t.value}
 if(policyDraft&&['title','description','content'].includes(t.dataset.policyField))policyDraft[t.dataset.policyField]=t.value;
 if(contactDraft&&['name','phone','role'].includes(t.dataset.contactField))contactDraft[t.dataset.contactField]=t.value;
});
root.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b||b.closest('.wg-legacy-host'))return;
 const stop=()=>{e.preventDefault();e.stopImmediatePropagation()};stop();if(saving)return;
 if(b.dataset.confirm){await confirmAction(b.dataset.confirm);return;}
 if(b.dataset.nav){route(b.dataset.nav);return;}
 if(b.dataset.screen){route(b.dataset.screen);return;}
 if(b.dataset.legacyBack){if(legacy?.back)legacy.back.click();if(legacy?.main.querySelector('.hero'))route('home');else{previewScreen='legacy';renderApp()}return;}
 if(b.dataset.selectCard!==undefined){selectedCard=Number(b.dataset.selectCard);const id=config.cards[selectedCard]?.id;navContext='home';if(id==='procedures')route('procedures');else if(id==='policies')route('policies');else if(id==='team')route('contacts');else openLegacySection(id);return;}
 if(b.dataset.selectProc!==undefined){selectedProcedure=Number(b.dataset.selectProc);previewScreen='detail';renderApp();return;}
 if(b.dataset.selectPolicy!==undefined){selectedPolicy=Number(b.dataset.selectPolicy);previewScreen='policy-detail';renderApp();return;}
 if(b.dataset.selectContact!==undefined){selectedContact=Number(b.dataset.selectContact);previewScreen='contact-detail';renderApp();return;}
 if(b.dataset.openFavoriteKind){const kind=b.dataset.openFavoriteKind;if(!['procedures','policies','contacts'].includes(kind))return;const i=config[kind].findIndex(p=>p.id===b.dataset.openFavoriteId);if(i<0)return;navContext='favorites';if(kind==='procedures'){selectedProcedure=i;previewScreen='detail'}else if(kind==='policies'){selectedPolicy=i;previewScreen='policy-detail'}else{selectedContact=i;previewScreen='contact-detail'}renderApp();return;}
 if(b.dataset.favoriteKind){const kind=b.dataset.favoriteKind,id=b.dataset.favoriteId;if(!['procedures','policies','contacts'].includes(kind)||!config[kind].some(p=>p.id===id))return;const candidate=clone(config),i=candidate.favoriteRefs.findIndex(r=>r.kind===kind&&r.id===id);if(i<0)candidate.favoriteRefs.push({kind,id});else candidate.favoriteRefs.splice(i,1);if(await persist(candidate))renderApp();return;}
 if(b.dataset.action==='add-proc'){phoneDraft={id:null,title:'',description:'',steps:['']};phoneError='';previewScreen='edit';renderApp();return;}
 const proc=config.procedures[selectedProcedure];
 if(b.dataset.phoneAction){const a=b.dataset.phoneAction;
  if(a==='edit'&&proc){phoneDraft=clone(proc);phoneError='';previewScreen='edit';renderApp()}
  if(a==='delete'&&proc)requestDelete('procedures',selectedProcedure);
  if(a==='step'&&phoneDraft){phoneDraft.steps.push('');renderApp()}
  if(a==='cancel'){previewScreen=phoneDraft?.id?'detail':'procedures';phoneDraft=null;renderApp()}
  if(a==='save'&&phoneDraft){const title=phoneDraft.title.trim(),steps=phoneDraft.steps.map(s=>s.trim()).filter(Boolean);if(!title||!steps.length){phoneError='Συμπλήρωσε τίτλο και τουλάχιστον ένα βήμα.';renderApp();return;}const candidate=clone(config),item={...phoneDraft,id:phoneDraft.id||newRecordId(),title,description:phoneDraft.description.trim(),steps};const i=candidate.procedures.findIndex(p=>p.id===item.id);if(i<0)candidate.procedures.push(item);else candidate.procedures[i]=item;if(await persist(candidate)){selectedProcedure=config.procedures.findIndex(p=>p.id===item.id);phoneDraft=null;previewScreen='detail';renderApp()}}
  return;
 }
 for(const [name,direction]of [['phoneUp',-1],['phoneDown',1],['phoneRemove',0]])if(b.dataset[name]!==undefined&&phoneDraft){const i=Number(b.dataset[name]);if(direction)move(phoneDraft.steps,i,direction);else if(phoneDraft.steps.length>1)phoneDraft.steps.splice(i,1);renderApp();return;}
 if(b.dataset.policyAction){const a=b.dataset.policyAction,p=config.policies[selectedPolicy];
  if(a==='new')startPolicy();
  if(a==='edit'&&p){policyDraft=clone(p);policyError='';previewScreen='policy-edit';renderApp()}
  if(a==='cancel'){previewScreen=policyDraft?.id?'policy-detail':'policies';policyDraft=null;renderApp()}
  if(a==='delete'&&p)requestDelete('policies',selectedPolicy);
  if(a==='save'&&policyDraft){const title=policyDraft.title.trim(),content=policyDraft.content.trim();if(!title||!content){policyError='Συμπλήρωσε τίτλο και περιεχόμενο.';renderApp();return;}const candidate=clone(config),item={...policyDraft,id:policyDraft.id||newRecordId(),title,description:policyDraft.description.trim(),content};const i=candidate.policies.findIndex(p=>p.id===item.id);if(i<0)candidate.policies.push(item);else candidate.policies[i]=item;if(await persist(candidate)){selectedPolicy=config.policies.findIndex(p=>p.id===item.id);policyDraft=null;previewScreen='policy-detail';renderApp()}}
  return;
 }
 if(b.dataset.contactAction){const a=b.dataset.contactAction,c=config.contacts[selectedContact];
  if(a==='new')startContact();
  if(a==='edit'&&c){contactDraft=clone(c);contactError='';previewScreen='contact-edit';renderApp()}
  if(a==='cancel'){previewScreen=contactDraft?.id?'contact-detail':'contacts';contactDraft=null;renderApp()}
  if(a==='delete'&&c)requestDelete('contacts',selectedContact);
  if(a==='save'&&contactDraft){const name=contactDraft.name.trim(),phone=contactDraft.phone.trim();if(!name||!phone){contactError='Συμπλήρωσε όνομα και τηλέφωνο.';renderApp();return;}if(!/^\+?[0-9]{3,20}$/.test(phone.replace(/[()\s.\-]/g,''))){contactError='Γράψε έναν έγκυρο αριθμό τηλεφώνου.';renderApp();return;}const candidate=clone(config),item={...contactDraft,id:contactDraft.id||newRecordId(),name,phone,role:contactDraft.role.trim()};const i=candidate.contacts.findIndex(c=>c.id===item.id);if(i<0)candidate.contacts.push(item);else candidate.contacts[i]=item;if(await persist(candidate)){selectedContact=config.contacts.findIndex(c=>c.id===item.id);contactDraft=null;previewScreen='contact-detail';renderApp()}}
  return;
 }
 if(b.dataset.profileAction){const action=b.dataset.profileAction;
  if(action==='save'){const candidate=clone(config);candidate.profile.name=$('[data-profile-name]').value.trim();if(await persist(candidate)){renderApp();showToast('Το προφίλ αποθηκεύτηκε.')}}
  if(action==='lock'){pendingLock=true;renderApp()}
  if(action==='backup'){try{download('WorkGuide_Encrypted_Backup_'+new Date().toISOString().slice(0,10)+'.json',await store.exportBackup())}catch(error){storageError=error.message;renderApp()}}
  if(action==='restore')$('#backup-file').click();
  if(action==='appearance')$('#appearance-file').click();
 }
},true);
root.addEventListener('click',e=>{if(!e.target.closest('.wg-legacy-host')||!e.target.closest('button,a'))return;queueMicrotask(()=>{legacy.back=legacy.main.querySelector('.head .back');previewScreen=legacy.main.querySelector('.hero')?'home':'legacy';renderApp()})});
root.addEventListener('keydown',e=>{if(e.key==='Escape'&&(pendingDelete||pendingLock||pendingRestore)){e.preventDefault();confirmAction('cancel')}});
$('#appearance-file').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;
 try{if(file.size>1000000)throw Error('Το αρχείο είναι πολύ μεγάλο.');const appearance=appearanceOnly(loadConfig(JSON.parse(await file.text()))),candidate={...config,...appearance};if(await persist(candidate)){renderApp();showToast('Η εμφάνιση ενημερώθηκε.')}}catch(error){storageError=error.message;renderApp()}e.target.value='';
});
$('#backup-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>25000000)throw Error('Το αρχείο είναι πολύ μεγάλο.');const backup=JSON.parse(await file.text());if(backup.format!=='workguide-encrypted-backup-v1')throw Error('Δεν είναι αντίγραφο ασφαλείας Work Guide.');pendingRestore=backup;renderApp()}catch(error){storageError=error.message;renderApp()}e.target.value=''});
try{
 await store.ready;
 let appearance={};try{const response=await fetch('./ui-settings.json');if(response.ok)appearance=appearanceOnly(loadConfig(await response.json()))}catch(_){}
 const saved=store.snapshot();
 if(saved.extras.appearance)appearance=appearanceOnly(loadConfig(saved.extras.appearance));
 config={...defaultSettings,...appearance,procedures:saved.procedures,policies:saved.extras.policies,contacts:saved.extras.contacts,favoriteRefs:saved.extras.favoriteRefs,profile:saved.extras.profile};
 for(const el of Array.from(document.body.children))if(!['SCRIPT','LINK','STYLE'].includes(el.tagName)){el.style.display='none';el.setAttribute('aria-hidden','true')}
 document.body.append(root);document.body.classList.add('wg-v6-mounted');
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',config.app.purple);
 renderApp();
}catch(error){
 root.innerHTML='<main class="wg-storage-error" role="alert"><h1>Δεν φορτώθηκαν τα προσωπικά δεδομένα</h1><p></p><p>Δεν αντικαταστάθηκε κανένα αποθηκευμένο αρχείο.</p><a href="./backup.html">Αντίγραφο ασφαλείας</a> · <button onclick="location.reload()">Δοκίμασε ξανά</button></main>';
 root.querySelector('p').textContent=error.message;document.body.append(root);document.body.classList.add('wg-v6-mounted');
}

})();
