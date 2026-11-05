import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { reduced } from './lib'

const C = '#F20D42'
export const FACES = {
  happy: { p: 'M128 212q16-26 32 0M240 212q16-26 32 0M170 258q30 30 60 0', d: [] },
  curious: { p: 'M188 270h24M236 178q16-10 36-2', d: [[145, 214, 8], [255, 214, 17]] },
  sleepy: { p: 'M128 216q16 12 32 0M240 216q16 12 32 0M188 268q12 9 24 0', d: [] },
  concerned: { p: 'M122 186l38-10M278 186l-38-10M174 278q26-20 52 0', d: [[145, 216, 8], [255, 216, 8]] },
  excited: { p: 'M166 256q34 52 68 0z', d: [[145, 212, 15], [255, 212, 15]] },
}
export const MOODS = Object.keys(FACES)

export default function Spirit({ mood = 'happy' }) {
  const f = FACES[mood], g = useRef(), first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (reduced()) return
    const a = animate(g.current, { scale: [.8, 1], opacity: [.3, 1], duration: 700, ease: 'outExpo' })
    return () => a.revert()
  }, [mood])
  return (
    <svg viewBox="0 0 400 520" role="img" aria-label={`SHIZU plant companion, ${mood}`}>
      <path d="M72 215C72 140 120 128 200 128s128 12 128 87c0 150-50 275-128 275S72 365 72 215z" fill="#EDE6D8" />
      <ellipse cx="200" cy="134" rx="112" ry="16" fill="#101B17" />
      <path d="M300 55Q290 110 205 135" fill="none" stroke="#78876A" strokeWidth="3" />
      <path d="M200 135C196 70 150 40 110 28c4 52 40 92 90 107z" fill="#78876A" />
      <path d="M205 135c8-60 50-98 96-108-2 54-34 96-96 108z" fill="#5e6d52" />
      <path d="M200 135c-2-40 4-78 14-112 14 36 8 78-14 112z" fill="#8c9c7c" />
      <g fill={C}><circle cx="300" cy="22" r="10" /><circle cx="318" cy="38" r="10" /><circle cx="310" cy="58" r="10" /><circle cx="290" cy="58" r="10" /><circle cx="282" cy="38" r="10" /></g>
      <circle cx="300" cy="40" r="7" fill="#EDE6D8" />
      <path d="M150 134v24M255 134v-18" stroke="#080A0B" strokeWidth="4" strokeLinecap="round" />
      <circle cx="200" cy="245" r="116" fill="none" stroke={C} strokeWidth="1.5" strokeDasharray="3 9" />
      <circle cx="200" cy="245" r="96" fill="#080A0B" stroke="#78876A" strokeWidth="3" />
      <rect x="82" y="300" width="16" height="30" rx="8" fill="#101B17" />
      <path d="M304 300h16M304 310h16M304 320h16" stroke="#101B17" strokeWidth="3" strokeLinecap="round" />
      <g ref={g} style={{ transformOrigin: '200px 245px' }} stroke={C} strokeWidth="7" strokeLinecap="round" fill="none">
        <path d={f.p} fill={mood === 'excited' ? C : 'none'} />
        {f.d.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={C} stroke="none" />)}
      </g>
      <text x="200" y="450" textAnchor="middle" fontFamily="JetBrains Mono,monospace" fontSize="11" letterSpacing="3" fill="#080A0B">静 SHIZU-01</text>
    </svg>
  )
}
