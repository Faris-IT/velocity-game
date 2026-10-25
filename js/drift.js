// Penilaian drift: poin dari gelincir samping saat kencang; kombo naik tiap drift beruntun.
// Dinding atau drift terlalu lama (> 4,5 dtk) menghanguskan poin rangkaian yang berjalan.
MV.Drift = {
  init(car) { car.dr = { on: false, t: 0, chain: 0, mult: 1, gap: 9, total: 0, best: 0, fails: 0, lastHits: car.hits || 0 }; },
  update(car, dt) {
    const d = car.dr;
    if (car.hits !== d.lastHits) {
      d.lastHits = car.hits;
      if (d.chain > 0) d.fails++;
      d.chain = 0; d.mult = 1; d.on = false; d.t = 0;
    }
    const act = car.onTrack && car.speed > 200 && Math.abs(car.vl) > 55 && Math.abs(car.steer) > 0.25;
    if (act) {
      d.on = true; d.t += dt; d.gap = 0;
      d.chain += (Math.abs(car.vl) - 40) * 0.5 * d.mult * dt;
      if (d.t > 4.5) { d.chain = 0; d.mult = 1; d.t = 0; d.on = false; d.fails++; }
    } else {
      d.gap += dt;
      if (d.on && d.gap > 0.5) {
        const pts = Math.round(d.chain);
        d.total += pts; d.best = Math.max(d.best, pts);
        if (d.t >= 0.8) d.mult = Math.min(5, d.mult + 1);
        d.chain = 0; d.on = false; d.t = 0;
      }
      if (d.gap > 3) d.mult = 1;
    }
  },
  score(car) { return car.dr.total + Math.round(car.dr.chain); }
};
