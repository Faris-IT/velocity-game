// Rival Cup: 4 balapan (satu per lintasan) melawan 5 NPC. Poin dari posisi akhir.
MV.MODES.cup = {
  TRACKS: ['oval', 'twist', 'chicane', 'split'], PTS: [10, 8, 6, 4, 2, 1], LAPS: 2,
  init(r) { r.cup = r.opts.cup; r.target = this.LAPS; r.limit = 110 * r.track.tscale; MV.NPC.attach(r, 5, r.opts.skill, this.LAPS); },
  onLap(r) { if (r.laps >= r.target) this.finish(r, r.time); },
  update(r) { if (r.time >= r.limit) this.finish(r, null); },
  finish(r, pFin) {
    if (r.result) return;
    const cup = r.cup, ord = MV.NPC.order(r, pFin), N = MV.NPC.NAMES, last = cup.race >= this.TRACKS.length - 1, gain = [0, 0, 0, 0, 0, 0];
    ord.forEach((e, pos) => { gain[e.i] = this.PTS[pos]; cup.pts[e.i] += this.PTS[pos]; });
    cup.race++;
    const me = ord.findIndex(e => e.i === 0) + 1;
    const lines = ord.map((e, pos) => [(pos + 1) + '. ' + N[e.i], '+' + this.PTS[pos] + '  (total ' + cup.pts[e.i] + ')']);
    if (!last) {
      r.end({ win: me <= 3, noMedal: true, title: 'RACE ' + cup.race + '/4 - POSISI ' + me, mainLabel: 'Poin balapan ini', main: '+' + gain[0], lines, recordKey: null,
        buttons: [['menu', 'Keluar Cup'], ['next', 'Race Berikutnya']] });
      return;
    }
    const final = cup.pts.map((p, i) => ({ i, p })).sort((a, b) => b.p - a.p), rank = final.findIndex(e => e.i === 0) + 1;
    r.end({ win: rank <= 3, title: rank === 1 ? 'JUARA RIVAL CUP!' : 'CUP SELESAI - PERINGKAT ' + rank, mainLabel: 'Total poin', main: String(cup.pts[0]), medal: ['Gold', 'Silver', 'Bronze'][rank - 1] || null,
      lines: final.map((e, k) => [(k + 1) + '. ' + N[e.i], e.p + ' poin']), recordKey: 'cup', noTrackKey: true, medalKey: 'cup', value: cup.pts[0], better: 'high',
      buttons: [['menu', 'Menu'], ['cupnew', 'Cup Baru']] });
  },
  hud(r) {
    return { timer: MV.Scoring.fmt(r.time), lines: ['Race ' + (r.cup.race + 1) + '/4 - ' + r.track.def.name, MV.NPC.posLine(r), 'Putaran ' + Math.min(r.laps + 1, r.target) + '/' + r.target, 'Poin Cup ' + r.cup.pts[0]] };
  }
};
