import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cyl, Cone, Sphere, Torus, MAT } from '../Assets/prims'
import { useTelemetry } from '../../../data/telemetryStore'

const useLive = (id) => useTelemetry(s => s.live[id])
const ORE = { color: '#5a4733', metalness: 0.1, roughness: 0.95 }
const ORE2 = { color: '#6e5536', metalness: 0.1, roughness: 0.95 }
const DUST = { color: '#cbb893', metalness: 0, roughness: 1 }

// ───────────────────────── Exploration Rig ─────────────────────────
export function Exploration({ asset }) {
  const live = useLive(asset.id); const run = live.state === 'running'
  const rod = useRef()
  useFrame((_, dt) => { if (run && rod.current) rod.current.rotation.y += dt * 3 })
  return (
    <group>
      <Box args={[4.2, 0.6, 2]} m={MAT.yellow} position={[0, 0.6, 0]} />
      <Cyl args={[0.5, 0.5, 0.4, 16]} m={MAT.rubber} position={[-1.2, 0.5, 1]} rotation={[Math.PI / 2, 0, 0]} />
      <Cyl args={[0.5, 0.5, 0.4, 16]} m={MAT.rubber} position={[-1.2, 0.5, -1]} rotation={[Math.PI / 2, 0, 0]} />
      <Box args={[0.4, 5.2, 0.4]} m={MAT.paint} position={[1, 3.3, 0]} />
      <Cyl ref={rod} args={[0.1, 0.1, 4.2, 12]} m={MAT.steel} position={[1, 2.7, 0]} />
      <Box args={[1.6, 0.4, 1]} m={MAT.paint} position={[-1.4, 1.1, 0]} />
      <Cone args={[0.4, 1.6, 4]} m={MAT.dark} position={[-2.6, 0.8, 1.2]} />
    </group>
  )
}

// ───────────────────────── Blasthole Drill ─────────────────────────
export function DrillRig({ asset }) {
  const live = useLive(asset.id); const run = live.state === 'running'
  const head = useRef(), pipe = useRef(), dust = useRef()
  const spd = (live.metrics.rotaryRpm || 95) / 95
  useFrame((s, dt) => {
    if (pipe.current && run) pipe.current.rotation.y += dt * 4 * spd
    if (head.current) head.current.position.y = 5.6 + (run ? Math.sin(s.clock.elapsedTime * 1.4) * 0.35 : 0)
    if (dust.current) {
      const p = run ? ((s.clock.elapsedTime * 0.4) % 1) : 0
      dust.current.position.y = 0.6 + p * 1.6; dust.current.scale.setScalar(0.5 + p * 1.4)
      dust.current.material.opacity = run ? (1 - p) * 0.5 : 0
    }
  })
  return (
    <group>
      <Box args={[5, 0.95, 1.1]} m={MAT.rubber} position={[0, 0.55, -1.5]} />
      <Box args={[5, 0.95, 1.1]} m={MAT.rubber} position={[0, 0.55, 1.5]} />
      <Box args={[4, 1.4, 3]} m={MAT.yellow} position={[-0.2, 1.7, 0]} />
      <Box args={[4.6, 0.35, 3.2]} m={MAT.paint} position={[0, 2.45, 0]} />
      <Box args={[1.5, 1.6, 1.5]} m={MAT.yellow} position={[-1.7, 3.4, 0.9]} />
      <Box args={[1, 1, 0.05]} m={MAT.glass} position={[-1.7, 3.5, 1.66]} />
      <Box args={[1.3, 1.3, 2.8]} m={MAT.dark} position={[-1.9, 2.1, -0.3]} />
      <Box args={[1.8, 1.2, 1.6]} m={MAT.yellow} position={[-0.3, 3.1, -0.7]} />
      {/* mast */}
      <Box args={[0.2, 9.4, 0.2]} m={MAT.paint} position={[1.3, 7, 0.5]} />
      <Box args={[0.2, 9.4, 0.2]} m={MAT.paint} position={[1.3, 7, -0.5]} />
      <Box args={[0.5, 9.4, 0.08]} m={MAT.steel} position={[1.3, 7, 0]} />
      <Box args={[1, 0.5, 1.3]} m={MAT.dark} position={[1.3, 11.6, 0]} />
      <Box ref={head} args={[1.1, 0.8, 1.2]} m={MAT.yellow} position={[1.3, 5.6, 0]} />
      <Cyl ref={pipe} args={[0.16, 0.16, 7, 12]} m={MAT.steel} position={[1.3, 2.2, 0]} />
      <Cone args={[0.3, 0.7, 10]} m={MAT.dark} position={[1.3, -0.4, 0]} rotation={[Math.PI, 0, 0]} />
      <Torus args={[0.42, 0.1, 8, 20]} m={MAT.dark} position={[1.3, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Cone args={[0.95, 0.5, 16]} m={{ color: '#b8a07a', metalness: 0.05, roughness: 0.95 }} position={[1.3, 0.28, 0]} />
      <Sphere ref={dust} args={[0.5, 12, 12]} m={DUST} position={[1.3, 0.8, 0]} transparent opacity={0.4} />
      {/* completed hole pattern */}
      {[[3.6, -1.2], [3.6, 1.2], [5, -1.2], [5, 1.2], [6.4, -1.2], [6.4, 1.2]].map(([x, z], i) => (
        <Cyl key={i} args={[0.2, 0.2, 0.16, 12]} m={MAT.black} position={[x, 0.06, z]} />
      ))}
    </group>
  )
}

// ───────────────────────── Blast Bench ─────────────────────────
export function BlastBench({ asset }) {
  return (
    <group>
      <Box args={[16, 2, 10]} m={MAT.rock} position={[0, 1, 0]} />
      <Box args={[16, 2, 5]} m={{ color: '#7a6a58', metalness: 0.05, roughness: 0.97 }} position={[0, 3, -3]} />
      <Cone args={[4, 3, 16]} m={ORE2} position={[6, 1.5, 4]} />
      {[-6, -2, 2, 6].map((x, i) => (
        <group key={i} position={[x, 4.25, -3]}>
          <Cyl args={[0.12, 0.12, 0.5, 10]} m={MAT.black} />
          <Cone args={[0.35, 0.7, 8]} m={{ color: '#f2b134', metalness: 0.3, roughness: 0.6 }} position={[0, 0.6, 0]} emissive="#f2b134" ei={0.25} />
        </group>
      ))}
      {/* safety barrels / flags */}
      {[[-7, 0, 5.4], [7, 0, 5.4]].map((p, i) => (
        <group key={'b' + i} position={p}>
          <Cyl args={[0.4, 0.4, 1, 12]} m={{ color: '#e0533d', metalness: 0.3, roughness: 0.6 }} position={[0, 0.5, 0]} />
        </group>
      ))}
    </group>
  )
}

// ───────────────────────── Hydraulic Shovel ─────────────────────────
export function Shovel({ asset }) {
  const live = useLive(asset.id); const run = live.state === 'running'
  const house = useRef(), boom = useRef(), stick = useRef(), spill = useRef()
  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (run) {
      if (house.current) house.current.rotation.y = Math.sin(t * 0.4) * 0.5
      if (boom.current) boom.current.rotation.z = 0.5 + Math.sin(t * 0.8) * 0.12
      if (stick.current) stick.current.rotation.z = -0.4 + Math.cos(t * 0.8) * 0.1
      if (spill.current) { const p = (t * 0.9) % 1; spill.current.position.y = 1.0 - p * 0.9; spill.current.visible = p < 0.7 }
    } else if (spill.current) spill.current.visible = false
  })
  return (
    <group>
      <Box args={[6.4, 1.3, 1.7]} m={MAT.rubber} position={[0, 0.75, -2.1]} />
      <Box args={[6.4, 1.3, 1.7]} m={MAT.rubber} position={[0, 0.75, 2.1]} />
      <Box args={[5.2, 1.6, 3.4]} m={MAT.yellow} position={[0, 2.2, 0]} />
      <group ref={house} position={[0, 2.2, 0]}>
        <Box args={[4.2, 2.2, 3.2]} m={MAT.yellow} position={[0.4, 1.4, 0]} />
        <Box args={[1.2, 2, 3.2]} m={MAT.dark} position={[-2.4, 1.1, 0]} />
        <Box args={[1.4, 1.6, 1.4]} m={MAT.yellow} position={[2.2, 1.7, 1.6]} />
        <Box args={[0.05, 1, 1]} m={MAT.glass} position={[2.92, 1.7, 1.6]} />
        <group ref={boom} position={[1.6, 0.8, 0.9]}>
          <Box args={[6.2, 1, 1]} m={MAT.yellow} position={[2.6, 0, 0]} />
          <group ref={stick} position={[5.4, 0, 0]}>
            <Box args={[4.2, 0.8, 0.8]} m={MAT.yellow} position={[1.8, 0, 0]} />
            <Box args={[2.2, 1.9, 2.6]} m={MAT.dark} position={[3.8, -0.6, 0]} />
            <Box args={[2.2, 0.3, 0.25]} m={MAT.steel} position={[4.9, -1.3, 0]} />
            <Box args={[1.9, 0.8, 2.3]} m={ORE} position={[3.8, 0.3, 0]} />
          </group>
        </group>
      </group>
      <Sphere ref={spill} args={[0.45, 10, 10]} m={ORE2} position={[9, 1, 0.9]} />
      <Sphere args={[0.4, 10, 10]} m={ORE} position={[9.6, 0.2, 0.9]} />
    </group>
  )
}

// ───────────────────────── Haul Truck ─────────────────────────
export function HaulTruck({ asset }) {
  const live = useLive(asset.id); const run = live.state === 'running'
  const loaded = (live.metrics.payload || 0) > 50
  const wheels = useRef([]); const body = useRef(); const dust = useRef()
  useFrame((s, dt) => {
    if (run) wheels.current.forEach(w => w && (w.rotation.x += dt * 3))
    if (dust.current) {
      const p = run ? (s.clock.elapsedTime * 0.5) % 1 : 0
      dust.current.position.set(-4 - p * 2, 0.6 + p, 0); dust.current.scale.setScalar(0.4 + p)
      dust.current.material.opacity = run ? (1 - p) * 0.4 : 0
    }
  })
  const wp = [[2.5, 1.7], [2.5, -1.7], [-1.9, 1.75], [-1.9, -1.75], [-2.9, 1.75], [-2.9, -1.75]]
  return (
    <group>
      <group ref={body}>
        <Box args={[7.2, 0.8, 3.4]} m={MAT.dark} position={[0, 1.3, 0]} />
        <Box args={[6.6, 1.9, 3.7]} m={MAT.yellow} position={[0.3, 2.9, 0]} />
        {loaded && <Box args={[6, 0.6, 3.2]} m={ORE} position={[0.3, 3.85, 0]} />}
        <Box args={[1.6, 1.6, 2.4]} m={MAT.yellow} position={[3.5, 2.5, 0]} />
        <Box args={[0.05, 1, 1.6]} m={MAT.glass} position={[4.31, 2.7, 0]} />
        <Box args={[1.1, 1.5, 3]} m={MAT.paint} position={[4.3, 1.7, 0]} />
        <Cyl args={[0.12, 0.12, 1, 8]} m={MAT.dark} position={[3.9, 3, 0.8]} />
        {wp.map(([x, z], i) => (
          <Cyl key={i} ref={el => (wheels.current[i] = el)} args={[0.95, 0.95, 0.6, 16]} m={MAT.rubber}
            position={[x, 0.95, z]} rotation={[Math.PI / 2, 0, 0]} />
        ))}
      </group>
      <Sphere ref={dust} args={[0.5, 10, 10]} m={{ color: '#b9a888', metalness: 0, roughness: 1 }} position={[-4, 0.6, 0]} transparent opacity={0.3} />
    </group>
  )
}
