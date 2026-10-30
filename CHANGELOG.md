# Changelog

## [1.0.0] - 2026-10-30
Rilis pertama.

### Permainan
- 13 mode: Grand Prix, Time Attack, Perfect Lap, Energy Collector, Boost Rush, Hazard Run, Drift Master, Ghost Rival, Survival Circuit, Checkpoint Blitz, Risk & Reward, Velocity Trials (10 misi), dan Rival Cup.
- 4 lintasan: Oval, Twist, Chicane, Split (percabangan jalur luar/dalam).
- 3 kendaraan dengan bentuk dan statistik berbeda: Viper, Phantom, Drift. Phantom dan Drift terbuka lewat progres.
- NPC dengan 3 level kesulitan, grid start, dan tabrakan antar-kendaraan.
- Ghost per kendaraan dan per lintasan, boost + zona pengisian, drift berkombo, rintangan, gerbang, token.
- 10 achievement, medali, rekor per lintasan, tutorial 9 langkah, dan uji coba tiap kendaraan.

### Antarmuka
- Menu bertahap: mode, kendaraan (gambar + data), lintasan (gambar), opsi, lalu mulai.
- Garage, achievement, rekor, dan pengaturan (4 tema, audio prosedural, ukuran tombol sentuh, respons setir).
- Kontrol keyboard dan sentuh.

### Teknis
- Fisika langkah tetap 120 Hz, semua visual dan audio dibuat prosedural.
- Penyimpanan lokal dengan validasi data rusak.
- Pengujian otomatis tanpa dependensi (`node tests/run-tests.js`).
