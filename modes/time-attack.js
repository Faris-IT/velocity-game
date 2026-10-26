MV.MODES.timeattack = {
  init(r) { r.limit = 90; r.score = 0; },
  onLap(r, lt) { r.score += MV.Scoring.lapBonus(lt, r.track.tscale); },
  update(r) { if (r.time >= r.limit) { r.time = r.limit; MV.Scoring.finishTimeAttack(r); } },
  hud(r) {
    return { timer: MV.Scoring.fmt(r.limit - r.time),
             lines: ['Putaran valid ' + r.laps, 'Skor ' + r.score, MV.Checkpoints.label(r.cp)] };
  }
};
