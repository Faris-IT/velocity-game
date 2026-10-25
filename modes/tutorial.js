// Tutorial dasar: 9 langkah, tiap langkah selesai otomatis saat syaratnya terpenuhi.
(function () {
  const K = MV.CONFIG.KMH;
  const fwd = (r, car, a, b) => (car.idx - (a % r.track.N) + r.track.N) % r.track.N < b;
  const STEPS = [
    { t: 'Gas', d: 'Tahan W / ↑ (atau tombol GAS) sampai 120 km/h.', ok: (r, c) => c.speed * K >= 120 },
    { t: 'Rem', d: 'Tekan S / ↓ (atau REM) sampai di bawah 40 km/h.', ok: (r, c) => c.speed * K < 40 },
    { t: 'Belok', d: 'Gas lagi, lalu belok kiri dan kanan (A / D atau ◀ ▶) saat melaju.', ok: r => r.tu.f.l > 0.6 && r.tu.f.r > 0.6 },
    { t: 'Checkpoint', d: 'Ikuti lintasan dan lewati 2 garis checkpoint oranye. Putaran hanya sah jika semua checkpoint dilewati berurutan.', ok: r => r.tu.f.cp >= 2 },
    { t: 'Batas lintasan', d: 'Keluar dari aspal sebentar: kecepatan turun. Lalu kembali ke lintasan. Dinding oranye memantulkan dan memperlambat.', ok: (r, c) => r.tu.f.off > 0.7 && c.onTrack },
    { t: 'Boost', d: 'Tahan SPACE (tombol BOOST) selama 1 detik. Bar energi di kiri atas terisi lagi di zona cyan pada jalur lurus.',
      init: (r, c) => { c.energy = c.spec.boost; }, ok: r => r.tu.f.boost >= 1 },
    { t: 'Sel energi', d: 'Kumpulkan 3 sel cyan di depan Anda. Setiap sel menambah energi boost.',
      init: (r, c) => { const sp = []; for (let k = 0; k < 5; k++) sp.push({ idx: c.idx + 35 + k * 22, lat: 0, kind: 'main' }); r.tokens = MV.Tokens.create(r.track, sp); },
      ok: r => r.tu.f.cells >= 3 },
    { t: 'Drift', d: 'Belok tajam saat melaju kencang sampai kendaraan menyamping. Kumpulkan 150 poin drift.',
      init: (r, c) => { r.tokens = null; r.tu.f.base = c.dr.total; }, ok: (r, c) => c.dr.total - r.tu.f.base + Math.round(c.dr.chain) >= 150 },
    { t: 'Rintangan', d: 'Hindari kerucut oranye dan penghalang ungu yang bergerak. Menabrak membuat kendaraan melambat.',
      init: (r, c) => { r.tu.f.end = c.idx + 115; r.obstacles = MV.Obstacles.create(r.track, [
        { type: 'cone', idx: c.idx + 45, lat: -30 }, { type: 'cone', idx: c.idx + 60, lat: 30 }, { type: 'cone', idx: c.idx + 75, lat: -30 },
        { type: 'barrier', idx: c.idx + 100, lat: 0, amp: 45, w: 2.2 }]); },
      ok: (r, c) => fwd(r, c, r.tu.f.end, 150) }
  ];
  MV.MODES.tutorial = {
    useDrift: true, noCountdown: true, STEPS,
    init(r) { r.tu = { i: 0, f: {}, init: false }; },
    onLap() {}, onCp(r) { r.tu.f.cp = (r.tu.f.cp || 0) + 1; },
    onToken(r) { r.tu.f.cells = (r.tu.f.cells || 0) + 1; },
    update(r, dt, car) {
      const tu = r.tu, f = tu.f, st = STEPS[tu.i];
      r.car = car;
      f.l = f.l || 0; f.r = f.r || 0; f.off = f.off || 0; f.boost = f.boost || 0; f.cp = f.cp || 0; f.cells = f.cells || 0;
      if (!tu.init) { tu.init = true; if (st.init) st.init(r, car); }
      if (car.speed > 100 && Math.abs(car.steer) > 0.5) f[car.steer < 0 ? 'l' : 'r'] += dt;
      if (!car.onTrack) f.off += dt;
      if (car.boosting) f.boost += dt;
      if (!st.ok(r, car)) return;
      r.flash('Bagus!', 1.1); tu.i++; tu.f = {}; tu.init = false;
      if (tu.i < STEPS.length) return;
      r.end({ win: true, noMedal: true, title: 'TUTORIAL SELESAI', mainLabel: 'Dasar dikuasai', main: STEPS.length + '/' + STEPS.length,
        lines: [['Berikutnya', 'Coba uji coba tiap kendaraan']], recordKey: null, buttons: [['trials', 'Uji Coba Kendaraan'], ['menu', 'Menu']] });
    },
    hud(r) {
      const i = Math.min(r.tu.i, STEPS.length - 1), st = STEPS[i];
      return { timer: null, lines: [], coach: '<b>Langkah ' + (i + 1) + '/' + STEPS.length + ' - ' + st.t + '</b><div>' + st.d + '</div>' +
        '<div class="pb"><i style="width:' + Math.round(i / STEPS.length * 100) + '%"></i></div><button id="skip">Lewati tutorial</button>' };
    }
  };
})();
