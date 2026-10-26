// Mode demo di belakang menu: kendaraan melaju otomatis mengelilingi lintasan terpilih.
MV.Demo = {
  ai: null, track: null,
  inp(car, track, dt) {
    if (!this.ai || this.track !== track) { this.ai = MV.AI.newState({ cruise: 0.8, corner: 0.9 }, 0); this.track = track; }
    return MV.AI.drive(car, track, this.ai, dt, 1);
  }
};
