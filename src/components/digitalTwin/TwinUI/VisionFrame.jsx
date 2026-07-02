// Procedural "computer-vision" camera frame. Given a detection (type/conf/sev/seed)
// it renders a believable belt scene + the anomaly, in three modes:
//   original  → raw camera image
//   overlay   → AI bounding box, label, confidence, scan line, HUD
//   zoom      → magnified crop of the detected object
function rng(seed) {
  let a = (seed >>> 0) || 1
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const sevColor = (s) => (s === 'critical' ? '#f43f5e' : s === 'warning' ? '#fbbf24' : '#38bdf8')
const clk = (ts) => new Date(ts).toLocaleTimeString('en-GB', { hour12: false })

function Anomaly({ type, x, y, w, h, r }) {
  if (type === 'Smoke') return (
    <g opacity="0.85">
      {[0, 1, 2, 3].map(i => <circle key={i} cx={x + i * 4 - 6} cy={y - i * 9} r={9 + i * 4} fill="#c8ced6" opacity={0.22 - i * 0.03} />)}
    </g>
  )
  if (type === 'Material Spillage') return (
    <g>{Array.from({ length: 9 }).map((_, i) => <ellipse key={i} cx={x + (r() - 0.5) * w * 1.4} cy={y + h * 0.4 + (r() - 0.5) * h} rx={3 + r() * 4} ry={2 + r() * 3} fill="#7a5836" />)}</g>
  )
  if (type === 'Belt Misalignment') return (
    <g><path d={`M ${x - 30} ${y} L ${x + 30} ${y - 10}`} stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 3" fill="none" /><path d={`M ${x + 24} ${y - 14} l 8 4 l -8 4`} stroke="#fbbf24" strokeWidth="2" fill="none" /></g>
  )
  if (type === 'Belt Damage') return (
    <path d={`M ${x - w / 2} ${y} l 6 -7 l 5 9 l 7 -8 l 6 10 l 6 -6`} stroke="#f43f5e" strokeWidth="2.2" fill="none" />
  )
  if (type === 'Roller Failure') return (
    <g><rect x={x - w / 2} y={y - 4} width={w} height="8" rx="3" fill="#3a3030" /><circle cx={x} cy={y} r="3" fill="#ff5a1f" /><g stroke="#ffb257" strokeWidth="1.4">{[0, 60, 120, 180, 240, 300].map(a => <line key={a} x1={x} y1={y} x2={x + Math.cos(a * Math.PI / 180) * 10} y2={y + Math.sin(a * Math.PI / 180) * 10} />)}</g></g>
  )
  // Foreign Object
  return <g><rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx="2" fill="#aeb8c4" stroke="#e8edf2" strokeWidth="1" transform={`rotate(24 ${x} ${y})`} /></g>
}

function Scene({ det, zoom }) {
  const r = rng(det.seed)
  // anomaly location seeded within the belt band
  const ax = 90 + r() * 150, ay = 78 + r() * 34
  const ore = Array.from({ length: 14 }).map(() => ({ x: 30 + r() * 270, y: 66 + r() * 54, rx: 3 + r() * 5, ry: 2 + r() * 4 }))
  const belt = (
    <g>
      <polygon points="14,60 306,52 306,150 14,142" fill="#14181f" />
      <polygon points="14,60 306,52 306,64 14,72" fill="#0d1017" />
      <polygon points="14,130 306,138 306,150 14,142" fill="#0d1017" />
      {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M ${30 + i * 48} 74 l 14 26 l -14 26`} stroke="#242a33" strokeWidth="3" fill="none" opacity="0.7" />)}
      {ore.map((o, i) => <ellipse key={i} cx={o.x} cy={o.y} rx={o.rx} ry={o.ry} fill="#5a4733" />)}
      <Anomaly type={det.type} x={ax} y={ay} w={26} h={16} r={r} />
    </g>
  )
  if (zoom) {
    const s = 2.6
    return (
      <g>
        <rect x="0" y="0" width="320" height="180" fill="#0a0e15" />
        <g transform={`translate(${160 - ax * s} ${90 - ay * s}) scale(${s})`}>{belt}</g>
        <g stroke={sevColor(det.sev)} strokeWidth="1" opacity="0.9">
          <line x1="160" y1="30" x2="160" y2="150" strokeDasharray="3 4" /><line x1="60" y1="90" x2="260" y2="90" strokeDasharray="3 4" />
        </g>
        <rect x="112" y="60" width="96" height="60" rx="3" fill="none" stroke={sevColor(det.sev)} strokeWidth="2" />
        <text x="10" y="168" fill="#8aa0b4" fontSize="9" fontFamily="monospace">ZOOM 2.6× · object crop</text>
      </g>
    )
  }
  return { belt, ax, ay }
}

export function VisionFrame({ det, mode = 'overlay' }) {
  if (!det) return null
  const col = sevColor(det.sev)
  if (mode === 'zoom') return (
    <svg viewBox="0 0 320 180" className="w-full rounded-lg" style={{ background: '#0a0e15', display: 'block' }}>
      <Scene det={det} zoom />
    </svg>
  )
  const r = rng(det.seed)
  const ax = 90 + r() * 150, ay = 78 + r() * 34
  const built = Scene({ det })
  return (
    <svg viewBox="0 0 320 180" className="w-full rounded-lg" style={{ background: '#0a0e15', display: 'block' }}>
      {built.belt}
      {/* camera HUD */}
      <text x="10" y="16" fill="#7fd6ff" fontSize="9" fontFamily="monospace">CAM · 1080p · 30fps</text>
      <text x="248" y="16" fill="#8aa0b4" fontSize="9" fontFamily="monospace">{clk(det.ts)}</text>
      {mode === 'overlay' && (
        <>
          <g fill="none" stroke={col} strokeWidth="2">
            <rect x={built.ax - 22} y={built.ay - 18} width="44" height="36" rx="2" opacity="0.95" />
            {/* corner brackets */}
            {[[-22, -18, 1, 1], [22, -18, -1, 1], [-22, 18, 1, -1], [22, 18, -1, -1]].map(([dx, dy, sx, sy], i) => (
              <path key={i} d={`M ${built.ax + dx} ${built.ay + dy + sy * 8} L ${built.ax + dx} ${built.ay + dy} L ${built.ax + dx + sx * 8} ${built.ay + dy}`} strokeWidth="2.5" />
            ))}
          </g>
          <rect x={built.ax - 22} y={built.ay - 31} width={String(det.type).length * 5.4 + 34} height="12" rx="2" fill={col} />
          <text x={built.ax - 18} y={built.ay - 22} fill="#0a0e15" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">{det.type} {det.conf}%</text>
          {/* scan line */}
          <rect x="14" width="292" height="2" fill="#38bdf8" opacity="0.5">
            <animate attributeName="y" values="58;150;58" dur="2.4s" repeatCount="indefinite" />
          </rect>
          <text x="10" y="168" fill={col} fontSize="9" fontFamily="monospace">● AI DETECTION · conf {det.conf}%</text>
          <circle cx="298" cy="166" r="4" fill="#f43f5e"><animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" /></circle>
          <text x="270" y="169" fill="#f43f5e" fontSize="8.5" fontFamily="monospace">REC</text>
        </>
      )}
      {mode === 'original' && <text x="10" y="168" fill="#6b7d8f" fontSize="9" fontFamily="monospace">RAW FEED · no overlay</text>}
    </svg>
  )
}
