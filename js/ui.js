MV.UI = (function () {
  const root = document.getElementById('screen'), S = MV.Scoring, K = MV.CONFIG.KMH;
  let handler = function () {};
  const KEYS = ['go', 'mode', 'trial', 'mis', 'trk', 'riv', 'skl', 'rtk', 'veh', 'laps', 'step', 'set'];
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-' + KEYS.join('],[data-') + ']');
    if (!b || b.disabled) return;
    const k = KEYS.find(x => b.dataset[x] !== undefined);
    MV.Audio.sfx('ui');
    handler(k === 'go' ? b.dataset.go : k, b.dataset[k]);
  });
  function show(html, cls) { const t = root.scrollTop; root.innerHTML = html; root.className = 'on' + (cls ? ' ' + cls : ''); root.scrollTop = t; MV.Art.paint(root); }
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const chip = (attr, val, label, on, extra) => '<button class="chip' + (on ? ' sel' : '') + (extra ? ' ' + extra : '') + '" data-' + attr + '="' + val + '">' + label + '</button>';
  const CAT = { cup: 1, grandprix: 1, timeattack: 1, perfectlap: 1, ghostrival: 1, energy: 2, boostrush: 2, driftmaster: 2, hazardrun: 3, survival: 3, checkpointblitz: 4, riskreward: 4, trials: 4 };
  const CATN = { 1: 'Balapan', 2: 'Skill', 3: 'Bertahan', 4: 'Strategi' };
  const DETAIL = {
    grandprix: ['Selesaikan semua putaran secepat mungkin. Nilai akhir = waktu + penalti.', 'Tabrakan +1 dtk, di luar aspal +0,5 dtk per detik.'],
    timeattack: ['Kumpulkan skor dari putaran valid dalam 90 detik.', 'Tidak ada kemenangan instan dari satu putaran tercepat.'],
    perfectlap: ['3 putaran bersih: waktu, jalur ideal, dan sedikit kesalahan.', 'Penalti di atas 500 = gagal.'],
    energy: ['Kumpulkan 25 sel energi (jalur utama, berisiko, dan berkedip) lalu lewati garis finis.', 'Waktu habis sebelum finis = gagal.'],
    boostrush: ['Atur energi boost dan zona pengisian selama 3 putaran.', 'Boost di tikungan itu boros dan berisiko keluar lintasan.'],
    hazardrun: ['Bertahan melewati rintangan yang bergerak dengan pola. Checkpoint memulihkan kondisi.', 'Kondisi habis atau waktu habis = gagal.'],
    driftmaster: ['Kumpulkan 2.000 poin drift dalam 120 detik. Drift beruntun melipatgandakan poin.', 'Menabrak atau drift terlalu lama menghanguskan rangkaian.'],
    ghostrival: ['Kalahkan rekaman ghost dari percobaan terbaikmu (atau target bawaan).', 'Layar menunjukkan kamu unggul atau tertinggal.'],
    survival: ['Bertahan 180 detik di lintasan yang makin penuh rintangan.', 'Zona cyan memulihkan sedikit kondisi.'],
    checkpointblitz: ['Lewati 12 checkpoint berurutan dalam 100 detik. Pilih rute aman atau rute pendek (+3 dtk).', 'Checkpoint yang terlewat harus didatangi lagi.'],
    riskreward: ['Raih 1.500 kredit sebelum 2 putaran selesai. Jalur dalam bernilai tinggi tapi sulit.', 'Tabrakan mengurangi 75 kredit; finis tanpa target bukan kemenangan.'],
    trials: ['10 misi dengan aturan, skor, dan medali masing-masing.', 'Beberapa misi mewajibkan kendaraan tertentu.'],
    cup: ['4 balapan di 4 lintasan melawan 5 NPC. Poin dari posisi akhir (10, 8, 6, 4, 2, 1).', 'Peringkat total menentukan medali.']
  };
  const OPTS = { grandprix: 1, boostrush: 1, cup: 1, trials: 1 };
  const LABEL = { mode: 'Mode', veh: 'Kendaraan', track: 'Lintasan', opts: 'Opsi', go: 'Mulai' };
  const steps = sel => { const s = ['mode', 'veh']; if (sel.mode !== 'cup') s.push('track'); if (OPTS[sel.mode]) s.push('opts'); s.push('go'); return s; };
  const suf = id => MV.Storage.suf(id);
  const forced = sel => sel.mode === 'trials' ? MV.TRIALS[sel.mission].veh : null;

  function bestOf(id, sel) {
    const d = MV.Storage.get(), sf = suf(sel.track), N = {
      grandprix: ['best', 'grandprix-' + sel.laps], timeattack: ['hi', 'timeattack'], perfectlap: ['hi', 'perfectlap'], energy: ['best', 'energy'], boostrush: ['best', 'boostrush'],
      driftmaster: ['best', 'driftmaster'], hazardrun: ['best', 'hazardrun'], ghostrival: ['best', 'ghostrival'], survival: ['hi', 'survival'], checkpointblitz: ['best', 'checkpointblitz'],
      riskreward: ['best', 'riskreward'], cup: ['hi', 'cup']
    }[id];
    if (id === 'trials') return Object.keys(d.medals).filter(k => k.indexOf('trials-') === 0 && (sf ? k.slice(-sf.length) === sf : k.indexOf('@') < 0)).length + '/10 misi bermedali';
    const v = d[N[0]][N[1] + (id === 'cup' ? '' : sf)];
    if (v === undefined) return 'belum ada';
    return N[0] === 'best' ? S.fmt(v) : (id === 'survival' ? Math.round(v / 10) + '% kondisi' : v + ' poin');
  }

  // ---------- isi tiap langkah ----------
  function modeBody(sel) {
    const d = MV.Storage.get(), sf = suf(sel.track), cur = MV.MODE_LIST.find(m => m.id === sel.mode);
    const cards = MV.MODE_LIST.map((m, i) => {
      const medal = d.medals[m.id + (m.id === 'cup' ? '' : sf)];
      return '<button class="card c' + CAT[m.id] + (sel.mode === m.id ? ' sel' : '') + '" data-mode="' + m.id + '"><em>' + (i < 9 ? '0' : '') + (i + 1) + '</em><b>' + m.name + '</b><i>' + m.tag + '</i>' +
        (medal ? '<u class="medal ' + medal + '">' + medal + '</u>' : '') + '</button>';
    }).join('');
    const dt = DETAIL[cur.id];
    return '<div class="split"><div class="grid g3">' + cards + '</div><aside class="detail c' + CAT[cur.id] + '"><span class="cat">' + CATN[CAT[cur.id]] + '</span><h3>' + cur.name + '</h3><i>' + cur.tag + '</i>' +
      '<div class="dstars">Kesulitan ' + stars(cur.diff) + '</div><p>' + dt[0] + '</p><p class="soft">' + dt[1] + '</p><div class="rec">Rekor terbaik <b>' + bestOf(cur.id, sel) + '</b></div></aside></div>';
  }
  function vehBody(sel) {
    const V = MV.VEHICLES[sel.veh], ok = MV.Progress.unlocked(sel.veh);
    const st = [['Kecepatan puncak', Math.round(V.top * K) + ' km/jam', V.top / 700], ['Akselerasi', String(V.accel), V.accel / 320], ['Handling', V.handling.toFixed(1), V.handling / 3.5],
      ['Grip', V.grip.toFixed(1), V.grip / 7], ['Kapasitas boost', String(V.boost), V.boost / 130], ['Ketahanan', V.dur + '%', V.dur / 120]];
    const bars = st.map(s => '<div class="st2"><span>' + s[0] + '</span><div><i style="width:' + Math.round(s[2] * 100) + '%;background:' + V.color + '"></i></div><b>' + s[1] + '</b></div>').join('');
    const tabs = MV.VEHICLE_ORDER.map(k => {
      const v = MV.VEHICLES[k], lk = !MV.Progress.unlocked(k);
      return '<button class="vtab' + (sel.veh === k ? ' sel' : '') + (lk ? ' lock' : '') + '" data-veh="' + k + '"><canvas data-vehicle="' + k + '" width="150" height="100"></canvas><b style="color:' + v.color + '">' + v.name + '</b><small>' + (lk ? 'TERKUNCI' : v.tag) + '</small></button>';
    }).join('');
    return '<div class="vshow"><div class="vart"><canvas data-vehicle="' + sel.veh + '" width="460" height="330"></canvas></div><div class="vinfo"><h3 style="color:' + V.color + '">' + V.name + '</h3><i>' + V.tag + '</i><p>' + V.desc + '</p>' + bars +
      (ok ? '' : '<div class="lockmsg">TERKUNCI - ' + MV.Progress.req(sel.veh) + '</div>') + '<button class="btn mini2" data-trial="' + sel.veh + '">Uji coba kendaraan ini</button></div></div><div class="vtabs">' + tabs + '</div>';
  }
  function trackBody(sel) {
    const d = MV.Storage.get();
    return '<div class="tgrid">' + Object.keys(MV.TRACKS).map(id => {
      const T = MV.TRACKS[id], bl = d.bestLap[id];
      return '<button class="tcard2' + (sel.track === id ? ' sel' : '') + '" data-trk="' + id + '"><canvas data-track="' + id + '" width="340" height="210"></canvas><b>' + T.name + '</b><span>' + stars(T.diff) + '</span><p>' + T.desc +
        '</p><small>Putaran terbaik: ' + (bl === undefined ? '-' : S.fmt(bl)) + '</small></button>';
    }).join('') + '</div>';
  }
  const optBlock = (t, d, chips) => '<div class="opt"><h4>' + t + '</h4><p>' + d + '</p><div class="row">' + chips.join('') + '</div></div>';
  function optsBody(sel) {
    const m = sel.mode, d = MV.Storage.get(), sf = suf(sel.track);
    let h = '';
    if (m === 'grandprix') h += optBlock('Jumlah putaran', 'Makin banyak putaran, makin panjang balapannya.', [3, 4, 5].map(n => chip('laps', n, n + ' putaran', sel.laps === n)));
    if (m === 'grandprix' || m === 'boostrush') h += optBlock('Lawan NPC', 'NPC ikut balapan, bisa bertabrakan denganmu, dan menentukan posisi akhir.', [0, 3, 5].map(n => chip('riv', n, n ? n + ' NPC' : 'Tanpa NPC', sel.rivals === n)));
    if (m === 'cup' || ((m === 'grandprix' || m === 'boostrush') && sel.rivals > 0))
      h += optBlock('Level NPC', 'Mudah: santai. Normal: seimbang. Sulit: agresif dan jarang salah.', ['Mudah', 'Normal', 'Sulit'].map((n, i) => chip('skl', i, n, sel.skill === i)));
    if (m === 'cup') h += '<div class="opt"><h4>Format Cup</h4><p>4 balapan berurutan: Oval, Twist, Chicane, lalu Split. 2 putaran tiap balapan melawan 5 NPC. Poin: 10, 8, 6, 4, 2, 1.</p></div>';
    if (m === 'trials') h += '<div class="mgrid">' + MV.TRIALS.map((t, i) => {
      const medal = d.medals['trials-' + i + sf];
      return '<button class="mcard' + (sel.mission === i ? ' sel' : '') + '" data-mis="' + i + '"><em>' + (i < 9 ? '0' : '') + (i + 1) + '</em><b>' + t.n + '</b><p>' + t.d + '</p><small>' +
        (t.veh ? 'Kendaraan wajib: ' + MV.VEHICLES[t.veh].name : 'Kendaraan bebas') + '</small>' + (medal ? '<u class="medal ' + medal + '">' + medal + '</u>' : '') + '</button>';
    }).join('') + '</div>';
    return '<div class="opts">' + h + '</div>';
  }
  function goBody(sel) {
    const cur = MV.MODE_LIST.find(m => m.id === sel.mode), fv = forced(sel), vk = fv || sel.veh, V = MV.VEHICLES[vk], T = MV.TRACKS[sel.track], items = [];
    if (sel.mode === 'grandprix') items.push('Putaran: ' + sel.laps);
    if ((sel.mode === 'grandprix' || sel.mode === 'boostrush')) items.push(sel.rivals ? 'Lawan: ' + sel.rivals + ' NPC (' + ['Mudah', 'Normal', 'Sulit'][sel.skill] + ')' : 'Lawan: tanpa NPC');
    if (sel.mode === 'cup') items.push('5 NPC (' + ['Mudah', 'Normal', 'Sulit'][sel.skill] + ')', '4 lintasan berurutan');
    if (sel.mode === 'trials') items.push('Misi ' + (sel.mission + 1) + ': ' + MV.TRIALS[sel.mission].n);
    const stepIdx = n => steps(sel).indexOf(n);
    return '<div class="sum"><button class="scard c' + CAT[cur.id] + '" data-step="' + stepIdx('mode') + '"><small>MODE</small><b>' + cur.name + '</b><i>' + cur.tag + '</i><p>' + DETAIL[cur.id][0] + '</p></button>' +
      '<button class="scard" data-step="' + stepIdx('veh') + '"' + (fv ? ' disabled' : '') + '><small>KENDARAAN' + (fv ? ' (WAJIB)' : '') + '</small><canvas data-vehicle="' + vk + '" width="220" height="150"></canvas><b style="color:' + V.color + '">' + V.name + '</b><i>' + V.tag + '</i></button>' +
      (sel.mode === 'cup' ? '<div class="scard"><small>LINTASAN</small><b>Oval, Twist, Chicane, Split</b><i>4 balapan</i></div>' :
        '<button class="scard" data-step="' + stepIdx('track') + '"><small>LINTASAN</small><canvas data-track="' + sel.track + '" width="240" height="150"></canvas><b>' + T.name + '</b><i>' + stars(T.diff) + '</i></button>') +
      (items.length ? '<button class="scard"' + (stepIdx('opts') >= 0 ? ' data-step="' + stepIdx('opts') + '"' : '') + '><small>OPSI</small>' + items.map(x => '<b class="li">' + x + '</b>').join('') + '</button>' : '') + '</div>';
  }
  function shell(sel, body, ok, title) {
    const st = steps(sel), last = sel.step === st.length - 1;
    const sp = '<div class="stepper">' + st.map((s, i) => '<button class="stp' + (i === sel.step ? ' on' : '') + (i < sel.step ? ' done' : '') + '" data-step="' + i + '"' + (i > sel.step ? ' disabled' : '') + '><i>' + (i + 1) + '</i><span>' + LABEL[s] + '</span></button>').join('<b class="ln"></b>') + '</div>';
    return '<div class="panel wide wiz">' + sp + '<h2 class="wt">' + title + '</h2><div class="wbody">' + body + '</div><div class="wfoot"><button class="btn" data-go="wback">Kembali</button>' +
      (last ? '<button class="btn primary big2" data-go="start">MULAI BALAPAN</button>' : '<button class="btn primary"' + (ok ? '' : ' disabled') + ' data-go="wnext">Lanjut</button>') + '</div></div>';
  }
  const TITLE = { mode: 'Pilih Mode', veh: 'Pilih Kendaraan', track: 'Pilih Lintasan', opts: 'Atur Balapan', go: 'Siap Balapan?' };

  return {
    onAction(fn) { handler = fn; },
    hide() { root.className = ''; root.innerHTML = ''; },
    menu() {
      const d = MV.Storage.get(), bl = d.bestLap.oval, st = d.stats;
      show('<div class="hero"><div class="kicker">MUFA GAMES #5</div><h1 class="logo">MUFA<b>VELOCITY</b></h1><p class="tag">Master the Track. Beat the Clock.</p>' +
        '<button class="btn primary big" data-go="play">MAIN</button>' +
        '<div class="menugrid"><button class="btn" data-go="garage">Garage</button><button class="btn" data-go="trials">Tutorial &amp; Uji Coba</button>' +
        '<button class="btn" data-go="ach">Achievement <em>' + MV.Ach.count() + '/10</em></button><button class="btn" data-go="records">Rekor</button><button class="btn wide2" data-go="settings">Pengaturan</button></div>' +
        '<div class="mini"><span><b>' + st.races + '</b>balapan</span><span><b>' + st.wins + '</b>menang</span><span><b>' + (bl === undefined ? '-' : S.fmt(bl)) + '</b>putaran terbaik</span></div>' +
        '<div class="foot">13 mode &middot; 4 lintasan &middot; 3 kendaraan &middot; v' + MV.VERSION + '</div></div>', 'menu');
    },
    wizard(sel) {
      const st = steps(sel); sel.step = Math.max(0, Math.min(sel.step, st.length - 1));
      const n = st[sel.step]; let body, ok = true;
      if (n === 'mode') body = modeBody(sel);
      else if (n === 'veh') { body = vehBody(sel); ok = !!forced(sel) || MV.Progress.unlocked(sel.veh); }
      else if (n === 'track') body = trackBody(sel);
      else if (n === 'opts') body = optsBody(sel);
      else body = goBody(sel);
      show(shell(sel, body, ok, TITLE[n]), 'sub');
    },
    garage(sel) {
      show('<div class="panel wide wiz"><h2 class="wt">Garage</h2><p class="tag">Pilih kendaraan utama. Kendaraan lain terbuka lewat progres permainan.</p><div class="wbody">' + vehBody(sel) +
        '</div><div class="wfoot"><button class="btn primary" data-go="menu">Kembali</button></div></div>', 'sub');
    },
    pause() {
      show('<div class="panel"><h2>Jeda</h2><button class="btn primary" data-go="resume">Lanjutkan</button><button class="btn" data-go="retry">Ulangi</button><button class="btn" data-go="menu">Menu</button></div>', 'dim');
    },
    result(race, rec, newAch) {
      const r = race.result;
      const btns = (r.buttons || [['menu', 'Menu'], ['retry', 'Ulangi']]).map((b, i, a) => '<button class="btn' + (i === a.length - 1 ? ' primary' : '') + '" data-go="' + b[0] + '">' + b[1] + '</button>').join('');
      show('<div class="panel"><h2 class="' + (r.win ? 'win' : 'lose') + '">' + r.title + '</h2>' +
        (r.noMedal ? '' : r.medal ? '<div class="medal ' + r.medal + '">' + r.medal + '</div>' : '<div class="medal none">Tanpa medali</div>') +
        '<p class="tag">' + r.mainLabel + '</p><div class="big">' + r.main + '</div>' +
        (rec.newBest ? '<div class="badge">REKOR BARU</div>' : '') + (rec.newLap ? '<div class="badge">PUTARAN TERBAIK BARU</div>' : '') +
        '<table>' + r.lines.map(l => '<tr><td>' + l[0] + '</td><td>' + l[1] + '</td></tr>').join('') + '</table>' +
        (newAch && newAch.length ? '<div class="achbox">' + newAch.map(a => '<div><small>ACHIEVEMENT TERBUKA</small><b>' + a.name + '</b></div>').join('') + '</div>' : '') +
        '<div class="bar">' + btns + '</div></div>', 'dim');
    },
    trials() {
      const bar = (l, v, m) => '<div class="st"><span>' + l + '</span><div><i style="width:' + Math.min(100, Math.round(v / m * 100)) + '%"></i></div></div>';
      const cards = MV.VEHICLE_ORDER.map(k => {
        const v = MV.VEHICLES[k], i = MV.MODES.trial.INFO[k];
        return '<div class="card tcard"><canvas data-vehicle="' + k + '" width="240" height="150"></canvas><b style="color:' + v.color + '">' + v.name + '</b><i>' + v.tag + '</i>' +
          bar('Top Speed', v.top, 700) + bar('Akselerasi', v.accel, 320) + bar('Handling', v.handling, 3.5) + bar('Grip', v.grip, 7) + bar('Boost', v.boost, 130) +
          '<p>' + i.goal + '</p><button class="btn primary" data-trial="' + k + '">Coba ' + v.name + '</button></div>';
      }).join('');
      show('<div class="panel wide"><h2>Tutorial &amp; Uji Coba Kendaraan</h2><button class="btn" data-go="tutor">Mulai Tutorial Dasar (9 langkah)</button>' +
        '<p class="tag">Uji coba: satu tantangan singkat untuk merasakan karakter tiap kendaraan.</p><div class="grid">' + cards + '</div><div class="bar"><button class="btn" data-go="menu">Kembali</button></div></div>', 'sub');
    },
    ach() {
      const d = MV.Storage.get(), done = MV.Ach.count();
      const cards = MV.ACH.map((a, i) => '<div class="acard' + (d.ach[a.id] ? ' on' : '') + '"><em>' + (i < 9 ? '0' : '') + (i + 1) + '</em><b>' + a.name + '</b><p>' + a.desc + '</p><small>' + (d.ach[a.id] ? 'TERBUKA' : 'TERKUNCI') + '</small></div>').join('');
      show('<div class="panel wide"><h2>Achievement</h2><p class="tag">' + done + ' dari 10 terbuka</p><div class="grid g3">' + cards + '</div><div class="bar"><button class="btn primary" data-go="menu">Kembali</button></div></div>', 'sub');
    },
    settings(sel) {
      const s = MV.Settings.d, on = (k, v) => s[k] === v, sec = (t, rows) => '<div class="sec"><h4>' + t + '</h4>' + rows.join('') + '</div>';
      const row = (l, k, items) => '<div class="row"><span>' + l + '</span>' + items.map(i => chip('set', k + '=' + i[0], i[1], on(k, i[0]))).join('') + '</div>';
      const onoff = [[true, 'Aktif'], [false, 'Mati']];
      const themes = Object.keys(MV.THEMES).map(k => '<button class="chip' + (s.theme === k ? ' sel' : '') + '" data-set="theme=' + k + '"><span class="dot" style="background:' + MV.THEMES[k].a + '"></span>' + MV.THEMES[k].name + '</button>').join('');
      const danger = sel.confirmReset ? '<div class="row"><span>Yakin?</span><button class="btn danger" data-go="reset2">Ya, hapus semua progres</button><button class="btn" data-go="reset0">Batal</button></div>'
        : '<div class="row"><span>Data</span><button class="btn" data-go="reset1">Reset progres...</button></div>';
      show('<div class="panel wide"><h2>Pengaturan</h2><div class="setgrid">' +
        sec('Tampilan', ['<div class="row"><span>Tema</span>' + themes + '</div>']) +
        sec('Audio', [row('Volume', 'vol', [[0, '0'], [30, '30%'], [60, '60%'], [100, '100%']]), row('Suara mesin', 'engine', onoff), row('Efek suara', 'sfx', onoff)]) +
        sec('Kontrol', [row('Tombol sentuh', 'touch', [['auto', 'Otomatis'], ['on', 'Selalu'], ['off', 'Mati']]), row('Ukuran tombol', 'tsize', [['sm', 'Kecil'], ['md', 'Sedang'], ['lg', 'Besar']]),
          row('Respons setir', 'steer', [[0, 'Lembut'], [1, 'Normal'], [2, 'Cepat']])]) +
        sec('Game', [row('Buka semua kendaraan', 'unlockAll', onoff), danger]) +
        '</div><div class="bar"><button class="btn primary" data-go="menu">Kembali</button></div></div>', 'sub');
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
