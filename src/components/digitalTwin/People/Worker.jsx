import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// A small procedural hi-vis worker (~1.8 m). Legs/arms swing for a walk cycle;
// when stationary the arms make a slower "working" motion. Faces +Z.
const PANTS = { color: '#2b3140', metalness: 0.2, roughness: 0.85 }
const BOOTS = { color: '#15181d', metalness: 0.3, roughness: 0.8 }
const SKIN  = { color: '#c8a07a', metalness: 0.05, roughness: 0.85 }

export function Worker({ vest = '#f5821f', hat = '#f2c40d', walking = true, pace = 6, phase = 0, scale = 1 }) {
  const ll = useRef(), rl = useRef(), la = useRef(), ra = useRef(), root = useRef()
  useFrame((s) => {
    const t = s.clock.elapsedTime * pace + phase
    const sw = walking ? Math.sin(t) * 0.5 : Math.sin(t * 0.6) * 0.12
    if (ll.current) ll.current.rotation.x = sw
    if (rl.current) rl.current.rotation.x = -sw
    if (la.current) la.current.rotation.x = walking ? -sw * 0.8 : 0.5 + Math.sin(t * 0.6) * 0.3
    if (ra.current) ra.current.rotation.x = walking ? sw * 0.8 : 0.5 - Math.sin(t * 0.6) * 0.3
    if (root.current) root.current.position.y = walking ? Math.abs(Math.sin(t)) * 0.05 : 0
  })
  const M = (m) => <meshStandardMaterial color={m.color} metalness={m.metalness} roughness={m.roughness} />
  const Leg = (ref, x) => (
    <group ref={ref} position={[x, 0.82, 0]}>
      <mesh castShadow position={[0, -0.35, 0]}><boxGeometry args={[0.17, 0.72, 0.19]} />{M(PANTS)}</mesh>
      <mesh castShadow position={[0, -0.74, 0.05]}><boxGeometry args={[0.2, 0.13, 0.32]} />{M(BOOTS)}</mesh>
    </group>
  )
  const Arm = (ref, x) => (
    <group ref={ref} position={[x, 1.42, 0]}>
      <mesh castShadow position={[0, -0.27, 0]}><boxGeometry args={[0.12, 0.55, 0.14]} />{M({ color: vest, metalness: 0.2, roughness: 0.7 })}</mesh>
      <mesh castShadow position={[0, -0.56, 0]}><boxGeometry args={[0.1, 0.12, 0.12]} />{M(SKIN)}</mesh>
    </group>
  )
  return (
    <group ref={root} scale={scale}>
      {Leg(ll, 0.12)}{Leg(rl, -0.12)}
      <mesh castShadow position={[0, 1.18, 0]}><boxGeometry args={[0.46, 0.62, 0.28]} />{M({ color: vest, metalness: 0.2, roughness: 0.65 })}</mesh>
      <mesh position={[0, 1.16, 0.145]}><boxGeometry args={[0.47, 0.1, 0.02]} />{M({ color: '#e8eef3', metalness: 0.1, roughness: 0.4 })}</mesh>
      <mesh position={[0, 1.16, -0.145]}><boxGeometry args={[0.47, 0.1, 0.02]} />{M({ color: '#e8eef3', metalness: 0.1, roughness: 0.4 })}</mesh>
      {Arm(la, 0.29)}{Arm(ra, -0.29)}
      <mesh castShadow position={[0, 1.64, 0]}><sphereGeometry args={[0.13, 14, 14]} />{M(SKIN)}</mesh>
      <mesh castShadow position={[0, 1.72, 0]}><sphereGeometry args={[0.17, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />{M({ color: hat, metalness: 0.2, roughness: 0.5 })}</mesh>
      <mesh position={[0, 1.7, 0.13]}><boxGeometry args={[0.36, 0.04, 0.12]} />{M({ color: hat, metalness: 0.2, roughness: 0.5 })}</mesh>
    </group>
  )
}
