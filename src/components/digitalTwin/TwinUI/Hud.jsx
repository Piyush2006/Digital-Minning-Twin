import { motion } from 'framer-motion'
import { FiTrendingUp, FiActivity, FiZap, FiAlertTriangle, FiWind, FiThermometer, FiDroplet, FiCloud, FiTruck, FiRadio } from 'react-icons/fi'
import { useTelemetry } from '../../../data/telemetryStore'
import { MEDIUM_COLOR } from '../../../data/assets.config'

const Stat = ({ icon, label, value, unit, accent = '#e6edf6' }) => (
  <div className="flex items-center gap-2.5 px-3.5 py-1.5">
    <div className="grid place-items-center w-8 h-8 rounded-lg" style={{ background: `${accent}1a`, color: accent }}>{icon}</div>
    <div className="leading-tight">
      <div className="text-[9.5px] uppercase tracking-wider text-white/45 font-semibold">{label}</div>
      <div className="text-[15px] font-bold text-white font-mono">{value}<span className="text-[10px] text-white/40 ml-0.5 font-sans">{unit}</span></div>
    </div>
  </div>
)

export function Hud() {
  const plant = useTelemetry(s => s.plant)
  const weather = useTelemetry(s => s.weather)
  const fleet = useTelemetry(s => s.fleet)

  return (
    <>
      {/* Brand */}
      <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="absolute top-4 left-5 z-20 flex items-center gap-2.5 pointer-events-none">
        <div className="grid place-items-center w-9 h-9 rounded-xl glass-strong text-info"><FiRadio size={18} /></div>
        <div>
          <div className="text-[14px] font-extrabold text-white tracking-tight leading-none">COPPER MINE · Digital Twin</div>
          <div className="text-[10px] text-info font-semibold mt-0.5">● LIVE OPERATIONS · simulated telemetry</div>
        </div>
      </motion.div>

      {/* KPI top bar */}
      <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.05 }}
        className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-stretch rounded-2xl glass divide-x divide-white/8 pointer-events-none">
        <Stat icon={<FiTrendingUp size={16} />} label="Today's Production" value={Math.round(plant.production).toLocaleString()} unit="t" accent="#34d399" />
        <Stat icon={<FiTruck size={16} />} label="Fleet Utilization" value={plant.utilization} unit="%" accent="#e7b53c" />
        <Stat icon={<FiActivity size={16} />} label="Throughput" value={plant.throughput.toLocaleString()} unit="t/h" accent="#38bdf8" />
        <Stat icon={<FiActivity size={16} />} label="Cu Recovery" value={plant.recovery} unit="%" accent="#34d399" />
        <Stat icon={<FiZap size={16} />} label="Power" value={plant.power} unit="MW" accent="#a78bfa" />
        <Stat icon={<FiAlertTriangle size={16} />} label="Active Alerts" value={plant.alerts} unit="" accent={plant.alerts ? '#f43f5e' : '#34d399'} />
      </motion.div>

      {/* Fleet summary — bottom right */}
      <motion.div initial={{ x: 18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="absolute bottom-5 right-5 z-20 rounded-2xl glass p-3 w-[208px] pointer-events-none">
        <div className="text-[10px] uppercase tracking-wider text-white/45 font-bold mb-2">Asset Status Summary</div>
        {[['Running', fleet.running, '#34d399'], ['Idle', fleet.idle, '#fbbf24'], ['Maintenance', fleet.maintenance, '#38bdf8'], ['Alarm', fleet.alarm, '#f43f5e']].map(([k, v, c]) => (
          <div key={k} className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-[12px] text-white/80"><span className="w-2.5 h-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />{k}</span>
            <span className="text-[14px] font-bold text-white font-mono">{v}</span>
          </div>
        ))}
      </motion.div>

      {/* Weather — bottom left */}
      <motion.div initial={{ x: -18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="absolute bottom-5 left-5 z-20 rounded-2xl glass p-3 w-[230px] pointer-events-none">
        <div className="text-[10px] uppercase tracking-wider text-white/45 font-bold mb-2">Site Conditions</div>
        <div className="grid grid-cols-2 gap-2">
          {[[<FiThermometer key="t" />, 'Temp', `${weather.temp.toFixed(0)}°C`, '#fb923c'],
            [<FiWind key="w" />, 'Wind', `${weather.wind.toFixed(0)} km/h`, '#38bdf8'],
            [<FiCloud key="d" />, 'Dust PM10', `${weather.dust.toFixed(0)} µg`, '#a78bfa'],
            [<FiDroplet key="h" />, 'Humidity', `${weather.humidity.toFixed(0)}%`, '#34d399']].map(([ic, l, v, c]) => (
            <div key={l} className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-2 py-1.5">
              <span style={{ color: c }}>{ic}</span>
              <div className="leading-tight"><div className="text-[8.5px] uppercase text-white/40 font-semibold">{l}</div><div className="text-[12px] font-bold text-white font-mono">{v}</div></div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Flow legend — top right */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="absolute top-24 right-5 z-20 rounded-xl glass px-3 py-2 pointer-events-none">
        <div className="text-[9px] uppercase tracking-wider text-white/45 font-bold mb-1.5">Material Flow</div>
        <div className="flex flex-col gap-1">
          {[['Ore', MEDIUM_COLOR.ore], ['Concentrate', MEDIUM_COLOR.concentrate], ['Water', MEDIUM_COLOR.water], ['Tailings', MEDIUM_COLOR.tailings], ['Telemetry', '#38bdf8']].map(([k, c]) => (
            <div key={k} className="flex items-center gap-2 text-[10.5px] text-white/70"><span className="w-4 h-1 rounded-full" style={{ background: c }} />{k}</div>
          ))}
        </div>
      </motion.div>
    </>
  )
}
