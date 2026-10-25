// Ambang medali adalah perkiraan awal; sesuaikan setelah mencoba langsung.
MV.Scoring = {
  GP_PER_LAP: { Gold: 16.5, Silver: 20, Bronze: 28 },   // detik per putaran (waktu + penalti)
  TA_SCORE: { Gold: 6500, Silver: 5000, Bronze: 3000 },
  TA_LAP_TARGET: 22, TA_HIT_PENALTY: 50,
  fmt(t) { t = Math.max(0, t); const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(2); },
  medalLow(v, T) { return v <= T.Gold ? 'Gold' : v <= T.Silver ? 'Silver' : v <= T.Bronze ? 'Bronze' : null; },
  medalHigh(v, T) { return v >= T.Gold ? 'Gold' : v >= T.Silver ? 'Silver' : v >= T.Bronze ? 'Bronze' : null; },
  best(list) { return list.length ? Math.min.apply(null, list) : null; },
  lapBonus(lt) { return 1000 + Math.max(0, Math.round((this.TA_LAP_TARGET - lt) * 30)); },
  finishGrandPrix(r) {
    const total = r.time + r.penalty, per = total / r.laps, M = this.GP_PER_LAP;
    const medal = per <= M.Gold ? 'Gold' : per <= M.Silver ? 'Silver' : per <= M.Bronze ? 'Bronze' : null;
    r.end({ win: true, title: 'FINISH!', mainLabel: 'Waktu akhir', main: this.fmt(total), medal,
      lines: [['Waktu balap', this.fmt(r.time)],
              ['Penalti', '+' + r.penalty.toFixed(1) + ' dtk (' + r.hits + ' tabrakan)'],
              ['Putaran terbaik', this.fmt(this.best(r.lapTimes))]],
      recordKey: 'grandprix-' + r.laps, value: total, better: 'low' });
  },
  finishTimeAttack(r) {
    const score = Math.max(0, r.score - r.hits * this.TA_HIT_PENALTY), M = this.TA_SCORE;
    const medal = score >= M.Gold ? 'Gold' : score >= M.Silver ? 'Silver' : score >= M.Bronze ? 'Bronze' : null;
    r.end({ win: !!medal, title: medal ? 'WAKTU HABIS' : 'WAKTU HABIS - BELUM MEDALI', mainLabel: 'Skor akhir', main: String(score), medal,
      lines: [['Putaran valid', String(r.laps)],
              ['Putaran terbaik', r.lapTimes.length ? this.fmt(this.best(r.lapTimes)) : '-'],
              ['Tabrakan', r.hits + ' (-' + r.hits * this.TA_HIT_PENALTY + ' skor)']],
      recordKey: 'timeattack', value: score, better: 'high' });
  }
};
