MV.Input = (function () {
  const map = { KeyW:'up', ArrowUp:'up', KeyS:'down', ArrowDown:'down', KeyA:'left', ArrowLeft:'left',
                KeyD:'right', ArrowRight:'right', Space:'boost' };
  const key = {}, touch = {}, handlers = [];
  const emit = c => handlers.forEach(h => h(c));

  addEventListener('keydown', e => {
    const a = map[e.code];
    if (a) { key[a] = true; e.preventDefault(); }
    if (!e.repeat) emit(e.code);
  });
  addEventListener('keyup', e => { const a = map[e.code]; if (a) key[a] = false; });
  addEventListener('blur', () => { for (const k in key) key[k] = false; for (const k in touch) touch[k] = false; });

  document.querySelectorAll('[data-act]').forEach(b => {
    const act = b.dataset.act;
    const press = e => { e.preventDefault(); b.classList.add('on'); if (act === 'pause') emit('KeyP'); else touch[act] = true; };
    const release = e => { e.preventDefault(); b.classList.remove('on'); touch[act] = false; };
    b.addEventListener('pointerdown', press);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => b.addEventListener(t, release));
  });

  return {
    on(fn) { handlers.push(fn); },
    read() {
      const l = key.left || touch.left, r = key.right || touch.right;
      return { throttle: !!(key.up || touch.up), brake: !!(key.down || touch.down), steer: (r ? 1 : 0) - (l ? 1 : 0) };
    }
  };
})();
