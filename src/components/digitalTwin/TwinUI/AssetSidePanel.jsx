import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiActivity, FiTool, FiClock } from 'react-icons/fi'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { useTelemetry } from '../../../data/telemetryStore'
import { ASSET_BY_ID } from '../../../data/assets.config'
import { STATUS } from './HmiCard'

const chartOpts = (name, unit, data, color) => ({
  chart: { type: 'areaspline', backgroundColor: 'transparent', height: 150, margin: [10, 6, 22, 36] },
  title: { text: null }, credits: { enabled: false }, legend: { enabled: false }, accessibility: { enabled: false },
  xAxis: { labels: { enabled: false }, lineColor: 'rgba(255,255,255,0.08)', tickLength: 0 },
  yAxis: { title: { text: null }, gridLineColor: 'rgba(255,255,255,0.06)', labels: { style: { color: 'rgba(255,255,255,0.4)', fontSize: '9px' } } },
  tooltip: { backgroundColor: '#0d1422', borderColor: color, style: { color: '#fff', fontSize: '11px' }, valueSuffix: ' ' + unit },
  plotOptions: { areaspline: { lineWidth: 2, marker: { enabled: false }, fillOpacity: 0.18,
    fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, color + '88'], [1, color + '00']] } } },
  series: [{ name, data, color }],
})

export function AssetSidePanel() {
  const selected = useTelemetry(s => s.selected)
  const setSelected = useTelemetry(s => s.setSelected)
  const live = useTelemetry(s => (selected ? s.live[selected] : null))
  const asset = selected ? ASSET_BY_ID[selected] : null

  return (
    <AnimatePresence>
      {asset && live && (
        <motion.div key={asset.id} initial={{ x: 360, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 360, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="absolute top-0 right-0 h-full w-[360px] z-30 glass-strong border-l border-white/10 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">{asset.group} · {asset.type}</div>
                <div className="text-[19px] font-extrabold text-white tracking-tight leading-tight">{asset.label}</div>
              </div>
              <button onClick={() => setSelected(null)} className="grid place-items-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70"><FiX /></button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="chip" style={{ background: `${STATUS[live.state].c}22`, color: STATUS[live.state].c, border: `1px solid ${STATUS[live.state].c}55` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS[live.state].c }} />{STATUS[live.state].t}</span>
              <span className="chip bg-white/5 text-white/70"><FiClock size={11} /> {live.hours.toLocaleString()} h</span>
              <span className="chip bg-white/5 text-white/70"><FiTool size={11} /> {live.maintDays === 0 ? 'Due now' : `${live.maintDays} d`}</span>
            </div>

            {/* health */}
            <div className="mt-4 rounded-xl bg-white/[0.04] p-3">
              <div className="flex items-center justify-between text-[11px] text-white/60"><span>Asset Health</span><span className="font-bold" style={{ color: live.health > 80 ? '#34d399' : live.health > 60 ? '#fbbf24' : '#f43f5e' }}>{Math.round(live.health)}%</span></div>
              <div className="mt-1.5 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${live.health}%`, background: live.health > 80 ? '#34d399' : live.health > 60 ? '#fbbf24' : '#f43f5e' }} /></div>
            </div>

            {/* primary metric chart */}
            <div className="mt-4">
              <div className="flex items-center gap-1.5 text-[11px] text-white/55 font-semibold mb-1"><FiActivity size={12} /> {asset.metrics[0].label} — live trend</div>
              <div className="rounded-xl bg-white/[0.03] p-1">
                <HighchartsReact highcharts={Highcharts} options={chartOpts(asset.metrics[0].label, asset.metrics[0].unit, live.history[asset.metrics[0].key], asset.accent || '#38bdf8')} />
              </div>
            </div>

            {/* all live values */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {asset.metrics.map(m => (
                <div key={m.key} className="rounded-lg bg-white/[0.04] px-2.5 py-2">
                  <div className="text-[9px] uppercase tracking-wide text-white/40">{m.label}</div>
                  <div className="text-[15px] font-bold text-white font-mono">{(Math.abs(live.metrics[m.key]) >= 1000 ? Math.round(live.metrics[m.key]).toLocaleString() : live.metrics[m.key])}<span className="text-[9px] text-white/40 ml-0.5 font-sans">{m.unit}</span></div>
                </div>
              ))}
            </div>

            {/* sensors / maintenance */}
            <div className="mt-4 rounded-xl bg-white/[0.04] p-3">
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-2">Connected Sensors</div>
              {asset.metrics.map(m => (
                <div key={m.key} className="flex items-center justify-between py-1 text-[11px]">
                  <span className="flex items-center gap-2 text-white/70"><span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />{m.label} sensor</span>
                  <span className="text-white/40 font-mono">online</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[10px] text-white/30 text-center">Utilization {live.utilization}% · {live.alarms} active alarm(s)</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
