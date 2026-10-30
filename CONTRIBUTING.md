# Berkontribusi

Terima kasih sudah tertarik! Aturan utamanya sederhana:

1. **Tanpa dependensi.** Game ini murni HTML, CSS, dan JavaScript. Jangan menambah framework, library, gambar, sprite, atau berkas audio.
2. **Jalankan pengujian** sebelum membuka PR: `node tests/run-tests.js`.
3. **Mode baru** = satu berkas di `modes/` yang mendaftar ke `MV.MODES` (lihat `modes/hazard-run.js` sebagai contoh kecil), ditambah satu entri di `data/modes.js`.
4. **Lintasan baru** = satu entri di `data/tracks.js`. Uji dengan pengujian lintasan (jarak antar-bagian, radius tikungan, arah start).
5. Gunakan bahasa Indonesia untuk teks yang tampil di game dan komentar kode.

Ide yang disambut: lintasan baru, kendaraan baru, mode baru, perbaikan kontrol sentuh, terjemahan, dan laporan bug.
