import type { Response } from 'express';
import { buildSnapshot } from './state';

// Open SSE connections. Every mutation broadcasts a fresh snapshot to all.
const clients = new Set<Response>();

export function addClient(res: Response): void {
  clients.add(res);
  res.on('close', () => clients.delete(res));
}

export function snapshotFrame(): string {
  return `data: ${JSON.stringify(buildSnapshot())}\n\n`;
}

export function broadcast(): void {
  const frame = snapshotFrame();
  for (const res of clients) {
    try {
      res.write(frame);
    } catch {
      clients.delete(res);
    }
  }
}

// Keep connections warm through proxies.
setInterval(() => {
  for (const res of clients) {
    try {
      res.write(': ping\n\n');
    } catch {
      clients.delete(res);
    }
  }
}, 25000).unref();
