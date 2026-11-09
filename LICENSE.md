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
  - Se quitaron archivos que no se usan (fuentes de Framework7, idiomas distintos de español e inglés, tests).
- Framework7 (MIT), Font Awesome y Material Icons conservan sus licencias en sus carpetas.
- Como Templo incluye y usa ese código, Templo en su conjunto se distribuye bajo **GPL-3.0 o posterior**.
  El código fuente completo es este repositorio público.
- Datos de alimentos: Open Food Facts (ODbL) y USDA FoodData Central (dominio público), consultados en vivo.
