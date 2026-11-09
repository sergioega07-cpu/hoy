/*
  quick-add.js — Templo: "Agregar rápido" y tarjeta de objetivo sobre el Diario de Waistline.
  Usa el modelo y las funciones de Waistline (Open Food Facts, USDA, foodList, diario, metas).
  Copyright 2026 Templo. Software libre bajo la GNU General Public License v3.0 o posterior,
  igual que Waistline (Copyright David Healey). Ver ../../../LICENSE.txt.
*/
app.QuickAdd = {
  category: 0,
  recientes: [],
  resultados: [],
  sheet: undefined,

  isGram: (unit) => /^(g|gr|gramos?|ml)$/i.test(String(unit || "").trim()),
  fmt: (n) => (Math.round(n * 10) / 10).toLocaleString("es-CL"),

  open: function(category) {
    app.QuickAdd.category = category;
    app.f7.views.main.router.navigate("/diary/quick-add/");
  },

  init: async function() {
    const page = document.querySelector(".page[data-name='quick-add']");
    const mealNames = app.Settings.get("diary", "meal-names") || [];
    const meal = mealNames[app.QuickAdd.category] || "";
    page.querySelector("#qa-title").innerText = "Agregar a " + (app.strings.diary && app.strings.diary["default-meals"] && app.strings.diary["default-meals"][meal.toLowerCase()] || meal);
    const q = page.querySelector("#qa-q");
    page.querySelector("#qa-form").addEventListener("submit", (e) => { e.preventDefault(); app.QuickAdd.buscar(q.value); q.blur(); });
    page.querySelector("#qa-buscar").addEventListener("click", (e) => { e.preventDefault(); app.QuickAdd.buscar(q.value); });
    q.addEventListener("input", () => app.QuickAdd.filtrarRecientes(q.value));

    // Antes de escribir: alimentos guardados, los más recientes primero
    const todos = await dbHandler.getAllItems("foodList");
    app.QuickAdd.recientes = todos.filter((x) => !x.archived && !x.hidden && x.barcode !== "quick-add")
      .sort((a, b) => new Date(b.dateTime || 0) - new Date(a.dateTime || 0));
    app.QuickAdd.filtrarRecientes("");
    setTimeout(() => q.focus(), 300);
  },

  filtrarRecientes: function(query) {
    const t = String(query || "").toLowerCase().trim();
    const list = app.QuickAdd.recientes.filter((x) => !t || String(x.name || "").toLowerCase().includes(t) || String(x.brand || "").toLowerCase().includes(t));
    app.QuickAdd.mostrar(list.slice(0, 40), t ? "Tus alimentos que coinciden" : "Tus alimentos", list.length ? "" : (t ? "Toca Buscar para buscar en Open Food Facts." : "Aún no tienes alimentos guardados. Escribe y toca Buscar."));
  },

  buscar: async function(query) {
    query = String(query || "").trim();
    if (!query) return;
    app.QuickAdd.mostrar([], "Buscando…", "");
    app.f7.preloader.show();
    // Open Food Facts primero (español, Chile); USDA solo si OFF trae pocos resultados
    let off = await app.OpenFoodFacts.search(query).catch(() => undefined);
    let result = off || [];
    if (result.length < 5 && app.Settings.get("integration", "usda") && app.Settings.get("integration", "usda-key") != "") {
      const usda = await app.USDA.search(query).catch(() => undefined);
      if (usda) result = result.concat(usda);
    }
    app.f7.preloader.hide();
    const propios = app.QuickAdd.recientes.filter((x) => String(x.name || "").toLowerCase().includes(query.toLowerCase()));
    app.QuickAdd.mostrar(propios.slice(0, 5).concat(result), "Resultados", result.length || propios.length ? "" :
      (off === undefined ? "Open Food Facts no respondió. Prueba de nuevo en unos segundos." : "Sin resultados."));
  },

  mostrar: function(items, titulo, estado) {
    const page = document.querySelector(".page[data-name='quick-add']");
    if (!page) return;
    app.QuickAdd.resultados = items;
    page.querySelector("#qa-lista-titulo").innerText = titulo;
    page.querySelector("#qa-estado").innerText = estado || "";
    const ul = page.querySelector("#qa-lista ul");
    ul.innerHTML = "";
    items.forEach((item, i) => {
      const n = item.nutrition || {};
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" class="item-link item-content"><div class="item-inner">
        <div class="item-title-row"><div class="item-title"></div><div class="item-after"></div></div>
        <div class="item-subtitle"></div><div class="item-text"></div></div></a>`;
      li.querySelector(".item-title").innerText = item.name || "";
      li.querySelector(".item-after").innerText = n.calories != undefined ? Math.round(n.calories) + " kcal" : "";
      li.querySelector(".item-subtitle").innerText = [item.brand, (item.portion || "") + " " + (item.unit || "")].filter((x) => x && String(x).trim()).join(" · ");
      li.querySelector(".item-text").innerText = ["P " + app.QuickAdd.fmt(n.proteins || 0), "C " + app.QuickAdd.fmt(n.carbohydrates || 0), "G " + app.QuickAdd.fmt(n.fat || 0)].join(" · ") +
        (item.id === undefined ? (String(item.barcode || "").startsWith("fdcId_") ? " · USDA" : " · Open Food Facts") : "");
      li.querySelector("a").addEventListener("click", (e) => { e.preventDefault(); app.QuickAdd.abrirGramos(i); });
      ul.appendChild(li);
    });
  },

  abrirGramos: function(i) {
    const item = app.QuickAdd.resultados[i];
    if (!item) return;
    const enGramos = app.QuickAdd.isGram(item.unit);
    const base = parseFloat(item.portion) || (enGramos ? 100 : 1);
    const unidad = enGramos ? item.unit : (item.unit || "porción");
    const valorInicial = enGramos ? base : 1;
    const esc = (s) => app.Utils.escapeHtml(String(s ?? ""));
    const html = `<div class="sheet-modal qa-sheet" style="height:auto">
      <div class="sheet-modal-inner"><div class="block" style="margin:16px 0">
        <div class="qa-nombre">${esc(item.name)}</div>
        <div class="item-subtitle" style="opacity:.8">${esc([item.brand, base + " " + unidad].filter(Boolean).join(" · "))}</div>
        <div class="list" style="margin:12px 0"><ul><li class="item-content item-input"><div class="item-inner">
          <div class="item-title item-label">${enGramos ? (unidad.toLowerCase() === "ml" ? "Mililitros" : "Gramos") : "Porciones de " + esc(base + " " + unidad)}</div>
          <div class="item-input-wrap"><input type="number" inputmode="decimal" min="0" step="any" id="qa-g" value="${valorInicial}"></div>
        </div></li></ul></div>
        <div class="row qa-preview" style="text-align:center;margin-bottom:16px"></div>
        <a href="#" class="button button-fill button-large" id="qa-agregar">Agregar</a>
      </div></div></div>`;
    if (app.QuickAdd.sheet) app.QuickAdd.sheet.destroy();
    app.QuickAdd.sheet = app.f7.sheet.create({ content: html, backdrop: true, swipeToClose: true, closeByBackdropClick: true });
    const el = app.QuickAdd.sheet.el, input = el.querySelector("#qa-g");
    const factor = () => { const v = parseFloat(String(input.value).replace(",", ".")) || 0; return enGramos ? v / base : v; };
    const preview = () => {
      const n = item.nutrition || {}, f = factor();
      el.querySelector(".qa-preview").innerHTML = [["kcal", n.calories, 0], ["Proteína", n.proteins, 1], ["Carbos", n.carbohydrates, 1], ["Grasa", n.fat, 1]]
        .map(([l, v, d]) => `<div class="col"><b>${d ? app.QuickAdd.fmt((v || 0) * f) : Math.round((v || 0) * f)}</b><br><small>${l}${d ? " g" : ""}</small></div>`).join("");
    };
    input.addEventListener("input", preview);
    preview();
    el.querySelector("#qa-agregar").addEventListener("click", async (e) => {
      e.preventDefault();
      const v = parseFloat(String(input.value).replace(",", ".")) || 0;
      if (v <= 0) return app.Utils.toast("Escribe una cantidad mayor que cero");
      // Guarda el alimento en la lista si es nuevo (función de Waistline) y lo anota en esta comida
      const data = await app.Foodlist.getItemFromSelectedData(JSON.parse(JSON.stringify(item)));
      const entrada = enGramos ? { id: data.id, portion: String(v), quantity: "1", type: "food" } : { id: data.id, portion: String(data.portion), quantity: String(v), type: "food" };
      app.QuickAdd.sheet.close();
      app.data.context = { items: [entrada], category: app.QuickAdd.category };
      app.f7.views.main.router.back();
    });
    app.QuickAdd.sheet.open();
    setTimeout(() => { input.focus(); input.select(); }, 350);
  }
};

// ---- Tarjeta de objetivo arriba del Diario ----
app.Templo = {
  pesoActual: function() {
    let r = [];
    try { r = JSON.parse(localStorage.getItem("hoy:peso")) || []; } catch (e) {}
    r = r.filter((x) => x && x.date && Number.isFinite(+x.kg)).sort((a, b) => a.date < b.date ? 1 : -1);
    return r.length ? +r[0].kg : 88.9;
  },
  cardHTML: function(totales, metas) {
    const peso = app.Templo.pesoActual().toFixed(1).replace(".", ",");
    const filas = [["calories", "kcal", ""], ["proteins", "Proteína", " g"], ["carbohydrates", "Carbohidratos", " g"], ["fat", "Grasa", " g"]].map(([k, l, u]) => {
      const c = totales[k] || 0, m = metas[k];
      if (!(m > 0)) return `<div class="templo-fila"><div class="templo-fila-top"><span>${l}</span><span>${Math.round(c)}${u}</span></div>
        <a href="#" class="templo-sin-meta" data-templo-metas>Sin meta — ponla en Objetivos</a></div>`;
      const pct = Math.min(100, c / m * 100), q = m - c;
      return `<div class="templo-fila"><div class="templo-fila-top"><span>${l}</span><span>${Math.round(c)} / ${Math.round(m)}${u}</span></div>
        <div class="templo-barra"><span style="width:${pct}%"></span></div>
        <div class="templo-quedan">${q >= 0 ? "te quedan " + Math.round(q) + u : "pasaste " + Math.round(-q) + u}</div></div>`;
    }).join("");
    return `<div class="card templo-card"><div class="card-content card-content-padding">
      <div class="templo-objetivo">Objetivo: bajar de ${peso} a 79–81 kg</div>
      <div class="templo-nota">kcal: referencia estimada · proteína: meta firme</div>${filas}</div></div>`;
  },
  renderDiario: async function() {
    const box = document.querySelector(".page[data-name='diary'] #templo-objetivo");
    if (!box || app.Diary.date === undefined) return;
    const entry = await app.Diary.getEntryFromDB();
    const totales = entry ? await app.FoodsMealsRecipes.getTotalNutrition(entry.items, "ignore") : {};
    const stats = ["calories", "proteins", "carbohydrates", "fat"];
    let metas = {};
    try {
      const g = await app.Goals.getGoals(stats, new Date(app.Diary.date));
      stats.forEach((s) => { metas[s] = g[s] && parseFloat(g[s].goal); });
    } catch (e) {}
    box.innerHTML = app.Templo.cardHTML(totales, metas);
    box.querySelectorAll("[data-templo-metas]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); app.f7.views.main.router.navigate("/goals/"); }));
  }
};

// El "+" de cada comida abre Agregar rápido; la lista completa de Waistline sigue en el menú
app.Diary.gotoFoodlist = function(category) { app.QuickAdd.open(category); };

// Después de cada dibujo del Diario, actualizar la tarjeta de objetivo
(function() {
  const render = app.Diary.render;
  app.Diary.render = async function() {
    const r = await render.apply(this, arguments);
    app.Templo.renderDiario();
    return r;
  };
})();

document.addEventListener("page:init", (e) => {
  if (e.target.matches(".page[data-name='quick-add']")) app.QuickAdd.init();
});

// Al volver al Diario (p. ej. desde Objetivos) también se actualiza la tarjeta
document.addEventListener("page:afterin", (e) => {
  if (e.target.matches(".page[data-name='diary']")) app.Templo.renderDiario();
});
