// Pembalap NPC: memakai fisika yang sama dengan pemain, ditambah tabrakan antar-kendaraan dan peringkat.
MV.NPC = {
  COLORS: ['#ff4d6d', '#ffd24a', '#4dff9a', '#6aa8ff', '#ff9de2'],
  NAMES: ['Kamu', 'Nova', 'Rex', 'Zed', 'Kai', 'Mira'],
  SKILLS: [{ cruise: 0.68, corner: 0.8 }, { cruise: 0.8, corner: 0.9 }, { cruise: 0.9, corner: 0.98 }],   // mudah, normal, sulit
  slot(track, row, side) {
    const N = track.N, idx = (N - 4 - 8 * row + N) % N, p = track.pts[idx], lat = side * 34;
    return { x: p.x - p.ty * lat, y: p.y + p.tx * lat, angle: Math.atan2(p.ty, p.tx), idx };
  },
  attach(r, count, skillIdx, laps) {
    const N = r.track.N, grid = [[0, -1], [0, 1], [1, -1], [2, -1], [2, 1]], order = ['phantom', 'viper', 'drift', 'viper', 'phantom'];
    r.playerStart = this.slot(r.track, 1, 1); r.pStartIdx = r.playerStart.idx; r.npcLaps = laps; r.npcs = [];
    for (let k = 0; k < Math.min(5, count); k++) {
      const s = this.slot(r.track, grid[k][0], grid[k][1]), c = MV.createCar(order[k], s), base = this.SKILLS[skillIdx === undefined ? 1 : skillIdx];
      c.angle = s.angle; c.color = this.COLORS[k]; c.name = this.NAMES[k + 1]; c.prog = 0; c.pIdx = -1; c.idx0 = s.idx; c.fin = null;
      c.ai = MV.AI.newState({ cruise: base.cruise + (Math.random() - 0.5) * 0.06, corner: base.corner + (Math.random() - 0.5) * 0.04 }, [-26, 0, 26][k % 3]);
      r.npcs.push(c);
    }
  },
  dist(r, c) { return c.prog - (r.track.N - c.idx0); },                       // jarak melewati garis finis (negatif = belum lewat)
  pDist(r) { return r.prog - (r.track.N - r.pStartIdx); },
  step(r, car, dt) {
    const N = r.track.N, pd = this.pDist(r);
    r.npcs.forEach(n => {
      const rb = 1 + Math.max(-0.05, Math.min(0.06, (pd - this.dist(r, n)) / (N * 0.3) * 0.06));   // sedikit kejar-kejaran
      MV.stepCar(n, MV.AI.drive(n, r.track, n.ai, dt, rb), dt, r.track);
      if (n.pIdx < 0) n.pIdx = n.idx;
      n.prog += ((n.idx - n.pIdx + N + N / 2) % N) - N / 2; n.pIdx = n.idx;
      if (n.fin === null && this.dist(r, n) >= r.npcLaps * N) n.fin = r.time;
    });
    const all = [car].concat(r.npcs), R2 = MV.CONFIG.CAR_RADIUS * 2;
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const a = all[i], b = all[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
      if (d >= R2 || d === 0) continue;
      const nx = dx / d, ny = dy / d, push = (R2 - d) / 2;
      a.x += nx * push; a.y += ny * push; b.x -= nx * push; b.y -= ny * push;
      const vn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
      if (vn < 0) { const j2 = -(1 + 0.35) * vn / 2; a.vx += j2 * nx; a.vy += j2 * ny; b.vx -= j2 * nx; b.vy -= j2 * ny; a.vx *= 0.98; a.vy *= 0.98; b.vx *= 0.98; b.vy *= 0.98; }
    }
  },
  // urutan lengkap; pFin = waktu finis pemain (null jika belum)
  order(r, pFin) {
    const e = [{ i: 0, name: this.NAMES[0], fin: pFin, d: this.pDist(r) }];
    r.npcs.forEach((n, k) => e.push({ i: k + 1, name: n.name, fin: n.fin, d: this.dist(r, n) }));
    return e.sort((a, b) => (a.fin !== null && b.fin !== null) ? a.fin - b.fin : a.fin !== null ? -1 : b.fin !== null ? 1 : b.d - a.d);
  },
  finalPos(r) { return this.order(r, r.time).findIndex(e => e.i === 0) + 1; },
  posLine(r) {
    if (!r.npcs) return null;
    return 'Posisi ' + (this.order(r, null).findIndex(e => e.i === 0) + 1) + '/' + (r.npcs.length + 1);
  }
};
