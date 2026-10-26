MV.MODES = {};   // logika tiap mode didaftarkan oleh modes/*.js

MV.newRace = function (def, opts, track) {
  const r = { def, track, trackId: track.id, mode: MV.MODES[def.id], opts, cd: 3, goT: 0, time: 0, laps: 0, lapTimes: [],
              penalty: 0, hits: 0, lastHits: 0, lastOff: 0, wasOn: true, pIdx: -1, prog: 0, dTypes: [], dHits: 0, dOff: 0, dEnt: 0,
              msg: '', msgT: 0, result: null, recorded: false, tokens: null, obstacles: null,
              cp: MV.Checkpoints.create(track) };
  r.end = res => { if (!r.result) r.result = res; };
  r.flash = (m, t) => { r.msg = m; r.msgT = t || 1.6; };
  r.mode.init(r);
  return r;
};

// satu langkah fisika + aturan balapan (hanya saat balapan aktif dan tidak dijeda)
MV.stepRace = function (r, car, inp, track, dt) {
  const C = MV.CONFIG, M = r.mode;
  MV.stepCar(car, inp, dt, track);
  r.time += dt;
  if (r.obstacles) MV.Obstacles.update(r.obstacles, car, r.time, dt);
  if (r.pIdx < 0) r.pIdx = car.idx;
  r.prog += ((car.idx - r.pIdx + track.N + track.N / 2) % track.N) - track.N / 2; r.pIdx = car.idx;   // progres kumulatif sepanjang lintasan
  r.dTypes = car.hitTypes.splice(0);
  r.dHits = car.hits - r.lastHits; r.dOff = car.offTime - r.lastOff; r.dEnt = (r.wasOn && !car.onTrack) ? 1 : 0; r.wasOn = car.onTrack;
  r.penalty += r.dHits * 1 + r.dOff * 0.5;     // 1 dtk per tabrakan, 0,5 dtk per detik di luar lintasan
  r.hits += r.dHits; r.lastHits = car.hits; r.lastOff = car.offTime;
  MV.Drift.update(car, dt);
  if (r.npcs) MV.NPC.step(r, car, dt);
  if (r.ghostRec) MV.Ghost.record(r.ghostRec, r, car, dt);
  if (r.gates) MV.Gates.update(r.gates, car).forEach(e => { if (M.onGate) M.onGate(r, e, car); });
  if (r.tokens) MV.Tokens.update(r.tokens, car, r.time).forEach(t => {
    car.energy = Math.min(car.spec.boost, car.energy + C.CELL_ENERGY);
    if (M.onToken) M.onToken(r, t, car);
  });
  MV.Checkpoints.update(r.cp, track, car, r.time).forEach(e => {
    if (e.t === 'lap') {
      r.laps++; r.lapTimes.push(e.time);
      r.flash('Putaran ' + r.laps + '  ' + MV.Scoring.fmt(e.time), 1.8);
      M.onLap(r, e.time, car);
    } else if (M.onCp) M.onCp(r, e.k, car);
  });
  M.update(r, dt, car);
};
