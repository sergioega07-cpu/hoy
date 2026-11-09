# Build CrossFit (garage-wod) para Templo

No publicar sin «hazlo».

```bash
cd /workspace/garage-wod-src
pnpm install
VITE_TEMPLO=1 pnpm run build
rm -rf /workspace/hoy/crossfit && mkdir -p /workspace/hoy/crossfit
cp -a dist/. /workspace/hoy/crossfit/
cp LICENSE /workspace/hoy/crossfit/LICENSE-MIT.txt
```

Parches: tema dorado, `temploSeed.ts`, `sergio-benchmarks.ts`, `sergio-weeks-program.ts`, `base: './'`.
