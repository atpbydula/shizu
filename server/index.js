import 'dotenv/config'
import express from 'express'
import rateLimit from 'express-rate-limit'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3001
const dbFile = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'shizu.db')

let db = null
try {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true })
  const { DatabaseSync } = await import('node:sqlite') // built in, Node 22.13+
  db = new DatabaseSync(dbFile)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec(`CREATE TABLE IF NOT EXISTS wishlist(
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
    reason TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
} catch (e) {
  // No fake success: without a database, submissions are rejected with a clear message.
  console.error('[shizu] Database unavailable. Submissions will be rejected, not simulated.', e.message)
}

const total = () => (db ? Number(db.prepare('SELECT COUNT(*) n FROM wishlist').get().n) : null)
const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use((q, s, n) => { s.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin' }); n() })
app.use(express.json({ limit: '8kb' }))

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts. Please try again in an hour.' } })

app.post('/api/wishlist', limiter, (req, res) => {
  const b = req.body || {}
  if (b.company) return res.json({ ok: true })                       // honeypot: drop silently
  if (typeof b.elapsed === 'number' && b.elapsed < 2000) return res.status(429).json({ error: 'That was very fast. Please try again.' })
  const name = String(b.name || '').trim().slice(0, 80)
  const email = String(b.email || '').trim().toLowerCase()
  const reason = String(b.reason || '').trim().slice(0, 500)
  if (!name) return res.status(400).json({ error: 'Please enter your name.' })
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' })
  if (!db) return res.status(503).json({ error: 'The wishlist is unavailable right now. Nothing was saved.' })
  try {
    db.prepare('INSERT INTO wishlist(name,email,reason) VALUES(?,?,?)').run(name, email, reason || null)
    res.status(201).json({ ok: true, count: total() })
  } catch (e) {
    if (/UNIQUE constraint/i.test(String(e.message))) return res.status(409).json({ error: 'This email is already on the list.' })
    console.error(e); res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
})

app.get('/api/wishlist/count', (q, res) => {
  res.set('Cache-Control', 'no-store')
  const n = total()
  n === null ? res.status(503).json({ error: 'Count unavailable.' }) : res.json({ count: n })
})

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist')
  app.use(express.static(dist))
  app.get('*', (q, s) => s.sendFile(path.join(dist, 'index.html')))
}
app.listen(PORT, () => console.log(`[shizu] http://localhost:${PORT}`))
