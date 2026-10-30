// Gambar kendaraan dan lintasan untuk menu: digambar dari data game (tanpa berkas gambar).
MV.Art = {
  vehicle(cv, key, big) {
    const g = cv.getContext('2d'), w = cv.width, h = cv.height, sp = MV.VEHICLES[key];
    g.clearRect(0, 0, w, h);
    const rg = g.createRadialGradient(w / 2, h * 0.52, 8, w / 2, h * 0.52, Math.max(w, h) * 0.55);
    rg.addColorStop(0, sp.color + '40'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.fillRect(0, 0, w, h);
    g.strokeStyle = sp.color + '40'; g.lineWidth = 1.5;                       // garis kecepatan di belakang kendaraan
    for (let i = 0; i < 9; i++) { const x = w * (0.22 + 0.56 * i / 8), y0 = h * 0.58 + (i % 3) * h * 0.05; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, h * (0.9 + (i % 2) * 0.05)); g.stroke(); }
    const s = Math.min(w, h) / (big ? 56 : 62);
    g.save(); g.translate(w / 2, h * 0.46); g.rotate(-Math.PI / 2); g.scale(s, s); g.lineJoin = 'round';
    g.fillStyle = 'rgba(255,138,42,.9)'; g.shadowColor = '#ff8a2a'; g.shadowBlur = 22;
    g.beginPath(); g.moveTo(-18, -5); g.lineTo(-33, 0); g.lineTo(-18, 5); g.fill();
    g.shadowColor = sp.color; g.shadowBlur = 26; g.fillStyle = '#0b1020'; g.strokeStyle = sp.color; g.lineWidth = 2.4 / s * 3;
    g.beginPath(); sp.shape.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); g.stroke();
    g.shadowBlur = 0; g.fillStyle = sp.color; g.globalAlpha = 0.85;
    g.beginPath(); sp.cock.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
    g.globalAlpha = 0.5; g.lineWidth = 0.9; g.beginPath(); g.moveTo(sp.shape[0][0] - 3, 0); g.lineTo(-16, 0); g.stroke();
    g.globalAlpha = 1; g.fillStyle = '#ff3b3b'; g.fillRect(-20, -9, 2.6, 4.5); g.fillRect(-20, 4.5, 2.6, 4.5);
    g.restore();
  },
  track(cv, id) {
    const t = MV.getTrack(id), T = MV.Settings.theme(), g = cv.getContext('2d'), w = cv.width, h = cv.height, b = t.bounds, pad = 22;
    g.clearRect(0, 0, w, h);
    const sc = Math.min((w - pad * 2) / (b.maxX - b.minX), (h - pad * 2) / (b.maxY - b.minY));
    g.save(); g.translate(w / 2 - (b.minX + b.maxX) / 2 * sc, h / 2 - (b.minY + b.maxY) / 2 * sc); g.scale(sc, sc);
    const loop = (p, s, ex, a, z) => { for (let k = 0; k <= z - a; k++) { const i = (a + k) % t.N, q = t.pts[i], d = s * (t.hw[i] + ex); k ? p.lineTo(q.x - q.ty * d, q.y + q.tx * d) : p.moveTo(q.x - q.ty * d, q.y + q.tx * d); } };
    const band = ex => { const p = new Path2D(); loop(p, 1, ex, 0, t.N - 1); p.closePath(); loop(p, -1, ex, 0, t.N - 1); p.closePath(); return p; };
    g.shadowColor = T.edge; g.shadowBlur = 14; g.fillStyle = T.edge; g.fill(band(16), 'evenodd');
    g.shadowBlur = 0; g.fillStyle = '#0b1226'; g.fill(band(0), 'evenodd');
    t.zones.forEach(z => { const p = new Path2D(); loop(p, 1, -10, z[0], z[1]); for (let k = z[1] - z[0]; k >= 0; k--) { const i = (z[0] + k) % t.N, q = t.pts[i], d = -(t.hw[i] - 10); p.lineTo(q.x - q.ty * d, q.y + q.tx * d); } p.closePath(); g.fillStyle = 'rgba(' + T.zone + ',.35)'; g.fill(p); });
    g.fillStyle = T.wall; g.shadowColor = T.wall; g.shadowBlur = 8; t.islands.forEach(o => { g.beginPath(); g.arc(o.x, o.y, o.r, 0, 6.283); g.fill(); });
    g.shadowBlur = 0; g.strokeStyle = T.mid; g.lineWidth = 6; g.setLineDash([40, 50]); g.beginPath();
    t.pts.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.closePath(); g.stroke(); g.setLineDash([]);
    const p0 = t.pts[0], H = t.hw[0];                                          // garis start dan panah arah
    g.strokeStyle = '#fff'; g.lineWidth = 12; g.beginPath(); g.moveTo(p0.x - p0.ty * H, p0.y + p0.tx * H); g.lineTo(p0.x + p0.ty * H, p0.y - p0.tx * H); g.stroke();
    g.fillStyle = '#fff'; const a = t.pts[(14) % t.N]; g.save(); g.translate(a.x, a.y); g.rotate(Math.atan2(a.ty, a.tx)); g.beginPath(); g.moveTo(60, 0); g.lineTo(-10, -40); g.lineTo(-10, 40); g.fill(); g.restore();
    g.restore();
  },
  paint(root) {
    root.querySelectorAll('canvas[data-vehicle]').forEach(c => this.vehicle(c, c.dataset.vehicle, c.width > 300));
    root.querySelectorAll('canvas[data-track]').forEach(c => this.track(c, c.dataset.track));
  }
};
