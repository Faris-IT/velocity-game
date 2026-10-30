// Audio prosedural (Web Audio): tanpa berkas suara. Dimulai setelah interaksi pertama pemain.
MV.Audio = (function () {
  let ctx = null, master = null, eng = null, vol = 0.6, engineOn = true, sfxOn = true;
  function ensure() {
    if (ctx) return true;
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return false;
    try {
      ctx = new AC(); master = ctx.createGain(); master.gain.value = vol * 0.5; master.connect(ctx.destination);
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o1.type = 'sawtooth'; o2.type = 'square'; f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0;
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(master); o1.start(); o2.start();
      eng = { o1, o2, f, g };
    } catch (e) { ctx = null; }
    return !!ctx;
  }
  function tone(freq, dur, type, v, slide) {
    if (!sfxOn || vol === 0 || !ensure()) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(v || 0.25, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(dur, v) {
    if (!sfxOn || vol === 0 || !ensure()) return;
    const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), a = buf.getChannelData(0);
    for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 900; g.gain.value = v || 0.4;
    s.buffer = buf; s.connect(f); f.connect(g); g.connect(master); s.start();
  }
  const S = {
    ui() { tone(620, 0.05, 'triangle', 0.12); },
    count() { tone(440, 0.12, 'square', 0.18); },
    go() { tone(880, 0.35, 'square', 0.22); },
    cp() { tone(700, 0.08, 'triangle', 0.18); },
    gate() { tone(760, 0.1, 'triangle', 0.2); },
    miss() { tone(220, 0.2, 'sawtooth', 0.15); },
    token() { tone(1300, 0.07, 'sine', 0.16); },
    lap() { tone(660, 0.09, 'square', 0.18); setTimeout(() => tone(990, 0.16, 'square', 0.18), 90); },
    hit() { noise(0.18, 0.45); tone(90, 0.15, 'sawtooth', 0.2, 50); },
    win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'triangle', 0.22), i * 110)); },
    lose() { tone(330, 0.5, 'sawtooth', 0.2, 110); },
    ach() { [784, 988, 1175].forEach((f, i) => setTimeout(() => tone(f, 0.15, 'sine', 0.2), i * 90)); }
  };
  if (typeof document !== 'undefined' && document.addEventListener) {
    const unlock = () => { if (ensure() && ctx.state === 'suspended') ctx.resume(); };
    document.addEventListener('pointerdown', unlock, { passive: true });
    document.addEventListener('keydown', unlock, { passive: true });
  }
  return {
    configure(s) { vol = s.vol / 100; engineOn = s.engine; sfxOn = s.sfx; if (master) master.gain.value = vol * 0.5; },
    sfx(name) { try { if (S[name]) S[name](); } catch (e) { /* audio opsional */ } },
    // suara mesin mengikuti kecepatan; active=false saat menu/jeda
    engine(car, active) {
      if (!eng || !ctx) return;
      const t = ctx.currentTime;
      if (!active || !engineOn || vol === 0) { eng.g.gain.setTargetAtTime(0, t, 0.08); return; }
      const k = Math.min(1.4, car.speed / car.spec.top), f = 58 + k * 160 + (car.boosting ? 40 : 0);
      eng.o1.frequency.setTargetAtTime(f, t, 0.05); eng.o2.frequency.setTargetAtTime(f * 0.5, t, 0.05);
      eng.f.frequency.setTargetAtTime(380 + k * 1300, t, 0.08); eng.g.gain.setTargetAtTime(0.03 + 0.05 * k, t, 0.08);
    }
  };
})();
