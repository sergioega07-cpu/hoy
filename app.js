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
 return `<section class="card weight-card" aria-labelledby="weight-title"><p class="kicker" id="weight-title">Peso</p>
 <p class="muted">Actual · ${weightDate(latest.date)}</p>
 <p class="weight-current"><strong>${kgFmt(latest.kg)}</strong><span> kg</span></p>
 <p class="weight-meta">Meta 79–81 kg · ${weightGap(latest.kg)}</p>
 <form id="weight-form"><div class="grid2"><label><span class="kicker">Peso (kg)</span><input id="weight-kg" name="kg" type="text" inputmode="decimal" placeholder="88,9" pattern="[0-9]+([.,][0-9]+)?" required></label>
 <label><span class="kicker">Fecha</span><input id="weight-date" name="date" type="date" value="${today()}" required></label></div>
 <button class="prim" type="submit">Anotar</button><p class="muted">Si anotas la misma fecha, reemplaza el registro.</p></form>
 <p class="kicker">Registros recientes</p><ul class="weight-records">${records.slice(0,10).map(r=>`<li><time datetime="${r.date}">${weightDate(r.date)}</time><strong>${kgFmt(r.kg)} kg</strong></li>`).join('')}</ul>
 <p class="muted">Datos guardados solo en este navegador.</p></section>`;
}

// ---------- Entrenamiento: una elección, una sesión; dosis de retorno propuestas ----------
const TIPOS=['Hipertrofia','CrossFit de retorno','Trote / 2400 m','Híbrido'];
const FUENTES={hss:'https://www.hss.edu/health-library/move-better/static-dynamic-stretching',afmc:'https://www.afmc.af.mil/News/Article-Display/Article/2664126/improving-run-times-for-the-pt-test/',smith:'https://www.military.com/military-fitness/fitness-test-prep/improving-your-pft-run-time'};
function trainingChoice(s){
 const legacy={Mixto:'Híbrido',Trote:'Trote / 2400 m',Acondicionamiento:'Híbrido',Calistenia:'CrossFit de retorno'};
 return {...s,rama:TIPOS.includes(s.rama)?s.rama:(legacy[s.rama]||''),minutosTotal:s.minutosTotal??'',minutosHechos:s.minutosHechos??0,cardioHecho:s.cardioHecho??0};
}
function trainingBase(tipo,date){
 const day=dow(date),legs=day===3||day===6,chest=day===1||day===4;
 const pattern=legs?'piernas':chest?'pecho / tríceps':'espalda / bíceps';
 const base={dynamic:'Balanceos de piernas y estocadas caminando, controlados; movilidad suave de tobillos y cadera.',warm:'Marcha o trote fácil',specific:'Ensaya sentadilla y bisagra sin carga, sin fatiga.',static:'Cuádriceps e isquios, sin dolor.',blocks:[]};
 if(tipo==='Hipertrofia'){
  base.name=pattern; base.source='Hipertrofia ID47 · '+pattern;
  base.warm=legs?'Bicicleta fácil':'Remo suave';
  base.dynamic=legs?base.dynamic:'Movilidad dinámica de hombros y codos, giros suaves de torso; sin sostener al límite.';
  base.specific=legs?'Ensaya sentadilla sin carga y bisagra; una aproximación liviana antes de la barra.':'Ensaya el press o remo del día con carga muy liviana, sin fatiga.';
  base.static=legs?base.static:'Hombro posterior y brazos, suave y sin dolor.';
  base.blocks=legs?[
   {name:'Sentadilla con barra',source:base.source,purpose:'Conservar el patrón principal de piernas',items:['2×6–8; baja con control'],min:6,max:8},
   {name:'Estocadas con mancuernas',source:base.source,purpose:'Control unilateral',items:['1×6 por lado'],min:4,max:4},
   {name:'Peso muerto con barra',source:base.source,purpose:'Bisagra; accesorio que se retira primero',items:['1×6 liviano; omitir si la técnica se pierde'],min:4,max:4}
  ]:chest?[
   {name:'Press inclinado con barra',source:base.source,purpose:'Empuje principal',items:['2×6–8'],min:6,max:8},
   {name:'Extensión de tríceps en polea',source:base.source,purpose:'Complemento de empuje',items:['1–2×8–10'],min:4,max:5},
   {name:'Aperturas con mancuernas en banco',source:base.source,purpose:'Accesorio; no hacer fondos al fallo',items:['1×8–10 en rango cómodo'],min:4,max:4}
  ]:[
   {name:'Remo con barra',source:base.source,purpose:'Tracción principal',items:['2×6–8'],min:6,max:8},
   {name:'Jalón al pecho',source:base.source,purpose:'Tracción vertical',items:['1–2×8–10'],min:4,max:5},
   {name:'Curl martillo con mancuernas',source:base.source,purpose:'Accesorio de brazos',items:['1×8–10'],min:4,max:4}
  ];
 }else if(tipo==='CrossFit de retorno'){
  base.name='Técnica → fuerza → gimnasia → motor corto';base.source='Semana 10 + Fundamentos ID37';
  base.warm='Bicicleta fácil';
  base.dynamic+=' Movilidad suave de hombros y muñecas para barra y anillas.';
  base.specific='Complejo de barra vacía, Semana 10: snatch-grip RDL → pull bajo rodilla → muscle snatch. Una pasada de 3 repeticiones por movimiento, solo si dominas la técnica; si no, ensaya la bisagra sin carga. Selección reducida, no el complejo completo.';
  base.blocks=[
   {name:'Front squat técnico',source:'Semana 10 · fuerza',purpose:'Sentadilla antes de la fatiga',items:['2×5 cómodas; sin porcentajes ni máximos'],min:6,max:8},
   {name:'Ring rows, por calidad',source:'Fundamentos ID37 · skill de tracción',purpose:'Gimnasia controlada, sin MU ni invertidas',items:['2×6; anillas altas si hace falta'],min:4,max:5},
   {name:'Plancha',source:'Fundamentos ID37 · midline',purpose:'Control del tronco, opcional',items:['2×15–20 s, descanso libre'],min:3,max:3}
  ];
 }else if(tipo==='Híbrido'){
  base.name='Fuerza + skill + apoyo al 2400 m';base.source='Fundamentos ID37 / Semana 10 + AFMC';
  base.blocks=[
   {name:'Goblet squat con control',source:'Fundamentos ID37 · sentadilla',purpose:'Fuerza útil para el apoyo de carrera',items:['2×6–8, baja lento sin forzar profundidad'],min:6,max:8},
   {name:'Ring rows',source:'Fundamentos ID37 · skill',purpose:'Tracción sin agotar las piernas',items:['2×6–8; ajusta inclinación'],min:4,max:5},
   {name:'Peso rumano',source:'Semana 10 · accesorio posterior',purpose:'Bisagra opcional; sale primero si falta tiempo',items:['1×8 liviano'],min:4,max:4}
  ];
 }else{
  base.name='2400 m · construir base';base.source='Excel ID7 + método AFMC';
  base.specific='Marcha técnica y ensayo de apoyo cómodo, sin sprints ni prueba máxima.';
  base.blocks=[{name:'Control de tronco',source:'Fundamentos ID37 · plancha / barquito',purpose:'Apoyo a carrera sin añadir otro WOD',items:['Plancha 2×15–20 s, sin aguantar la respiración'],min:3,max:3}];
 }
 return base;
}
// Presupuesto en minutos: incluye descansos/transiciones; nunca se exige llenar el tiempo sobrante.
function trainingPlan(s,date){
 const total=Number(s.minutosTotal),already=Number(s.minutosHechos),remaining=Math.max(0,total-already);
 const cardioDone=Number(s.cardioHecho)||0,cardioTarget=Math.max(0,20-cardioDone);
 const warmDone=already>0&&s.calento===true;
 const base=trainingBase(s.rama,date),run=s.rama==='Trote / 2400 m';
 const plan={...base,preparation:base,total,already,remaining,cardioDone,cardioTarget,warmDone,run,blocks:[],warm:0,dynamic:0,specific:0,exit:0,cardio:0,middle:0,last:0,margin:0};
 if(!remaining)return plan;
 if(remaining<14&&!warmDone){
  plan.short=true;plan.warm=Math.min(5,remaining);plan.dynamic=remaining>=7?1:0;plan.exit=remaining>=8?1:0;
  // Marchar para entrar en calor también cuenta en el total de cardio.
  plan.cardio=Math.min(cardioTarget,plan.warm+Math.max(0,remaining-plan.warm-plan.dynamic-plan.exit));
  plan.last=Math.max(0,plan.cardio-Math.min(plan.warm,plan.cardio));
  plan.margin=Math.max(0,remaining-plan.warm-plan.dynamic-plan.exit-plan.last);return plan;
 }
 plan.warm=warmDone?0:5;plan.dynamic=warmDone?1:2;plan.specific=run?1:2;plan.exit=2;
 if(remaining<plan.warm+plan.dynamic+plan.specific+plan.exit){plan.short=true;plan.warm=0;plan.dynamic=0;plan.specific=0;plan.exit=Math.min(remaining,2);plan.margin=remaining-plan.exit;return plan}
 const candidates=base.blocks.filter((_,i)=>!s[['principalHecho','complementoHecho','accesorioHecho'][i]]);
 const mainReserve=run?0:(candidates[0]?.min||0);
 const skillReserve=!run&&remaining>=30?(candidates[1]?.min||0):0;
 const overhead=plan.warm+plan.dynamic+plan.specific+plan.exit;
 const firstCardio=Math.min(plan.warm,cardioTarget);
 const additional=Math.max(0,remaining-overhead-mainReserve-skillReserve);
 plan.cardio=firstCardio+Math.min(Math.max(0,cardioTarget-firstCardio),additional);
 let work=Math.max(0,remaining-overhead-(plan.cardio-firstCardio));
 for(const [i,b] of candidates.entries()){if(work<b.min)break;const reserve=candidates.slice(i+1).reduce((n,x)=>n+x.min,0);const minutes=Math.min(b.max,work-reserve>=b.min?work-reserve:b.min);plan.blocks.push({...b,minutes});work-=minutes}
 plan.omitted=candidates.filter(b=>!plan.blocks.some(x=>x.name===b.name)).map(b=>b.name);
 plan.short=!run&&!plan.blocks.length;
 plan.middle=Math.floor((plan.cardio-firstCardio)/2);plan.last=plan.cardio-firstCardio-plan.middle;
 plan.margin=work;return plan;
}
function getSesiones(){
 const s=dia();
 if(Array.isArray(s.sesiones)&&s.sesiones.length)return s.sesiones.map(x=>trainingChoice({...x,id:x.id||'legacy'}));
 if(s.rama&&s.minutosTotal!==''&&s.minutosTotal!=null)return [trainingChoice({...s,id:s.id||'legacy'})];
 return [];
}
function trainingPanel(){
 const s=dia(),sesiones=getSesiones();
 let h='';
 if(sesiones.length){
  h+=`<p class="kicker">Registro de hoy</p><ul class="training-log">${sesiones.map(x=>`<li><strong>${esc(x.rama)}</strong> · ${esc(x.minutosTotal)} min${x.hecho?' · hecha':''}</li>`).join('')}</ul>`;
 }
 sesiones.forEach(ses=>{
  if(!(ses.rama&&ses.minutosTotal!==''))return;
  h+=sesion(trainingPlan(ses,D),ses.rama);
  h+=`<div class="row"><button class="${ses.hecho?'on':''}" data-hecho="${esc(ses.id)}">${ses.hecho?'Sesión hecha ✓':'Marcar sesión hecha'}</button></div>`;
  if(ses.hecho)h+=`<h3>Registro para Charles</h3>${recUI('entreno:'+D+':'+ses.id,'Cuéntale qué hiciste, carga real, cardio, cómo te sentiste y si algo dolió o quedó corto.')}<p class="muted">Queda en este teléfono. Envíamelo en este chat y se lo paso a Charles.</p>`;
 });
 h+=`<p class="muted">¿Vas a entrenar?</p><div class="row">${opts(['Sí','No'],s.entrena,'entrena')}</div>`;
 if(s.entrena==='Sí'){
  h+=`<form id="training-form" class="training-chooser"><label><span class="kicker">Tipo</span><select name="rama" required><option value="">Elige tu sesión…</option>${TIPOS.map(t=>`<option>${esc(t)}</option>`).join('')}</select></label>
 <label><span class="kicker">Minutos disponibles</span><input name="total" type="number" inputmode="numeric" min="0" step="1" required placeholder="Ej. 40"></label>
 <button type="submit" class="prim">Armar sesión</button></form>`;
 }
 return h;
}
function sesion(p,tipo){
 let h=`<article class="training-session"><p class="kicker">Tu sesión · ${p.remaining} min por hacer</p><h3>${esc(tipo)} · ${p.name}</h3><p class="source">Base: ${p.source}. Selección y dosis reducidas propuestas para volver desde cero; no es la hoja completa.</p>`;
 if(tipo==='Hipertrofia')h+='<p class="muted">ID47: pecho/tríceps L–J · espalda/bíceps M–V · piernas X–S. Es la selección por día, no seis sesiones obligatorias.</p>';
 if(dow(D)===0)h+='<p class="muted">Domingo: descanso sugerido. El patrón de hipertrofia M–V se muestra como alternativa, no como obligación.</p>';
 if(!p.remaining)return h+'<p>No queda tiempo pendiente. No se añade otro entreno. Puedes cerrar la sesión y grabar tu registro en Hoy.</p></article>';
 h+=`<section class="session-block"><h4>Elongación · dinámica</h4><p>${p.dynamic?p.dynamic+' min: '+p.preparation.dynamic:'Pendiente hasta elevar temperatura; no se fuerza en frío.'}</p></section>`;
 h+=`<p class="muted">Orden real: primero 5–10 min para elevar temperatura, después dinámica y preparación específica. Nada de elongación intensa en frío. <a href="${FUENTES.hss}" target="_blank" rel="noopener">HSS</a>.</p>
 <section class="session-block"><h4>Calentamiento · general + específico</h4><p>${p.warm?`${p.warm} min: ${p.preparation.warm}.`:p.warmDone?'Ya calentaste: se omite la entrada general. Si te enfriaste, vuelve a calentar antes de cargar.':'Sin tiempo para preparar carga: no hagas fuerza ni sprints.'} ${p.warm&&p.warm<5?'Solo movimiento fácil: el tiempo no alcanza para preparar fuerza.':''} ${p.specific?`Después de la dinámica, ${p.specific} min: ${p.preparation.specific}`:''}</p><p class="source">Preparación: HSS${tipo==='CrossFit de retorno'?' + complejo reducido de Semana 10':''}.</p></section>`;
 if(p.short)h+='<p class="muted">Tiempo corto: solo preparación / movimiento fácil y salida. Se omiten barra y accesorios, no se aprietan los descansos.</p>';
 if(p.omitted?.length)h+=`<p class="muted">Fuera por tiempo: ${p.omitted.join(', ')}. No se añaden al final.</p>`;
 const cardioMode=tipo==='Hipertrofia'?(p.name==='piernas'?'bicicleta fácil':'remo suave'):tipo==='CrossFit de retorno'?'bicicleta fácil; motor corto sin competir':'marcha / trote conversacional; camina si hace falta';
 const cardioBlock=(n,label)=>n?`<section class="cardio"><h4>${label} · ${n} min</h4><p>${cardioMode}. ${tipo==='Híbrido'||p.run?'Apoyo al 2400 m: construir tolerancia, no correr al ritmo meta.':''}</p><p class="source">${tipo==='Hipertrofia'?'ID47 · cardio general':tipo==='CrossFit de retorno'?'Semana 10 · motor reducido':'AFMC · base de carrera'}.</p></section>`:'';
 p.blocks.forEach((b,i)=>{h+=`<section class="session-block"><h4>${i+1}. ${b.name} · hasta ${b.minutes} min</h4><p class="source">Base: ${b.source} · ${b.purpose}.</p><ul>${b.items.map(x=>`<li>${x}</li>`).join('')}</ul><p class="muted">Descansa 60–120 s o más. El tiempo incluye descanso y transiciones; si no alcanza, quita una serie, no el descanso.</p></section>`});
 h+=cardioBlock((p.middle||0)+(p.last||0),'Cardio general del entrenamiento');
 h+=`<section class="session-block"><h4>Elongación estática · salida</h4><p>${p.exit?p.exit+' min reservados.':'Sin tiempo reservado: déjala para después, con el cuerpo caliente.'} ${p.preparation.static} Sostén suave 20–30 s por lado, sin rebotes; completa aparte si no cabe. No se hace en frío. Base: HSS.</p></section>
 <p class="muted">Carga: la de hoy, 3–4 repeticiones en reserva. No porcentajes de tus marcas antiguas. ${p.margin?`${p.margin} min quedan como margen: no es obligación llenarlos.`:''} Los accesorios salen primero si falta tiempo. Para si duele la rodilla o la lumbar; ante mareo, dolor de pecho o falta de aire desproporcionada, detén y consulta.</p></article>`;
 return h;
}

// ---------- Comida ----------
let FOODS=[],CHARLES=[];
const custom=()=>load('hoy:alimentos',[]);
const allFoods=()=>[...FOODS,...CHARLES,...custom()];
const hasMacros=f=>!!(f&&Number.isFinite(+f.g)&&+f.g>0&&['p','c','f','k'].every(k=>Number.isFinite(+f[k])));
const macrosOf=(f,q)=>{if(!hasMacros(f))return null;const r=f.g/100*q;return{p:f.p*r,c:f.c*r,f:f.f*r,k:f.k*r}};
const COMIDAS=['Desayuno','Almuerzo','Cena','Snacks'];
function totals(d){
 const m=load(menuKey(d),{}),t={p:0,c:0,f:0,k:0};
 [...COMIDAS,'Extras'].forEach(b=>(m[b]||[]).forEach(it=>{const f=allFoods().find(x=>x.id===it.id);const x=macrosOf(f,it.q);if(x)for(const k in t)t[k]+=x[k]}));
 return t;
}
function loggedSinMacros(d){
 const m=load(menuKey(d),{});
 return [...COMIDAS,'Extras'].some(b=>(m[b]||[]).some(it=>{const f=allFoods().find(x=>x.id===it.id);return f&&!hasMacros(f)}));
}
function resumen(d){
 const t=totals(d),g=load('hoy:metas',{}),lab={p:'Proteína',c:'Carbos',f:'Grasas',k:'kcal'};
 const conMacros=['p','c','f','k'].some(k=>t[k]>0);
 let h=conMacros?`<div class="macros">${['p','c','f','k'].map(k=>`<div><b>${Math.round(t[k])}</b>${lab[k]}${k!=='k'?' g':''}</div>`).join('')}</div>`:'';
 if(loggedSinMacros(d))h+='<p class="muted">Hay comidas de tu menú anotadas. Los macros no están calculados: Charles no me pasó esos números y no los invento.</p>';
 const set=['p','c','f','k'].filter(k=>g[k]>0);
 if(!set.length)h+=`<p class="muted">Aún no hay metas definidas. Ponlas en Comida → «Tus metas».</p>`;
 else if(conMacros)h+='<ul>'+set.map(k=>{const diff=t[k]-g[k];return `<li>${lab[k]}: ${diff>=0?`<span class="ok">alcanza</span> (+${Math.round(diff)})`:`<span class="falta">falta ${Math.round(-diff)}${k!=='k'?' g':''}</span>`} de ${g[k]}</li>`}).join('')+'</ul>';
 return h;
}

// ---------- Estudio / Espiritual ----------
const CALC={t:'Deriva f(x) = 3x² · sen(x) y evalúa f′(π/2).',h:'Pista: regla del producto, (uv)′ = u′v + uv′.'};
const BIBLIA_KEY='hoy:biblia';
function lecturaHoy(){
 const pos=load(BIBLIA_KEY,null);
 if(pos&&pos.txt&&pos.ref)return pos;
 return null;
}
function espiritualLectura(s,inTab){
 const pos=lecturaHoy();
 let h=`<section class="card"><h2>${inTab?'Lectura seguida':'Espiritual'}</h2>`;
 if(pos)h+=`<p class="verse">«${esc(pos.txt)}»</p><p class="muted">${esc(pos.ref)} · Reina-Valera 1909 (dominio público)</p>`;
 else h+='<p class="muted">La lectura es seguida: el versículo del día se busca según por dónde vas, no el primero de Génesis por defecto.</p>';
 h+=`<p class="kicker">Las 3 páginas</p>
 <p class="muted">¿Leíste las 3 páginas de la Biblia?</p>
 <div class="row">${opts(['Sí','No'],s.biblia3,'biblia3')}</div>`;
 if(s.biblia3==='Sí')h+='<p class="muted">Quedó marcado: leíste las 3 páginas de hoy.</p>';
 if(!inTab)h+='<p style="margin-top:14px"><button data-go="espiritual">Grabar mi reflexión</button></p>';
 h+='</section>';
 return h;
}

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
 const s=dia();
 let h=`${weightCard()}<section class="card"><h2>Ánimo</h2><div class="row">${opts(['Bien','Normal','Cansado','Bajo'],s.animo,'animo')}</div></section>
 <section class="card"><h2>Sensación muscular</h2><div class="row">
 ${[['Verde','g'],['Amarillo','y'],['Rojo','r']].map(([n,c])=>`<button class="${c} ${s.rec===n?'on':''}" data-rec="${n}">${n}</button>`).join('')}</div>
 ${s.rec==='Rojo'?'<p class="muted">Sensación muscular en rojo: considera la versión corta o solo cardio fácil. Tú decides.</p>':''}</section>
 <section class="card"><h2>Entrenamiento</h2>${trainingPanel()}</section>
 <section class="card"><h2>Macros de hoy</h2>${resumen(D)}
  <h3>Extra de hoy</h3>${pickerHTML('Extras')}${listaHTML(D,'Extras')}</section>
 <section class="card"><h2>Estudio</h2><p>${CALC.t}</p><button data-go="estudiar">Desarrollar</button> ${s.calc?`<span class="muted">· ${s.calc}</span>`:''}</section>
 ${espiritualLectura(s,false)}`;
 return h;
}
function menuFoods(b){
 const list=allFoods().filter(f=>f.charles);
 if(!b||b==='Extras')return list;
 return list.filter(f=>Array.isArray(f.slots)&&f.slots.includes(b));
}
function pickerHTML(b){
 const list=menuFoods(b);
 if(!list.length)return `<p class="muted">Aquí van a aparecer las comidas de tu menú con Charles, no un catálogo general.</p>`;
 return `<div class="row"><select data-sel="${b}"><option value="">Elegir alimento…</option>${list.map(f=>`<option value="${f.id}">${esc(f.n)} — ${esc(f.u)}</option>`).join('')}</select>
 <input type="number" inputmode="decimal" min="0.25" step="0.25" value="1" data-qty="${b}" style="width:90px" aria-label="porciones"><button class="sm prim" data-add="${b}">Agregar</button></div>`;
}
function listaHTML(d,b){
 const m=load(menuKey(d),{});return (m[b]||[]).map((it,i)=>{const f=allFoods().find(x=>x.id===it.id);if(!f)return '';const x=macrosOf(f,it.q);
  const extra=[f.u,f.nota,x?`P ${x.p.toFixed(1)} · C ${x.c.toFixed(1)} · G ${x.f.toFixed(1)} · ${Math.round(x.k)} kcal`:''].filter(Boolean).join(' · ');
  return `<div class="item"><span>${it.q}× ${esc(f.n)}<br><span class="muted">${esc(extra)}</span></span><button class="sm" data-del="${b}:${i}">✕</button></div>`}).join('');
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
 <p class="muted">Opciones de tu menú con Charles. Los macros de cada plato se suman cuando él los tenga; no se inventan.</p>`;
 return h;
}
function vEntrenar(){
 return `<section class="card"><h2>Tu entrenamiento</h2>${trainingPanel()}</section>`;
}
function vEstudiar(){
 const s=dia();
 return `<section class="card"><h2>Cálculo</h2><p class="muted">Ejemplo mientras conectamos tu nivel.</p><p class="serif">${CALC.t}</p><p class="muted">${CALC.h}</p>
 <textarea id="calcTxt" placeholder="Desarrolla aquí paso a paso…">${esc(s.calcTxt||'')}</textarea>
 <div class="row" style="margin-top:8px"><button class="${s.calc==='Hecho'?'on':''}" data-calc="Hecho">Hecho</button><button class="${s.calc==='Después'?'on':''}" data-calc="Después">Después</button></div></section>`;
}
function vEspiritual(){
 const s=dia();
 return `${espiritualLectura(s,true)}
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
 if(tab==='hoy'||tab==='entrenar'){
  getSesiones().filter(x=>x.hecho).forEach(x=>showAudio('entreno:'+D+':'+x.id));
  if(dia().hecho)showAudio('entreno:'+D);
 }
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.t){tab=d.t;render();scrollTo(0,0);return}
 if(d.go){tab=d.go;render();scrollTo(0,0);return}
 if(d.animo)return setDia({animo:d.animo});
 if(d.rec)return setDia({rec:d.rec});
 if(d.entrena)return setDia({entrena:d.entrena});
 if(d.biblia3)return setDia({biblia3:d.biblia3});
 if('hecho' in d){
  const id=d.hecho,sesiones=getSesiones().map(x=>({...x,hecho:x.id===id?!x.hecho:!!x.hecho}));
  return setDia({sesiones,hecho:sesiones.some(x=>x.hecho)});
 }
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
 if(e.target.id==='training-form'){
  e.preventDefault();const f=new FormData(e.target),total=Number(f.get('total'));
  if(!TIPOS.includes(f.get('rama'))||!Number.isSafeInteger(total)||total<0)return alert('Elige un tipo y minutos enteros desde cero.');
  const ses={id:'s'+Date.now(),rama:f.get('rama'),minutosTotal:total,minutosHechos:0,cardioHecho:0,hecho:false};
  return setDia({sesiones:[...getSesiones(),ses],entrena:''});
 }
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
Promise.all([
 fetch('./foods.json').then(r=>r.ok?r.json():[]).catch(()=>[]),
 fetch('./charles-menu.json').then(r=>r.ok?r.json():[]).catch(()=>[])
]).then(([usda,menu])=>{FOODS=usda;CHARLES=Array.isArray(menu)?menu:[];render()}).catch(()=>render());
render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js');
