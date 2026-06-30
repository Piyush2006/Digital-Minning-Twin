import { Html } from '@react-three/drei'
import { useTelemetry } from '../../data/telemetryStore'
import { HmiCard } from './TwinUI/HmiCard'

// Wraps any equipment mesh: places it, handles hover/select → store, draws a
// ground selection ring, and anchors the floating HMI status card above it.
export function AssetNode({ asset, cardHeight = 8, children }) {
  const setHovered = useTelemetry(s => s.setHovered)
  const setSelected = useTelemetry(s => s.setSelected)
  const hovered = useTelemetry(s => s.hovered === asset.id)
  const selected = useTelemetry(s => s.selected === asset.id)

  return (
    <group position={asset.pos}>
      <group
        onPointerOver={(e) => { e.stopPropagation(); setHovered(asset.id) }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(null) }}
        onClick={(e) => { e.stopPropagation(); setSelected(asset.id) }}
      >
        {children}
      </group>

      {(hovered || selected) && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.7, 56]} />
          <meshBasicMaterial color={selected ? '#38bdf8' : '#e6edf6'} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      )}

      <Html position={[0, cardHeight, 0]} center distanceFactor={34} zIndexRange={[30, 0]}
        pointerEvents="none" wrapperClass="dt-card">
        <HmiCard asset={asset} expanded={hovered || selected} />
      </Html>
    </group>
  )
}
