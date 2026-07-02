import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cyl, Cone, Sphere } from '../Assets/prims'
import { useTelemetry } from '../../../data/telemetryStore'
import { useAI } from '../../../data/aiStore'
import { useUI } from '../../../data/uiStore'
import { ASSET_BY_ID, CONVEYORS } from '../../../data/assets.config'

const RUBBER = { color: '#14181f', metalness: 0.25, roughness: 0.82 }
const STEEL = { color: '#8a929b', metalness: 0.7, roughness: 0.4 }
const DARK = { color: '#3e444d', metalness: 0.6, roughness: 0.5 }
const YELLOW = { color: '#caa233', metalness: 0.4, roughness: 0.5 }
const ORE = { color: '#5a4733', metalness: 0.1, roughness: 0.95 }

function Conveyor({ cfg }) {
  const a = ASSET_BY_ID[cfg.from].pos, b = ASSET_BY_ID[cfg.to].pos
  const { len, yaw, mid } = useMemo(() => {
    const dx = b[0] - a[0], dz = b[2] - a[2]
    return { len: Math.max(6, Math.hypot(dx, dz)), yaw: Math.atan2(-dz, dx), mid: [(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2] }
  }, [a, b])

  const fromRun = useTelemetry(s => s.live[cfg.from]?.state === 'running')
  const conv = useAI(s => s.conveyors.find(c => c.id === cfg.id))
  const det = conv?.detection
  const running = fromRun && !(det && det.sev === 'critical')
  const setEvidence = useUI(s => s.setEvidence)
  const setSelected = useTelemetry(s => s.setSelected)

  const ore = useRef([]), rollers = useRef([]), belt = useRef(), fall = useRef(), dust = useRef()
  const hi = det ? (det.sev === 'critical' ? '#f43f5e' : '#fbbf24') : null
  const nR = Math.min(10, Math.max(4, Math.round(len / 1.8)))
  const nO = Math.min(8, Math.max(4, Math.round(len / 3)))
  const rollerX = useMemo(() => Array.from({ length: nR }, (_, i) => -len / 2 + 0.8 + i * ((len - 1.6) / (nR - 1)), [len, nR]))

  useFrame((s, dt) => {
    if (running) {
      ore.current.forEach(o => { if (o) { o.position.x += dt * 3.2; if (o.position.x > len / 2 - 0.4) o.position.x = -len / 2 + 0.4 } })
      rollers.current.forEach(r => r && (r.rotation.y += dt * 7))
      if (fall.current) { fall.current.position.y -= dt * 4; if (fall.current.position.y < 0.3) fall.current.position.y = 1.4; fall.current.visible = true }
      if (dust.current) { const p = (s.clock.elapsedTime * 0.5) % 1; dust.current.position.y = 0.5 + p; dust.current.scale.setScalar(0.4 + p); dust.current.material.opacity = (1 - p) * 0.35 }
    } else if (fall.current) fall.current.visible = false
    if (belt.current) belt.current.material.emissiveIntensity = hi ? 0.35 + Math.sin(s.clock.elapsedTime * 4) * 0.25 : 0
  })

  return (
    <group position={mid} rotation={[0, yaw, 0]}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
      onClick={(e) => { e.stopPropagation(); setSelected(null); setEvidence(cfg.id) }}>
      {/* trusses + legs */}
      <Box args={[len, 0.14, 0.14]} m={STEEL} position={[0, 1.4, -0.85]} />
      <Box args={[len, 0.14, 0.14]} m={STEEL} position={[0, 1.4, 0.85]} />
      {rollerX.filter((_, i) => i % 2 === 0).map((x, i) => (
        <group key={i}>
          <Box args={[0.12, 1.4, 0.12]} m={DARK} position={[x, 0.7, -0.85]} />
          <Box args={[0.12, 1.4, 0.12]} m={DARK} position={[x, 0.7, 0.85]} />
        </group>
      ))}
      {/* belt */}
      <Box ref={belt} args={[len, 0.14, 1.5]} m={RUBBER} position={[0, 1.55, 0]} emissive={hi || '#000000'} ei={0} />
      {/* side guards */}
      <Box args={[len, 0.3, 0.08]} m={YELLOW} position={[0, 1.74, -0.78]} emissive={hi || '#000000'} ei={hi ? 0.25 : 0} />
      <Box args={[len, 0.3, 0.08]} m={YELLOW} position={[0, 1.74, 0.78]} emissive={hi || '#000000'} ei={hi ? 0.25 : 0} />
      {/* rollers */}
      {rollerX.map((x, i) => (
        <group key={i} position={[x, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <Cyl ref={el => (rollers.current[i] = el)} args={[0.16, 0.16, 1.45, 10]} m={DARK}>
            <mesh position={[0, 0, 0.165]}><boxGeometry args={[0.05, 1.45, 0.02]} /><meshStandardMaterial color="#9aa7b8" metalness={0.8} roughness={0.3} /></mesh>
          </Cyl>
        </group>
      ))}
      {/* head/tail pulleys */}
      <group position={[len / 2, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}><Cyl args={[0.3, 0.3, 1.5, 14]} m={STEEL} /></group>
      <group position={[-len / 2, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}><Cyl args={[0.3, 0.3, 1.5, 14]} m={STEEL} /></group>
      {/* ore on belt */}
      {Array.from({ length: nO }).map((_, i) => (
        <Box key={i} ref={el => (ore.current[i] = el)} args={[0.5, 0.35, 0.7]} m={ORE} position={[-len / 2 + 0.4 + i * ((len - 0.8) / nO), 1.75, (i % 2 ? 0.25 : -0.2)]} />
      ))}
      {/* transfer chute at discharge */}
      <Cone args={[0.9, 1.4, 4]} m={DARK} position={[len / 2 + 0.2, 1.0, 0]} rotation={[0, Math.PI / 4, Math.PI]} />
      <Box ref={fall} args={[0.4, 0.4, 0.4]} m={ORE} position={[len / 2 + 0.2, 0.9, 0]} />
      <Sphere ref={dust} args={[0.5, 10, 10]} m={{ color: '#cbb893', metalness: 0, roughness: 1 }} position={[len / 2 + 0.2, 0.5, 0]} transparent opacity={0.3} />
    </group>
  )
}

export function Conveyors() {
  return <group>{CONVEYORS.map(cfg => <Conveyor key={cfg.id} cfg={cfg} />)}</group>
}
