# Musikfy Design Direction

Dokumen ini memuat arahan gaya dan panduan visual untuk antarmuka Musikfy.

## 1. Identitas & Karakter Produk

- **Nama Produk**: Musikfy
- **Karakter**: Pemutar audio YouTube yang modern, minimalis, dan fungsional.
- **Tujuan Antarmuka**: Memberikan pengalaman mendengarkan audio yang mulus, responsif, mudah dinavigasi, dan bebas distraksi.

## 2. Dial Pengaturan (Liveliness Dials)

- **ENERGY**: 2 (Balanced - profesional, fokus, tidak berlebihan)
- **RHYTHM**: 2 (Structured with breaks - ritme bagian yang jelas antara panel navigasi, galeri lagu, dan kontrol pemutar)
- **MOTION**: 1 (Calm - transisi halus hanya pada hover tombol, slider, dan indikator status audio)

## 3. Palet Warna (Berdasarkan Standar WCAG AA)

- **Base Background**: `#0b0f19` (Obsidian Dark)
- **Surface / Card**: `#111827` (Deep Slate)
- **Elevated Player Bar**: `#161f33` (Docked Player)
- **Border**: `#1f293d` (Kontras non-teks > 3:1)
- **Text Primary**: `#f9fafb` (Kontras terhadap background > 15:1 - Memenuhi WCAG AA)
- **Text Secondary / Muted**: `#9ca3af` (Kontras terhadap background > 5:1 - Memenuhi WCAG AA)
- **Accent Primary**: `#10b981` (Vibrant Mint/Emerald untuk tombol aksi utama & progres waktu)
- **Accent Secondary / Active State**: `#38bdf8` (Sky Blue untuk indikator aktif)

## 4. Tipografi

- **Font Utama**: Geist Sans / System Sans-Serif
- **Skala Ukuran**:
  - Judul Halaman: `text-2xl` s/d `text-3xl` font-semibold
  - Judul Lagu: `text-sm` s/d `text-base` font-medium
  - Artis / Metadata: `text-xs` s/d `text-sm` text-muted
  - Kontrol Player / Durasi: `text-xs` font-mono terukur

## 5. Tata Letak & Responsivitas (antislop-layoutmobile)

- **Desktop**: Tata letak sidebar navigasi di kiri, konten rekomendasi/pencarian di tengah, antrean lagu di samping atau modal, dan pemutar audio permanen di bagian bawah.
- **Mobile**:
  - Kolom tunggal yang mengalir alami (_reflow_, bukan desktop yang dipadatkan).
  - Target ketukan tombol kontrol minimal 44x44 px.
  - Floating bottom player bar yang tidak menutupi item daftar terakhir (dengan padding aman di bawah).

## 6. Aksesibilitas & Kontrol Keyboard (antislop-human)

- Setiap tombol memiliki penanda fokus visual (`focus-visible:ring-2`).
- Dukungan tombol keyboard: `Space` untuk play/pause, panah untuk volume/seek, `Escape` untuk menutup drawer/modal antrean.
- Tiga state wajib pada tampilan data: _Empty State_, _Loading State_, dan _Error State_.
