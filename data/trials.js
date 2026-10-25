// 10 misi Velocity Trials. T = ambang medali (lebih kecil lebih baik); measure: 'lap' | 'time' | 'hits'.
MV.TRIALS = [
  { n: 'Tanpa Boost',     d: 'Selesaikan 1 putaran tanpa boost.',                         laps: 1, noBoost: true, lapLimit: 20, measure: 'lap',  T: { Gold: 15.5, Silver: 17, Bronze: 20 } },
  { n: 'Bersih',          d: 'Selesaikan 1 putaran tanpa satu pun tabrakan.',             laps: 1, maxHits: 0, lapLimit: 24, measure: 'lap',  T: { Gold: 15.5, Silver: 17.5, Bronze: 24 } },
  { n: 'Token Cepat',     d: 'Kumpulkan 14 token tanpa turun di bawah 100 km/jam.',       laps: 1, cells: 14, minKmh: 100, limit: 40, measure: 'time', T: { Gold: 20, Silver: 24, Bronze: 40 } },
  { n: 'Lap Kilat',       d: 'Satu putaran dalam batas waktu 16 detik.',                  laps: 1, lapLimit: 16, measure: 'lap',                 T: { Gold: 13.5, Silver: 14.5, Bronze: 16 } },
  { n: 'Phantom Berliku', d: 'Pakai Phantom (sulit di tikungan), maksimal 2 tabrakan.',   veh: 'phantom', laps: 1, maxHits: 2, lapLimit: 26, measure: 'lap', T: { Gold: 15.5, Silver: 18, Bronze: 26 } },
  { n: 'Drift Sprint',    d: 'Kumpulkan 600 poin drift dalam 45 detik.',                  drift: 600, limit: 45, measure: 'time',                 T: { Gold: 25, Silver: 35, Bronze: 45 } },
  { n: 'Slalom Bahaya',   d: 'Lewati putaran penuh rintangan, maksimal 3 tabrakan.',      laps: 1, obst: true, maxHits: 3, lapLimit: 30, measure: 'hits', T: { Gold: 0, Silver: 1, Bronze: 3 } },
  { n: 'Hemat Energi',    d: '2 putaran dengan energi boost hanya 40 dan tanpa pengisian.', laps: 2, energy: 40, limit: 50, measure: 'time',    T: { Gold: 31, Silver: 35, Bronze: 45 } },
  { n: 'Gerbang Zig-Zag', d: 'Lewati 8 gerbang berurutan dalam 40 detik.',                gates: 8, limit: 40, measure: 'time',                    T: { Gold: 18, Silver: 23, Bronze: 40 } },
  { n: 'Ultimate',        d: '2 putaran, 10 token, maksimal 1 tabrakan, dalam 50 detik.', laps: 2, cells: 10, maxHits: 1, limit: 50, measure: 'time', T: { Gold: 36, Silver: 42, Bronze: 50 } }
];
