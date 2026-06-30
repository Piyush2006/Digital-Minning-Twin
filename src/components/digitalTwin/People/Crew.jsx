import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Worker } from './Worker'
import { WORKERS } from '../../../data/assets.config'

// Patrolling worker: eases back and forth along a 2-point path, facing travel.
// Stationary worker: stands and "works" in place.
function Crewman({ w, i }) {
  const g = useRef()
  const a = useMemo(() => (w.path ? new THREE.Vector3(...w.path[0]) : new THREE.Vector3(...w.pos)), [w])
  const b = useMemo(() => (w.path ? new THREE.Vector3(...w.path[1]) : a), [w, a])
  useFrame((s) => {
    if (!g.current || !w.path) return
    const ph = s.clock.elapsedTime * (w.speed || 0.22) + i
    const tt = Math.sin(ph) * 0.5 + 0.5
    const p = a.clone().lerp(b, tt)
    g.current.position.set(p.x, 0, p.z)
    const fwd = Math.cos(ph) >= 0 ? b.clone().sub(a) : a.clone().sub(b)
    g.current.rotation.y = Math.atan2(fwd.x, fwd.z)
  })
  return (
    <group ref={g} position={w.path ? w.path[0] : w.pos} rotation={[0, w.rot || 0, 0]}>
      <Worker vest={w.vest} hat={w.hat} walking={!!w.path} phase={i * 1.7} pace={w.path ? 6.5 : 3} />
    </group>
  )
}

export function Crew() {
  return <group>{WORKERS.map((w, i) => <Crewman key={i} w={w} i={i} />)}</group>
}
