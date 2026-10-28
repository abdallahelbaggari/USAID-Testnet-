/* GrowthBridge — learn sustainable development, take action, earn certificates. Pi sign-in and optional Pi support.
   Everything you learn is saved on this phone. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var K = 'gb_v1_';
  function get(k, d) { try { var v = localStorage.getItem(K + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(K + k, JSON.stringify(v)); } catch (e) {} }
  function esc(x) { return String(x == null ? '' : x).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var TEST = /(^|[.-])testnet[.-]/i.test(location.hostname), NETN = TEST ? 'Pi Testnet' : 'Pi Mainnet';
  var SANDBOX = (function () { try { var r = document.referrer || '', a = location.ancestorOrigins ? [].slice.call(location.ancestorOrigins).join(' ') : ''; return /sandbox\.minepi\.com/.test(r + ' ' + a); } catch (e) { return false; } })();
  var SUPPORT = 'growthbridge.app@gmail.com';
  var G = window.GB_GOALS || [], ACTS = window.GB_ACTIONS || [], TERMS = window.GB_TERMS || [];
  var S = { user: null, token: null, tab: 'home' };
  var me = function () { return S.user && S.user.username || ''; };
  var signedIn = function () { return !!(S.user && S.token); };
  var P = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    chev: '<polyline points="9 18 15 12 9 6"/>', check: '<polyline points="20 6 9 17 4 12"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    down: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'
  };
  function ic(n, st) { return '<svg class="ic" viewBox="0 0 24 24"' + (st ? ' style="' + st + '"' : '') + ' aria-hidden="true">' + (P[n] || '') + '</svg>'; }
  var tT = null;
  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tT); tT = setTimeout(function () { t.classList.remove('on'); }, 3000); }
  function sheet(title, body, o) {
    o = o || {}; if (!o.stack) closeSheets();
    var w = document.createElement('div'); w.className = 'sh-wrap';
    w.innerHTML = '<div class="sh' + (o.full ? ' full' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="sh-h"><h2>' + esc(title) + '</h2><button type="button" class="sh-x" aria-label="Close">' + ic('x') + '</button></div>' + body + '</div>';
    w.addEventListener('click', function (e) { if (e.target === w || e.target.closest('.sh-x')) { w.remove(); if (o.onClose) o.onClose(); } });
    document.body.appendChild(w); return w;
  }
  function closeSheets() { $$('.sh-wrap').forEach(function (x) { x.remove(); }); }
  function vv() { var v = window.visualViewport; document.documentElement.style.setProperty('--vvh', (v ? v.height : innerHeight) + 'px'); }
  if (window.visualViewport) visualViewport.addEventListener('resize', vv); addEventListener('resize', vv); vv();
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheets(); });
  function api(path, body) { return fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { cache: 'no-store' }).then(function (r) { return r.json(); }); }

  /* ── progress ── */
  function prog() { return get('prog', {}); }
  function gstate(n) { var p = prog()[n] || {}; return p.pass ? 'done' : p.read ? 'read' : ''; }
  function passed() { var p = prog(); return G.filter(function (g) { return p[g.n] && p[g.n].pass; }).length; }
  function markRead(n) { var p = prog(); p[n] = p[n] || {}; if (!p[n].read) { p[n].read = Date.now(); put('prog', p); } }
  function nextGoal() { var p = prog(); return G.filter(function (g) { return !(p[g.n] && p[g.n].pass); })[0] || null; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dayKey(off) { var d = new Date(); d.setDate(d.getDate() + off); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function acts() { return get('acts', {}); }
  function streak() { var A = acts(), s = 0, off = (A[today()] || []).length ? 0 : -1; while ((A[dayKey(off)] || []).length) { s++; off--; } return s; }
  function totalActs() { var A = acts(); return Object.keys(A).reduce(function (t, k) { return t + (A[k] || []).length; }, 0); }
  function ring(pct, size, col, track) {
    var r = (size - 10) / 2, c = 2 * Math.PI * r, o = c * (1 - pct);
    return '<svg class="ring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + track + '" stroke-width="9"/><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + o.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-family="Poppins,sans-serif" font-weight="700" font-size="' + (size / 4.6) + '">' + Math.round(pct * 100) + '%</text></svg>';
  }
  var BADGES = [
    { id: 'first', t: 'First goal', ic: '🌱', ok: function () { return passed() >= 1; } },
    { id: 'five', t: '5 goals', ic: '🌿', ok: function () { return passed() >= 5; } },
    { id: 'ten', t: '10 goals', ic: '🌳', ok: function () { return passed() >= 10; } },
    { id: 'all', t: 'All 17', ic: '🏆', ok: function () { return passed() >= 17; } },
    { id: 'act1', t: 'First action', ic: '✅', ok: function () { return totalActs() >= 1; } },
    { id: 'st7', t: '7-day streak', ic: '🔥', ok: function () { return streak() >= 7; } },
    { id: 'act50', t: '50 actions', ic: '💪', ok: function () { return totalActs() >= 50; } },
    { id: 'sup', t: 'Supporter', ic: '💚', ok: function () { return !!get('supporter', false); } }
  ];

  /* ── lessons & quiz ── */
  function lesson(n) {
    var g = G.filter(function (x) { return x.n === n; })[0]; if (!g) return;
    markRead(n);
    var st = gstate(n);
    var w = sheet('Goal ' + g.n, '<div class="lesson"><div class="lesson-h"><div class="gi">' + g.ic + '</div><small>GOAL ' + g.n + ' OF 17</small><h3>' + esc(g.t) + '</h3><p>' + esc(g.s) + '</p></div>' +
      '<p class="lead">' + esc(g.intro) + '</p>' +
      '<h4>Key ideas</h4><div class="pts">' + g.ideas.map(function (x, i) { return '<div><span>' + (i + 1) + '</span>' + esc(x) + '</div>'; }).join('') + '</div>' +
      '<h4>What you can do</h4><div class="pts act">' + g.actions.map(function (x) { return '<div><span>✓</span>' + esc(x) + '</div>'; }).join('') + '</div>' +
      (st === 'done' ? '<div class="note" style="margin-top:16px">' + ic('check') + '<span>You passed this goal’s quiz. Well done!</span></div><button type="button" class="btn" data-x="cert">🎓 View certificate</button><button type="button" class="btn ghost" data-x="quiz">Take the quiz again</button>'
        : '<button type="button" class="btn" data-x="quiz">Take the quiz · 3 questions</button>') + '</div>', { full: true });
    $('[data-x="quiz"]', w).onclick = function () { quiz(g); };
    var cb = $('[data-x="cert"]', w); if (cb) cb.onclick = function () { certSheet({ goal: g }); };
    render(S.tab);
  }
  function quiz(g) {
    var i = 0, score = 0, Q = g.quiz;
    var w = sheet('Quiz · ' + g.t, '<div id="qz"></div>', { full: true });
    function show() {
      var q = Q[i];
      $('#qz', w).innerHTML = '<div class="qz-p"><i style="width:' + (i / Q.length * 100) + '%"></i></div><p class="small" style="color:var(--mute);font-size:13px;margin-bottom:6px">Question ' + (i + 1) + ' of ' + Q.length + '</p><div class="qz-q">' + esc(q.q) + '</div>' +
        q.o.map(function (o, k) { return '<button type="button" class="opt" data-k="' + k + '">' + esc(o) + '</button>'; }).join('') + '<div id="qz-f"></div>';
      $$('.opt', w).forEach(function (b) { b.onclick = function () {
        var k = +b.dataset.k, ok = k === q.a; if (ok) score++;
        $$('.opt', w).forEach(function (x) { x.disabled = true; if (+x.dataset.k === q.a) x.classList.add('ok'); else if (x === b) x.classList.add('no'); });
        $('#qz-f', w).innerHTML = '<div class="qz-e"><b>' + (ok ? 'Correct! ' : 'Not quite. ') + '</b>' + esc(q.e) + '</div><button type="button" class="btn" id="qz-n">' + (i < Q.length - 1 ? 'Next question' : 'See result') + '</button>';
        $('#qz-n', w).onclick = function () { i++; if (i < Q.length) show(); else done(); };
      }; });
    }
    function done() {
      var pass = score >= 2, p = prog(); p[g.n] = p[g.n] || {}; p[g.n].read = p[g.n].read || Date.now();
      if (pass) { if (!p[g.n].pass) p[g.n].pass = Date.now(); p[g.n].best = Math.max(p[g.n].best || 0, score); }
      put('prog', p);
      var all = passed() >= 17;
      $('#qz', w).innerHTML = '<div class="qz-p"><i style="width:100%"></i></div><div class="res"><div class="big">' + (pass ? (all ? '🏆' : '🎉') : '📘') + '</div><h3>' + score + ' of ' + Q.length + ' correct</h3><p>' + (pass ? (all ? 'You have completed all 17 goals!' : 'You passed Goal ' + g.n + '. ' + passed() + ' of 17 goals complete.') : 'You need 2 correct answers to pass. Review the lesson and try again.') + '</p></div>' +
        (pass ? '<button type="button" class="btn" data-x="cert">🎓 Get your certificate</button>' + (all ? '<button type="button" class="btn gold" data-x="full">🏆 Full course certificate</button>' : '') : '<button type="button" class="btn" data-x="again">Try again</button><button type="button" class="btn ghost" data-x="read">Review the lesson</button>') +
        (pass && nextGoal() ? '<button type="button" class="btn ghost" data-x="next">Next: Goal ' + nextGoal().n + ' · ' + esc(nextGoal().t) + '</button>' : '');
      var b;
      if ((b = $('[data-x="cert"]', w))) b.onclick = function () { certSheet({ goal: g }); };
      if ((b = $('[data-x="full"]', w))) b.onclick = function () { certSheet({ full: true }); };
      if ((b = $('[data-x="again"]', w))) b.onclick = function () { quiz(g); };
      if ((b = $('[data-x="read"]', w))) b.onclick = function () { lesson(g.n); };
      if ((b = $('[data-x="next"]', w))) b.onclick = function () { lesson(nextGoal().n); };
      render(S.tab);
    }
    show();
  }

  /* ── certificates (image, share or download) ── */
  function certName() { return get('name', '') || (me() ? '@' + me() : ''); }
  function certId(o) { var s = (me() || 'guest') + '|' + (o.full ? 'all' : o.goal.n) + '|' + (o.when || 0), h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return 'GB-' + (h >>> 0).toString(36).toUpperCase().padStart(7, '0'); }
  function drawCert(o) {
    return Promise.resolve(document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1500); })]) : null).then(function () {
      return new Promise(function (ok) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ok(null); }; im.src = 'icons/icon-192.png'; });
    }).then(function (logo) {
      var W = 1600, H = 1130, cv = document.createElement('canvas'); cv.width = W; cv.height = H; var x = cv.getContext('2d'), F = "Poppins,'Segoe UI',Roboto,Arial,sans-serif";
      x.fillStyle = '#FBFDFC'; x.fillRect(0, 0, W, H);
      var g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#064E3B'); g.addColorStop(.6, '#047857'); g.addColorStop(1, '#0F766E');
      x.fillStyle = 'rgba(16,185,129,.07)'; x.beginPath(); x.arc(W - 120, 140, 260, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(120, H - 120, 220, 0, Math.PI * 2); x.fill();
      x.strokeStyle = g; x.lineWidth = 26; x.strokeRect(13, 13, W - 26, H - 26); x.strokeStyle = '#D1FAE5'; x.lineWidth = 3; x.strokeRect(52, 52, W - 104, H - 104);
      x.textAlign = 'center';
      if (logo) x.drawImage(logo, W / 2 - 52, 100, 104, 104);
      x.fillStyle = '#047857'; x.font = '700 30px ' + F; x.fillText('GROWTHBRIDGE', W / 2, 250);
      x.fillStyle = '#0B2B22'; x.font = '700 70px ' + F; x.fillText('Certificate of Learning', W / 2, 345);
      x.fillStyle = '#64748B'; x.font = '400 28px ' + F; x.fillText('This certifies that', W / 2, 420);
      var nm = certName() || 'GrowthBridge learner'; x.fillStyle = '#047857'; var fs = 72; x.font = '700 ' + fs + 'px ' + F; while (x.measureText(nm).width > W - 300 && fs > 36) { fs -= 4; x.font = '700 ' + fs + 'px ' + F; } x.fillText(nm, W / 2, 515);
      x.fillStyle = '#D1FAE5'; x.fillRect(W / 2 - 300, 545, 600, 3);
      x.fillStyle = '#2D4A40'; x.font = '400 30px ' + F;
      if (o.full) { x.fillText('has successfully completed the full GrowthBridge course on', W / 2, 615); x.fillStyle = '#0B2B22'; x.font = '700 40px ' + F; x.fillText('All 17 Sustainable Development Goals', W / 2, 675); }
      else { x.fillText('has successfully completed the lesson and quiz on', W / 2, 615); x.fillStyle = '#0B2B22'; x.font = '700 44px ' + F; x.fillText('Goal ' + o.goal.n + ': ' + o.goal.t, W / 2, 680); }
      var d = new Date(o.when || Date.now());
      x.font = '400 24px ' + F; x.fillStyle = '#64748B';
      x.fillText('Completed on ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '   ·   Certificate ID ' + certId(o), W / 2, 790);
      x.fillStyle = '#047857'; x.font = '600 26px ' + F; x.fillText('Learn · Act · Grow', W / 2, 900);
      x.fillStyle = '#94A3B8'; x.font = '400 20px ' + F; x.fillText('GrowthBridge is an independent learning app on Pi. This is not an official United Nations certification.', W / 2, 1010);
      return cv;
    });
  }
  function certSheet(o) {
    var p = prog();
    o.when = o.full ? Math.max.apply(null, G.map(function (g) { return (p[g.n] && p[g.n].pass) || 0; })) : ((p[o.goal.n] || {}).pass || Date.now());
    var w = sheet('Your certificate', (certName() ? '' : '<div class="note gray">' + ic('info') + '<span>Add your name so it appears on your certificates. <button type="button" class="lnk" data-x="nm">Add name</button></span></div>') +
      '<div id="ct-i" class="empty">Preparing your certificate…</div><div class="two"><button type="button" class="btn" data-x="sh">' + ic('share') + 'Share</button><button type="button" class="btn ghost" data-x="dl">' + ic('down') + 'Download</button></div>' +
      '<p style="text-align:center;color:var(--mute);font-size:12.5px;margin-top:10px">Tip: press and hold the image to save it.</p>', { stack: true });
    var nb = $('[data-x="nm"]', w); if (nb) nb.onclick = function () { nameSheet(function () { w.remove(); certSheet(o); }); };
    var cvP = drawCert(o), fname = 'GrowthBridge-certificate-' + (o.full ? 'all-goals' : 'goal-' + o.goal.n) + '.jpg';
    var text = (certName() || 'I') + ' completed ' + (o.full ? 'all 17 Sustainable Development Goals' : 'Goal ' + o.goal.n + ': ' + o.goal.t) + ' on GrowthBridge 🌱';
    cvP.then(function (cv) { var e = $('#ct-i', w); if (e) { e.className = ''; e.innerHTML = '<img class="rc-img" alt="Certificate" src="' + cv.toDataURL('image/jpeg', .9) + '">'; } });
    $('[data-x="sh"]', w).onclick = function () { cvP.then(function (cv) { cv.toBlob(function (b) {
      try { var f = new File([b], fname, { type: 'image/jpeg' }); if (navigator.canShare && navigator.canShare({ files: [f] })) return navigator.share({ files: [f], title: 'GrowthBridge certificate', text: text }).catch(function () {}); } catch (e) {}
      if (navigator.share) navigator.share({ title: 'GrowthBridge', text: text }).catch(function () {}); else dl(b);
    }, 'image/jpeg', .92); }); };
    function dl(b) { var u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = fname; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 8000); toast('Certificate saved'); }
    $('[data-x="dl"]', w).onclick = function () { cvP.then(function (cv) { cv.toBlob(dl, 'image/jpeg', .92); }); };
  }
  function nameSheet(after) {
    var w = sheet('Name on certificates', '<p class="sh-sub">Shown on your certificates. Saved on this phone only.</p><input class="in" id="nm-i" maxlength="48" placeholder="Your full name" value="' + esc(get('name', '')) + '"><button type="button" class="btn" id="nm-go">Save</button>', { stack: true });
    $('#nm-go', w).onclick = function () { put('name', $('#nm-i', w).value.trim()); w.remove(); toast('Saved'); render(S.tab); if (after) after(); };
    setTimeout(function () { $('#nm-i', w).focus(); }, 120);
  }

  /* ── views ── */
  function hour() { var h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
  function goalCard(g) { var s = gstate(g.n); return '<button type="button" class="goal ' + s + '" data-goal="' + g.n + '"><span class="gi">' + g.ic + '</span><span class="gn">GOAL ' + g.n + '</span><b>' + esc(g.t) + '</b><span class="st">' + (s === 'done' ? '✓ Completed' : s === 'read' ? 'Quiz waiting' : 'Start') + '</span></button>'; }
  var T = {
    home: function () {
      var n = passed(), nx = nextGoal(), td = (acts()[today()] || []).length, dg = G[(Math.floor(Date.now() / 86400000)) % G.length];
      return '<div class="hello"><h1>' + hour() + (signedIn() ? ', @' + esc(me()) : '') + '</h1><p>Learn a little, act a little, every day.</p></div>' +
        '<div class="hero">' + ring(n / 17, 96, '#FCD34D', 'rgba(255,255,255,.2)') + '<div><b>' + n + ' of 17 goals</b><small>' + (n >= 17 ? 'Course complete. Amazing work!' : nx ? 'Next: Goal ' + nx.n + ' · ' + esc(nx.t) : '') + '</small>' + (nx ? '<button type="button" class="btn" data-goal="' + nx.n + '">' + (n ? 'Continue learning' : 'Start learning') + '</button>' : '<button type="button" class="btn" data-act="cert-all">🏆 Your certificate</button>') + '</div></div>' +
        '<div class="sec"><h2>Today</h2><button type="button" data-tab="act">Act</button></div>' +
        '<div class="card"><div class="stats" style="margin-top:0"><div><small>Actions today</small><b>' + td + '</b></div><div><small>Day streak</small><b>' + streak() + ' 🔥</b></div><div><small>Total actions</small><b>' + totalActs() + '</b></div></div></div>' +
        '<div class="sec"><h2>Goal of the day</h2></div>' +
        '<button type="button" class="card" data-goal="' + dg.n + '" style="display:flex;gap:14px;align-items:center;width:100%;text-align:left"><span style="font-size:34px">' + dg.ic + '</span><span style="flex:1;min-width:0"><small style="color:var(--mute);font-weight:600;font-size:12px">GOAL ' + dg.n + '</small><b style="display:block;font-size:16px">' + esc(dg.t) + '</b><span style="color:var(--ink2);font-size:13.5px">' + esc(dg.s) + '</span></span><span style="color:#A3B0C2">' + ic('chev') + '</span></button>' +
        '<div class="sec"><h2>Explore</h2></div><div class="tiles">' +
        '<button type="button" class="tile" data-tab="learn"><i>📚</i><b>All 17 goals</b><small>Short lessons and quizzes</small></button>' +
        '<button type="button" class="tile" data-act="terms"><i>🔤</i><b>Glossary</b><small>Key words explained simply</small></button>' +
        '<button type="button" class="tile" data-tab="act"><i>🌱</i><b>Daily actions</b><small>Small steps, real impact</small></button>' +
        '<button type="button" class="tile" data-act="certs"><i>🎓</i><b>Certificates</b><small>Share what you learned</small></button></div>';
    },
    learn: function () {
      var q = (S.q || '').toLowerCase();
      var L = G.filter(function (g) { return !q || (g.t + ' ' + g.s + ' ' + g.n).toLowerCase().indexOf(q) >= 0; });
      return '<div class="ph"><h1>Learn</h1><p>The 17 Sustainable Development Goals, one short lesson each.</p></div>' +
        '<div class="search">' + ic('search', 'color:var(--mute)') + '<input id="lq" placeholder="Search goals" value="' + esc(S.q || '') + '" autocomplete="off"></div>' +
        (L.length ? '<div class="goals">' + L.map(goalCard).join('') + '</div>' : '<div class="list"><div class="empty">No goal matches your search.</div></div>');
    },
    act: function () {
      var A = acts(), td = A[today()] || [], days = [];
      for (var k = -6; k <= 0; k++) days.push({ k: k, n: (A[dayKey(k)] || []).length, l: new Date(Date.now() + k * 86400000).toLocaleDateString('en-GB', { weekday: 'short' }).slice(0, 2) });
      var mx = Math.max(3, Math.max.apply(null, days.map(function (d) { return d.n; })));
      return '<div class="ph"><h1>Act</h1><p>Tick what you did today. Small steps add up.</p></div>' +
        '<div class="card"><div class="stats" style="margin-top:0"><div><small>Today</small><b>' + td.length + '</b></div><div><small>Streak</small><b>' + streak() + ' 🔥</b></div><div><small>All time</small><b>' + totalActs() + '</b></div></div>' +
        '<div class="bars">' + days.map(function (d) { return '<div><i style="height:' + Math.max(4, d.n / mx * 100) + '%;' + (d.k ? 'opacity:.55' : '') + '"></i><small>' + d.l + '</small></div>'; }).join('') + '</div></div>' +
        '<div class="sec"><h2>Today’s actions</h2></div><div class="list">' + ACTS.map(function (a) { var on = td.indexOf(a.id) >= 0; return '<button type="button" class="li' + (on ? ' on' : '') + '" data-a="' + a.id + '"><span class="ico">' + a.ic + '</span><span class="grow"><b>' + esc(a.t) + '</b><small>Goal ' + a.g + ' · ' + esc(G[a.g - 1].t) + '</small></span><span class="chk">' + ic('check', 'width:16px;height:16px') + '</span></button>'; }).join('') + '</div>' +
        '<div class="note gray" style="margin-top:14px">' + ic('info') + '<span>Your actions are saved on this phone and are for your own motivation.</span></div>';
    },
    me: function () {
      var n = passed(), sup = get('supporter', false);
      return '<div class="pcard"><div class="avatar">' + esc(signedIn() ? me().charAt(0) : 'G') + '</div><div><b>' + (signedIn() ? '@' + esc(me()) : 'Guest') + '</b><small>' + (get('name', '') ? esc(get('name', '')) + ' · ' : '') + n + ' of 17 goals · ' + NETN + '</small></div></div>' +
        (!signedIn() ? '<button type="button" class="btn" data-act="signin" style="margin-top:14px"><span class="pi-dot">π</span>Sign in with Pi</button>' : '') +
        '<div class="sec"><h2>Badges</h2></div><div class="badges">' + BADGES.map(function (b) { return '<div class="badge' + (b.ok() ? '' : ' off') + '"><span>' + b.ic + '</span><small>' + b.t + '</small></div>'; }).join('') + '</div>' +
        '<div class="sec"><h2>Certificates</h2></div>' + certList() +
        '<div class="sec"><h2>Settings</h2></div><div class="list">' + row('✏️', 'Name on certificates', get('name', '') || 'Not set', 'name') + row('🔤', 'Glossary', 'Key words explained', 'terms') + row('👋', 'Welcome tour', 'See how GrowthBridge works', 'tour') + '</div>' +
        '<div class="sec"><h2>Support</h2></div><div class="list">' + row('💚', sup ? 'You are a Supporter' : 'Support GrowthBridge', sup ? 'Thank you!' : '1 π · badge only, no reward', 'support') + row('✉️', 'Help & contact', SUPPORT, 'help') + '</div>' +
        '<div class="sec"><h2>Legal</h2></div><div class="list"><a class="li" href="terms-of-service.html"><span class="ico">📄</span><span class="grow"><b>Terms of Service</b></span><span class="go">' + ic('chev') + '</span></a><a class="li" href="privacy-policy.html"><span class="ico">🔒</span><span class="grow"><b>Privacy Policy</b></span><span class="go">' + ic('chev') + '</span></a></div>' +
        (signedIn() ? '<button type="button" class="btn danger" data-act="signout" style="margin-top:18px">' + ic('out') + 'Sign out</button>' : '') +
        '<p style="text-align:center;color:var(--mute);font-size:12.5px;margin-top:16px">GrowthBridge 1.0.0 · ' + NETN + '<br>Independent learning app. Not affiliated with the United Nations or any government.</p>';
      function row(i, t, s, a) { return '<button type="button" class="li" data-act="' + a + '"><span class="ico">' + i + '</span><span class="grow"><b>' + esc(t) + '</b><small>' + esc(s) + '</small></span><span class="go">' + ic('chev') + '</span></button>'; }
    }
  };
  function certList() {
    var p = prog(), L = G.filter(function (g) { return p[g.n] && p[g.n].pass; });
    if (!L.length) return '<div class="list"><div class="empty">Pass a goal’s quiz to earn your first certificate.</div></div>';
    return '<div class="list">' + (L.length >= 17 ? '<button type="button" class="li" data-act="cert-all"><span class="ico">🏆</span><span class="grow"><b>Full course: all 17 goals</b><small>Your complete certificate</small></span><span class="go">' + ic('chev') + '</span></button>' : '') +
      L.map(function (g) { return '<button type="button" class="li" data-cert="' + g.n + '"><span class="ico">🎓</span><span class="grow"><b>Goal ' + g.n + ': ' + esc(g.t) + '</b><small>' + new Date(p[g.n].pass).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + '</small></span><span class="go">' + ic('chev') + '</span></button>'; }).join('') + '</div>';
  }
  function render(tab) {
    S.tab = tab; var v = $('#view'); if (!v) return;
    v.innerHTML = T[tab]();
    $$('#tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === tab); });
    var lq = $('#lq'); if (lq) lq.oninput = function () { S.q = lq.value; var pos = lq.selectionStart; render('learn'); var n = $('#lq'); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} };
  }
  function go(tab) { closeSheets(); render(tab); scrollTo(0, 0); }

  /* ── Pi ── */
  var piReady = false;
  function initPi() { if (piReady || !window.Pi) return !!window.Pi; try { Pi.init({ version: '2.0', sandbox: SANDBOX }); piReady = true; } catch (e) {} return piReady; }
  function onIncomplete(p) { if (p && p.identifier) api('/complete', { paymentId: p.identifier, txid: p.transaction && p.transaction.txid }).catch(function () {}); }
  function signIn(silent) {
    var btn = $('#signin'), msg = $('#ld-msg');
    if (!window.Pi || !initPi()) { if (!silent) msg.textContent = 'Open GrowthBridge in the Pi Browser to sign in with Pi.'; return Promise.resolve(false); }
    if (btn && !silent) { btn.disabled = true; $('#signin-t').textContent = 'Signing in…'; }
    return Pi.authenticate(['username', 'payments'], onIncomplete).then(function (a) {
      S.user = { username: a.user.username }; S.token = a.accessToken; put('user', { username: a.user.username }); showApp(); return true;
    }).catch(function () { if (!silent) msg.textContent = 'Sign-in was cancelled or failed. Please try again.'; return false; })
      .then(function (r) { if (btn) { btn.disabled = false; $('#signin-t').textContent = 'Sign in with Pi'; } return r; });
  }
  function showApp() { $('#landing').hidden = true; $('#app').hidden = false; $('#av').textContent = signedIn() ? me().charAt(0) : 'G'; $('#netb').hidden = !TEST; render(S.tab); }
  function support() {
    if (get('supporter', false)) return toast('You are already a Supporter. Thank you!');
    if (!signedIn()) { toast('Sign in with Pi first'); return; }
    var w = sheet('Support GrowthBridge', '<div class="lesson-h" style="text-align:center"><div class="gi">💚</div><h3>1 π</h3><p>Supporter badge</p></div><p class="sh-sub">Help keep GrowthBridge free for every learner. You get a Supporter badge on your profile. It gives no reward or financial return.</p><button type="button" class="btn" id="sp-go">' + ic('heart') + 'Support with 1 π</button>');
    $('#sp-go', w).onclick = function () {
      if (!window.Pi || !initPi()) return toast('Open GrowthBridge in the Pi Browser to pay');
      var b = this; b.disabled = true; b.textContent = 'Waiting for Pi…';
      var reset = function (m) { b.disabled = false; b.innerHTML = ic('heart') + 'Support with 1 π'; if (m) toast(m); };
      try {
        Pi.createPayment({ amount: 1, memo: 'GrowthBridge Supporter badge', metadata: { type: 'supporter' } }, {
          onReadyForServerApproval: function (pid) { api('/approve', { paymentId: pid }).then(function (d) { if (d && d.approved === false) reset(d.error || 'Payment refused. You were not charged.'); }).catch(function () {}); },
          onReadyForServerCompletion: function (pid, txid) { api('/complete', { paymentId: pid, txid: txid }).then(function () { put('supporter', true); closeSheets(); render(S.tab); toast('Thank you for supporting GrowthBridge!'); }).catch(function () { reset('Connection problem. It will finish when you reopen the app.'); }); },
          onCancel: function () { reset('Payment cancelled'); }, onError: function () { reset('Payment error. Nothing was charged.'); }
        });
      } catch (e) { reset('Payment error'); }
    };
  }

  /* ── welcome screens ── */
  var ONB = [
    { t: 'Learn the 17 goals', p: 'Short, clear lessons on the Sustainable Development Goals, from ending poverty to climate action.', img: '<svg viewBox="0 0 320 220"><circle cx="160" cy="110" r="100" fill="#E7F7EF"/><rect x="70" y="50" width="180" height="130" rx="18" fill="#fff" stroke="#BDE8D3" stroke-width="3"/><rect x="88" y="70" width="70" height="12" rx="6" fill="#047857"/><rect x="88" y="94" width="140" height="9" rx="4.5" fill="#CFE5DA"/><rect x="88" y="112" width="120" height="9" rx="4.5" fill="#E2EEE8"/><rect x="88" y="130" width="130" height="9" rx="4.5" fill="#E2EEE8"/><circle cx="250" cy="62" r="26" fill="#FCD34D"/><text x="250" y="72" text-anchor="middle" font-size="26">📘</text><circle cx="72" cy="168" r="22" fill="#10B981"/><text x="72" y="176" text-anchor="middle" font-size="20">🌍</text></svg>' },
    { t: 'Take small actions', p: 'Tick the sustainable things you do each day, build a streak and see your impact grow.', img: '<svg viewBox="0 0 320 220"><circle cx="160" cy="110" r="100" fill="#E6F4F1"/><g font-family="Poppins,Arial" font-size="15" font-weight="600"><rect x="70" y="52" width="180" height="38" rx="12" fill="#fff" stroke="#BDE8D3" stroke-width="2"/><circle cx="92" cy="71" r="11" fill="#047857"/><path d="M87 71l4 4 7-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><text x="112" y="76" fill="#0B2B22">Saved water</text><rect x="70" y="98" width="180" height="38" rx="12" fill="#fff" stroke="#BDE8D3" stroke-width="2"/><circle cx="92" cy="117" r="11" fill="#047857"/><path d="M87 117l4 4 7-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><text x="112" y="122" fill="#0B2B22">Bought local</text><rect x="70" y="144" width="180" height="38" rx="12" fill="#fff" stroke="#E2EEE8" stroke-width="2"/><circle cx="92" cy="163" r="11" fill="none" stroke="#CBD5E1" stroke-width="3"/><text x="112" y="168" fill="#64748B">Planted a tree</text></g><text x="262" y="56" font-size="34">🔥</text></svg>' },
    { t: 'Earn certificates', p: 'Pass each quiz to earn a certificate you can share. Complete all 17 for the full course certificate.', img: '<svg viewBox="0 0 320 220"><circle cx="160" cy="110" r="100" fill="#FEF7E6"/><rect x="58" y="56" width="204" height="130" rx="10" fill="#fff" stroke="#047857" stroke-width="5"/><rect x="70" y="68" width="180" height="106" rx="6" fill="none" stroke="#D1FAE5" stroke-width="2"/><rect x="110" y="86" width="100" height="10" rx="5" fill="#047857"/><rect x="96" y="108" width="128" height="14" rx="7" fill="#0B2B22"/><rect x="120" y="132" width="80" height="8" rx="4" fill="#CBD5E1"/><circle cx="236" cy="168" r="26" fill="#F59E0B"/><text x="236" y="177" text-anchor="middle" font-size="24">🏆</text></svg>' }
  ];
  function onboarding(force) {
    if (!force && get('onb', false)) return;
    var i = 0, o = document.createElement('div'); o.id = 'onb'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Welcome to GrowthBridge');
    function draw() { var s = ONB[i], last = i === ONB.length - 1;
      o.innerHTML = '<div class="onb-top"><div class="brand"><img src="icons/icon-192.png" alt="">GrowthBridge</div>' + (last ? '' : '<button type="button" class="onb-skip" data-o="skip">Skip</button>') + '</div><div class="onb-img">' + s.img + '</div><div class="onb-txt"><h2>' + esc(s.t) + '</h2><p>' + esc(s.p) + '</p></div><div class="onb-dots">' + ONB.map(function (x, k) { return '<i class="' + (k === i ? 'on' : '') + '"></i>'; }).join('') + '</div><div class="onb-b"><button type="button" class="btn" data-o="next">' + (last ? 'Get started' : 'Next') + '</button></div>'; }
    o.addEventListener('click', function (e) { var b = e.target.closest('[data-o]'); if (!b) return; if (b.dataset.o === 'skip' || i === ONB.length - 1) { put('onb', true); o.remove(); return; } i++; draw(); });
    var sx = null; o.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    o.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) < 50) return; if (dx < 0 && i < ONB.length - 1) i++; else if (dx > 0 && i > 0) i--; else return; draw(); });
    draw(); document.body.appendChild(o);
  }

  /* ── actions ── */
  var A = {
    signin: function () { signIn(); }, name: function () { nameSheet(); }, tour: function () { onboarding(true); }, support: support,
    certs: function () { go('me'); setTimeout(function () { var s = $$('.sec h2').filter(function (h) { return h.textContent === 'Certificates'; })[0]; if (s) s.scrollIntoView({ behavior: 'smooth' }); }, 80); },
    'cert-all': function () { certSheet({ full: true }); },
    terms: function () { sheet('Glossary', '<div class="list">' + TERMS.map(function (t) { return '<div class="term"><b>' + esc(t[0]) + '</b><p>' + esc(t[1]) + '</p></div>'; }).join('') + '</div>'); },
    help: function () { sheet('Help & contact', '<p class="sh-sub">Questions, ideas or a mistake in a lesson? Write to us.</p><a class="btn" href="mailto:' + SUPPORT + '?subject=GrowthBridge">✉️ Email ' + SUPPORT + '</a>'); },
    signout: function () { S.user = null; S.token = null; put('user', null); closeSheets(); $('#app').hidden = true; $('#landing').hidden = false; toast('Signed out'); }
  };
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-tab]'); if (t && !t.closest('.sh-wrap')) { go(t.dataset.tab); return; }
    var g = e.target.closest('[data-goal]'); if (g) { lesson(+g.dataset.goal); return; }
    var c = e.target.closest('[data-cert]'); if (c) { certSheet({ goal: G[+c.dataset.cert - 1] }); return; }
    var a = e.target.closest('[data-a]'); if (a) { var X = acts(), d = today(), L = X[d] || [], id = a.dataset.a, k = L.indexOf(id); if (k >= 0) L.splice(k, 1); else L.push(id); X[d] = L; put('acts', X); var y = scrollY; render('act'); scrollTo(0, y); if (k < 0) toast('Nice! Action added 🌱'); return; }
    var b = e.target.closest('[data-act]'); if (b && A[b.dataset.act]) A[b.dataset.act](b, e);
  });

  function start() {
    if (TEST) $('#ld-net').textContent = 'Pi Testnet';
    $('#signin').onclick = function () { signIn(); };
    $('#explore').onclick = function () { showApp(); };
    onboarding(); initPi();
    var u = get('user', null);
    if (u && u.username && window.Pi) { $('#signin-t').textContent = 'Signing in as @' + u.username + '…'; signIn(true).then(function (ok) { if (!ok) $('#signin-t').textContent = 'Sign in with Pi'; }); }
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
  }
  window.GrowthBridge = { S: S, render: render, lesson: lesson };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
