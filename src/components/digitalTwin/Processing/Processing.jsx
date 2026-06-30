import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cyl, Cone, Sphere, Torus, MAT } from '../Assets/prims'
import { useTelemetry } from '../../../data/telemetryStore'

const useLive = (id) => useTelemetry(s => s.live[id])
const ORE = { color: '#5a4733', metalness: 0.1, roughness: 0.95 }
const FOAM = { color: '#cfd6dc', metalness: 0, roughness: 0.9 }
const SLURRY = { color: '#6e5436', metalness: 0.2, roughness: 0.5 }
const DUST = { color: '#cbb893', metalness: 0, roughness: 1 }

function Riser({ position, color = DUST, h = 1.6, r = 0.5, run }) {
  const ref = useRef(), ph = useRef(Math.random())
  useFrame((s) => {
    if (!ref.current) return
    const p = run ? ((s.clock.elapsedTime * 0.4 + ph.current) % 1) : 0
    ref.current.position.y = position[1] + p * h
    ref.current.scale.setScalar(0.4 + p)
    ref.current.material.opacity = run ? (1 - p) * 0.55 : 0
  })
  return <Sphere ref={ref} args={[r, 10, 10]} m={color} position={position} transparent opacity={0.5} />
}

// ───────── Primary Crusher ─────────
export function Crusher({ asset }) {
  const run = useLive(asset.id).state === 'running'; const mantle = useRef()
  useFrame((_, dt) => { if (run && mantle.current) mantle.current.rotation.y += dt * 1.6 })
  return (
    <group>
      <Cyl args={[2.6, 2.6, 2.4, 28]} m={MAT.paint} position={[0, 1.7, 0]} />
      <Torus args={[2.4, 0.35, 10, 28]} m={MAT.steel} position={[0, 3.4, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Cone ref={mantle} args={[1.3, 3.4, 24]} m={MAT.dark} position={[0, 3, 0]} />
      <Cone args={[2.7, 1.4, 24]} m={MAT.paint} position={[0, 4.9, 0]} />
      <Cone args={[2.5, 1.6, 24]} m={MAT.dark} position={[0, 5.9, 0]} rotation={[Math.PI, 0, 0]} />
      <Box args={[5.6, 0.3, 0.4]} m={MAT.steel} position={[0, 5, 0]} />
      <Cyl args={[0.6, 0.6, 1.8, 12]} m={MAT.paint} position={[3.6, 1.2, 0]} rotation={[0, 0, Math.PI / 2]} />
      <Riser position={[0, 5.4, 0]} run={run} r={0.6} />
    </group>
  )
}

// ───────── Vibrating Screen ─────────
export function Screen({ asset }) {
  const run = useLive(asset.id).state === 'running'; const deck = useRef(), ex = useRef()
  useFrame((s, dt) => {
    if (deck.current) deck.current.position.y = 1.75 + (run ? Math.sin(s.clock.elapsedTime * 12) * 0.06 : 0)
    if (run && ex.current) ex.current.rotation.x += dt * 14
  })
  return (
    <group>
      <Box args={[5, 0.3, 0.5]} m={MAT.dark} position={[0, 0.55, -1.5]} />
      <Box args={[5, 0.3, 0.5]} m={MAT.dark} position={[0, 0.55, 1.5]} />
      {[[-2.2, -1.4], [2.2, -1.4], [-2.2, 1.4], [2.2, 1.4]].map(([x, z], i) =>
        <Cyl key={i} args={[0.18, 0.18, 0.7, 10]} m={MAT.yellow} position={[x, 1, z]} />)}
      <group ref={deck} position={[0, 1.75, 0]} rotation={[0, 0, -0.18]}>
        <Box args={[5, 1.5, 0.15]} m={MAT.paint} position={[0, 0, -1.5]} />
        <Box args={[5, 1.5, 0.15]} m={MAT.paint} position={[0, 0, 1.5]} />
        <Box args={[4.8, 0.08, 2.7]} m={MAT.steel} position={[0, 0.3, 0]} />
        <Box args={[4.8, 0.08, 2.7]} m={MAT.steel} position={[0, -0.3, 0]} />
        <Cyl ref={ex} args={[0.4, 0.4, 1.4, 12]} m={MAT.black} position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]} />
      </group>
    </group>
  )
}

// ───────── SAG Mill ─────────
export function SagMill({ asset }) {
  const live = useLive(asset.id); const run = live.state === 'running'; const drum = useRef()
  const spd = 0.6 + (live.metrics.load || 34) / 60
  useFrame((_, dt) => { if (run && drum.current) drum.current.rotation.y += dt * spd })
  return (
    <group>
      <Box args={[1.6, 2.4, 4]} m={MAT.concrete} position={[-4.5, 1.8, 0]} />
      <Box args={[1.6, 2.4, 4]} m={MAT.concrete} position={[4.5, 1.8, 0]} />
      <group rotation={[0, 0, Math.PI / 2]} position={[0, 3.4, 0]}>
        <group ref={drum}>
          <Cyl args={[2.6, 2.6, 7, 30]} m={MAT.paint} />
          <Cyl args={[2.68, 2.68, 0.4, 30]} m={MAT.steel} position={[0, 1.9, 0]} />
          <Cyl args={[2.68, 2.68, 0.4, 30]} m={MAT.steel} position={[0, -1.9, 0]} />
          <Torus args={[2.7, 0.32, 10, 30]} m={MAT.copper} position={[0, 3.4, 0]} />
        </group>
      </group>
      <Cone args={[1.4, 2, 20]} m={MAT.dark} position={[-5, 3.4, 0]} rotation={[0, 0, -Math.PI / 2]} />
      <Cyl args={[1.6, 1.6, 1.6, 20]} m={MAT.steel} position={[5, 3.4, 0]} rotation={[0, 0, Math.PI / 2]} />
      <Box args={[2.6, 1.4, 3]} m={MAT.dark} position={[6, 0.8, 0]} />
      <Cyl args={[0.8, 0.8, 2.4, 12]} m={MAT.paint} position={[3.4, 1.4, 2.6]} />
    </group>
  )
}

// ───────── Hydrocyclone Cluster ─────────
export function Hydrocyclone({ asset }) {
  const run = useLive(asset.id).state === 'running'; const dist = useRef()
  useFrame((_, dt) => { if (run && dist.current) dist.current.rotation.y += dt * 0.8 })
  const ring = [[0.9, 0], [0.45, 0.78], [-0.45, 0.78], [-0.9, 0], [-0.45, -0.78], [0.45, -0.78]]
  return (
    <group>
      {[[1.2, 1.2], [-1.2, 1.2], [1.2, -1.2], [-1.2, -1.2]].map(([x, z], i) =>
        <Box key={i} args={[0.2, 3.2, 0.2]} m={MAT.paint} position={[x, 1.8, z]} />)}
      <Cyl ref={dist} args={[1, 1, 0.8, 16]} m={MAT.dark} position={[0, 3.4, 0]} />
      <Torus args={[1.1, 0.12, 8, 24]} m={MAT.steel} position={[0, 3.7, 0]} rotation={[Math.PI / 2, 0, 0]} />
      {ring.map(([x, z], i) =>
        <Cone key={i} args={[0.34, 1.6, 14]} m={{ color: '#d9a441', metalness: 0.4, roughness: 0.5 }} position={[x, 2.4, z]} rotation={[Math.PI, 0, 0]}
          emissive="#d9a441" ei={run ? 0.15 : 0} />)}
    </group>
  )
}

// ───────── Flotation Bank ─────────
export function Flotation({ asset }) {
  const run = useLive(asset.id).state === 'running'; const shafts = useRef([])
  useFrame((_, dt) => { if (run) shafts.current.forEach(s => s && (s.rotation.y += dt * 3)) })
  const x = [-6, -3, 0, 3, 6]
  return (
    <group>
      <Box args={[16, 0.5, 5]} m={MAT.concrete} position={[0, 0.25, 0]} />
      {x.map((cx, i) => (
        <group key={i} position={[cx, 0, 0]}>
          <Cyl args={[1.3, 1.3, 2.6, 22]} m={MAT.steel} position={[0, 1.8, 0]} />
          <Cyl args={[1.25, 1.25, 0.12, 22]} m={SLURRY} position={[0, 3.06, 0]} />
          <Cyl ref={el => (shafts.current[i] = el)} args={[0.14, 0.14, 2.8, 8]} m={MAT.black} position={[0, 2.6, 0]} />
          <Torus args={[1.35, 0.12, 8, 22]} m={MAT.steel} position={[0, 3, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <Riser position={[0, 3.2, 0]} run={run} color={FOAM} r={0.35} h={1.1} />
        </group>
      ))}
      <Box args={[15, 0.4, 0.5]} m={MAT.steel} position={[0, 3, 1.6]} />
      <Cyl args={[0.18, 0.18, 14, 10]} m={{ color: '#a9d3ef', metalness: 0.6, roughness: 0.4 }} position={[0, 3.6, -1.6]} rotation={[0, 0, Math.PI / 2]} />
    </group>
  )
}

// ───────── Thickener ─────────
export function Thickener({ asset }) {
  const run = useLive(asset.id).state === 'running'; const rake = useRef()
  useFrame((_, dt) => { if (run && rake.current) rake.current.rotation.y += dt * 0.4 })
  return (
    <group>
      <Cyl args={[8, 8, 2.6, 40]} m={MAT.paint} position={[0, 1.5, 0]} />
      <Cyl args={[7.8, 7.8, 0.1, 40]} m={MAT.water} position={[0, 2.85, 0]} />
      <Torus args={[8, 0.18, 10, 44]} m={MAT.steel} position={[0, 2.95, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Box args={[16.4, 0.4, 1.2]} m={MAT.paint} position={[0, 3.2, 0]} />
      <Cyl args={[0.6, 0.6, 3.4, 16]} m={MAT.dark} position={[0, 1.7, 0]} />
      <group ref={rake} position={[0, 1.5, 0]}>
        <Box args={[15, 0.2, 0.3]} m={MAT.dark} />
        <Box args={[0.3, 0.2, 15]} m={MAT.dark} />
        <Cyl args={[1.4, 1.4, 1.6, 18]} m={MAT.steel} position={[0, 0.9, 0]} />
      </group>
      <Cyl args={[1, 1, 0.8, 16]} m={MAT.black} position={[0, 3.6, 0]} />
    </group>
  )
}

// ───────── Filter Press ─────────
export function FilterPress({ asset }) {
  const run = useLive(asset.id).state === 'running'; const plates = useRef([]); const pump = useRef()
  useFrame((s, dt) => {
    const sp = run ? (Math.sin(s.clock.elapsedTime * 0.6) * 0.5 + 0.5) : 1   // pack open/close cycle
    plates.current.forEach((p, i) => p && (p.position.x = -1.5 + i * 0.6 * (0.7 + sp * 0.6)))
    if (run && pump.current) pump.current.rotation.y += dt * 3
  })
  return (
    <group>
      <Box args={[0.6, 2.6, 2.4]} m={MAT.paint} position={[-2.6, 1.7, 0]} />
      <Box args={[0.6, 2.6, 2.4]} m={MAT.paint} position={[2.6, 1.7, 0]} />
      <Box args={[5.8, 0.4, 0.6]} m={MAT.dark} position={[0, 3, 0]} />
      <Box args={[5.8, 0.4, 0.6]} m={MAT.dark} position={[0, 0.8, 0]} />
      {Array.from({ length: 6 }).map((_, i) =>
        <Box key={i} ref={el => (plates.current[i] = el)} args={[0.14, 1.8, 2]} m={MAT.steel} position={[-1.5 + i * 0.6, 1.8, 0]} />)}
      <Cyl ref={pump} args={[0.4, 0.4, 0.8, 12]} m={{ color: '#3f7fa8', metalness: 0.7, roughness: 0.3 }} position={[2.9, 0.6, 1.3]} />
      <Box args={[5, 0.8, 1.2]} m={MAT.dark} position={[0, 0.5, 0]} />
    </group>
  )
}

// ───────── Radial Stacker + Stockpile ─────────
export function RadialStacker({ asset }) {
  const live = useLive(asset.id); const run = live.state === 'running'; const rig = useRef()
  useFrame((s) => { if (rig.current) rig.current.rotation.y = (run ? Math.sin(s.clock.elapsedTime * 0.25) * 0.5 : 0.3) })
  const pileH = 2.4 + (live.metrics.stockpile || 13000) / 9000
  return (
    <group>
      <Box args={[5, 0.4, 5]} m={MAT.concrete} position={[0, 0.2, 0]} />
      <Cyl args={[1.6, 1.6, 0.6, 20]} m={MAT.dark} position={[0, 0.7, 0]} />
      <group ref={rig}>
        <Box args={[0.9, 3.2, 0.9]} m={MAT.yellow} position={[0, 2.4, 0]} />
        <Box args={[12, 0.5, 1.4]} m={MAT.yellow} position={[4.5, 4.2, 0]} rotation={[0, 0, -0.18]} />
        <Box args={[11.6, 0.08, 1]} m={MAT.rubber} position={[4.5, 4.05, 0]} rotation={[0, 0, -0.18]} />
        <Cyl args={[0.4, 0.4, 1.2, 12]} m={MAT.steel} position={[10.2, 5.3, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <Cone args={[6, pileH, 28]} m={ORE} position={[12, pileH / 2, 0]} />
      </group>
    </group>
  )
}
