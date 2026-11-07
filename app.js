'use strict';
// Hoy — app personal diaria. Datos solo en este navegador (localStorage + IndexedDB para audios).
const TZ='America/Santiago';
const ymd=d=>new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
const today=()=>ymd(new Date());
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const dow=s=>new Date(s+'T12:00:00Z').getUTCDay();
const fmt=s=>new Intl.DateTimeFormat('es-CL',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long'}).format(new Date(s+'T12:00:00Z'));
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const dayKey=d=>'hoy:dia:'+d, menuKey=d=>'hoy:menu:'+d;

// ---------- Peso: registros locales, sin estimaciones ----------
const WEIGHT_KEY='hoy:peso';
const kgFmt=n=>n.toFixed(1).replace('.',',');
const validWeightDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
function weightRecords(){
 const stored=load(WEIGHT_KEY,[]);
 const records=Array.isArray(stored)?stored.filter(r=>r&&validWeightDate(r.date)&&Number.isFinite(r.kg)&&r.kg>0):[];
 if(!records.length){records.push({date:'2026-11-07',kg:88.9});save(WEIGHT_KEY,records)}
 return records.sort((a,b)=>b.date.localeCompare(a.date));
}
function weightGap(kg){
 if(kg>81)return `Te faltan ${kgFmt(kg-81)} kg para entrar al rango`;
 if(kg<79)return `Estás ${kgFmt(79-kg)} kg por debajo del rango`;
 return 'Estás en el rango meta';
}
const weightDate=s=>s.split('-').reverse().join('/');
function weightCard(){
 const records=weightRecords(),latest=records[0];
 return `<section class="card weight-card" aria-labelledby="weight-title"><h2 id="weight-title">Peso</h2>
 <p class="muted">Peso actual · ${weightDate(latest.date)}</p><p class="weight-current"><strong>${kgFmt(latest.kg)}</strong> kg</p>
 <p>Meta: <strong>79–81 kg</strong></p><p>${weightGap(latest.kg)}</p>
 <form id="weight-form"><div class="grid2"><label>Peso (kg)<input id="weight-kg" name="kg" type="text" inputmode="decimal" placeholder="88,9" pattern="[0-9]+([.,][0-9]+)?" required></label>
 <label>Fecha<input id="weight-date" name="date" type="date" value="${today()}" required></label></div>
 <button class="prim" type="submit">Anotar</button><p class="muted">Si anotas la misma fecha, reemplaza el registro.</p></form>
 <h3>Registros recientes</h3><ul class="weight-records">${records.slice(0,10).map(r=>`<li><time datetime="${r.date}">${weightDate(r.date)}</time><strong>${kgFmt(r.kg)} kg</strong></li>`).join('')}</ul>
 <p class="muted">Datos guardados solo en este navegador.</p></section>`;
}

// ---------- Entrenamiento: semana 1 de retorno ----------
const ENTRADA='Entrada: 4–5 min de bicicleta fácil.';
const W={
 'Acondicionamiento':{
  1:{p:['Air squats 2×8','Ring rows 2×6'],c:'10–12 min de bicicleta fácil, continuo'},
  2:{p:['Peso muerto liviano 2×6','Press de hombros 2×6–8'],c:'10–12 min de remo suave'},
  3:{p:['3 rondas sin competir: 1 min remo + 6 air squats + 6 ring rows','Descanso 60–90 s entre rondas'],c:'10 min de remo o bicicleta fácil (alternar 1 min si tienes ambos)'}},
 'Hipertrofia':{
  1:{p:['Goblet squat 2×8–10','Peso rumano (RDL) 2×8–10'],x:['Ring rows 2×8–12','Flexiones 2×5–8'],c:'8–10 min de bicicleta fácil'},
  2:{p:['Peso rumano (RDL) 2×8–10','Press de hombros 2×8–10'],x:['Remo con mancuerna 2×10–12','Puente de glúteo 2×10–12'],c:'8–10 min de remo o bicicleta fácil'},
  3:{p:['Goblet squat 2×8–10','Press de banca 2×8–12'],x:['Remo con mancuerna 2×10–12','Sit-ups 2×8'],c:'8–10 min de remo o bicicleta fácil'}},
 'Calistenia':{
  1:{p:['Air squat 2×8–12','Ring rows 2×6–10'],x:['Flexiones 2×5–8','Puente de glúteo 2×10–12','Plancha 2×15–20 s'],c:'8–10 min de bicicleta fácil'},
  2:{p:['Puente de glúteo 2×10–12','Flexiones 2×5–8'],x:['Ring rows 2×6–10','Plancha 2×15–20 s'],c:'8–10 min de remo o bicicleta fácil'},
  3:{p:['Air squat 2×8–12','Dominadas asistidas 2×5–8 (o ring rows)'],x:['Flexiones 2×5–8','Sit-ups 2×8'],c:'8–10 min de remo o bicicleta fácil'}},
 'CrossFit de retorno':{
  1:{p:['Front squat 2×5 cómodos','Squat snatch con barra vacía o muy liviana 2×5'],x:['Ring rows 2×6'],c:'10–12 min de bicicleta fácil'},
  2:{p:['Peso muerto liviano 2×5','Push press liviano 2×5'],c:'10–12 min de remo suave o trote suave'},
  3:{p:['Sentadilla con pausa abajo 2×5, liviana','Hang clean liviano 2×3'],x:['Ring rows 2×6'],c:'10 min de remo o bicicleta fácil'}},
 'Trote':{
  1:{run:'12–20 min de trote suave (ritmo en que puedas hablar)',x:['Al terminar: air squats 2×8']},
  2:{run:'12–20 min de trote suave (o tramos de caminata y trote)'},
  3:{run:'12–20 min de trote suave, o 10 min de trote + 5 min de caminata'}},
 'Mixto':{
  1:{p:['Goblet squat 2×8','Ring rows 2×8'],c:'10 min de bicicleta fácil'},
  2:{p:['Peso rumano (RDL) 2×8','Press de hombros 2×8'],c:'10 min de remo o trote suave'},
  3:{p:['Air squat 2×8–10','Ring rows 2×6–8'],c:'10 min de remo o bicicleta fácil'}}
};
const RAMAS=Object.keys(W), TIEMPOS=['15–20 min','25–35 min','40+ min'];
// Lun=d1, Mié=d2, Vie=d3; Mar→d1, Jue→d2, Sáb/Dom→d3
const tplDay=s=>({0:3,1:1,2:1,3:2,4:2,5:3,6:3})[dow(s)];
function sesion(rama,dia,tiempo){
 const t=W[rama][dia]; let h='';
 const corta=tiempo===TIEMPOS[0], larga=tiempo===TIEMPOS[2];
 if(t.run){
  h+=`<ul><li>${t.run}${larga?' — si te sientes bien, 2–3 min extra fáciles':''}</li>${!corta&&t.x?t.x.map(e=>`<li>${e}</li>`).join(''):''}</ul>`;
  if(corta)h+=`<p class="muted">Versión corta: quédate en el extremo bajo del tiempo.</p>`;
 }else{
  const items=corta?t.p:[...t.p,...(t.x||[])];
  h+=`<p class="muted">${ENTRADA}</p><ul>${items.map(e=>`<li>${e}</li>`).join('')}</ul>`;
  if(corta)h+=`<p class="muted">Versión 15–20: preparación + 2 patrones principales. Se recorta el final, no el descanso.</p>`;
  h+=`<div class="cardio"><b>Cardio</b><br>${corta?'5–6 min fáciles':t.c}${larga?' + 2–3 min extra fáciles':''}</div>`;
 }
 h+=`<p class="muted">Carga: la de hoy, con 3–4 repeticiones en reserva. Técnica olímpica con barra vacía o liviana. Ritmo de cardio: que puedas hablar.</p>`;
 return h;
}

// ---------- Comida ----------
let FOODS=[];
const custom=()=>load('hoy:alimentos',[]);
const allFoods=()=>[...FOODS,...custom()];
const macrosOf=(f,q)=>{const r=f.g/100*q;return{p:f.p*r,c:f.c*r,f:f.f*r,k:f.k*r}};
const COMIDAS=['Desayuno','Almuerzo','Cena','Snacks'];
function totals(d){
 const m=load(menuKey(d),{}),t={p:0,c:0,f:0,k:0};
 [...COMIDAS,'Extras'].forEach(b=>(m[b]||[]).forEach(it=>{const f=allFoods().find(x=>x.id===it.id);if(f){const x=macrosOf(f,it.q);for(const k in t)t[k]+=x[k]}}));
 return t;
}
function resumen(d){
 const t=totals(d),g=load('hoy:metas',{}),lab={p:'Proteína',c:'Carbos',f:'Grasas',k:'kcal'};
 let h=`<div class="macros">${['p','c','f','k'].map(k=>`<div><b>${Math.round(t[k])}</b>${lab[k]}${k!=='k'?' g':''}</div>`).join('')}</div>`;
 const set=['p','c','f','k'].filter(k=>g[k]>0);
 if(!set.length)h+=`<p class="muted">Aún no hay metas definidas. Ponlas en Comida → «Tus metas».</p>`;
 else h+='<ul>'+set.map(k=>{const diff=t[k]-g[k];return `<li>${lab[k]}: ${diff>=0?`<span class="ok">alcanza</span> (+${Math.round(diff)})`:`<span class="falta">falta ${Math.round(-diff)}${k!=='k'?' g':''}</span>`} de ${g[k]}</li>`}).join('')+'</ul>';
 return h;
}

// ---------- Estudio / Espiritual ----------
const CALC={t:'Deriva f(x) = 3x² · sen(x) y evalúa f′(π/2).',h:'Pista: regla del producto, (uv)′ = u′v + uv′.'};
const VERSO={ref:'Génesis 1:1',txt:'En el principio crió Dios los cielos y la tierra.',ver:'Reina-Valera 1909 (dominio público)'};

// IndexedDB audios
const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open('hoy',1);r.onupgradeneeded=()=>r.result.createObjectStore('audios');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const putAudio=async(k,b)=>{const db=await idb();return new Promise(r=>{const tx=db.transaction('audios','readwrite');tx.objectStore('audios').put(b,k);tx.oncomplete=r})};
const getAudio=async k=>{const db=await idb();return new Promise(r=>{const q=db.transaction('audios').objectStore('audios').get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)})};

// ---------- Vistas ----------
const D=today();
let tab='hoy';
function dia(){return load(dayKey(D),{})}
function setDia(p){save(dayKey(D),{...dia(),...p});render()}
const opts=(list,cur,attr)=>list.map(x=>`<button class="${x===cur?'on':''}" data-${attr}="${esc(x)}">${esc(x)}</button>`).join('');

function vHoy(){
 const s=dia(),dd=tplDay(D);
 let h=`${weightCard()}<section class="card"><h2>Ánimo</h2><div class="row">${opts(['Bien','Normal','Cansado','Bajo'],s.animo,'animo')}</div></section>
 <section class="card"><h2>Recuperación (Whoop, manual)</h2><div class="row">
 ${[['Verde','g'],['Amarillo','y'],['Rojo','r']].map(([n,c])=>`<button class="${c} ${s.rec===n?'on':''}" data-rec="${n}">${n}</button>`).join('')}</div>
 ${s.rec==='Rojo'?'<p class="muted">Recuperación en rojo: considera la versión corta o solo cardio fácil. Tú decides.</p>':''}</section>
 <section class="card"><h2>Entrenamiento</h2><p class="muted">¿Vas a entrenar?</p><div class="row">${opts(['Sí','No'],s.entrena,'entrena')}</div>`;
 if(s.entrena==='Sí'){
  h+=`<h3>Rama</h3><div class="row">${opts(RAMAS,s.rama,'rama')}</div><h3>Tiempo</h3><div class="row">${opts(TIEMPOS,s.tiempo,'tiempo')}</div>`;
  if(s.rama&&s.tiempo)h+=`<h3>${esc(s.rama)} · Día ${dd} · ${esc(s.tiempo)}</h3>${dow(D)===0?'<p class="muted">Es domingo: se sugiere descanso, pero tú decides.</p>':''}${sesion(s.rama,dd,s.tiempo)}
   <div class="row"><button class="${s.hecho?'on':''}" data-hecho>${s.hecho?'Sesión hecha ✓':'Marcar sesión hecha'}</button></div>
   ${s.hecho?`<h3>Registro para Charles</h3>${recUI('entreno:'+D,'Cuéntale cómo salió el entreno: qué hiciste, cómo te sentiste, si algo dolió o quedó corto.')}<p class="muted">Queda en este teléfono. Envíamelo en este chat y se lo paso a Charles.</p>`:''}`;
 }
 h+=`<p class="muted">Semana 1 de retorno</p></section>
 <section class="card"><h2>Macros de hoy</h2>${resumen(D)}
  <h3>Extra de hoy</h3>${pickerHTML('Extras')}${listaHTML(D,'Extras')}</section>
 <section class="card"><h2>Estudio</h2><p>${CALC.t}</p><button data-go="estudiar">Desarrollar</button> ${s.calc?`<span class="muted">· ${s.calc}</span>`:''}</section>
 <section class="card"><h2>Espiritual</h2><p class="verse">«${VERSO.txt}»</p><p class="muted">${VERSO.ref} · ${VERSO.ver}</p><button data-go="espiritual">Grabar mi reflexión</button></section>`;
 return h;
}
function pickerHTML(b){
 return `<div class="row"><select data-sel="${b}"><option value="">Elegir alimento…</option>${allFoods().map(f=>`<option value="${f.id}">${esc(f.n)} — ${esc(f.u)}</option>`).join('')}</select>
 <input type="number" inputmode="decimal" min="0.25" step="0.25" value="1" data-qty="${b}" style="width:90px" aria-label="porciones"><button class="sm prim" data-add="${b}">Agregar</button></div>`;
}
function listaHTML(d,b){
 const m=load(menuKey(d),{});return (m[b]||[]).map((it,i)=>{const f=allFoods().find(x=>x.id===it.id);if(!f)return '';const x=macrosOf(f,it.q);
  return `<div class="item"><span>${it.q}× ${esc(f.n)}<br><span class="muted">P ${x.p.toFixed(1)} · C ${x.c.toFixed(1)} · G ${x.f.toFixed(1)} · ${Math.round(x.k)} kcal</span></span><button class="sm" data-del="${b}:${i}">✕</button></div>`}).join('');
}
function menuTarget(){return load('hoy:menuFecha',null)||addDays(D,1)}
function vComida(){
 const T=menuTarget(),g=load('hoy:metas',{});
 let h=`<section class="card"><h2>${T===addDays(D,1)?'Menú para mañana':'Menú para '+fmt(T)}</h2><p class="accent">${fmt(T)}</p>
 <div class="row"><button class="sm" data-mf="-1">◀ día</button><button class="sm" data-mf="0">Mañana</button><button class="sm" data-mf="1">día ▶</button></div></section>`;
 COMIDAS.forEach(b=>h+=`<section class="card"><h2>${b}</h2>${pickerHTML(b)}${listaHTML(T,b)}</section>`);
 h+=`<section class="card"><h2>Total del día vs metas</h2>${resumen(T)}</section>
 <section class="card"><h2>Tus metas</h2><p class="muted">Escribe tus propias metas diarias. La app no las inventa.</p><div class="grid2">
 ${[['p','Proteína (g)'],['c','Carbos (g)'],['f','Grasas (g)'],['k','kcal (opcional)']].map(([k,l])=>`<label>${l}<input type="number" inputmode="decimal" data-meta="${k}" value="${g[k]??''}" placeholder="tu meta"></label>`).join('')}</div></section>
 <section class="card"><h2>Crear alimento propio</h2><p class="muted">Valores por porción, escritos por ti.</p>
 <input id="cn" placeholder="Nombre (ej. queque de la casa)"><div class="grid2" style="margin-top:8px"><input id="cu" placeholder="Porción (ej. 1 trozo)"><input id="ck" type="number" inputmode="decimal" placeholder="kcal"><input id="cp" type="number" inputmode="decimal" placeholder="Proteína g"><input id="cc" type="number" inputmode="decimal" placeholder="Carbos g"><input id="cf" type="number" inputmode="decimal" placeholder="Grasas g"><button class="prim" data-crear>Guardar</button></div></section>
 <p class="muted">Macros del catálogo: USDA FoodData Central (SR Legacy). Porciones aproximadas.</p>`;
 return h;
}
function vEntrenar(){
 const dd=tplDay(D);let h=`<section class="card"><h2>Semana 1 de retorno</h2><p class="muted">Una rama por sesión. Lun = Día 1 · Mié = Día 2 · Vie = Día 3. Hoy corresponde Día ${dd}. Sesión estándar 25–35 min.</p></section>`;
 RAMAS.forEach(r=>{h+=`<section class="card"><h2>${r}</h2>`;[1,2,3].forEach(d=>h+=`<h3>Día ${d}</h3>${sesion(r,d,TIEMPOS[1])}`);h+='</section>'});
 return h;
}
function vEstudiar(){
 const s=dia();
 return `<section class="card"><h2>Cálculo</h2><p class="muted">Ejemplo mientras conectamos tu nivel.</p><p class="serif">${CALC.t}</p><p class="muted">${CALC.h}</p>
 <textarea id="calcTxt" placeholder="Desarrolla aquí paso a paso…">${esc(s.calcTxt||'')}</textarea>
 <div class="row" style="margin-top:8px"><button class="${s.calc==='Hecho'?'on':''}" data-calc="Hecho">Hecho</button><button class="${s.calc==='Después'?'on':''}" data-calc="Después">Después</button></div></section>`;
}
function vEspiritual(){
 return `<section class="card"><h2>Lectura seguida</h2><p class="verse">«${VERSO.txt}»</p><p class="muted">${VERSO.ref} · ${VERSO.ver}</p>
 <p class="muted">Punto de partida provisorio: más adelante fijamos dónde vas en tu lectura.</p></section>
 <section class="card"><h2>Tu audio de hoy</h2>
 ${recUI(D,'Qué sientes y cómo razonas este verso.')}</section>`;
}
function recUI(key,hint){
 return `<p class="muted">${hint}</p>
 <div class="row"><button class="prim" data-rec-key="${esc(key)}">● Grabar</button><button data-stop-key="${esc(key)}" disabled>■ Detener</button></div>
 <p class="muted" data-recst="${esc(key)}"></p><div data-aud="${esc(key)}"></div>`;
}
function audioName(key,type){
 const ext=(type||'').includes('mp4')?'m4a':(type||'').includes('mpeg')?'mp3':'webm';
 return (String(key).startsWith('entreno:')?'entreno-':'reflexion-')+D+'.'+ext;
}
async function showAudio(key){
 const b=await getAudio(key),el=document.querySelector(`[data-aud="${CSS.escape(key)}"]`);
 if(!el||!b)return;
 const url=URL.createObjectURL(b),name=audioName(key,b.type);
 el.innerHTML=`<audio controls src="${url}"></audio><p class="muted">Guardado para ${fmt(D)}.</p>
  <div class="row"><a class="btn" download="${esc(name)}" href="${url}">Descargar</a>${navigator.share?`<button data-share-key="${esc(key)}">Compartir</button>`:''}</div>`;
}
let mr=null;
function render(){
 $('#fecha').textContent=fmt(D);
 document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));
 $('#view').innerHTML={hoy:vHoy,comida:vComida,entrenar:vEntrenar,estudiar:vEstudiar,espiritual:vEspiritual}[tab]();
 if(tab==='espiritual')showAudio(D);
 if(tab==='hoy'&&dia().hecho)showAudio('entreno:'+D);
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.t){tab=d.t;render();scrollTo(0,0);return}
 if(d.go){tab=d.go;render();scrollTo(0,0);return}
 if(d.animo)return setDia({animo:d.animo});
 if(d.rec)return setDia({rec:d.rec});
 if(d.entrena)return setDia({entrena:d.entrena});
 if(d.rama)return setDia({rama:d.rama});
 if(d.tiempo)return setDia({tiempo:d.tiempo});
 if('hecho' in d)return setDia({hecho:!dia().hecho});
 if(d.calc)return setDia({calc:d.calc,calcTxt:$('#calcTxt').value});
 if(d.mf!==undefined){const n=+d.mf;save('hoy:menuFecha',n===0?null:addDays(menuTarget(),n));return render()}
 if(d.add){const blk=d.add,id=document.querySelector(`[data-sel="${blk}"]`).value,q=parseFloat(document.querySelector(`[data-qty="${blk}"]`).value)||1;if(!id)return;
  const T=blk==='Extras'?D:menuTarget(),m=load(menuKey(T),{});(m[blk]=m[blk]||[]).push({id,q});save(menuKey(T),m);return render()}
 if(d.del){const[blk,i]=d.del.split(':'),T=blk==='Extras'?D:menuTarget(),m=load(menuKey(T),{});m[blk].splice(+i,1);save(menuKey(T),m);return render()}
 if('crear' in d){const v=id=>$(id).value.trim(),n=parseFloat;if(!v('#cn'))return alert('Ponle un nombre');
  // guardado como "por porción": g=100 para que macrosOf use los valores tal cual
  const c=custom();c.push({id:'u'+Date.now(),n:v('#cn'),u:v('#cu')||'1 porción',g:100,p:n(v('#cp'))||0,c:n(v('#cc'))||0,f:n(v('#cf'))||0,k:n(v('#ck'))||0,propio:1});save('hoy:alimentos',c);return render()}
 if(d.recKey){const key=d.recKey,stEl=document.querySelector(`[data-recst="${CSS.escape(key)}"]`);
  try{const st=await navigator.mediaDevices.getUserMedia({audio:true});const ch=[];mr=new MediaRecorder(st);mr.ondataavailable=ev=>ch.push(ev.data);
   mr.onstop=async()=>{st.getTracks().forEach(t=>t.stop());await putAudio(key,new Blob(ch,{type:mr.mimeType||'audio/mp4'}));if(stEl)stEl.textContent='';showAudio(key)};
   mr.start();b.disabled=true;const stopBtn=document.querySelector(`[data-stop-key="${CSS.escape(key)}"]`);if(stopBtn)stopBtn.disabled=false;if(stEl)stEl.textContent='Grabando…'}
  catch(err){if(stEl)stEl.textContent='No se pudo usar el micrófono: '+err.message}}
 if(d.stopKey&&mr){mr.stop();b.disabled=true;const recBtn=document.querySelector(`[data-rec-key="${CSS.escape(d.stopKey)}"]`);if(recBtn)recBtn.disabled=false}
 if(d.shareKey){const blob=await getAudio(d.shareKey);if(!blob)return;
  const file=new File([blob],audioName(d.shareKey,blob.type),{type:blob.type||'audio/webm'});
  try{if(navigator.canShare&&!navigator.canShare({files:[file]}))throw new Error('Este dispositivo no puede compartir el archivo');
   await navigator.share({files:[file],title:file.name})}catch(err){if(err.name!=='AbortError')alert('No se pudo compartir: '+err.message)}}
});
document.addEventListener('submit',e=>{
 if(e.target.id!=='weight-form')return;
 e.preventDefault();
 const raw=$('#weight-kg').value.trim(),date=$('#weight-date').value,kg=Number(raw.replace(',','.'));
 if(!/^[0-9]+([.,][0-9]+)?$/.test(raw)||!Number.isFinite(kg)||kg<=0||!validWeightDate(date))return alert('Escribe un peso válido mayor que cero y una fecha válida.');
 const records=weightRecords().filter(r=>r.date!==date);
 records.push({date,kg});
 try{save(WEIGHT_KEY,records)}catch{return alert('No se pudo guardar el peso en este navegador.');}
 render();
});
document.addEventListener('change',e=>{const k=e.target.dataset.meta;if(k){const g=load('hoy:metas',{});const v=parseFloat(e.target.value);if(v>0)g[k]=v;else delete g[k];save('hoy:metas',g);render()}});
document.addEventListener('input',e=>{if(e.target.id==='calcTxt')save(dayKey(D),{...dia(),calcTxt:e.target.value})});
fetch('./foods.json').then(r=>r.json()).then(f=>{FOODS=f;render()}).catch(()=>render());
render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js');
