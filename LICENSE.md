# Licencias de Templo

- **`comida/`** es [Waistline](https://github.com/davidhealey/waistline) (Copyright David Healey),
  carpeta `www/` del commit `6a7258b` (21-10-2026), bajo la **GNU General Public License v3.0 o posterior**
  (texto completo en [`LICENSE-GPL-3.0.txt`](LICENSE-GPL-3.0.txt) y `comida/LICENSE.txt`).
  Cambios hechos para Templo:
  - `comida/cordova.js`: reemplazo web del cordova.js original (plataforma "browser", configuración inicial en
    español con las metas de Templo, migración única de las comidas antiguas de Templo, lectura en voz alta web).
  - `comida/templo-theme.css` y `comida/index.html`: letras, colores y fondos de Templo (más el permiso de Google Fonts).
  - `comida/index.js`: tema Material forzado (`theme: "md"`), el mismo de Waistline en Android, también en iPhone.
  - `comida/activities/foods-meals-recipes/js/food-editor.js`: abrir enlaces con `window.open` en la web.
  - `comida/activities/quick-add/` (nuevo, GPL-3.0): «Agregar rápido» (buscar, gramos, Agregar) y la tarjeta de objetivo del Diario;
    ruta en `comida/index.js`, script en `comida/index.html` y contenedor en `comida/activities/diary/views/diary.html`.
  - `comida/activities/foodlist/js/foodlist.js`: resultados de Open Food Facts primero y USDA después.
  - `comida/activities/foodlist/js/open-food-facts.js`: búsqueda sin cabecera User-Agent (no se puede en la web) y con 2 reintentos.
  - Se quitaron archivos que no se usan (fuentes de Framework7, idiomas distintos de español e inglés, tests).

- **`gimnasio/`** es [openGym](https://github.com/DuarteSantos8/openGym) (Copyright Duarte Santos y colaboradores),
  build demo (`VITE_DEMO=1`, `VITE_TEMPLO=1`) del frontend, bajo la **GNU Affero General Public License v3.0 o posterior**
  (texto en [`gimnasio/LICENSE-AGPL-3.0.txt`](gimnasio/LICENSE-AGPL-3.0.txt)).
  **Compatibilidad con GPL-3.0:** la sección 13 de AGPL-3.0 y de GPL-3.0 permite combinar ambas en un solo
  trabajo; la parte openGym sigue bajo AGPL-3.0 (incluye la obligación de ofrecer el código fuente a quien
  interactúa por red) y el resto de Templo bajo GPL-3.0. El repo público cumple la oferta de fuente.
  Cambios Templo: `temploSeed.js` (rutinas/migración), `templo-theme.css` (letras/colores/fondos), media
  selectiva de ejercicios de Sergio (ver `gimnasio/exercise-media/NOTICE.md`).

- **`crossfit/`** es [garage-wod / GRGWOD](https://github.com/tribett/garage-wod) (Copyright Michael Tribett y colaboradores),
  build estático `VITE_TEMPLO=1` bajo la **MIT License** (texto en [`crossfit/LICENSE-MIT.txt`](crossfit/LICENSE-MIT.txt);
  ver también [`crossfit/NOTICE.md`](crossfit/NOTICE.md)).
  Cambios Templo: letras/colores/fondos (tema dorado), seed de WODs/semanas de Sergio (`temploSeed`), `base: './'`.

- **`trote/`** es [vdot](https://github.com/ZacBlanco/vdot) (Copyright Zac Blanco y colaboradores),
  calculadora estática (form + `tables.js`) bajo la **GNU General Public License v3.0**
  (texto en [`trote/LICENSE-GPL-3.0.txt`](trote/LICENSE-GPL-3.0.txt); ver [`trote/NOTICE.md`](trote/NOTICE.md)).
  Cambios Templo: `templo-theme.css` (letras/colores/fondos), nota de contexto; Bootstrap 5.1.3 vendored.

- Framework7 (MIT), Font Awesome y Material Icons conservan sus licencias en sus carpetas.
- Como Templo incluye Waistline (GPL-3.0), openGym (AGPL-3.0) y garage-wod (MIT), el conjunto se distribuye de forma compatible:
  openGym/`gimnasio/` bajo **AGPL-3.0-or-later**; `crossfit/` bajo **MIT**; el resto bajo **GPL-3.0 o posterior**, per §13 (AGPL/GPL).
  El código fuente completo es este repositorio público.
- Datos de alimentos: Open Food Facts (ODbL) y USDA FoodData Central (dominio público), consultados en vivo.

- **`estudiar/desk/`** es [StudyDesk](https://github.com/Limecore-Studio/StudyDesk) (Copyright Limecore Studio),
  build `VITE_TEMPLO=1` bajo **MIT** (texto en [`estudiar/desk/LICENSE-MIT.txt`](estudiar/desk/LICENSE-MIT.txt)).
  Cambios Templo: guest/onboarding por defecto, letras/colores/fondos.
- **`estudiar/tarjetas/`** es [nenrin](https://github.com/parmsam/nenrin) (MIT), flashcards con **ts-fsrs**,
  build `BASE_PATH=./` (texto en [`estudiar/tarjetas/LICENSE-MIT.txt`](estudiar/tarjetas/LICENSE-MIT.txt)).
  Tema por defecto black+yamabuki. Ver [`estudiar/NOTICE.md`](estudiar/NOTICE.md).
