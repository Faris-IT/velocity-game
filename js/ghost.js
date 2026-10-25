// Rekaman ghost: posisi kendaraan tiap 0,05 dtk. Format sampel: [x, y, sudut*100, progres*10].
MV.Ghost = {
  DT: 0.05,
  newRec() { return { t: 0, s: [] }; },
  record(rec, r, car, dt) {
    rec.t += dt;
    while (rec.t >= this.DT) { rec.t -= this.DT; rec.s.push([Math.round(car.x), Math.round(car.y), Math.round(car.angle * 100), Math.round(r.prog * 10)]); }
  },
  // target bawaan: kendaraan maya melaju konstan di tengah lintasan
  builtin(track, laps, time) {
    const n = Math.round(time / this.DT), total = 14 + laps * track.N, N = track.N, s = [];
    for (let i = 0; i <= n; i++) {
      const prog = total * i / n, f = (N - 14 + prog) % N, a = Math.floor(f), b = (a + 1) % N, k = f - a, p = track.pts[a], q = track.pts[b];
      s.push([Math.round(p.x + (q.x - p.x) * k), Math.round(p.y + (q.y - p.y) * k), Math.round(Math.atan2(p.ty, p.tx) * 100), Math.round(prog * 10)]);
    }
    return { time, s, ptr: 0, builtin: true };
  },
  at(g, time) {
    const f = Math.max(0, Math.min(g.s.length - 1, time / this.DT)), i = Math.floor(f), j = Math.min(g.s.length - 1, i + 1), k = f - i, a = g.s[i], b = g.s[j];
    return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, a: a[2] / 100 };
  },
  // waktu saat ghost mencapai progres tertentu (untuk selisih unggul/tertinggal)
  timeAtProg(g, prog) {
    const p = prog * 10, s = g.s;
    while (g.ptr > 0 && s[g.ptr - 1][3] >= p) g.ptr--;
    while (g.ptr < s.length - 1 && s[g.ptr][3] < p) g.ptr++;
    if (s[g.ptr][3] < p) return null;
    if (g.ptr === 0) return 0;
    const a = s[g.ptr - 1], b = s[g.ptr], k = b[3] === a[3] ? 0 : (p - a[3]) / (b[3] - a[3]);
    return (g.ptr - 1 + k) * this.DT;
  }
};
