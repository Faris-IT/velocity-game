MV.MODES.energy = {
  T: { Gold: 30, Silver: 42, Bronze: 60 },
  init(r) {
    const N = r.track.N, sp = [];
    for (let i = 0; i < 14; i++) sp.push({ idx: Math.round(i * N / 14 + N / 28), lat: i % 2 ? 24 : -24, kind: 'main' });
    for (let i = 0; i < 10; i++) sp.push({ idx: Math.round(i * N / 10 + N / 20 + 8), lat: i % 2 ? 105 : -105, kind: 'risk' });   // jalur berisiko
    for (let i = 0; i < 8; i++) sp.push({ idx: Math.round(i * N / 8 + N / 16 + 14), lat: i % 2 ? 30 : -30, kind: 'blink', phase: i * 1.7 });
    r.tokens = MV.Tokens.create(r.track, sp); r.limit = 60 * r.track.tscale; r.need = 25; r.cells = 0; r.risk = 0;
  },
  onToken(r, t) { r.cells++; if (t.kind === 'risk') r.risk++; },
  onLap(r) {
    if (r.cells < r.need) { r.flash('Butuh ' + r.need + ' sel (baru ' + r.cells + ')', 2); return; }
    const S = MV.Scoring, all = r.cells === r.tokens.length;
    r.end({ win: true, title: all ? 'SEMUA ENERGI TERKUMPUL!' : 'ENERGI TERKUMPUL', mainLabel: 'Waktu', main: S.fmt(r.time), medal: S.medalLow(r.time, S.sc(this.T, r)),
      lines: [['Sel energi', r.cells + ' / ' + r.tokens.length], ['Jalur berisiko', r.risk + ' / 10'], ['Tabrakan', String(r.hits)]],
      all, recordKey: 'energy', value: r.time, better: 'low' });
  },
  update(r) {
    if (r.time >= r.limit) r.end({ win: false, title: 'WAKTU HABIS', mainLabel: 'Sel energi', main: r.cells + ' / ' + r.need, medal: null,
      lines: [['Jalur berisiko', String(r.risk)]], recordKey: null });
  },
  hud(r) { return { timer: MV.Scoring.fmt(Math.max(0, r.limit - r.time)), lines: ['Sel energi ' + r.cells + '/' + r.need, 'Jalur berisiko ' + r.risk, MV.Checkpoints.label(r.cp)] }; }
};
