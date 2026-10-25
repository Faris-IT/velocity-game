// Checkpoint harus dilewati berurutan; index 0 adalah garis start/finis dan penutup setiap putaran.
MV.Checkpoints = {
  K: 6,
  create(track) {
    const idx = [];
    for (let k = 0; k < this.K; k++) idx.push(Math.round(k * track.N / this.K) % track.N);
    return { idx, next: 0, started: false, prev: null, lapStart: 0 };
  },
  label(cp) { return cp.next === 0 ? 'Garis finis' : 'CP ' + cp.next + '/' + (this.K - 1); },
  // dipanggil tiap langkah fisika; mengembalikan event {t:'cp'|'lap'}
  update(cp, track, car, time) {
    const ev = [], N = track.N, i = car.idx;
    if (cp.prev === null) { cp.prev = i; return ev; }
    const d = ((i - cp.prev + N + N / 2) % N) - N / 2;     // selisih bertanda; negatif = mundur
    if (d > 0) {
      for (let k = 0; k < this.K; k++) {
        const dk = (cp.idx[k] - cp.prev + N) % N;
        if (dk > 0 && dk <= d && k === cp.next) {
          if (k === 0) {
            if (!cp.started) cp.started = true;                       // lintasan start pertama
            else ev.push({ t: 'lap', time: time - cp.lapStart });
            cp.lapStart = time;
          } else ev.push({ t: 'cp', k });
          cp.next = (k + 1) % this.K;
        }
      }
    }
    cp.prev = i;
    return ev;
  }
};
