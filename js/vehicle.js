MV.createCar = function (key, start) {
  const spec = MV.VEHICLES[key];
  const car = { key, spec, x: start.x, y: start.y, angle: start.angle,
           vx: 0, vy: 0, vf: 0, vl: 0, speed: 0, steer: 0, idx: 0,
           dist: 0, onTrack: true, braking: false, hit: 0, hitX: 0, hitY: 0,
           hits: 0, hitTypes: [], hitCool: 0, offTime: 0, energy: spec.boost, boosting: false, charging: false };
  MV.Drift.init(car);
  return car;
};
