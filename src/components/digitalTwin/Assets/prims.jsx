import { forwardRef } from 'react'

// Reusable PBR material palette (premium industrial look).
export const MAT = {
  steel:    { color: '#b3bdc9', metalness: 0.85, roughness: 0.28 },
  paint:    { color: '#8a929b', metalness: 0.55, roughness: 0.42 },
  dark:     { color: '#454b54', metalness: 0.6,  roughness: 0.5 },
  black:    { color: '#22262c', metalness: 0.5,  roughness: 0.6 },
  yellow:   { color: '#f2b134', metalness: 0.4,  roughness: 0.5 },
  yellowDk: { color: '#caa233', metalness: 0.4,  roughness: 0.5 },
  rubber:   { color: '#15181d', metalness: 0.2,  roughness: 0.85 },
  concrete: { color: '#9aa1a9', metalness: 0.04, roughness: 0.95 },
  copper:   { color: '#c0772f', metalness: 0.9,  roughness: 0.35 },
  ore:      { color: '#7a5836', metalness: 0.1,  roughness: 0.95 },
  oreLite:  { color: '#8c6942', metalness: 0.1,  roughness: 0.95 },
  rock:     { color: '#8a7a62', metalness: 0.05, roughness: 0.95 },
  water:    { color: '#1f5f9e', metalness: 0.25, roughness: 0.25 },
  glass:    { color: '#bcd6e6', metalness: 0.1,  roughness: 0.08 },
  red:      { color: '#9c4a3c', metalness: 0.3,  roughness: 0.6 },
  white:    { color: '#e2e6ec', metalness: 0.2,  roughness: 0.5 },
}

const Std = ({ m = MAT.steel, emissive, ei = 0, opacity, transparent }) => (
  <meshStandardMaterial
    color={m.color} metalness={m.metalness} roughness={m.roughness}
    emissive={emissive || '#000000'} emissiveIntensity={ei}
    transparent={transparent} opacity={opacity ?? 1}
  />
)

export const Box = forwardRef(({ args = [1, 1, 1], m, emissive, ei, opacity, transparent, children, ...p }, ref) => (
  <mesh ref={ref} castShadow receiveShadow {...p}>
    <boxGeometry args={args} /><Std m={m} emissive={emissive} ei={ei} opacity={opacity} transparent={transparent} />{children}
  </mesh>
))
export const Cyl = forwardRef(({ args = [0.5, 0.5, 1, 24], m, emissive, ei, opacity, transparent, children, ...p }, ref) => (
  <mesh ref={ref} castShadow receiveShadow {...p}>
    <cylinderGeometry args={args} /><Std m={m} emissive={emissive} ei={ei} opacity={opacity} transparent={transparent} />{children}
  </mesh>
))
export const Cone = forwardRef(({ args = [0.5, 1, 24], m, emissive, ei, ...p }, ref) => (
  <mesh ref={ref} castShadow receiveShadow {...p}>
    <coneGeometry args={args} /><Std m={m} emissive={emissive} ei={ei} />
  </mesh>
))
export const Sphere = forwardRef(({ args = [0.5, 20, 20], m, emissive, ei, opacity, transparent, ...p }, ref) => (
  <mesh ref={ref} castShadow receiveShadow {...p}>
    <sphereGeometry args={args} /><Std m={m} emissive={emissive} ei={ei} opacity={opacity} transparent={transparent} />
  </mesh>
))
export const Torus = forwardRef(({ args = [0.6, 0.12, 12, 32], m, emissive, ei, ...p }, ref) => (
  <mesh ref={ref} castShadow receiveShadow {...p}>
    <torusGeometry args={args} /><Std m={m} emissive={emissive} ei={ei} />
  </mesh>
))
