MV.UI = (function () {
  const root = document.getElementById('screen'), S = MV.Scoring;
  let handler = function () {};
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-go],[data-mode],[data-veh],[data-laps]');
    if (!b || b.disabled) return;
    const d = b.dataset;
    handler(d.go || (d.mode ? 'mode' : d.veh ? 'veh' : 'laps'), d.mode || d.veh || d.laps);
  });
  function show(html) { const t = root.scrollTop; root.innerHTML = html; root.classList.add('on'); root.scrollTop = t; }
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  const chip = (attr, val, label, on) => '<button class="chip' + (on ? ' sel' : '') + '" data-' + attr + '="' + val + '">' + label + '</button>';

  return {
    onAction(fn) { handler = fn; },
    hide() { root.classList.remove('on'); root.innerHTML = ''; },
    menu() {
      show('<div class="panel"><h1>MUFA<span>VELOCITY</span></h1><p class="tag">Master the Track. Beat the Clock.</p>' +
        '<button class="btn primary" data-go="play">Play</button><button class="btn" data-go="records">Records</button>' +
        '<p class="soft">Garage, Achievements, dan Settings hadir di tahap berikutnya.</p></div>');
    },
    modes(sel) {
      const cards = MV.MODE_LIST.map(m => {
        const ok = !!MV.MODES[m.id];
        return '<button class="card' + (sel.mode === m.id ? ' sel' : '') + (ok ? '' : ' lock') + '" data-mode="' + m.id + '"' + (ok ? '' : ' disabled') + '>' +
          '<b>' + m.name + '</b><i>' + m.tag + '</i><p>' + m.goal + '</p><small>' + (ok ? 'Kesulitan ' + stars(m.diff) : 'Segera - Tahap ' + m.stage) + '</small></button>';
      }).join('');
      const veh = MV.VEHICLE_ORDER.map(k => chip('veh', k, MV.VEHICLES[k].name + ' <em>' + MV.VEHICLES[k].tag + '</em>', sel.veh === k)).join('');
      const laps = sel.mode === 'grandprix' ? '<div class="row"><span>Putaran</span>' + [3, 4, 5].map(n => chip('laps', n, n, sel.laps === n)).join('') + '</div>' : '';
      show('<div class="panel wide"><h2>Pilih Mode</h2><div class="grid">' + cards + '</div>' +
        '<div class="row"><span>Kendaraan</span>' + veh + '</div>' + laps +
        '<div class="bar"><button class="btn" data-go="menu">Kembali</button><button class="btn primary" data-go="start">Mulai</button></div></div>');
    },
    pause() {
      show('<div class="panel"><h2>Jeda</h2><button class="btn primary" data-go="resume">Lanjutkan</button>' +
        '<button class="btn" data-go="retry">Ulangi</button><button class="btn" data-go="menu">Menu</button></div>');
    },
    result(race, rec) {
      const r = race.result;
      show('<div class="panel"><h2 class="' + (r.win ? 'win' : 'lose') + '">' + r.title + '</h2>' +
        (r.medal ? '<div class="medal ' + r.medal + '">' + r.medal + '</div>' : '<div class="medal none">Tanpa medali</div>') +
        '<p class="tag">' + r.mainLabel + '</p><div class="big">' + r.main + '</div>' +
        (rec.newBest ? '<div class="badge">REKOR BARU</div>' : '') + (rec.newLap ? '<div class="badge">PUTARAN TERBAIK BARU</div>' : '') +
        '<table>' + r.lines.map(l => '<tr><td>' + l[0] + '</td><td>' + l[1] + '</td></tr>').join('') + '</table>' +
        '<div class="bar"><button class="btn" data-go="menu">Menu</button><button class="btn primary" data-go="retry">Ulangi</button></div></div>');
    },
    records() {
      const d = MV.Storage.get(), v = (o, k, f) => (k in o) ? f(o[k]) : '-';
      const rows = [['Grand Prix 3 putaran', v(d.best, 'grandprix-3', S.fmt)], ['Grand Prix 4 putaran', v(d.best, 'grandprix-4', S.fmt)],
        ['Grand Prix 5 putaran', v(d.best, 'grandprix-5', S.fmt)], ['Time Attack (skor)', v(d.hi, 'timeattack', String)],
        ['Putaran tercepat (Oval)', v(d.bestLap, 'oval', S.fmt)], ['Balapan / menang', d.stats.races + ' / ' + d.stats.wins],
        ['Total putaran', String(d.stats.laps)], ['Total tabrakan', String(d.stats.hits)]];
      show('<div class="panel"><h2>Records</h2><table>' + rows.map(l => '<tr><td>' + l[0] + '</td><td>' + l[1] + '</td></tr>').join('') +
        '</table><div class="bar"><button class="btn" data-go="menu">Kembali</button></div></div>');
    }
  };
})();
