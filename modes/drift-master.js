MV.MODES.driftmaster = {
  useDrift: true, T: { Gold: 60, Silver: 90, Bronze: 120 },
  init(r) { r.limit = 120; r.goal = 2000; },
  onLap() {},
  update(r, dt, car) {
    r.car = car;
    const d = car.dr, S = MV.Scoring;
    if (d.total >= r.goal) r.end({ win: true, title: 'DRIFT LEGEND!', mainLabel: 'Waktu', main: S.fmt(r.time), medal: S.medalLow(r.time, this.T),
      lines: [['Poin drift', String(d.total)], ['Drift terbaik', String(d.best)], ['Rangkaian gagal', String(d.fails)]],
      recordKey: 'driftmaster', value: r.time, better: 'low' });
    else if (r.time >= r.limit) r.end({ win: false, title: 'WAKTU HABIS', mainLabel: 'Poin drift', main: d.total + ' / ' + r.goal, medal: null,
      lines: [['Drift terbaik', String(d.best)]], recordKey: null });
  },
  hud(r) { return { timer: MV.Scoring.fmt(Math.max(0, r.limit - r.time)), lines: ['Poin drift ' + (r.car ? r.car.dr.total : 0) + '/' + r.goal, 'Kombo x' + (r.car ? r.car.dr.mult : 1)] }; }
};
