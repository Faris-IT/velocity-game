// Rintangan: kerucut (statis, roboh saat ditabrak) dan penghalang bergerak (pola sinus, bisa dipelajari).
MV.Obstacles = {
  create(track, specs) {
    const list = specs.map(s => Object.assign({ down: 0, x: 0, y: 0, r: s.type === 'barrier' ? 16 : 11 }, s));
    list.track = track; list.forEach(o => this.place(list, o, 0));
    return list;
  },
  place(list, o, time) {
    const p = list.track.pts[o.idx % list.track.N];
    const lat = o.lat + (o.type === 'barrier' ? o.amp * Math.sin(time * o.w + (o.ph || 0)) : 0);
    o.x = p.x - p.ty * lat; o.y = p.y + p.tx * lat;
  },
  update(list, car, time, dt) {
    const R = MV.CONFIG.CAR_RADIUS;
    list.forEach(o => {
      this.place(list, o, time);
      if (o.down > 0) { o.down -= dt; return; }
      const d = Math.hypot(car.x - o.x, car.y - o.y);
      if (d >= o.r + R || car.hitCool > 0) return;
      car.hits++; car.hitCool = 0.4; car.hit = 0.6; car.hitX = o.x; car.hitY = o.y;
      if (o.type === 'cone') { o.down = 3; car.vx *= 0.8; car.vy *= 0.8; }
      else { const nx = (car.x - o.x) / (d || 1), ny = (car.y - o.y) / (d || 1); car.x = o.x + nx * (o.r + R); car.y = o.y + ny * (o.r + R); car.vx *= 0.5; car.vy *= 0.5; }
    });
  }
};
