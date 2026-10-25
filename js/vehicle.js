MV.createCar = function (key, start) {
  return { key, spec: MV.VEHICLES[key], x: start.x, y: start.y, angle: start.angle,
           vx: 0, vy: 0, vf: 0, vl: 0, speed: 0, steer: 0, idx: 0,
           dist: 0, onTrack: true, braking: false, hit: 0, hitX: 0, hitY: 0,
           hits: 0, hitCool: 0, offTime: 0 };
};
