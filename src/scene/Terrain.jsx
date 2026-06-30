import { useMemo } from 'react'
import * as THREE from 'three'
import { Grid } from '@react-three/drei'
import { HAUL_ROAD } from '../data/assets.config'

const EARTH = ['#9c8a6f', '#8c7a60', '#7c6b52', '#6c5c46', '#5d4e3b']

// Terraced open-pit backdrop (stepped benches) at the upstream corner.
function Pit({ center = [-72, 0, 20] }) {
  return (
    <group position={center}>
      {EARTH.map((c, i) => (
        <mesh key={i} position={[0, i * 1.5 + 0.75, i * 1.6]} receiveShadow castShadow>
          <cylinderGeometry args={[20 - i * 3.1, 20 - i * 3.1, 1.5, 40]} />
          <meshStandardMaterial color={c} roughness={0.97} metalness={0.03} />
        </mesh>
      ))}
      {/* loose ore piles on the benches */}
      {[[6, 1.7, 2], [-7, 3.2, 4], [3, 4.8, 6]].map((p, i) => (
        <mesh key={'p' + i} position={p} castShadow><coneGeometry args={[2.2 - i * 0.3, 1.8, 16]} />
          <meshStandardMaterial color="#6e5536" roughness={0.98} /></mesh>
      ))}
    </group>
  )
}

function Road() {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(HAUL_ROAD.map(p => new THREE.Vector3(...p))), [])
  return (
    <mesh position={[0, 0.06, 0]} scale={[1, 0.03, 1]} receiveShadow>
      <tubeGeometry args={[curve, 90, 2.1, 10]} />
      <meshStandardMaterial color="#2a2e36" roughness={0.95} metalness={0.05} />
    </mesh>
  )
}

const Pad = ({ pos, size }) => (
  <mesh position={pos} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={size} /><meshStandardMaterial color="#3a3f48" roughness={0.9} metalness={0.1} />
  </mesh>
)

export function Terrain() {
  return (
    <group>
      {/* shadow-catching ground + premium tech grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[420, 220]} /><meshStandardMaterial color="#0c1119" roughness={1} metalness={0} />
      </mesh>
      <Grid
        position={[0, 0, 0]} args={[420, 220]} infiniteGrid
        cellSize={2} cellThickness={0.6} cellColor="#1d2632"
        sectionSize={10} sectionThickness={1.1} sectionColor="#2f4661"
        fadeDistance={240} fadeStrength={1.5} followCamera={false}
      />
      <Pit />
      <Road />
      <Pad pos={[-2, 0.02, 0]} size={[78, 30]} />
      <Pad pos={[66, 0.02, 2]} size={[44, 26]} />
      {/* harbour water near the ship */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[90, 0.04, -14]} receiveShadow>
        <planeGeometry args={[46, 30]} />
        <meshStandardMaterial color="#13486f" roughness={0.2} metalness={0.4} transparent opacity={0.92} />
      </mesh>
    </group>
  )
}
