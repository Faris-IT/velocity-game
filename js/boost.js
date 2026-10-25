// Energi boost: terbatas, terpakai saat boost, terisi di zona cyan dan dari sel energi.
MV.Boost = {
  apply(car, inp, vf, dt, track) {
    const C = MV.CONFIG;
    car.boosting = !!inp.boost && car.energy > 0 && vf > -10;
    if (car.boosting) { car.energy = Math.max(0, car.energy - C.BOOST_USE * dt); vf += C.BOOST_ACCEL * dt; }
    car.charging = !car.noCharge && car.onTrack && track.inZone(car.idx);
    if (car.charging) car.energy = Math.min(car.spec.boost, car.energy + C.ZONE_CHARGE * dt);
    return vf;
  }
};
