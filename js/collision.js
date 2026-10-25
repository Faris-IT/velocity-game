// Dinding berada di tepi area luar lintasan; kendaraan diperlakukan sebagai lingkaran.
MV.resolveWalls = function (car, track) {
  const C = MV.CONFIG, limit = C.TRACK_HALF + C.GRASS - C.CAR_RADIUS;
  const n = track.nearest(car.x, car.y);
  car.dist = n.d; car.idx = n.i;
  car.onTrack = n.d <= C.TRACK_HALF;
  if (n.d <= limit) return;
  const p = track.pts[n.i], nx = (car.x - p.x) / n.d, ny = (car.y - p.y) / n.d;
  car.x = p.x + nx * limit; car.y = p.y + ny * limit;
  const vn = car.vx * nx + car.vy * ny;
  if (vn > 0) {
    car.vx -= 1.35 * vn * nx; car.vy -= 1.35 * vn * ny;
    const k = 1 - 0.45 * Math.min(1, vn / 250);
    car.vx *= k; car.vy *= k;
    car.hit = Math.max(car.hit, Math.min(1, vn / 300));
    car.hitX = car.x + nx * C.CAR_RADIUS; car.hitY = car.y + ny * C.CAR_RADIUS;
    if (vn > 90 && car.hitCool <= 0) { car.hits++; car.hitCool = 0.4; }   // hitung benturan nyata, bukan gesekan
  }
};
