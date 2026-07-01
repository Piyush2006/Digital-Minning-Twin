import { motion, AnimatePresence } from 'framer-motion'
import { FiCpu, FiAlertOctagon, FiAlertTriangle, FiInfo, FiChevronLeft } from 'react-icons/fi'
import { useAI } from '../../../data/aiStore'
import { useUI } from '../../../data/uiStore'

const SEV = {
  critical: { c: '#f43f5e', icon: <FiAlertOctagon size={12} />, label: 'CRITICAL' },
  warning:  { c: '#fbbf24', icon: <FiAlertTriangle size={12} />, label: 'WARNING' },
  info:     { c: '#38bdf8', icon: <FiInfo size={12} />, label: 'INFO' },
}
const clock = (ts) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export function AIOpsCenter() {
  const insights = useAI(s => s.insights)
  const open = useUI(s => s.aiOpen)
  const toggle = useUI(s => s.toggleAi)
  const crit = insights.filter(i => i.sev === 'critical').length

  return (
    <div className="absolute left-4 top-[86px] z-20">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div key="drawer" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.3 }}
            className="w-[288px] rounded-xl glass-strong overflow-hidden flex flex-col" style={{ maxHeight: '54vh', background: 'rgba(14,20,32,0.72)' }}>
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/8">
              <div className="grid place-items-center w-7 h-7 rounded-lg bg-info/15 text-info"><FiCpu size={15} /></div>
              <div className="leading-tight flex-1">
                <div className="text-[12px] font-extrabold text-white tracking-tight">AI Operations Center</div>
                <div className="text-[9px] text-info font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" /> {insights.length} insights · {crit} critical</div>
              </div>
              <button onClick={toggle} className="text-white/40 hover:text-white/80"><FiChevronLeft size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-1.5">
              <AnimatePresence initial={false}>
                {insights.slice(0, 8).map(it => {
                  const s = SEV[it.sev]
                  return (
                    <motion.div key={it.id} layout initial={{ opacity: 0, x: -12, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} exit={{ opacity: 0, x: 12, height: 0 }} transition={{ duration: 0.3 }}
                      className="rounded-lg bg-white/[0.04] p-2 border-l-2" style={{ borderColor: s.c }}>
                      <div className="flex items-center justify-between">
                        <span className="chip" style={{ background: `${s.c}1f`, color: s.c }}>{s.icon}{s.label}</span>
                        <span className="text-[8.5px] text-white/40 font-mono">{clock(it.ts)}</span>
                      </div>
                      <div className="mt-1 text-[11px] font-semibold text-white/90 leading-snug">{it.msg}</div>
                      <div className="mt-0.5 text-[9.5px] text-white/50">{it.asset}</div>
                      <div className="mt-1 flex items-start gap-1 rounded bg-white/[0.04] px-1.5 py-1"><span className="text-info text-[9px]">⤷</span><span className="text-[9.5px] text-white/70 leading-snug">{it.action}</span></div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.button key="badge" onClick={toggle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl glass-strong px-3 py-2 pointer-events-auto" style={{ background: 'rgba(14,20,32,0.72)' }}>
            <span className="grid place-items-center w-7 h-7 rounded-lg bg-info/15 text-info"><FiCpu size={15} /></span>
            <span className="text-[12px] font-bold text-white">AI</span>
            {crit > 0 && <span className="grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-alarm text-white text-[10px] font-bold">{crit}</span>}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
