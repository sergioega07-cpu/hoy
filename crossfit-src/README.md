# crossfit-src — borrador CrossFit / actalog (sin UI, sin publicar)

## Decisión
Reutilizar el **Vue de actalog tal cual** en GitHub Pages **no es viable** (requiere API Go + JWT; el IndexedDB es cola de sync, no demo local como openGym). Ver `VIABILIDAD.md`.

## Artefactos
- `sergio-wods.json` — 7 WODs con nombre de Sergio, campos tipo actalog (`regime`, `score_type`, `description`). Sin resultados inventados.
- `weeks_detail.json` — líneas de acondicionamiento por día (planes), sin títulos inventados.
- `MODELO.md` — campos del dominio actalog usados.
- `VIABILIDAD.md` — por qué no se embebe + propuesta de pestaña.

## No hecho (a propósito)
- Sin pestaña CrossFit en `index.html` / sin `hoy-v28`.
- Sin mock API ni UI inventada.
- Sin capturas `cf1-*.png` (no hay pantalla CrossFit que probar).
- Entrenar sigue con CrossFit / Trote / Híbrido.

## Propuesta de ubicación
Nueva pestaña **CrossFit** (espejo de Gimnasio), cuando haya camino viable (self-host o demo local). No quitar CrossFit de Entrenar hasta que Sergio lo diga.

## Pregunta para Sergio (1)
¿Preferís **self-host de actalog** (servidor Go aparte + enlace desde Templo) o que armemos un **logueo local mínimo** (modelo actalog + storage en el navegador, UI nueva, no el Vue completo)?
