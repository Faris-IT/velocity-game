window.MV = window.MV || {};
MV.CONFIG = {
  STEP: 1 / 120,      // langkah fisika tetap (detik)
  MAX_FRAME: 0.1,     // batas delta time per frame
  CAR_RADIUS: 14,     // bentuk tabrakan kendaraan: lingkaran
  TRACK_HALF: 85,     // setengah lebar aspal
  GRASS: 70,          // lebar area luar lintasan sebelum dinding
  GRASS_DRAG: 2.4,
  GRASS_TOP: 0.55,    // batas kecepatan relatif di luar lintasan
  KMH: 0.4,           // konversi px/detik ke km/jam
  BOOST_USE: 38,      // energi terpakai per detik saat boost
  BOOST_ACCEL: 520,   // tambahan akselerasi saat boost
  BOOST_TOP: 1.3,     // batas kecepatan saat boost (x top speed)
  ZONE_CHARGE: 45,    // pengisian energi per detik di zona cyan
  CELL_ENERGY: 8      // energi dari tiap sel
};
