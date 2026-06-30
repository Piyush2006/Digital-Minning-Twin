import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cyl, Cone, Sphere, MAT } from '../Assets/prims'
import { useTelemetry } from '../../../data/telemetryStore'

const useLive = (id) => useTelemetry(s => s.live[id])
const ORE = { color: '#5a4733', metalness: 0.1, roughness: 0.95 }
const SMOKE = { color: '#c4ccd4', metalness: 0, roughness: 1 }

function Smoke({ position, run, h = 3, r = 0.9 }) {
  const ref = useRef(), ph = useRef(Math.random())
  useFrame((s) => {
    if (!ref.current) return
    const p = run ? ((s.clock.elapsedTime * 0.25 + ph.current) % 1) : 0
    ref.current.position.y = position[1] + p * h
    ref.current.scale.setScalar(0.5 + p * 1.3)
    ref.current.material.opacity = run ? (1 - p) * 0.5 : 0
  })
  return <Sphere ref={ref} args={[r, 10, 10]} m={SMOKE} position={position} transparent opacity={0.5} />
}

// ───────── Rail Loadout + Train ─────────
export function RailLoadout({ asset }) {
  const run = useLive(asset.id).state === 'running'; const roll = useRef()
  useFrame((_, dt) => { if (run && roll.current) roll.current.rotation.x += dt * 5 })
  return (
    <group>
      <Box args={[7, 0.4, 20]} m={MAT.concrete} position={[0, 0.2, 0]} />
      <Box args={[5, 5, 4]} m={MAT.paint} position={[0, 4.5, 3]} />
      {[[-2.2, 1.2], [2.2, 1.2], [-2.2, 4.8], [2.2, 4.8]].map(([x, z], i) =>
        <Box key={i} args={[0.4, 4, 0.4]} m={MAT.dark} position={[x, 2, z]} />)}
      <Cone args={[1.4, 2.2, 16]} m={MAT.dark} position={[0, 1.4, 3]} rotation={[Math.PI, 0, 0]} />
      <Cyl ref={roll} args={[0.4, 0.4, 1.2, 12]} m={MAT.steel} position={[2.6, 1.2, 3]} rotation={[Math.PI / 2, 0, 0]} />
      <Box args={[0.18, 0.2, 19]} m={MAT.steel} position={[-0.75, 0.45, 0]} />
      <Box args={[0.18, 0.2, 19]} m={MAT.steel} position={[0.75, 0.45, 0]} />
      <Box args={[3.2, 2.2, 2.6]} m={{ color: '#2f4a6b', metalness: 0.6, roughness: 0.4 }} position={[0, 1.8, -6.5]} />
      <Box args={[1.6, 1.1, 2.4]} m={{ color: '#2f4a6b', metalness: 0.6, roughness: 0.4 }} position={[1, 3.3, -6.5]} />
      {[-1.5, 3.5].map((z, i) => (
        <group key={i} position={[0, 0, z]}>
          <Box args={[4.4, 2, 2.6]} m={MAT.dark} position={[0, 1.7, 0]} />
          <Box args={[4, 0.6, 2.2]} m={ORE} position={[0, 2.9, 0]} />
        </group>
      ))}
    </group>
  )
}

// ───────── Ship Loader ─────────
export function ShipLoader({ asset }) {
  const live = useLive(asset.id); const run = live.state === 'running'; const roll = useRef(), stream = useRef()
  useFrame((s, dt) => {
    if (run && roll.current) roll.current.rotation.x += dt * 5
    if (stream.current) { const p = run ? (s.clock.elapsedTime * 1.1) % 1 : 0; stream.current.position.y = 5 - p * 4.5; stream.current.visible = run && p < 0.85 }
  })
  return (
    <group>
      <Box args={[9, 0.6, 12]} m={MAT.concrete} position={[0, 0.3, 0]} />
      {[[-3, -3], [3, -3], [-3, 3], [3, 3]].map(([x, z], i) =>
        <Box key={i} args={[0.5, 6, 0.5]} m={MAT.yellow} position={[x, 3.3, z]} />)}
      <Box args={[8, 0.7, 2]} m={MAT.paint} position={[0, 6.3, 0]} />
      <Box args={[3, 2.2, 3]} m={MAT.yellow} position={[0, 7.6, 0]} />
      <Box args={[17, 0.7, 1.3]} m={MAT.yellow} position={[9, 7, 0]} />
      <Box args={[16, 0.08, 0.9]} m={MAT.rubber} position={[9, 6.7, 0]} />
      <Cyl ref={roll} args={[0.4, 0.4, 1.1, 12]} m={MAT.steel} position={[16.5, 6.7, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Box args={[1.2, 2.2, 1.2]} m={MAT.dark} position={[16, 5.6, 0]} />
      <Box args={[4, 0.7, 1.3]} m={MAT.dark} position={[-4, 7, 0]} />
      <Sphere ref={stream} args={[0.4, 8, 8]} m={ORE} position={[16, 5, 0]} />
    </group>
  )
}

// ───────── Bulk Carrier ─────────
export function BulkCarrier({ asset }) {
  const live = useLive(asset.id); const run = live.state === 'running'; const hull = useRef(), crane = useRef()
  useFrame((s, dt) => {
    if (hull.current) { hull.current.position.y = Math.sin(s.clock.elapsedTime * 0.5) * 0.12; hull.current.rotation.z = Math.sin(s.clock.elapsedTime * 0.4) * 0.01 }
    if (run && crane.current) crane.current.rotation.y += dt * 0.3
  })
  return (
    <group ref={hull}>
      <Box args={[30, 3, 8]} m={MAT.red} position={[0, 1.8, 0]} />
      <Box args={[28, 1.4, 7]} m={{ color: '#3a2520', metalness: 0.3, roughness: 0.7 }} position={[0, 0.6, 0]} />
      <Cone args={[2, 4, 4]} m={MAT.red} position={[16, 1.8, 0]} rotation={[0, 0, -Math.PI / 2]} />
      <Box args={[30, 0.4, 8]} m={MAT.paint} position={[0, 3.5, 0]} />
      {[6, 0, -6].map((x, i) => <Box key={i} args={[4.5, 0.6, 5]} m={ORE} position={[x, 3.9, 0]} />)}
      <Box args={[5, 4.5, 7]} m={MAT.white} position={[-12, 5.9, 0]} />
      <Box args={[0.1, 1, 5]} m={MAT.glass} position={[-9.4, 7.5, 0]} />
      <Cyl args={[0.9, 0.9, 2.4, 16]} m={{ color: '#2f4a6b', metalness: 0.5, roughness: 0.5 }} position={[-13.5, 9, 0]} />
      <Cyl ref={crane} args={[0.3, 0.3, 3.2, 10]} m={MAT.yellow} position={[3, 5.2, 0]} />
      <Smoke position={[-13.5, 11, 0]} run={run} />
    </group>
  )
}

// ───────── Smelter ─────────
export function Smelter({ asset }) {
  const run = useLive(asset.id).state === 'running'; const conv = useRef()
  useFrame((_, dt) => { if (run && conv.current) conv.current.rotation.y += dt * 0.8 })
  return (
    <group>
      <Box args={[18, 0.5, 13]} m={MAT.concrete} position={[0, 0.25, 0]} />
      <Box args={[13, 8, 10]} m={MAT.paint} position={[0, 4.5, 0]} />
      <Box args={[13.4, 0.4, 10.4]} m={MAT.dark} position={[0, 8.7, 0]} />
      <Box args={[3, 3, 3]} m={{ color: '#3a3030', metalness: 0.6, roughness: 0.6 }} position={[0, 2.5, 5.2]} emissive="#ff5a1f" ei={run ? 1.1 : 0.2} />
      <Cyl ref={conv} args={[1.6, 1.6, 3.2, 16]} m={MAT.dark} position={[0, 2.5, -5]} rotation={[0, 0, Math.PI / 2]} />
      <Cyl args={[1, 1, 13, 16]} m={MAT.paint} position={[4.5, 7, -3]} />
      <Cyl args={[1, 1, 13, 16]} m={MAT.paint} position={[-4.5, 7, -3]} />
      <Smoke position={[4.5, 14, -3]} run={run} h={4} r={1.3} />
      <Smoke position={[-4.5, 13.6, -3]} run={run} h={4} r={1.1} />
      <Box args={[3, 3, 3]} m={MAT.yellow} position={[7, 1.8, 5]} />
      <Cone args={[3, 2, 16]} m={MAT.dark} position={[9, 1.2, 4]} />
    </group>
  )
}
