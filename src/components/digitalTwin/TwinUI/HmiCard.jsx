import { useTelemetry } from '../../../data/telemetryStore'

export const STATUS = {
  running:     { c: '#34d399', t: 'Running' },
  idle:        { c: '#fbbf24', t: 'Idle' },
  maintenance: { c: '#38bdf8', t: 'Maintenance' },
  alarm:       { c: '#f43f5e', t: 'Alarm' },
}
const fmt = (v) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString() : v)

export function HmiCard({ asset, expanded }) {
  const live = useTelemetry(s => s.live[asset.id])
  if (!live) return null
  const st = STATUS[live.state] || STATUS.running
  const healthC = live.health > 80 ? '#34d399' : live.health > 60 ? '#fbbf24' : '#f43f5e'

  if (!expanded) {
    return (
      <div className="flex items-center gap-1.5 rounded-md px-2 py-1 glass text-[11px] whitespace-nowrap select-none">
        <span className="w-2 h-2 rounded-full" style={{ background: st.c, boxShadow: `0 0 8px ${st.c}` }} />
        <span className="font-semibold text-white/90">{asset.label}</span>
      </div>
    )
  }
  return (
    <div className="w-[208px] rounded-xl glass-strong p-2.5 select-none" style={{ boxShadow: '0 14px 38px rgba(0,0,0,0.55)' }}>
      <div className="flex items-center justify-between">
        <div className="text-[12.5px] font-bold text-white tracking-tight">{asset.label}</div>
        <span className="chip" style={{ background: `${st.c}22`, color: st.c, border: `1px solid ${st.c}55` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.c }} />{st.t}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${live.health}%`, background: healthC }} />
        </div>
        <span className="text-[10px] font-semibold" style={{ color: healthC }}>{Math.round(live.health)}%</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {asset.metrics.slice(0, 4).map(m => (
          <div key={m.key} className="rounded-md bg-white/[0.04] px-1.5 py-1">
            <div className="text-[9px] uppercase tracking-wide text-white/45 truncate">{m.label}</div>
            <div className="text-[12px] font-bold text-white/90 font-mono">
              {fmt(live.metrics[m.key])}<span className="text-[9px] font-medium text-white/40 ml-0.5">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[9.5px] text-white/45">
        <span>Util {live.utilization}%</span>
        <span>{fmt(live.hours)} h</span>
        <span className={live.alarms ? 'text-alarm font-semibold' : ''}>{live.alarms} alm</span>
      </div>
    </div>
  )
}
