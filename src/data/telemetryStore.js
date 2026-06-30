import { create } from 'zustand'
import { ASSETS, ASSET_BY_ID } from './assets.config'

// Staged opening shift — an operating mine: most running, a few idle, 1 maintenance, 1 alarm.
const STAGE = {
  exploration: 'idle', drill: 'running', blast: 'idle', shovel: 'running',
  truck1: 'running', truck2: 'running', truck3: 'running', truck4: 'maintenance', truck5: 'alarm',
  crusher: 'running', screen: 'running', mill: 'running', cyclone: 'running',
  flotation: 'running', thickener: 'running', filter: 'running', stacker: 'running',
  rail: 'running', shiploader: 'running', ship: 'running', smelter: 'running',
}
const HEALTH = { truck5: 58, truck4: 72 }   // alarm / maintenance assets read lower
const HIST = 48                              // history ring length (for charts)
const rnd = (a, b) => a + Math.random() * (b - a)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

function seedAsset(a) {
  const metrics = {}, history = {}
  for (const def of a.metrics) { metrics[def.key] = def.nom; history[def.key] = Array.from({ length: HIST }, () => def.nom) }
  const state = STAGE[a.id] || 'running'
  return {
    state,
    metrics, history,
    health: HEALTH[a.id] ?? Math.round(rnd(88, 98)),
    utilization: state === 'running' ? Math.round(rnd(72, 96)) : Math.round(rnd(8, 40)),
    hours: Math.round(rnd(1200, 14000)),
    alarms: state === 'alarm' ? 2 : state === 'maintenance' ? 1 : 0,
    maintDays: a.id === 'truck4' ? 0 : Math.round(rnd(3, 60)),
  }
}

const seed = () => Object.fromEntries(ASSETS.map(a => [a.id, seedAsset(a)]))

function fleet(live) {
  const c = { running: 0, idle: 0, maintenance: 0, alarm: 0 }
  for (const id in live) c[live[id].state] = (c[live[id].state] || 0) + 1
  return c
}

export const useTelemetry = create((set, get) => ({
  live: seed(),
  weather: { temp: 28, wind: 12, humidity: 45, dust: 32 },
  plant: { production: 18420, throughput: 2240, recovery: 89, power: 7.9, utilization: 84, alerts: 2 },
  fleet: { running: 16, idle: 4, maintenance: 1, alarm: 1 },
  hovered: null,
  selected: null,
  setHovered: (id) => set({ hovered: id }),
  setSelected: (id) => set({ selected: id }),

  tick: () => set((s) => {
    const live = {}
    for (const a of ASSETS) {
      const cur = s.live[a.id]
      const metrics = { ...cur.metrics }, history = { ...cur.history }
      const idle = cur.state === 'idle' || cur.state === 'maintenance'
      for (const def of a.metrics) {
        const span = def.max - def.min
        // pull toward nominal (or toward 0 for idle rate-like metrics) + small noise
        const target = idle && /rate|speed|throughput|power|load|flow/i.test(def.key) ? def.min + span * 0.04 : def.nom
        let v = metrics[def.key] + (target - metrics[def.key]) * 0.08 + (Math.random() - 0.5) * span * 0.03
        v = clamp(v, def.min, def.max)
        v = Math.round(v * 100) / 100
        metrics[def.key] = v
        const h = history[def.key].slice(1); h.push(v); history[def.key] = h
      }
      // health drifts gently; alarm asset stays low and trends down a touch
      let health = cur.health + (cur.state === 'alarm' ? -0.05 : (90 - cur.health) * 0.02) + (Math.random() - 0.5) * 0.3
      live[a.id] = { ...cur, metrics, history, health: clamp(Math.round(health * 10) / 10, 30, 100) }
    }
    // plant rollups
    const prod = s.plant.production + 6 + Math.random() * 4
    const power = ((live.mill?.metrics.power || 0) + (live.crusher?.metrics.power || 0) + (live.smelter?.metrics.throughput || 0) * 22) / 1000
    const w = s.weather
    const weather = {
      temp: clamp(w.temp + (28 - w.temp) * 0.05 + (Math.random() - 0.5) * 0.3, 18, 42),
      wind: clamp(w.wind + (Math.random() - 0.5) * 1.2, 0, 45),
      humidity: clamp(w.humidity + (Math.random() - 0.5) * 1.5, 20, 80),
      dust: clamp(w.dust + (Math.random() - 0.5) * 3, 5, 120),
    }
    const f = fleet(live)
    return {
      live, weather, fleet: f,
      plant: {
        production: prod,
        throughput: Math.round(live.crusher?.metrics.throughput || 0),
        recovery: Math.round((live.flotation?.metrics.recovery || 0) * 10) / 10,
        power: Math.round(power * 10) / 10,
        utilization: Math.round(100 * f.running / ASSETS.length),
        alerts: f.alarm + f.maintenance,
      },
    }
  }),
}))
