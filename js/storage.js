/**
 * EduGrade v1.0 — LocalStorage State Management
 * Lomba INVENTION 2026: "Building Smarter Communities Through Digital Learning"
 */

const STORAGE_KEYS = {
  USER_PROFILE: 'edugrade_profile',
  THEME: 'edugrade_theme',
  RAPOR_SUBJECTS: 'edugrade_rapor_subjects',
  TKA_TRYOUTS: 'edugrade_tka_tryouts',
  UTBK_TRYOUTS: 'edugrade_utbk_tryouts',
  PTN_CHOICES: 'edugrade_ptn_choices',
  RECENT_TOOLS: 'edugrade_recent_tools',
  STUDY_TASKS: 'edugrade_study_tasks',
  STREAK_DATA: 'edugrade_streak_data',
  AUTH_USER: 'edugrade_auth_user',
  REGISTERED_USERS: 'edugrade_registered_users'
};

// Akun Demo resmi untuk penjurian & presentasi
const DEMO_ACCOUNT = {
  username: 'bhisma',
  password: 'password123',
  nama: 'Bhisma',
  kelas: 'XII IPA 1',
  sekolah: 'SMAN 1 Teladan',
  foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

// Default Sample Data (Siswa SMA/K Kurikulum Merdeka)
const DEFAULT_PROFILE = {
  nama: 'Bhisma',
  kelas: 'XII IPA 1',
  sekolah: 'SMAN 1 Teladan',
  foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  nisn: '0061298451',
  streakHari: 12
};

const DEFAULT_RAPOR_SUBJECTS = [
  { id: 'sub-1', nama: 'Pendidikan Agama & Budi Pekerti', tipe: 'Umum', kkm: 75, sem1: 88, sem2: 90, sem3: 91, sem4: 92, sem5: 94 },
  { id: 'sub-2', nama: 'Pendidikan Pancasila', tipe: 'Umum', kkm: 75, sem1: 86, sem2: 87, sem3: 89, sem4: 90, sem5: 93 },
  { id: 'sub-3', nama: 'Bahasa Indonesia', tipe: 'Umum', kkm: 75, sem1: 90, sem2: 91, sem3: 93, sem4: 94, sem5: 96 },
  { id: 'sub-4', nama: 'Matematika Umum', tipe: 'Umum', kkm: 75, sem1: 92, sem2: 94, sem3: 95, sem4: 96, sem5: 98 },
  { id: 'sub-5', nama: 'Bahasa Inggris', tipe: 'Umum', kkm: 75, sem1: 87, sem2: 89, sem3: 92, sem4: 93, sem5: 95 },
  { id: 'sub-6', nama: 'Sejarah Indonesia', tipe: 'Umum', kkm: 75, sem1: 85, sem2: 88, sem3: 89, sem4: 91, sem5: 92 },
  { id: 'sub-7', nama: 'Matematika Tingkat Lanjut', tipe: 'Peminatan', kkm: 75, sem1: 91, sem2: 93, sem3: 94, sem4: 96, sem5: 97 },
  { id: 'sub-8', nama: 'Fisika', tipe: 'Peminatan', kkm: 75, sem1: 89, sem2: 92, sem3: 93, sem4: 95, sem5: 96 },
  { id: 'sub-9', nama: 'Kimia', tipe: 'Peminatan', kkm: 75, sem1: 88, sem2: 90, sem3: 92, sem4: 94, sem5: 95 },
  { id: 'sub-10', nama: 'Biologi', tipe: 'Peminatan', kkm: 75, sem1: 86, sem2: 88, sem3: 90, sem4: 92, sem5: 93 }
];

const DEFAULT_TKA_TRYOUTS = [
  {
    toKe: 1,
    tanggal: '15 Okt 2025',
    bIndo: 710,
    matWajib: 730,
    bIng: 690,
    mapelPilihan1Nama: 'Fisika',
    mapelPilihan1Nilai: 720,
    mapelPilihan2Nama: 'Kimia',
    mapelPilihan2Nilai: 700
  },
  {
    toKe: 2,
    tanggal: '10 Nov 2025',
    bIndo: 725,
    matWajib: 745,
    bIng: 710,
    mapelPilihan1Nama: 'Fisika',
    mapelPilihan1Nilai: 735,
    mapelPilihan2Nama: 'Kimia',
    mapelPilihan2Nilai: 720
  },
  {
    toKe: 3,
    tanggal: '05 Des 2025',
    bIndo: 740,
    matWajib: 760,
    bIng: 730,
    mapelPilihan1Nama: 'Fisika',
    mapelPilihan1Nilai: 750,
    mapelPilihan2Nama: 'Kimia',
    mapelPilihan2Nilai: 740
  },
  {
    toKe: 4,
    tanggal: '15 Jan 2026',
    bIndo: 755,
    matWajib: 775,
    bIng: 745,
    mapelPilihan1Nama: 'Fisika',
    mapelPilihan1Nilai: 765,
    mapelPilihan2Nama: 'Kimia',
    mapelPilihan2Nilai: 755
  }
];

const DEFAULT_UTBK_TRYOUTS = [
  {
    toKe: 1,
    tanggal: '20 Okt 2025',
    pu: 680,
    ppu: 670,
    pbm: 690,
    pk: 720,
    pm: 710,
    litIndo: 730,
    litIng: 700
  },
  {
    toKe: 2,
    tanggal: '18 Nov 2025',
    pu: 700,
    ppu: 690,
    pbm: 710,
    pk: 740,
    pm: 730,
    litIndo: 745,
    litIng: 720
  },
  {
    toKe: 3,
    tanggal: '12 Des 2025',
    pu: 720,
    ppu: 710,
    pbm: 730,
    pk: 760,
    pm: 750,
    litIndo: 760,
    litIng: 740
  },
  {
    toKe: 4,
    tanggal: '22 Jan 2026',
    pu: 735,
    ppu: 725,
    pbm: 745,
    pk: 775,
    pm: 765,
    litIndo: 775,
    litIng: 755
  }
];

// Master Data PTN & Prodi SNPMB Kemendikbudristek
const MASTER_PTN_DATABASE = [
  {
    id: 'itb-if',
    ptn: 'Institut Teknologi Bandung (ITB)',
    singkatan: 'ITB',
    prodi: 'Sekolah Teknik Elektro & Informatika (STEI - Komputasi)',
    rumpun: 'Saintek',
    dayaTampungSNBP: 85,
    peminatSNBP: 2420,
    keketatanSNBP: 3.51,
    passingGradeSNBP: 93.8,
    dayaTampungSNBT: 110,
    peminatSNBT: 3650,
    keketatanSNBT: 3.01,
    passingGradeSNBT: 765,
    logo: 'fa-microchip',
    warna: '#0284c7'
  },
  {
    id: 'ui-fk',
    ptn: 'Universitas Indonesia (UI)',
    singkatan: 'UI',
    prodi: 'Pendidikan Dokter (Fakultas Kedokteran)',
    rumpun: 'Saintek',
    dayaTampungSNBP: 55,
    peminatSNBP: 2680,
    keketatanSNBP: 2.05,
    passingGradeSNBP: 94.5,
    dayaTampungSNBT: 75,
    peminatSNBT: 3890,
    keketatanSNBT: 1.92,
    passingGradeSNBT: 778,
    logo: 'fa-user-doctor',
    warna: '#eab308'
  },
  {
    id: 'ugm-ak',
    ptn: 'Universitas Gadjah Mada (UGM)',
    singkatan: 'UGM',
    prodi: 'Ilmu Aktuaria (FMIPA)',
    rumpun: 'Saintek',
    dayaTampungSNBP: 24,
    peminatSNBP: 890,
    keketatanSNBP: 2.69,
    passingGradeSNBP: 92.4,
    dayaTampungSNBT: 36,
    peminatSNBT: 1420,
    keketatanSNBT: 2.53,
    passingGradeSNBT: 742,
    logo: 'fa-chart-line',
    warna: '#0d9488'
  },
  {
    id: 'its-ti',
    ptn: 'Institut Teknologi Sepuluh Nopember (ITS)',
    singkatan: 'ITS',
    prodi: 'Teknik Industri (FTIRS)',
    rumpun: 'Saintek',
    dayaTampungSNBP: 60,
    peminatSNBP: 1350,
    keketatanSNBP: 4.44,
    passingGradeSNBP: 90.7,
    dayaTampungSNBT: 80,
    peminatSNBT: 2100,
    keketatanSNBT: 3.80,
    passingGradeSNBT: 728,
    logo: 'fa-industry',
    warna: '#2563eb'
  },
  {
    id: 'unair-farmasi',
    ptn: 'Universitas Airlangga (UNAIR)',
    singkatan: 'UNAIR',
    prodi: 'Farmasi (Fakultas Farmasi)',
    rumpun: 'Saintek',
    dayaTampungSNBP: 75,
    peminatSNBP: 1980,
    keketatanSNBP: 3.78,
    passingGradeSNBP: 91.2,
    dayaTampungSNBT: 100,
    peminatSNBT: 2890,
    keketatanSNBT: 3.46,
    passingGradeSNBT: 732,
    logo: 'fa-prescription-bottle-medical',
    warna: '#f59e0b'
  },
  {
    id: 'undip-hukum',
    ptn: 'Universitas Diponegoro (UNDIP)',
    singkatan: 'UNDIP',
    prodi: 'Ilmu Hukum (Fakultas Hukum)',
    rumpun: 'Soshum',
    dayaTampungSNBP: 180,
    peminatSNBP: 3200,
    keketatanSNBP: 5.62,
    passingGradeSNBP: 89.8,
    dayaTampungSNBT: 240,
    peminatSNBT: 4400,
    keketatanSNBT: 5.45,
    passingGradeSNBT: 710,
    logo: 'fa-scale-balanced',
    warna: '#64748b'
  },
  {
    id: 'unpad-hi',
    ptn: 'Universitas Padjadjaran (UNPAD)',
    singkatan: 'UNPAD',
    prodi: 'Hubungan Internasional (FISIP)',
    rumpun: 'Soshum',
    dayaTampungSNBP: 45,
    peminatSNBP: 1950,
    keketatanSNBP: 2.30,
    passingGradeSNBP: 92.0,
    dayaTampungSNBT: 60,
    peminatSNBT: 2750,
    keketatanSNBT: 2.18,
    passingGradeSNBT: 738,
    logo: 'fa-earth-americas',
    warna: '#8b5cf6'
  },
  {
    id: 'ipb-ilkom',
    ptn: 'IPB University (IPB)',
    singkatan: 'IPB',
    prodi: 'Ilmu Komputer (FMIPA)',
    rumpun: 'Saintek',
    dayaTampungSNBP: 50,
    peminatSNBP: 1720,
    keketatanSNBP: 2.90,
    passingGradeSNBP: 91.8,
    dayaTampungSNBT: 70,
    peminatSNBT: 2350,
    keketatanSNBT: 2.97,
    passingGradeSNBT: 735,
    logo: 'fa-laptop-code',
    warna: '#16a34a'
  }
];

const DEFAULT_PTN_CHOICES = [
  'itb-if',
  'ui-fk',
  'ugm-ak',
  'its-ti'
];

const DEFAULT_RECENT_TOOLS = [
  { id: 'pomodoro', name: 'Pomodoro Timer', icon: 'fa-clock', desc: 'Sesi fokus 25 menit dengan interval istirahat terukur.', lastUsed: '10 menit yang lalu' },
  { id: 'pembersih', name: 'Pembersih Teks', icon: 'fa-broom', desc: 'Rapikan teks berantakan, spasi ganda & kapitalisasi.', lastUsed: '1 jam yang lalu' },
  { id: 'sitasi', name: 'Generator Sitasi', icon: 'fa-quote-right', desc: 'Pembuat referensi standar APA 7th, MLA 9th, dan IEEE.', lastUsed: 'Kemarin' },
  { id: 'jadwal', name: 'Perencana Jadwal', icon: 'fa-calendar-check', desc: 'Rancang timeline belajar intensif berkala.', lastUsed: '2 hari yang lalu' }
];

const DEFAULT_STUDY_TASKS = [
  { id: 'task-1', mapel: 'Matematika Lanjut', judul: 'Latihan Soal Kalkulus & Integral UTBK', durasi: '60 Menit', prioritas: 'Tinggi', selesai: true },
  { id: 'task-2', mapel: 'Fisika', judul: 'Review Konsep Medan Magnet & Induksi Faraday', durasi: '45 Menit', prioritas: 'Tinggi', selesai: false },
  { id: 'task-3', mapel: 'Penalaran Kuantitatif', judul: 'Simulasi Drill 20 Soal PK dalam 25 Menit', durasi: '30 Menit', prioritas: 'Sedang', selesai: false },
  { id: 'task-4', mapel: 'Literasi Bahasa Inggris', judul: 'Analisis Soal Bacaan Scientific Text SNBT', durasi: '40 Menit', prioritas: 'Rendah', selesai: true }
];

// Helper Functions
const StorageService = {
  getProfile() {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      this.setProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    return JSON.parse(raw);
  },

  setProfile(data) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data));
  },

  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  getRaporSubjects() {
    const raw = localStorage.getItem(STORAGE_KEYS.RAPOR_SUBJECTS);
    if (!raw) {
      this.setRaporSubjects(DEFAULT_RAPOR_SUBJECTS);
      return DEFAULT_RAPOR_SUBJECTS;
    }
    return JSON.parse(raw);
  },

  setRaporSubjects(data) {
    localStorage.setItem(STORAGE_KEYS.RAPOR_SUBJECTS, JSON.stringify(data));
  },

  getTKATryouts() {
    const raw = localStorage.getItem(STORAGE_KEYS.TKA_TRYOUTS);
    if (!raw) {
      this.setTKATryouts(DEFAULT_TKA_TRYOUTS);
      return DEFAULT_TKA_TRYOUTS;
    }
    return JSON.parse(raw);
  },

  setTKATryouts(data) {
    localStorage.setItem(STORAGE_KEYS.TKA_TRYOUTS, JSON.stringify(data));
  },

  getUTBKTryouts() {
    const raw = localStorage.getItem(STORAGE_KEYS.UTBK_TRYOUTS);
    if (!raw) {
      this.setUTBKTryouts(DEFAULT_UTBK_TRYOUTS);
      return DEFAULT_UTBK_TRYOUTS;
    }
    return JSON.parse(raw);
  },

  setUTBKTryouts(data) {
    localStorage.setItem(STORAGE_KEYS.UTBK_TRYOUTS, JSON.stringify(data));
  },

  getPTNChoices() {
    const raw = localStorage.getItem(STORAGE_KEYS.PTN_CHOICES);
    if (!raw) {
      this.setPTNChoices(DEFAULT_PTN_CHOICES);
      return DEFAULT_PTN_CHOICES;
    }
    return JSON.parse(raw);
  },

  setPTNChoices(data) {
    localStorage.setItem(STORAGE_KEYS.PTN_CHOICES, JSON.stringify(data));
  },

  getMasterPTN() {
    return MASTER_PTN_DATABASE;
  },

  getRecentTools() {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_TOOLS);
    if (!raw) {
      this.setRecentTools(DEFAULT_RECENT_TOOLS);
      return DEFAULT_RECENT_TOOLS;
    }
    return JSON.parse(raw);
  },

  setRecentTools(data) {
    localStorage.setItem(STORAGE_KEYS.RECENT_TOOLS, JSON.stringify(data));
  },

  logToolUsage(toolId) {
    const current = this.getRecentTools();
    const map = {
      pomodoro: { name: 'Pomodoro Timer', icon: 'fa-clock', desc: 'Sesi fokus 25 menit dengan interval istirahat terukur.' },
      pembersih: { name: 'Pembersih Teks', icon: 'fa-broom', desc: 'Rapikan teks berantakan, spasi ganda & kapitalisasi.' },
      sitasi: { name: 'Generator Sitasi', icon: 'fa-quote-right', desc: 'Pembuat referensi standar APA 7th, MLA 9th, dan IEEE.' },
      jadwal: { name: 'Perencana Jadwal', icon: 'fa-calendar-check', desc: 'Rancang timeline belajar intensif berkala.' }
    };

    if (!map[toolId]) return;

    // Filter out if already in list and put at front
    const updated = current.filter(t => t.id !== toolId);
    updated.unshift({
      id: toolId,
      name: map[toolId].name,
      icon: map[toolId].icon,
      desc: map[toolId].desc,
      lastUsed: 'Baru saja'
    });

    this.setRecentTools(updated.slice(0, 4));
  },

  getStudyTasks() {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDY_TASKS);
    if (!raw) {
      this.setStudyTasks(DEFAULT_STUDY_TASKS);
      return DEFAULT_STUDY_TASKS;
    }
    return JSON.parse(raw);
  },

  setStudyTasks(data) {
    localStorage.setItem(STORAGE_KEYS.STUDY_TASKS, JSON.stringify(data));
  },

  // === AUTHENTICATION & DEMO USER MANAGEMENT ===
  getDemoAccount() {
    return DEMO_ACCOUNT;
  },

  getRegisteredUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      return raw ? JSON.parse(raw) : [DEMO_ACCOUNT];
    } catch (e) {
      return [DEMO_ACCOUNT];
    }
  },

  saveRegisteredUsers(users) {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
  },

  getAuthUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  setAuthUser(user) {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    // Pastikan user profile juga sinkron
    if (user) {
      const currentProfile = this.getProfile();
      currentProfile.nama = user.nama || currentProfile.nama;
      if (user.kelas) currentProfile.kelas = user.kelas;
      if (user.sekolah) currentProfile.sekolah = user.sekolah;
      if (user.foto) currentProfile.foto = user.foto;
      this.setProfile(currentProfile);
    }
  },

  login(username, password) {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Cek Akun Demo Utama
    if (cleanUser === DEMO_ACCOUNT.username.toLowerCase() && cleanPass === DEMO_ACCOUNT.password) {
      this.setAuthUser(DEMO_ACCOUNT);
      return { success: true, user: DEMO_ACCOUNT, isDemo: true };
    }

    // 2. Cek Database Pengguna Terdaftar
    const users = this.getRegisteredUsers();
    const found = users.find(u => u.username.toLowerCase() === cleanUser && u.password === cleanPass);
    if (found) {
      this.setAuthUser(found);
      return { success: true, user: found, isDemo: false };
    }

    return {
      success: false,
      message: 'Username atau password tidak cocok! Gunakan Akun Demo (bhisma / password123).'
    };
  },

  register(username, password, nama, kelas) {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    const cleanNama = (nama || '').trim() || cleanUser;
    const cleanKelas = (kelas || '').trim() || 'XII SMA';

    if (!cleanUser || !cleanPass) {
      return { success: false, message: 'Username dan password wajib diisi!' };
    }

    if (cleanUser.length < 3) {
      return { success: false, message: 'Username minimal 3 karakter!' };
    }

    const users = this.getRegisteredUsers();
    if (cleanUser === DEMO_ACCOUNT.username.toLowerCase() || users.some(u => u.username.toLowerCase() === cleanUser)) {
      return { success: false, message: 'Username sudah digunakan, silakan pilih username lain atau gunakan Akun Demo!' };
    }

    const newUser = {
      username: cleanUser,
      password: cleanPass,
      nama: cleanNama,
      kelas: cleanKelas,
      sekolah: 'SMAN 1 Teladan',
      foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    users.push(newUser);
    this.saveRegisteredUsers(users);
    this.setAuthUser(newUser);

    return { success: true, user: newUser };
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  resetAllData() {
    localStorage.clear();
    this.setProfile(DEFAULT_PROFILE);
    this.setTheme('light');
    this.setRaporSubjects(DEFAULT_RAPOR_SUBJECTS);
    this.setTKATryouts(DEFAULT_TKA_TRYOUTS);
    this.setUTBKTryouts(DEFAULT_UTBK_TRYOUTS);
    this.setPTNChoices(DEFAULT_PTN_CHOICES);
    this.setRecentTools(DEFAULT_RECENT_TOOLS);
    this.setStudyTasks(DEFAULT_STUDY_TASKS);
  }
};

// Initialize theme on script run
(function initEduGradeTheme() {
  const currentTheme = StorageService.getTheme();
  StorageService.setTheme(currentTheme);
})();
