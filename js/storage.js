// localStorage dengan validasi: data kosong atau rusak tidak boleh membuat game gagal dibuka.
MV.Storage = (function () {
  const KEY = 'mufaVelocity.v1';
  const blank = () => ({ best: {}, hi: {}, bestLap: {}, stats: { races: 0, wins: 0, laps: 0, hits: 0 } });
  let data = blank();
  const num = v => typeof v === 'number' && isFinite(v) && v >= 0;
  const cleanMap = o => { const r = {}; if (o && typeof o === 'object') for (const k in o) if (num(o[k])) r[k] = o[k]; return r; };

  try {
    const o = JSON.parse(localStorage.getItem(KEY));
    if (o && typeof o === 'object') {
      data.best = cleanMap(o.best); data.hi = cleanMap(o.hi); data.bestLap = cleanMap(o.bestLap);
      for (const k in data.stats) if (o.stats && num(o.stats[k])) data.stats[k] = o.stats[k];
    }
  } catch (e) { /* abaikan, pakai data kosong */ }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* penyimpanan penuh/diblokir */ } }

  return {
    get() { return data; },
    // dipanggil sekali per balapan setelah hasil keluar
    record(race) {
      if (race.recorded) return race.recInfo;
      race.recorded = true;
      const res = race.result, k = res.recordKey, st = data.stats, info = { newBest: false, newLap: false };
      st.races++; if (res.win) st.wins++; st.laps += race.laps; st.hits += race.hits;
      if (res.better === 'low') { if (!(k in data.best) || res.value < data.best[k]) { info.newBest = true; data.best[k] = res.value; } }
      else if (!(k in data.hi) || res.value > data.hi[k]) { info.newBest = res.value > 0; if (info.newBest) data.hi[k] = res.value; }
      const bl = MV.Scoring.best(race.lapTimes);
      if (bl !== null && (!('oval' in data.bestLap) || bl < data.bestLap.oval)) { info.newLap = true; data.bestLap.oval = bl; }
      save(); race.recInfo = info; return info;
    }
  };
})();
