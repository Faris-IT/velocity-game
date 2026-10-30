MV.MODES.hazardrun = {
  useHP: true, T: { Gold: 42, Silver: 52, Bronze: 70 }, DMG: { cone: 8, barrier: 20, wall: 10 },
  init(r) { r.target = 2; r.limit = 80 * r.track.tscale; r.hp = 100; r.obstacles = MV.Obstacles.create(r.track, MV.Obstacles.hazardSpecs(r.track.N)); },
  onCp(r) { if (r.hp < 100) { r.hp = Math.min(100, r.hp + 10); r.flash('Checkpoint: kondisi +10', 1.2); } },
  update(r, dt, car) {
    r.dTypes.forEach(t => { r.hp -= (this.DMG[t] || 10) * 100 / car.spec.dur; });
    const S = MV.Scoring;
    if (r.hp <= 0) r.end({ win: false, title: 'KENDARAAN HANCUR', mainLabel: 'Putaran', main: r.laps + '/' + r.target, medal: null, lines: [['Tabrakan', String(r.hits)]], recordKey: null });
    else if (r.time >= r.limit) r.end({ win: false, title: 'WAKTU HABIS', mainLabel: 'Putaran', main: r.laps + '/' + r.target, medal: null, lines: [['Kondisi', Math.round(r.hp) + '%']], recordKey: null });
  },
  onLap(r) {
    if (r.laps < r.target) return;
    const S = MV.Scoring;
    const adj = r.time + r.hits * 1.5;                            // tiap tabrakan menambah 1,5 dtk pada nilai akhir
    r.end({ win: true, title: r.hits === 0 ? 'UNTOUCHABLE!' : 'FINISH!', mainLabel: 'Waktu akhir', main: S.fmt(adj), medal: S.medalLow(adj, S.sc(this.T, r)),
      lines: [['Waktu balap', S.fmt(r.time)], ['Penalti tabrakan', '+' + (r.hits * 1.5).toFixed(1) + ' dtk (' + r.hits + ')'], ['Kondisi tersisa', Math.round(r.hp) + '%']],
      recordKey: 'hazardrun', value: adj, better: 'low' });
  },
  hud(r) { return { timer: MV.Scoring.fmt(Math.max(0, r.limit - r.time)), lines: ['Putaran ' + Math.min(r.laps + 1, r.target) + '/' + r.target, 'Kondisi ' + Math.max(0, Math.round(r.hp)) + '%', MV.Checkpoints.label(r.cp)] }; }
};
