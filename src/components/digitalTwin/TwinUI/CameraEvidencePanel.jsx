import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiVideo, FiCpu, FiClock, FiSettings, FiCheckCircle, FiTool, FiArrowDown, FiChevronRight } from 'react-icons/fi'
import { useAI } from '../../../data/aiStore'
import { useUI } from '../../../data/uiStore'
import { VisionFrame } from './VisionFrame'

const sev = { critical: '#f43f5e', warning: '#fbbf24', info: '#38bdf8' }
const camC = { online: '#34d399', processing: '#fbbf24', recording: '#f43f5e', offline: '#6b7280' }
const camT = { online: 'Online', processing: 'AI Processing', recording: 'Recording', offline: 'Offline' }
const clk = (ts) => new Date(ts).toLocaleTimeString('en-GB', { hour12: false })
const TABS = [['overview', 'Overview', <FiVideo key="v" size={12} />], ['detection', 'AI Detection', <FiCpu key="c" size={12} />], ['history', 'History', <FiClock key="h" size={12} />], ['settings', 'Settings', <FiSettings key="s" size={12} />]]
const CLASSES = ['Belt Misalignment', 'Material Spillage', 'Foreign Object', 'Smoke', 'Belt Damage', 'Roller Failure']

const Row = ({ l, v, c }) => (
  <div className="flex items-center justify-between py-1 text-[11.5px] border-b border-white/5 last:border-0"><span className="text-white/50">{l}</span><span className="font-semibold" style={{ color: c || '#e6edf6' }}>{v}</span></div>
)
const EvStage = ({ n, label, children }) => (
  <div>
    <div className="text-[10px] font-bold text-white/55 mb-1">{n} · {label}</div>
    <div className="rounded-lg overflow-hidden border border-white/8">{children}</div>
  </div>
)

export function CameraEvidencePanel() {
  const evidence = useUI(s => s.evidence)
  const setEvidence = useUI(s => s.setEvidence)
  const setFocus = useUI(s => s.setFocus)
  const conv = useAI(s => s.conveyors.find(c => c.id === evidence))
  const ack = useAI(s => s.ackDetection)
  const [tab, setTab] = useState('detection')
  const [pickedId, setPicked] = useState(null)
  const [wo, setWo] = useState(null)

  useEffect(() => { setPicked(null); setWo(null); setTab(conv?.detection ? 'detection' : 'overview') }, [evidence])

  if (!conv) return null
  const d = pickedId ? conv.history.find(h => h.id === pickedId) : (conv.detection || conv.history[0])
  const cs = conv.camStatus
  const beltStopped = conv.detection?.sev === 'critical'

  return (
    <AnimatePresence>
      {evidence && (
        <motion.div key={evidence} initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          className="absolute top-0 right-0 h-full w-[384px] max-w-[92vw] z-40 glass-strong border-l border-white/10 overflow-y-auto" style={{ background: 'rgba(12,17,26,0.94)' }}>
          <div className="p-4">
            {/* header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-info font-bold"><FiVideo size={12} /> AI Vision Evidence</div>
                <div className="text-[17px] font-extrabold text-white tracking-tight leading-tight mt-0.5">{conv.name} · {conv.title}</div>
                <div className="text-[10.5px] text-white/45">{conv.camId} · {conv.camName} · monitors {conv.monitors}</div>
              </div>
              <button onClick={() => setEvidence(null)} className="grid place-items-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"><FiX /></button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="chip" style={{ background: `${camC[cs]}22`, color: camC[cs], border: `1px solid ${camC[cs]}55` }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: camC[cs] }} />{camT[cs]}</span>
              <span className="chip bg-white/5 text-white/70">Belt {beltStopped ? 'Stopped' : 'Running'}</span>
              <button onClick={() => setFocus(conv.id)} className="chip bg-info/15 text-info hover:bg-info/25">Focus camera</button>
            </div>

            {/* tabs */}
            <div className="mt-3 flex gap-1 p-1 rounded-lg bg-white/[0.04]">
              {TABS.map(([k, l, ic]) => (
                <button key={k} onClick={() => setTab(k)} className={`flex-1 flex items-center justify-center gap-1 rounded-md py-1.5 text-[10.5px] font-semibold transition-colors ${tab === k ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/70'}`}>{ic}{l}</button>
              ))}
            </div>

            <div className="mt-3">
              {/* OVERVIEW */}
              {tab === 'overview' && (
                <div className="space-y-3">
                  <div className="rounded-lg overflow-hidden border border-white/8">
                    {conv.detection ? <VisionFrame det={conv.detection} mode="overlay" /> : d ? <VisionFrame det={d} mode="original" /> : null}
                  </div>
                  <div className="rounded-xl bg-white/[0.04] p-3">
                    <Row l="Camera" v={`${conv.camId} · ${conv.camName}`} />
                    <Row l="Status" v={camT[cs]} c={camC[cs]} />
                    <Row l="Conveyor" v={conv.title} />
                    <Row l="Monitoring" v={conv.monitors} />
                    <Row l="Belt" v={beltStopped ? 'Stopped (safety)' : 'Running'} c={beltStopped ? '#f43f5e' : '#34d399'} />
                    <Row l="Detections logged" v={conv.history.length} />
                    <Row l="AI model" v="YOLO-v8 · Mining" />
                  </div>
                </div>
              )}

              {/* AI DETECTION */}
              {tab === 'detection' && (
                d ? (
                  <div className="space-y-3">
                    <div className="rounded-xl p-3" style={{ background: `linear-gradient(180deg, ${sev[d.sev]}18, ${sev[d.sev]}04)`, border: `1px solid ${sev[d.sev]}40` }}>
                      <div className="flex items-center justify-between">
                        <div className="text-[15px] font-extrabold text-white">{d.type} {conv.detection && d.id === conv.detection.id ? 'Detected' : ''}</div>
                        <span className="chip" style={{ background: `${sev[d.sev]}22`, color: sev[d.sev] }}>{d.sev.toUpperCase()}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${d.conf}%`, background: sev[d.sev] }} /></div>
                        <span className="text-[13px] font-bold font-mono" style={{ color: sev[d.sev] }}>{d.conf}%</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-3">
                        <Row l="Camera" v={conv.camId} /><Row l="Conveyor" v={conv.name} />
                        <Row l="Detected At" v={clk(d.ts)} /><Row l="Confidence" v={`${d.conf}%`} />
                      </div>
                    </div>

                    {/* 3-stage computer-vision evidence */}
                    <div className="space-y-2">
                      <EvStage n="1" label="Original Camera Snapshot"><VisionFrame det={d} mode="original" /></EvStage>
                      <div className="flex justify-center text-white/30"><FiArrowDown /></div>
                      <EvStage n="2" label="AI Detection Overlay"><VisionFrame det={d} mode="overlay" /></EvStage>
                      <div className="flex justify-center text-white/30"><FiArrowDown /></div>
                      <EvStage n="3" label="Zoomed Evidence"><VisionFrame det={d} mode="zoom" /></EvStage>
                    </div>

                    {/* recommendations */}
                    <div className="rounded-xl bg-white/[0.04] p-3">
                      <div className="text-[10px] uppercase tracking-wider text-white/45 font-bold mb-2">AI Recommended Actions</div>
                      {d.actions.map((a, i) => (
                        <div key={i} className="flex items-center gap-2 py-1 text-[11.5px] text-white/85"><span className="grid place-items-center w-4 h-4 rounded-full bg-info/20 text-info text-[9px] font-bold">{i + 1}</span>{a}</div>
                      ))}
                    </div>

                    {wo && <div className="rounded-lg bg-ok/10 border border-ok/30 px-3 py-2 text-[11px] text-ok font-semibold flex items-center gap-1.5"><FiCheckCircle size={12} /> {wo}</div>}
                    <div className="flex gap-2">
                      <button onClick={() => { ack(conv.id) }} className="flex-1 rounded-lg py-2 text-[12px] font-bold bg-white/8 hover:bg-white/12 text-white flex items-center justify-center gap-1.5"><FiCheckCircle size={13} /> Acknowledge</button>
                      <button onClick={() => setWo(`Work order WO-${1000 + (d.id % 9000)} created`)} className="flex-1 rounded-lg py-2 text-[12px] font-bold bg-info/20 hover:bg-info/30 text-info flex items-center justify-center gap-1.5"><FiTool size={13} /> Work Order</button>
                    </div>
                  </div>
                ) : <div className="rounded-xl bg-white/[0.04] p-4 text-center text-[12px] text-white/50">No active detection — conveyor monitoring nominal.</div>
              )}

              {/* HISTORY */}
              {tab === 'history' && (
                <div className="rounded-xl bg-white/[0.04] p-2">
                  {conv.history.length ? conv.history.map(h => (
                    <button key={h.id} onClick={() => { setPicked(h.id); setTab('detection') }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 border-b border-white/5 last:border-0 text-left">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sev[h.sev] }} />
                      <span className="text-[11px] text-white/45 font-mono w-[52px]">{clk(h.ts).slice(0, 5)}</span>
                      <span className="text-[11.5px] text-white/85 flex-1">{h.type}</span>
                      <span className="text-[10px] font-semibold" style={{ color: sev[h.sev] }}>{h.conf}%</span>
                      <FiChevronRight size={13} className="text-white/30" />
                    </button>
                  )) : <div className="text-[12px] text-white/40 p-3 text-center">No detections logged.</div>}
                </div>
              )}

              {/* SETTINGS */}
              {tab === 'settings' && (
                <div className="space-y-2.5">
                  <div className="rounded-xl bg-white/[0.04] p-3">
                    <Row l="Resolution" v="1920 × 1080" /><Row l="Frame Rate" v="30 fps" /><Row l="AI Model" v="YOLO-v8 Mining" /><Row l="Recording" v="Enabled" c="#34d399" />
                  </div>
                  <div className="rounded-xl bg-white/[0.04] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/45 font-bold mb-2">Detection Sensitivity</div>
                    <input type="range" min="50" max="99" defaultValue="82" className="w-full" />
                  </div>
                  <div className="rounded-xl bg-white/[0.04] p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/45 font-bold mb-2">Active Detection Classes</div>
                    <div className="flex flex-wrap gap-1.5">{CLASSES.map(c => <span key={c} className="chip bg-info/12 text-info/90 text-[9.5px]">● {c}</span>)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
