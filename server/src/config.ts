import path from 'path';

const serverRoot = path.resolve(__dirname, '..');

const production = process.env.NODE_ENV === 'production';

export const config = {
  port: Number(process.env.PORT) || 8787,
  production,
  /** Display name of the club. Override with CLUB_NAME. */
  clubName: process.env.CLUB_NAME || 'The Smallest Book Club Who Ever Lived',
  /** SQLite file — created on first run. Override with DB_PATH. */
  dbPath: process.env.DB_PATH || path.join(serverRoot, 'data', 'bookclub.db'),
  /**
   * Send the session cookie with the Secure flag. Defaults to on in production.
   * Set COOKIE_SECURE=false when serving over plain HTTP (e.g. a container reached
   * directly by IP with no TLS), or true when behind an HTTPS reverse proxy.
   */
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : production,
  /** Built client (served in production). server/dist -> ../../client/dist */
  clientDist: path.resolve(__dirname, '..', '..', 'client', 'dist'),
};
