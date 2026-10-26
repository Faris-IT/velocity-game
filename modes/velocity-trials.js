// Mesin misi: setiap misi di data/trials.js hanya berupa aturan deklaratif.
MV.MODES.trials = {
  useDrift: true,
  init(r) {
    const s = r.spec = MV.TRIALS[r.opts.mission || 0], N = r.track.N, sp = [];
    r.cells = 0; r.slow = 0; r.setup = false;
    if (s.cells) { for (let i = 0; i < 16; i++) sp.push({ idx: Math.round(i * N / 16 + 20) % N, lat: i % 2 ? 20 : -20, kind: 'main' }); r.tokens = MV.Tokens.create(r.track, sp); }
    if (s.gates) { const g = []; for (let k = 0; k < s.gates; k++) g.push({ idx: (N - 14 + 60 + k * Math.round(N * 0.0875)) % N, lat: k % 2 ? 38 : -38, r: 36, step: k }); r.gates = MV.Gates.create(r.track, g, s.gates); }
    if (s.obst) r.obstacles = MV.Obstacles.create(r.track, MV.Obstacles.hazardSpecs(N));
  },
  onToken(r) { r.cells++; },
  onGate(r, e) { if (e.t === 'miss') r.flash('Gerbang terlewat - kembali!', 2); },
  onLap() {},
  fail(r, why) { r.end({ win: false, title: 'MISI GAGAL', mainLabel: 'Penyebab', main: why, medal: null, lines: [['Misi', r.spec.n]], recordKey: null }); },
  value(r) { const s = r.spec; return s.measure === 'hits' ? r.hits : s.measure === 'lap' ? r.lapTimes.reduce((a, b) => a + b, 0) : r.time; },
  update(r, dt, car) {
    const s = r.spec, S = MV.Scoring, K = MV.CONFIG.KMH;
    if (!r.setup) { r.setup = true; if (s.energy) { car.energy = s.energy; car.noCharge = true; } }
    if (s.noBoost && car.boosting) return this.fail(r, 'Boost terdeteksi');
    if (s.maxHits !== undefined && r.hits > s.maxHits) return this.fail(r, 'Terlalu banyak tabrakan');
    if (s.minKmh && r.time > 3) { r.slow = car.speed * K < s.minKmh ? r.slow + dt : 0; if (r.slow > 1.5) return this.fail(r, 'Kecepatan di bawah ' + s.minKmh + ' km/jam'); }
    const k = r.track.tscale;
    if (s.limit && r.time >= s.limit * k) return this.fail(r, 'Waktu habis');
    if (s.lapLimit && r.cp.started && r.time - r.cp.lapStart > s.lapLimit * k) return this.fail(r, 'Batas waktu putaran terlewati');
    const ok = r.laps >= (s.laps || 0) && (!s.cells || r.cells >= s.cells) && (!s.drift || MV.Drift.score(car) >= s.drift) && (!s.gates || r.gates.step >= s.gates);
    if (!ok) return;
    const v = this.value(r), key = 'trials-' + (r.opts.mission || 0);
    r.end({ win: true, title: 'MISI SELESAI', mainLabel: s.measure === 'hits' ? 'Tabrakan' : 'Waktu', main: s.measure === 'hits' ? String(v) : S.fmt(v), medal: S.medalLow(v, s.measure === 'hits' ? s.T : S.sc(s.T, r)),
      lines: [['Misi', (r.opts.mission + 1) + '. ' + s.n], ['Tabrakan', String(r.hits)], ['Poin drift', String(MV.Drift.score(car))]],
      recordKey: key, medalKey: key, value: v, better: 'low' });
  },
  hud(r) {
    const s = r.spec, c = r.car || { dr: { total: 0, chain: 0 } }, l = [(r.opts.mission + 1) + '. ' + s.n];
    if (s.cells) l.push('Token ' + r.cells + '/' + s.cells);
    if (s.drift) l.push('Drift ' + MV.Drift.score(c) + '/' + s.drift);
    if (s.gates) l.push('Gerbang ' + r.gates.step + '/' + s.gates);
    if (s.laps) l.push('Putaran ' + Math.min(r.laps + 1, s.laps) + '/' + s.laps);
    if (s.maxHits !== undefined) l.push('Tabrakan ' + r.hits + '/' + s.maxHits);
    if (s.noBoost) l.push('Dilarang boost');
    return { timer: MV.Scoring.fmt(s.limit ? Math.max(0, s.limit * r.track.tscale - r.time) : r.time), lines: l };
  }
};
// simpan referensi mobil untuk HUD
(function () { const u = MV.MODES.trials.update; MV.MODES.trials.update = function (r, dt, car) { r.car = car; return u.call(this, r, dt, car); }; })();
