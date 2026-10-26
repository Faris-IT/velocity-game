MV.MODES.checkpointblitz = {
  T: { Gold: 38, Silver: 50, Bronze: 100 },
  init(r) {
    const N = r.track.N, T = MV.Tokens, sp = [];
    for (let k = 0; k < 12; k++) {
      const idx = Math.round(60 + k * N / 6) % N, s = T.insideSign(r.track, idx);
      if (k % 3 === 2) { sp.push({ idx, lat: -s * 50, r: 38, step: k, kind: 'safe' }); sp.push({ idx, lat: s * 50, r: 26, step: k, kind: 'short', bonus: 3 }); }   // rute aman vs rute pendek
      else sp.push({ idx, lat: (k % 2 ? 35 : -35), r: 42, step: k, kind: 'single' });
    }
    r.gates = MV.Gates.create(r.track, sp, 12); r.limit = 100 * r.track.tscale;
  },
  onLap() {},
  onGate(r, e) {
    if (e.t === 'miss') { r.flash('Checkpoint terlewat - kembali!', 2); return; }
    if (e.step >= 12) return;
    r.flash('Checkpoint ' + e.step + '/12' + (e.g.bonus ? '  rute pendek +' + e.g.bonus + ' dtk' : ''), 1.4);
  },
  update(r) {
    const G = r.gates, S = MV.Scoring;
    if (G.step >= 12) { const t = r.time - G.bonus; r.end({ win: true, title: 'SEMUA CHECKPOINT!', mainLabel: 'Waktu akhir', main: S.fmt(t), medal: S.medalLow(t, S.sc(this.T, r)),
      lines: [['Waktu balap', S.fmt(r.time)], ['Bonus rute pendek', '-' + G.bonus + ' dtk'], ['Tabrakan', String(r.hits)]], recordKey: 'checkpointblitz', value: t, better: 'low' }); }
    else if (r.time >= r.limit + G.bonus) r.end({ win: false, title: 'WAKTU HABIS', mainLabel: 'Checkpoint', main: G.step + '/12', medal: null, lines: [], recordKey: null });
  },
  hud(r) { return { timer: MV.Scoring.fmt(Math.max(0, r.limit + r.gates.bonus - r.time)), lines: ['Checkpoint ' + r.gates.step + '/12', 'Bonus +' + r.gates.bonus + ' dtk', 'Ungu = rute pendek'] }; }
};
