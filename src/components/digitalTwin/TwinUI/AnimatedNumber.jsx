import { useEffect, useState } from 'react'
import { useSpring } from 'framer-motion'

// Smoothly tweens a displayed number toward its target (animated KPI transitions).
export function AnimatedNumber({ value, decimals = 0 }) {
  const sp = useSpring(value, { stiffness: 90, damping: 22, mass: 0.6 })
  const [disp, setDisp] = useState(value)
  useEffect(() => { sp.set(value) }, [value, sp])
  useEffect(() => sp.on('change', v => setDisp(v)), [sp])
  return <>{Number(disp).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>
}
