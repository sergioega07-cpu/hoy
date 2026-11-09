# CrossFit × actalog — viabilidad en Templo (estático / GitHub Pages)

## Qué es actalog
- Backend **Go** + frontend **Vue 3 / Vuetify** (MIT).
- PWA con IndexedDB, pero el offline es **cola de sync** hacia `/api/*`, no un modo demo autónomo.
- Casi todas las pantallas útiles (loguear WOD, calendario, biblioteca, PRs) exigen **JWT** y API (`/api/wods`, `/api/workouts`, `/api/movements`, auth, subscription…).

## Comparación con openGym
| | openGym | actalog |
|---|---|---|
| Demo estático | `VITE_DEMO=1` guest + localStorage | No existe |
| Offline | Estado completo local | Cola para sync cuando hay red |
| Auth | Opcional en demo | Obligatoria para rutas de entrenamiento |

## Conclusión
**No es viable** embeber el Vue de actalog “tal cual” en Pages (como Gimnasio/openGym) sin:
1. inventar un **mock API** amplio (auth + decenas de endpoints + datos de movements), o
2. **self-host** del binario Go en otro lado e iframe/enlace.

Inventar (1) sería un backend paralelo, no “reutilizar tal cual”. Por la regla del brief (**reportar antes de inventar**), **no se integra UI CrossFit en este borrador**.

## Modelo que sí se reutiliza (datos)
Ver `sergio-wods.json`: WODs con nombre de las semanas de Sergio, campos alineados a `domain.WOD` / `UserWorkoutWOD` (regime AMRAP / Fastest Time / EMOM, score_type, description).

## Dónde debería vivir (propuesta)
**Pestaña nueva “CrossFit”** (junto a Gimnasio): misma filosofía de sección = repo.  
Entrenar **sigue** con CrossFit/Trote/Híbrido hasta que Sergio diga quitarlo.

## Caminos posibles después
A. Self-host actalog (Docker) y abrir desde Templo.  
B. Invertir en mock API local mínimo solo para LogWorkout + WODs (proyecto aparte).  
C. Esperar a que actalog tenga modo guest/demo estático.

## Cache
No se sube a hoy-v28: no hay sección CrossFit servible. El árbol queda en `crossfit-src/` sin commit de publicación.
