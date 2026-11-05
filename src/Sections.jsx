import { useEffect, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'
import { Send } from 'lucide-react'
import Spirit, { MOODS } from './Spirit'
import { Chars, reduced, useInView, useReveal, useMagnetic } from './lib'

const HS = [
  { t: 'Soil moisture', x: 36, y: 26, d: 'Reads moisture at root level, so watering reminders come from the soil itself.' },
  { t: 'Bioelectrical signal (experimental)', x: 64, y: 26, d: 'Experimental monitoring of the plant’s electrical signal patterns, to explore whether they say more about plant conditions. It does not read emotions, pain or thoughts.' },
  { t: 'Companion display', x: 50, y: 47, d: 'A small expressive face that shows how SHIZU is doing with the plant’s current conditions.' },
  { t: 'Light intensity', x: 22, y: 60, d: 'Measures how much light reaches the plant through the day.' },
  { t: 'Temperature & humidity', x: 78, y: 60, d: 'Tracks the air around the plant and builds a record of its surroundings.' },
  { t: 'ESP32 hardware', x: 50, y: 78, d: 'An ESP32-based board gathers sensor readings and connects SHIZU to the cloud.' },
]
export function Meet() {
  const r = useReveal(), p = useRef(), [i, setI] = useState(2)
  useEffect(() => {
    if (reduced()) return
    const a = animate(p.current, { opacity: [0, 1], translateY: [16, 0], duration: 700, ease: 'outExpo' })
    const b = animate('.hs.on i', { scale: [1, 2.6], opacity: [.9, 0], duration: 1500, loop: true, ease: 'outQuad' })
    return () => { a.revert(); b.revert() }
  }, [i])
  return (
    <section id="meet" className="meet" data-bg="#080A0B" ref={r}>
      <h2 className="big" data-rv="left">Meet<br />SHIZU</h2>
      <div className="m-grid">
        <div className="m-stage" data-rv="zoom">
          <div className="m-k jp" aria-hidden="true">静</div>
          <div className="m-box"><Spirit />
            {HS.map((h, n) => <button key={h.t} className={'hs' + (n === i ? ' on' : '')} style={{ left: h.x + '%', top: h.y + '%' }} onMouseEnter={() => setI(n)} onFocus={() => setI(n)} onClick={() => setI(n)} aria-label={h.t}><i /></button>)}
          </div>
        </div>
        <div className="m-info" data-rv="right">
          <span className="mono">{String(i + 1).padStart(2, '0')} / 06</span>
          <div ref={p} aria-live="polite"><h3>{HS[i].t}</h3><p>{HS[i].d}</p></div>
          <ul>{HS.map((h, n) => <li key={h.t}><button className={n === i ? 'on' : ''} onClick={() => setI(n)}>{h.t}</button></li>)}</ul>
        </div>
      </div>
    </section>
  )
}

const CAPS = [
  ['Sensing', 'SHIZU observes its environment through connected sensors, monitoring soil moisture, temperature, humidity and light intensity.'],
  ['Listening', 'Experimental plant bioelectrical monitoring explores whether electrical signal patterns can provide additional information about plant conditions. It does not detect emotions, pain or thoughts.'],
  ['Understanding', 'Cloud-based intelligence processes environmental readings, maintains historical records and generates contextual plant-care reminders.'],
  ['Remembering', 'SHIZU records care activities, milestones and interactions, creating a personalised growth journal.'],
]
const LISTS = {
  2: ['> read     soil · temperature · humidity · light', '> compare  against recent history', '> remind   “The soil is drying. Check on me soon.”'],
  3: ['Watered', 'New growth noticed', 'You said hello'],
}
const WAVE = Array.from({ length: 60 }, (_, k) => `${k * 10},${50 + Math.sin(k * .7) * 14 * Math.sin(k * .13) + Math.sin(k * 2.1) * 6}`).join(' ')
function Viz({ n }) {
  const r = useRef()
  useInView(r, el => {
    if (reduced()) return
    const as = []
    if (n === 0) el.querySelectorAll('i').forEach(i => as.push(animate(i, { width: ['0%', i.dataset.w + '%'], duration: 1800, ease: 'outExpo' })))
    if (n === 1) as.push(animate(el.querySelector('polyline'), { strokeDashoffset: [1, 0], duration: 3200, ease: 'inOutSine' }))
    if (n > 1) as.push(animate(el.querySelectorAll('li'), { opacity: [0, 1], translateX: [-24, 0], delay: stagger(500), duration: 900, ease: 'outExpo' }))
    return { revert: () => as.forEach(a => a.revert()) }
  }, .4)
  return (
    <div ref={r} className="viz">
      {n === 0 && <><div className="v-bars">{[['Soil moisture', 62], ['Temperature', 48], ['Humidity', 71], ['Light', 35]].map(([l, v]) => <div key={l}><span className="mono">{l}</span><b><i data-w={v} style={{ width: v + '%' }} /></b></div>)}</div><p className="mono">Illustrative values</p></>}
      {n === 1 && <><svg viewBox="0 0 600 100" className="v-wave" role="img" aria-label="Illustrative signal trace"><polyline pathLength="1" points={WAVE} /></svg><p className="mono">Simulated trace · experimental</p></>}
      {n > 1 && <ul className={'v-log' + (n === 3 ? ' jr' : '')}>{LISTS[n].map(l => <li key={l}>{l}</li>)}</ul>}
    </div>
  )
}
function Row({ n, t, d }) {
  const r = useReveal()
  return (
    <article className={'cap' + (n % 2 ? ' alt' : '')} ref={r}>
      <div className="cap-n" data-rv="zoom" aria-hidden="true">0{n + 1}</div>
      <div><h3 data-rv="left">{t}</h3><p data-rv="up">{d}</p></div>
      <div data-rv="right"><Viz n={n} /></div>
    </article>
  )
}
export function Caps() {
  const h = useReveal()
  return (
    <section id="beyond" data-bg="#0c1210">
      <header ref={h}><p className="mono" data-rv="up">Four ways SHIZU pays attention</p><h2 className="big"><Chars text="Beyond what you see" /></h2></header>
      {CAPS.map(([t, d], n) => <Row key={t} n={n} t={t} d={d} />)}
    </section>
  )
}

const MD = {
  happy: 'Conditions feel settled. SHIZU rests easy and glows softly.',
  curious: 'Something changed. SHIZU leans toward it and watches quietly.',
  sleepy: 'Low light and a late hour. SHIZU slows down and waits for morning.',
  concerned: 'A reading drifted from its usual range. SHIZU asks you to take a look.',
  excited: 'Something good happened, like new growth or a fresh milestone.',
}
const ROT = { happy: 0, curious: 5, sleepy: -3, concerned: -5, excited: 3 }
export function Companion() {
  const [m, setM] = useState('happy'), r = useReveal(), s = useRef()
  useEffect(() => {
    if (reduced()) return
    const a = animate(s.current, { rotate: ROT[m], translateY: m === 'excited' ? [0, -14, 0] : 0, duration: 1000, ease: 'outExpo' })
    const b = animate('.cm-d', { opacity: [0, 1], translateY: [10, 0], duration: 700, ease: 'outExpo' })
    return () => { a.revert(); b.revert() }
  }, [m])
  return (
    <section id="companion" data-bg="#080A0B" ref={r}>
      <div className="comp-g">
        <div className="cm-s" data-rv="zoom"><div ref={s} style={{ height: '100%' }}><Spirit mood={m} /></div></div>
        <div data-rv="right">
          <h2 className="mono">A living companion</h2>
          <div className="moods" role="radiogroup" aria-label="SHIZU expression">
            {MOODS.map((k, n) => <button key={k} role="radio" aria-checked={m === k} onClick={() => setM(k)}>{k}<span>0{n + 1}</span></button>)}
          </div>
          <p className="cm-d" aria-live="polite">{MD[m]}</p>
        </div>
      </div>
    </section>
  )
}

export function Wishlist() {
  const r = useReveal(), btn = useMagnetic(), t0 = useRef(Date.now())
  const [st, setSt] = useState('idle'), [msg, setMsg] = useState(''), [who, setWho] = useState('')
  useEffect(() => {
    if (st !== 'done' || reduced()) return
    const a = animate('.stamp', { scale: [3, 1], opacity: [0, 1], rotate: [-14, -6], duration: 1400, ease: 'outExpo' })
    return () => a.revert()
  }, [st])
  async function submit(e) {
    e.preventDefault(); setSt('sending'); setMsg('')
    const f = Object.fromEntries(new FormData(e.target))
    try {
      const res = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, elapsed: Date.now() - t0.current }) })
      const j = await res.json().catch(() => ({}))
      if (res.ok) { setWho(f.name); setSt('done') } else { setSt('error'); setMsg(j.error || 'Something went wrong. Please try again.') }
    } catch { setSt('error'); setMsg('Could not reach the server. Please try again.') }
  }
  return (
    <section id="wishlist" className="wl" data-bg="#12080b" ref={r}>
      <h2 className="big" data-rv="left">Be there<br />when SHIZU<br />awakens.</h2>
      <p className="wl-p" data-rv="up">Something is quietly growing. Leave your mark and be among the first to experience it.</p>
      {st === 'done' ? (
        <div className="done" role="status"><div className="stamp jp" aria-hidden="true">静</div><p>You’re on the list, {who}. SHIZU will remember.</p></div>
      ) : (
        <form onSubmit={submit} data-rv="up" noValidate={false}>
          <label className="fld"><span className="mono">Name</span><input name="name" required maxLength={80} autoComplete="name" /></label>
          <label className="fld"><span className="mono">Email</span><input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
          <label className="fld"><span className="mono">Why are you joining? (optional)</span><textarea name="reason" rows={2} maxLength={500} /></label>
          <input className="hp" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          <button ref={btn} className="send" disabled={st === 'sending'}>{st === 'sending' ? 'Leaving your mark…' : 'Leave your mark'} <Send size={16} aria-hidden="true" /></button>
          {st === 'error' && <p className="err" role="alert">{msg}</p>}
        </form>
      )}
    </section>
  )
}
