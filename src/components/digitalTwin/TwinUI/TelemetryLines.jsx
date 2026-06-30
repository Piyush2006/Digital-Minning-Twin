import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { ASSETS, CONTROL_ROOM } from '../../../data/assets.config'
import { CARD_HEIGHT } from '../registry'

const HUB = new THREE.Vector3(CONTROL_ROOM.pos[0], 5, CONTROL_ROOM.pos[2])

// Animated dashed telemetry link + a travelling data pulse, asset → control room.
function Link({ asset, i }) {
  const lineRef = useRef(), pulse = useRef()
  const start = useMemo(() => new THREE.Vector3(asset.pos[0], (CARD_HEIGHT[asset.type] || 5) * 0.55, asset.pos[2]), [asset])
  const phase = useMemo(() => Math.random(), [])
  useFrame((s, dt) => {
    if (lineRef.current?.material) lineRef.current.material.dashOffset -= dt * 0.8
    if (pulse.current) {
      const t = (s.clock.elapsedTime * 0.35 + phase) % 1
      pulse.current.position.lerpVectors(start, HUB, t)
      pulse.current.material.opacity = Math.sin(t * Math.PI)
    }
  })
  return (
    <group>
      <Line ref={lineRef} points={[start, HUB]} color="#38bdf8" lineWidth={1} transparent opacity={0.22}
        dashed dashSize={0.6} gapSize={0.5} />
      <mesh ref={pulse}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshBasicMaterial color="#9fe2ff" transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

export function TelemetryLines() {
  return <group>{ASSETS.map((a, i) => <Link key={a.id} asset={a} i={i} />)}</group>
}
