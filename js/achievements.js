// Progres: kendaraan yang terbuka dan achievement.
MV.Progress = {
  REQ: { phantom: { n: 5, what: 'balapan', val: d => d.stats.races }, drift: { n: 3, what: 'medali', val: d => Object.keys(d.medals).length } },
  unlocked(key) {
    if (key === 'viper' || MV.Settings.d.unlockAll) return true;
    const r = this.REQ[key]; return r ? r.val(MV.Storage.get()) >= r.n : true;
  },
  req(key) { const r = this.REQ[key]; return r ? 'Selesaikan ' + r.n + ' ' + r.what + ' (' + Math.min(r.n, r.val(MV.Storage.get())) + '/' + r.n + ')' : ''; }
};

MV.Ach = {
  count() { return Object.keys(MV.Storage.get().ach).length; },
  // dipanggil setelah hasil dicatat; mengembalikan daftar achievement yang baru terbuka
  check(race) {
    const res = race.result, d = MV.Storage.get(), id = race.def.id, got = [], give = k => { if (!d.ach[k]) { MV.Storage.grant(k); got.push(MV.ACH.find(a => a.id === k)); } };
    if (!res || !res.recordKey || id === 'tutorial' || id === 'trial') return got;
    if (res.win) give('first');
    if (res.win && id === 'timeattack' && (res.medal === 'Silver' || res.medal === 'Gold')) give('speed');
    if (res.win && id === 'perfectlap' && race.pen === 0) give('perfect');
    if (res.win && id === 'boostrush' && res.eff >= 80) give('boost');
    if (res.win && id === 'energy' && res.all) give('hoarder');
    if (res.win && id === 'driftmaster') give('drift');
    if (res.win && id === 'ghostrival' && res.beatOwn) give('ghost');
    if (res.win && id === 'hazardrun' && race.hits === 0) give('untouch');
    if (res.win && id === 'checkpointblitz') give('champ');
    const base = MV.MODE_LIST.filter(m => m.id !== 'cup');
    if (base.every(m => d.won[m.id]) && MV.ACH.filter(a => a.id !== 'legend' && d.ach[a.id]).length >= 7) give('legend');
    return got;
  }
};
