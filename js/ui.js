MV.UI = (function () {
  const root = document.getElementById('screen'), S = MV.Scoring;
  let handler = function () {};
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-go],[data-mode],[data-veh],[data-laps],[data-trial],[data-mis]');
    if (!b || b.disabled) return;
    const d = b.dataset;
    handler(d.go || (d.mode ? 'mode' : d.trial ? 'trial' : d.mis ? 'mis' : d.veh ? 'veh' : 'laps'), d.mode || d.trial || d.mis || d.veh || d.laps);
  });
  function show(html, cls) { const t = root.scrollTop; root.innerHTML = html; root.className = 'on' + (cls ? ' ' + cls : ''); root.scrollTop = t; }
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const chip = (attr, val, label, on, extra) => '<button class="chip' + (on ? ' sel' : '') + (extra ? ' ' + extra : '') + '" data-' + attr + '="' + val + '">' + label + '</button>';
  const CAT = { grandprix: 1, timeattack: 1, perfectlap: 1, ghostrival: 1, energy: 2, boostrush: 2, driftmaster: 2, hazardrun: 3, survival: 3, checkpointblitz: 4, riskreward: 4, trials: 4 };
  const CATN = { 1: 'Balapan', 2: 'Skill', 3: 'Bertahan', 4: 'Strategi' };
  const REC = { grandprix: l => ['best', 'grandprix-' + l], timeattack: () => ['hi', 'timeattack'], perfectlap: () => ['hi', 'perfectlap'], energy: () => ['best', 'energy'],
    boostrush: () => ['best', 'boostrush'], driftmaster: () => ['best', 'driftmaster'], hazardrun: () => ['best', 'hazardrun'], ghostrival: () => ['best', 'ghostrival'],
    survival: () => ['hi', 'survival'], checkpointblitz: () => ['best', 'checkpointblitz'], riskreward: () => ['best', 'riskreward'] };

  function bestOf(id, sel) {
    const d = MV.Storage.get();
    if (id === 'trials') return Object.keys(d.medals).filter(k => k.indexOf('trials-') === 0).length + '/10 misi bermedali';
    const r = REC[id](sel.laps), v = d[r[0]][r[1]];
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
      const d = MV.Storage.get(), cur = MV.MODE_LIST.find(m => m.id === sel.mode);
      const cards = MV.MODE_LIST.map((m, i) => {
        const ok = !!MV.MODES[m.id], medal = d.medals[m.id];
        return '<button class="card c' + CAT[m.id] + (sel.mode === m.id ? ' sel' : '') + (ok ? '' : ' lock') + '" data-mode="' + m.id + '"' + (ok ? '' : ' disabled') + '>' +
          '<em>' + (i < 9 ? '0' : '') + (i + 1) + '</em><b>' + m.name + '</b><i>' + m.tag + '</i><small>' + stars(m.diff) + '</small>' +
          (medal ? '<u class="medal ' + medal + '">' + medal + '</u>' : '') + '</button>';
      }).join('');
      const veh = MV.VEHICLE_ORDER.map(k => chip('veh', k, MV.VEHICLES[k].name + ' <em>' + MV.VEHICLES[k].tag + '</em>', sel.veh === k)).join('');
      let opt = '';
      if (sel.mode === 'grandprix') opt = '<div class="row"><span>Putaran</span>' + [3, 4, 5].map(n => chip('laps', n, n, sel.laps === n)).join('') + '</div>';
      if (sel.mode === 'trials') {
        const ms = MV.TRIALS.map((t, i) => chip('mis', i, i + 1, sel.mission === i, d.medals['trials-' + i] || '')).join('');
        const t = MV.TRIALS[sel.mission];
        opt = '<div class="row"><span>Misi</span>' + ms + '</div><p class="mis"><b>' + (sel.mission + 1) + '. ' + t.n + '</b> ' + t.d + (t.veh ? ' (kendaraan: ' + MV.VEHICLES[t.veh].name + ')' : '') + '</p>';
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
    records() {
      const d = MV.Storage.get(), v = (o, k, f) => (k in o) ? f(o[k]) : '-', t = S.fmt, n = String;
      const rows = [['Grand Prix 3 putaran', v(d.best, 'grandprix-3', t)], ['Grand Prix 4 putaran', v(d.best, 'grandprix-4', t)], ['Grand Prix 5 putaran', v(d.best, 'grandprix-5', t)],
        ['Time Attack (skor)', v(d.hi, 'timeattack', n)], ['Perfect Lap (skor)', v(d.hi, 'perfectlap', n)], ['Energy Collector', v(d.best, 'energy', t)], ['Boost Rush', v(d.best, 'boostrush', t)],
        ['Drift Master', v(d.best, 'driftmaster', t)], ['Hazard Run', v(d.best, 'hazardrun', t)], ['Survival Circuit (kondisi)', v(d.hi, 'survival', x => Math.round(x / 10) + '%')],
        ['Checkpoint Blitz', v(d.best, 'checkpointblitz', t)], ['Risk & Reward', v(d.best, 'riskreward', t)], ['Ghost Rival', v(d.best, 'ghostrival', t)],
        ['Velocity Trials', Object.keys(d.medals).filter(k => k.indexOf('trials-') === 0).length + '/10 misi'], ['Putaran tercepat (Oval)', v(d.bestLap, 'oval', t)],
        ['Balapan / menang', d.stats.races + ' / ' + d.stats.wins], ['Total putaran', n(d.stats.laps)], ['Total tabrakan', n(d.stats.hits)]];
      show('<div class="panel"><h2>Rekor</h2><table>' + rows.map(l => '<tr><td>' + l[0] + '</td><td>' + l[1] + '</td></tr>').join('') +
        '</table><div class="bar"><button class="btn" data-go="menu">Kembali</button></div></div>', 'sub');
    }
  };
})();
