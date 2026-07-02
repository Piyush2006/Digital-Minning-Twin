import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Line, Html } from '@react-three/drei'
import { useAI } from '../../../data/aiStore'
import { useUI } from '../../../data/uiStore'
import { useTelemetry } from '../../../data/telemetryStore'
import { ASSET_BY_ID } from '../../../data/assets.config'

// When AI vision detects an anomaly on a conveyor, highlight the link in pulsing
// severity colour with a clickable alert that opens the AI Vision Evidence panel.
function Flagged({ cv }) {
  const lineRef = useRef()
  const a = ASSET_BY_ID[cv.from], b = ASSET_BY_ID[cv.to]
  const setEvidence = useUI(s => s.setEvidence)
  const setSelected = useTelemetry(s => s.setSelected)
  const col = cv.detection.sev === 'critical' ? '#f43f5e' : '#fbbf24'
  const pts = useMemo(() => {
    if (!a || !b) return null
    const p0 = new THREE.Vector3(a.pos[0], 1.8, a.pos[2])
    const p1 = new THREE.Vector3(b.pos[0], 1.8, b.pos[2])
    const mid = p0.clone().lerp(p1, 0.5); mid.y += 2.2
    return new THREE.QuadraticBezierCurve3(p0, mid, p1).getPoints(24)
  }, [a, b])
  const mid = pts ? pts[Math.floor(pts.length / 2)] : null
  useFrame((s) => { if (lineRef.current?.material) lineRef.current.material.opacity = 0.5 + Math.sin(s.clock.elapsedTime * 5) * 0.35 })
  if (!pts) return null
  return (
    <group>
      <Line ref={lineRef} points={pts} color={col} lineWidth={4} transparent opacity={0.8} />
      <Html position={[mid.x, mid.y + 0.6, mid.z]} center distanceFactor={30} zIndexRange={[35, 0]} pointerEvents="auto">
        <button onClick={() => { setSelected(null); setEvidence(cv.id) }}
          className="rounded-lg px-2.5 py-1.5 glass-strong select-none whitespace-nowrap cursor-pointer text-left" style={{ border: `1px solid ${col}99`, boxShadow: `0 0 18px ${col}66` }}>
          <div className="text-[10.5px] font-bold flex items-center gap-1" style={{ color: col }}>⚠ AI Vision · {cv.name} · {cv.detection.conf}%</div>
          <div className="text-[9.5px] text-white/80">{cv.detection.type} — click for evidence ›</div>
        </button>
      </Html>
    </group>
  )
}

export function ConveyorAI() {
  const conveyors = useAI(s => s.conveyors)
  return <group>{conveyors.filter(c => c.detection).map(c => <Flagged key={c.id} cv={c} />)}</group>
}
