import { useEffect } from 'react'
import { Stage } from './scene/Stage'
import { Hud } from './components/digitalTwin/TwinUI/Hud'
import { RightWidget } from './components/digitalTwin/TwinUI/RightWidget'
import { Dock } from './components/digitalTwin/TwinUI/Dock'
import { AssetSidePanel } from './components/digitalTwin/TwinUI/AssetSidePanel'
import { AIOpsCenter } from './components/digitalTwin/TwinUI/AIOpsCenter'
import { ControlRoomModal } from './components/digitalTwin/TwinUI/ControlRoomModal'
import { useTelemetry } from './data/telemetryStore'
import { useAI } from './data/aiStore'
import { useUI } from './data/uiStore'

export function MiningDigitalTwin() {
  const tick = useTelemetry(s => s.tick)
  const aiTick = useAI(s => s.tick)
  const simSpeed = useUI(s => s.simSpeed)

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
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'radial-gradient(130% 130% at 50% 0%, #0b1220 0%, #060a11 55%, #03050a 100%)' }}>
      <Stage />
      <Hud />
      <AIOpsCenter />
      <RightWidget />
      <AssetSidePanel />
      <ControlRoomModal />
      <Dock />
      <div className="pointer-events-none absolute inset-0 z-10" style={{ boxShadow: 'inset 0 0 200px rgba(0,0,0,0.6)' }} />
    </div>
  )
}
