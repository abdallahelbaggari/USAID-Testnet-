/* GrowthBridge · /approve — checks a payment with Pi Network before approving it. Fails closed; always answers HTTP 200. */
import { out, cors, PRICES, okId, pi } from './_lib/pi.js';
export async function onRequestGet({ env }) { return out({ ok: true, ready: !!env.PI_API_KEY }); }
export async function onRequestPost({ request, env }) {
  let b = {}; try { b = await request.json(); } catch (e) { return out({ approved: false, error: 'Bad request' }); }
  const pid = String(b.paymentId || '');
  if (!okId(pid)) return out({ approved: false, error: 'Invalid payment id' });
  if (!env.PI_API_KEY) return out({ approved: false, error: 'Payments are not switched on yet' });
  try {
    const r = await pi(env, '/payments/' + encodeURIComponent(pid));
    if (!r.ok) return out({ approved: false, error: 'Pi could not confirm this payment' });
    const pay = await r.json(), md = pay.metadata || {}, st = pay.status || {}, amt = Number(pay.amount);
    if (st.developer_approved) return out({ approved: true, step: 'already_approved' });
    if (st.cancelled || st.user_cancelled) return out({ approved: false, error: 'This payment was cancelled' });
    if (!PRICES[md.type] || amt + 1e-9 < PRICES[md.type] || amt > 1000) { await pi(env, '/payments/' + encodeURIComponent(pid) + '/cancel', 'POST').catch(() => {}); return out({ approved: false, error: 'This payment is not valid' }); }
    const a = await pi(env, '/payments/' + encodeURIComponent(pid) + '/approve', 'POST');
    return out({ approved: a.ok, pi_status: a.status });
  } catch (e) { return out({ approved: false, error: 'Could not check this payment. Please try again.' }); }
}
export async function onRequestOptions() { return new Response(null, { status: 204, headers: cors }); }
