import { useEffect, useRef, useState } from 'react'
import { animate, createTimeline, onScroll, stagger } from 'animejs'
import { ArrowUpRight } from 'lucide-react'
import Spirit from './Spirit'
import { Chars, Fern, reduced, fine, useInView, useReveal, useFloat, useMagnetic } from './lib'
import { Meet, Caps, Companion, Wishlist } from './Sections'
import { Flow, Features } from './Features'

function Particles() {
  const r = useRef()
  useEffect(() => {
    const c = r.current, x = c.getContext('2d'); let w, h, id
    const P = Array.from({ length: innerWidth < 700 ? 30 : 70 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.4 + .3, v: Math.random() * 8e-5 + 2e-5, c: Math.random() < .12 ? '#F20D42' : '#EDE6D8' }))
    const fit = () => { w = c.width = innerWidth; h = c.height = innerHeight }
    fit(); addEventListener('resize', fit)
    const draw = () => {
      x.clearRect(0, 0, w, h)
      P.forEach(p => { if (!reduced()) p.y -= p.v; if (p.y < 0) p.y = 1; x.globalAlpha = .25 + .5 * Math.abs(Math.sin(p.x * 9 + p.y * 20)); x.fillStyle = p.c; x.fillRect(p.x * w, p.y * h, p.s, p.s) })
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(id); removeEventListener('resize', fit) }
  }, [])
  return <canvas ref={r} className="parts" aria-hidden="true" />
}

function Cursor() {
  const r = useRef()
  useEffect(() => {
    if (!fine() || reduced()) return
    document.body.classList.add('cc')
    let x = 0, y = 0, tx = 0, ty = 0, id
    const mv = e => { tx = e.clientX; ty = e.clientY; r.current.classList.toggle('big', !!e.target.closest('a,button')) }
    const loop = () => { x += (tx - x) * .18; y += (ty - y) * .18; r.current.style.transform = `translate3d(${x}px,${y}px,0)`; id = requestAnimationFrame(loop) }
    addEventListener('pointermove', mv); loop()
    return () => { removeEventListener('pointermove', mv); cancelAnimationFrame(id); document.body.classList.remove('cc') }
  }, [])
  return <div ref={r} className="cursor" aria-hidden="true"><i>静</i></div>
}

const MSG = ['INITIALISING', 'READING THE SOIL', 'LISTENING', 'AWAKENING']
function Intro({ onGo, onDone }) {
  const r = useRef(), [n, setN] = useState(0)
  useEffect(() => {
    const o = { v: 0 }
    const tl = createTimeline({ onComplete: onDone })
    tl.add('.in-k', { opacity: [0, 1], scale: [.5, 1], duration: 1400, ease: 'outExpo' })
      .add(o, { v: 100, duration: 2000, ease: 'inOutQuad', onUpdate: () => setN(Math.round(o.v)) }, '-=700')
      .call(onGo, '+=100')
      .add('.in-k', { scale: [1, 34], opacity: [1, 0], duration: 1800, ease: 'inExpo' })
      .add(r.current, { opacity: [1, 0], duration: 700, ease: 'linear' }, '-=700')
    return () => tl.revert()
  }, [])
  return (
    <div className="intro" ref={r} role="status" aria-label="Loading">
      <div className="in-k jp">静</div>
      <div className="in-m mono">{String(n).padStart(3, '0')} / {MSG[Math.min(3, (n / 26) | 0)]}</div>
    </div>
  )
}

function Hero({ go }) {
  const r = useRef(); useFloat(r)
  useEffect(() => { // mouse parallax (transform only, rAF-lerped)
    if (reduced() || !fine()) return
    const L = [...r.current.querySelectorAll('[data-d]')]; let tx = 0, ty = 0, x = 0, y = 0, id
    const mv = e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5 }
    const loop = () => { x += (tx - x) * .06; y += (ty - y) * .06; L.forEach(l => { l.style.transform = `translate3d(${x * l.dataset.d}px,${y * l.dataset.d}px,0)` }); id = requestAnimationFrame(loop) }
    addEventListener('pointermove', mv); loop()
    return () => { removeEventListener('pointermove', mv); cancelAnimationFrame(id) }
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
    const scan = animate('.scan', { translateY: [0, innerHeight], duration: 6000, loop: true, ease: 'linear' })
    return () => { tl.revert(); scan.revert() }
  }, [go])
  return (
    <section className="hero" id="top" ref={r} data-bg="#080A0B" aria-label="SHIZU">
      <div className="h-stage">
        <i className="scan" aria-hidden="true" />
        <div className="layer" data-d="-14"><div className="h-kanji" data-in aria-hidden="true">静</div></div>
        <div className="layer" data-d="12"><Fern className="fern f1" data-float data-in /><Fern className="fern f2" flip data-float data-in /></div>
        <div className="layer" data-d="22"><h1 className="h-title" aria-label="SHIZU">{[...'SHIZU'].map((c, i) => <span className="hl" key={i} aria-hidden="true"><span data-in>{c}</span></span>)}</h1></div>
        <div className="layer" data-d="-32"><div className="h-subject" data-in><Spirit /></div></div>
        <div className="meta tl" data-meta data-in><b className="jp">静</b><span className="mono">SHIZU<br />Bio-integrated plant companion</span></div>
        <div className="meta tr mono" data-meta data-in>N 35°01′ / E 135°46′<br />System 01 · awake</div>
        <div className="meta vt jp" data-meta data-in>静かな精霊</div>
        <div className="meta bl" data-meta data-in><p className="tag">A Little Spirit.<br />A Living Connection.</p></div>
        <div className="meta br mono" data-meta data-in>Where technology learns to listen to nature.<span className="bar" /></div>
      </div>
    </section>
  )
}

function Story() {
  const r = useReveal()
  return (
    <section id="story" className="story" data-bg="#101B17" ref={r}>
      <div className="bgk" aria-hidden="true" data-rv="zoom">静</div>
      <Fern className="fern sf" data-rv="right" />
      <h2 className="mono" data-rv="up">The Story</h2>
      <div className="st-body">
        <p className="lead"><Chars text="Long before machines learned to understand the world, nature communicated in ways humans rarely noticed." /></p>
        <p><Chars text="In forgotten gardens, where the wind moved through leaves and time passed quietly, a little spirit waited." /></p>
        <p className="name"><Chars text="They called it SHIZU." /></p>
        <p><Chars text="A quiet presence that awakens wherever nature is cared for." /></p>
        <p><Chars text="Now, through technology, SHIZU finds a new way to observe, remember and grow alongside the living world." /></p>
        <p className="mono note" data-rv="up">SHIZU is an original, folklore-inspired character, influenced by Japanese nature-spirit traditions such as the kodama. It is not an existing legend.</p>
      </div>
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
      <section className="close" ref={r} data-bg="#080A0B" aria-label="Closing">
        <Fern className="fern cl-f" data-in />
        <div className="cl-k jp" data-in aria-hidden="true">静</div>
        <p className="cl-t" data-in>SHIZU</p>
        <p className="cl-s mono" data-in>A Little Spirit. A Living Connection.</p>
        <a ref={cta} href="#wishlist" className="send cl-s" data-in>Join the Awakening <ArrowUpRight size={16} aria-hidden="true" /></a>
      </section>
      <footer>
        <nav aria-label="Footer" className="mono"><a href="#story">Story</a> <a href="#meet">Meet SHIZU</a> <a href="#beyond">Beyond</a> <a href="#features">Features</a> <a href="#companion">Companion</a> <a href="#wishlist">Early access</a></nav>
        <nav aria-label="Social" className="mono"><a href="#">Instagram</a> <a href="#">YouTube</a> <a href="#">X</a></nav>
        <p className="mono">© 2026 SHIZU. All rights reserved.</p>
      </footer>
    </>
  )
}

export default function App() {
  const [go, setGo] = useState(reduced()), [done, setDone] = useState(reduced())
  useEffect(() => { document.documentElement.classList.toggle('lock', !done) }, [done])
  useEffect(() => { // atmosphere shifts between sections
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && !reduced() && animate(document.body, { backgroundColor: e.target.dataset.bg, duration: 1200, ease: 'outQuad' })), { threshold: .35 })
    document.querySelectorAll('[data-bg]').forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])
  useEffect(() => { // scroll progress bar, scrubbed by the page scroll
    if (reduced()) return
    const a = animate('.prog', { scaleX: [0, 1], ease: 'linear', autoplay: onScroll({ target: 'main', enter: 'top top', leave: 'bottom bottom', sync: true }) })
    return () => a.revert()
  }, [])
  return (
    <>
      <Particles /><Cursor /><i className="prog" aria-hidden="true" />
      {!done && <Intro onGo={() => setGo(true)} onDone={() => setDone(true)} />}
      <header className="nav">
        <a href="#top" className="logo"><span className="jp">静</span> SHIZU</a>
        <nav aria-label="Primary"><a href="#story">Story</a><a href="#meet">Meet</a><a href="#beyond">Beyond</a><a href="#features">Features</a><a href="#companion">Companion</a><a href="#wishlist" className="join">Early access</a></nav>
      </header>
      <main><Hero go={go} /><Story /><Meet /><Caps /><Flow /><Features /><Companion /><Wishlist /><Closing /></main>
    </>
  )
}
