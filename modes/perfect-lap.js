MV.MODES.perfectlap = {
  T: { Gold: 3000, Silver: 2500, Bronze: 2000 }, LIMIT: 500,   // ambang medali dan batas penalti (perkiraan awal)
  init(r) { r.target = 3; r.pts = 0; r.pen = 0; r.bonus = 0; },
  score(r) { return Math.max(0, Math.round(r.pts + r.bonus - r.pen)); },
  onLap(r, lt) {
    r.pts += Math.max(0, Math.round(1000 - (lt / r.track.tscale - 13) * 40));
    if (r.laps < r.target) return;
    const S = MV.Scoring, sc = this.score(r);
    r.end({ win: true, title: r.pen === 0 ? 'LAP SEMPURNA!' : 'SELESAI', mainLabel: 'Skor', main: String(sc), medal: S.medalHigh(sc, this.T),
      lines: [['Skor waktu', String(r.pts)], ['Bonus jalur ideal', '+' + Math.round(r.bonus)], ['Penalti', '-' + Math.round(r.pen)],
              ['Tabrakan', String(r.hits)], ['Putaran terbaik', S.fmt(S.best(r.lapTimes))]],
      recordKey: 'perfectlap', value: sc, better: 'high' });
  },
  update(r, dt, car) {
    r.pen += r.dHits * 120 + r.dEnt * 60 + r.dOff * 30;        // tabrakan, keluar lintasan, lama di luar
    if (car.onTrack && car.dist <= 38 && car.speed > 200) r.bonus += 10 * dt;   // dekat jalur ideal
    if (r.pen > this.LIMIT) r.end({ win: false, title: 'BATAS PENALTI TERLAMPAUI', mainLabel: 'Skor', main: String(this.score(r)), medal: null,
      lines: [['Penalti', Math.round(r.pen) + ' / ' + this.LIMIT], ['Putaran selesai', r.laps + '/' + r.target]], recordKey: null });
  },
  hud(r) { return { timer: MV.Scoring.fmt(r.time), lines: ['Putaran ' + Math.min(r.laps + 1, r.target) + '/' + r.target,
    'Skor ' + this.score(r), 'Penalti ' + Math.round(r.pen) + '/' + this.LIMIT, MV.Checkpoints.label(r.cp)] }; }
};
