MV.MODES.ghostrival = {
  useGhost: true, DEFAULT_TIME: 34,
  init(r) {
    r.target = 2; r.limit = 90;
    r.stored = MV.Storage.getGhost(r.opts.veh);
    r.gh = r.stored || MV.Ghost.builtin(r.track, r.target, this.DEFAULT_TIME);
    r.gh.ptr = 0; r.ghostRec = MV.Ghost.newRec(); r.gap = 0;
  },
  update(r) {
    const tg = MV.Ghost.timeAtProg(r.gh, r.prog);
    r.gap = tg === null ? 0 : r.time - tg;                           // positif = tertinggal
    if (r.time >= r.limit) r.end({ win: false, title: 'WAKTU HABIS', mainLabel: 'Putaran', main: r.laps + '/' + r.target, medal: null, lines: [], recordKey: null });
  },
  onLap(r) {
    if (r.laps < r.target) return;
    const S = MV.Scoring, beat = r.time < r.gh.time, diff = r.time - r.gh.time;
    const save = !r.stored || r.time < r.stored.time;
    if (save) MV.Storage.saveGhost(r.opts.veh, { time: r.time, s: r.ghostRec.s });
    r.end({ win: beat, title: beat ? 'GHOST DIKALAHKAN!' : 'GHOST MENANG', mainLabel: 'Waktu', main: S.fmt(r.time), medal: null, noMedal: true,
      lines: [[r.stored ? 'Waktu ghost' : 'Target bawaan', S.fmt(r.gh.time)], ['Selisih', (diff > 0 ? '+' : '') + diff.toFixed(2) + ' dtk'], ['Ghost baru tersimpan', save ? 'ya' : 'tidak']],
      recordKey: 'ghostrival', value: r.time, better: 'low' });
  },
  hud(r) {
    const g = r.gap, txt = Math.abs(g) < 0.05 ? 'Sejajar dengan ghost' : g > 0 ? 'TERTINGGAL ' + g.toFixed(2) + ' dtk' : 'UNGGUL ' + (-g).toFixed(2) + ' dtk';
    return { timer: MV.Scoring.fmt(r.time), lines: [txt, 'Putaran ' + Math.min(r.laps + 1, r.target) + '/' + r.target, r.stored ? 'Lawan: ghost terbaikmu' : 'Lawan: target bawaan'] };
  }
};
