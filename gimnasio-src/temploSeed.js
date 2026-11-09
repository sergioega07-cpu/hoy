// Seed Templo → openGym: rutinas de hipertrofia de Sergio + migración de bitácora hoy:*.
// AGPL-3.0-or-later (openGym) / combined work con Templo (GPL-3.0).
import { uid, isoOf } from './format.js'

export const TEMPLO_EX_MAP = {
  'Sentadilla': { id: '0043', sets: 4, reps: 12 },
  'Estocadas': { id: '0336', sets: 4, reps: 12 },
  'Extensión de cuádriceps': { id: '0585', sets: 3, reps: 12 },
  'Peso muerto con barra y mancuernas': { id: '0032', sets: 3, reps: 12 },
  'Hack': { id: '0743', sets: 4, reps: 20 },
  'Gemelos': { id: '0594', sets: 4, reps: 20 },
  'Abdomen': { id: '0736', sets: 4, reps: 15 },
  'Press en banca con barra': { id: '0025', sets: 4, reps: 12 },
  'Press inclinado con mancuernas': { id: '0314', sets: 4, reps: 9 },
  'Fondos en paralelas': { id: '0251', sets: 4, reps: 15 },
  'Press declinado': { id: '0033', sets: 4, reps: 15 },
  'Remo inclinado con barra': { id: '0027', sets: 3, reps: 12 },
  'Remo con mancuerna': { id: '0292', sets: 4, reps: 15 },
  'Dominadas': { id: '0652', sets: 3, reps: 12 },
  'Remo en polea': { id: '2330', sets: 4, reps: 15 },
  'Press militar': { id: '0091', sets: 4, reps: 12 },
  'Vuelos laterales': { id: '0334', sets: 4, reps: 15 },
  'Press Arnold': { id: '2137', sets: 4, reps: 12 },
  'Vuelos posteriores': { id: '0378', sets: 4, reps: 18 },
  'Curl de bíceps con mancuernas': { id: '0294', sets: 4, reps: 10 },
  'Curl en banco Scott': { id: '0372', sets: 4, reps: 10 },
  'Extensión de tríceps en polea': { id: '0241', sets: 4, reps: 15 },
  'Press francés': { id: '0060', sets: 4, reps: 12 },
  'Fondos entre bancos': { id: '0129', sets: 4, reps: 20 },
  'Plancha': { id: '0463', sets: 3, sec: 30, mode: 'time' },
  'Extensión lumbar': { id: '0489', sets: 4, reps: 20 }
}

function exFrom(nameEs) {
  const m = TEMPLO_EX_MAP[nameEs]
  if (!m) return null
  if (m.mode === 'time') return { id: m.id, sets: m.sets, sec: m.sec, weight: 0, mode: 'time' }
  if (m.mode === 'cardio') return { id: m.id, sets: m.sets, min: m.min, weight: 0, mode: 'cardio' }
  return { id: m.id, sets: m.sets, reps: m.reps, weight: 0 }
}

function routine(name, emoji, names, extra = []) {
  return { id: uid(), name, emoji, ex: names.map(exFrom).filter(Boolean).concat(extra) }
}

export function temploNameToId(name) {
  const m = TEMPLO_EX_MAP[name]
  if (m) return m.id
  if (/cardio|bici|escalera|remo/i.test(name || '')) return '2138'
  return null
}

function loadJSON(k, d) {
  try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v } catch { return d }
}

// "12" → [12]; "12/10/8" → [12,10,8]; vacío → []
function parseReps(reps, nSets) {
  const s = String(reps ?? '').trim()
  if (!s) return Array.from({ length: nSets }, () => null)
  if (s.includes('/')) {
    return s.split('/').map(x => {
      const n = Number(String(x).trim().replace(',', '.'))
      return Number.isFinite(n) && n >= 0 ? n : null
    })
  }
  const n = Number(s.replace(',', '.'))
  const r = Number.isFinite(n) && n >= 0 ? n : null
  return Array.from({ length: Math.max(1, nSets) }, () => r)
}

function parseKg(kg) {
  if (kg === '' || kg == null) return 0
  const n = Number(String(kg).replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : 0
}

// Migra hoy:dia:* sesiones con cargas[] → workouts openGym
export function migrateTemploWorkouts(routines) {
  const workouts = []
  const customEx = []
  const seenCustom = new Set()
  const byName = Object.fromEntries((routines || []).map(r => [r.name, r]))

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !/^hoy:dia:\d{4}-\d{2}-\d{2}$/.test(key)) continue
    const date = key.slice(8)
    const day = loadJSON(key, {})
    const sesiones = Array.isArray(day.sesiones) ? day.sesiones
      : (day.rama ? [day] : [])
    sesiones.forEach((ses, idx) => {
      const cargas = Array.isArray(ses.cargas) ? ses.cargas : []
      if (!cargas.length) return
      const entries = []
      cargas.forEach(c => {
        if (!c || !c.name) return
        let id = temploNameToId(c.name)
        if (!id) {
          // Sin equivalente en catálogo: customEx con el nombre de Sergio
          id = 'templo_' + c.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40)
          if (!seenCustom.has(id)) {
            seenCustom.add(id)
            customEx.push({ id, n: c.name, eq: 'other', bp: 'other', tg: 'other', mg: 'other', _ts: Date.now() })
          }
        }
        const nSets = (c.series !== '' && c.series != null) ? Number(c.series) : 0
        const repsList = parseReps(c.reps, nSets > 0 ? nSets : 1)
        const setsCount = Math.max(nSets || 0, repsList.length, 1)
        const w = parseKg(c.kg)
        const sets = []
        for (let s = 0; s < setsCount; s++) {
          const r = repsList[s] != null ? repsList[s] : (repsList[0] != null ? repsList[0] : 0)
          sets.push({ w, r, done: true })
        }
        if (!sets.some(x => x.r > 0 || x.w > 0)) return
        entries.push({ id, sets, topW: w || null })
      })
      if (!entries.length) return
      let routineId = null, name = ses.musculo ? ('Hipertrofia · ' + ses.musculo) : (ses.rama || 'Sesión Templo')
      if (ses.musculo === 'Piernas' && byName['Piernas (mié/sáb)']) {
        routineId = byName['Piernas (mié/sáb)'].id
        name = byName['Piernas (mié/sáb)'].name
      } else if (ses.musculo && byName[ses.musculo]) {
        routineId = byName[ses.musculo].id
        name = byName[ses.musculo].name
      }
      const start = new Date(date + 'T18:00:00').getTime() + idx * 3600000
      const cierre = ses.cierre || {}
      const note = [cierre.como, cierre.rpe != null && cierre.rpe !== '' ? ('RPE ' + cierre.rpe) : '']
        .filter(Boolean).join(' · ')
      const w = {
        id: uid(),
        d: date,
        start,
        end: start + (Number(ses.minutosTotal) || 60) * 60000,
        routineId,
        name,
        entries,
        prs: [],
        vol: entries.reduce((v, e) => v + e.sets.reduce((n, s) => n + (s.w || 0) * (s.r || 0), 0), 0),
        note: note || undefined,
        _templo: true
      }
      workouts.push(w)
    })
  }
  workouts.sort((a, b) => a.start - b.start)
  return { workouts, customEx }
}

export function migrateTemploBodyweight() {
  const rec = loadJSON('hoy:peso', [])
  return (Array.isArray(rec) ? rec : [])
    .filter(x => x && x.date && Number.isFinite(+x.kg))
    .map(x => ({ d: x.date, w: +x.kg, t: new Date(x.date + 'T08:00:00').getTime() }))
    .sort((a, b) => a.d < b.d ? -1 : 1)
}

export function buildTemploState() {
  const piernas = routine('Piernas (mié/sáb)', 'legs', [
    'Sentadilla', 'Estocadas', 'Extensión de cuádriceps',
    'Peso muerto con barra y mancuernas', 'Hack', 'Gemelos', 'Abdomen'
  ], [{ id: '2138', sets: 1, min: 20, weight: 0, mode: 'cardio' }])

  const pecho = routine('Pecho', 'barbell', [
    'Press en banca con barra', 'Press inclinado con mancuernas',
    'Fondos en paralelas', 'Press declinado'
  ])
  const espalda = routine('Espalda', 'pullup', [
    'Remo inclinado con barra', 'Remo con mancuerna', 'Dominadas', 'Remo en polea'
  ])
  const hombros = routine('Hombros', 'barbell', [
    'Press militar', 'Vuelos laterales', 'Press Arnold', 'Vuelos posteriores'
  ])
  const brazos = routine('Brazos', 'barbell', [
    'Curl de bíceps con mancuernas', 'Curl en banco Scott',
    'Extensión de tríceps en polea', 'Press francés', 'Fondos entre bancos'
  ])
  const core = routine('Core', 'figureStrength', [
    'Plancha', 'Abdomen', 'Extensión lumbar'
  ])

  const routines = [piernas, pecho, espalda, hombros, brazos, core]
  const week = { 3: piernas.id, 6: piernas.id } // miércoles y sábado

  const { workouts, customEx } = migrateTemploWorkouts(routines)
  const bodyweight = migrateTemploBodyweight()

  try { localStorage.setItem('hoy:opengymMigrado', new Date().toISOString()) } catch {}

  return {
    unit: 'kg',
    lang: 'es',
    theme: 'dark',
    accent: 'gold',
    body: 'male',
    weekStart: 1,
    effort: 'rir',
    routines,
    week,
    dayPlan: {},
    workouts,
    bodyweight,
    measurements: [],
    exWeights: {},
    customEx,
    targetW: 80
  }
}
