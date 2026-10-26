// Pengemudi otomatis (NPC dan demo menu): memilih kecepatan dari kelengkungan lintasan di depan.
MV.AI = {
  // kecepatan aman per titik lintasan untuk satu kendaraan (dari batas radius belok model fisika)
  table(track, spec) {
    track.cv = track.cv || {};
    if (track.cv[spec.name]) return track.cv[spec.name];
    const N = track.N, out = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      let k = 0;
      for (let j = -3; j <= 3; j++) k = Math.max(k, Math.abs(track.kap[(i + j + N) % N]));
      const R = k > 1e-5 ? 1 / k : 1e9;
      let v = spec.top;
      while (v > 110 && v * (1 + 0.9 * Math.pow(v / spec.top, 2)) / spec.handling > R * (1.12 + Math.max(0, 2.6 - spec.handling) * 0.12)) v -= 10;
      out[i] = v;
    }
    return (track.cv[spec.name] = out);
  },
  newState(skill, lane) {
    return { t: 0, vt: 250, cruise: skill.cruise, corner: skill.corner, brake: 480, lane: lane || 0, stuck: 0 };
  },
  drive(car, track, ai, dt, rb) {
    const N = track.N, sp = car.spec, cv = this.table(track, sp);
    ai.t -= dt;
    if (ai.t <= 0) {
      ai.t = 0.05;
      let vt = sp.top * ai.cruise;
      for (let j = 0; j < 70; j++) {
        const v = cv[(car.idx + j) % N] * ai.corner, a = Math.sqrt(v * v + 2 * ai.brake * j * 7.57);   // harus bisa mengerem sampai titik itu
        if (a < vt) vt = a;
      }
      ai.vt = vt * (rb || 1);
    }
    const look = Math.max(12, Math.min(36, Math.round(10 + car.speed * 0.05)));
    const li = (car.idx + look) % N, q = track.pts[li], lat = ai.lane + track.lane[li], tx = q.x - q.ty * lat, ty = q.y + q.tx * lat;
    let da = Math.atan2(ty - car.y, tx - car.x) - car.angle; da = Math.atan2(Math.sin(da), Math.cos(da));
    const over = car.speed > ai.vt * 1.06;
    if (car.speed < 35) ai.stuck += dt; else ai.stuck = 0;
    if (ai.stuck > 1.5) {                                          // tersangkut: kembalikan ke tengah lintasan
      const p = track.pts[car.idx];
      car.x = p.x; car.y = p.y; car.angle = Math.atan2(p.ty, p.tx); car.vx = car.vy = 0; ai.stuck = 0;
    }
    return { throttle: !over && car.speed < ai.vt, brake: over, steer: Math.max(-1, Math.min(1, da * 3)),
             boost: car.energy > 45 && ai.vt >= sp.top * ai.cruise * 0.97 && Math.abs(da) < 0.05 };
  }
};
