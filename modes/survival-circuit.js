MV.MODES.survival = {
  useHP: true, T: { Gold: 70, Silver: 40, Bronze: 1 }, DMG: { cone: 8, barrier: 20, wall: 10 },
  init(r) { r.limit = 180; r.hp = 100; r.obstacles = MV.Obstacles.create(r.track, []); r.nextSpawn = 5; },
  onLap() {},
  spawn(r, car) {
    const N = r.track.N, L = r.obstacles, hard = Math.min(1, r.time / 150);
    const idx = (car.idx + 110 + Math.floor(Math.random() * 40)) % N, lat = (Math.random() - 0.5) * 100;
    if (Math.random() < 0.35 + 0.4 * hard) MV.Obstacles.add(L, { type: 'barrier', idx, lat: lat * 0.3, amp: 30 + 25 * hard, w: 1.3 + Math.random() * 1.2, ph: Math.random() * 6 });
    else { MV.Obstacles.add(L, { type: 'cone', idx, lat }); if (hard > 0.5) MV.Obstacles.add(L, { type: 'cone', idx: (idx + 10) % N, lat: -lat }); }
  },
  update(r, dt, car) {
    r.dTypes.forEach(t => { r.hp -= this.DMG[t] || 10; });
    if (car.charging) r.hp = Math.min(100, r.hp + 6 * dt);                    // zona cyan = zona istirahat
    if (r.time >= r.nextSpawn) { this.spawn(r, car); r.nextSpawn = r.time + Math.max(1.4, 6.5 - r.time / 32); }   // makin sering seiring waktu
    const L = r.obstacles, N = r.track.N;
    for (let i = L.length - 1; i >= 0; i--) if ((car.idx - L[i].idx + N) % N > 250 && (car.idx - L[i].idx + N) % N < N / 2 + 100) L.splice(i, 1);
    if (L.length > 16) L.splice(0, L.length - 16);
    const S = MV.Scoring;
    if (r.hp <= 0) r.end({ win: false, title: 'KENDARAAN HANCUR', mainLabel: 'Bertahan', main: S.fmt(r.time), medal: null, lines: [['Tabrakan', String(r.hits)]], recordKey: null });
    else if (r.time >= r.limit) {
      const hp = Math.round(r.hp), medal = S.medalHigh(hp, this.T);
      r.end({ win: true, title: 'BERTAHAN!', mainLabel: 'Kondisi tersisa', main: hp + '%', medal, lines: [['Tabrakan', String(r.hits)], ['Waktu', S.fmt(r.limit)]], recordKey: 'survival', value: hp * 10, better: 'high' });
    }
  },
  hud(r) { return { timer: MV.Scoring.fmt(Math.max(0, r.limit - r.time)), lines: ['Kondisi ' + Math.max(0, Math.round(r.hp)) + '%', 'Rintangan ' + r.obstacles.length, 'Zona cyan memulihkan kondisi'] }; }
};
