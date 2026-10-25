// Mode demo di belakang menu: kendaraan melaju otomatis mengelilingi lintasan.
MV.Demo = {
  inp(car, track) {
    const q = track.pts[(car.idx + 22) % track.N];
    let da = Math.atan2(q.y - car.y, q.x - car.x) - car.angle; da = Math.atan2(Math.sin(da), Math.cos(da));
    return { throttle: car.speed < car.spec.top * 0.72, brake: false, steer: Math.max(-1, Math.min(1, da * 3)),
             boost: car.energy > 60 && Math.abs(da) < 0.05 && car.speed > 250 };
  }
};
