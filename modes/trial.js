// Uji coba kendaraan: satu tantangan singkat per mobil untuk merasakan karakternya.
MV.MODES.trial = {
  useDrift: true, DRIFT_GOAL: 250, SPEED_GOAL: 210,
  INFO: {
    viper:   { goal: 'Selesaikan 1 putaran.', tip: 'Viper seimbang: stabil, mudah ditebak, cocok untuk semua mode.' },
    phantom: { goal: 'Capai 210 km/h, lalu selesaikan 1 putaran.', tip: 'Phantom paling cepat di jalur lurus, tetapi melebar di tikungan: rem lebih awal.' },
    drift:   { goal: 'Kumpulkan 250 poin drift, lalu selesaikan putaran.', tip: 'Drift mudah dibelokkan dan dikendalikan, tetapi kecepatan puncaknya lebih rendah.' }
  },
  init(r) { r.veh = r.opts.veh; r.maxKmh = 0; },
  noCountdown: true,
  update(r, dt, car) { r.maxKmh = Math.max(r.maxKmh, Math.round(car.speed * MV.CONFIG.KMH)); r.car = car; },
  ready(r, car) { return r.veh === 'phantom' ? r.maxKmh >= this.SPEED_GOAL : r.veh === 'drift' ? MV.Drift.score(car) >= this.DRIFT_GOAL : true; },
  onLap(r, lt, car) {
    if (!this.ready(r, car)) { r.flash(r.veh === 'phantom' ? 'Belum 210 km/h - lanjut putaran berikutnya' : 'Poin drift belum cukup - lanjut putaran berikutnya', 2.2); return; }
    const S = MV.Scoring, i = this.INFO[r.veh];
    r.end({ win: true, noMedal: true, title: 'UJI COBA ' + car.spec.name.toUpperCase() + ' SELESAI', mainLabel: 'Waktu putaran', main: S.fmt(lt),
      lines: [['Kecepatan maks', r.maxKmh + ' km/h'], ['Poin drift', String(MV.Drift.score(car))], ['Tabrakan', String(r.hits)], ['Karakter', i.tip]],
      recordKey: null, buttons: [['menu', 'Menu'], ['trials', 'Uji Coba Lain'], ['retry', 'Ulangi']] });
  },
  hud(r) {
    const i = this.INFO[r.veh], c = r.car;
    const prog = r.veh === 'phantom' ? 'Kecepatan maks ' + r.maxKmh + '/' + this.SPEED_GOAL + ' km/h' : r.veh === 'drift' ? 'Poin drift ' + (c ? MV.Drift.score(c) : 0) + '/' + this.DRIFT_GOAL : 'Putaran ' + (r.laps + 1);
    return { timer: MV.Scoring.fmt(r.time), lines: ['Uji coba ' + r.opts.veh.toUpperCase(), i.goal, prog, MV.Checkpoints.label(r.cp)] };
  }
};
