// Lintasan dibangun dari data titik: kurva superellipse diubah menjadi titik berjarak sama.
MV.buildTrack = function (def) {
  const M = 4000, N = 800, dense = [];
  for (let i = 0; i < M; i++) {
    const t = -i / M * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    dense.push({ x: def.a * Math.sign(c) * Math.pow(Math.abs(c), 2 / def.n),
                 y: def.b * Math.sign(s) * Math.pow(Math.abs(s), 2 / def.n) });
  }
  const cum = [0];
  for (let i = 1; i <= M; i++) { const p = dense[i % M], q = dense[i - 1]; cum.push(cum[i - 1] + Math.hypot(p.x - q.x, p.y - q.y)); }
  const length = cum[M], pts = [];
  let j = 0;
  for (let k = 0; k < N; k++) {
    const target = k * length / N;
    while (cum[j + 1] < target) j++;
    const f = (target - cum[j]) / (cum[j + 1] - cum[j]), p = dense[j], q = dense[(j + 1) % M];
    pts.push({ x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f });
  }
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  pts.forEach((p, i) => {
    const a = pts[(i + N - 1) % N], b = pts[(i + 1) % N], l = Math.hypot(b.x - a.x, b.y - a.y);
    p.tx = (b.x - a.x) / l; p.ty = (b.y - a.y) / l;
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  });
  const zones = (def.zones || []).map(z => [Math.round(z[0] * N), Math.round(z[1] * N)]);
  const sp = pts[N - 14];
  return {
    def, pts, N, length, zones, bounds: { minX, minY, maxX, maxY },
    start: { x: sp.x, y: sp.y, angle: Math.atan2(sp.ty, sp.tx) },
    inZone(i) { for (let k = 0; k < zones.length; k++) if (i >= zones[k][0] && i <= zones[k][1]) return true; return false; },
    // titik tengah lintasan terdekat dari posisi (x, y)
    nearest(x, y) {
      let bi = 0, bd = 1e18;
      for (let i = 0; i < N; i++) { const dx = x - pts[i].x, dy = y - pts[i].y, d = dx * dx + dy * dy; if (d < bd) { bd = d; bi = i; } }
      return { i: bi, d: Math.sqrt(bd) };
    }
  };
};
