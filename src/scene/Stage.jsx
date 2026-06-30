import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, ContactShadows, AdaptiveDpr, BakeShadows } from '@react-three/drei'
import { PostFX } from './PostFX'
import { Terrain } from './Terrain'
import { ControlRoom } from './ControlRoom'
import { AssetNode } from '../components/digitalTwin/AssetNode'
import { EQUIPMENT, CARD_HEIGHT } from '../components/digitalTwin/registry'
import { TelemetryLines } from '../components/digitalTwin/TwinUI/TelemetryLines'
import { MaterialFlow } from '../components/digitalTwin/TwinUI/MaterialFlow'
import { ASSETS } from '../data/assets.config'

export function Stage() {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 1.6]}
      camera={{ position: [-36, 40, 78], fov: 42, near: 0.5, far: 600 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#070b12']} />
      <fog attach="fog" args={['#070b12', 120, 360]} />

      <ambientLight intensity={0.55} color="#cfe0f2" />
      <directionalLight position={[40, 60, 30]} intensity={2.4} color="#fff3e6" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-110} shadow-camera-right={110}
        shadow-camera-top={70} shadow-camera-bottom={-70} shadow-camera-far={260} shadow-bias={-0.0004} />
      <directionalLight position={[-50, 30, -20]} intensity={0.5} color="#9cc4ff" />

      <Suspense fallback={null}>
        <Environment preset="warehouse" />
      </Suspense>

      <Terrain />
      <ContactShadows position={[0, 0.04, 0]} opacity={0.45} scale={260} blur={2.4} far={40} resolution={1024} color="#000000" />

      <ControlRoom />
      <MaterialFlow />
      <TelemetryLines />

      {ASSETS.map(asset => {
        const Comp = EQUIPMENT[asset.type]
        if (!Comp) return null
        return (
          <AssetNode key={asset.id} asset={asset} cardHeight={CARD_HEIGHT[asset.type] || 6}>
            <Comp asset={asset} />
          </AssetNode>
        )
      })}

      <OrbitControls
        target={[6, 2, 0]} makeDefault
        minDistance={12} maxDistance={260} maxPolarAngle={Math.PI / 2.08}
        enableDamping dampingFactor={0.1} rotateSpeed={0.9} zoomSpeed={1.3} panSpeed={1.1} zoomToCursor />

      <AdaptiveDpr pixelated />
      <PostFX />
    </Canvas>
  )
}
