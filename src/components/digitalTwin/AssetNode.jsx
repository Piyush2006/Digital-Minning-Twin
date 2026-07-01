import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useTelemetry } from '../../data/telemetryStore'
import { HmiCard } from './TwinUI/HmiCard'

const SC = { running: '#34d399', idle: '#fbbf24', maintenance: '#38bdf8', alarm: '#f43f5e' }
const NEAR = 46   // camera distance under which asset names reveal

// Default: just a small status dot (colour = state). Hover/select: full HMI card.
// Zoomed in (camera close): reveal the name chip. Keeps the 3D scene the hero.
export function AssetNode({ asset, cardHeight = 8, children }) {
  const setHovered = useTelemetry(s => s.setHovered)
  const setSelected = useTelemetry(s => s.setSelected)
  const hovered = useTelemetry(s => s.hovered === asset.id)
  const selected = useTelemetry(s => s.selected === asset.id)
  const state = useTelemetry(s => s.live[asset.id]?.state) || 'running'
  const [near, setNear] = useState(false)
  const nearRef = useRef(false)

  useFrame((s) => {
    const c = s.camera.position, p = asset.pos
    const d = Math.hypot(c.x - p[0], c.y - p[1], c.z - p[2])
    const n = d < NEAR
    if (n !== nearRef.current) { nearRef.current = n; setNear(n) }
  })

  const showCard = hovered || selected
  const color = SC[state] || '#9aa7b8'

  return (
    <group position={asset.pos}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(asset.id) }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(null) }}
      onClick={(e) => { e.stopPropagation(); setSelected(asset.id) }}>
      {children}

      {showCard && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.7, 48]} />
          <meshBasicMaterial color={selected ? '#38bdf8' : '#e6edf6'} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      )}

      {/* always-on status dot */}
      {!showCard && (
        <mesh position={[0, cardHeight * 0.72, 0]}>
          <sphereGeometry args={[0.42, 14, 14]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      )}

      {showCard ? (
        <Html position={[0, cardHeight, 0]} center distanceFactor={30} zIndexRange={[30, 0]} pointerEvents="none" wrapperClass="dt-card">
          <HmiCard asset={asset} expanded />
        </Html>
      ) : near ? (
        <Html position={[0, cardHeight * 0.92, 0]} center distanceFactor={40} zIndexRange={[18, 0]} pointerEvents="none" wrapperClass="dt-card">
          <HmiCard asset={asset} expanded={false} />
        </Html>
      ) : null}
    </group>
  )
}
