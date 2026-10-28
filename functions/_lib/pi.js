/* Shared helpers for Pi payment functions. Secret: PI_API_KEY (Cloudflare → Settings → Variables and Secrets). */
export const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
export const out = (o) => new Response(JSON.stringify(o), { status: 200, headers: cors });
export const PRICES = { supporter: 1 };
export const okId = (id) => /^[A-Za-z0-9_-]{6,80}$/.test(String(id || ''));
export function pi(env, path, method, body) { return fetch('https://api.minepi.com/v2' + path, { method: method || 'GET', headers: { Authorization: 'Key ' + env.PI_API_KEY, 'Content-Type': 'application/json' }, body: method === 'POST' ? JSON.stringify(body || {}) : undefined }); }
