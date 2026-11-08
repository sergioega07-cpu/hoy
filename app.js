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
 return `<section class="card weight-card" aria-labelledby="weight-title"><p class="kicker" id="weight-title">Peso actual</p>
 <p class="muted">Actual · ${weightDate(latest.date)}</p>
 <p class="weight-current"><strong>${kgFmt(latest.kg)}</strong><span> kg</span></p>
 <p class="weight-meta">Meta 79–81 kg · ${weightGap(latest.kg)}</p>
 <form id="weight-form"><div class="grid2"><label><span class="kicker">Peso (kg)</span><input id="weight-kg" name="kg" type="text" inputmode="decimal" placeholder="88,9" pattern="[0-9]+([.,][0-9]+)?" required></label>
 <label><span class="kicker">Fecha</span><input id="weight-date" name="date" type="date" value="${today()}" required></label></div>
 <button class="prim" type="submit">Anotar</button><p class="muted">Anota el peso en ayunas. Si anotas la misma fecha, reemplaza el registro.</p></form>
 <p class="kicker">Registros recientes</p><ul class="weight-records">${records.slice(0,10).map(r=>`<li><time datetime="${r.date}">${weightDate(r.date)}</time><strong>${kgFmt(r.kg)} kg</strong></li>`).join('')}</ul>
 <p class="muted">Datos guardados solo en este navegador.</p></section>`;
}

// ---------- Entrenamiento: elección libre; sin listados inventados ----------
const TIPOS=['Hipertrofia','CrossFit','Trote','Híbrido'];
const MUSCULOS=['Pecho','Espalda','Piernas','Hombros','Brazos','Core'];
const DISTANCIAS=['2.400 m','5.000 m','10.000 m','21.000 m','42.000 m'];
const CARDIO_LIGERO=['Bicicleta fácil','Remo suave','Marcha o trote conversacional','Escalera'];
const FUENTES={hss:'https://www.hss.edu/health-library/move-better/static-dynamic-stretching',afmc:'https://www.afmc.af.mil/News/Article-Display/Article/2664126/improving-run-times-for-the-pt-test/',smith:'https://www.military.com/military-fitness/fitness-test-prep/improving-your-pft-run-time'};
function trainingChoice(s){
 const raw=s.rama;
 const legacy={Mixto:'Híbrido','Trote / 2400 m':'Trote',Acondicionamiento:'Híbrido',Calistenia:'CrossFit','CrossFit de retorno':'CrossFit'};
 const rama=TIPOS.includes(s.rama)||s.rama==='Recovery day'?s.rama:(legacy[s.rama]||'');
 const distancia=s.distancia||(rama==='Trote'&&raw==='Trote / 2400 m'?'2.400 m':'');
 return {...s,rama,musculo:s.musculo||'',distancia,pista400:s.pista400||'',vueltas400:s.vueltas400??'',tiempo400:s.tiempo400||'',minutosTotal:s.minutosTotal??'',minutosHechos:s.minutosHechos??0,cardioHecho:s.cardioHecho??0};
}
function parseTiempo400(raw){
 const t=String(raw||'').trim().replace(',',':');
 if(!t)return 0;
 const m=t.match(/^(\d+)\s*[:m]\s*(\d{1,2})$/i);
 if(m){const sec=(+m[1])*60+(+m[2]);return sec>0?sec:0}
 if(/^\d+$/.test(t)){const n=+t;return n>0?n:0}
 return 0;
}
function fmtTiempo400(sec){
 const m=Math.floor(sec/60),r=sec%60;
 return m+':'+String(r).padStart(2,'0');
}
function readTroteFields(f){
 return {distancia:f.get('distancia')||'',pista400:f.get('pista400')||'',vueltas400:f.get('vueltas400')||'',tiempo400:(f.get('tiempo400')||'').trim()};
}
function validTrote(f){
 const {distancia,pista400,vueltas400,tiempo400}=readTroteFields(f);
 if(!DISTANCIAS.includes(distancia))return 'Elige qué prueba de trote vas a entrenar.';
 if(pista400!=='Sí'&&pista400!=='No')return 'Indica si vas a correr en pista de 400 m.';
 if(pista400==='Sí'){
  const n=Number(vueltas400);
  if(!Number.isSafeInteger(n)||n<1)return 'Escribe cuántos 400 m quieres hacer.';
  if(!parseTiempo400(tiempo400))return 'Escribe el tiempo objetivo de cada 400 m, por ejemplo 1:30.';
 }
 return '';
}
function sesionTitulo(ses){
 if(ses.rama==='Recovery day')return ses.cardioRecovery||ses.rama;
 let t=ses.rama;
 if(ses.musculo)t+=' · '+ses.musculo;
 if(ses.distancia)t+=' · '+ses.distancia;
 if(ses.pista400==='Sí'&&ses.vueltas400&&ses.tiempo400)t+=` · ${ses.vueltas400} × 400 m en ${ses.tiempo400}`;
 return t;
}
function distanciaField(x,edit){
 const show=!!(x&&x.rama==='Trote');
 return `<label id="${edit?'distancia-field-edit':'distancia-field'}"${show?'':' hidden'}><span class="kicker">¿Qué prueba vas a entrenar?</span><select name="distancia"${show?' required':''}><option value="">Elige la distancia…</option>${DISTANCIAS.map(t=>`<option${x&&t===x.distancia?' selected':''}>${esc(t)}</option>`).join('')}</select></label>`;
}
function pistaFields(x,edit){
 const show=!!(x&&x.rama==='Trote'),pista=!!(x&&x.pista400==='Sí');
 return `<label id="${edit?'pista-field-edit':'pista-field'}"${show?'':' hidden'}><span class="kicker">¿Vas a correr en pista de 400 m?</span><select name="pista400"${show?' required':''}><option value="">Elige…</option><option${x&&x.pista400==='Sí'?' selected':''}>Sí</option><option${x&&x.pista400==='No'?' selected':''}>No</option></select></label>
<div id="${edit?'pista-detalle-edit':'pista-detalle'}"${pista?'':' hidden'}><label><span class="kicker">¿Cuántos 400 m quieres hacer?</span><input name="vueltas400" type="number" inputmode="numeric" min="1" step="1" placeholder="Ej. 5" value="${x&&x.vueltas400!==''&&x.vueltas400!=null?esc(x.vueltas400):''}"${pista?' required':''}></label>
<label><span class="kicker">¿En cuánto tiempo cada 400 m?</span><input name="tiempo400" inputmode="text" placeholder="Ej. 1:30" value="${x&&x.tiempo400?esc(x.tiempo400):''}"${pista?' required':''}></label></div>`;
}
function toggleTrainingExtras(form){
 if(!form)return;
 const rama=(form.querySelector('[name=rama]')||{}).value||'';
 const hip=rama==='Hipertrofia',trote=rama==='Trote';
 const suf=form.id==='sesion-edit-form'?'-edit':'';
 const mus=form.querySelector('#musculo-field'+suf);
 const dist=form.querySelector('#distancia-field'+suf);
 const pistaWrap=form.querySelector('#pista-field'+suf);
 const det=form.querySelector('#pista-detalle'+suf);
 const pistaVal=(form.querySelector('[name=pista400]')||{}).value;
 const arm=(el,on)=>{
  if(!el)return;
  el.hidden=!on;
  el.querySelectorAll('select,input').forEach(i=>{i.required=!!on;if(!on)i.value='';});
 };
 arm(mus,hip);arm(dist,trote);arm(pistaWrap,trote);
 const showDet=trote&&pistaVal==='Sí';
 if(det){
  det.hidden=!showDet;
  det.querySelectorAll('input').forEach(i=>{i.required=showDet;if(!showDet)i.value='';});
 }
}
function weekMusculos(end){
 const seen=[];
 for(let i=6;i>=0;i--){
  const raw=load(dayKey(addDays(end,-i)),{});
  const list=Array.isArray(raw.sesiones)?raw.sesiones:(raw.rama?[raw]:[]);
  list.forEach(x=>{if(x.musculo&&MUSCULOS.includes(x.musculo)&&!seen.includes(x.musculo))seen.push(x.musculo)});
 }
 return seen;
}
function bloque(name,source,purpose,items,min,max){return {name,source,purpose,items,min,max}}
function hipertrofiaBlocks(musculo){
 const src='Tu hipertrofia · '+musculo,rir='; carga de hoy, 3–4 repeticiones en reserva';
 const s=(name,purpose,items,min,max)=>bloque(name,src,purpose,items,min,max);
 if(musculo==='Piernas')return [
  s('Sentadilla','Patrón principal',['4 series de 12'+rir],6,8),
  s('Estocadas','Control unilateral',['4 series de 12 por lado'],5,6),
  s('Extensión de cuádriceps','Aislamiento',['3 series de 12'],4,5),
  s('Peso muerto con barra y mancuernas','Bisagra',['3 series de 12; barra o mancuernas'],6,8),
  s('Hack','Sentadilla en máquina',['4 series de 20'],5,6),
  s('Gemelos','Pantorrilla',['4 series de 20'],4,5),
  s('Abdomen','Cierre',['4 series de 15'],3,4)
 ];
 if(musculo==='Pecho')return [
  s('Press en banca con barra','Empuje horizontal',['4 series de 12'+rir],6,8),
  s('Press inclinado con mancuernas','Empuje inclinado',['4 series de 8–10'],6,8),
  s('Fondos en paralelas','Empuje',['4 series de 15; rango cómodo'],5,6),
  s('Press declinado','Empuje declinado',['4 series de 15'],5,6)
 ];
 if(musculo==='Espalda')return [
  s('Remo inclinado con barra','Tracción horizontal',['3 series de 12'+rir],6,8),
  s('Remo con mancuerna','Tracción unilateral',['4 series de 15 por lado'],5,6),
  s('Dominadas','Tracción vertical',['3 series de 12; asistidas si hace falta'],5,6),
  s('Remo en polea','Tracción complementaria',['4 series de 15'],4,5)
 ];
 if(musculo==='Hombros')return [
  s('Press militar','Empuje vertical',['4 series de 12'+rir],6,8),
  s('Vuelos laterales','Deltoides lateral',['4 series de 15'],5,6),
  s('Press Arnold','Empuje de hombros',['4 series de 12'],5,6),
  s('Vuelos posteriores','Hombro posterior',['4 series de 18'],4,5)
 ];
 if(musculo==='Brazos')return [
  s('Curl de bíceps con mancuernas','Bíceps',['4 series de 10'+rir],5,6),
  s('Curl en banco Scott','Bíceps',['4 series de 10'],4,5),
  s('Extensión de tríceps en polea','Tríceps',['4 series de 15'],5,6),
  s('Press francés','Tríceps',['4 series de 12'],4,5),
  s('Fondos entre bancos','Tríceps',['4 series de 20'],4,5)
 ];
 if(musculo==='Core')return [
  s('Plancha','Control del tronco',['3 series de 20–40 s'],4,5),
  s('Abdomen','Cierre',['4 series de 15'],4,5),
  s('Extensión lumbar','Cadena posterior',['4 series de 20'],4,5)
 ];
 return [];
}
function troteBlocks(s){
 const dist=DISTANCIAS.includes(s.distancia)?s.distancia:'';
 const n=Number(s.vueltas400),pace=parseTiempo400(s.tiempo400);
 if(s.pista400==='Sí'&&Number.isSafeInteger(n)&&n>0&&pace>0){
  const t=fmtTiempo400(pace),rec=fmtTiempo400(Math.max(90,pace));
  return [
   bloque('Progresivos','Pista de 400 m','Entrada específica, sin sprint',['2–4 rectas suaves, cada una un poco más rápida, sin llegar al máximo'],3,5),
   bloque(n+' × 400 m','Pista · objetivo '+t,`Objetivo: ${n} × 400 m en ${t} cada uno`,[
    `Hoy construye hacia ${n} × 400 m en ${t}. No es una prueba de hoy.`,
    `Corre cada 400 buscando acercarte a ${t}, con técnica limpia.`,
    `Recuperación: caminata o trote muy suave unos ${rec} entre series (al menos el mismo tiempo que el 400).`,
    'Si un 400 se va más lento o se corta el aire, alarga la recuperación; no persigas el reloj a costa de la forma.',
    dist?`Esta sesión apoya tu prueba de ${dist}.`:'',
    'Cuando esos 400 salgan cerca del objetivo con recuperación cómoda, se puede recortar el descanso o sumar una serie.'
   ].filter(Boolean),12,22),
   bloque('Control de tronco','Trote · apoyo','Plancha o barquito',['2–3 × 15–20 s, sin aguantar la respiración'],3,4)
  ];
 }
 const src=dist?'Trote · '+dist:'Trote';
 if(dist==='2.400 m')return [
  bloque('Trote o intervalos controlados',src,'Base hacia los 2.400 m, sin prueba máxima',['Trote conversacional o intervalos cortos controlables, con recuperación caminando.','No corras al ritmo de una marca si todavía no tienes una de hoy.','Si corta el aire, camina y retoma.'],10,16),
  bloque('Control de tronco',src,'Plancha o barquito',['2–3 × 15–20 s, sin aguantar la respiración'],3,4)
 ];
 if(dist==='5.000 m')return [
  bloque('Trote conversacional',src,'Base fácil para 5.000 m',['Trote continuo o marcha-trote, ritmo al que puedes hablar.','Sin series de velocidad ni tempo: primero se construye base.','Camina si lo necesitas y retoma.'],12,18),
  bloque('Control de tronco',src,'Apoyo',['2–3 × 15–20 s de plancha o barquito'],3,4)
 ];
 if(dist==='10.000 m')return [
  bloque('Trote sostenido',src,'Base para 10.000 m',['Trote conversacional, un poco más largo y estable, sin apurar el ritmo.','Si se corta, camina un tramo y retoma; el objetivo es terminar cómodo.'],12,18),
  bloque('Control de tronco',src,'Apoyo',['2–3 × 15–20 s de plancha o barquito'],3,4)
 ];
 if(dist==='21.000 m'||dist==='42.000 m')return [
  bloque('Fondo fácil',src,'Base aeróbica para '+dist,['Trote o marcha-trote muy conversacional. Caminar está bien.','Esfuerzo bajo: el fondo se construye con consistencia, no apurando el ritmo de hoy.'],12,20),
  bloque('Control de tronco',src,'Apoyo',['2–3 × 15–20 s de plancha o barquito'],3,4)
 ];
 return [
  bloque('Trote conversacional','Trote','Movimiento fácil',['Trote o marcha a ritmo conversacional; camina si hace falta'],10,16),
  bloque('Control de tronco','Trote · apoyo','Plancha o barquito',['2–3 × 15–20 s'],3,4)
 ];
}
function trainingBase(tipo,musculo,ses){
 ses=ses||{};
 const piernas=tipo==='Hipertrofia'&&musculo==='Piernas',run=tipo==='Trote';
 const base={name:tipo==='Hipertrofia'?(musculo||'Hipertrofia'):tipo,source:tipo,dynamic:'Balanceos de piernas y estocadas caminando, controlados; movilidad suave de tobillos y cadera.',warm:piernas||tipo==='CrossFit'?'Bicicleta fácil':tipo==='Hipertrofia'?'Remo suave':'Marcha o trote fácil',specific:run?(ses.pista400==='Sí'?'Progresivos suaves en recta, sin sprint.':'Marcha técnica suave, sin sprints ni prueba máxima.'):'Movimientos suaves del grupo que vas a trabajar, sin fatiga y sin cargar.',static:piernas||run?'Cuádriceps e isquios, sin dolor.':'La zona que trabajaste, suave y sin dolor.',blocks:[]};
 if(tipo==='Hipertrofia'&&!piernas)base.dynamic='Movilidad dinámica de hombros y codos, giros suaves de torso; sin sostener al límite.';
 if(tipo==='Hipertrofia'){
  base.source=musculo?'Tu hipertrofia · '+musculo:'Hipertrofia';
  base.blocks=hipertrofiaBlocks(musculo);
 }else if(tipo==='CrossFit'){
  base.source='Tu CrossFit · fuerza, gimnasia y motor';
  base.dynamic+=' Movilidad suave de hombros y muñecas para barra y anillas.';
  base.specific='Complejo de barra vacía: bisagra, jalón y envío, sin fatiga y sin máximos.';
  base.blocks=[
   bloque('Front squat','Tu CrossFit · fuerza','Sentadilla frontal antes de la fatiga',['3–4 series de 5; carga de hoy, sin porcentajes de marcas antiguas'],6,8),
   bloque('Gimnasia · tracción','Tu CrossFit · skill','Ring rows o dominadas, por calidad',['3 series de 5–8; anillas más altas si hace falta'],5,6),
   bloque('Motor corto','Tu CrossFit · WOD','Pieza corta, sin competir',['8–12 min a ritmo sostenible: sentadilla o bisagra liviana + remo o bicicleta'],8,12)
  ];
 }else if(tipo==='Híbrido'){
  base.source='Híbrido · fuerza y apoyo al trote';
  base.blocks=[
   bloque('Sentadilla goblet','Híbrido · fuerza','Fuerza útil para correr',['3 series de 6–8, baja con control'],6,8),
   bloque('Ring rows o remo','Híbrido · tracción','Tracción sin agotar las piernas',['3 series de 6–8'],5,6),
   bloque('Peso muerto rumano','Híbrido · bisagra','Cadena posterior',['3 series de 6–8 livianas'],5,6)
  ];
 }else if(tipo==='Trote'){
  base.name=ses.distancia?('Trote · '+ses.distancia):'Trote';
  base.source=ses.pista400==='Sí'?'Trote · pista de 400 m':(ses.distancia?'Trote · '+ses.distancia:'Trote');
  base.blocks=troteBlocks(ses);
 }
 return base;
}
// Presupuesto en minutos: incluye descansos/transiciones; nunca se exige llenar el tiempo sobrante.
function trainingPlan(s,date){
 const total=Number(s.minutosTotal),already=Number(s.minutosHechos),remaining=Math.max(0,total-already);
 const cardioDone=Number(s.cardioHecho)||0,cardioTarget=Math.max(0,(s.rama==='Trote'?5:20)-cardioDone);
 const warmDone=already>0&&s.calento===true;
 if(s.rama==='Recovery day'){
  const mode=CARDIO_LIGERO.includes(s.cardioRecovery)?s.cardioRecovery:'Marcha o trote conversacional';
  const prep={dynamic:'Balanceos suaves de piernas y movilidad de tobillos y cadera; sin sostener al límite.',warm:mode+' muy suave',specific:'',static:'Cuádriceps, isquios y cadera, suave y sin dolor.'};
  const plan={name:mode,source:'Recovery day · cardio ligero',preparation:prep,total,already,remaining,cardioDone,cardioTarget,warmDone,run:false,recovery:true,cardioMode:mode,blocks:[],warm:0,dynamic:0,specific:0,exit:0,cardio:0,middle:0,last:0,margin:0};
  if(!remaining)return plan;
  plan.warm=Math.min(5,remaining);
  plan.dynamic=remaining>=8?2:remaining>=7?1:0;
  plan.exit=remaining>=plan.warm+plan.dynamic+3?2:remaining>=plan.warm+plan.dynamic+2?1:0;
  plan.last=Math.max(0,remaining-plan.warm-plan.dynamic-plan.exit);
  plan.cardio=plan.last;
  return plan;
 }
 const base=trainingBase(s.rama,s.musculo,s),run=s.rama==='Trote';
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
 if(candidates.length){
  let left=Math.max(0,work);
  const sumMin=candidates.reduce((n,b)=>n+b.min,0);
  const minutes=candidates.map(b=>{
   if(work>=sumMin){const give=Math.min(b.min,left);left-=give;return give}
   return 0;
  });
  if(work<sumMin){
   minutes.forEach((_,i)=>{
    const n=candidates.length-i,fair=Math.max(1,Math.floor((left||1)/n));
    const use=Math.min(candidates[i].max,fair,left||1);
    minutes[i]=left?use:1;left=Math.max(0,left-minutes[i]);
   });
  }else{
   candidates.forEach((b,i)=>{if(!left)return;const add=Math.min(b.max-minutes[i],left);if(add>0){minutes[i]+=add;left-=add}});
  }
  candidates.forEach((b,i)=>plan.blocks.push({...b,minutes:Math.max(1,minutes[i])}));
  plan.omitted=[];
  work=left;
 }
 plan.middle=Math.floor((plan.cardio-firstCardio)/2);plan.last=plan.cardio-firstCardio-plan.middle;
 plan.margin=work;return plan;
}
function getSesiones(){
 const s=dia();
 let list;
 if(Array.isArray(s.sesiones))list=s.sesiones;
 else if(s.rama&&s.minutosTotal!==''&&s.minutosTotal!=null)list=[{rama:s.rama,musculo:s.musculo,distancia:s.distancia,pista400:s.pista400,vueltas400:s.vueltas400,tiempo400:s.tiempo400,cardioRecovery:s.cardioRecovery,minutosTotal:s.minutosTotal,minutosHechos:s.minutosHechos,cardioHecho:s.cardioHecho,hecho:s.hecho,id:s.id||'legacy'}];
 else list=[];
 return list.map((x,i)=>trainingChoice({rama:x.rama,musculo:x.musculo,distancia:x.distancia,pista400:x.pista400,vueltas400:x.vueltas400,tiempo400:x.tiempo400,cardioRecovery:x.cardioRecovery,minutosTotal:x.minutosTotal,minutosHechos:x.minutosHechos,cardioHecho:x.cardioHecho,hecho:x.hecho,id:x.id||('s-'+i)}));
}
function saveSesiones(sesiones,extra){
 if(editSesionId&&!sesiones.some(x=>x.id===editSesionId))editSesionId=null;
 return setDia({sesiones,hecho:sesiones.some(x=>x.hecho),rama:'',minutosTotal:'',minutosHechos:0,cardioHecho:0,musculo:'',distancia:'',pista400:'',vueltas400:'',tiempo400:'',cardioRecovery:'',id:'',...(extra||{})});
}
function sesionEditForm(x){
 if(x.rama==='Recovery day'){
  return `<form id="sesion-edit-form" data-edit-id="${esc(x.id)}" class="training-chooser"><label><span class="kicker">Cardio ligero</span><select name="cardio" required>${CARDIO_LIGERO.map(t=>`<option${t===x.cardioRecovery?' selected':''}>${esc(t)}</option>`).join('')}</select></label>
 <label><span class="kicker">Minutos</span><input name="total" type="number" inputmode="numeric" min="0" step="1" required value="${esc(x.minutosTotal)}"></label>
 <div class="row"><button type="submit" class="prim">Guardar</button><button type="button" data-edit-cancel>Cancelar</button></div></form>`;
 }
 return `<form id="sesion-edit-form" data-edit-id="${esc(x.id)}" class="training-chooser"><label><span class="kicker">Tipo</span><select name="rama" required>${TIPOS.map(t=>`<option${t===x.rama?' selected':''}>${esc(t)}</option>`).join('')}</select></label>
 <label id="musculo-field-edit"${x.rama==='Hipertrofia'?'':' hidden'}><span class="kicker">¿Qué músculo vas a entrenar?</span><select name="musculo"${x.rama==='Hipertrofia'?' required':''}><option value="">Elige el músculo…</option>${MUSCULOS.map(t=>`<option${t===x.musculo?' selected':''}>${esc(t)}</option>`).join('')}</select></label>
 ${distanciaField(x,true)}${pistaFields(x,true)}
 <label><span class="kicker">Minutos</span><input name="total" type="number" inputmode="numeric" min="0" step="1" required value="${esc(x.minutosTotal)}"></label>
 <div class="row"><button type="submit" class="prim">Guardar</button><button type="button" data-edit-cancel>Cancelar</button></div></form>`;
}
function trainingLog(sesiones){
 if(!sesiones.length)return '';
 return `<p class="kicker">Registro de hoy</p><ul class="training-log">${sesiones.map(x=>{
  const label=`<strong>${esc(sesionTitulo(x))}</strong> · ${esc(x.minutosTotal)} min${x.hecho?' · hecha':''}`;
  if(editSesionId===x.id)return `<li>${sesionEditForm(x)}</li>`;
  return `<li><span class="log-text">${label}</span><span class="log-actions"><button type="button" data-edit-ses="${esc(x.id)}">Editar</button><button type="button" data-del-ses="${esc(x.id)}">Borrar</button></span></li>`;
 }).join('')}</ul>`;
}
function hasSueno(s){
 const h=s.suenoH,m=s.suenoM===''||s.suenoM==null?0:s.suenoM;
 return h!==''&&h!=null&&Number.isSafeInteger(+h)&&+h>=0&&+h<=24&&Number.isSafeInteger(+m)&&+m>=0&&+m<60;
}
function fmtSueno(s){
 const h=+s.suenoH,m=s.suenoM===''||s.suenoM==null?0:+s.suenoM;
 return m?`${h} h ${m} min`:`${h} h`;
}
function hoyEstado(s){
 const parts=[];
 const w=weightRecords()[0];
 if(w)parts.push(kgFmt(w.kg)+' kg');
 if(s.animo)parts.push('ánimo '+s.animo);
 if(hasSueno(s))parts.push(fmtSueno(s)+' de sueño');
 if(s.rec)parts.push('sensación '+s.rec);
 return parts.length?'Desde Hoy: '+parts.join(', ')+'.':'Hoy todavía no tiene ánimo, sueño o sensación anotados.';
}
function hoyEvaluacion(s){
 let h=`<p class="muted">${esc(hoyEstado(s))}</p>`;
 if(s.rec==='Rojo')h+='<p class="muted">Sensación en rojo: puedes elegir una opción más liviana. Tú decides.</p>';
 else if(s.animo==='Cansado'||s.animo==='Bajo')h+=`<p class="muted">Ánimo ${esc(s.animo)}: puedes elegir una sesión más corta. Tú decides.</p>`;
 return h;
}
function suenoForm(s){
 return `<form id="sueno-form" class="training-chooser"><div class="grid2"><label><span class="kicker">Horas dormidas</span><input name="suenoH" type="number" inputmode="numeric" min="0" max="24" step="1" value="${s.suenoH??''}" required placeholder="Ej. 8"></label>
 <label><span class="kicker">Minutos</span><input name="suenoM" type="number" inputmode="numeric" min="0" max="59" step="1" value="${s.suenoM??''}" placeholder="Ej. 12"></label></div>
 <button type="submit" class="prim">Anotar sueño</button></form>`;
}
function trainingPanel(){
 const s=dia(),sesiones=getSesiones();
 let h=`<p class="muted">¿Vas a entrenar?</p><div class="row">${opts(['Sí','No'],s.entrena,'entrena')}</div>`;
 if(s.entrena==='Sí'){
  const ya=weekMusculos(D);
  h+=hoyEvaluacion(s);
  h+=ya.length?`<p class="muted">Esta semana ya anotaste: ${esc(ya.join(', '))}.</p>`:'<p class="muted">Esta semana aún no anotaste un músculo.</p>';
  h+=`<form id="training-form" class="training-chooser"><label><span class="kicker">Tipo</span><select name="rama" required><option value="">Elige tu sesión…</option>${TIPOS.map(t=>`<option>${esc(t)}</option>`).join('')}</select></label>
 <label id="musculo-field" hidden><span class="kicker">¿Qué músculo vas a entrenar?</span><select name="musculo"><option value="">Elige el músculo…</option>${MUSCULOS.map(t=>`<option>${esc(t)}</option>`).join('')}</select></label>
 ${distanciaField(null,false)}${pistaFields(null,false)}
 <label><span class="kicker">Minutos disponibles</span><input name="total" type="number" inputmode="numeric" min="0" step="1" required placeholder="Ej. 40"></label>
 <button type="submit" class="prim">Armar sesión</button></form>`;
 }else if(s.entrena==='No'){
  h+=`<p class="muted">¿Descanso total o recovery day?</p><div class="row">${opts(['Descanso total','Recovery day'],s.descanso,'descanso')}</div>`;
  if(s.descanso==='Descanso total')h+='<p class="muted">Hoy queda como descanso total: no se arma sesión.</p>';
  if(s.descanso==='Recovery day'){
   h+=hoyEvaluacion(s);
   h+=`<form id="recovery-form" class="training-chooser"><label><span class="kicker">Cardio ligero</span><select name="cardio" required><option value="">Elige el cardio…</option>${CARDIO_LIGERO.map(t=>`<option>${esc(t)}</option>`).join('')}</select></label>
 <label><span class="kicker">Minutos disponibles</span><input name="total" type="number" inputmode="numeric" min="0" step="1" required placeholder="Ej. 20"></label>
 <button type="submit" class="prim">Armar recovery</button></form>`;
  }
 }
 h+=trainingLog(sesiones);
 sesiones.forEach(ses=>{
  if(!(ses.rama&&ses.minutosTotal!==''))return;
  h+=sesion(trainingPlan(ses,D),ses);
  h+=`<div class="row"><button class="${ses.hecho?'on':''}" data-hecho="${esc(ses.id)}">${ses.hecho?'Sesión hecha ✓':'Marcar sesión hecha'}</button></div>`;
  if(ses.hecho)h+=`<h3>Registro para Charles</h3>${recUI('entreno:'+D+':'+ses.id,'Cuéntale qué hiciste, carga real, cardio, cómo te sentiste y si algo dolió o quedó corto.')}<p class="muted">Queda en este teléfono. Envíamelo en este chat y se lo paso a Charles.</p>`;
 });
 return h;
}
function sessionFill(s){
 const base=trainingBase(s.rama,s.musculo,s);
 const run=s.rama==='Trote';
 const overhead=5+2+(run?1:2)+2;
 const extraCardio=run?0:15;
 const sumMin=base.blocks.reduce((n,b)=>n+b.min,0);
 const sumMax=base.blocks.reduce((n,b)=>n+b.max,0);
 return {fillMin:overhead+extraCardio+sumMin,fillMax:overhead+extraCardio+sumMax};
}
function sessionAviso(ses){
 if(!['Hipertrofia','CrossFit','Híbrido'].includes(ses.rama))return '';
 const total=Number(ses.minutosTotal),{fillMin,fillMax}=sessionFill(ses);
 if(!Number.isFinite(total)||!fillMax)return '';
 const nombre=sesionTitulo(ses);
 const rango=`unos ${fillMin} a ${fillMax} minutos, con preparación y los 20 de cardio`;
 if(total>fillMax+10){
  const otros={'Hipertrofia':'Híbrido, CrossFit','CrossFit':'Hipertrofia, Híbrido','Híbrido':'Hipertrofia, CrossFit'}[ses.rama];
  return `<p class="muted">Con ${total} minutos te sobra tiempo para ${esc(nombre)}. Ese trabajo cabe en ${rango}. Te recomiendo ${otros}, o añadir otra sesión para usar el resto; no lo dejo que lo adivines.</p>`;
 }
 if(total<fillMin){
  return `<p class="muted">Con ${total} minutos el tiempo no da del todo para ${esc(nombre)} completo (${rango}). Puedes hacerlo igual acortando series, o sumar minutos.</p>`;
 }
 return '';
}
function sesion(p,ses){
 const tipo=ses.rama;
 const titulo=p.recovery?(p.name||tipo):sesionTitulo(ses);
 let h=`<article class="training-session"><p class="kicker">Tu sesión · ${p.remaining} min por hacer</p><h3>${esc(titulo)}</h3>`+sessionAviso(ses);

 if(!p.blocks.length&&!p.recovery)h+='<p class="muted">Los ejercicios se arman contigo. Todavía no hay un listado cargado para esta sesión.</p>';
 if(!p.remaining)return h+'<p>No queda tiempo pendiente. No se añade otro entreno. Puedes cerrar la sesión y grabar tu registro en Hoy.</p></article>';
 h+=`<section class="session-block"><h4>Elongación · dinámica</h4><p>${p.dynamic?p.dynamic+' min: '+p.preparation.dynamic:'Pendiente hasta elevar temperatura; no se fuerza en frío.'}</p></section>`;
 h+=`<p class="muted">Orden real: primero 5–10 min para elevar temperatura, después dinámica y preparación específica. Nada de elongación intensa en frío. <a href="${FUENTES.hss}" target="_blank" rel="noopener">HSS</a>.</p>
 <section class="session-block"><h4>Calentamiento · general + específico</h4><p>${p.warm?`${p.warm} min: ${p.preparation.warm}.`:p.warmDone?'Ya calentaste: se omite la entrada general. Si te enfriaste, vuelve a calentar antes de cargar.':'Sin tiempo para preparar carga: no hagas fuerza ni sprints.'} ${p.warm&&p.warm<5?'Solo movimiento fácil: el tiempo no alcanza para preparar fuerza.':''} ${p.specific?`Después de la dinámica, ${p.specific} min: ${p.preparation.specific}`:''}</p><p class="source">Preparación: HSS.</p></section>`;
 if(p.short)h+='<p class="muted">Tiempo corto: solo preparación / movimiento fácil y salida. Se omiten barra y accesorios, no se aprietan los descansos.</p>';
 if(p.omitted?.length)h+=`<p class="muted">Fuera por tiempo: ${p.omitted.join(', ')}. No se añaden al final.</p>`;
 const cardioMode=p.cardioMode||(tipo==='Hipertrofia'?(ses.musculo==='Piernas'?'bicicleta fácil':'remo suave'):tipo==='CrossFit'?'bicicleta fácil':'marcha / trote conversacional; camina si hace falta');
 const cardioSrc=p.recovery?'Recovery day · cardio ligero':tipo==='Hipertrofia'?'Cardio general':tipo==='CrossFit'?'Cardio general':'Cardio general';
 const cardioBlock=(n,label)=>n?`<section class="cardio"><h4>${label} · ${n} min</h4><p>${cardioMode}. ${p.recovery?'Ritmo conversacional, sin buscar fatiga.':''} ${!p.recovery&&(tipo==='Híbrido'||p.run)?'Apoyo a tu prueba de trote: construir tolerancia, no correr al ritmo de competencia.':''}</p><p class="source">${cardioSrc}.</p></section>`:'';
 p.blocks.forEach((b,i)=>{h+=`<section class="session-block"><h4>${i+1}. ${b.name} · hasta ${b.minutes} min</h4><p class="source">Base: ${b.source} · ${b.purpose}.</p><ul>${b.items.map(x=>`<li>${x}</li>`).join('')}</ul><p class="muted">Descansa 60–120 s o más. El tiempo incluye descanso y transiciones; si no alcanza, quita una serie, no el descanso.</p></section>`});
 h+=cardioBlock((p.middle||0)+(p.last||0),'Cardio general del entrenamiento');
 h+=`<section class="session-block"><h4>Elongación estática · salida</h4><p>${p.exit?p.exit+' min reservados.':'Sin tiempo reservado: déjala para después, con el cuerpo caliente.'} ${p.preparation.static} Sostén suave 20–30 s por lado, sin rebotes; completa aparte si no cabe. No se hace en frío. Base: HSS.</p></section>
 <p class="muted">${p.recovery?'Recovery day: cardio ligero, sin fuerza ni series pesadas.':p.blocks.length?'Carga: la de hoy, 3–4 repeticiones en reserva. No porcentajes de tus marcas antiguas.':''} ${p.margin?`${p.margin} min quedan como margen: no es obligación llenarlos.`:''} ${p.blocks.length?'Los accesorios salen primero si falta tiempo. ':''}Para si duele la rodilla o la lumbar; ante mareo, dolor de pecho o falta de aire desproporcionada, detén y consulta.</p></article>`;
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
 const set=['p','c','f','k'].filter(k=>g[k]>0);
 const caja=vals=>`<div class="macros">${['p','c','f','k'].map(k=>`<div><b>${Math.round(vals[k])}</b>${lab[k]}${k!=='k'?' g':''}</div>`).join('')}</div>`;
 let h='';
 if(set.length){
  h+=`<p class="muted">A consumir hoy</p><div class="macros">${set.map(k=>`<div><b>${g[k]%1?String(g[k]).replace('.',','):g[k]}</b>${lab[k]}${k!=='k'?' g':''}</div>`).join('')}</div>`;
  if(conMacros){
   h+='<p class="muted">Consumido hasta ahora</p>'+caja(t);
   h+='<ul>'+set.map(k=>{const diff=t[k]-g[k];return `<li>${lab[k]}: ${diff>=0?`<span class="ok">alcanza</span> (+${Math.round(diff)})`:`<span class="falta">falta ${Math.round(-diff)}${k!=='k'?' g':''}</span>`} de ${g[k]}</li>`}).join('')+'</ul>';
  }
 }else{
  h+='<p class="muted">Aún no hay un resumen de macros a consumir. Se anotan en Comida → «Tus metas»; no se inventan.</p>';
  if(conMacros)h+='<p class="muted">Consumido hasta ahora</p>'+caja(t);
 }
 if(loggedSinMacros(d))h+='<p class="muted">Hay comidas de tu menú anotadas. Los macros no están calculados: Charles no me pasó esos números y no los invento.</p>';
 return h;
}

// ---------- Estudio / Espiritual ----------
const CALC={t:'Deriva f(x) = 3x² · sen(x) y evalúa f′(π/2).',h:'Pista: regla del producto, (uv)′ = u′v + uv′.',e:'Para evaluar: sen(π/2) = 1 y cos(π/2) = 0. Sustituye esos valores en f′(x).'};
function normCalc(s){
 return String(s||'').toLowerCase().replace(/π/g,'pi').replace(/seno|sin/g,'sen').replace(/coseno/g,'cos').replace(/[·•×]/g,'*').replace(/²/g,'^2').replace(/\s+/g,'');
}
function revisarCalc(txt){
 const s=normCalc(txt);
 const deriv=/6x\*?sen\(x\)/.test(s)&&/3x\^2\*?cos\(x\)/.test(s);
 const ev=/(?:^|[^0-9a-z])3\*?pi(?:[^a-z]|$)/.test(s)||/9[.,]42\d*/.test(s);
 if(deriv&&ev)return{estado:'ok',msg:'Bien: la derivada es 6x sen(x) + 3x² cos(x), y f′(π/2) = 3π.'};
 if(deriv)return{estado:'parcial',msg:'La derivada va bien: 6x sen(x) + 3x² cos(x). Para evaluar, sen(π/2) = 1 y cos(π/2) = 0, así que f′(π/2) = 6·(π/2)·1 + 3·(π/2)²·0 = 3π.'};
 if(ev)return{estado:'parcial',msg:'El valor 3π está bien, pero en la derivada faltó llegar a 6x sen(x) + 3x² cos(x).'};
 return{estado:'mal',msg:'Aún no cuadra. La derivada, con la regla del producto, es 6x sen(x) + 3x² cos(x). Luego sen(π/2) = 1 y cos(π/2) = 0, así que f′(π/2) = 3π.'};
}
const BIBLIA_KEY='hoy:biblia';
const LIBROS=[['Génesis',50],['Éxodo',40],['Levítico',27],['Números',36],['Deuteronomio',34],['Josué',24],['Jueces',21],['Rut',4],['1 Samuel',31],['2 Samuel',24],['1 Reyes',22],['2 Reyes',25],['1 Crónicas',29],['2 Crónicas',36],['Esdras',10],['Nehemías',13],['Ester',10],['Job',42],['Salmos',150],['Proverbios',31],['Eclesiastés',12],['Cantares',8],['Isaías',66],['Jeremías',52],['Lamentaciones',5],['Ezequiel',48],['Daniel',12],['Oseas',14],['Joel',3],['Amós',9],['Abdías',1],['Jonás',4],['Miqueas',7],['Nahúm',3],['Habacuc',3],['Sofonías',3],['Hageo',2],['Zacarías',14],['Malaquías',4],['Mateo',28],['Marcos',16],['Lucas',24],['Juan',21],['Hechos',28],['Romanos',16],['1 Corintios',16],['2 Corintios',13],['Gálatas',6],['Efesios',6],['Filipenses',4],['Colosenses',4],['1 Tesalonicenses',5],['2 Tesalonicenses',3],['1 Timoteo',6],['2 Timoteo',4],['Tito',3],['Filemón',1],['Hebreos',13],['Santiago',5],['1 Pedro',5],['2 Pedro',3],['1 Juan',5],['2 Juan',1],['3 Juan',1],['Judas',1],['Apocalipsis',22]];
function lecturaHoy(){
 const pos=load(BIBLIA_KEY,null);
 if(pos&&pos.libro&&pos.cap)return pos;
 return null;
}
function capsDe(libro){const x=LIBROS.find(b=>b[0]===libro);return x?x[1]:0}
function bibliaForm(pos){
 const libro=pos&&pos.libro&&capsDe(pos.libro)?pos.libro:'';
 const n=libro?capsDe(libro):0;
 const cap=pos&&pos.cap&&n&&pos.cap>=1&&pos.cap<=n?pos.cap:1;
 const libros=`<option value="">Libro…</option>`+LIBROS.map(([n])=>`<option${n===libro?' selected':''}>${n}</option>`).join('');
 const caps=n?Array.from({length:n},(_,i)=>`<option${i+1===cap?' selected':''}>${i+1}</option>`).join(''):'<option value="">Capítulo…</option>';
 return `<p class="kicker">Por dónde vas</p>
 <p class="muted">Anota libro y capítulo. El versículo se busca desde ahí, no desde Génesis 1:1.</p>
 <div class="grid2"><label><span class="kicker">Libro</span><select id="bibliaLibro">${libros}</select></label>
 <label><span class="kicker">Capítulo</span><select id="bibliaCap">${caps}</select></label></div>
 <p style="margin-top:10px"><button class="prim" data-biblia-save>Mostrar versículo</button></p>`;
}
function espiritualLectura(s,inTab){
 const pos=lecturaHoy();
 let h=`<section class="card"><h2>${inTab?'Lectura seguida':'Espiritual'}</h2>`;
 if(pos&&pos.txt)h+=`<p class="verse">«${esc(pos.txt)}»</p><p class="muted">${esc(pos.ref|| (pos.libro+' '+pos.cap))} · Reina-Valera 1909 (dominio público)</p><p class="muted">Sigue leyendo 3 páginas desde ahí en tu Biblia.</p>`;
 else if(pos)h+=`<p class="muted">Anotaste ${esc(pos.libro)} ${esc(String(pos.cap))}. El texto no se pudo cargar; vuelve a guardar con conexión.</p>`;
 else h+='<p class="muted">La lectura es seguida: el versículo del día se busca según por dónde vas, no el primero de Génesis por defecto.</p>';
 if(inTab)h+=bibliaForm(pos);
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
let tab='hoy',editSesionId=null;
function dia(){return load(dayKey(D),{})}
function setDia(p){save(dayKey(D),{...dia(),...p});render()}
const opts=(list,cur,attr)=>list.map(x=>`<button class="${x===cur?'on':''}" data-${attr}="${esc(x)}">${esc(x)}</button>`).join('');

function vHoy(){
 const s=dia();
 let h=`${weightCard()}<section class="card"><h2>Ánimo</h2><div class="row">${opts(['Bien','Normal','Cansado','Bajo'],s.animo,'animo')}</div></section>
 <section class="card"><h2>Sueño</h2>${hasSueno(s)?`<p>Anotaste ${esc(fmtSueno(s))}.</p>`:'<p class="muted">Anota las horas que dormiste. Sin ese dato no se arma un entrenamiento.</p>'}${suenoForm(s)}</section>
 <section class="card"><h2>Sensación muscular</h2><div class="row">
 ${[['Verde','g'],['Amarillo','y'],['Rojo','r']].map(([n,c])=>`<button class="${c} ${s.rec===n?'on':''}" data-rec="${n}">${n}</button>`).join('')}</div>
 ${s.rec?'':'<p class="muted">Sin tu sensación muscular no se arma un entrenamiento.</p>'}
 ${s.rec==='Rojo'?'<p class="muted">Sensación muscular en rojo: considera la versión corta o solo cardio fácil. Tú decides.</p>':''}</section>
 <section class="card"><h2>Macros de hoy</h2>${resumen(D)}</section>
 <section class="card"><h2>Estudio</h2><p>${CALC.t}</p><button data-go="estudiar">Desarrollar</button> ${s.calc?`<span class="muted">· ${s.calc}</span>`:''}</section>
 ${espiritualLectura(s,false)}`;
 return h;
}
const GRUPOS=[{id:'proteina',label:'Proteína'},{id:'carbohidratos',label:'Carbohidratos'},{id:'grasa',label:'Grasa'},{id:'vegetales',label:'Vegetales'}];
const grupoLabel=id=>(GRUPOS.find(g=>g.id===id)||{}).label||'';
function menuFoods(grupo){
 return allFoods().filter(f=>{
  if(f.grupo===grupo)return true;
  if(f.propio&&!f.grupo)return true;
  return false;
 });
}
function pickerHTML(b){
 return GRUPOS.map(g=>{
  const list=menuFoods(g.id);
  const opts=list.length?list.map(f=>`<option value="${f.id}">${esc(f.n)} — ${esc(f.u)}</option>`).join(''):'';
  return `<div class="food-pick"><span class="kicker">Opción · ${g.label}</span><div class="row"><select data-sel="${b}" data-grupo="${g.id}"><option value="">Elegir ${g.label.toLowerCase()}…</option>${opts}</select>
 <input type="number" inputmode="decimal" min="0.25" step="0.25" value="1" data-qty="${b}" data-grupo="${g.id}" style="width:90px" aria-label="porciones"><button class="sm prim" data-add="${b}" data-grupo="${g.id}">Agregar</button></div></div>`;
 }).join('');
}
function listaHTML(d,b){
 const m=load(menuKey(d),{});return (m[b]||[]).map((it,i)=>{const f=allFoods().find(x=>x.id===it.id);if(!f)return '';const x=macrosOf(f,it.q);
  const extra=[grupoLabel(it.grupo||f.grupo),f.u,f.nota,x?`P ${x.p.toFixed(1)} · C ${x.c.toFixed(1)} · G ${x.f.toFixed(1)} · ${Math.round(x.k)} kcal`:''].filter(Boolean).join(' · ');
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
 <p class="muted">En cada comida eliges proteína, carbohidratos, grasa y vegetales. Son alimentos que has comido con Charles, no un catálogo general ni un plato cerrado. Los macros se suman cuando él los tenga; no se inventan.</p>`;
 return h;
}
function vEntrenar(){
 return `<section class="card"><h2>Tu entrenamiento</h2>${trainingPanel()}</section>`;
}
function vEstudiar(){
 const s=dia();
 let h=`<section class="card"><h2>Cálculo</h2><p class="muted">Ejemplo mientras conectamos tu nivel.</p><p class="serif">${CALC.t}</p><p class="muted">${CALC.h}</p>
 <p class="muted">${CALC.e}</p>
 <textarea id="calcTxt" placeholder="Desarrolla aquí la derivada y el valor de f′(π/2)…">${esc(s.calcTxt||'')}</textarea>
 <div class="row" style="margin-top:8px"><button class="prim" data-calc-check>Comprobar</button><button class="${s.calc==='Hecho'?'on':''}" data-calc="Hecho">Hecho</button><button class="${s.calc==='Después'?'on':''}" data-calc="Después">Después</button></div>`;
 if(s.calcChk&&s.calcMsg)h+=`<p class="${s.calcChk==='ok'?'ok':s.calcChk==='mal'?'bad':'muted'}" style="margin-top:12px">${esc(s.calcMsg)}</p>`;
 h+='</section>';
 return h;
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
 if(d.entrena)return setDia({entrena:d.entrena,descanso:d.entrena==='Sí'?'':dia().descanso});
 if(d.descanso)return setDia({descanso:d.descanso});
 if(d.biblia3)return setDia({biblia3:d.biblia3});
 if('bibliaSave' in d){
  const libro=($('#bibliaLibro')||{}).value||'',cap=+(($('#bibliaCap')||{}).value||0);
  const nr=LIBROS.findIndex(x=>x[0]===libro)+1;
  if(!nr||!cap)return alert('Elige libro y capítulo.');
  try{
   b.disabled=true;b.textContent='Cargando…';
   const r=await fetch('https://api.getbible.net/v2/valera/'+nr+'/'+cap+'.json');
   if(!r.ok)throw new Error('http');
   const data=await r.json();
   const vs=(data.verses||[]).slice(0,3);
   if(!vs.length)throw new Error('vacío');
   const txt=vs.map(v=>v.verse+' '+v.text).join(' ');
   const last=vs[vs.length-1].verse;
   const ref=(data.name||(libro+' '+cap))+':1–'+last;
   save(BIBLIA_KEY,{libro,cap,nr,txt,ref});
   return render();
  }catch(err){
   save(BIBLIA_KEY,{libro,cap,nr,txt:'',ref:libro+' '+cap});
   alert('Quedó anotado '+libro+' '+cap+', pero no se pudo cargar el texto ahora. Prueba de nuevo con conexión.');
   return render();
  }
 }
 if('hecho' in d){
  const id=d.hecho,sesiones=getSesiones().map(x=>({...x,hecho:x.id===id?!x.hecho:!!x.hecho}));
  return saveSesiones(sesiones);
 }
 if(d.editSes){editSesionId=d.editSes;return render()}
 if('editCancel' in d){editSesionId=null;return render()}
 if(d.delSes){
  const id=String(d.delSes);
  if(editSesionId===id)editSesionId=null;
  return saveSesiones(getSesiones().filter(x=>String(x.id)!==id));
 }
 if('calcCheck' in d){
  const txt=($('#calcTxt')||{}).value||'';
  const r=revisarCalc(txt);
  return setDia({calcTxt:txt,calcChk:r.estado,calcMsg:r.msg});
 }
 if(d.calc)return setDia({calc:d.calc,calcTxt:$('#calcTxt').value});
 if(d.mf!==undefined){const n=+d.mf;save('hoy:menuFecha',n===0?null:addDays(menuTarget(),n));return render()}
 if(d.add){const blk=d.add,grupo=d.grupo||'',sel=document.querySelector(`select[data-sel="${blk}"]${grupo?`[data-grupo="${grupo}"]`:''}`),qty=document.querySelector(`input[data-qty="${blk}"]${grupo?`[data-grupo="${grupo}"]`:''}`);
  const id=sel&&sel.value,q=parseFloat(qty&&qty.value)||1;if(!id)return;
  const T=blk==='Extras'?D:menuTarget(),m=load(menuKey(T),{});(m[blk]=m[blk]||[]).push({id,q,grupo});save(menuKey(T),m);return render()}
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
document.addEventListener('change',e=>{
 if(e.target.id==='bibliaLibro'){
  const n=capsDe(e.target.value),sel=$('#bibliaCap');
  if(!sel)return;
  sel.innerHTML=n?Array.from({length:n},(_,i)=>`<option>${i+1}</option>`).join(''):'<option value="">Capítulo…</option>';
 }
});
document.addEventListener('submit',e=>{
 if(e.target.id==='sueno-form'){
  e.preventDefault();const f=new FormData(e.target),h=Number(f.get('suenoH')),m=f.get('suenoM')===''||f.get('suenoM')==null?0:Number(f.get('suenoM'));
  if(!Number.isSafeInteger(h)||h<0||h>24||!Number.isSafeInteger(m)||m<0||m>59)return alert('Escribe horas (0 a 24) y minutos (0 a 59).');
  return setDia({suenoH:h,suenoM:m});
 }
 if(e.target.id==='sesion-edit-form'){
  e.preventDefault();
  const id=e.target.dataset.editId,f=new FormData(e.target),total=Number(f.get('total'));
  const sesiones=getSesiones(),i=sesiones.findIndex(x=>x.id===id);
  if(i<0)return;
  const prev=sesiones[i];
  if(prev.rama==='Recovery day'&&!TIPOS.includes(f.get('rama')||'')){
   const cardio=f.get('cardio');
   if(!CARDIO_LIGERO.includes(cardio)||!Number.isSafeInteger(total)||total<0)return alert('Elige un cardio ligero y minutos enteros desde cero.');
   sesiones[i]={...prev,cardioRecovery:cardio,minutosTotal:total};
  }else{
   const rama=f.get('rama'),musculo=f.get('musculo');
   if(!TIPOS.includes(rama)||!Number.isSafeInteger(total)||total<0)return alert('Elige un tipo y minutos enteros desde cero.');
   if(rama==='Hipertrofia'&&!MUSCULOS.includes(musculo))return alert('Elige qué músculo vas a entrenar.');
   if(rama==='Trote'){const err=validTrote(f);if(err)return alert(err);}
   const extras=rama==='Trote'?readTroteFields(f):{distancia:'',pista400:'',vueltas400:'',tiempo400:''};
   sesiones[i]={...prev,rama,musculo:rama==='Hipertrofia'?musculo:'',...extras,cardioRecovery:'',minutosTotal:total};
  }
  editSesionId=null;
  return saveSesiones(sesiones);
 }
 if(e.target.id==='training-form'){
  e.preventDefault();const f=new FormData(e.target),total=Number(f.get('total')),rama=f.get('rama'),musculo=f.get('musculo');
  if(!TIPOS.includes(rama)||!Number.isSafeInteger(total)||total<0)return alert('Elige un tipo y minutos enteros desde cero.');
  if(rama==='Hipertrofia'&&!MUSCULOS.includes(musculo))return alert('Elige qué músculo vas a entrenar.');
  if(rama==='Trote'){const err=validTrote(f);if(err)return alert(err);}
  const extras=rama==='Trote'?readTroteFields(f):{distancia:'',pista400:'',vueltas400:'',tiempo400:''};
  const ses={id:'s'+Date.now(),rama,musculo:rama==='Hipertrofia'?musculo:'',...extras,minutosTotal:total,minutosHechos:0,cardioHecho:0,hecho:false};
  return saveSesiones([...getSesiones(),ses],{entrena:''});
 }
 if(e.target.id==='recovery-form'){
  e.preventDefault();const f=new FormData(e.target),total=Number(f.get('total')),cardio=f.get('cardio');
  if(!CARDIO_LIGERO.includes(cardio)||!Number.isSafeInteger(total)||total<0)return alert('Elige un cardio ligero y minutos enteros desde cero.');
  const ses={id:'s'+Date.now(),rama:'Recovery day',cardioRecovery:cardio,minutosTotal:total,minutosHechos:0,cardioHecho:0,hecho:false};
  return saveSesiones([...getSesiones(),ses]);
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
document.addEventListener('change',e=>{
 if((e.target.name==='rama'||e.target.name==='pista400')&&e.target.form&&(e.target.form.id==='training-form'||e.target.form.id==='sesion-edit-form')){
  toggleTrainingExtras(e.target.form);
 }
 const k=e.target.dataset.meta;if(k){const g=load('hoy:metas',{});const v=parseFloat(e.target.value);if(v>0)g[k]=v;else delete g[k];save('hoy:metas',g);render()}
});
document.addEventListener('input',e=>{if(e.target.id==='calcTxt')save(dayKey(D),{...dia(),calcTxt:e.target.value})});
Promise.all([
 fetch('./foods.json').then(r=>r.ok?r.json():[]).catch(()=>[]),
 fetch('./charles-menu.json').then(r=>r.ok?r.json():[]).catch(()=>[])
]).then(([usda,menu])=>{FOODS=usda;CHARLES=Array.isArray(menu)?menu:[];render()}).catch(()=>render());
render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js');
