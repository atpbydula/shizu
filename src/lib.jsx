import { Fragment, useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches
export const fine = () => matchMedia('(pointer:fine)').matches

// Runs cb once when ref enters the viewport; cb may return {revert}.
export function useInView(ref, cb, th = 0.15) {
  useEffect(() => {
    const el = ref.current; if (!el) return
    let out
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); out = cb(el) } }, { threshold: th })
    io.observe(el)
    return () => { io.disconnect(); out && out.revert && out.revert() }
  }, [])
}

const FROM = { up: { translateY: [60, 0] }, left: { translateX: [-90, 0] }, right: { translateX: [90, 0] }, zoom: { scale: [1.6, 1] } }
export function useReveal() {
  const ref = useRef()
  useInView(ref, el => {
    if (reduced()) return
    const as = Object.entries(FROM).map(([k, v]) => {
      const t = el.querySelectorAll(`[data-rv=${k}]`)
      return t.length && animate(t, { opacity: [0, 1], ...v, duration: 1400, delay: stagger(110), ease: 'outExpo' })
    })
    const c = el.querySelectorAll('[data-ch]')
    if (c.length) as.push(animate(c, { opacity: [0, 1], translateY: [24, 0], duration: 900, delay: stagger(9), ease: 'outQuart' }))
    return { revert: () => as.forEach(a => a && a.revert()) }
  })
  return ref
}

export function useFloat(ref) {
  useEffect(() => {
    if (reduced() || !ref.current) return
    const a = animate(ref.current.querySelectorAll('[data-float]'), { translateY: [-12, 12], rotate: [-2.5, 2.5], duration: 4200, delay: stagger(500), alternate: true, loop: true, ease: 'inOutSine' })
    return () => a.revert()
  }, [])
}

export function useMagnetic() {
  const r = useRef()
  useEffect(() => {
    const el = r.current
    if (!el || reduced() || !fine()) return
    const mv = e => { const b = el.getBoundingClientRect(); animate(el, { translateX: (e.clientX - b.left - b.width / 2) * .3, translateY: (e.clientY - b.top - b.height / 2) * .3, duration: 400, ease: 'outQuad' }) }
    const lv = () => animate(el, { translateX: 0, translateY: 0, duration: 800, ease: 'outElastic(1,.6)' })
    el.addEventListener('pointermove', mv); el.addEventListener('pointerleave', lv)
    return () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv) }
  }, [])
  return r
}

export const Chars = ({ text, className }) => (
  <span className={className} aria-label={text}>
    {text.split(' ').map((w, i) => <Fragment key={i}><span className="w" aria-hidden="true">{[...w].map((c, j) => <span key={j} data-ch>{c}</span>)}</span>{' '}</Fragment>)}
  </span>
)

export function Fern({ className, flip, n = 11, ...p }) {
  return (
    <svg className={className} viewBox="0 0 200 400" aria-hidden="true" {...p}>
      <g transform={flip ? 'translate(200 0) scale(-1 1)' : undefined} fill="#78876A">
        <path d="M100 400Q92 200 100 20" fill="none" stroke="#78876A" strokeWidth="2" />
        {Array.from({ length: n * 2 }, (_, k) => {
          const i = k >> 1, s = k % 2 ? 1 : -1, t = i / n, x = 100 - 16 * t * (1 - t), y = 385 - t * 350, rx = 34 * (1 - t * .65)
          return <ellipse key={k} cx={x + s * rx * .9} cy={y} rx={rx} ry={rx * .2} transform={`rotate(${s * -28} ${x} ${y})`} opacity={.9 - t * .4} />
        })}
      </g>
    </svg>
  )
}
