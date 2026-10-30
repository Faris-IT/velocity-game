// Pengaturan pemain (tema, audio, kontrol) disimpan terpisah dari progres agar reset data tidak menghapusnya.
MV.THEMES = {
  neon:   { name: 'Neon',   a: '#22e5ff', b: '#b46bff', c: '#ff8a2a', edge: '#22e5ff', wall: '#ff8a2a', mid: 'rgba(180,107,255,.4)', zone: '34,229,255', grid: '90,130,255' },
  sunset: { name: 'Sunset', a: '#ff5e8a', b: '#ffb347', c: '#ffe14d', edge: '#ff5e8a', wall: '#ffb347', mid: 'rgba(255,200,120,.35)', zone: '255,150,120', grid: '255,120,160' },
  toxic:  { name: 'Toxic',  a: '#4dff9a', b: '#2bd1ff', c: '#e6ff4d', edge: '#4dff9a', wall: '#e6ff4d', mid: 'rgba(43,209,255,.35)', zone: '77,255,154', grid: '90,255,170' },
  ice:    { name: 'Ice',    a: '#9fd8ff', b: '#7a8bff', c: '#ffffff', edge: '#9fd8ff', wall: '#6aa8ff', mid: 'rgba(122,139,255,.4)', zone: '159,216,255', grid: '150,190,255' }
};
MV.Settings = (function () {
  const KEY = 'mufaVelocity.settings.v1';
  const d = { theme: 'neon', vol: 60, engine: true, sfx: true, touch: 'auto', tsize: 'md', steer: 1, unlockAll: false };
  try {
    const o = JSON.parse(localStorage.getItem(KEY));
    if (o && typeof o === 'object') {
      if (MV.THEMES[o.theme]) d.theme = o.theme;
      if ([0, 30, 60, 100].indexOf(o.vol) >= 0) d.vol = o.vol;
      if (typeof o.engine === 'boolean') d.engine = o.engine;
      if (typeof o.sfx === 'boolean') d.sfx = o.sfx;
      if (['auto', 'on', 'off'].indexOf(o.touch) >= 0) d.touch = o.touch;
      if (['sm', 'md', 'lg'].indexOf(o.tsize) >= 0) d.tsize = o.tsize;
      if ([0, 1, 2].indexOf(o.steer) >= 0) d.steer = o.steer;
      if (typeof o.unlockAll === 'boolean') d.unlockAll = o.unlockAll;
    }
  } catch (e) { /* pakai bawaan */ }
  const rgb = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16)).join(',');
  function apply() {
    const T = MV.THEMES[d.theme], st = document.documentElement.style;
    st.setProperty('--cyan', T.a); st.setProperty('--purple', T.b); st.setProperty('--orange', T.c);
    st.setProperty('--ar', rgb(T.a)); st.setProperty('--br', rgb(T.b)); st.setProperty('--cr', rgb(T.c));
    st.setProperty('--tb', { sm: '64px', md: '84px', lg: '100px' }[d.tsize]);
    document.body.dataset.theme = d.theme;
    document.body.classList.toggle('touch-on', d.touch === 'on');
    document.body.classList.toggle('touch-off', d.touch === 'off');
    MV.CONFIG.STEER_RATE = [6, 9, 14][d.steer];
    if (MV.Audio) MV.Audio.configure(d);
  }
  return {
    d, apply, theme() { return MV.THEMES[d.theme]; },
    set(k, v) { d[k] = v; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* diabaikan */ } apply(); }
  };
})();
