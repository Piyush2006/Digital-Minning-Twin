import { motion, AnimatePresence } from 'framer-motion'
import { FiThermometer, FiWind, FiCloud, FiDroplet } from 'react-icons/fi'
import { useTelemetry } from '../../../data/telemetryStore'
import { useAI } from '../../../data/aiStore'
import { useUI } from '../../../data/uiStore'
import { MEDIUM_COLOR } from '../../../data/assets.config'

const TABS = [['status', 'Status'], ['flow', 'Flow'], ['weather', 'Weather']]

export function RightWidget() {
  const tab = useUI(s => s.rightTab)
  const setTab = useUI(s => s.setRightTab)
  const fleet = useTelemetry(s => s.fleet)
  const weather = useTelemetry(s => s.weather)
  const env = useAI(s => s.env)
  const aqColor = env.airQuality === 'Good' ? '#34d399' : env.airQuality === 'Moderate' ? '#fbbf24' : '#f43f5e'

  return (
    <motion.div initial={{ x: 18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
      className="absolute top-16 right-4 z-20 w-[224px] rounded-xl glass overflow-hidden" style={{ background: 'rgba(14,20,32,0.6)' }}>
      <div className="flex p-1 gap-1">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 rounded-lg py-1 text-[10.5px] font-semibold transition-colors ${tab === k ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/70'}`}>{l}</button>
        ))}
      </div>
      <div className="px-3 pb-3 pt-1">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === 'status' && (
              <div>
                {[['Running', fleet.running, '#34d399'], ['Idle', fleet.idle, '#fbbf24'], ['Maintenance', fleet.maintenance, '#38bdf8'], ['Alarm', fleet.alarm, '#f43f5e']].map(([k, v, c]) => (
                  <div key={k} className="flex items-center justify-between py-[3px]">
                    <span className="flex items-center gap-2 text-[11.5px] text-white/80"><span className="w-2 h-2 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />{k}</span>
                    <span className="text-[13px] font-bold text-white font-mono">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 'flow' && (
              <div className="flex flex-col gap-1.5 py-0.5">
                {[['Ore', MEDIUM_COLOR.ore], ['Concentrate', MEDIUM_COLOR.concentrate], ['Water', MEDIUM_COLOR.water], ['Tailings', MEDIUM_COLOR.tailings]].map(([k, c]) => (
                  <div key={k} className="flex items-center gap-2 text-[11px] text-white/75"><span className="w-4 h-1 rounded-full" style={{ background: c }} />{k}</div>
                ))}
              </div>
            )}
            {tab === 'weather' && (
              <div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[[<FiThermometer key="t" />, `${weather.temp.toFixed(0)}°C`, '#fb923c'],
                    [<FiWind key="w" />, `${weather.wind.toFixed(0)} km/h`, '#38bdf8'],
                    [<FiCloud key="d" />, `PM10 ${weather.dust.toFixed(0)}`, '#a78bfa'],
                    [<FiDroplet key="h" />, `${weather.humidity.toFixed(0)}%`, '#34d399']].map(([ic, v, c], i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1.5"><span style={{ color: c }}>{ic}</span><span className="text-[11px] font-bold text-white font-mono">{v}</span></div>
                  ))}
                </div>
                <div className="mt-1.5 flex items-center justify-between rounded-md bg-white/[0.04] px-2 py-1.5">
                  <span className="text-[10px] text-white/50">Air Quality</span><span className="text-[11px] font-bold" style={{ color: aqColor }}>{env.airQuality}</span>
                </div>
                {env.rec && (
                  <div className="mt-1.5 flex items-start gap-1.5 rounded-md px-2 py-1.5" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)' }}>
                    <span className="text-info text-[10px]">⤷</span><span className="text-[9.5px] text-info font-semibold leading-snug">AI: {env.rec}</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
