# TracKS

Aplikasi web untuk melacak progres SKS mahasiswa **Teknik Informatika Universitas Riau** berdasarkan Kurikulum 2017 Revisi.

## Fitur

- **Tracking SKS** — Pantau 63 mata kuliah (144 SKS) across 8 semester
- **Pilihan Agama** — Pilih 1 dari 5 mata kuliah agama
- **Konversi MBKM** — Input konversi Studi Independen / Kerja Praktik (maks 2 periode, 20 SKS/periode)
- **Prediksi Kelulusan** — Estimasi semester lulus berdasarkan progress
- **Grafik SKS** — Visualisasi SKS per semester
- **Dark Mode** — Tema terang/gelap
- **Responsif** — Bisa diakses dari HP maupun desktop

## Tech Stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Firebase](https://firebase.google.com/) (Auth + Firestore)
- [Recharts](https://recharts.org/)
- [React Router v7](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/)

## Memulai

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build
```

## Struktur Proyek

```
src/
├── pages/          # Login, Dashboard, Prediksi
├── components/     # Navbar, Footer, SummaryCards, SKSChart, SemesterTable, MBKMModal
├── context/        # AuthContext (Firebase Auth)
├── firebase/       # Konfigurasi Firebase
└── data/           # Data kurikulum TI UNRI
```

## Lisensi

MIT
