(function () {
  const C = MV.CONFIG, R = MV.Renderer;
  const track = MV.buildTrack(MV.TRACKS.oval);
  const el = { kmh: document.getElementById('kmh'), name: document.getElementById('vname'), msg: document.getElementById('msg') };
  let car, vIndex = 0, paused = false, acc = 0, last = performance.now(), shownKmh = -1, shownMsg = '';

  R.init(document.getElementById('game'), track);

  function reset() {
    car = MV.createCar(MV.VEHICLE_ORDER[vIndex], track.start);
    acc = 0; R.snap(car);
    el.name.textContent = car.spec.name + ' - ' + car.spec.tag;
  }

  MV.Input.on(code => {
    if (code === 'KeyP' || code === 'Escape') paused = !paused;
    else if (code === 'KeyR') reset();
    else if (code >= 'Digit1' && code <= 'Digit3') { vIndex = +code.slice(5) - 1; reset(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) paused = true; });   // tab nonaktif = jeda

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, C.MAX_FRAME); last = now;
    if (!paused) {
      acc += dt;
      const inp = MV.Input.read();
      while (acc >= C.STEP) { MV.stepCar(car, inp, C.STEP, track); acc -= C.STEP; }
      R.update(dt, car);
    }
    R.draw(car);

    const kmh = Math.round(car.speed * C.KMH);
    if (kmh !== shownKmh) { shownKmh = kmh; el.kmh.textContent = kmh; }
    const m = paused ? 'JEDA' : (!car.onTrack ? 'Kembali ke lintasan' : '');
    if (m !== shownMsg) { shownMsg = m; el.msg.textContent = m; }
  }

  reset();
  requestAnimationFrame(frame);
})();
