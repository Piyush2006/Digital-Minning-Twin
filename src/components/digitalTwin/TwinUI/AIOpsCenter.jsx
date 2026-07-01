import { motion, AnimatePresence } from 'framer-motion'
import { FiCpu, FiAlertOctagon, FiAlertTriangle, FiInfo } from 'react-icons/fi'
import { useAI } from '../../../data/aiStore'

const SEV = {
  critical: { c: '#f43f5e', icon: <FiAlertOctagon size={13} />, label: 'CRITICAL' },
  warning:  { c: '#fbbf24', icon: <FiAlertTriangle size={13} />, label: 'WARNING' },
  info:     { c: '#38bdf8', icon: <FiInfo size={13} />, label: 'INFO' },
}
const clock = (ts) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export function AIOpsCenter() {
  const insights = useAI(s => s.insights)
  const crit = insights.filter(i => i.sev === 'critical').length

  return (
    <motion.div initial={{ x: -18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
      className="absolute left-5 top-[92px] z-20 w-[320px] rounded-2xl glass-strong overflow-hidden flex flex-col"
      style={{ maxHeight: '52vh' }}>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-white/8">
        <div className="grid place-items-center w-8 h-8 rounded-lg bg-info/15 text-info"><FiCpu size={17} /></div>
        <div className="leading-tight flex-1">
          <div className="text-[13px] font-extrabold text-white tracking-tight">AI Operations Center</div>
          <div className="text-[9.5px] text-info font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" /> {insights.length} insights · {crit} critical
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1.5">
        <AnimatePresence initial={false}>
          {insights.slice(0, 8).map(it => {
            const s = SEV[it.sev]
            return (
              <motion.div key={it.id} layout
                initial={{ opacity: 0, x: -14, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }} exit={{ opacity: 0, x: 14, height: 0 }}
                transition={{ duration: 0.32 }}
                className="rounded-xl bg-white/[0.04] p-2.5 border-l-2" style={{ borderColor: s.c }}>
                <div className="flex items-center justify-between">
                  <span className="chip" style={{ background: `${s.c}1f`, color: s.c }}>{s.icon}{s.label}</span>
                  <span className="text-[9px] text-white/40 font-mono">{clock(it.ts)}</span>
                </div>
                <div className="mt-1 text-[11.5px] font-semibold text-white/90 leading-snug">{it.msg}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/45">
                  <span className="font-medium text-white/60">{it.asset}</span>
                </div>
                <div className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-white/[0.04] px-2 py-1">
                  <span className="text-info text-[10px] mt-[1px]">⤷</span>
                  <span className="text-[10px] text-white/70 leading-snug">{it.action}</span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
