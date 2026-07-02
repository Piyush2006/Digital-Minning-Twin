import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiTrendingUp, FiActivity, FiZap, FiAlertTriangle, FiTruck, FiRadio, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import { useTelemetry } from '../../../data/telemetryStore'
import { useUI } from '../../../data/uiStore'
import { AnimatedNumber } from './AnimatedNumber'

function Kpi({ icon, label, value, unit, decimals = 0, accent }) {
  const prev = useRef(value)
  const up = value > prev.current + 0.01, down = value < prev.current - 0.01
  useEffect(() => { prev.current = value })
  return (
    <div className="flex items-center gap-2 px-2.5 py-1">
      <span className="grid place-items-center w-6 h-6 rounded-md shrink-0" style={{ background: `${accent}1a`, color: accent }}>{icon}</span>
      <div className="leading-none">
        <div className="text-[8px] uppercase tracking-wider text-white/40 font-semibold">{label}</div>
        <div className="text-[13px] font-bold text-white font-mono flex items-baseline gap-1 mt-0.5">
          <AnimatedNumber value={value} decimals={decimals} /><span className="text-[8px] text-white/40 font-sans">{unit}</span>
          {(up || down) && <span className="text-[8px]" style={{ color: up ? '#34d399' : '#f43f5e' }}>{up ? '▲' : '▼'}</span>}
        </div>
      </div>
    </div>
  )
}

export function Hud() {
  const plant = useTelemetry(s => s.plant)
  const kpiOpen = useUI(s => s.kpiOpen)
  const toggleKpi = useUI(s => s.toggleKpi)

  return (
    <>
      {/* Brand */}
      <motion.div initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="absolute top-3.5 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="grid place-items-center w-8 h-8 rounded-lg glass-strong text-info"><FiRadio size={16} /></div>
        <div>
          <div className="text-[12.5px] font-extrabold text-white tracking-tight leading-none">Mining Digital Twin</div>
          <div className="text-[9px] text-info font-semibold mt-0.5">● LIVE · simulated telemetry</div>
        </div>
      </motion.div>

      {/* Compact, collapsible KPI bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <AnimatePresence mode="wait">
          {kpiOpen ? (
            <motion.div key="bar" initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="flex items-stretch rounded-xl glass divide-x divide-white/[0.07]" style={{ background: 'rgba(14,20,32,0.55)' }}>
              <Kpi icon={<FiTrendingUp size={13} />} label="Production" value={plant.production} unit="t" accent="#34d399" />
              <Kpi icon={<FiTruck size={13} />} label="Fleet Util" value={plant.utilization} unit="%" accent="#e7b53c" />
              <Kpi icon={<FiActivity size={13} />} label="Throughput" value={plant.throughput} unit="t/h" accent="#38bdf8" />
              <Kpi icon={<FiActivity size={13} />} label="Recovery" value={plant.recovery} unit="%" decimals={1} accent="#34d399" />
              <Kpi icon={<FiZap size={13} />} label="Power" value={plant.power} unit="MW" decimals={1} accent="#a78bfa" />
              <Kpi icon={<FiAlertTriangle size={13} />} label="Alerts" value={plant.alerts} unit="" accent={plant.alerts ? '#f43f5e' : '#34d399'} />
              <button onClick={toggleKpi} className="px-1.5 grid place-items-center text-white/40 hover:text-white/80 pointer-events-auto"><FiChevronUp size={14} /></button>
            </motion.div>
          ) : (
            <motion.button key="pill" onClick={toggleKpi} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 rounded-lg glass px-3 py-1.5 text-[11px] font-semibold text-white/70 pointer-events-auto"
              style={{ background: 'rgba(14,20,32,0.55)' }}>
              <FiActivity size={12} className="text-info" /> KPIs <FiChevronDown size={12} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
