import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Box, Cyl, Sphere, Torus } from '../Assets/prims'
import { useTelemetry } from '../../../data/telemetryStore'
import { useAI } from '../../../data/aiStore'
import { useUI } from '../../../data/uiStore'
import { ASSET_BY_ID, CONVEYORS } from '../../../data/assets.config'

const HOUSE = { color: '#e6ebf1', metalness: 0.4, roughness: 0.4 }
const POLE = { color: '#5b626b', metalness: 0.6, roughness: 0.5 }

const ST = {
  online:     { c: '#34d399', t: 'Online' },
  processing: { c: '#fbbf24', t: 'AI Processing' },
  recording:  { c: '#f43f5e', t: 'Recording' },
  offline:    { c: '#6b7280', t: 'Offline' },
}

function Cam({ cfg }) {
  const a = ASSET_BY_ID[cfg.from].pos, b = ASSET_BY_ID[cfg.to].pos
  const { head, yaw } = useMemo(() => {
    const px = a[0] + (b[0] - a[0]) * 0.72, pz = a[2] + (b[2] - a[2]) * 0.72
    const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1
    const perp = [-dz / L, dx / L]
    const hx = px + perp[0] * 3.2, hz = pz + perp[1] * 3.2, hy = 5
    const mx = (a[0] + b[0]) / 2, mz = (a[2] + b[2]) / 2
    return { head: [hx, hy, hz], yaw: Math.atan2(-(mz - hz), (mx - hx)) }
  }, [a, b])

  const conv = useAI(s => s.conveyors.find(c => c.id === cfg.id))
  const camStatus = conv?.camStatus || 'online'
  const det = conv?.detection
  const st = ST[camStatus] || ST.online
  const [hover, setHover] = useState(false)
  const setEvidence = useUI(s => s.setEvidence)
  const setFocus = useUI(s => s.setFocus)
  const setSelected = useTelemetry(s => s.setSelected)
  const light = useRef(), glow = useRef()

  useFrame((s) => {
    if (light.current) light.current.material.emissiveIntensity = det || camStatus === 'recording' ? 1.2 + Math.sin(s.clock.elapsedTime * 6) * 0.7 : 1
    if (glow.current) glow.current.material.opacity = hover ? 0.55 + Math.sin(s.clock.elapsedTime * 5) * 0.2 : 0
  })

  const open = (e) => { e.stopPropagation(); setSelected(null); setEvidence(cfg.id) }

  return (
    <group>
      <Cyl args={[0.08, 0.1, head[1], 10]} m={POLE} position={[head[0], head[1] / 2, head[2]]} />
      <group position={head} rotation={[0, yaw, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto' }}
        onClick={open}
        onDoubleClick={(e) => { e.stopPropagation(); setFocus(cfg.id) }}>
        <Box args={[0.5, 0.4, 0.72]} m={HOUSE} emissive={hover ? '#38bdf8' : '#000000'} ei={hover ? 0.4 : 0} />
        <Cyl args={[0.14, 0.16, 0.34, 14]} m={{ color: '#22262c', metalness: 0.5, roughness: 0.4 }} position={[0.46, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
        <Sphere args={[0.05, 10, 10]} m={{ color: '#0a0e15' }} position={[0.63, 0, 0]} />
        <Sphere ref={light} args={[0.06, 10, 10]} m={{ color: st.c }} position={[-0.18, 0.24, 0.2]} emissive={st.c} ei={1} />
        <Torus ref={glow} args={[0.55, 0.05, 8, 24]} m={{ color: '#38bdf8' }} position={[0.2, 0, 0]} rotation={[0, Math.PI / 2, 0]} emissive="#38bdf8" ei={1.5} transparent opacity={0} />
      </group>
      <Html position={[head[0], head[1] + 0.7, head[2]]} center distanceFactor={30} zIndexRange={[26, 0]} pointerEvents="none" wrapperClass="dt-card">
        <div className="rounded-md px-2 py-1 glass select-none whitespace-nowrap" style={{ border: `1px solid ${st.c}55`, boxShadow: det ? `0 0 12px ${st.c}66` : 'none' }}>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.c, boxShadow: `0 0 6px ${st.c}` }} />
            <span className="font-bold text-white/90">{cfg.camId}</span>
            <span className="text-white/40">·</span>
            <span style={{ color: st.c }} className="font-semibold">{st.t}</span>
          </div>
        </div>
      </Html>
    </group>
  )
}

export function AICameras() {
  return <group>{CONVEYORS.map(cfg => <Cam key={cfg.id} cfg={cfg} />)}</group>
}
