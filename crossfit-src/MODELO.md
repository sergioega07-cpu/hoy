# Modelo actalog usado en el mapeo

## WOD (`internal/domain/wod.go`)
- `name`, `source`, `type` (Benchmark, Hero, Girl, Notables, …)
- `regime`: EMOM | AMRAP | Fastest Time | Slowest Round | Get Stronger | Skills
- `score_type`: Time (HH:MM:SS) | Rounds+Reps | Max Weight
- `description`, `is_standard`, `created_by`

## Resultado (`UserWorkoutWOD`)
- `score_value`, `time_seconds`, `rounds`, `reps`, `weight`, `rpe`, `is_pr`, `notes`

## Sesión (`UserWorkout`)
- `workout_date`, `workout_type` (strength | metcon | cardio | mixed), `total_time`, `notes`

## Qué se mapeó de Sergio
Solo WODs **con nombre** en sus Word (Everest, Lace Up, Criss Cross, Flash Flood, Professor Chaos, Boat Race).

## Qué no tiene equivalente / no se inventó
- Resultados (tiempos, rounds) — no hay bitácora CrossFit en el repo `hoy:*`.
- WODs sin nombre de Semana 10 / Everest (bloques “4time…”, “Amrarp 5…”) — quedan en el plan semanal, sin título inventado.
- PRs actuales — solo cargas históricas anotadas en analisis-ramas (marcadas como no-PR).
- Admin, scheduling, subscriptions, leaderboard de actalog — fuera de alcance Pages.
