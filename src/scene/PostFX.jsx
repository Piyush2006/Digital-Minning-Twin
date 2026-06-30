import { EffectComposer, Bloom, SMAA, Vignette } from '@react-three/postprocessing'

// Premium grade: subtle bloom on emissives (beacons, screens, furnace glow),
// gentle vignette, SMAA edge AA. MSAA 4x keeps thin steelwork crisp.
export function PostFX() {
  return (
    <EffectComposer multisampling={4} disableNormalPass>
      <Bloom luminanceThreshold={0.85} luminanceSmoothing={0.25} intensity={0.7} mipmapBlur />
      <Vignette eskil={false} offset={0.28} darkness={0.62} />
      <SMAA />
    </EffectComposer>
  )
}
