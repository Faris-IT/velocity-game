MV.Renderer = {
  init(canvas, track) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.track = track;
    this.cam = { x: 0, y: 0, z: 1 }; this.shake = 0; this.trail = []; this.sparks = []; this.trailT = 0;
    this.bake(); this.resize();
    addEventListener('resize', () => this.resize());
  },
  resize() {
    const d = this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = innerWidth; this.h = innerHeight;
    this.cv.width = this.w * d; this.cv.height = this.h * d;
    this.baseZoom = Math.max(0.55, Math.min(1.4, Math.min(this.w, this.h) / 760));
  },
  // Lintasan statis digambar sekali ke canvas terpisah agar frame tetap ringan.
  bake() {
    const C = MV.CONFIG, t = this.track, b = t.bounds, H = C.TRACK_HALF, G = C.GRASS, m = H + G + 160;
    const off = this.off = document.createElement('canvas');
    this.ox = b.minX - m; this.oy = b.minY - m;
    off.width = Math.ceil(b.maxX - b.minX + m * 2); off.height = Math.ceil(b.maxY - b.minY + m * 2);
    const g = off.getContext('2d');
    g.translate(-this.ox, -this.oy);
    g.fillStyle = '#05070f'; g.fillRect(this.ox, this.oy, off.width, off.height);
    g.strokeStyle = 'rgba(90,130,255,.07)'; g.lineWidth = 1; g.beginPath();
    for (let x = Math.ceil(this.ox / 120) * 120; x < this.ox + off.width; x += 120) { g.moveTo(x, this.oy); g.lineTo(x, this.oy + off.height); }
    for (let y = Math.ceil(this.oy / 120) * 120; y < this.oy + off.height; y += 120) { g.moveTo(this.ox, y); g.lineTo(this.ox + off.width, y); }
    g.stroke();

    const path = new Path2D();
    t.pts.forEach((p, i) => i ? path.lineTo(p.x, p.y) : path.moveTo(p.x, p.y));
    path.closePath();
    g.lineJoin = 'round';
    const layer = (w, color, glow, blur) => { g.lineWidth = w; g.strokeStyle = color; g.shadowColor = glow || 'transparent'; g.shadowBlur = blur || 0; g.stroke(path); };
    layer(2 * (H + G) + 8, '#ff8a2a', '#ff8a2a', 22);   // dinding
    layer(2 * (H + G) - 4, '#08101c');                   // area luar lintasan
    layer(2 * H + 10, '#22e5ff', '#22e5ff', 16);         // tepi lintasan
    layer(2 * H, '#0e1428');                             // aspal
    t.zones.forEach(z => {                               // zona pengisian energi
      const zp = new Path2D();
      for (let i = z[0]; i <= z[1]; i++) i === z[0] ? zp.moveTo(t.pts[i].x, t.pts[i].y) : zp.lineTo(t.pts[i].x, t.pts[i].y);
      g.shadowBlur = 0; g.lineWidth = 2 * H - 12; g.strokeStyle = 'rgba(34,229,255,.15)'; g.lineCap = 'butt'; g.stroke(zp);
      g.lineWidth = 2; g.strokeStyle = 'rgba(34,229,255,.5)'; g.setLineDash([14, 22]); g.stroke(zp); g.setLineDash([]);
    });
    g.setLineDash([30, 40]); layer(3, 'rgba(180,107,255,.45)'); g.setLineDash([]);

    const p0 = t.pts[0];                                 // garis start/finis
    g.save(); g.translate(p0.x, p0.y); g.rotate(Math.atan2(p0.ty, p0.tx));
    const cells = 10, s = 2 * H / cells;
    for (let r = 0; r < 2; r++) for (let c = 0; c < cells; c++) { g.fillStyle = (r + c) % 2 ? '#fff' : '#111'; g.fillRect(r * 12 - 12, -H + c * s, 12, s); }
    g.restore();
  },
  snap(car) { this.cam.x = car.x; this.cam.y = car.y; this.cam.z = this.baseZoom; this.trail.length = 0; this.sparks.length = 0; },
  update(dt, car) {
    const k = 1 - Math.exp(-dt * 5), zoom = this.baseZoom * (1 - 0.2 * Math.min(1, car.speed / car.spec.top));
    this.cam.x += (car.x + car.vx * 0.3 - this.cam.x) * k;
    this.cam.y += (car.y + car.vy * 0.3 - this.cam.y) * k;
    this.cam.z += (zoom - this.cam.z) * k;
    this.shake = Math.max(0, this.shake - dt * 2.5);

    this.trailT += dt;
    if (this.trailT > 0.02) { this.trailT = 0; if (car.speed > 60) this.trail.push({ x: car.x, y: car.y }); if (this.trail.length > 45 || (car.speed <= 60 && this.trail.length)) this.trail.shift(); }

    if (car.hit > 0) {
      this.shake = Math.max(this.shake, car.hit);
      for (let i = 0; i < 10 && this.sparks.length < 60; i++) {
        const a = Math.random() * 6.283, v = 80 + Math.random() * 220;
        this.sparks.push({ x: car.hitX, y: car.hitY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.45 });
      }
      car.hit = 0;
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i]; s.life -= dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.life <= 0) this.sparks.splice(i, 1);
    }
  },
  drawCheckpoints(g, cp) {
    const H = MV.CONFIG.TRACK_HALF, pulse = 0.65 + 0.35 * Math.sin(Date.now() / 160);
    cp.idx.forEach((pi, k) => {
      const p = this.track.pts[pi], nx = -p.ty, ny = p.tx, next = k === cp.next;
      if (!next && k === 0) return;
      g.strokeStyle = next ? '#ff8a2a' : 'rgba(34,229,255,.28)'; g.lineWidth = next ? 6 : 3;
      g.globalAlpha = next ? pulse : 1; g.shadowColor = '#ff8a2a'; g.shadowBlur = next ? 16 : 0;
      g.beginPath(); g.moveTo(p.x - nx * H, p.y - ny * H); g.lineTo(p.x + nx * H, p.y + ny * H); g.stroke();
    });
    g.globalAlpha = 1; g.shadowBlur = 0;
  },
  drawTokens(g, race) {
    const col = { main: '#22e5ff', risk: '#ff8a2a', blink: '#b46bff' };
    race.tokens.forEach(t => {
      if (!t.alive) return;
      const vis = MV.Tokens.visible(t, race.time);
      g.globalAlpha = vis ? 1 : 0.18; g.fillStyle = g.strokeStyle = col[t.kind]; g.shadowColor = col[t.kind]; g.shadowBlur = vis ? 14 : 0;
      g.lineWidth = 2; g.beginPath(); g.arc(t.x, t.y, 8, 0, 6.283); g.fill();
      g.beginPath(); g.arc(t.x, t.y, 12 + (vis ? 2 * Math.sin(Date.now() / 200) : 0), 0, 6.283); g.stroke();
    });
    g.globalAlpha = 1; g.shadowBlur = 0;
  },
  drawObstacles(g, race) {
    race.obstacles.forEach(o => {
      if (o.down > 0) return;
      g.shadowBlur = 12;
      if (o.type === 'cone') { g.shadowColor = g.fillStyle = '#ff8a2a'; g.beginPath(); g.moveTo(o.x, o.y - 12); g.lineTo(o.x - 10, o.y + 9); g.lineTo(o.x + 10, o.y + 9); g.closePath(); g.fill(); }
      else { g.shadowColor = g.strokeStyle = '#b46bff'; g.fillStyle = '#1a1030'; g.lineWidth = 3; g.beginPath(); g.arc(o.x, o.y, o.r, 0, 6.283); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(o.x - 9, o.y - 9); g.lineTo(o.x + 9, o.y + 9); g.moveTo(o.x + 9, o.y - 9); g.lineTo(o.x - 9, o.y + 9); g.stroke(); }
    });
    g.shadowBlur = 0;
  },
  draw(car, race) {
    const g = this.ctx, d = this.dpr, c = this.cam, z = c.z;
    const sx = (Math.random() - 0.5) * 14 * this.shake, sy = (Math.random() - 0.5) * 14 * this.shake;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#05070f'; g.fillRect(0, 0, this.cv.width, this.cv.height);
    g.setTransform(d * z, 0, 0, d * z, d * (this.w / 2 - c.x * z + sx), d * (this.h / 2 - c.y * z + sy));
    g.drawImage(this.off, this.ox, this.oy);

    if (race && race.cp) this.drawCheckpoints(g, race.cp);
    if (race && race.tokens) this.drawTokens(g, race);
    if (race && race.obstacles) this.drawObstacles(g, race);
    g.lineWidth = 5; g.lineCap = 'round';                // jejak kendaraan
    for (let i = 1; i < this.trail.length; i++) {
      g.strokeStyle = car.spec.color; g.globalAlpha = i / this.trail.length * 0.35;
      g.beginPath(); g.moveTo(this.trail[i - 1].x, this.trail[i - 1].y); g.lineTo(this.trail[i].x, this.trail[i].y); g.stroke();
    }
    g.globalAlpha = 1;
    g.fillStyle = '#ffd27a';
    this.sparks.forEach(s => { g.globalAlpha = Math.max(0, s.life / 0.45); g.fillRect(s.x - 1.5, s.y - 1.5, 3, 3); });
    g.globalAlpha = 1;

    g.save(); g.translate(car.x, car.y); g.rotate(car.angle);
    if (car.boosting) { g.fillStyle = 'rgba(255,138,42,.9)'; g.shadowColor = '#ff8a2a'; g.shadowBlur = 18; g.beginPath(); g.moveTo(-18, -5); g.lineTo(-36 - Math.random() * 14, 0); g.lineTo(-18, 5); g.fill(); }
    g.shadowColor = car.spec.color; g.shadowBlur = 14;
    g.fillStyle = '#0b1020'; g.strokeStyle = car.spec.color; g.lineWidth = 2.5; g.lineJoin = 'round';
    g.beginPath();
    [[22, 0], [8, -9], [-14, -12], [-18, -6], [-18, 6], [-14, 12], [8, 9]].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]));
    g.closePath(); g.fill(); g.stroke();
    g.shadowBlur = 0; g.fillStyle = car.spec.color; g.globalAlpha = 0.8;
    g.beginPath(); g.moveTo(10, 0); g.lineTo(0, -5); g.lineTo(-7, -5); g.lineTo(-7, 5); g.lineTo(0, 5); g.closePath(); g.fill();
    g.globalAlpha = 1; g.fillStyle = car.braking ? '#ff3b3b' : '#6b1d1d';
    g.fillRect(-20, -9, 3, 5); g.fillRect(-20, 4, 3, 5);
    g.restore();
  }
};
