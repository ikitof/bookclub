# Lamplight — a reading society

A small book club that runs a monthly cycle: **offer → draw → ballot → record**.
Each member inscribes two volumes on the table, two are drawn by lot, the society votes,
and the chosen book is written into the record. The whole thing is rendered as an open
book, with a monochrome and a warm "antiquarian" theme.

Built for four friends — Sarah, Emma, Elza and Arthur.

## Stack

- **Client** — Vite + React + TypeScript (`client/`)
- **Server** — Express + SQLite (`better-sqlite3`), with Server-Sent Events for live updates (`server/`)
- **Book data** — covers & metadata from the [Open Library](https://openlibrary.org) API
- Monorepo wired together with npm workspaces.

## Getting started

Requires Node 18+.

```bash
npm install     # installs both workspaces
npm run dev     # server on :8787, client on :5173 (API proxied)
```

Then open http://localhost:5173 and sign in as one of the four members.

## Production

```bash
npm run build   # builds the client, compiles the server
npm start       # one Node process serves the API and the built client on :8787
```

The SQLite database is created on first run at `server/data/bookclub.db`.
Set `PORT` to change the port and `DB_PATH` to move the database file.

## The monthly cycle

1. **Offer** — each member inscribes two volumes on the table.
2. **Draw** — any member (the *keeper*) draws two volumes by lot.
3. **Ballot** — the society casts real votes; the tally is live or sealed.
4. **Record** — the keeper seals the ballot, the winner enters the record, and a new month opens.

Votes and the pool are shared across everyone in real time over SSE — no page refresh needed.

## Project layout

```
client/   React SPA — the book
server/   Express API + SQLite + SSE
design/   Original design source (Claude design canvas) and reference screenshots
```

The interface is a faithful implementation of the *Lamplight Book Club* design in `design/`;
see `design/screenshots/` for the reference renders.

---

<sub>tiens ma main — for Sarah, Emma, Elza &amp; Arthur.</sub>
