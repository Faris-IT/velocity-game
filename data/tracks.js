// Empat lintasan sesuai rencana. pace = pengali kesulitan waktu (untuk ambang medali), diff = bintang kesulitan.
MV.TRACKS = {
  oval:    { id: 'oval',    name: 'Oval Circuit',    desc: 'Lintasan sederhana untuk belajar mengendalikan kendaraan.', diff: 1, pace: 1, gen: 'super', a: 1150, b: 640, n: 2.8, zones: [[0.20, 0.30], [0.70, 0.80]] },
  twist:   { id: 'twist',   name: 'Twist Circuit',   desc: 'Tikungan tajam dan kombinasi belokan yang berganti-ganti.', diff: 4, pace: 1.07, gen: 'polar', A: 1450, B: 1000, A1: 220, k1: 5, p1: 0, B1: 120, k2: 3, p2: 0 },
  chicane: { id: 'chicane', name: 'Chicane Circuit', desc: 'Jalur kiri-kanan bergantian yang menguji presisi.', diff: 3, pace: 1.07, gen: 'chicane', a: 1450, b: 680, n: 4, amp: 100, waves: 5 },
  split:   { id: 'split',   name: 'Split Circuit',   desc: 'Percabangan di tikungan: jalur dalam sempit tapi pendek, jalur luar lebar tapi panjang.', diff: 3, pace: 1.25, gen: 'super', a: 1350, b: 780, n: 3.2,
             split: { near: 0.62, len: 0.13, to: 185, r: 56, lat: 34 } }
};
