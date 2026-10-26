// Dinding di tepi area luar lintasan + pulau (percabangan). Kendaraan = lingkaran.
MV.resolveWalls = function (car, track) {
  const C = MV.CONFIG, R = C.CAR_RADIUS;
  const n = track.nearest(car.x, car.y, car.idx), hw = track.hw[n.i], limit = hw + C.GRASS - R;
  car.dist = n.d; car.idx = n.i; car.onTrack = n.d <= hw;
  if (n.d > limit) {
    const p = track.pts[n.i], ox = (car.x - p.x) / n.d, oy = (car.y - p.y) / n.d;
    car.x = p.x + ox * limit; car.y = p.y + oy * limit;
    MV.bump(car, -ox, -oy);
  }
  const isl = track.islands;
  for (let k = 0; k < isl.length; k++) {
    const o = isl[k], dx = car.x - o.x, dy = car.y - o.y, d = Math.hypot(dx, dy) || 1, lim = o.r + R;
    if (d < lim) { car.x = o.x + dx / d * lim; car.y = o.y + dy / d * lim; MV.bump(car, dx / d, dy / d); }
  }
};
// (nx, ny) = arah dari rintangan ke ruang bebas
MV.bump = function (car, nx, ny) {
  const vn = car.vx * nx + car.vy * ny;
  if (vn >= 0) return;
  const m = -vn;
  car.vx -= 1.35 * vn * nx; car.vy -= 1.35 * vn * ny;
  const k = 1 - 0.45 * Math.min(1, m / 250);
  car.vx *= k; car.vy *= k;
  car.hit = Math.max(car.hit, Math.min(1, m / 300));
  car.hitX = car.x - nx * MV.CONFIG.CAR_RADIUS; car.hitY = car.y - ny * MV.CONFIG.CAR_RADIUS;
  if (m > 90 && car.hitCool <= 0) { car.hits++; car.hitTypes.push('wall'); car.hitCool = 0.4; }
};
