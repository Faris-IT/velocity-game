MV.MODES = {};   // logika tiap mode didaftarkan oleh modes/*.js

MV.newRace = function (def, opts, track) {
  const r = { def, mode: MV.MODES[def.id], opts, cd: 3, goT: 0, time: 0, laps: 0, lapTimes: [],
              penalty: 0, hits: 0, lastHits: 0, lastOff: 0, msg: '', msgT: 0, result: null, recorded: false,
              cp: MV.Checkpoints.create(track) };
  r.end = res => { if (!r.result) r.result = res; };
  r.mode.init(r);
  return r;
};

// satu langkah fisika + aturan balapan (hanya dipanggil saat balapan aktif dan tidak dijeda)
MV.stepRace = function (r, car, inp, track, dt) {
  MV.stepCar(car, inp, dt, track);
  r.time += dt;
  r.penalty += (car.hits - r.lastHits) * 1 + (car.offTime - r.lastOff) * 0.5;   // 1 dtk/tabrakan, 0.5 dtk per detik di luar lintasan
  r.hits += car.hits - r.lastHits; r.lastHits = car.hits; r.lastOff = car.offTime;
  MV.Checkpoints.update(r.cp, track, car, r.time).forEach(e => {
    if (e.t !== 'lap') return;
    r.laps++; r.lapTimes.push(e.time);
    r.msg = 'Putaran ' + r.laps + '  ' + MV.Scoring.fmt(e.time); r.msgT = 1.8;
    r.mode.onLap(r, e.time);
  });
  r.mode.update(r, dt);
};
