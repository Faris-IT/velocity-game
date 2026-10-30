// Pengujian otomatis tanpa dependensi: node tests/run-tests.js
// Memuat modul game di Node dengan DOM tiruan, lalu menguji lintasan, fisika, AI, NPC, mode, penyimpanan, achievement, dan layar UI.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const el = () => ({ addEventListener() {}, classList: { toggle() {}, add() {}, remove() {} }, style: { setProperty() {} }, set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h || ''; }, scrollTop: 0, className: '', dataset: {}, querySelectorAll: () => [] });
const store = {};
const sandbox = { console, Math, JSON, Date, setTimeout, localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
  document: { querySelectorAll: () => [], getElementById: () => el(), addEventListener() {}, documentElement: { style: { setProperty() {} } }, body: { dataset: {}, classList: { toggle() {} } } },
  addEventListener() {}, Float32Array, Path2D: function () {} };
sandbox.window = sandbox; vm.createContext(sandbox);
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const load = f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
let pass = 0, fail = 0;
const t = (name, ok, info) => { if (ok) pass++; else { fail++; console.log('  GAGAL:', name, info !== undefined ? '-> ' + info : ''); } };
const section = s => console.log('\n# ' + s);
const run = code => vm.runInContext(code, sandbox);

section('Struktur proyek');
scripts.forEach(f => t('berkas ada: ' + f, fs.existsSync(path.join(ROOT, f))));
['js/renderer.js', 'js/main.js'].forEach(f => { try { new vm.Script(fs.readFileSync(path.join(ROOT, f), 'utf8')); t('sintaks ' + f, true); } catch (e) { t('sintaks ' + f, false, e.message); } });
scripts.filter(f => f !== 'js/renderer.js' && f !== 'js/main.js').forEach(load);
const MV = sandbox.MV;
t('13 mode terdaftar dengan logika', MV.MODE_LIST.every(m => MV.MODES[m.id]) && MV.MODE_LIST.length === 13);
t('10 misi Velocity Trials', MV.TRIALS.length === 10);
t('10 achievement', MV.ACH.length === 10);

section('Lintasan');
const tracks = {};
Object.keys(MV.TRACKS).forEach(id => {
  const tr = tracks[id] = MV.getTrack(id);
  let minSep = 1e9, minR = 1e9;
  for (let i = 0; i < tr.N; i += 3) {
    for (let j = i + 1; j < tr.N; j += 3) { if (Math.min(j - i, tr.N - (j - i)) < 70) continue; minSep = Math.min(minSep, Math.hypot(tr.pts[i].x - tr.pts[j].x, tr.pts[i].y - tr.pts[j].y)); }
    if (Math.abs(tr.kap[i]) > 1e-5) minR = Math.min(minR, 1 / Math.abs(tr.kap[i]));
  }
  const ang = tr.start.angle * 180 / Math.PI;
  t(id + ': start menghadap ke atas', Math.abs(ang + 90) < 8, ang.toFixed(1));
  t(id + ': bagian lintasan tidak saling berdekatan', minSep >= 340, Math.round(minSep));
  t(id + ': tikungan tidak terlalu sempit', minR >= 160, Math.round(minR));
  t(id + ': dua zona pengisian', tr.zones.length === 2);
  t(id + ': skala kesulitan wajar', tr.tscale > 0.8 && tr.tscale < 2.2, tr.tscale.toFixed(2));
});
t('split punya pulau percabangan dan jalur lebar', tracks.split.islands.length > 5 && Math.max.apply(null, tracks.split.hw) > 150);

section('Fisika dan tabrakan');
const D = o => Object.assign({ throttle: false, brake: false, steer: 0, boost: false }, o);
MV.VEHICLE_ORDER.forEach(k => {
  const tr = tracks.oval, car = MV.createCar(k, tr.start); let ok = true, minE = 1e9, vmax = 0;
  for (let i = 0; i < 120 * 40; i++) { MV.stepCar(car, D({ throttle: true, steer: i % 700 < 100 ? 1 : 0, boost: true }), 1 / 120, tr); if (![car.x, car.y, car.speed].every(isFinite)) ok = false; minE = Math.min(minE, car.energy); vmax = Math.max(vmax, car.speed); }
  t(k + ': tidak ada NaN dan energi tidak negatif', ok && minE >= 0);
  t(k + ': kecepatan terbatas', vmax <= car.spec.top * MV.CONFIG.BOOST_TOP + 5, Math.round(vmax));
  t(k + ': tidak menembus dinding', car.dist <= tr.hw[car.idx] + MV.CONFIG.GRASS + 1, Math.round(car.dist));
});
{ const tr = tracks.split, car = MV.createCar('viper', tr.start); let inside = false; const c = tr.islands[Math.floor(tr.islands.length / 2)];
  car.x = c.x; car.y = c.y; car.idx = tr.nearest(c.x, c.y).i; MV.stepCar(car, D(), 1 / 120, tr);
  t('kendaraan didorong keluar dari pulau', Math.hypot(car.x - c.x, car.y - c.y) >= c.r + MV.CONFIG.CAR_RADIUS - 1); }

section('AI dan NPC');
const drv = (car, tr, ai) => MV.AI.drive(car, tr, ai, 1 / 120, 1);
Object.keys(tracks).forEach(id => MV.VEHICLE_ORDER.forEach(k => {
  const tr = tracks[id], car = MV.createCar(k, tr.start), ai = MV.AI.newState({ cruise: 0.9, corner: 0.98 }, 0), r = MV.newRace({ id: 'grandprix' }, { laps: 2, veh: k, rivals: 0 }, tr);
  for (let i = 0; i < 120 * 150 && !r.result; i++) MV.stepRace(r, car, D(drv(car, tr, ai)), tr, 1 / 120);
  t('AI ' + id + '/' + k + ' menyelesaikan 2 putaran', !!r.result, r.laps);
  if (k === 'viper') t('AI ' + id + '/viper hampir tanpa tabrakan', r.hits <= 2, r.hits);
}));
Object.keys(tracks).forEach(id => {
  const tr = tracks[id], car = MV.createCar('viper', tr.start), ai = MV.AI.newState({ cruise: 0.88, corner: 0.96 }, 0), r = MV.newRace({ id: 'grandprix' }, { laps: 2, veh: 'viper', rivals: 5, skill: 1 }, tr);
  Object.assign(car, r.playerStart);
  for (let i = 0; i < 120 * 220 && !(r.result && r.npcs.every(n => n.fin !== null)); i++) MV.stepRace(r, car, D(drv(car, tr, ai)), tr, 1 / 120);
  const order = MV.NPC.order(r, r.time).map(e => e.i).sort().join('');
  t('GP+5 NPC ' + id + ': selesai dan urutan memuat 6 pembalap', !!r.result && order === '012345', order);
  t('GP+5 NPC ' + id + ': NPC ikut finis', r.npcs.filter(n => n.fin !== null).length >= 4);
});

section('Checkpoint dan putaran');
{ const tr = tracks.oval, car = MV.createCar('viper', tr.start), r = MV.newRace({ id: 'grandprix' }, { laps: 3, veh: 'viper', rivals: 0 }, tr);
  for (let i = 0; i < 120 * 30; i++) MV.stepRace(r, car, D({ throttle: i < 120, brake: i >= 120, steer: 0 }), tr, 1 / 120);
  for (let i = 0; i < 120 * 30; i++) MV.stepRace(r, car, D({ brake: true }), tr, 1 / 120);
  t('mundur/diam tidak menghasilkan putaran', r.laps === 0, r.laps); }

section('Mode permainan');
const autop = (id, o, secs, extra) => {
  const tr = tracks[(o && o.track) || 'oval'], car = MV.createCar((o && o.veh) || 'viper', tr.start), ai = MV.AI.newState({ cruise: 0.85, corner: 0.95 }, 0);
  const r = MV.newRace(MV.MODE_LIST.find(m => m.id === id), Object.assign({ laps: 3, veh: car.key, rivals: 0, skill: 1, mission: 0 }, o), tr);
  if (r.playerStart) Object.assign(car, r.playerStart);
  for (let i = 0; i < 120 * secs && !r.result; i++) { if (extra) extra(r, car); MV.stepRace(r, car, D(drv(car, tr, ai)), tr, 1 / 120); }
  return { r, car };
};
MV.MODE_LIST.forEach(m => { const { r, car } = autop(m.id, { cup: { race: 0, pts: [0, 0, 0, 0, 0, 0] } }, 5); r.car = car; const h = r.mode.hud(r); t('HUD ' + m.id, !!h && Array.isArray(h.lines)); });
t('Grand Prix selesai', !!autop('grandprix', {}, 120).r.result);
{ const r = autop('timeattack', {}, 120).r; t('Time Attack berakhir di 90 dtk dengan skor', !!r.result && Math.abs(r.time - 90) < 0.1 && r.laps >= 3, r.laps); }
{ const r = autop('hazardrun', {}, 100).r; t('Hazard Run menghasilkan hasil', !!r.result); }
{ const r = autop('survival', {}, 200, r => { r.hp = 100; }).r; t('Survival bertahan 180 dtk', !!r.result && r.result.win && Math.abs(r.time - 180) < 0.1); }
{ const r = autop('energy', {}, 60, r => { r.cells = 25; }).r; t('Energy Collector menang setelah 25 sel + finis', !!r.result && r.result.win); }
{ const car = MV.createCar('viper', tracks.oval.start), r = MV.newRace(MV.MODE_LIST.find(m => m.id === 'perfectlap'), { laps: 3, veh: 'viper' }, tracks.oval);
  for (let i = 0; i < 120 * 40 && !r.result; i++) MV.stepRace(r, car, D({ throttle: true }), tracks.oval, 1 / 120);
  t('Perfect Lap gagal saat penalti > 500', !!r.result && !r.result.win); }
{ const r = autop('checkpointblitz', {}, 130, (r, car) => { const g = MV.Gates.active(r.gates)[0]; if (g) { /* diarahkan oleh AI jalur */ } }).r; t('Checkpoint Blitz berjalan tanpa error', r.gates.step > 3); }
{ const r = autop('boostrush', { rivals: 3 }, 100).r; t('Boost Rush dengan NPC selesai', !!r.result); }
{ const tr = tracks.twist, car = MV.createCar('viper', tr.start), r = MV.newRace(MV.MODE_LIST.find(m => m.id === 'ghostrival'), { laps: 3, veh: 'viper' }, tr), ai = MV.AI.newState({ cruise: 0.85, corner: 0.95 }, 0);
  for (let i = 0; i < 120 * 120 && !r.result; i++) MV.stepRace(r, car, D(drv(car, tr, ai)), tr, 1 / 120);
  const g = MV.Storage.getGhost('viper', 'twist');
  t('Ghost Rival menyimpan ghost per lintasan', !!r.result && !!g && g.s.length > 100 && !MV.Storage.getGhost('viper', 'oval')); }
{ const cup = { race: 0, pts: [0, 0, 0, 0, 0, 0] }; let ok = true;
  for (let k = 0; k < 4; k++) { const tr = tracks[MV.MODES.cup.TRACKS[cup.race]], car = MV.createCar('viper', tr.start), ai = MV.AI.newState({ cruise: 0.88, corner: 0.96 }, 0),
    r = MV.newRace({ id: 'cup' }, { veh: 'viper', skill: 1, cup }, tr); Object.assign(car, r.playerStart);
    for (let i = 0; i < 120 * 200 && !r.result; i++) MV.stepRace(r, car, D(drv(car, tr, ai)), tr, 1 / 120);
    if (!r.result) ok = false; else if (k < 3 && r.result.buttons[1][0] !== 'next') ok = false; else if (k === 3 && r.result.buttons[1][0] !== 'cupnew') ok = false; }
  t('Rival Cup: 4 race berurutan dengan tombol yang benar', ok && cup.race === 4 && cup.pts.reduce((a, b) => a + b, 0) === 4 * 31, cup.pts.join(',')); }
MV.TRIALS.forEach((s, m) => { const { r } = autop('trials', { mission: m, veh: s.veh || 'viper' }, 3); t('misi ' + (m + 1) + ' (' + s.n + ') berjalan', r.spec === s); });

section('Penyimpanan dan pengaturan (data rusak tidak boleh menggagalkan game)');
const reload = raw => { if (raw === undefined) delete store['mufaVelocity.v1']; else store['mufaVelocity.v1'] = raw; load('js/storage.js'); return sandbox.MV.Storage.get(); };
const bad = [['kosong', undefined], ['bukan JSON', '{{{'], ['array', '[1,2]'], ['angka', '5'], ['tipe salah', JSON.stringify({ best: 'x', hi: [], bestLap: { oval: 'a' }, stats: { races: -5 }, medals: { a: 'Platinum' }, ghosts: { v: { time: 'x', s: 5 } }, ach: 7, won: 'y' })]];
bad.forEach(([n, raw]) => { const d = reload(raw); t('data ' + n + ' -> pakai bawaan', d.stats.races === 0 && Object.keys(d.best).length === 0 && Object.keys(d.medals).length === 0 && Object.keys(d.ghosts).length === 0); });
{ const d = reload(JSON.stringify({ best: { 'grandprix-3': 41.2 }, stats: { races: 7 }, medals: { grandprix: 'Gold' }, ach: { first: true, hack: 1 } })); t('data valid dipertahankan, entri tidak valid dibuang', d.best['grandprix-3'] === 41.2 && d.stats.races === 7 && d.medals.grandprix === 'Gold' && d.ach.first && !d.ach.hack); }
store['mufaVelocity.settings.v1'] = JSON.stringify({ theme: 'bukanTema', vol: 77, touch: 'x', steer: 9, unlockAll: 'ya' }); load('js/settings.js');
t('pengaturan rusak -> nilai bawaan', MV.Settings.d.theme === 'neon' && MV.Settings.d.vol === 60 && MV.Settings.d.touch === 'auto' && MV.Settings.d.steer === 1 && MV.Settings.d.unlockAll === false);
MV.Settings.apply(); t('STEER_RATE mengikuti pengaturan', MV.CONFIG.STEER_RATE === 9);
reload(undefined);

section('Kendaraan terkunci dan achievement');
{ const d = MV.Storage.get();
  t('Viper selalu terbuka, Phantom/Drift terkunci di awal', MV.Progress.unlocked('viper') && !MV.Progress.unlocked('phantom') && !MV.Progress.unlocked('drift'));
  d.stats.races = 5; Object.assign(d.medals, { a: 'Gold', b: 'Silver', c: 'Bronze' });
  t('Phantom terbuka setelah 5 balapan, Drift setelah 3 medali', MV.Progress.unlocked('phantom') && MV.Progress.unlocked('drift'));
  const mk = (id, res, extra) => Object.assign({ def: { id }, result: Object.assign({ win: true, recordKey: id }, res), hits: 0, pen: 0 }, extra);
  const g = r => MV.Ach.check(r).map(a => a.id);
  t('First Finish', g(mk('grandprix', {})).includes('first'));
  t('Speed Demon butuh Silver+', !g(mk('timeattack', { medal: 'Bronze' })).includes('speed') && g(mk('timeattack', { medal: 'Gold' })).includes('speed'));
  t('Perfect Driver butuh nol penalti', !g(mk('perfectlap', {}, { pen: 10 })).includes('perfect') && g(mk('perfectlap', {}, { pen: 0 })).includes('perfect'));
  t('Boost Master butuh efisiensi >= 80', !g(mk('boostrush', { eff: 50 })).includes('boost') && g(mk('boostrush', { eff: 85 })).includes('boost'));
  t('Energy Hoarder, Drift Legend, Ghost Breaker', g(mk('energy', { all: true })).includes('hoarder') && g(mk('driftmaster', {})).includes('drift') && g(mk('ghostrival', { beatOwn: true })).includes('ghost'));
  t('Untouchable butuh nol tabrakan', !g(mk('hazardrun', {}, { hits: 2 })).includes('untouch') && g(mk('hazardrun', {}, { hits: 0 })).includes('untouch'));
  t('Checkpoint Champion', g(mk('checkpointblitz', {})).includes('champ'));
  t('tutorial/uji coba tidak memberi achievement', g(mk('tutorial', {})).length === 0 && g(mk('trial', {})).length === 0);
  MV.MODE_LIST.filter(m => m.id !== 'cup').forEach(m => { d.won[m.id] = true; });
  t('Velocity Legend: 12 mode menang + >= 7 achievement lain', g(mk('grandprix', {})).includes('legend') && MV.Ach.count() === 10); }

section('Layar UI (semua langkah wizard, semua mode dan lintasan)');
const sel = { mode: 'grandprix', veh: 'viper', laps: 3, mission: 0, track: 'oval', rivals: 3, skill: 1, rtrack: 'oval', step: 0, confirmReset: false };
const clean = (name) => { const h = sandbox.document.getElementById('x'); };
let uiOk = true, uiMsg = '';
const grab = fn => { let out = ''; const root = sandbox.document; try { fn(); } catch (e) { uiOk = false; uiMsg = e.message; } };
const rootEl = el(); sandbox.document.getElementById = () => rootEl; load('js/ui.js');
const html1 = fn => { fn(); return rootEl.innerHTML; };
MV.MODE_LIST.forEach(m => Object.keys(MV.TRACKS).forEach(tk => { sel.mode = m.id; sel.track = tk; sel.veh = MV.VEHICLE_ORDER[(m.id.length + tk.length) % 3];
  for (let s = 0; s < 5; s++) { sel.step = s; const h = html1(() => MV.UI.wizard(sel)); if (/undefined|NaN|\[object/.test(h)) { uiOk = false; uiMsg = m.id + '/' + tk + '/step' + s + ': ' + (h.match(/.{20}(undefined|NaN|\[object).{20}/) || [''])[0]; } } }));
t('wizard: semua mode x lintasan x langkah tanpa error/undefined', uiOk, uiMsg);
const screens = { menu: () => MV.UI.menu(), garage: () => MV.UI.garage(sel), pause: () => MV.UI.pause(), trials: () => MV.UI.trials(), ach: () => MV.UI.ach(), settings: () => { sel.confirmReset = true; MV.UI.settings(sel); }, records: () => MV.UI.records('twist') };
Object.keys(screens).forEach(k => { const h = html1(screens[k]); t('layar ' + k, h.length > 100 && !/undefined|NaN|\[object/.test(h)); });
{ const tr = tracks.oval, r = MV.newRace(MV.MODE_LIST[0], { laps: 3, veh: 'viper', rivals: 0 }, tr); r.end({ win: true, title: 'T', mainLabel: 'W', main: '1', medal: 'Gold', lines: [['a', 'b']], recordKey: 'grandprix-3', value: 40, better: 'low' });
  const h = html1(() => MV.UI.result(r, MV.Storage.record(r), [MV.ACH[0]])); t('layar hasil + achievement', /ACHIEVEMENT TERBUKA/.test(h) && !/undefined|NaN/.test(h)); }

console.log('\n' + (fail ? 'SELESAI DENGAN KEGAGALAN' : 'SEMUA LULUS') + ': ' + pass + ' lulus, ' + fail + ' gagal');
process.exit(fail ? 1 : 0);
