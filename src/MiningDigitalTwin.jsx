import { useEffect } from 'react'
import { Leva, useControls } from 'leva'
import { Stage } from './scene/Stage'
import { Hud } from './components/digitalTwin/TwinUI/Hud'
import { AssetSidePanel } from './components/digitalTwin/TwinUI/AssetSidePanel'
import { AIOpsCenter } from './components/digitalTwin/TwinUI/AIOpsCenter'
import { useTelemetry } from './data/telemetryStore'
import { useAI } from './data/aiStore'

export function MiningDigitalTwin() {
  const tick = useTelemetry(s => s.tick)
  const aiTick = useAI(s => s.tick)
  const { simSpeed } = useControls('Twin Controls', { simSpeed: { value: 1, min: 0.25, max: 3, step: 0.25, label: 'Sim Speed' } })

  // Live telemetry clock — drives every card, KPI and chart.
  useEffect(() => {
    if (simSpeed <= 0) return
    const id = setInterval(() => tick(), Math.round(1000 / simSpeed))
    return () => clearInterval(id)
  }, [tick, simSpeed])

  // AI reasoning clock — derives insights/predictions every ~4s.
  useEffect(() => {
    if (simSpeed <= 0) return
    const id = setInterval(() => aiTick(), Math.round(4000 / simSpeed))
    return () => clearInterval(id)
  }, [aiTick, simSpeed])

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'radial-gradient(120% 120% at 50% 0%, #0d1422 0%, #070b12 60%, #04060b 100%)' }}>
      <Stage />
      <Hud />
      <AIOpsCenter />
      <AssetSidePanel />
      <Leva hidden />
      {/* subtle vignette frame for the executive-console feel */}
      <div className="pointer-events-none absolute inset-0 z-10" style={{ boxShadow: 'inset 0 0 180px rgba(0,0,0,0.55)' }} />
    </div>
  )
}
