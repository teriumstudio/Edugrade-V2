/**
 * EduGrade v1.0 — Analisis Nilai Controller
 * Lomba INVENTION 2026: "Building Smarter Communities Through Digital Learning"
 */

let activeRaporFilter = 'Semua'; // 'Semua', 'Umum', 'Peminatan'
let editingSubjectId = null;
let editingTKAIndex = null;
let editingUTBKIndex = null;
let activePTNIndex = 0; // Index dari pilihan PTN aktif (0, 1, 2, 3)

$(document).ready(function () {
  // Inisialisasi data halaman
  initAnalisaPage();

  // Tab Utama Navigasi Sub-Tab Atas: [Semua] | [Analisis Nilai Rapor] | [Analisis Nilai TKA] | [Analisis Nilai UTBK] | [Rasionalisasi PTN]
  $('.sub-nav-tab').on('click', function () {
    const targetTab = $(this).data('tab');
    $('.sub-nav-tab').removeClass('active bg-[#0066FF] text-white shadow-sm font-bold')
      .addClass('text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800');
    $(this).addClass('active bg-[#0066FF] text-white shadow-sm font-bold')
      .removeClass('text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800');

    $('.tab-content-section').addClass('hidden');
    $(`#tab-section-${targetTab}`).removeClass('hidden');

    // Trigger re-render sesuai tab
    if (targetTab === 'semua') renderTabSemua();
    else if (targetTab === 'rapor') renderTabRapor();
    else if (targetTab === 'tka') renderTabTKA();
    else if (targetTab === 'utbk') renderTabUTBK();
    else if (targetTab === 'rasionalisasi') renderTabRasionalisasi();
  });

  // Handle URL hash jika ada tab yang ditentukan
  const hash = window.location.hash.replace('#', '');
  if (hash && $(`#tab-nav-${hash}`).length > 0) {
    $(`#tab-nav-${hash}`).trigger('click');
  } else {
    // Default tab
    $('#tab-nav-semua').trigger('click');
  }

  setupRaporEvents();
  setupTKAEvents();
  setupUTBKEvents();
  setupRasionalisasiEvents();
  setupOCREvents();
});

function initAnalisaPage() {
  renderTabSemua();
  renderTabRapor();
  renderTabTKA();
  renderTabUTBK();
  renderTabRasionalisasi();
}

/* ========================================================
   TAB 1: SEMUA (Insight Gabungan)
   ======================================================== */
function renderTabSemua() {
  const subjects = StorageService.getRaporSubjects();
  const tkaList = StorageService.getTKATryouts();
  const utbkList = StorageService.getUTBKTryouts();
  const ptnChoices = StorageService.getPTNChoices();
  const masterPTN = StorageService.getMasterPTN();
  const profile = StorageService.getProfile();

  const raporStats = CalculationService.calculateRaporStats(subjects);
  const tkaStats = CalculationService.calculateTKAStats(tkaList);
  const utbkStats = CalculationService.calculateUTBKStats(utbkList);
  const readinessIndex = CalculationService.calculateAcademicReadinessIndex(
    raporStats.overallAvg,
    tkaStats.nextPrediction,
    utbkStats.nextPrediction,
    profile.streakHari || 12
  );

  // Update ringkasan metric cards
  $('#summary-rapor-avg').text(raporStats.overallAvg || 0);
  $('#summary-tka-pred').text(tkaStats.nextPrediction || 0);
  $('#summary-utbk-pred').text(utbkStats.nextPrediction || 0);
  $('#summary-readiness').text(`${readinessIndex}%`);

  // Render Perbandingan Semester Rapor (Sem 1 - 5)
  renderSemesterTrends(subjects);

  // Render Matriks Peluang 4 PTN
  renderSummaryPTNMatrix(ptnChoices, masterPTN, raporStats, tkaStats, utbkStats);
}

function renderSemesterTrends(subjects) {
  const container = $('#semester-trend-bars');
  if (container.length === 0) return;
  container.empty();

  for (let s = 1; s <= 5; s++) {
    const key = `sem${s}`;
    let sum = 0;
    let count = 0;
    subjects.forEach(sub => {
      const val = Number(sub[key]);
      if (!isNaN(val) && val > 0) {
        sum += val;
        count++;
      }
    });
    const avg = count > 0 ? (sum / count).toFixed(1) : 0;
    const heightPercent = Math.min(100, Math.max(20, (avg / 100) * 100));

    const barHtml = `
      <div class="flex-1 flex flex-col items-center">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">${avg}</span>
        <div class="w-full bg-slate-100 dark:bg-slate-700/60 rounded-xl h-36 flex items-end p-1.5">
          <div class="w-full bg-gradient-to-t from-[#0066FF] to-sky-400 rounded-lg transition-all duration-500 hover:opacity-90" style="height: ${heightPercent}%;"></div>
        </div>
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">Sem ${s}</span>
      </div>
    `;
    container.append(barHtml);
  }
}

function renderSummaryPTNMatrix(choices, masterList, raporStats, tkaStats, utbkStats) {
  const container = $('#summary-ptn-matrix');
  if (container.length === 0) return;
  container.empty();

  choices.slice(0, 4).forEach((ptnId, idx) => {
    const ptnData = masterList.find(p => p.id === ptnId);
    if (!ptnData) return;

    const r = CalculationService.calculateRationalization(ptnData, raporStats, tkaStats, utbkStats);

    const rowHtml = `
      <div class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-700/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-blue-100 text-[#0066FF] dark:bg-blue-900/50 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
            #${idx + 1}
          </div>
          <div>
            <h5 class="text-sm font-bold text-slate-800 dark:text-slate-100">${ptnData.prodi}</h5>
            <span class="text-xs text-slate-500 dark:text-slate-400">${ptnData.ptn}</span>
          </div>
        </div>
        <div class="flex items-center gap-4 text-xs">
          <div class="text-right">
            <span class="text-slate-400 block">Peluang SNBP</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 text-sm">${r.snbp.peluangPercent}% (${r.snbp.status})</span>
          </div>
          <div class="text-right">
            <span class="text-slate-400 block">Peluang SNBT</span>
            <span class="font-bold text-blue-600 dark:text-blue-400 text-sm">${r.snbt.peluangPercent}% (${r.snbt.status})</span>
          </div>
        </div>
      </div>
    `;
    container.append(rowHtml);
  });
}

/* ========================================================
   TAB 2: ANALISIS NILAI RAPOR
   ======================================================== */
function renderTabRapor() {
  const subjects = StorageService.getRaporSubjects();
  const stats = CalculationService.calculateRaporStats(subjects);

  // Section 1: Ringkasan Nilai Rata-Rata Mata Pelajaran
  $('#rapor-overall-avg').text(stats.overallAvg);
  $('#rapor-umum-avg').text(stats.umumAvg);
  $('#rapor-peminatan-avg').text(stats.peminatanAvg);
  $('#rapor-total-subjects').text(`${subjects.length} Mapel`);

  // Section 2: Tabel Preview Nilai
  renderRaporTable(stats.subjectDetails);
}

function renderRaporTable(details) {
  const tbody = $('#table-rapor-tbody');
  tbody.empty();

  // Filter berdasarkan klasifikasi [Semua] | [Umum] | [Peminatan]
  let filtered = details;
  if (activeRaporFilter !== 'Semua') {
    filtered = details.filter(d => d.tipe === activeRaporFilter);
  }

  if (filtered.length === 0) {
    tbody.html('<tr><td colspan="9" class="p-8 text-center text-slate-400">Tidak ada mata pelajaran dalam kategori ini.</td></tr>');
    return;
  }

  filtered.forEach(sub => {
    const kkmBadge = sub.isAboveKKM
      ? '<span class="text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 rounded text-xs font-semibold">Tuntas</span>'
      : '<span class="text-rose-700 bg-rose-100 dark:bg-rose-900/40 dark:text-rose-300 px-2 py-0.5 rounded text-xs font-semibold">Di bawah KKM</span>';

    const tipeBadge = sub.tipe === 'Peminatan'
      ? '<span class="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-medium">Peminatan</span>'
      : '<span class="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium">Umum</span>';

    const tr = `
      <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
        <td class="py-3.5 px-4">
          <div class="font-bold text-slate-800 dark:text-slate-100 text-sm">${sub.nama}</div>
          <div class="mt-1">${tipeBadge}</div>
        </td>
        <td class="py-3.5 px-4 text-center font-medium text-slate-600 dark:text-slate-300 text-sm">
          ${sub.kkm || 75}
        </td>
        <td class="py-3.5 px-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">${sub.sem1 ?? '-'}</td>
        <td class="py-3.5 px-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">${sub.sem2 ?? '-'}</td>
        <td class="py-3.5 px-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">${sub.sem3 ?? '-'}</td>
        <td class="py-3.5 px-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">${sub.sem4 ?? '-'}</td>
        <td class="py-3.5 px-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">${sub.sem5 ?? '-'}</td>
        <td class="py-3.5 px-4 text-center">
          <span class="text-sm font-bold text-[#0066FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg">
            ${sub.avg}
          </span>
          <div class="mt-1">${kkmBadge}</div>
        </td>
        <td class="py-3.5 px-4 text-center">
          <div class="flex items-center justify-center space-x-1.5">
            <button class="btn-edit-subject p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors" data-id="${sub.id}" title="Edit Mapel">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-delete-subject p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors" data-id="${sub.id}" title="Hapus Mapel">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    tbody.append(tr);
  });
}

function setupRaporEvents() {
  // Tab Klasifikasi [Semua] | [Umum] | [Peminatan]
  $('.tab-filter-rapor').on('click', function () {
    $('.tab-filter-rapor').removeClass('active bg-[#0066FF] text-white font-bold')
      .addClass('text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800');
    $(this).addClass('active bg-[#0066FF] text-white font-bold')
      .removeClass('text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800');

    activeRaporFilter = $(this).data('filter');
    renderTabRapor();
  });

  // Tombol "Input Mata Pelajaran"
  $('#btn-open-modal-rapor').on('click', function () {
    editingSubjectId = null;
    $('#modal-rapor-title').text('Input Mata Pelajaran');
    $('#form-rapor-subject')[0].reset();
    $('#modal-rapor-subject').removeClass('hidden').addClass('flex');
    
    // Default checklist semua semester aktif
    $('.checkbox-sem').prop('checked', true);
    $('.input-sem-score').prop('disabled', false).val('');
  });

  // Toggle checkbox semester
  $('.checkbox-sem').on('change', function () {
    const sem = $(this).data('sem');
    const input = $(`#input-sem-${sem}`);
    input.prop('disabled', !$(this).is(':checked'));
    if (!$(this).is(':checked')) {
      input.val('');
    }
  });

  // Form submit Input/Edit Mapel Rapor
  $('#form-rapor-subject').on('submit', function (e) {
    e.preventDefault();
    const nama = $('#input-rapor-nama').val().trim();
    const kkm = Number($('#input-rapor-kkm').val()) || 75;
    const tipe = $('input[name="rapor-tipe"]:checked').val() || 'Umum';

    if (!nama) {
      showToast('Nama mata pelajaran wajib diisi!', 'error');
      return;
    }

    const currentSubjects = StorageService.getRaporSubjects();

    const subjectData = {
      id: editingSubjectId || 'sub-' + Date.now(),
      nama,
      tipe,
      kkm,
      sem1: $('#check-sem-1').is(':checked') ? (Number($('#input-sem-1').val()) || 0) : null,
      sem2: $('#check-sem-2').is(':checked') ? (Number($('#input-sem-2').val()) || 0) : null,
      sem3: $('#check-sem-3').is(':checked') ? (Number($('#input-sem-3').val()) || 0) : null,
      sem4: $('#check-sem-4').is(':checked') ? (Number($('#input-sem-4').val()) || 0) : null,
      sem5: $('#check-sem-5').is(':checked') ? (Number($('#input-sem-5').val()) || 0) : null
    };

    if (editingSubjectId) {
      const idx = currentSubjects.findIndex(s => s.id === editingSubjectId);
      if (idx !== -1) currentSubjects[idx] = subjectData;
      showToast(`Mata pelajaran "${nama}" berhasil diperbarui!`);
    } else {
      currentSubjects.push(subjectData);
      showToast(`Mata pelajaran "${nama}" berhasil ditambahkan!`);
    }

    StorageService.setRaporSubjects(currentSubjects);
    $('#modal-rapor-subject').addClass('hidden').removeClass('flex');
    renderTabRapor();
    renderTabSemua();
  });

  // Edit Mapel
  $(document).on('click', '.btn-edit-subject', function () {
    const id = $(this).data('id');
    const subjects = StorageService.getRaporSubjects();
    const sub = subjects.find(s => s.id === id);
    if (!sub) return;

    editingSubjectId = id;
    $('#modal-rapor-title').text('Edit Mata Pelajaran');
    $('#input-rapor-nama').val(sub.nama);
    $('#input-rapor-kkm').val(sub.kkm || 75);
    $(`input[name="rapor-tipe"][value="${sub.tipe}"]`).prop('checked', true);

    for (let s = 1; s <= 5; s++) {
      const val = sub[`sem${s}`];
      const isChecked = val !== null && val !== undefined;
      $(`#check-sem-${s}`).prop('checked', isChecked);
      $(`#input-sem-${s}`).prop('disabled', !isChecked).val(isChecked ? val : '');
    }

    $('#modal-rapor-subject').removeClass('hidden').addClass('flex');
  });

  // Hapus Mapel
  $(document).on('click', '.btn-delete-subject', function () {
    const id = $(this).data('id');
    const subjects = StorageService.getRaporSubjects();
    const sub = subjects.find(s => s.id === id);
    if (!sub) return;

    if (confirm(`Hapus mata pelajaran "${sub.nama}" dari rekapitulasi rapor?`)) {
      const updated = subjects.filter(s => s.id !== id);
      StorageService.setRaporSubjects(updated);
      renderTabRapor();
      renderTabSemua();
      showToast(`Mata pelajaran "${sub.nama}" telah dihapus!`, 'info');
    }
  });
}

/* ========================================================
   TAB 3: ANALISIS NILAI TKA
   ======================================================== */
function renderTabTKA() {
  const tryouts = StorageService.getTKATryouts();
  const stats = CalculationService.calculateTKAStats(tryouts);

  // Section 1: Prediksi Nilai Regresi
  $('#tka-next-prediction').text(stats.nextPrediction || 0);
  $('#tka-latest-avg').text(stats.latestAvg || 0);
  $('#tka-total-to').text(tryouts.length);

  if (stats.regression) {
    $('#tka-regression-formula').text(stats.regression.formula);
    $('#tka-regression-slope').text(stats.regression.slope >= 0 ? `+${stats.regression.slope}` : `${stats.regression.slope}`);
    $('#tka-regression-r2').text(stats.regression.r2);

    const trendText = stats.regression.slope >= 0 ? 'Tren Mengalami Peningkatan Positif' : 'Tren Terindikasi Mengalami Penurunan';
    $('#tka-regression-trend').text(trendText);
  }

  // Section 2: Tabel Preview Nilai Tryout Berkala
  renderTKATable(stats.tryoutDetails);
}

function renderTKATable(details) {
  const tbody = $('#table-tka-tbody');
  tbody.empty();

  if (!details || details.length === 0) {
    tbody.html('<tr><td colspan="8" class="p-8 text-center text-slate-400">Belum ada riwayat tryout TKA yang diinputkan.</td></tr>');
    return;
  }

  details.forEach((to, idx) => {
    const tr = `
      <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
        <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 text-sm">
          <span class="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-blue-50 text-[#0066FF] dark:bg-blue-900/40 dark:text-blue-300 font-bold mr-2">
            ${to.toKe || (idx + 1)}
          </span>
          <span class="text-xs text-slate-400 block sm:inline">${to.tanggal || ''}</span>
        </td>
        <td class="py-3.5 px-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">${to.bIndo}</td>
        <td class="py-3.5 px-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">${to.matWajib}</td>
        <td class="py-3.5 px-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">${to.bIng}</td>
        <td class="py-3.5 px-4 text-center text-sm">
          <span class="font-semibold text-slate-700 dark:text-slate-300">${to.mapelPilihan1Nilai}</span>
          <span class="text-[11px] block text-slate-400">(${to.mapelPilihan1Nama || 'Pilihan 1'})</span>
        </td>
        <td class="py-3.5 px-4 text-center text-sm">
          <span class="font-semibold text-slate-700 dark:text-slate-300">${to.mapelPilihan2Nilai}</span>
          <span class="text-[11px] block text-slate-400">(${to.mapelPilihan2Nama || 'Pilihan 2'})</span>
        </td>
        <td class="py-3.5 px-4 text-center">
          <span class="text-sm font-bold text-[#0066FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
            ${to.avg}
          </span>
        </td>
        <td class="py-3.5 px-4 text-center">
          <div class="flex items-center justify-center space-x-1.5">
            <button class="btn-edit-tka p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors" data-index="${idx}" title="Edit Nilai">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-delete-tka p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors" data-index="${idx}" title="Hapus Tryout">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    tbody.append(tr);
  });
}

function setupTKAEvents() {
  $('#btn-open-modal-tka').on('click', function () {
    editingTKAIndex = null;
    const currentList = StorageService.getTKATryouts();
    $('#modal-tka-title').text('Input Tryout TKA');
    $('#form-tka')[0].reset();
    $('#input-tka-toke').val(currentList.length + 1);
    $('#input-tka-pilihan1-nama').val('Fisika');
    $('#input-tka-pilihan2-nama').val('Kimia');
    $('#modal-tka').removeClass('hidden').addClass('flex');
  });

  $('#form-tka').on('submit', function (e) {
    e.preventDefault();
    const toKe = Number($('#input-tka-toke').val()) || 1;
    const bIndo = Number($('#input-tka-bindo').val()) || 0;
    const matWajib = Number($('#input-tka-matwajib').val()) || 0;
    const bIng = Number($('#input-tka-bing').val()) || 0;
    const p1Nama = $('#input-tka-pilihan1-nama').val().trim() || 'Pilihan 1';
    const p1Nilai = Number($('#input-tka-pilihan1-nilai').val()) || 0;
    const p2Nama = $('#input-tka-pilihan2-nama').val().trim() || 'Pilihan 2';
    const p2Nilai = Number($('#input-tka-pilihan2-nilai').val()) || 0;

    const list = StorageService.getTKATryouts();
    const payload = {
      toKe,
      tanggal: 'Tryout Berkala ' + toKe,
      bIndo,
      matWajib,
      bIng,
      mapelPilihan1Nama: p1Nama,
      mapelPilihan1Nilai: p1Nilai,
      mapelPilihan2Nama: p2Nama,
      mapelPilihan2Nilai: p2Nilai
    };

    if (editingTKAIndex !== null) {
      list[editingTKAIndex] = payload;
      showToast(`Data Tryout Ke-${toKe} TKA berhasil diperbarui!`);
    } else {
      list.push(payload);
      showToast(`Data Tryout Ke-${toKe} TKA berhasil ditambahkan!`);
    }

    StorageService.setTKATryouts(list);
    $('#modal-tka').addClass('hidden').removeClass('flex');
    renderTabTKA();
    renderTabSemua();
  });

  $(document).on('click', '.btn-edit-tka', function () {
    const idx = $(this).data('index');
    const list = StorageService.getTKATryouts();
    const item = list[idx];
    if (!item) return;

    editingTKAIndex = idx;
    $('#modal-tka-title').text(`Edit Tryout Ke-${item.toKe} TKA`);
    $('#input-tka-toke').val(item.toKe);
    $('#input-tka-bindo').val(item.bIndo);
    $('#input-tka-matwajib').val(item.matWajib);
    $('#input-tka-bing').val(item.bIng);
    $('#input-tka-pilihan1-nama').val(item.mapelPilihan1Nama || 'Fisika');
    $('#input-tka-pilihan1-nilai').val(item.mapelPilihan1Nilai);
    $('#input-tka-pilihan2-nama').val(item.mapelPilihan2Nama || 'Kimia');
    $('#input-tka-pilihan2-nilai').val(item.mapelPilihan2Nilai);

    $('#modal-tka').removeClass('hidden').addClass('flex');
  });

  $(document).on('click', '.btn-delete-tka', function () {
    const idx = $(this).data('index');
    const list = StorageService.getTKATryouts();
    if (confirm(`Hapus riwayat Tryout Ke-${list[idx].toKe} TKA?`)) {
      list.splice(idx, 1);
      StorageService.setTKATryouts(list);
      renderTabTKA();
      renderTabSemua();
      showToast('Data tryout TKA berhasil dihapus!', 'info');
    }
  });
}

/* ========================================================
   TAB 4: ANALISIS NILAI UTBK (7 Subtes)
   ======================================================== */
function renderTabUTBK() {
  const tryouts = StorageService.getUTBKTryouts();
  const stats = CalculationService.calculateUTBKStats(tryouts);

  $('#utbk-next-prediction').text(stats.nextPrediction || 0);
  $('#utbk-latest-avg').text(stats.latestAvg || 0);
  $('#utbk-total-to').text(tryouts.length);

  if (stats.regression) {
    $('#utbk-regression-formula').text(stats.regression.formula);
    $('#utbk-regression-slope').text(stats.regression.slope >= 0 ? `+${stats.regression.slope}` : `${stats.regression.slope}`);
    $('#utbk-regression-r2').text(stats.regression.r2);

    const trendText = stats.regression.slope >= 0 ? 'Tren Mengalami Kenaikan Konsisten' : 'Tren Menunjukkan Koreksi Nilai';
    $('#utbk-regression-trend').text(trendText);
  }

  // Render Subtest Averages Summary Pills
  renderUTBKSubtestPills(stats.subtestAverages);

  // Render Tabel Preview Nilai 7 Subtes
  renderUTBKTable(stats.tryoutDetails);
}

function renderUTBKSubtestPills(subAvgs) {
  const container = $('#utbk-subtests-summary');
  if (container.length === 0) return;
  container.empty();

  const labels = [
    { key: 'pu', name: 'Penalaran Umum (PU)' },
    { key: 'ppu', name: 'Pengetahuan Umum (PPU)' },
    { key: 'pbm', name: 'Pemahaman Bacaan (PBM)' },
    { key: 'pk', name: 'Pengetahuan Kuantitatif (PK)' },
    { key: 'pm', name: 'Penalaran Matematika (PM)' },
    { key: 'litIndo', name: 'Literasi B. Indo' },
    { key: 'litIng', name: 'Literasi B. Inggris' }
  ];

  labels.forEach(item => {
    const val = subAvgs[item.key] || 0;
    const pill = `
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/70 dark:border-slate-700 flex flex-col justify-between">
        <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate mb-1">${item.name}</span>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold text-slate-800 dark:text-slate-100">${val}</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${val >= 700 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}">
            ${val >= 700 ? 'Kuat' : 'Perkuat'}
          </span>
        </div>
      </div>
    `;
    container.append(pill);
  });
}

function renderUTBKTable(details) {
  const tbody = $('#table-utbk-tbody');
  tbody.empty();

  if (!details || details.length === 0) {
    tbody.html('<tr><td colspan="10" class="p-8 text-center text-slate-400">Belum ada riwayat tryout UTBK yang diinputkan.</td></tr>');
    return;
  }

  details.forEach((to, idx) => {
    const tr = `
      <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
        <td class="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-100 text-sm whitespace-nowrap">
          <span class="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-blue-50 text-[#0066FF] dark:bg-blue-900/40 dark:text-blue-300 font-bold mr-1">
            ${to.toKe || (idx + 1)}
          </span>
        </td>
        <td class="py-3.5 px-2 text-center text-sm font-medium text-slate-700 dark:text-slate-300">${to.pu}</td>
        <td class="py-3.5 px-2 text-center text-sm font-medium text-slate-700 dark:text-slate-300">${to.ppu}</td>
        <td class="py-3.5 px-2 text-center text-sm font-medium text-slate-700 dark:text-slate-300">${to.pbm}</td>
        <td class="py-3.5 px-2 text-center text-sm font-medium text-slate-700 dark:text-slate-300">${to.pk}</td>
        <td class="py-3.5 px-2 text-center text-sm font-medium text-slate-700 dark:text-slate-300">${to.pm}</td>
        <td class="py-3.5 px-2 text-center text-sm font-medium text-slate-700 dark:text-slate-300">${to.litIndo}</td>
        <td class="py-3.5 px-2 text-center text-sm font-medium text-slate-700 dark:text-slate-300">${to.litIng}</td>
        <td class="py-3.5 px-3 text-center whitespace-nowrap">
          <span class="text-sm font-bold text-[#0066FF] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
            ${to.avg}
          </span>
        </td>
        <td class="py-3.5 px-3 text-center whitespace-nowrap">
          <div class="flex items-center justify-center space-x-1">
            <button class="btn-edit-utbk p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors" data-index="${idx}" title="Edit Nilai">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-delete-utbk p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors" data-index="${idx}" title="Hapus Tryout">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    tbody.append(tr);
  });
}

function setupUTBKEvents() {
  $('#btn-open-modal-utbk').on('click', function () {
    editingUTBKIndex = null;
    const currentList = StorageService.getUTBKTryouts();
    $('#modal-utbk-title').text('Input Tryout UTBK (7 Subtes)');
    $('#form-utbk')[0].reset();
    $('#input-utbk-toke').val(currentList.length + 1);
    $('#modal-utbk').removeClass('hidden').addClass('flex');
  });

  $('#form-utbk').on('submit', function (e) {
    e.preventDefault();
    const toKe = Number($('#input-utbk-toke').val()) || 1;
    const pu = Number($('#input-utbk-pu').val()) || 0;
    const ppu = Number($('#input-utbk-ppu').val()) || 0;
    const pbm = Number($('#input-utbk-pbm').val()) || 0;
    const pk = Number($('#input-utbk-pk').val()) || 0;
    const pm = Number($('#input-utbk-pm').val()) || 0;
    const litIndo = Number($('#input-utbk-litindo').val()) || 0;
    const litIng = Number($('#input-utbk-liting').val()) || 0;

    const list = StorageService.getUTBKTryouts();
    const payload = {
      toKe,
      tanggal: 'Tryout UTBK Ke-' + toKe,
      pu, ppu, pbm, pk, pm, litIndo, litIng
    };

    if (editingUTBKIndex !== null) {
      list[editingUTBKIndex] = payload;
      showToast(`Data Tryout Ke-${toKe} UTBK berhasil diperbarui!`);
    } else {
      list.push(payload);
      showToast(`Data Tryout Ke-${toKe} UTBK berhasil ditambahkan!`);
    }

    StorageService.setUTBKTryouts(list);
    $('#modal-utbk').addClass('hidden').removeClass('flex');
    renderTabUTBK();
    renderTabSemua();
  });

  $(document).on('click', '.btn-edit-utbk', function () {
    const idx = $(this).data('index');
    const list = StorageService.getUTBKTryouts();
    const item = list[idx];
    if (!item) return;

    editingUTBKIndex = idx;
    $('#modal-utbk-title').text(`Edit Tryout Ke-${item.toKe} UTBK`);
    $('#input-utbk-toke').val(item.toKe);
    $('#input-utbk-pu').val(item.pu);
    $('#input-utbk-ppu').val(item.ppu);
    $('#input-utbk-pbm').val(item.pbm);
    $('#input-utbk-pk').val(item.pk);
    $('#input-utbk-pm').val(item.pm);
    $('#input-utbk-litindo').val(item.litIndo);
    $('#input-utbk-liting').val(item.litIng);

    $('#modal-utbk').removeClass('hidden').addClass('flex');
  });

  $(document).on('click', '.btn-delete-utbk', function () {
    const idx = $(this).data('index');
    const list = StorageService.getUTBKTryouts();
    if (confirm(`Hapus riwayat Tryout Ke-${list[idx].toKe} UTBK?`)) {
      list.splice(idx, 1);
      StorageService.setUTBKTryouts(list);
      renderTabUTBK();
      renderTabSemua();
      showToast('Data tryout UTBK berhasil dihapus!', 'info');
    }
  });
}

/* ========================================================
   TAB 5: RASIONALISASI PTN (SNBP vs SNBT)
   ======================================================== */
function renderTabRasionalisasi() {
  const choices = StorageService.getPTNChoices();
  const masterList = StorageService.getMasterPTN();
  const subjects = StorageService.getRaporSubjects();
  const tkaList = StorageService.getTKATryouts();
  const utbkList = StorageService.getUTBKTryouts();

  const raporStats = CalculationService.calculateRaporStats(subjects);
  const tkaStats = CalculationService.calculateTKAStats(tkaList);
  const utbkStats = CalculationService.calculateUTBKStats(utbkList);

  // Section 1: Menu Pemilihan 4 PTN Cards
  const ptnCardsContainer = $('#ptn-selection-cards');
  ptnCardsContainer.empty();

  choices.slice(0, 4).forEach((ptnId, idx) => {
    const ptnData = masterList.find(p => p.id === ptnId);
    if (!ptnData) return;

    const isActive = idx === activePTNIndex;
    const cardHtml = `
      <div class="ptn-target-card cursor-pointer rounded-2xl p-5 border transition-all ${
        isActive
          ? 'bg-blue-50/90 dark:bg-blue-900/30 border-[#0066FF] shadow-md ring-2 ring-[#0066FF]/20'
          : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:border-blue-300'
      }" data-index="${idx}">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-[#0066FF] dark:bg-blue-900/50 dark:text-blue-300 flex items-center justify-center text-lg">
              <i class="fa-solid ${ptnData.logo}"></i>
            </div>
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#0066FF] dark:text-blue-400">Pilihan ${idx + 1}</span>
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">${ptnData.singkatan}</h4>
            </div>
          </div>
          <button class="btn-change-ptn text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0066FF] hover:text-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold transition-colors" data-slot="${idx}">
            <i class="fa-solid fa-arrows-rotate mr-1 text-[10px]"></i>Ganti
          </button>
        </div>
        <h5 class="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 mb-2">${ptnData.prodi}</h5>
        <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-700">
          <span>Keketatan: <strong>${ptnData.keketatanSNBP}%</strong></span>
          <span class="text-[#0066FF] dark:text-blue-400 font-bold">${ptnData.rumpun}</span>
        </div>
      </div>
    `;
    ptnCardsContainer.append(cardHtml);
  });

  // Section 2: Frame Rasionalisasi (2 Card Utama: Card 1 SNBP & Card 2 SNBT)
  const activePTNId = choices[activePTNIndex] || choices[0];
  const activePTNData = masterList.find(p => p.id === activePTNId);

  if (activePTNData) {
    const rationalization = CalculationService.calculateRationalization(activePTNData, raporStats, tkaStats, utbkStats);
    renderRationalizationCards(activePTNData, rationalization);
  }
}

function renderRationalizationCards(ptnData, r) {
  // Update Header Banner
  $('#active-ptn-title').text(`${ptnData.ptn} — ${ptnData.prodi}`);
  $('#active-ptn-badge').text(`Rumpun ${ptnData.rumpun}`);

  // CARD 1: ANALISIS SNBP (Rapor + TKA)
  $('#snbp-student-score').text(r.snbp.studentScore);
  $('#snbp-passing-grade').text(r.snbp.passingGrade);
  const snbpGapText = r.snbp.gap >= 0 ? `+${r.snbp.gap}` : `${r.snbp.gap}`;
  $('#snbp-gap-value').text(snbpGapText);
  $('#snbp-gap-badge').attr('class', `text-xs px-2.5 py-1 rounded-full font-bold ${r.snbp.gap >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'}`);
  $('#snbp-status-pill').attr('class', `px-3 py-1 rounded-full text-xs font-bold border ${r.snbp.statusBadge}`).text(r.snbp.status);
  $('#snbp-peluang-percent').text(`${r.snbp.peluangPercent}%`);
  $('#snbp-peluang-bar').css('width', `${r.snbp.peluangPercent}%`);
  $('#snbp-keketatan').text(`${r.snbp.keketatan}%`);
  $('#snbp-daya-tampung').text(`${r.snbp.dayaTampung} Kursi`);
  $('#snbp-peminat').text(`${r.snbp.peminat.toLocaleString('id-ID')} Siswa`);

  // CARD 2: ANALISIS SNBT (UTBK)
  $('#snbt-student-score').text(r.snbt.studentScore);
  $('#snbt-passing-grade').text(r.snbt.passingGrade);
  const snbtGapText = r.snbt.gap >= 0 ? `+${r.snbt.gap} Poin` : `${r.snbt.gap} Poin`;
  $('#snbt-gap-value').text(snbtGapText);
  $('#snbt-gap-badge').attr('class', `text-xs px-2.5 py-1 rounded-full font-bold ${r.snbt.gap >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'}`);
  $('#snbt-status-pill').attr('class', `px-3 py-1 rounded-full text-xs font-bold border ${r.snbt.statusBadge}`).text(r.snbt.status);
  $('#snbt-peluang-percent').text(`${r.snbt.peluangPercent}%`);
  $('#snbt-peluang-bar').css('width', `${r.snbt.peluangPercent}%`);
  $('#snbt-keketatan').text(`${r.snbt.keketatan}%`);
  $('#snbt-daya-tampung').text(`${r.snbt.dayaTampung} Kursi`);
  $('#snbt-peminat').text(`${r.snbt.peminat.toLocaleString('id-ID')} Siswa`);
}

function setupRasionalisasiEvents() {
  // Klik card pilihan PTN untuk beralih target
  $(document).on('click', '.ptn-target-card', function (e) {
    if ($(e.target).closest('.btn-change-ptn').length > 0) return;
    activePTNIndex = $(this).data('index');
    renderTabRasionalisasi();
  });

  // Klik tombol "Ganti" prodi
  let activeChangingSlot = 0;
  $(document).on('click', '.btn-change-ptn', function (e) {
    e.stopPropagation();
    activeChangingSlot = $(this).data('slot');
    openPTNSelectorModal(activeChangingSlot);
  });

  // Pilih prodi dari modal database SNPMB
  $(document).on('click', '.btn-select-ptn-option', function () {
    const ptnId = $(this).data('ptn-id');
    const choices = StorageService.getPTNChoices();
    choices[activeChangingSlot] = ptnId;
    StorageService.setPTNChoices(choices);
    $('#modal-ptn-selector').addClass('hidden').removeClass('flex');
    renderTabRasionalisasi();
    renderTabSemua();
    showToast('Pilihan PTN impian berhasil diperbarui!');
  });
}

function openPTNSelectorModal(slot) {
  const masterList = StorageService.getMasterPTN();
  const container = $('#ptn-options-list');
  container.empty();

  masterList.forEach(ptn => {
    const itemHtml = `
      <div class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-[#0066FF] hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">${ptn.singkatan}</span>
            <span class="text-xs text-[#0066FF] dark:text-blue-400 font-semibold">${ptn.rumpun}</span>
          </div>
          <h5 class="text-sm font-bold text-slate-800 dark:text-slate-100">${ptn.prodi}</h5>
          <span class="text-xs text-slate-500 dark:text-slate-400">${ptn.ptn}</span>
          <div class="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span>Keketatan SNBP: <strong>${ptn.keketatanSNBP}%</strong></span>
            <span>Target UTBK: <strong>${ptn.passingGradeSNBT}</strong></span>
          </div>
        </div>
        <button class="btn-select-ptn-option py-2 px-4 bg-[#0066FF] hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors whitespace-nowrap self-start sm:self-center" data-ptn-id="${ptn.id}">
          Pilih Prodi Ini
        </button>
      </div>
    `;
    container.append(itemHtml);
  });

  $('#modal-ptn-selector').removeClass('hidden').addClass('flex');
}

/* ========================================================
   SIMULASI OCR PEMINDAI NILAI RAPOR CLIENT-SIDE
   ======================================================== */
function setupOCREvents() {
  $('#btn-open-ocr-scanner').on('click', function () {
    $('#modal-ocr-scanner').removeClass('hidden').addClass('flex');
    $('#ocr-scan-progress-box').addClass('hidden');
    $('#ocr-scan-results-box').addClass('hidden');
    $('#btn-apply-ocr-data').addClass('hidden');
    $('#ocr-initial-view').removeClass('hidden');
  });

  $('#btn-start-ocr-scan').on('click', function () {
    $('#ocr-initial-view').addClass('hidden');
    $('#ocr-scan-progress-box').removeClass('hidden');

    OCRScannerService.startScan(
      (statusMsg, percent) => {
        $('#ocr-progress-status').text(statusMsg);
        $('#ocr-progress-bar').css('width', `${percent}%`);
        $('#ocr-progress-percent').text(`${percent}%`);
      },
      (extractedData) => {
        $('#ocr-scan-progress-box').addClass('hidden');
        $('#ocr-scan-results-box').removeClass('hidden');
        $('#btn-apply-ocr-data').removeClass('hidden');

        // Tampilkan hasil ekstraksi ke preview tabel OCR
        const previewTbody = $('#table-ocr-preview-tbody');
        previewTbody.empty();
        extractedData.forEach(sub => {
          const row = `
            <tr class="border-b border-slate-100 dark:border-slate-800 text-xs">
              <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-100">${sub.nama}</td>
              <td class="py-2 px-2 text-center text-slate-600 dark:text-slate-300">${sub.sem1}</td>
              <td class="py-2 px-2 text-center text-slate-600 dark:text-slate-300">${sub.sem2}</td>
              <td class="py-2 px-2 text-center text-slate-600 dark:text-slate-300">${sub.sem3}</td>
              <td class="py-2 px-2 text-center text-slate-600 dark:text-slate-300">${sub.sem4}</td>
              <td class="py-2 px-2 text-center text-slate-600 dark:text-slate-300">${sub.sem5}</td>
              <td class="py-2 px-2 text-center font-bold text-emerald-600">99.4%</td>
            </tr>
          `;
          previewTbody.append(row);
        });
      }
    );
  });

  // Terapkan hasil ekstraksi OCR ke LocalStorage Rapor
  $('#btn-apply-ocr-data').on('click', function () {
    StorageService.setRaporSubjects(OCRScannerService.SAMPLE_OCR_DATA);
    $('#modal-ocr-scanner').addClass('hidden').removeClass('flex');
    renderTabRapor();
    renderTabSemua();
    showToast('Hasil pemindaian OCR berhasil diterapkan ke seluruh semester!', 'success');
  });

  // Tombol Batal saat pemindaian OCR sedang berlangsung
  $(document).on('click', '#btn-cancel-ocr-scan, #btn-cancel-ocr-modal', function () {
    OCRScannerService.cancelScan();
    $('#ocr-scan-progress-box').addClass('hidden');
    $('#ocr-scan-results-box').addClass('hidden');
    $('#btn-apply-ocr-data').addClass('hidden');
    $('#ocr-initial-view').removeClass('hidden');
    $('#modal-ocr-scanner').addClass('hidden').removeClass('flex');
  });

  // Explicit close handler untuk semua modal di halaman Analisa Nilai
  $(document).on('click', '#modal-ocr-scanner .btn-close-modal', function () {
    OCRScannerService.cancelScan();
    $('#ocr-scan-progress-box').addClass('hidden');
    $('#ocr-scan-results-box').addClass('hidden');
    $('#btn-apply-ocr-data').addClass('hidden');
    $('#ocr-initial-view').removeClass('hidden');
    $('#modal-ocr-scanner').addClass('hidden').removeClass('flex');
  });

  $(document).on('click', '#modal-rapor-subject .btn-close-modal', function () {
    $('#modal-rapor-subject').addClass('hidden').removeClass('flex');
  });

  $(document).on('click', '#modal-tka .btn-close-modal', function () {
    $('#modal-tka').addClass('hidden').removeClass('flex');
  });

  $(document).on('click', '#modal-utbk .btn-close-modal', function () {
    $('#modal-utbk').addClass('hidden').removeClass('flex');
  });

  $(document).on('click', '#modal-ptn-selector .btn-close-modal', function () {
    $('#modal-ptn-selector').addClass('hidden').removeClass('flex');
  });
}
