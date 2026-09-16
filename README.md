# Musikfy

> Aplikasi web pemutar musik ringkas dan bebas distraksi yang terintegrasi dengan katalog YouTube Music. Dirancang dengan efisiensi kuota data melalui pemutaran audio berkecepatan tinggi tanpa beban streaming video beresolusi tinggi.

---

## Daftar Isi
- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Proyek](#struktur-proyek)
- [Panduan Instalasi & Menjalankan](#panduan-instalasi--menjalankan)
- [Cara Kerja Sistem Pemutaran Audio](#cara-kerja-sistem-pemutaran-audio)
- [Catatan & Penafian](#catatan--penafian)

---

## Fitur Utama

### 1. Streaming Audio Ringan & Hemat Kuota
* Pemutar audio berbasis YouTube IFrame API tanpa tampilan video (*headless player*).
* Kualitas video di latar belakang dikunci pada resolusi **240p (`small`)** untuk memangkas konsumsi kuota data internet, sementara track audio tetap menggunakan kualitas standar YouTube (Opus ~160 kbps / AAC ~128 kbps).
* **Continuous Playback**: Musik terus berputar tanpa jeda saat Anda berpindah halaman antara Beranda, Hasil Pencarian, maupun Detail Playlist.

### 2. Eksplorasi & Pencarian Cepat
* **Katalog Beranda Dinamis**: Mengambil daftar lagu terpopuler (*Top Songs*), rekomendasi lagu (*Recently listening*), dan video musik unggulan langsung dari YouTube Music melalui endpoint internal `/api/music/home`.
* **Filter Genre Musik**: Mendukung filter genre instan (Pop, Hip Hop, Jazz, Electronic, Rock, R&B, dan lainnya).
* **Pencarian Real-Time**: Pencarian lagu, album, dan artis dengan *debounced query* dan *suggestion chips* via endpoint `/api/music/search`.
* **In-Memory Cache**: Respons data pencarian dan beranda disimpan sementara di memori server untuk meminimalkan beban jaringan.

### 3. Manajemen Antrian Lagu (Queue)
* **Add to Queue**: Tambahkan lagu ke antrian dari Beranda, Hasil Pencarian, atau Playlist melalui menu 3-titik.
* **Panel Antrian (Queue Drawer)**: Panel laci samping untuk melihat lagu yang sedang diputar (*Now Playing*) dan urutan lagu berikutnya (*Up Next*).
* **Kontrol Antrian**: Pengguna dapat memutar langsung lagu di dalam antrian, menghapus lagu tertentu, atau mengosongkan antrian sekaligus.
* Pemutar otomatis memutar lagu berikutnya dari antrian teratas saat lagu selesai (*auto-advance*).

### 4. Manajemen Playlist Mandiri (CRUD)
* **Buat Playlist Baru**: Form modal dialog dengan nama playlist, deskripsi singkat, dan pilihan sampul gambar estetik.
* **Tambahkan Lagu ke Playlist**: Dialog pemilih playlist dengan indikator lagu yang sudah ada untuk mencegah duplikasi.
* **Ubah Playlist**: Mengubah nama, deskripsi, dan sampul playlist kapan saja.
* **Hapus Playlist**: Dialog konfirmasi aman sebelum menghapus playlist.
* **Halaman Detail Playlist**: Dilengkapi tombol *Putar Semua*, *Antrekan Semua*, serta opsi menghapus lagu dari playlist.

### 5. Persistensi Data Lokal (LocalStorage)
* Seluruh data antrian lagu, playlist buatan pengguna, dan daftar lagu favorit tersimpan secara otomatis di browser menggunakan **Zustand** dengan middleware `persist`. Data tetap tersimpan bahkan setelah browser ditutup atau dimuat ulang.

### 6. Desain Antarmuka Terkunci (Locked App Shell)
* Navigasi Sidebar, Top Header, dan Music Bar terkunci diam di posisinya saat halaman digulir (*scroll*). Hanya area konten daftar lagu yang bergerak.
* Dilengkapi scrollbar ramping bernuansa gelap dan dukungan tampilan responsif untuk perangkat bergerak maupun desktop.

---

## Teknologi yang Digunakan

* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) dengan [Turbopack](https://turbo.build/)
* **Pustaka Antarmuka**: [React 19](https://react.dev/)
* **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) dengan middleware `persist`
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Ikon**: [Lucide React](https://lucide.dev/)
* **Penyedia Komponen**: Shadcn UI & Base UI
* **Integrasi YouTube Music**: [YouTubei.js (Innertube)](https://github.com/LuanRT/YouTube.js)
* **Runtime & Package Manager**: [Bun](https://bun.sh/)

---

## Struktur Proyek

Proyek ini menerapkan arsitektur kolokasi (*colocated pattern*) pada setiap folder halaman:

```text
musikfy-app/
├── app/
│   ├── (home)/               # Halaman utama (Beranda)
│   │   ├── page.tsx          # Tampilan halaman beranda
│   │   ├── useHooks.tsx      # State dan logika halaman beranda
│   │   └── components/       # Komponen lokal (header, sidebar, carousel, playlist-detail)
│   ├── api/
│   │   └── music/
│   │       ├── home/route.ts   # Endpoint katalog beranda YouTube Music
│   │       └── search/route.ts # Endpoint pencarian YouTube Music
│   ├── search/               # Halaman pencarian
│   │   ├── page.tsx          # Tampilan halaman pencarian
│   │   ├── useHooks.tsx      # State dan logika pencarian
│   │   └── components/       # Komponen lokal pencarian (header, list, empty-state)
│   ├── globals.css           # Styling Tailwind CSS v4 & custom scrollbar
│   └── layout.tsx            # Root layout terbungkus PlayerProvider
├── components/
│   ├── modals/               # Modal dialog (Create, Edit, Delete, Add to Playlist)
│   ├── queue/                # Drawer daftar antrian lagu
│   ├── song-action-menu.tsx  # Dropdown menu aksi lagu (3-titik)
│   └── ui/                   # Komponen dasar UI (button, input, slider, badge)
├── lib/
│   ├── context/
│   │   └── player-context.tsx  # Provider pemutar audio global continuous
│   ├── store/
│   │   └── useMusicStore.ts    # Store Zustand terhubung LocalStorage
│   ├── types/
│   │   └── music.ts            # Definisi antarmuka TypeScript
│   └── data/
│       └── initial-music.ts    # Data awalan untuk fallback
├── package.json
└── README.md
```

---

## Panduan Instalasi & Menjalankan

### Kebutuhan Awal
* Pastikan Anda telah memasang **Bun** versi 1.1 ke atas di perangkat Anda.
  Jika belum, pasang Bun melalui instruksi di [bun.sh](https://bun.sh/).

### Langkah Instalasi

1. **Kloning Repositori**
   ```bash
   git clone https://github.com/username-anda/musikfy-app.git
   cd musikfy-app
   ```

2. **Pasang Dependensi**
   ```bash
   bun install
   ```

3. **Jalankan Server Pengembangan**
   ```bash
   bun run dev
   ```

4. **Buka Aplikasi**
   Buka peramban web dan arahkan ke alamat [http://localhost:3000](http://localhost:3000).

### Perintah Lainnya

* **Linting Kode**:
  ```bash
  bun run lint
  ```
* **Kompilasi Produksi**:
  ```bash
  bun run build
  ```
* **Menjalankan Server Produksi**:
  ```bash
  bun run start
  ```

---

## Cara Kerja Sistem Pemutaran Audio

1. **Headless Player Engine**:
   Aplikasi memuat satu elemen iframe YouTube IFrame API yang diletakkan di dalam `PlayerProvider` pada level root layout. Elemen ini berukuran 1x1 piksel dan disembunyikan dari pandangan pengguna.
2. **Kualitas 240p Terkunci**:
   Saat video dimuat via YouTube ID, aplikasi secara otomatis memanggil fungsi `setPlaybackQuality('small')`. Hal ini menginstruksikan YouTube untuk hanya mengunduh data video beresolusi 240p.
3. **Pemisahan Jalur Audio (Teknologi DASH)**:
   Arsitektur modern YouTube menyajikan aliran video dan aliran audio secara terpisah. Mengurangi resolusi video ke 240p tidak menurunkan bitrate audio; pengguna tetap menikmati kejernihan suara standar YouTube tanpa boros kuota data.
4. **Sinkronisasi Antrian**:
   Ketika suatu lagu berakhir (`event.data === 0`), pendengar event YouTube secara otomatis mengambil lagu berikutnya dari antrian yang dikelola oleh store Zustand.

---

## Catatan & Penafian

* Musikfy dikembangkan sebagai proyek pembelajaran dan demonstrasi implementasi Next.js App Router, React 19, Tailwind CSS v4, dan Zustand.
* Seluruh hak cipta audio dan konten video dimiliki oleh kreator dan artis masing-masing di platform YouTube.
