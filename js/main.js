(function () {
  const C = MV.CONFIG, R = MV.Renderer, UI = MV.UI, S = MV.Scoring;
  const $ = id => document.getElementById(id);
  const track = MV.buildTrack(MV.TRACKS.oval);
  const el = { kmh: $('kmh'), name: $('vname'), msg: $('msg'), stats: $('stats'), center: $('center') };
  const sel = { mode: 'grandprix', veh: 'viper', laps: 3 };
  let car, race = null, phase = 'menu', paused = false, acc = 0, last = performance.now();
  const shown = { kmh: -1, msg: '', stats: '', center: '' };

  R.init($('game'), track);

  function idle() {
    car = MV.createCar(sel.veh, track.start); race = null; acc = 0; R.snap(car);
    el.name.textContent = car.spec.name + ' - ' + car.spec.tag;
  }
  function startRace() {
    idle();
    race = MV.newRace(MV.MODE_LIST.find(m => m.id === sel.mode), { laps: sel.laps }, track);
    phase = 'countdown'; paused = false; UI.hide();
  }
  function setPaused(p) {
    if (phase !== 'racing' && phase !== 'countdown') return;
    paused = p; if (p) UI.pause(); else UI.hide();
  }

  UI.onAction((a, v) => {
    if (a === 'play') UI.modes(sel);
    else if (a === 'records') UI.records();
    else if (a === 'menu') { phase = 'menu'; paused = false; idle(); UI.menu(); }
    else if (a === 'mode') { sel.mode = v; UI.modes(sel); }
    else if (a === 'veh') { sel.veh = v; idle(); UI.modes(sel); }
    else if (a === 'laps') { sel.laps = +v; UI.modes(sel); }
    else if (a === 'start' || a === 'retry') startRace();
    else if (a === 'resume') setPaused(false);
  });
  MV.Input.on(code => {
    if (code === 'KeyP' || code === 'Escape') setPaused(!paused);
    else if (code === 'KeyR' && phase !== 'menu') startRace();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) setPaused(true); });

  function finish() { UI.result(race, MV.Storage.record(race)); }

  function hud() {
    const kmh = Math.round(car.speed * C.KMH);
    if (kmh !== shown.kmh) { shown.kmh = kmh; el.kmh.textContent = kmh; }
    let msg = '', center = '', stats = '';
    if (race && phase !== 'menu') {
      const h = race.mode.hud(race);
      stats = '<div class="tm">' + h.timer + '</div>' + h.lines.map(l => '<div>' + l + '</div>').join('');
      if (phase === 'countdown') center = String(Math.max(1, Math.ceil(race.cd)));
      else if (phase === 'racing') { if (race.goT > 0) center = 'GO!'; msg = !car.onTrack ? 'Kembali ke lintasan' : (race.msgT > 0 ? race.msg : ''); }
    }
    if (msg !== shown.msg) { shown.msg = msg; el.msg.textContent = msg; }
    if (center !== shown.center) { shown.center = center; el.center.textContent = center; }
    if (stats !== shown.stats) { shown.stats = stats; el.stats.innerHTML = stats; }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, C.MAX_FRAME); last = now;
    if (!paused) {
      if (phase === 'countdown') { race.cd -= dt; if (race.cd <= 0) { phase = 'racing'; race.goT = 0.9; acc = 0; } }
      else if (phase === 'racing') {
        acc += dt;
        const inp = MV.Input.read();
        while (acc >= C.STEP && !race.result) { MV.stepRace(race, car, inp, track, C.STEP); acc -= C.STEP; }
        race.goT -= dt; race.msgT -= dt;
        if (race.result) { phase = 'result'; finish(); }
      }
      R.update(dt, car);
    }
    R.draw(car, race);
    hud();
  }

  idle(); UI.menu();
  requestAnimationFrame(frame);
})();
