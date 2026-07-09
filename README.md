# The Smallest Book Club Who Ever Lived

A small book club that runs a monthly cycle: **offer → draw → ballot → record**.
The interface is in French.

Each member inscribes two volumes on the table, two are drawn by lot, the society votes,
and the chosen book is written into the record. The whole thing is rendered as an open
book, with a monochrome and a warm "antiquarian" theme.

Built for four friends — Sarah, Emma, Elza and Arthur.

## Stack

- **Client** — Vite + React + TypeScript (`client/`)
- **Server** — Express + SQLite (`node-sqlite3-wasm`), with Server-Sent Events for live updates (`server/`)
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

## Docker

Everything is configured through `.env` — copy the template and bring it up:

```bash
cp .env.example .env      # adjust ports / paths if you like
docker compose up --build -d
```

Then browse to `http://localhost:${HOST_PORT}` (8787 by default). The image is a
multi-stage build that compiles the client and server and runs as a non-root user;
the SQLite database lives on a named volume (`bookclub-data`) so it survives
rebuilds. Stop with `docker compose down` (add `-v` to also wipe the database).

## Configuration

No values are hardcoded — the server reads its configuration from the environment,
and `docker compose` reads everything from `.env` (see `.env.example`):

| Variable        | Default             | Purpose                                              |
| --------------- | ------------------- | ---------------------------------------------------- |
| `CLUB_NAME`     | The Smallest…       | Club name shown on the cover and running head        |
| `PORT`          | `8787`              | Port the server listens on                           |
| `HOST_PORT`     | `8787`              | Host port published by Compose                       |
| `DB_PATH`       | `/data/bookclub.db` | SQLite file location (on the volume, in Docker)      |
| `NODE_ENV`      | `production`        | Set to `development` for local dev                   |
| `COOKIE_SECURE` | `false` in Compose  | `true` behind HTTPS, `false` over plain HTTP         |
| `NODE_VERSION`  | `20-alpine`         | Node base image for the build                        |

## The monthly cycle

1. **Offer** — each member inscribes two volumes on the table.
2. **Draw** — any member (the *keeper*) draws two volumes by lot.
3. **Ballot** — the society casts real votes; the tally is live or sealed.
4. **Record** — the keeper seals the ballot, the winner enters the record, and a new month opens.

Votes and the pool are shared across everyone in real time over SSE — no page refresh needed.

## Importing an existing club's history

Bring past reads into the record ("Le registre"). Write a JSON file — only
`month` and `title` are required per entry; author, cover, page count, year and
genre are filled in from Open Library (see `server/history.import.example.json`):

```json
[
  { "month": "octobre 2025", "title": "The Idiot", "author": "Elif Batuman" },
  { "month": "novembre 2025", "title": "Bonjour tristesse" }
]
```

Then run it (stop the server first, or restart it afterwards so it re-reads the database):

```bash
npm run import:history -w server -- --file path/to/history.json --replace
```

- `--replace` clears the record first — use it to drop the demo entries and start clean.
- Without it, entries already present (same month + title) are skipped, so it's safe to re-run.
- Months accept French or English names (`octobre 2025`, `October 2025`) or numeric forms (`2025-10`).
- Point `DB_PATH` at the same database the server uses. Entries sort chronologically by month, so old reads slot in correctly.

## Project layout

```
client/   React SPA — the book
server/   Express API + SQLite + SSE
design/   Original design source (Claude design canvas) and reference screenshots
```

The interface is a faithful implementation of the original design in `design/`;
see `design/screenshots/` for the reference renders.

---

<sub>tiens ma main — for Sarah, Emma, Elza &amp; Arthur.</sub>
