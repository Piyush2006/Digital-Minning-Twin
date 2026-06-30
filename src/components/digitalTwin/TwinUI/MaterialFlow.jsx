import { useRef, useMemo, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { FLOW, MEDIUM_COLOR, ASSET_BY_ID } from '../../../data/assets.config'

const DOTS = 9               // particles per segment
const dummy = new THREE.Object3D()

// One InstancedMesh carries every flow particle across all process segments —
// colour-coded by medium (ore/concentrate/water/tailings), continuously moving.
export function MaterialFlow() {
  const ref = useRef()
  const { curves, phases, colorList, total } = useMemo(() => {
    const curves = [], phases = [], colorList = []
    for (const [from, to, medium] of FLOW) {
      const a = ASSET_BY_ID[from], b = ASSET_BY_ID[to]
      if (!a || !b) continue
      const p0 = new THREE.Vector3(a.pos[0], 1.6, a.pos[2])
      const p1 = new THREE.Vector3(b.pos[0], 1.6, b.pos[2])
      const mid = p0.clone().lerp(p1, 0.5); mid.y += 2.4
      const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1)
      const col = new THREE.Color(MEDIUM_COLOR[medium] || '#b07a3c')
      for (let i = 0; i < DOTS; i++) { curves.push(curve); phases.push(i / DOTS); colorList.push(col) }
    }
    return { curves, phases, colorList, total: curves.length }
  }, [])

  useLayoutEffect(() => {
    if (!ref.current) return
    colorList.forEach((c, i) => ref.current.setColorAt(i, c))
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [colorList])

  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime * 0.12
    for (let i = 0; i < total; i++) {
      const p = curves[i].getPointAt((t + phases[i]) % 1)
      dummy.position.copy(p); dummy.scale.setScalar(0.7); dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, total]}>
      <sphereGeometry args={[0.34, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}
