(function () {
  const C = MV.CONFIG, R = MV.Renderer, UI = MV.UI, A = MV.Audio;
  const $ = id => document.getElementById(id);
  const clone = o => JSON.parse(JSON.stringify(o));
  const freshCup = () => ({ race: 0, pts: [0, 0, 0, 0, 0, 0] });
  const el = { kmh: $('kmh'), name: $('vname'), msg: $('msg'), stats: $('stats'), center: $('center'), fx: $('fx'), coach: $('coach'), boost: $('boost'), bfill: $('bfill'), hp: $('hp'), hpfill: $('hpfill') };
  const sel = { mode: 'grandprix', veh: 'viper', laps: 3, mission: 0, track: 'oval', rivals: 3, skill: 1, rtrack: 'oval', step: 0, view: 'wizard', confirmReset: false };
  MV.Settings.apply();
  let track = MV.getTrack('oval'), car, race = null, phase = 'menu', paused = false, acc = 0, last = performance.now(), lastStart = { id: 'grandprix' }, cdShown = 99;
  const shown = { kmh: -1, msg: '', stats: '', center: '', fx: '', coach: '', bar: -1 };

  R.init($('game'), track);

  function useTrack(id) { if (track.id !== id) { track = MV.getTrack(id); R.setTrack(track); } }
  function setCar(veh) {
    car = MV.createCar(veh, track.start); acc = 0; R.snap(car);
    el.name.textContent = car.spec.name + ' - ' + car.spec.tag;
  }
  const usable = k => MV.Progress.unlocked(k) ? k : 'viper';           // kendaraan terkunci tidak bisa dipakai balapan
  function idle() { race = null; setCar(usable(sel.veh)); }
  function startRace(c) {
    lastStart = c || lastStart;
    const id = lastStart.id;
    useTrack(id === 'tutorial' || id === 'trial' ? 'oval' : id === 'cup' ? MV.MODES.cup.TRACKS[lastStart.cup.race] : sel.track);
    const veh = lastStart.veh || usable(sel.veh);
    setCar(veh);
    const def = MV.MODE_LIST.find(m => m.id === id) || { id, name: id };
    race = MV.newRace(def, { laps: sel.laps, veh, mission: lastStart.mission || 0, rivals: sel.rivals, skill: sel.skill, cup: lastStart.cup ? clone(lastStart.cup) : null }, track);
    if (race.playerStart) { const s = race.playerStart; car.x = s.x; car.y = s.y; car.angle = s.angle; car.idx = s.idx; R.snap(car); }   // posisi di grid start
    if (race.mode.noCountdown) race.cd = 0;
    cdShown = 99; phase = 'countdown'; paused = false; UI.hide();
  }
  function setPaused(p) {
    if (phase !== 'racing' && phase !== 'countdown') return;
    paused = p; if (p) UI.pause(); else UI.hide();
  }
  function toMenu() { phase = 'menu'; paused = false; sel.view = 'wizard'; useTrack(sel.track); idle(); UI.menu(); }
  const wiz = () => { sel.view = 'wizard'; UI.wizard(sel); };
  const rerender = () => sel.view === 'garage' ? UI.garage(sel) : UI.wizard(sel);
  const parse = v => v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v;

  UI.onAction((a, v) => {
    if (a === 'play') { sel.step = 0; wiz(); }
    else if (a === 'wnext') { sel.step++; wiz(); }
    else if (a === 'wback') { if (sel.step === 0) toMenu(); else { sel.step--; wiz(); } }
    else if (a === 'step') { sel.step = +v; wiz(); }
    else if (a === 'mode') { sel.mode = v; wiz(); }
    else if (a === 'veh') { sel.veh = v; idle(); rerender(); }
    else if (a === 'trk') { sel.track = v; useTrack(v); idle(); wiz(); }          // demo di belakang ikut berganti lintasan
    else if (a === 'laps') { sel.laps = +v; wiz(); }
    else if (a === 'riv') { sel.rivals = +v; wiz(); }
    else if (a === 'skl') { sel.skill = +v; wiz(); }
    else if (a === 'mis') { sel.mission = +v; wiz(); }
    else if (a === 'garage') { sel.view = 'garage'; UI.garage(sel); }
    else if (a === 'ach') UI.ach();
    else if (a === 'settings') { sel.confirmReset = false; UI.settings(sel); }
    else if (a === 'set') { const i = v.indexOf('='), k = v.slice(0, i); MV.Settings.set(k, parse(v.slice(i + 1))); if (k === 'theme') R.setTrack(track); UI.settings(sel); }
    else if (a === 'reset1') { sel.confirmReset = true; UI.settings(sel); }
    else if (a === 'reset0') { sel.confirmReset = false; UI.settings(sel); }
    else if (a === 'reset2') { MV.Storage.reset(); sel.confirmReset = false; sel.veh = 'viper'; idle(); UI.settings(sel); }
    else if (a === 'records') UI.records(sel.rtrack);
    else if (a === 'rtk') { sel.rtrack = v; UI.records(v); }
    else if (a === 'trials') UI.trials();
    else if (a === 'tutor') startRace({ id: 'tutorial' });
    else if (a === 'trial') startRace({ id: 'trial', veh: v });
    else if (a === 'menu') toMenu();
    else if (a === 'start') {
      const forced = sel.mode === 'trials' ? MV.TRIALS[sel.mission].veh : undefined;
      startRace(sel.mode === 'cup' ? { id: 'cup', cup: freshCup() } : { id: sel.mode, mission: sel.mission, veh: forced });
    }
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
    const rec = MV.Storage.record(race), ach = MV.Ach.check(race);
    A.sfx(race.result.win ? 'win' : 'lose'); if (ach.length) setTimeout(() => A.sfx('ach'), 700);
    UI.result(race, rec, ach);
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
      R.update(dt, car); A.engine(car, false);
    } else if (!paused) {
      if (phase === 'countdown') {
        race.cd -= dt;
        const c = Math.ceil(race.cd); if (c !== cdShown && c > 0 && !race.mode.noCountdown) { cdShown = c; A.sfx('count'); }
        if (race.cd <= 0) { phase = 'racing'; race.goT = 0.9; acc = 0; if (!race.mode.noCountdown) A.sfx('go'); }
      } else if (phase === 'racing') {
        acc += dt;
        const inp = MV.Input.read();
        while (acc >= C.STEP && !race.result) { MV.stepRace(race, car, inp, track, C.STEP); acc -= C.STEP; }
        race.ev.splice(0).forEach(n => A.sfx(n));
        race.goT -= dt; race.msgT -= dt;
        if (race.result) { phase = 'result'; finish(); }
      }
      R.update(dt, car); A.engine(car, phase === 'racing');
    } else A.engine(car, false);
    R.draw(car, race);
    hud();
  }

  if (MV.Storage.get().flags.tutorial) { idle(); UI.menu(); }
  else { idle(); startRace({ id: 'tutorial' }); }    // pemain baru langsung masuk tutorial
  requestAnimationFrame(frame);
})();
