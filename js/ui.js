MV.UI = (function () {
  const root = document.getElementById('screen'), S = MV.Scoring;
  let handler = function () {};
  const KEYS = ['go', 'mode', 'trial', 'mis', 'trk', 'riv', 'skl', 'rtk', 'veh', 'laps'];
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-' + KEYS.join('],[data-') + ']');
    if (!b || b.disabled) return;
    const k = KEYS.find(x => b.dataset[x] !== undefined);
    handler(k === 'go' ? b.dataset.go : k, b.dataset[k]);
  });
  function show(html, cls) { const t = root.scrollTop; root.innerHTML = html; root.className = 'on' + (cls ? ' ' + cls : ''); root.scrollTop = t; }
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const chip = (attr, val, label, on, extra) => '<button class="chip' + (on ? ' sel' : '') + (extra ? ' ' + extra : '') + '" data-' + attr + '="' + val + '">' + label + '</button>';
  const CAT = { cup: 1, grandprix: 1, timeattack: 1, perfectlap: 1, ghostrival: 1, energy: 2, boostrush: 2, driftmaster: 2, hazardrun: 3, survival: 3, checkpointblitz: 4, riskreward: 4, trials: 4 };
  const CATN = { 1: 'Balapan', 2: 'Skill', 3: 'Bertahan', 4: 'Strategi' };
  const REC = { cup: () => ['hi', 'cup'], grandprix: l => ['best', 'grandprix-' + l], timeattack: () => ['hi', 'timeattack'], perfectlap: () => ['hi', 'perfectlap'], energy: () => ['best', 'energy'],
    boostrush: () => ['best', 'boostrush'], driftmaster: () => ['best', 'driftmaster'], hazardrun: () => ['best', 'hazardrun'], ghostrival: () => ['best', 'ghostrival'],
    survival: () => ['hi', 'survival'], checkpointblitz: () => ['best', 'checkpointblitz'], riskreward: () => ['best', 'riskreward'] };

  const suf = id => MV.Storage.suf(id);
  function bestOf(id, sel) {
    const d = MV.Storage.get(), sf = suf(sel.track);
    if (id === 'trials') return Object.keys(d.medals).filter(k => k.indexOf('trials-') === 0 && (sf ? k.slice(-sf.length) === sf : k.indexOf('@') < 0)).length + '/10 misi bermedali';
    const r = REC[id](sel.laps), v = d[r[0]][r[1] + (id === 'cup' ? '' : sf)];
    if (v === undefined) return 'belum ada';
    return r[0] === 'best' ? S.fmt(v) : (id === 'survival' ? Math.round(v / 10) + '% kondisi' : v + ' poin');
  }

  return {
    onAction(fn) { handler = fn; },
    hide() { root.className = ''; root.innerHTML = ''; },
    menu() {
      const d = MV.Storage.get(), bl = d.bestLap.oval, st = d.stats;
      show('<div class="hero"><div class="kicker">MUFA GAMES #5</div><h1 class="logo">MUFA<b>VELOCITY</b></h1>' +
        '<p class="tag">Master the Track. Beat the Clock.</p>' +
        '<button class="btn primary big" data-go="play">MAIN</button>' +
        '<div class="two"><button class="btn" data-go="trials">Tutorial &amp; Uji Coba</button><button class="btn" data-go="records">Rekor</button></div>' +
        '<div class="mini"><span><b>' + st.races + '</b>balapan</span><span><b>' + st.wins + '</b>menang</span><span><b>' + (bl === undefined ? '-' : S.fmt(bl)) + '</b>putaran terbaik</span></div>' +
        '<div class="foot">12 mode &middot; 3 kendaraan &middot; Racing, Arcade, Time Trial</div></div>', 'menu');
    },
    modes(sel) {
      const d = MV.Storage.get(), cur = MV.MODE_LIST.find(m => m.id === sel.mode), sf = suf(sel.track);
      const cards = MV.MODE_LIST.map((m, i) => {
        const ok = !!MV.MODES[m.id], medal = d.medals[m.id + (m.id === 'cup' ? '' : sf)];
        return '<button class="card c' + CAT[m.id] + (sel.mode === m.id ? ' sel' : '') + (ok ? '' : ' lock') + '" data-mode="' + m.id + '"' + (ok ? '' : ' disabled') + '>' +
          '<em>' + (i < 9 ? '0' : '') + (i + 1) + '</em><b>' + m.name + '</b><i>' + m.tag + '</i><small>' + stars(m.diff) + '</small>' +
          (medal ? '<u class="medal ' + medal + '">' + medal + '</u>' : '') + '</button>';
      }).join('');
      const veh = MV.VEHICLE_ORDER.map(k => chip('veh', k, MV.VEHICLES[k].name + ' <em>' + MV.VEHICLES[k].tag + '</em>', sel.veh === k)).join('');
      const isCup = cur.id === 'cup', npcMode = cur.id === 'grandprix' || cur.id === 'boostrush';
      let opt = '';
      if (isCup) opt += '<p class="mis"><b>4 lintasan berurutan:</b> Oval, Twist, Chicane, Split. 2 putaran tiap race, 5 NPC. Poin: 10, 8, 6, 4, 2, 1.</p>';
      else {
        const T = MV.TRACKS[sel.track];
        opt += '<div class="row"><span>Lintasan</span>' + Object.keys(MV.TRACKS).map(id => chip('trk', id, MV.TRACKS[id].name.replace(' Circuit', ''), sel.track === id)).join('') + '</div>' +
          '<p class="mis"><b>' + T.name + '</b> ' + stars(T.diff) + ' - ' + T.desc + '</p>';
      }
      if (cur.id === 'grandprix') opt += '<div class="row"><span>Putaran</span>' + [3, 4, 5].map(n => chip('laps', n, n, sel.laps === n)).join('') + '</div>';
      if (npcMode) opt += '<div class="row"><span>Lawan NPC</span>' + [0, 3, 5].map(n => chip('riv', n, n ? n + ' NPC' : 'Tanpa', sel.rivals === n)).join('') + '</div>';
      if (isCup || (npcMode && sel.rivals > 0)) opt += '<div class="row"><span>Level NPC</span>' + ['Mudah', 'Normal', 'Sulit'].map((n, i) => chip('skl', i, n, sel.skill === i)).join('') + '</div>';
      if (cur.id === 'trials') {
        const ms = MV.TRIALS.map((t, i) => chip('mis', i, i + 1, sel.mission === i, d.medals['trials-' + i + sf] || '')).join('');
        const t = MV.TRIALS[sel.mission];
        opt += '<div class="row"><span>Misi</span>' + ms + '</div><p class="mis"><b>' + (sel.mission + 1) + '. ' + t.n + '</b> ' + t.d + (t.veh ? ' (kendaraan: ' + MV.VEHICLES[t.veh].name + ')' : '') + '</p>';
      }
      show('<div class="panel wide"><div class="head"><h2>Pilih Mode</h2><div class="legend">' +
        [1, 2, 3, 4].map(n => '<span class="c' + n + '">' + CATN[n] + '</span>').join('') + '</div></div>' +
        '<div class="grid">' + cards + '</div>' +
        '<div class="dock"><div class="dinfo"><b class="c' + CAT[cur.id] + '">' + cur.name + '</b> <i>' + cur.tag + '</i><p>' + cur.goal + '</p><small>Rekor: ' + bestOf(cur.id, sel) + '</small></div>' +
        '<div class="dopt"><div class="row"><span>Kendaraan</span>' + veh + '</div>' + opt + '</div>' +
        '<div class="bar"><button class="btn" data-go="menu">Kembali</button><button class="btn primary" data-go="start">Mulai</button></div></div></div>', 'sub');
    },
    pause() {
      show('<div class="panel"><h2>Jeda</h2><button class="btn primary" data-go="resume">Lanjutkan</button>' +
        '<button class="btn" data-go="retry">Ulangi</button><button class="btn" data-go="menu">Menu</button></div>', 'dim');
    },
    result(race, rec) {
      const r = race.result;
      const btns = (r.buttons || [['menu', 'Menu'], ['retry', 'Ulangi']]).map((b, i, a) => '<button class="btn' + (i === a.length - 1 ? ' primary' : '') + '" data-go="' + b[0] + '">' + b[1] + '</button>').join('');
      show('<div class="panel"><h2 class="' + (r.win ? 'win' : 'lose') + '">' + r.title + '</h2>' +
        (r.noMedal ? '' : r.medal ? '<div class="medal ' + r.medal + '">' + r.medal + '</div>' : '<div class="medal none">Tanpa medali</div>') +
        '<p class="tag">' + r.mainLabel + '</p><div class="big">' + r.main + '</div>' +
        (rec.newBest ? '<div class="badge">REKOR BARU</div>' : '') + (rec.newLap ? '<div class="badge">PUTARAN TERBAIK BARU</div>' : '') +
        '<table>' + r.lines.map(l => '<tr><td>' + l[0] + '</td><td>' + l[1] + '</td></tr>').join('') + '</table>' +
        '<div class="bar">' + btns + '</div></div>', 'dim');
    },
    trials() {
      const bar = (l, v, m) => '<div class="st"><span>' + l + '</span><div><i style="width:' + Math.min(100, Math.round(v / m * 100)) + '%"></i></div></div>';
      const cards = MV.VEHICLE_ORDER.map(k => {
        const v = MV.VEHICLES[k], i = MV.MODES.trial.INFO[k];
        return '<div class="card tcard"><b style="color:' + v.color + '">' + v.name + '</b><i>' + v.tag + '</i>' +
          bar('Top Speed', v.top, 700) + bar('Akselerasi', v.accel, 320) + bar('Handling', v.handling, 3.5) + bar('Grip', v.grip, 7) + bar('Boost', v.boost, 130) +
          '<p>' + i.goal + '</p><button class="btn primary" data-trial="' + k + '">Coba ' + v.name + '</button></div>';
      }).join('');
      show('<div class="panel wide"><h2>Tutorial &amp; Uji Coba Kendaraan</h2>' +
        '<button class="btn" data-go="tutor">Mulai Tutorial Dasar (9 langkah)</button><p class="tag">Uji coba: satu tantangan singkat untuk merasakan karakter tiap kendaraan.</p>' +
        '<div class="grid">' + cards + '</div><div class="bar"><button class="btn" data-go="menu">Kembali</button></div></div>', 'sub');
    },
    records(rt) {
      rt = rt || 'oval';
      const d = MV.Storage.get(), sf = suf(rt), t = S.fmt, n = String, v = (o, k, f) => (k in o) ? f(o[k]) : '-';
      const B = k => v(d.best, k + sf, t), Hh = (k, f) => v(d.hi, k + sf, f || n);
      const trialsN = Object.keys(d.medals).filter(k => k.indexOf('trials-') === 0 && (sf ? k.slice(-sf.length) === sf : k.indexOf('@') < 0)).length;
      const rows = [['Grand Prix 3 putaran', B('grandprix-3')], ['Grand Prix 4 putaran', B('grandprix-4')], ['Grand Prix 5 putaran', B('grandprix-5')],
        ['Time Attack (skor)', Hh('timeattack')], ['Perfect Lap (skor)', Hh('perfectlap')], ['Energy Collector', B('energy')], ['Boost Rush', B('boostrush')],
        ['Drift Master', B('driftmaster')], ['Hazard Run', B('hazardrun')], ['Survival Circuit (kondisi)', Hh('survival', x => Math.round(x / 10) + '%')],
        ['Checkpoint Blitz', B('checkpointblitz')], ['Risk & Reward', B('riskreward')], ['Ghost Rival', B('ghostrival')], ['Velocity Trials', trialsN + '/10 misi'],
        ['Putaran tercepat', v(d.bestLap, rt, t)]];
      const gen = [['Rival Cup (poin tertinggi)', v(d.hi, 'cup', n)], ['Balapan / menang', d.stats.races + ' / ' + d.stats.wins], ['Total putaran', n(d.stats.laps)], ['Total tabrakan', n(d.stats.hits)]];
      const row = l => '<tr><td>' + l[0] + '</td><td>' + l[1] + '</td></tr>';
      show('<div class="panel"><h2>Rekor</h2><div class="row">' + Object.keys(MV.TRACKS).map(id => chip('rtk', id, MV.TRACKS[id].name.replace(' Circuit', ''), rt === id)).join('') + '</div>' +
        '<table>' + rows.map(row).join('') + '</table><table>' + gen.map(row).join('') + '</table><div class="bar"><button class="btn" data-go="menu">Kembali</button></div></div>', 'sub');
    }
  };
})();
