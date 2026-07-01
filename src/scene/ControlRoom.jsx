import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Box, Cyl, Sphere, MAT } from '../components/digitalTwin/Assets/prims'
import { CONTROL_ROOM } from '../data/assets.config'
import { useUI } from '../data/uiStore'

export function ControlRoom() {
  const beacon = useRef()
  const setControlOpen = useUI(s => s.setControlOpen)
  useFrame((s) => {
    if (beacon.current) { const k = 1 + Math.sin(s.clock.elapsedTime * 3) * 0.3; beacon.current.scale.setScalar(k) }
  })
  return (
    <group position={CONTROL_ROOM.pos}
      onClick={(e) => { e.stopPropagation(); setControlOpen(true) }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}>
      <Box args={[11, 0.4, 8]} m={MAT.concrete} position={[0, 0.2, 0]} />
      <Box args={[10, 4, 8]} m={{ color: '#3a4456', metalness: 0.5, roughness: 0.5 }} position={[0, 2.4, 0]} />
      <Box args={[9, 2, 0.1]} m={MAT.glass} position={[0, 2.6, 4.05]} />
      <Box args={[10.4, 0.4, 8.4]} m={MAT.dark} position={[0, 4.6, 0]} />
      <Box args={[6, 1.5, 0.1]} m={{ color: '#0a2a44', metalness: 0.3, roughness: 0.4 }} position={[0, 2.6, -3.9]} emissive="#2f9fe0" ei={0.7} />
      <Cyl args={[0.07, 0.07, 3.4, 8]} m={MAT.steel} position={[-4, 6.1, -3]} />
      <Sphere ref={beacon} args={[0.22, 12, 12]} m={{ color: '#5a2020', metalness: 0.3, roughness: 0.5 }} position={[-4, 8, -3]} emissive="#38bdf8" ei={1.4} />
      <Html position={[0, 6.2, 0]} center distanceFactor={40} zIndexRange={[30, 0]} pointerEvents="auto">
        <button onClick={() => setControlOpen(true)} className="rounded-lg glass-strong px-3 py-1.5 text-center select-none cursor-pointer" style={{ boxShadow: '0 10px 30px rgba(0,0,0,.5)' }}>
          <div className="text-[12px] font-bold text-white tracking-tight">Mine Control Room</div>
          <div className="text-[8.5px] text-info font-semibold">● Online · click for overview</div>
        </button>
      </Html>
    </group>
  )
}
