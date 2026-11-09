# Estudiar · StudyDesk + nenrin (FSRS)

- **`desk/`** — [Limecore-Studio/StudyDesk](https://github.com/Limecore-Studio/StudyDesk) (MIT). Planner + pomodoro. Build `VITE_TEMPLO=1`, `base: './'`. Guest mode + onboarding skipped for Templo embed; theme letters/colors/backgrounds. Sync/auth optional (guest = local only).
- **`tarjetas/`** — [parmsam/nenrin](https://github.com/parmsam/nenrin) (MIT). Flashcards with **ts-fsrs**. Build `BASE_PATH=./`. Default theme black+yamabuki. Pre-alpha upstream.

Templo keeps the native Cálculo card until Sergio decides; these embeds are additive.
- Tarjetas de Sergio (Álgebra 76 + Cálculo · Stewart 125) en `tarjetas/templo/*.tsv`; se importan solas al abrir (`src/lib/templo-seed.ts`, importador de nenrin, duplicados se saltan, flag `templo:tarjetas:seeded-v1`).
