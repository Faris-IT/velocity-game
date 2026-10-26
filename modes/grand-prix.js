MV.MODES.grandprix = {
  init(r) { r.target = r.opts.laps; if (r.opts.rivals > 0) MV.NPC.attach(r, r.opts.rivals, r.opts.skill, r.target); },
  onLap(r) { if (r.laps >= r.target) MV.Scoring.finishGrandPrix(r); },
  update() {},
  hud(r) {
    const l = ['Putaran ' + Math.min(r.laps + 1, r.target) + '/' + r.target, MV.Checkpoints.label(r.cp)];
    if (r.npcs) l.unshift(MV.NPC.posLine(r));
    if (r.penalty > 0) l.push('Penalti +' + r.penalty.toFixed(1) + ' dtk');
    return { timer: MV.Scoring.fmt(r.time), lines: l };
  }
};
