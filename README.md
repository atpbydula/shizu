# SHIZU 静 — immersive landing page

React + Vite, Anime.js v4, Node/Express, SQLite (Node built-in `node:sqlite`, Node 22.13+).

## Run
```bash
npm install
cp .env.example .env
npm run dev            # Vite on :5173, API on :3001 (proxied)
```
Production: `npm run build && npm start` (Express serves `dist/` and the API on one port).

## Wishlist
`POST /api/wishlist` `{name,email,reason?}` → 201 / 400 / 409 (duplicate) / 429 / 503.
Server-side validation, unique emails, per-IP rate limit, honeypot field and a minimum-time check.
If the database cannot open, the API returns 503 and saves nothing. View entries:
`sqlite3 server/data/shizu.db "select * from wishlist"`.

## Structure
`src/lib.jsx` animation hooks (reveal, float, magnetic) · `src/Spirit.jsx` SVG companion + expressions ·
`src/App.jsx` intro, hero, story, closing · `src/Sections.jsx` meet, capabilities, companion, wishlist.

Reduced motion: respected (static final states, no parallax, no intro). Sensor values and the signal trace are labelled illustrative.

`GET /api/wishlist/count` returns the real number of signups; the site shows it live (starts at 0).
