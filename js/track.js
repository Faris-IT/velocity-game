// Lintasan dibangun dari data: kurva dasar -> titik berjarak sama (7,57 px) -> lebar, kelengkungan, pulau, zona.
MV.buildTrack = function (def) {
  const SP = 7.57, H = MV.CONFIG.TRACK_HALF, G = MV.CONFIG.GRASS;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), wrap = a => Math.atan2(Math.sin(a), Math.cos(a));

  function resample(poly) {
    const M = poly.length, cum = [0];
    for (let i = 1; i <= M; i++) { const p = poly[i % M], q = poly[i - 1]; cum.push(cum[i - 1] + Math.hypot(p.x - q.x, p.y - q.y)); }
    const L = cum[M], N = Math.round(L / SP), out = []; let j = 0;
    for (let k = 0; k < N; k++) {
      const t = k * L / N;
      while (cum[j + 1] < t) j++;
      const f = (t - cum[j]) / (cum[j + 1] - cum[j]), p = poly[j], q = poly[(j + 1) % M];
      out.push({ x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f });
    }
    return out;
  }
  function frame(pts) {                       // tangen dan kelengkungan bertanda (rad/px; positif = belok ke sisi normal)
    const N = pts.length;
    pts.forEach((p, i) => { const a = pts[(i + N - 1) % N], b = pts[(i + 1) % N], l = Math.hypot(b.x - a.x, b.y - a.y); p.tx = (b.x - a.x) / l; p.ty = (b.y - a.y) / l; });
    const raw = pts.map((p, i) => wrap(Math.atan2(pts[(i + 3) % N].ty, pts[(i + 3) % N].tx) - Math.atan2(pts[(i + N - 3) % N].ty, pts[(i + N - 3) % N].tx)) / (6 * SP));
    return raw.map((_, i) => { let s = 0; for (let k = -2; k <= 2; k++) s += raw[(i + k + N) % N]; return s / 5; });
  }

  // 1. kurva dasar
  const M = 6000, dense = [];
  for (let i = 0; i < M; i++) {
    const t = -i / M * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    if (def.gen === 'polar') dense.push({ x: (def.A + def.A1 * Math.sin(def.k1 * t + def.p1)) * c, y: (def.B + def.B1 * Math.sin(def.k2 * t + def.p2)) * s });
    else dense.push({ x: def.a * Math.sign(c) * Math.pow(Math.abs(c), 2 / def.n), y: def.b * Math.sign(s) * Math.pow(Math.abs(s), 2 / def.n) });
  }
  let pts = resample(dense), kap = frame(pts), N = pts.length;

  // 2. chicane: gelombang lateral hanya pada bagian lurus
  if (def.gen === 'chicane') {
    const moved = pts.map((p, i) => {
      const mask = clamp(1 - Math.abs(kap[i]) / 0.0011, 0, 1), d = def.amp * Math.sin(2 * Math.PI * def.waves * i / N) * mask * mask;
      return { x: p.x - p.ty * d, y: p.y + p.tx * d };
    });
    pts = resample(moved); kap = frame(pts); N = pts.length;
  }

  // 3. titik start otomatis di bagian paling lurus, lalu putar agar kendaraan menghadap ke atas
  if (def.gen !== 'super' || def.split) {
    let best = 0, bs = 1e9;
    for (let i = 0; i < N; i++) { let s = 0; for (let k = -25; k <= 25; k++) s += Math.abs(kap[(i + k + N) % N]); if (s < bs) { bs = s; best = i; } }
    pts = pts.map((_, i) => pts[(i + best) % N]); kap = kap.map((_, i) => kap[(i + best) % N]);
    const rot = -Math.PI / 2 - Math.atan2(pts[0].ty, pts[0].tx), c = Math.cos(rot), s = Math.sin(rot);
    pts = pts.map(p => ({ x: p.x * c - p.y * s, y: p.x * s + p.y * c }));
    kap = frame(pts);
  }

  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9, length = 0;
  pts.forEach((p, i) => {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    length += Math.hypot(pts[(i + 1) % N].x - p.x, pts[(i + 1) % N].y - p.y);
  });

  // sisi dalam tikungan (+1 jika sisi normal positif)
  const insideSign = i => { let s = 0; for (let k = -20; k <= 20; k++) s += kap[(i + k + N) % N]; return s >= 0 ? 1 : -1; };

  // 4. lebar lintasan, pulau (percabangan)
  const hw = new Array(N).fill(H), lane = new Array(N).fill(0), islands = [];
  let splitAt = -1;
  if (def.split) {
    const sp = def.split, c0 = Math.round(sp.near * N);
    let c = c0, bk = -1;
    for (let k = -Math.round(0.1 * N); k <= Math.round(0.1 * N); k++) { const i = (c0 + k + N) % N, a = Math.abs(kap[i]); if (a > bk) { bk = a; c = i; } }
    splitAt = c;
    const half = sp.len * N / 2, sm = x => x * x * (3 - 2 * x);
    for (let k = -Math.ceil(half); k <= Math.ceil(half); k++) {
      const t = Math.abs(k) / half, w = t < 0.5 ? 1 : 1 - sm(clamp((t - 0.5) / 0.5, 0, 1));
      hw[(c + k + N) % N] = H + (sp.to - H) * w;
      lane[(c + k + N) % N] = -insideSign(c) * 100 * w;          // jalur luar yang lebar (jalur dalam: sempit tapi lebih pendek)
    }
    const side = insideSign(c), chain = Math.floor(half * 0.5);
    for (let k = -chain; k <= chain; k += 5) {
      const p = pts[(c + k + N) % N], d = side * sp.lat;
      islands.push({ x: p.x - p.ty * d, y: p.y + p.tx * d, r: sp.r });
    }
  }

  // 5. zona pengisian energi: dua bagian paling lurus
  let zones;
  if (def.zones) zones = def.zones.map(z => [Math.round(z[0] * N), Math.round(z[1] * N)]);
  else {
    const W = Math.round(0.085 * N), score = [];
    for (let i = 0; i < N; i++) { let s = 0; for (let k = 0; k < W; k++) s += Math.abs(kap[(i + k) % N]); if (splitAt >= 0 && Math.min((i - splitAt + N) % N, (splitAt - i + N) % N) < 0.2 * N) s += 9; score.push(s); }
    const pick = ex => { let b = -1, v = 1e9; for (let i = 0; i < N; i++) { if (ex !== undefined && Math.min((i - ex + N) % N, (ex - i + N) % N) < 0.25 * N) continue; if (score[i] < v) { v = score[i]; b = i; } } return b; };
    const a = pick(), b = pick(a); zones = [[a, a + W], [b, b + W]];
  }

  const sp0 = pts[N - 14];
  return {
    id: def.id, def, pts, N, length, kap, hw, lane, islands, zones, tscale: length / 6053 * (def.pace || 1),
    bounds: { minX, minY, maxX, maxY },
    start: { x: sp0.x, y: sp0.y, angle: Math.atan2(sp0.ty, sp0.tx), idx: N - 14 },
    insideSign,
    inZone(i) { for (let k = 0; k < zones.length; k++) if ((i - zones[k][0] + N) % N <= zones[k][1] - zones[k][0]) return true; return false; },
    // titik tengah terdekat; hint = indeks terakhir agar tidak melompat ke bagian lintasan lain
    nearest(x, y, hint) {
      let bi = 0, bd = 1e18;
      const test = i => { const dx = x - pts[i].x, dy = y - pts[i].y, d = dx * dx + dy * dy; if (d < bd) { bd = d; bi = i; } };
      if (hint !== undefined) { for (let k = -80; k <= 80; k++) test((hint + k + N) % N); if (bd < 360000) return { i: bi, d: Math.sqrt(bd) }; bd = 1e18; }
      for (let i = 0; i < N; i++) test(i);
      return { i: bi, d: Math.sqrt(bd) };
    }
  };
};
