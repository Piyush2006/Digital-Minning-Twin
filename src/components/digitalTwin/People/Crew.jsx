import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Worker } from './Worker'
import { WORKERS } from '../../../data/assets.config'
import { useAI } from '../../../data/aiStore'

// Patrolling worker eases between two points facing travel; stationary worker
// stands and "works". Tracked workers carry a live PPE/zone safety badge.
function Crewman({ w, i }) {
  const g = useRef()
  const a = useMemo(() => (w.path ? new THREE.Vector3(...w.path[0]) : new THREE.Vector3(...w.pos)), [w])
  const b = useMemo(() => (w.path ? new THREE.Vector3(...w.path[1]) : a), [w, a])
  const ppe = useAI(s => (w.track ? (s.workers.find(x => x.id === w.id)?.ppe ?? true) : true))
  useFrame((s) => {
    if (!g.current || !w.path) return
    const ph = s.clock.elapsedTime * (w.speed || 0.22) + i
    const p = a.clone().lerp(b, Math.sin(ph) * 0.5 + 0.5)
    g.current.position.set(p.x, 0, p.z)
    const fwd = Math.cos(ph) >= 0 ? b.clone().sub(a) : a.clone().sub(b)
    g.current.rotation.y = Math.atan2(fwd.x, fwd.z)
  })
  return (
    <group ref={g} position={w.path ? w.path[0] : w.pos} rotation={[0, w.rot || 0, 0]}>
      <Worker vest={w.vest} hat={w.hat} walking={!!w.path} phase={i * 1.7} pace={w.path ? 6.5 : 3} />
      {w.track && (
        <Html position={[0, w.badgeY || 2.2, 0]} center distanceFactor={26} zIndexRange={[28, 0]} pointerEvents="none" wrapperClass="dt-card">
          <div className="rounded-md px-2 py-1 glass select-none whitespace-nowrap text-[10px]"
            style={{ border: ppe ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(244,63,94,0.6)', boxShadow: ppe ? 'none' : '0 0 14px rgba(244,63,94,0.5)' }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: ppe ? '#34d399' : '#f43f5e', boxShadow: `0 0 8px ${ppe ? '#34d399' : '#f43f5e'}` }} />
              <span className="font-semibold text-white/90">{w.name}</span>
            </div>
            <div className="text-[8.5px] text-white/45 mt-0.5">{w.zone} · PPE {ppe ? 'OK' : 'MISSING'}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

export function Crew() {
  return <group>{WORKERS.map((w, i) => <Crewman key={i} w={w} i={i} />)}</group>
}
