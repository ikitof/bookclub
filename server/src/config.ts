import path from 'path';

const serverRoot = path.resolve(__dirname, '..');

export const config = {
  port: Number(process.env.PORT) || 8787,
  production: process.env.NODE_ENV === 'production',
  /** SQLite file — created on first run. Override with DB_PATH. */
  dbPath: process.env.DB_PATH || path.join(serverRoot, 'data', 'bookclub.db'),
  /** Built client (served in production). server/dist -> ../../client/dist */
  clientDist: path.resolve(__dirname, '..', '..', 'client', 'dist'),
};
