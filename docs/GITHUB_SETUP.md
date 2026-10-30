# Panduan upload ke GitHub

Semua perintah memakai akun **Faris-IT** dan repo **velocity-game**. Ganti jika berbeda.
Alamat game setelah Pages aktif: **https://faris-it.github.io/velocity-game/**

## 1. Siapkan folder

Ekstrak `velocity-game-v1.0.0.zip` sehingga folder `velocity-game/` berisi `index.html`, `README.md`, dst. Lalu cek dulu:

```bash
cd velocity-game
node tests/run-tests.js        # harus: SEMUA LULUS
```

## 2. Buat repo dan push (GitHub CLI)

```bash
git init -b main
git add .
git commit -m "feat: Mufa Velocity v1.0.0"

gh repo create Faris-IT/velocity-game --public --source=. --remote=origin --push \
  --description "🏎️ Mufa Velocity — game balap arcade top-down bergaya neon: 13 mode, 4 lintasan, NPC, ghost, achievement. HTML + CSS + JavaScript murni, tanpa framework dan aset." \
  --homepage "https://faris-it.github.io/velocity-game/"
```

Tanpa GitHub CLI: buat repo kosong bernama `velocity-game` di github.com, lalu:

```bash
git remote add origin https://github.com/Faris-IT/velocity-game.git
git push -u origin main
```

## 3. Deskripsi, website, dan topics

Di halaman repo klik ikon roda gigi di kolom **About**, lalu isi:

- **Description**: `🏎️ Mufa Velocity — game balap arcade top-down bergaya neon: 13 mode, 4 lintasan, NPC, ghost, achievement. HTML + CSS + JavaScript murni, tanpa framework dan aset.`
- **Website**: `https://faris-it.github.io/velocity-game/`
- **Topics**:

```text
javascript html5 css3 canvas game racing-game arcade-game browser-game html5-game
canvas-game 2d-game top-down vanilla-js neon procedural-generation game-development
github-pages time-trial ghost-racing indonesia
```

Atau lewat terminal:

```bash
gh repo edit Faris-IT/velocity-game \
  --add-topic javascript --add-topic html5 --add-topic css3 --add-topic canvas --add-topic game \
  --add-topic racing-game --add-topic arcade-game --add-topic browser-game --add-topic html5-game \
  --add-topic canvas-game --add-topic 2d-game --add-topic top-down --add-topic vanilla-js \
  --add-topic neon --add-topic procedural-generation --add-topic game-development \
  --add-topic github-pages --add-topic time-trial --add-topic ghost-racing --add-topic indonesia
```

## 4. Aktifkan GitHub Pages (website)

Cara termudah: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Workflow `.github/workflows/pages.yml` akan menerbitkan game setiap push ke `main`. Atau lewat terminal:

```bash
gh api -X POST repos/Faris-IT/velocity-game/pages -f build_type=workflow
gh workflow run pages.yml     # jalankan deploy pertama
```

Tunggu 1–2 menit, lalu buka alamat game di atas.

## 5. Gambar pratinjau (social preview)

Saat tautan repo dibagikan di media sosial, gambar inilah yang tampil.
**Settings → General → Social preview → Upload an image** → pilih `assets/social-preview.png` (1280×640).
(Langkah ini hanya bisa lewat web, tidak ada perintah terminalnya.)

## 6. Rilis (Releases)

```bash
git tag -a v1.0.0 -m "Mufa Velocity v1.0.0"
git push origin v1.0.0

# kemas berkas rilis
zip -r velocity-game-v1.0.0.zip . -x ".git/*" "*.zip"

gh release create v1.0.0 velocity-game-v1.0.0.zip \
  --title "🏁 Mufa Velocity v1.0.0 — Rilis pertama" \
  --notes-file RELEASE_NOTES.md
```

Tanpa terminal: **Releases → Draft a new release** → tag `v1.0.0` → judul di atas → tempel isi `RELEASE_NOTES.md` → lampirkan zip → **Publish release**.

## 7. Poles akhir

- **Pin repo** ke profilmu: Profile → Customize your pins.
- **Tambahkan tombol main** di README profil / portofolio dengan tautan Pages.
- Aktifkan **Issues** (sudah ada template bug dan fitur). Opsional: aktifkan **Discussions**.
- Setelah Pages aktif, ambil screenshot atau rekaman GIF permainan sungguhan dan taruh di `docs/screenshots/`, lalu tambahkan ke README (gambar bawaan README adalah render ilustrasi).
- Badge **Tests** di README akan hijau setelah workflow `tests.yml` selesai dijalankan pertama kali.
