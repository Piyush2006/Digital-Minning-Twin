import { useRef } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { useUI } from '../../../data/uiStore'
import { ASSET_BY_ID, CONVEYORS } from '../../../data/assets.config'

// Double-clicking a camera sets uiStore.focus → smoothly fly the orbit camera to
// frame the monitored conveyor, then clear focus.
export function CameraFocus() {
  const focus = useUI(s => s.focus)
  const setFocus = useUI(s => s.setFocus)
  const { camera, controls } = useThree()
  const goal = useRef(null)

  useFrame(() => {
    if (focus && (!goal.current || goal.current.id !== focus)) {
      const cfg = CONVEYORS.find(c => c.id === focus)
      if (!cfg) { setFocus(null); return }
      const a = ASSET_BY_ID[cfg.from].pos, b = ASSET_BY_ID[cfg.to].pos
      const tgt = new THREE.Vector3((a[0] + b[0]) / 2, 3, (a[2] + b[2]) / 2)
      goal.current = { id: focus, tgt, cam: tgt.clone().add(new THREE.Vector3(-14, 15, 22)) }
    }
    if (goal.current && controls) {
      camera.position.lerp(goal.current.cam, 0.09)
      controls.target.lerp(goal.current.tgt, 0.09)
      controls.update()
      if (camera.position.distanceTo(goal.current.cam) < 1) { goal.current = null; setFocus(null) }
    }
  })
  return null
}
