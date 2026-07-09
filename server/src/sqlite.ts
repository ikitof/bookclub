import { Database as WasmDatabase } from 'node-sqlite3-wasm';
import fs from 'fs';
import path from 'path';
import { config } from './config';

// node-sqlite3-wasm is a pure-WASM SQLite: no native build, ABI-independent,
// and it writes through to the file on every statement (durable under crash).
// It only binds *positional* params (arrays), so this thin adapter gives the
// rest of the server a small, better-sqlite3-shaped surface.

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

const raw = new WasmDatabase(config.dbPath);
raw.exec('PRAGMA foreign_keys = ON');

const bind = (p: unknown[]) => (p.length ? (p as never) : undefined);

export interface Stmt {
  run(...params: unknown[]): void;
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
}

export interface DbApi {
  prepare(sql: string): Stmt;
  exec(sql: string): void;
  /** Wrap a function in BEGIN/COMMIT, rolling back on throw. */
  transaction(fn: () => void): () => void;
  close(): void;
}

export const db: DbApi = {
  prepare(sql) {
    return {
      run: (...p) => {
        raw.run(sql, bind(p));
      },
      get: (...p) => raw.get(sql, bind(p)),
      all: (...p) => raw.all(sql, bind(p)),
    };
  },
  exec: (sql) => raw.exec(sql),
  transaction(fn) {
    return () => {
      raw.exec('BEGIN');
      try {
        fn();
        raw.exec('COMMIT');
      } catch (err) {
        raw.exec('ROLLBACK');
        throw err;
      }
    };
  },
  close: () => {
    if (raw.isOpen) raw.close();
  },
};

function shutdown() {
  try {
    db.close();
  } catch {
    /* already closing */
  }
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
