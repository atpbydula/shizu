import { useEffect, useRef, useState } from 'react'
import { animate, createAnimatable, createTimeline, onScroll, stagger } from 'animejs'
import { ArrowUpRight } from 'lucide-react'
import Spirit from './Spirit'
import { Chars, Fern, reduced, fine, useInView, useReveal, useFloat, useMagnetic, useScrub } from './lib'
import { Meet, Caps, Companion, Wishlist } from './Sections'

function Particles() { // glow dust + drifting sakura petals
  const r = useRef()
  useEffect(() => {
    const c = r.current, x = c.getContext('2d'), sm = innerWidth < 700; let w, h, id
    const P = Array.from({ length: sm ? 20 : 44 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 2.2 + 1, v: Math.random() * 6e-5 + 1.5e-5, o: Math.random() * 6.3, k: Math.random() < .3 ? '217,166,166' : '135,150,106' }))
    const F = Array.from({ length: sm ? 7 : 15 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 4 + 5, v: Math.random() * 1e-4 + 5e-5, o: Math.random() * 6.3, r: Math.random() * 6.3 }))
    const fit = () => { w = c.width = innerWidth; h = c.height = innerHeight }
    fit(); addEventListener('resize', fit)
    const draw = t => {
      x.clearRect(0, 0, w, h)
      P.forEach(p => {
        if (!reduced()) { p.y -= p.v; p.x += Math.sin(t / 2500 + p.o) * 1.2e-4 }
        if (p.y < -.02) p.y = 1.02
        const a = .3 + .6 * Math.abs(Math.sin(t / 1400 + p.o)), px = p.x * w, py = p.y * h, g = x.createRadialGradient(px, py, 0, px, py, p.s * 7)
        g.addColorStop(0, `rgba(${p.k},${a})`); g.addColorStop(1, `rgba(${p.k},0)`)
        x.fillStyle = g; x.beginPath(); x.arc(px, py, p.s * 7, 0, 6.3); x.fill()
      })
      F.forEach(p => {
        if (!reduced()) { p.y += p.v; p.x += Math.sin(t / 1800 + p.o) * 2e-4 + 3e-5; p.r += .004 }
        if (p.y > 1.03) { p.y = -.03; p.x = Math.random() } if (p.x > 1.03) p.x = -.03
        x.save(); x.translate(p.x * w, p.y * h); x.rotate(p.r); x.scale(1, .55 + .45 * Math.abs(Math.sin(t / 900 + p.o)))
        x.fillStyle = 'rgba(217,166,166,.7)'; x.beginPath(); x.ellipse(0, 0, p.s, p.s * .6, 0, 0, 6.3); x.fill(); x.restore()
      })
      id = requestAnimationFrame(draw)
    }
    id = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(id); removeEventListener('resize', fit) }
  }, [])
  return <canvas ref={r} className="parts" aria-hidden="true" />
}

function Vine() { // a growing stem, and a sun that sets into a moon as you read
  const r = useRef(), s = useRef()
  useEffect(() => {
    if (reduced()) return
    const a = createAnimatable(s.current, { x: 900, y: 900, scale: 900, ease: 'out(3)' })
    let id = 0
    const f = () => {
      id = 0
      const p = Math.min(1, Math.max(0, scrollY / ((document.documentElement.scrollHeight - innerHeight) || 1)))
      r.current.style.transform = `scaleY(${p})`
      a.y(p * innerHeight * .5); a.x(-p * innerWidth * .12); a.scale(1 - p * .3)
      s.current.classList.toggle('moon', p > .86)
    }
    const on = () => { if (!id) id = requestAnimationFrame(f) }
    addEventListener('scroll', on, { passive: true }); on()
    return () => { removeEventListener('scroll', on); a.revert() }
  }, [])
  return <><div className="sun" ref={s} aria-hidden="true" /><div className="vine" aria-hidden="true"><i ref={r} /></div></>
}

function Cursor() { // a firefly that follows with spring-smoothed motion
  const r = useRef()
  useEffect(() => {
    if (!fine() || reduced()) return
    document.body.classList.add('cc')
    const a = createAnimatable(r.current, { x: 350, y: 350, ease: 'out(3)' })
    const mv = e => { a.x(e.clientX); a.y(e.clientY); r.current.classList.toggle('big', !!e.target.closest('a,button')) }
    addEventListener('pointermove', mv)
    return () => { removeEventListener('pointermove', mv); a.revert(); document.body.classList.remove('cc') }
  }, [])
  return <div ref={r} className="cursor" aria-hidden="true"><i>静</i></div>
}

function Nav() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open || reduced()) return
    const a = animate('.sheet a', { opacity: [0, 1], translateY: [40, 0], delay: stagger(80), duration: 900, ease: 'outExpo' })
    return () => a.revert()
  }, [open])
  const L = [['story', 'Story'], ['meet', 'Meet'], ['beyond', 'Beyond'], ['companion', 'Companion'], ['wishlist', 'Early access']]
  const go = (e, h) => { e.preventDefault(); setOpen(false); setTimeout(() => document.getElementById(h)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' }), 60) }
  return (
    <>
      <Nav />
      {open && <nav className="sheet" aria-label="Menu">{L.map(([h, t]) => <a key={h} href={'#' + h} onClick={e => go(e, h)}>{t}</a>)}</nav>}
    </>
  )
}

const MSG = ['Take a breath', 'Something is stirring', 'Listening', 'Hello']
function Intro({ onGo, onDone }) {
  const r = useRef(), [n, setN] = useState(0)
  useEffect(() => {
    const o = { v: 0 }
    const halo = animate('.in-h', { scale: [.8, 1.15], opacity: [.35, .8], duration: 2200, alternate: true, loop: true, ease: 'inOutSine' })
    const tl = createTimeline({ onComplete: onDone })
    tl.add('.in-k', { opacity: [0, 1], scale: [.5, 1], duration: 1400, ease: 'outExpo' })
      .add(o, { v: 100, duration: 2000, ease: 'inOutQuad', onUpdate: () => setN(Math.round(o.v)) }, '-=700')
      .call(onGo, '+=100')
      .add('.in-k', { scale: [1, 34], opacity: [1, 0], duration: 1800, ease: 'inExpo' })
      .add(r.current, { opacity: [1, 0], duration: 700, ease: 'linear' }, '-=700')
    return () => { tl.revert(); halo.revert() }
  }, [])
  return (
    <div className="intro" ref={r} role="status" aria-label="Loading">
      <div className="in-h" aria-hidden="true" /><div className="in-k jp">静</div>
      <div className="in-m mono">{String(n).padStart(3, '0')} / {MSG[Math.min(3, (n / 26) | 0)]}</div>
    </div>
  )
}

function Hero({ go }) {
  const r = useRef(), [mood, setMood] = useState('happy'); useFloat(r)
  const greet = (h => h < 5 ? 'Still up?' : h < 12 ? 'Good morning.' : h < 18 ? 'Good afternoon.' : 'Good evening.')(new Date().getHours())
  const hello = e => { // tap SHIZU: it lights up and scatters petals
    setMood('excited'); setTimeout(() => setMood('happy'), 1800)
    if (reduced()) return
    const host = e.currentTarget
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('i'); p.className = 'petal'; host.appendChild(p)
      const a = Math.random() * 6.28, d = 120 + Math.random() * 180
      animate(p, { translateX: [0, Math.cos(a) * d], translateY: [0, Math.sin(a) * d - 80], rotate: [0, Math.random() * 360], opacity: [1, 0], scale: [1, .4], duration: 2200 + Math.random() * 1200, ease: 'outQuart', onComplete: () => p.remove() })
    }
  }
  useEffect(() => { // parallax: pointer on desktop, slow drift on touch
    if (reduced()) return
    const L = [...r.current.querySelectorAll('[data-d]')]
    if (!fine()) {
      const as = L.map((l, i) => animate(l, { x: [-l.dataset.d / 2, l.dataset.d / 2], y: [l.dataset.d / 3, -l.dataset.d / 3], duration: 6000 + i * 1700, alternate: true, loop: true, ease: 'inOutSine' }))
      return () => as.forEach(a => a.revert())
    }
    const A = L.map(l => createAnimatable(l, { x: 700, y: 700, ease: 'out(3)' }))
    const mv = e => { const px = e.clientX / innerWidth - .5, py = e.clientY / innerHeight - .5; A.forEach((a, i) => { const d = +L[i].dataset.d; a.x(px * d); a.y(py * d) }) }
    addEventListener('pointermove', mv)
    return () => { removeEventListener('pointermove', mv); A.forEach(a => a.revert()) }
  }, [])
  useEffect(() => { // scroll-scrubbed zoom into the next section
    if (reduced()) return
    const a = animate(r.current.querySelector('.h-stage'), { scale: [1, 1.7], opacity: [1, 0], ease: 'linear', autoplay: onScroll({ target: r.current, enter: 'top top', leave: 'bottom top', sync: true }) })
    return () => a.revert()
  }, [])
  useEffect(() => { // awakening sequence
    if (!go || reduced()) return
    const tl = createTimeline({ defaults: { ease: 'outExpo' } })
    tl.add('.h-kanji', { opacity: [0, 1], scale: [2.2, 1], duration: 2400 })
      .add('.hl>span', { opacity: [0, 1], translateY: ['110%', '0%'], delay: stagger(90), duration: 1600 }, '-=2000')
      .add('.h-subject', { opacity: [0, 1], scale: [.55, 1], rotate: [-9, 0], duration: 2200 }, '-=1900')
      .add('.hero .fern', { opacity: [0, .85], duration: 2000 }, '-=1500')
      .add('[data-meta]', { opacity: [0, 1], translateY: [14, 0], delay: stagger(90), duration: 1000 }, '-=1300')
    const scan = animate('.scan', { translateY: [0, innerHeight], duration: 9000, loop: true, ease: 'linear' })
    const glow = animate('.glow', { scale: [.9, 1.12], opacity: [.7, 1], duration: 3600, alternate: true, loop: true, ease: 'inOutSine' })
    return () => { tl.revert(); scan.revert(); glow.revert() }
  }, [go])
  return (
    <section className="hero" id="top" ref={r} data-bg="#F2EBDD" aria-label="SHIZU">
      <div className="h-stage">
        <i className="scan" aria-hidden="true" />
        <div className="layer" data-d="-14"><div className="h-kanji" data-in aria-hidden="true">静</div></div>
        <div className="layer" data-d="12"><Fern className="fern f1" data-float data-in /><Fern className="fern f2" flip data-float data-in /></div>
        <div className="layer" data-d="22"><h1 className="h-title" aria-label="SHIZU">{[...'SHIZU'].map((c, i) => <span className="hl" key={i} aria-hidden="true"><span data-in>{c}</span></span>)}</h1></div>
        <div className="layer" data-d="-32"><div className="glow" aria-hidden="true" /><button className="h-subject" data-in onPointerEnter={() => setMood('curious')} onPointerLeave={() => setMood('happy')} onClick={hello} aria-label="Say hello to SHIZU"><Spirit mood={mood} /></button></div>
        <div className="meta tl" data-meta data-in><b className="jp">静</b><span className="mono">SHIZU<br />Bio-integrated plant companion</span></div>
        <div className="meta tr mono" data-meta data-in>N 35°01′ / E 135°46′<br />System 01 · awake</div>
        <div className="meta vt jp" data-meta data-in>静かな精霊</div>
        <div className="meta hint mono" data-meta data-in>{greet} Tap SHIZU to say hello</div>
        <div className="meta bl" data-meta data-in><p className="tag">A Little Spirit.<br />A Living Connection.</p></div>
        <div className="meta br mono" data-meta data-in>Where technology learns to listen to nature.<span className="bar" /></div>
      </div>
    </section>
  )
}

function Act({ cls = '', children }) { const r = useReveal(); return <div className={'act ' + cls} ref={r}>{children}</div> }
function Story() {
  const r = useRef(); useScrub(r, '.sf', { rotate: [-4, 4], scaleY: [.85, 1.05] })
  useEffect(() => { // the 静 behind the story swells as you scroll
    if (reduced()) return
    const a = animate(r.current.querySelector('.bgk'), { scale: [.85, 1.6], translateY: ['0vh', '-12vh'], ease: 'linear', autoplay: onScroll({ target: r.current, enter: 'top bottom', leave: 'bottom top', sync: true }) })
    return () => a.revert()
  }, [])
  return (
    <section id="story" className="story" data-bg="#E9E5D0" ref={r}>
      <div className="bgk" aria-hidden="true">静</div>
      <Fern className="fern sf" />
      <h2 className="mono">The Story</h2>
      <Act>
        <p className="lead"><Chars text="Long ago, in a quiet garden hidden beneath the branches of an ancient tree, there lived a little spirit named Shizu." /></p>
        <p data-rv="up">Shizu was said to exist wherever nature was cared for and remembered. It could not speak like humans, nor could it ask for help. It simply existed alongside the plants, observing the changing seasons, the warmth of sunlight, the falling rain and the passage of time.</p>
      </Act>
      <Act cls="r">
        <p className="lead dim"><Chars text="As the years passed, the garden was forgotten." /></p>
        <p data-rv="up">Its trees grew weaker, its flowers disappeared, and Shizu slowly fell into a deep sleep.</p>
      </Act>
      <Act>
        <p className="name"><Chars text="Until one day, someone planted a new seed." /></p>
        <p data-rv="up">Through that small act of care, Shizu awakened.</p>
      </Act>
      <Act cls="r">
        <p className="lead"><Chars text="But this time, Shizu found itself in a different world — a world of technology, connected devices and people whose days moved faster than the seasons." /></p>
        <p data-rv="up">With the help of a new companion, Shizu could once again understand its surroundings, remember the moments it experienced and grow alongside the plant it was entrusted to protect.</p>
        <p className="name"><Chars text="And so, a new little garden began." /></p>
      </Act>
      <p className="mono note">SHIZU is an original, folklore-inspired character, influenced by Japanese nature-spirit traditions such as the kodama. It is not an existing legend.</p>
    </section>
  )
}

const NOTE = ['Hello.', 'I can’t speak, so I make small faces instead.', 'When you come back, I’m glad.', 'When you forget, I wait. I’m good at waiting.', 'Thank you for caring for something quiet.']
function Letter() {
  const r = useRef(); useScrub(r, '.pen', { scale: [.85, 1.2] })
  useInView(r, el => { if (!reduced()) return animate(el.querySelectorAll('.ln'), { opacity: [0, 1], translateY: [24, 0], delay: stagger(1000), duration: 2000, ease: 'outQuart' }) }, .3)
  return (
    <section className="letter" data-bg="#E3DFC7" ref={r} aria-label="A note from SHIZU">
      <div className="pen jp" aria-hidden="true">静</div>
      <p className="mono">A note from SHIZU</p>
      {NOTE.map((l, i) => <p key={i} className={'ln' + (i ? '' : ' hi')} data-in>{l}</p>)}
    </section>
  )
}

function Closing() {
  const r = useRef(), cta = useMagnetic()
  useInView(r, () => {
    if (reduced()) return
    return createTimeline({ defaults: { ease: 'outExpo' } })
      .add('.cl-k', { scale: [1.9, 1], opacity: [0, 1], duration: 2600 })
      .add('.cl-f', { opacity: [0, .5], duration: 2400 }, '-=2400')
      .add('.cl-t', { opacity: [0, 1], translateY: [40, 0], duration: 1600 }, '-=1600')
      .add('.cl-s', { opacity: [0, 1], translateY: [20, 0], delay: stagger(150), duration: 1200 }, '-=1000')
  }, .3)
  return (
    <>
      <section className="close" ref={r} data-bg="#2C3B2B" aria-label="Closing">
        <Fern className="fern cl-f" data-in />
        <div className="cl-k jp" data-in aria-hidden="true">静</div>
        <p className="cl-t" data-in>SHIZU</p>
        <p className="cl-s mono" data-in>A Little Spirit. A Living Connection.</p>
        <a ref={cta} href="#wishlist" className="send cl-s" data-in>Join the Awakening <ArrowUpRight size={16} aria-hidden="true" /></a>
      </section>
      <footer>
        <nav aria-label="Footer" className="mono"><a href="#story">Story</a> <a href="#meet">Meet SHIZU</a> <a href="#beyond">Beyond</a> <a href="#companion">Companion</a> <a href="#wishlist">Early access</a></nav>
        <nav aria-label="Social" className="mono"><a href="#">Instagram</a> <a href="#">YouTube</a> <a href="#">X</a></nav>
        <p className="mono">© 2026 SHIZU. All rights reserved.</p>
      </footer>
    </>
  )
}

export default function App() {
  const [go, setGo] = useState(reduced()), [done, setDone] = useState(reduced())
  useEffect(() => { document.documentElement.classList.toggle('lock', !done) }, [done])
  useEffect(() => { // every tap leaves a soft ripple (also feedback on touch)
    if (reduced()) return
    const down = e => {
      const d = document.createElement('i'); d.className = 'ripple'; d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px'; document.body.appendChild(d)
      animate(d, { scale: [0, 1], opacity: [.6, 0], duration: 1100, ease: 'outExpo', onComplete: () => d.remove() })
    }
    addEventListener('pointerdown', down); return () => removeEventListener('pointerdown', down)
  }, [])
  useEffect(() => { // atmosphere shifts between sections
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && !reduced() && animate(document.body, { backgroundColor: e.target.dataset.bg, duration: 1200, ease: 'outQuad' })), { threshold: .35 })
    document.querySelectorAll('[data-bg]').forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])
  return (
    <>
      <Particles /><Cursor /><Vine />
      {!done && <Intro onGo={() => setGo(true)} onDone={() => setDone(true)} />}
      <Nav />
      <main><Hero go={go} /><Story /><Meet /><Caps /><Companion /><Letter /><Wishlist /><Closing /></main>
    </>
  )
}
