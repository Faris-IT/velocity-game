// Fisika arcade: kecepatan dipecah menjadi komponen maju (vf) dan samping (vl).
// Sudut kendaraan berputar lebih dulu daripada arah gerak, sehingga muncul momentum dan kendaraan melebar.
MV.stepCar = function (car, inp, dt, track) {
  const s = car.spec, C = MV.CONFIG;
  car.steer += (inp.steer - car.steer) * Math.min(1, dt * 9);
  car.hitCool = Math.max(0, car.hitCool - dt);
  if (!car.onTrack) car.offTime += dt;

  const co = Math.cos(car.angle), si = Math.sin(car.angle);
  let vf = car.vx * co + car.vy * si, vl = -car.vx * si + car.vy * co;
  const top = s.top * (car.onTrack ? 1 : C.GRASS_TOP);

  car.braking = false;
  vf = MV.Boost.apply(car, inp, vf, dt, track);
  if (inp.throttle) vf += (vf < 0 ? s.brake : s.accel * Math.max(0.08, 1 - vf / top)) * dt;
  if (inp.brake) {
    if (vf > 5) { vf -= s.brake * dt; car.braking = true; }
    else vf = Math.max(vf - s.brake * 0.45 * dt, -s.top * 0.3);
  }
  if (!inp.throttle && !inp.brake) vf -= Math.sign(vf) * Math.min(Math.abs(vf), 60 * dt);
  if (!car.onTrack) vf -= vf * C.GRASS_DRAG * dt;
  const cap = car.boosting ? s.top * C.BOOST_TOP : s.top;
  if (vf > cap) vf = car.boosting ? cap : Math.max(cap, vf - (vf - cap) * 2 * dt);

  vl *= Math.exp(-s.grip * (car.onTrack ? 1 : 0.6) * dt);                 // grip meredam gelincir
  vf -= Math.sign(vf) * Math.min(Math.abs(vf), Math.abs(vl) * 0.6 * dt);   // gelincir memakan kecepatan

  const sp = Math.abs(vf), ratio = Math.min(1, sp / s.top);
  const turnable = Math.min(1, sp / 90) * (vf >= 0 ? 1 : -1);             // tidak bisa belok saat diam
  const yaw = car.steer * s.handling * turnable / (1 + 0.9 * ratio * ratio);

  car.vx = vf * co - vl * si; car.vy = vf * si + vl * co;
  car.angle += yaw * dt;
  car.x += car.vx * dt; car.y += car.vy * dt;

  MV.resolveWalls(car, track);
  car.vf = vf; car.vl = vl;
  car.speed = Math.hypot(car.vx, car.vy);
};
