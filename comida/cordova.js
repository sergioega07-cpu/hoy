/*
  cordova.js — reemplazo mínimo para correr Waistline (www/) como página web dentro de Templo.
  No es el cordova.js original: solo declara la plataforma "browser" (que Waistline ya soporta),
  prepara la configuración inicial en español con las metas de Charles (si están vacías), migra una vez las comidas
  antiguas de Templo al diario de Waistline y luego dispara "deviceready".
  Parte de Templo; se distribuye bajo GPL-3.0 o posterior junto con Waistline.
*/
window.device = { platform: "browser" };
// Equivalente web del plugin de lectura en voz alta (TTS) que usa Waistline
window.TTS = {
  getVoices: () => Promise.resolve((window.speechSynthesis && speechSynthesis.getVoices().map(v => ({ name: v.name, identifier: v.voiceURI, language: v.lang }))) || []),
  speak: o => new Promise(res => {
    if (!window.speechSynthesis) return res();
    const u = new SpeechSynthesisUtterance(typeof o === "string" ? o : o.text);
    if (o.locale) u.lang = o.locale; if (o.rate) u.rate = o.rate; if (o.pitch) u.pitch = o.pitch;
    u.onend = u.onerror = () => res(); speechSynthesis.speak(u);
  }),
  stop: () => { if (window.speechSynthesis) speechSynthesis.cancel(); return Promise.resolve(); }
};
(function() {
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } };

  // Charles (L–S, entrene o no): kcal referencia estimada; proteína meta firme.
  // Solo rellena macros sin meta (>0). Nunca sobrescribe un valor ya puesto.
  const CHARLES = { calories: "1870", proteins: "205", carbohydrates: "135", fat: "50" };
  function goalPositivo(stat) {
    const list = (stat && stat["goal-list"]) || [];
    const x = list[list.length - 1];
    if (!x || !x.goal) return false;
    if (x["shared-goal"]) return parseFloat(x.goal[0]) > 0;
    return x.goal.some(v => parseFloat(v) > 0);
  }
  function aplicarMetasCharles(s, m) {
    if (!s || !s.goals) return false;
    const map = { calories: "k", proteins: "p", carbohydrates: "c", fat: "f" };
    let cambio = false;
    for (const stat in CHARLES) {
      if (goalPositivo(s.goals[stat])) continue; // no tocar meta existente
      const fromHoy = m && m[map[stat]];
      const v = fromHoy > 0 ? String(fromHoy) : CHARLES[stat];
      s.goals[stat] = s.goals[stat] || {};
      s.goals[stat]["show-in-diary"] = true;
      s.goals[stat]["show-in-stats"] = true;
      s.goals[stat]["goal-list"] = [{ "shared-goal": true, goal: [v, "", "", "", "", "", ""] }];
      cambio = true;
    }
    return cambio;
  }
  // Usuarios que ya tienen settings pero con metas vacías: rellenar Charles
  function metasCharlesSiVacias() {
    const s = load("settings", null);
    if (!s) return;
    if (!aplicarMetasCharles(s, load("hoy:metas", {}))) return;
    localStorage.setItem("settings", JSON.stringify(s));
    settings = s;
  }

  // Primera vez: configuración por defecto de Waistline + español, modo oscuro, comidas de Templo y metas de Charles
  function primeraConfig() {
    if (localStorage.getItem("settings") !== null) return;
    app.Settings.firstTimeSetup();
    const s = JSON.parse(localStorage.getItem("settings"));
    s.appearance.mode = "dark";
    s.appearance.locale = "es";
    s.appearance["start-page"] = "/diary/";
    s.diary["meal-names"] = ["Desayuno", "Almuerzo", "Cena", "Snacks", "", "", ""];
    s.integration.usda = true;
    s.integration["search-language"] = "es";
    s.integration["search-country"] = "Chile";
    s.integration["usda-key"] = "DEMO_KEY"; // clave pública de demostración de api.data.gov
    // Primera vez: pisar defaults de Waistline con hoy:metas o Charles (L–S)
    const m = load("hoy:metas", {});
    const map = { calories: "k", proteins: "p", carbohydrates: "c", fat: "f" };
    for (const stat in CHARLES) {
      const fromHoy = m[map[stat]];
      const v = fromHoy > 0 ? String(fromHoy) : CHARLES[stat];
      s.goals[stat]["goal-list"] = [{ "shared-goal": true, goal: [v, "", "", "", "", "", ""] }];
    }
    s.goals.kilojoules["show-in-diary"] = false;
    s.goals.kilojoules["goal-list"] = [{ "shared-goal": true, goal: ["", "", "", "", "", "", ""] }];
    localStorage.setItem("settings", JSON.stringify(s));
    settings = s; // variable global que index.js ya leyó antes de esta configuración
  }

  // Configuraciones ya creadas: Open Food Facts en español y Chile (solo si seguían en los valores por defecto)
  function offEnEspanol() {
    if (localStorage.getItem("hoy:offChile")) return;
    const s = load("settings", null);
    if (s && s.integration) {
      if (!s.integration["search-language"] || s.integration["search-language"] === "Default") s.integration["search-language"] = "es";
      if (!s.integration["search-country"] || s.integration["search-country"] === "All") s.integration["search-country"] = "Chile";
      localStorage.setItem("settings", JSON.stringify(s));
      settings = s;
    }
    localStorage.setItem("hoy:offChile", "1");
  }

  const req = r => new Promise((ok, ko) => { r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error) });

  // Una sola vez: comidas antiguas de Templo (hoy:menu:AAAA-MM-DD) → diario de Waistline.
  // Solo se migran alimentos con macros (alimentos propios y la lista USDA). Los datos antiguos quedan intactos.
  async function migrarTemplo() {
    if (localStorage.getItem("hoy:waistlineMigrado")) return;
    const dias = Object.keys(localStorage).filter(k => /^hoy:menu:\d{4}-\d{2}-\d{2}$/.test(k));
    const propios = load("hoy:alimentos", []);
    let usda = [];
    if (dias.length) usda = await fetch("../foods.json").then(r => r.ok ? r.json() : []).catch(() => []);
    const cat = { Desayuno: 0, Almuerzo: 1, Cena: 2, Snacks: 3, Extras: 3 };
    const ids = {};
    async function foodId(oldId) {
      if (ids[oldId] !== undefined) return ids[oldId];
      let f = propios.find(x => x.id === oldId), food;
      if (f) food = { name: f.n, portion: "1", unit: f.u || "porción", nutrition: { calories: +f.k || 0, proteins: +f.p || 0, carbohydrates: +f.c || 0, fat: +f.f || 0 } };
      else if ((f = usda.find(x => x.id === oldId))) food = { name: f.n, portion: "100", unit: "g", nutrition: { calories: f.k, proteins: f.p, carbohydrates: f.c, fat: f.f } };
      if (!food) return (ids[oldId] = null); // p. ej. platos del menú antiguo sin macros: no se pasan
      food.dateTime = new Date(); food.archived = false; food.categories = [];
      ids[oldId] = await req(DB.transaction("foodList", "readwrite").objectStore("foodList").put(food));
      return ids[oldId];
    }
    for (const k of dias) {
      const [y, mo, d] = k.slice(9).split("-").map(Number), menu = load(k, {}), items = [];
      for (const meal in cat) for (const it of (menu[meal] || [])) {
        const id = await foodId(it.id);
        if (id == null) continue;
        const f = propios.find(x => x.id === it.id) || usda.find(x => x.id === it.id);
        items.push({ id, type: "food", portion: propios.includes(f) ? "1" : String(f.g), quantity: String(it.q ?? 1), dateTime: new Date(), category: cat[meal] });
      }
      if (!items.length) continue;
      const dateTime = new Date(Date.UTC(y, mo - 1, d));
      const store = DB.transaction("diary", "readwrite").objectStore("diary");
      const prev = await req(store.index("dateTime").get(dateTime));
      if (prev) { prev.items = prev.items.concat(items); await req(DB.transaction("diary", "readwrite").objectStore("diary").put(prev)); }
      else await req(DB.transaction("diary", "readwrite").objectStore("diary").put({ dateTime, items, stats: {} }));
    }
    localStorage.setItem("hoy:waistlineMigrado", new Date().toISOString());
  }

  window.addEventListener("load", async () => {
    try { primeraConfig(); metasCharlesSiVacias(); offEnEspanol(); } catch (e) { console.log("config", e); }
    try { await dbHandler.initializeDb(); await migrarTemplo(); } catch (e) { console.log("migración", e); }
    // Desde Hoy, "Sin meta — ponla en Objetivos" abre directo la pantalla de Objetivos
    if (localStorage.getItem("hoy:irObjetivos")) {
      localStorage.removeItem("hoy:irObjetivos");
      const ir = (e) => { if (e.target.matches(".page[data-name='diary']")) { document.removeEventListener("page:afterin", ir); app.f7.views.main.router.navigate("/goals/"); } };
      document.addEventListener("page:afterin", ir);
    }
    document.dispatchEvent(new Event("deviceready"));
  });
})();
