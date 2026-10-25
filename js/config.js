window.MV = window.MV || {};
MV.CONFIG = {
  STEP: 1 / 120,      // langkah fisika tetap (detik)
  MAX_FRAME: 0.1,     // batas delta time per frame
  CAR_RADIUS: 14,     // bentuk tabrakan kendaraan: lingkaran
  TRACK_HALF: 85,     // setengah lebar aspal
  GRASS: 70,          // lebar area luar lintasan sebelum dinding
  GRASS_DRAG: 2.4,
  GRASS_TOP: 0.55,    // batas kecepatan relatif di luar lintasan
  KMH: 0.4            // konversi px/detik ke km/jam
};
