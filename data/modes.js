// Metadata 12 mode. Mode yang logikanya sudah ada di modes/*.js bisa dimainkan; sisanya terkunci.
MV.MODE_LIST = [
  { id: 'grandprix',       name: 'Grand Prix',        tag: 'Balapan klasik',      diff: 2, stage: 2, goal: 'Selesaikan 3-5 putaran secepat mungkin.' },
  { id: 'timeattack',      name: 'Time Attack',       tag: 'Kejar rekor',         diff: 3, stage: 2, goal: 'Selesaikan sebanyak mungkin putaran dalam 90 detik.' },
  { id: 'perfectlap',      name: 'Perfect Lap',       tag: 'Presisi',             diff: 4, stage: 3, goal: '3 putaran dengan penalti seminimal mungkin.' },
  { id: 'energy',          name: 'Energy Collector',  tag: 'Koleksi',             diff: 3, stage: 3, goal: 'Kumpulkan 25 sel energi lalu lewati finis.' },
  { id: 'boostrush',       name: 'Boost Rush',        tag: 'Manajemen energi',    diff: 3, stage: 3, goal: 'Finis 3 putaran dengan boost yang terbatas.' },
  { id: 'hazardrun',       name: 'Hazard Run',        tag: 'Hindari bahaya',      diff: 4, stage: 4, goal: 'Bertahan melewati lintasan penuh rintangan.' },
  { id: 'driftmaster',     name: 'Drift Master',      tag: 'Teknik menikung',     diff: 4, stage: 3, goal: 'Kumpulkan 2.000 poin drift dalam 120 detik.' },
  { id: 'ghostrival',      name: 'Ghost Rival',       tag: 'Lawan waktu sendiri', diff: 3, stage: 4, goal: 'Kalahkan catatan ghost dari percobaan terbaikmu.' },
  { id: 'survival',        name: 'Survival Circuit',  tag: 'Bertahan hidup',      diff: 5, stage: 4, goal: 'Bertahan 180 detik di lintasan yang makin sulit.' },
  { id: 'checkpointblitz', name: 'Checkpoint Blitz',  tag: 'Kecepatan dan rute',  diff: 4, stage: 4, goal: 'Lewati 12 checkpoint dalam 100 detik.' },
  { id: 'riskreward',      name: 'Risk & Reward',     tag: 'Strategi',            diff: 4, stage: 4, goal: 'Raih 1.500 kredit sebelum 2 putaran selesai.' },
  { id: 'trials',          name: 'Velocity Trials',   tag: 'Serangkaian misi',    diff: 5, stage: 4, goal: 'Selesaikan 10 tantangan dengan aturan berbeda.' },
  { id: 'cup',             name: 'Rival Cup',         tag: 'Kejuaraan NPC',       diff: 4, stage: 4, goal: '4 balapan di 4 lintasan melawan 5 NPC. Kumpulkan poin terbanyak.' }
];
