import { motion, AnimatePresence } from 'framer-motion'
import { FiBell, FiCpu, FiFileText, FiClock, FiTool, FiSettings } from 'react-icons/fi'
import { useTelemetry } from '../../../data/telemetryStore'
import { useAI } from '../../../data/aiStore'
import { useUI } from '../../../data/uiStore'
import { ASSET_BY_ID } from '../../../data/assets.config'

const ITEMS = [
  ['alerts', <FiBell key="a" />, 'Alerts'],
  ['ai', <FiCpu key="c" />, 'AI'],
  ['reports', <FiFileText key="r" />, 'Reports'],
  ['history', <FiClock key="h" />, 'History'],
  ['maintenance', <FiTool key="m" />, 'Maintenance'],
  ['settings', <FiSettings key="s" />, 'Settings'],
]
const Row = ({ l, v, c }) => (
  <div className="flex items-center justify-between py-1 text-[11px]"><span className="text-white/55">{l}</span><span className="font-bold font-mono" style={{ color: c || '#fff' }}>{v}</span></div>
)

function Popover({ dock }) {
  const insights = useAI(s => s.insights)
  const maint = useAI(s => s.maint)
  const plant = useTelemetry(s => s.plant)
  const simSpeed = useUI(s => s.simSpeed)
  const setSimSpeed = useUI(s => s.setSimSpeed)

  let title = '', body = null
  if (dock === 'alerts') {
    title = 'Active Alerts'
    const a = insights.filter(i => i.sev !== 'info').slice(0, 6)
    body = a.length ? a.map(i => (
      <div key={i.id} className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
        <span className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: i.sev === 'critical' ? '#f43f5e' : '#fbbf24' }} />
        <div><div className="text-[11px] text-white/85 leading-snug">{i.msg}</div><div className="text-[9px] text-white/40">{i.asset}</div></div>
      </div>
    )) : <div className="text-[11px] text-white/40 py-2">No active alerts.</div>
  } else if (dock === 'reports') {
    title = 'Shift Report'
    body = <div><Row l="Production" v={`${Math.round(plant.production).toLocaleString()} t`} c="#34d399" /><Row l="Throughput" v={`${plant.throughput.toLocaleString()} t/h`} /><Row l="Cu Recovery" v={`${plant.recovery} %`} /><Row l="Power Draw" v={`${plant.power} MW`} /><Row l="Fleet Utilization" v={`${plant.utilization} %`} /></div>
  } else if (dock === 'history') {
    title = 'Shift History'
    body = <div className="text-[11px] text-white/60 leading-relaxed">Current shift running nominally. Production trending <span className="text-ok font-semibold">▲</span> vs. plan. Full time-series available per asset via the side panel trend chart.</div>
  } else if (dock === 'maintenance') {
    title = 'Predictive Maintenance'
    const list = Object.entries(maint).sort((a, b) => b[1].fp - a[1].fp).slice(0, 6)
    body = list.map(([id, m]) => (
      <div key={id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
        <div><div className="text-[11px] text-white/85">{ASSET_BY_ID[id]?.label || id}</div><div className="text-[9px] text-white/40">RUL ~{m.rul} h</div></div>
        <span className="text-[12px] font-bold font-mono" style={{ color: m.fp > 70 ? '#f43f5e' : m.fp > 45 ? '#fbbf24' : '#34d399' }}>{m.fp}%</span>
      </div>
    ))
  } else if (dock === 'settings') {
    title = 'Settings'
    body = <div><div className="text-[10px] text-white/50 mb-1">Simulation Speed · {simSpeed}×</div><input type="range" min="0.25" max="3" step="0.25" value={simSpeed} onChange={e => setSimSpeed(Number(e.target.value))} className="w-full" /></div>
  }
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
      className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[280px] rounded-xl glass-strong p-3" style={{ background: 'rgba(14,20,32,0.82)' }}>
      <div className="text-[10px] uppercase tracking-wider text-white/45 font-bold mb-2">{title}</div>
      {body}
    </motion.div>
  )
}

export function Dock() {
  const dock = useUI(s => s.dock)
  const setDock = useUI(s => s.setDock)
  const toggleAi = useUI(s => s.toggleAi)
  const crit = useAI(s => s.insights.filter(i => i.sev === 'critical').length)

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
      <AnimatePresence>{dock && dock !== 'ai' && <Popover key={dock} dock={dock} />}</AnimatePresence>
      <div className="flex items-center gap-1 rounded-2xl glass-strong px-1.5 py-1.5" style={{ background: 'rgba(14,20,32,0.7)' }}>
        {ITEMS.map(([k, icon, label]) => {
          const active = dock === k
          return (
            <button key={k} title={label}
              onClick={() => (k === 'ai' ? toggleAi() : setDock(k))}
              className={`relative grid place-items-center w-9 h-9 rounded-xl transition-colors ${active ? 'bg-info/20 text-info' : 'text-white/55 hover:text-white hover:bg-white/8'}`}>
              {icon}
              {k === 'alerts' && crit > 0 && <span className="absolute -top-0.5 -right-0.5 grid place-items-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-alarm text-white text-[8px] font-bold">{crit}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
