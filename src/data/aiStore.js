import { create } from 'zustand'
import { useTelemetry } from './telemetryStore'
import { ASSET_BY_ID, WORKERS } from './assets.config'

// ── AI layer: derives predictive-maintenance, fleet, environment, conveyor-vision
// and worker-safety insight from the live telemetry. Pure simulation, ~4s cadence.

const MAJOR = ['drill', 'shovel', 'crusher', 'mill', 'truck1', 'truck2', 'truck3', 'truck4', 'truck5']
const TRUCKS = ['truck1', 'truck2', 'truck3', 'truck4', 'truck5']
const RISING = 'truck3'
const FP0 = { drill: 34, shovel: 44, crusher: 68, mill: 38, truck1: 52, truck2: 46, truck3: 61, truck4: 73, truck5: 58 }
const LIFE = { drill: 420, shovel: 520, crusher: 300, mill: 820, truck1: 380, truck2: 380, truck3: 360, truck4: 300, truck5: 340 }
const REC = {
  drill: 'Schedule rotary-head service.', shovel: 'Inspect hydraulic cylinders for wear.',
  crusher: 'Inspect bearing during next maintenance shift.', mill: 'Check trunnion-bearing lubrication.',
  truck1: 'Plan brake & engine inspection at next service.', truck2: 'Plan brake & engine inspection at next service.',
  truck3: 'Tyre & driveline inspection recommended.', truck4: 'Overdue service — schedule now.', truck5: 'Investigate active fault before dispatch.',
}
const CYC0 = { truck1: 23, truck2: 24, truck3: 26, truck4: 25, truck5: 22 }
const ROUTE = { truck1: 'Haul Road A', truck2: 'Haul Road A', truck3: 'Haul Road B', truck4: 'Haul Road B', truck5: 'Pit Ramp' }
const ISSUES = ['Belt misalignment', 'Spillage detected', 'Foreign object', 'Smoke detected']
const COOLDOWN = 22000
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const rnd = (a, b) => a + Math.random() * (b - a)
const label = (id) => ASSET_BY_ID[id]?.label || id

const TRACKED = WORKERS.filter(w => w.track).map(w => ({ id: w.id, name: w.name, zone: w.zone, ppe: true, clearAt: 0 }))

let idc = 3
const lastEmit = {}
const now0 = Date.now()
for (const k of ['crusher-brg', 'cycle-truck3', 'dust']) lastEmit[k] = now0

const seedMaint = () => Object.fromEntries(MAJOR.map(id => {
  const fp = FP0[id]; return [id, { fp, rul: Math.round(LIFE[id] * (1 - fp / 100)), rec: REC[id], health: 90 }]
}))
const seedFleet = () => Object.fromEntries(TRUCKS.map(id => [id, { cycleTime: CYC0[id], route: ROUTE[id], queue: 1, rec: 'Cycle within target.', alt: false }]))

export const useAI = create((set, get) => ({
  insights: [
    { id: 1, key: 'crusher-brg', sev: 'warning', asset: 'Primary Crusher', msg: 'Bearing temperature trending up — above normal', action: 'Inspect bearing during next maintenance shift.', ts: now0 },
    { id: 2, key: 'cycle-truck3', sev: 'warning', asset: 'Haul Truck C', msg: 'Cycle time increasing (+12%) · queue 6', action: 'Use alternate haul road.', ts: now0 },
    { id: 3, key: 'dust', sev: 'info', asset: 'Environment', msg: 'Dust PM10 approaching threshold', action: 'Prepare water sprinklers.', ts: now0 },
  ],
  maint: seedMaint(),
  fleet: seedFleet(),
  env: { airQuality: 'Moderate', dust: 32, rec: null },
  conveyors: [
    { id: 'cv01', name: 'Conveyor CV-01', seg: ['crusher', 'screen'], status: 'ok', issue: null, clearAt: 0 },
    { id: 'cv02', name: 'Conveyor CV-02', seg: ['screen', 'mill'], status: 'ok', issue: null, clearAt: 0 },
    { id: 'cv03', name: 'Conveyor CV-03', seg: ['filter', 'stacker'], status: 'ok', issue: null, clearAt: 0 },
  ],
  workers: TRACKED,

  tick: () => {
    const now = Date.now()
    const T = useTelemetry.getState()
    const live = T.live
    const s = get()
    let insights = s.insights
    const add = (key, sev, asset, msg, action) => {
      if (now - (lastEmit[key] || 0) < COOLDOWN) return
      lastEmit[key] = now
      insights = [{ id: ++idc, key, sev, asset, msg, action, ts: now }, ...insights].slice(0, 16)
    }

    // predictive maintenance
    const maint = {}
    for (const id of MAJOR) {
      const prev = s.maint[id] || { fp: FP0[id] }
      const fp = clamp(prev.fp + (FP0[id] - prev.fp) * 0.05 + (Math.random() - 0.5) * 1.2, 1, 97)
      const rul = Math.round(LIFE[id] * (1 - fp / 100))
      maint[id] = { fp: Math.round(fp), rul, rec: REC[id], health: Math.round(live[id]?.health ?? 90) }
      if (fp > 70) add('fp-' + id, fp > 80 ? 'critical' : 'warning', label(id), `${label(id)} failure probability ${Math.round(fp)}% · RUL ~${rul} h`, REC[id])
    }
    // telemetry-driven
    const cr = live.crusher?.metrics
    if (cr && cr.bearingTemp > 72) add('crusher-brg', cr.bearingTemp > 90 ? 'critical' : 'warning', 'Primary Crusher', `Bearing temperature ${cr.bearingTemp.toFixed(0)}°C — above normal`, 'Inspect bearing during next maintenance shift.')
    const ml = live.mill?.metrics
    if (ml && ml.bearingPressure > 58) add('mill-brg', 'warning', 'SAG Mill', `Bearing pressure ${ml.bearingPressure.toFixed(0)} bar elevated`, 'Check trunnion-bearing lubrication.')

    // fleet optimization
    const fleet = {}
    for (const id of TRUCKS) {
      const prevC = s.fleet[id]?.cycleTime ?? CYC0[id]
      const trend = id === RISING ? 0.05 : 0
      const ct = clamp(prevC + trend + (Math.random() - 0.5) * 0.4, 18, 40)
      const queue = id === RISING ? Math.round(rnd(4, 9)) : Math.round(rnd(0, 3))
      const high = ct > 27 || queue >= 5
      fleet[id] = { cycleTime: Math.round(ct * 10) / 10, route: ROUTE[id], queue, alt: high, rec: high ? 'High queue time detected — use alternate haul road.' : 'Cycle within target.' }
      if (high) add('cycle-' + id, 'warning', label(id), `${label(id)} cycle time ${ct.toFixed(0)} min (+${Math.max(1, Math.round((ct / CYC0[id] - 1) * 100))}%) · queue ${queue}`, 'Use alternate haul road.')
      const et = live[id]?.metrics?.engineTemp
      if (et > 106) add('etemp-' + id, 'warning', label(id), `${label(id)} engine temp ${et.toFixed(0)}°C high`, 'Reduce load / inspect cooling.')
    }

    // environment
    const dust = T.weather.dust
    const aq = dust < 35 ? 'Good' : dust < 60 ? 'Moderate' : dust < 90 ? 'Poor' : 'Unhealthy'
    const env = { airQuality: aq, dust: Math.round(dust), rec: dust > 58 ? 'Activate water sprinklers on haul roads.' : null }
    if (dust > 58) add('dust', 'warning', 'Environment', `Dust PM10 ${dust.toFixed(0)} µg/m³ — expected to exceed threshold in ~20 min`, 'Activate water sprinklers.')

    // conveyor AI vision
    const conveyors = s.conveyors.map(c => ({ ...c }))
    for (const c of conveyors) if (c.status === 'flagged' && now > c.clearAt) { c.status = 'ok'; c.issue = null }
    if (Math.random() < 0.13) {
      const oks = conveyors.filter(c => c.status === 'ok')
      if (oks.length) {
        const c = oks[Math.floor(Math.random() * oks.length)]
        c.status = 'flagged'; c.issue = ISSUES[Math.floor(Math.random() * ISSUES.length)]; c.clearAt = now + rnd(12000, 20000)
        add('cv-' + c.id, c.issue === 'Smoke detected' ? 'critical' : 'warning', c.name, `AI Vision: ${c.issue} on ${c.name}`, 'Inspection recommended.')
      }
    }

    // worker PPE / safety
    const workers = s.workers.map(w => ({ ...w }))
    for (const w of workers) if (!w.ppe && now > w.clearAt) w.ppe = true
    if (Math.random() < 0.08) {
      const oks = workers.filter(w => w.ppe)
      if (oks.length) {
        const w = oks[Math.floor(Math.random() * oks.length)]
        w.ppe = false; w.clearAt = now + rnd(10000, 18000)
        add('ppe-' + w.id, 'critical', w.name, `PPE alert: ${w.name} — hard hat not detected in ${w.zone}`, 'Notify supervisor / safety marshal.')
      }
    }

    // active alarms
    for (const id of Object.keys(live)) if (live[id].state === 'alarm') add('alarm-' + id, 'critical', label(id), `${label(id)} in ALARM state`, 'Dispatch maintenance crew.')

    set({ insights, maint, fleet, env, conveyors, workers })
  },
}))
