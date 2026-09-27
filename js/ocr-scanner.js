/**
 * EduGrade v1.0 — Client-Side OCR Scanner Simulation
 * Lomba INVENTION 2026: "Building Smarter Communities Through Digital Learning"
 */

const OCRScannerService = {
  SAMPLE_OCR_DATA: [
    { id: 'sub-ocr-1', nama: 'Pendidikan Agama & Budi Pekerti', tipe: 'Umum', kkm: 75, sem1: 89, sem2: 91, sem3: 92, sem4: 93, sem5: 95 },
    { id: 'sub-ocr-2', nama: 'Pendidikan Pancasila', tipe: 'Umum', kkm: 75, sem1: 88, sem2: 89, sem3: 90, sem4: 92, sem5: 94 },
    { id: 'sub-ocr-3', nama: 'Bahasa Indonesia', tipe: 'Umum', kkm: 75, sem1: 91, sem2: 92, sem3: 94, sem4: 95, sem5: 97 },
    { id: 'sub-ocr-4', nama: 'Matematika Umum', tipe: 'Umum', kkm: 75, sem1: 94, sem2: 95, sem3: 96, sem4: 97, sem5: 99 },
    { id: 'sub-ocr-5', nama: 'Bahasa Inggris', tipe: 'Umum', kkm: 75, sem1: 89, sem2: 91, sem3: 93, sem4: 94, sem5: 96 },
    { id: 'sub-ocr-6', nama: 'Sejarah Indonesia', tipe: 'Umum', kkm: 75, sem1: 87, sem2: 89, sem3: 90, sem4: 92, sem5: 93 },
    { id: 'sub-ocr-7', nama: 'Matematika Tingkat Lanjut', tipe: 'Peminatan', kkm: 75, sem1: 92, sem2: 94, sem3: 95, sem4: 97, sem5: 98 },
    { id: 'sub-ocr-8', nama: 'Fisika', tipe: 'Peminatan', kkm: 75, sem1: 90, sem2: 93, sem3: 94, sem4: 96, sem5: 97 },
    { id: 'sub-ocr-9', nama: 'Kimia', tipe: 'Peminatan', kkm: 75, sem1: 89, sem2: 92, sem3: 93, sem4: 95, sem5: 96 },
    { id: 'sub-ocr-10', nama: 'Biologi', tipe: 'Peminatan', kkm: 75, sem1: 87, sem2: 89, sem3: 91, sem4: 93, sem5: 94 }
  ],

  currentInterval: null,

  startScan(onProgress, onComplete) {
    this.cancelScan();
    let step = 0;
    const steps = [
      'Inisialisasi neural scanner client-side...',
      'Mendeteksi grid tabel Rapor Kurikulum Merdeka...',
      'Melakukan segmentasi baris mata pelajaran...',
      'Mengekstraksi nilai capaian Semester 1–5...',
      'Verifikasi KKM & validasi matematis...'
    ];

    this.currentInterval = setInterval(() => {
      if (step < steps.length) {
        onProgress(steps[step], Math.round(((step + 1) / steps.length) * 100));
        step++;
      } else {
        this.cancelScan();
        onComplete(this.SAMPLE_OCR_DATA);
      }
    }, 450);
  },

  cancelScan() {
    if (this.currentInterval) {
      clearInterval(this.currentInterval);
      this.currentInterval = null;
    }
  }
};
