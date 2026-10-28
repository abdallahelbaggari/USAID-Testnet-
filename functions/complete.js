/* GrowthBridge · /complete — completes a payment with Pi Network once its blockchain transaction exists. Always answers HTTP 200. */
import { out, cors, okId, pi } from './_lib/pi.js';
export async function onRequestPost({ request, env }) {
  let b = {}; try { b = await request.json(); } catch (e) { return out({ completed: false, error: 'Bad request' }); }
  const pid = String(b.paymentId || ''); let txid = String(b.txid || '');
  if (!okId(pid)) return out({ completed: false, error: 'Invalid payment id' });
  if (!env.PI_API_KEY) return out({ completed: false, error: 'Payments are not switched on yet' });
  try {
    const r = await pi(env, '/payments/' + encodeURIComponent(pid)); if (!r.ok) return out({ completed: false, error: 'Payment not found' });
    const pay = await r.json(), st = pay.status || {};
    if (st.developer_completed) return out({ completed: true, step: 'already_completed' });
    if (!txid && pay.transaction && pay.transaction.txid) txid = pay.transaction.txid;
    if (!/^[a-f0-9]{64}$/i.test(txid)) {
      if (!st.transaction_verified && !(pay.transaction && pay.transaction.txid)) { await pi(env, '/payments/' + encodeURIComponent(pid) + '/cancel', 'POST').catch(() => {}); return out({ completed: false, cancelled: true }); }
      return out({ completed: false, error: 'No transaction yet' });
    }
    const c = await pi(env, '/payments/' + encodeURIComponent(pid) + '/complete', 'POST', { txid });
    return out({ completed: c.ok, pi_status: c.status });
  } catch (e) { return out({ completed: false, error: 'Could not complete. It will finish when you reopen the app.' }); }
}
export async function onRequestOptions() { return new Response(null, { status: 204, headers: cors }); }
