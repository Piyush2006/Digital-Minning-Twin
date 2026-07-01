import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { HaulTruck } from './Mine'
import { HmiCard } from '../TwinUI/HmiCard'
import { useTelemetry } from '../../../data/telemetryStore'
import { ASSETS, HAUL_LOOP } from '../../../data/assets.config'

const TRUCKS = ASSETS.filter(a => a.type === 'HaulTruck')

// A single truck: if its live state is "running" it circulates the haul-road
// loop (facing its travel direction); otherwise it parks at its config spot.
// The HMI status card rides along with it.
function MovingTruck({ asset, curve, offset }) {
  const grp = useRef()
  const t = useRef(offset)
  const state = useTelemetry(s => s.live[asset.id]?.state)
  const setHovered = useTelemetry(s => s.setHovered)
  const setSelected = useTelemetry(s => s.setSelected)
  const hovered = useTelemetry(s => s.hovered === asset.id)
  const selected = useTelemetry(s => s.selected === asset.id)
  const moving = state === 'running'
  const showCard = hovered || selected
  const SC = { running: '#34d399', idle: '#fbbf24', maintenance: '#38bdf8', alarm: '#f43f5e' }

  useFrame((_, dt) => {
    if (!grp.current) return
    if (moving) {
      t.current = (t.current + dt * 0.012) % 1
      const p = curve.getPointAt(t.current)
      const tan = curve.getTangentAt(t.current)
      grp.current.position.set(p.x, 0, p.z)
      grp.current.rotation.y = Math.atan2(-tan.z, tan.x)   // align truck +X (front) with travel
    } else {
      grp.current.position.set(asset.pos[0], 0, asset.pos[2])
    }
  })

  return (
    <group ref={grp}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(asset.id) }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(null) }}
      onClick={(e) => { e.stopPropagation(); setSelected(asset.id) }}>
      <HaulTruck asset={asset} />
      {showCard && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.7, 40]} />
          <meshBasicMaterial color={selected ? '#38bdf8' : '#e6edf6'} transparent opacity={0.85} toneMapped={false} />
        </mesh>
      )}
      {!showCard && (
        <mesh position={[0, 5, 0]}><sphereGeometry args={[0.42, 14, 14]} /><meshBasicMaterial color={SC[state] || '#e7b53c'} toneMapped={false} /></mesh>
      )}
      {showCard && (
        <Html position={[0, 5.5, 0]} center distanceFactor={30} zIndexRange={[30, 0]} pointerEvents="none" wrapperClass="dt-card">
          <HmiCard asset={asset} expanded />
        </Html>
      )}
    </group>
  )
}

export function Fleet() {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(HAUL_LOOP.map(p => new THREE.Vector3(p[0], 0, p[2])), true, 'catmullrom', 0.4),
    [])
  return <group>{TRUCKS.map((a, i) => <MovingTruck key={a.id} asset={a} curve={curve} offset={i / TRUCKS.length} />)}</group>
}
