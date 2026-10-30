// Statistik dan bentuk kendaraan (poligon dengan arah depan = +x). dur = ketahanan terhadap benturan (100 = standar).
MV.VEHICLES = {
  viper: { name: 'Viper', tag: 'Balanced', color: '#22e5ff', top: 550, accel: 270, brake: 640, handling: 2.6, grip: 5.0, boost: 100, dur: 100,
    desc: 'Kendaraan awal. Seimbang antara kecepatan, akselerasi, dan kendali, cocok untuk semua mode.',
    shape: [[22, 0], [8, -9], [-14, -12], [-18, -6], [-18, 6], [-14, 12], [8, 9]], cock: [[10, 0], [0, -5], [-7, -5], [-7, 5], [0, 5]] },
  phantom: { name: 'Phantom', tag: 'Speed', color: '#ff8a2a', top: 650, accel: 300, brake: 620, handling: 1.9, grip: 3.4, boost: 85, dur: 80,
    desc: 'Kecepatan puncak tertinggi, tetapi melebar di tikungan tajam dan lebih rapuh. Untuk pembalap yang berani.',
    shape: [[28, 0], [10, -6], [-6, -9], [-20, -13], [-24, -5], [-24, 5], [-20, 13], [-6, 9], [10, 6]], cock: [[12, 0], [2, -4], [-8, -4], [-8, 4], [2, 4]] },
  drift: { name: 'Drift', tag: 'Handling', color: '#b46bff', top: 480, accel: 255, brake: 640, handling: 3.2, grip: 6.5, boost: 115, dur: 110,
    desc: 'Mudah dibelokkan dan stabil, dengan energi boost terbesar. Kecepatan puncaknya lebih rendah.',
    shape: [[18, 0], [10, -11], [-6, -15], [-16, -13], [-18, -6], [-18, 6], [-16, 13], [-6, 15], [10, 11]], cock: [[8, 0], [0, -6], [-8, -6], [-8, 6], [0, 6]] }
};
MV.VEHICLE_ORDER = ['viper', 'phantom', 'drift'];
