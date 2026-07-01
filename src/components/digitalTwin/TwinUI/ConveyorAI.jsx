import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Line, Html } from '@react-three/drei'
import { useAI } from '../../../data/aiStore'
import { ASSET_BY_ID } from '../../../data/assets.config'

// When AI vision flags a conveyor, highlight that process link in pulsing red
// with a floating alert. Purely an overlay — appears only while flagged.
function Flagged({ cv }) {
  const lineRef = useRef()
  const a = ASSET_BY_ID[cv.seg[0]], b = ASSET_BY_ID[cv.seg[1]]
  const pts = useMemo(() => {
    if (!a || !b) return null
    const p0 = new THREE.Vector3(a.pos[0], 1.7, a.pos[2])
    const p1 = new THREE.Vector3(b.pos[0], 1.7, b.pos[2])
    const mid = p0.clone().lerp(p1, 0.5); mid.y += 2.0
    return new THREE.QuadraticBezierCurve3(p0, mid, p1).getPoints(24)
  }, [a, b])
  const mid = pts ? pts[Math.floor(pts.length / 2)] : null
  useFrame((s) => { if (lineRef.current?.material) lineRef.current.material.opacity = 0.55 + Math.sin(s.clock.elapsedTime * 5) * 0.35 })
  if (!pts) return null
  return (
    <group>
      <Line ref={lineRef} points={pts} color="#f43f5e" lineWidth={4} transparent opacity={0.8} />
      <Html position={[mid.x, mid.y + 0.6, mid.z]} center distanceFactor={32} zIndexRange={[35, 0]} pointerEvents="none">
        <div className="rounded-lg px-2.5 py-1.5 glass-strong select-none whitespace-nowrap" style={{ border: '1px solid #f43f5e88', boxShadow: '0 0 18px rgba(244,63,94,0.4)' }}>
          <div className="text-[10.5px] font-bold text-[#ff8da0] flex items-center gap-1">⚠ AI Vision · {cv.name}</div>
          <div className="text-[9.5px] text-white/80">{cv.issue} — inspection recommended</div>
        </div>
      </Html>
    </group>
  )
}

export function ConveyorAI() {
  const conveyors = useAI(s => s.conveyors)
  return <group>{conveyors.filter(c => c.status === 'flagged').map(c => <Flagged key={c.id} cv={c} />)}</group>
}
