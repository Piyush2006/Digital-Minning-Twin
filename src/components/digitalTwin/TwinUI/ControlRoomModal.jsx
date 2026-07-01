import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiServer, FiActivity, FiCpu, FiCheckCircle } from 'react-icons/fi'
import { useTelemetry } from '../../../data/telemetryStore'
import { useAI } from '../../../data/aiStore'
import { useUI } from '../../../data/uiStore'
import { ASSETS } from '../../../data/assets.config'

const Sec = ({ icon, title, children }) => (
  <div className="rounded-xl bg-white/[0.04] p-3">
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-info mb-2">{icon} {title}</div>
    {children}
  </div>
)

export function ControlRoomModal() {
  const open = useUI(s => s.controlOpen)
  const setOpen = useUI(s => s.setControlOpen)
  const plant = useTelemetry(s => s.plant)
  const fleet = useTelemetry(s => s.fleet)
  const insights = useAI(s => s.insights)

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-40 grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <motion.div initial={{ scale: 0.94, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="relative w-[560px] max-w-[92vw] rounded-2xl glass-strong p-4" style={{ background: 'rgba(16,22,34,0.92)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Mine Control Room</div>
                <div className="text-[18px] font-extrabold text-white tracking-tight">System Overview</div>
              </div>
              <button onClick={() => setOpen(false)} className="grid place-items-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"><FiX /></button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Sec icon={<FiServer size={13} />} title="System Status">
                {[['SCADA / Historian', true], ['UNS Broker', true], ['AI Engine', true], ['Network', true]].map(([k, ok]) => (
                  <div key={k} className="flex items-center justify-between py-0.5 text-[11px]"><span className="text-white/70">{k}</span><span className="flex items-center gap-1 text-ok font-semibold"><FiCheckCircle size={11} />Online</span></div>
                ))}
              </Sec>
              <Sec icon={<FiActivity size={13} />} title="Live Telemetry">
                {[['Throughput', `${plant.throughput.toLocaleString()} t/h`], ['Cu Recovery', `${plant.recovery} %`], ['Power Draw', `${plant.power} MW`], ['Production', `${Math.round(plant.production).toLocaleString()} t`]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-0.5 text-[11px]"><span className="text-white/70">{k}</span><span className="font-bold font-mono text-white">{v}</span></div>
                ))}
              </Sec>
              <Sec icon={<FiServer size={13} />} title="Connected Assets">
                <div className="text-[24px] font-extrabold text-white leading-none">{ASSETS.length}<span className="text-[11px] font-medium text-white/40 ml-1">assets</span></div>
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="chip bg-ok/15 text-ok">● {fleet.running} running</span>
                  <span className="chip bg-warn/15 text-warn">● {fleet.idle} idle</span>
                  <span className="chip bg-info/15 text-info">● {fleet.maintenance} maint</span>
                  <span className="chip bg-alarm/15 text-alarm">● {fleet.alarm} alarm</span>
                </div>
              </Sec>
              <Sec icon={<FiCpu size={13} />} title="AI Summary">
                {insights.slice(0, 4).map(i => (
                  <div key={i.id} className="flex items-start gap-1.5 py-0.5"><span className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: i.sev === 'critical' ? '#f43f5e' : i.sev === 'warning' ? '#fbbf24' : '#38bdf8' }} /><span className="text-[10.5px] text-white/75 leading-snug">{i.msg}</span></div>
                ))}
              </Sec>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
