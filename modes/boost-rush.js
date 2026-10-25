MV.MODES.boostrush = {
  T: { Gold: 14.5, Silver: 17.5, Bronze: 24 },   // detik per putaran (waktu + penalti)
  init(r) { r.target = 3; r.limit = 80; r.used = 0; r.wasted = 0; },
  update(r, dt, car) {
    if (car.boosting) { const e = MV.CONFIG.BOOST_USE * dt; r.used += e; if (Math.abs(car.steer) > 0.5) r.wasted += e; }   // boost di tikungan = boros
    if (r.time >= r.limit) r.end({ win: false, title: 'WAKTU HABIS', mainLabel: 'Putaran', main: r.laps + '/' + r.target, medal: null, lines: [], recordKey: null });
  },
  onLap(r) {
    if (r.laps < r.target) return;
    const S = MV.Scoring, total = r.time + r.penalty, eff = r.used > 0 ? Math.round((1 - r.wasted / r.used) * 100) : 100;
    r.end({ win: true, title: 'FINISH!', mainLabel: 'Waktu akhir', main: S.fmt(total), medal: S.medalLow(total / r.target, this.T),
      lines: [['Waktu balap', S.fmt(r.time)], ['Penalti', '+' + r.penalty.toFixed(1) + ' dtk'], ['Energi boost dipakai', Math.round(r.used)],
              ['Efisiensi boost', eff + '%']], recordKey: 'boostrush', value: total, better: 'low' });
  },
  hud(r) { return { timer: MV.Scoring.fmt(Math.max(0, r.limit - r.time)), lines: ['Putaran ' + Math.min(r.laps + 1, r.target) + '/' + r.target,
    'Boost terpakai ' + Math.round(r.used), r.penalty > 0 ? 'Penalti +' + r.penalty.toFixed(1) + ' dtk' : MV.Checkpoints.label(r.cp)] }; }
};
