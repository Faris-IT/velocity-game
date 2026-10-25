// Gerbang bernomor (Checkpoint Blitz, Velocity Trials). Satu langkah boleh punya beberapa gerbang alternatif (rute aman / pendek).
MV.Gates = {
  create(track, specs, steps) {
    const list = specs.map(s => {
      const p = track.pts[s.idx % track.N];
      return { x: p.x - p.ty * s.lat, y: p.y + p.tx * s.lat, r: s.r, step: s.step, idx: s.idx % track.N, bonus: s.bonus || 0, kind: s.kind || 'single' };
    });
    return { list, step: 0, steps, bonus: 0, missed: false, track };
  },
  active(G) { return G.list.filter(g => g.step === G.step); },
  update(G, car) {
    const ev = [];
    if (G.step >= G.steps) return ev;
    const act = this.active(G), R = MV.CONFIG.CAR_RADIUS, N = G.track.N;
    for (const g of act) {
      if (Math.hypot(car.x - g.x, car.y - g.y) < g.r + R) { G.step++; G.bonus += g.bonus; G.missed = false; ev.push({ t: 'gate', g, step: G.step }); return ev; }
    }
    const d = (car.idx - act[0].idx + N) % N, miss = d > 28 && d < N / 3;   // sudah melewati gerbang tanpa menyentuhnya
    if (miss && !G.missed) { G.missed = true; ev.push({ t: 'miss' }); } else if (!miss) G.missed = false;
    return ev;
  }
};
