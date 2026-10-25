MV.MODES.riskreward = {
  T: { Gold: 30, Silver: 34, Bronze: 40 }, GOAL: 1500, PENALTY: 75,
  init(r) {
    const N = r.track.N, T = MV.Tokens, sp = [];
    for (let i = 0; i < 20; i++) { const idx = (i * 40 + 8) % N; sp.push({ idx, lat: -T.insideSign(r.track, idx) * 62, kind: 'out', v: 30 }); }   // jalur luar: murah, aman
    for (let i = 0; i < 16; i++) { const idx = (i * 50 + 20) % N; sp.push({ idx, lat: T.insideSign(r.track, idx) * 62, kind: 'in', v: 60 }); }    // jalur dalam: mahal, sulit
    r.tokens = T.create(r.track, sp); r.credits = 0; r.target = 2; r.limit = 70;
  },
  win(r) {
    const S = MV.Scoring;
    r.end({ win: true, title: 'TARGET TERCAPAI!', mainLabel: 'Waktu', main: S.fmt(r.time), medal: S.medalLow(r.time, this.T),
      lines: [['Kredit', String(r.credits)], ['Tabrakan', String(r.hits)], ['Putaran', String(r.laps)]], recordKey: 'riskreward', value: r.time, better: 'low' });
  },
  onToken(r, t) { r.credits += t.v; if (r.credits >= this.GOAL) this.win(r); },
  onLap(r) {
    r.tokens.forEach(t => { t.alive = true; });                      // token muncul lagi tiap putaran
    if (r.laps >= r.target && r.credits < this.GOAL) r.end({ win: false, title: 'KREDIT KURANG', mainLabel: 'Kredit', main: r.credits + ' / ' + this.GOAL, medal: null,
      lines: [['Finis tanpa target tidak dihitung menang', '']], recordKey: null });
  },
  update(r) {
    if (r.dHits > 0) r.credits = Math.max(0, r.credits - this.PENALTY * r.dHits);
    if (r.time >= r.limit) r.end({ win: false, title: 'WAKTU HABIS', mainLabel: 'Kredit', main: r.credits + ' / ' + this.GOAL, medal: null, lines: [], recordKey: null });
  },
  hud(r) { return { timer: MV.Scoring.fmt(Math.max(0, r.limit - r.time)), lines: ['Kredit ' + r.credits + '/' + this.GOAL, 'Putaran ' + Math.min(r.laps + 1, r.target) + '/' + r.target, 'Oranye = jalur dalam (60), cyan = luar (30)'] }; }
};
