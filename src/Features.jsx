import { useEffect, useRef, useState } from 'react'
import { animate, stagger, svg } from 'animejs'
import { Chars, reduced, fine, useInView, useReveal } from './lib'

const P = s => s.split('|').map(x => [x[0], x.slice(2)])
const PR = { M: 'Must', S: 'Should', C: 'Could' }
const SUB = [
  ['Environmental Monitoring', P('M Soil Moisture|M Temperature|M Relative Humidity|M Light Intensity|M Threshold Configuration|M Automatic Watering|M Sensor Calibration|S Artificial Sun Light|S Condition Classification|S Environmental Alerts')],
  ['Desk Companion', P('M Expressive Facial Animations|M Touch Interaction|M Study Timers|M Break Reminders|M Basic Alarms|M Time Display|S Ambient Interaction|S Contextual Responses|S Idle Animations|C Greetings & Audio Feedback')],
  ['Interactive Plant Companion', P('M Plant Profiles|M Species Selection|M Care Recommendations|M Plant Journal|M Plant-Specific System|S Plant Health Status|S Growth Tracking|S Care History')],
  ['Cloud & AI', P('M Cloud Data Sync|M Centralised Data Storage|S Real-Time Updates|S AI Care Recommendations|S User Authentication|S Adaptive Care Advice|S Soil Moisture Prediction|C Predictive Care Analysis|C Anomaly Detection')],
  ['Hardware & Integration', P('M Microcontroller Integration|M Wireless Connectivity|S System Status Monitoring|C Power Management|C Component Failure Detection')],
  ['Bioelectrical Signals', P('S Signal Acquisition|S Electrode Integration|S Signal Data Storage|S Signal Filtering|S Signal Amplification|C Signal Visualisation'), 1],
]
const NODES = ['Plant & sensors', 'ESP32', 'Wi-Fi · MQTT', 'Cloud brain', 'Companion + app']

export function Flow() {
  const r = useRef(), h = useReveal()
  useInView(r, el => {
    if (reduced()) return
    const m = svg.createMotionPath('.fl-p')
    const as = [
      animate(el.querySelector('.fl-p'), { strokeDashoffset: [1, 0], duration: 2600, ease: 'inOutSine' }),
      animate(el.querySelectorAll('.fl-n'), { scale: [0, 1], opacity: [0, 1], delay: stagger(520), duration: 900, ease: 'outBack' }),
      animate(el.querySelector('.fl-d'), { opacity: 1, delay: 2600, duration: 300 }),
      animate(el.querySelector('.fl-d'), { ...m, duration: 5000, delay: 2600, loop: true, ease: 'linear' }),
    ]
    return { revert: () => as.forEach(a => a.revert()) }
  }, .4)
  return (
    <section data-bg="#080A0B" aria-label="System architecture">
      <header ref={h}><p className="mono" data-rv="up">Five layers, one living loop</p><h2 className="big"><Chars text="Leaf to cloud to companion" /></h2></header>
      <div className="flow" ref={r}>
        <svg viewBox="0 0 1000 170" role="img" aria-label="Data flows from the plant and sensors through the ESP32 and Wi-Fi to the cloud, then back to the companion and mobile app">
          <path className="fl-p" pathLength="1" d="M60 80C170 10 170 150 280 80S390 10 500 80S610 150 720 80S830 10 940 80" />
          {NODES.map((l, i) => <g key={l} transform={`translate(${60 + i * 220} 80)`}><g className="fl-n" data-in><circle r="13" /><text y="46" textAnchor="middle">{l}</text></g></g>)}
          <circle className="fl-d" r="5" />
        </svg>
      </div>
    </section>
  )
}

const tilt = e => {
  if (!fine() || reduced()) return
  const el = e.currentTarget, b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height
  el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%')
  animate(el, { rotateY: (x - .5) * 16, rotateX: (.5 - y) * 16, duration: 300, ease: 'outQuad' })
}
const rest = e => { if (!reduced()) animate(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 900, ease: 'outElastic(1,.6)' }) }

function Group({ n, t, items, x, f }) {
  const r = useReveal(), L = items.filter(i => f === 'all' || i[0] === f)
  useInView(r, el => {
    if (reduced()) return
    const a = animate(el.querySelectorAll('.fc'), { opacity: [0, 1], translateY: [50, 0], scale: [.85, 1], delay: stagger(60), duration: 1100, ease: 'outExpo' })
    return { revert: () => a.revert() }
  }, .2)
  return (
    <div className="fg" ref={r} style={L.length ? null : { display: 'none' }}>
      <header data-rv="left"><span className="n" aria-hidden="true">0{n + 1}</span><h3>{t}</h3><span className="mono">{L.length} features{x ? ' · experimental' : ''}</span></header>
      {x && <p className="mono fx" data-rv="up">Signals are analysed as data only. SHIZU does not detect emotion, pain or thoughts.</p>}
      <div className="fgrid">
        {L.map(([p, name]) => (
          <article className="fc" key={name} onPointerMove={tilt} onPointerLeave={rest}>
            <h4>{name}</h4>
            <div><span className={'tg ' + p}>{PR[p]}</span>{x ? <span className="tg x">Experimental</span> : null}</div>
          </article>
        ))}
      </div>
    </div>
  )
}

export function Features() {
  const h = useReveal(), s = useRef(), [f, setF] = useState('all'), first = useRef(true)
  const T = SUB.flatMap(g => g[1]), cnt = k => T.filter(i => i[0] === k).length
  useInView(s, el => {
    if (reduced()) return
    const as = [...el.querySelectorAll('[data-n]')].map(n => { const o = { v: 0 }; return animate(o, { v: +n.dataset.n, duration: 2200, ease: 'outExpo', onUpdate: () => { n.textContent = Math.round(o.v) } }) })
    return { revert: () => as.forEach(a => a.revert()) }
  }, .4)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (reduced()) return
    const a = animate('.fc', { opacity: [0, 1], translateY: [30, 0], scale: [.88, 1], delay: stagger(22, { from: 'center' }), duration: 900, ease: 'outExpo' })
    return () => a.revert()
  }, [f])
  return (
    <section id="features" data-bg="#0a100d">
      <header ref={h}><p className="mono" data-rv="up">The complete build</p><h2 className="big"><Chars text="Every part of the system" /></h2></header>
      <div className="f-stats" ref={s}>
        {[['Features', T.length], ['Subsystems', SUB.length], ['Must', cnt('M')], ['Should', cnt('S')], ['Could', cnt('C')]].map(([l, v]) => <div key={l}><b data-n={v}>{v}</b><span className="mono">{l}</span></div>)}
      </div>
      <div className="f-filter" role="radiogroup" aria-label="Filter by priority">
        {[['all', 'All'], ['M', 'Must have'], ['S', 'Should have'], ['C', 'Could have']].map(([k, l]) => <button key={k} role="radio" aria-checked={f === k} onClick={() => setF(k)}>{l}</button>)}
      </div>
      {SUB.map(([t, items, x], n) => <Group key={t} n={n} t={t} items={items} x={x} f={f} />)}
    </section>
  )
}
