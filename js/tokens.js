// Token/sel energi: jalur utama (cyan), jalur berisiko (oranye, di area luar aspal), dan sel berkedip (ungu).
MV.Tokens = {
  create(track, specs) {
    return specs.map(s => {
      const p = track.pts[s.idx % track.N];
      return { x: p.x - p.ty * s.lat, y: p.y + p.tx * s.lat, kind: s.kind, v: s.v || 0, phase: s.phase || 0, alive: true, r: 13 };
    });
  },
  // +1 jika sisi normal positif mengarah ke dalam (mendekati pusat lintasan), -1 jika sebaliknya
  insideSign(track, idx) {
    const p = track.pts[idx % track.N];
    return Math.hypot(p.x - p.ty * 10, p.y + p.tx * 10) < Math.hypot(p.x, p.y) ? 1 : -1;
  },
  visible(t, time) { return t.kind !== 'blink' || ((time + t.phase) % 8) < 4.5; },
  update(list, car, time) {
    const got = [], R = MV.CONFIG.CAR_RADIUS;
    list.forEach(t => {
      if (t.alive && this.visible(t, time) && Math.hypot(car.x - t.x, car.y - t.y) < t.r + R) { t.alive = false; got.push(t); }
    });
    return got;
  }
};
