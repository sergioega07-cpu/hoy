# Build Gimnasio (openGym) para Templo

No publicar sin «hazlo».

```bash
cd /workspace/openGym-src/frontend
npm ci
VITE_DEMO=1 VITE_TEMPLO=1 npm run build
# copiar dist → /workspace/hoy/gimnasio/
# stage media selectiva (ver script en historial del agente)
# parches: temploSeed.js, demoSeed.js (VITE_TEMPLO), demo.js (gym_templo_seeded_v1)
```

Licencia: AGPL-3.0-or-later (openGym) combinable con GPL-3.0 (§13).
