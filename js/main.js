(function () {
  const C = MV.CONFIG, R = MV.Renderer, UI = MV.UI;
  const $ = id => document.getElementById(id);
  const cache = {};
  const getTrack = id => cache[id] || (cache[id] = MV.buildTrack(MV.TRACKS[id]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const freshCup = () => ({ race: 0, pts: [0, 0, 0, 0, 0, 0] });
  const el = { kmh: $('kmh'), name: $('vname'), msg: $('msg'), stats: $('stats'), center: $('center'), fx: $('fx'), coach: $('coach'), boost: $('boost'), bfill: $('bfill'), hp: $('hp'), hpfill: $('hpfill') };
  const sel = { mode: 'grandprix', veh: 'viper', laps: 3, mission: 0, track: 'oval', rivals: 3, skill: 1, rtrack: 'oval' };
  let track = getTrack('oval'), car, race = null, phase = 'menu', paused = false, acc = 0, last = performance.now(), lastStart = { id: 'grandprix' };
  const shown = { kmh: -1, msg: '', stats: '', center: '', fx: '', coach: '', bar: -1 };

  R.init($('game'), track);

  function useTrack(id) { if (track.id !== id) { track = getTrack(id); R.setTrack(track); } }
  function setCar(veh) {
    car = MV.createCar(veh, track.start); acc = 0; R.snap(car);
    el.name.textContent = car.spec.name + ' - ' + car.spec.tag;
  }
  function idle() { race = null; setCar(sel.veh); }
  function startRace(c) {
    lastStart = c || lastStart;
    const id = lastStart.id;
    useTrack(id === 'tutorial' || id === 'trial' ? 'oval' : id === 'cup' ? MV.MODES.cup.TRACKS[lastStart.cup.race] : sel.track);
    setCar(lastStart.veh || sel.veh);
    const def = MV.MODE_LIST.find(m => m.id === id) || { id, name: id };
    race = MV.newRace(def, { laps: sel.laps, veh: lastStart.veh || sel.veh, mission: lastStart.mission || 0, rivals: sel.rivals, skill: sel.skill,
                             cup: lastStart.cup ? clone(lastStart.cup) : null }, track);
    if (race.playerStart) { const s = race.playerStart; car.x = s.x; car.y = s.y; car.angle = s.angle; car.idx = s.idx; R.snap(car); }   // posisi di grid start
    if (race.mode.noCountdown) race.cd = 0;
    phase = 'countdown'; paused = false; UI.hide();
  }
  function setPaused(p) {
    if (phase !== 'racing' && phase !== 'countdown') return;
    paused = p; if (p) UI.pause(); else UI.hide();
  }
  function toMenu() { phase = 'menu'; paused = false; useTrack(sel.track); idle(); UI.menu(); }

  UI.onAction((a, v) => {
    if (a === 'play') UI.modes(sel);
    else if (a === 'records') UI.records(sel.rtrack);
    else if (a === 'rtk') { sel.rtrack = v; UI.records(v); }
    else if (a === 'trials') UI.trials();
    else if (a === 'tutor') startRace({ id: 'tutorial' });
    else if (a === 'trial') startRace({ id: 'trial', veh: v });
    else if (a === 'menu') toMenu();
    else if (a === 'mode') { sel.mode = v; UI.modes(sel); }
    else if (a === 'veh') { sel.veh = v; idle(); UI.modes(sel); }
    else if (a === 'laps') { sel.laps = +v; UI.modes(sel); }
    else if (a === 'trk') { sel.track = v; useTrack(v); idle(); UI.modes(sel); }          // demo di belakang ikut berganti lintasan
    else if (a === 'riv') { sel.rivals = +v; UI.modes(sel); }
    else if (a === 'skl') { sel.skill = +v; UI.modes(sel); }
    else if (a === 'mis') { sel.mission = +v; UI.modes(sel); }
    else if (a === 'start') startRace(sel.mode === 'cup' ? { id: 'cup', cup: freshCup() }
      : { id: sel.mode, mission: sel.mission, veh: sel.mode === 'trials' ? MV.TRIALS[sel.mission].veh : undefined });
    else if (a === 'next') startRace({ id: 'cup', cup: clone(race.opts.cup) });
    else if (a === 'cupnew') startRace({ id: 'cup', cup: freshCup() });
    else if (a === 'retry') startRace();
    else if (a === 'resume') setPaused(false);
  });
  MV.Input.on(code => {
    if (code === 'KeyP' || code === 'Escape') setPaused(!paused);
    else if (code === 'KeyR' && phase !== 'menu') startRace();
  });
  el.coach.addEventListener('click', e => { if (e.target.id === 'skip') { MV.Storage.setFlag('tutorial'); toMenu(); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) setPaused(true); });

  function finish() {
    if (race.def.id === 'tutorial') MV.Storage.setFlag('tutorial');
    UI.result(race, MV.Storage.record(race));
  }

  function hud() {
    const kmh = Math.round(car.speed * C.KMH);
    if (kmh !== shown.kmh) { shown.kmh = kmh; el.kmh.textContent = kmh; }
    const bar = Math.round(car.energy / car.spec.boost * 100);
    if (bar !== shown.bar) { shown.bar = bar; el.bfill.style.width = bar + '%'; }
    el.boost.classList.toggle('chg', car.charging);
    const useHP = !!(race && phase !== 'menu' && race.mode.useHP);
    el.hp.classList.toggle('on', useHP);
    if (useHP) el.hpfill.style.width = Math.max(0, race.hp) + '%';
    document.body.classList.toggle('menu', phase === 'menu');
    let msg = '', center = '', stats = '', coach = '', fx = '';
    if (race && phase !== 'menu') {
      const h = race.mode.hud(race);
      if (h.timer !== null) stats = '<div class="tm">' + h.timer + '</div>' + h.lines.filter(Boolean).map(l => '<div>' + l + '</div>').join('');
      if (h.coach) coach = h.coach;
      if (phase === 'countdown') center = String(Math.max(1, Math.ceil(race.cd)));
      else if (phase === 'racing') {
        if (race.goT > 0 && !race.mode.noCountdown) center = 'GO!';
        msg = !car.onTrack ? 'Kembali ke lintasan' : (race.msgT > 0 ? race.msg : '');
        if (race.mode.useDrift && car.dr.on) fx = 'DRIFT x' + car.dr.mult + '  +' + Math.round(car.dr.chain);
      }
    }
    if (msg !== shown.msg) { shown.msg = msg; el.msg.textContent = msg; }
    if (center !== shown.center) { shown.center = center; el.center.textContent = center; }
    if (fx !== shown.fx) { shown.fx = fx; el.fx.textContent = fx; }
    if (stats !== shown.stats) { shown.stats = stats; el.stats.innerHTML = stats; }
    if (coach !== shown.coach) { shown.coach = coach; el.coach.innerHTML = coach; el.coach.classList.toggle('on', !!coach); }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, C.MAX_FRAME); last = now;
    if (phase === 'menu') {                                  // demo otomatis di belakang menu
      acc += dt;
      while (acc >= C.STEP) { MV.stepCar(car, MV.Demo.inp(car, track, C.STEP), C.STEP, track); acc -= C.STEP; }
      R.update(dt, car);
    } else if (!paused) {
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

  if (MV.Storage.get().flags.tutorial) { idle(); UI.menu(); }
  else { idle(); startRace({ id: 'tutorial' }); }    // pemain baru langsung masuk tutorial
  requestAnimationFrame(frame);
})();
