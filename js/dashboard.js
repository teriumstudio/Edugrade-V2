/**
 * EduGrade v1.0 — Dashboard Controller
 * Lomba INVENTION 2026: "Building Smarter Communities Through Digital Learning"
 */

$(document).ready(function () {
  loadDashboardData();

  // Handle CTA klik Recently Study Tools
  $(document).on('click', '.btn-launch-tool', function (e) {
    e.preventDefault();
    const toolId = $(this).data('tool-id');
    StorageService.logToolUsage(toolId);
    window.location.href = `alat-pelajar.html?tool=${toolId}`;
  });
});

function loadDashboardData() {
  const profile = StorageService.getProfile();
  const raporSubjects = StorageService.getRaporSubjects();
  const tkaTryouts = StorageService.getTKATryouts();
  const utbkTryouts = StorageService.getUTBKTryouts();
  const ptnChoices = StorageService.getPTNChoices();
  const masterPTN = StorageService.getMasterPTN();
  const recentTools = StorageService.getRecentTools();

  // 1. Kalkulasi Statistik Rapor
  const raporStats = CalculationService.calculateRaporStats(raporSubjects);
  $('#stat-rapor-avg').text(raporStats.overallAvg || 0);

  // 2. Kalkulasi Statistik TKA
  const tkaStats = CalculationService.calculateTKAStats(tkaTryouts);
  $('#stat-tka-pred').text(tkaStats.nextPrediction || 0);

  // 3. Kalkulasi Statistik UTBK
  const utbkStats = CalculationService.calculateUTBKStats(utbkTryouts);
  $('#stat-utbk-pred').text(utbkStats.nextPrediction || 0);

  // 4. Streak Belajar
  const streak = profile.streakHari || 12;
  $('#stat-streak-hari').text(`${streak} hari`);

  // 5. Indeks Kesiapan Akademik & Progress Bar
  const readinessIndex = CalculationService.calculateAcademicReadinessIndex(
    raporStats.overallAvg,
    tkaStats.nextPrediction,
    utbkStats.nextPrediction,
    streak
  );
  $('#stat-readiness-percent').text(`${readinessIndex}%`);
  $('#stat-readiness-bar').css('width', `${readinessIndex}%`);

  // Update Teks Kesiapan
  let readinessLabel = 'Sangat Siap & Kompetitif';
  if (readinessIndex < 60) readinessLabel = 'Perlu Peningkatan Fokus';
  else if (readinessIndex < 75) readinessLabel = 'Peluang Terbuka Cukup Baik';
  $('#stat-readiness-label').text(readinessLabel);

  // 6. Render Recently Study Tools
  renderRecentTools(recentTools);

  // 7. Render Ringkasan 4 PTN Target
  renderDashboardPTNSummary(ptnChoices, masterPTN, raporStats, tkaStats, utbkStats);
}

function renderRecentTools(tools) {
  const container = $('#recent-tools-grid');
  container.empty();

  if (!tools || tools.length === 0) {
    container.html('<div class="col-span-full p-6 text-center text-slate-400">Belum ada aktivitas alat belajar terkini.</div>');
    return;
  }

  tools.forEach(tool => {
    const cardHtml = `
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#0066FF] dark:text-blue-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              <i class="fa-solid ${tool.icon}"></i>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-full">
              <i class="fa-regular fa-clock mr-1"></i>${tool.lastUsed || 'Tersedia'}
            </span>
          </div>
          <h4 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1.5">${tool.name}</h4>
          <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">${tool.desc}</p>
        </div>
        <button class="btn-launch-tool w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-700/60 hover:bg-[#0066FF] hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center" data-tool-id="${tool.id}">
          <span>Gunakan Sekarang</span>
          <i class="fa-solid fa-arrow-right ml-2 text-xs"></i>
        </button>
      </div>
    `;
    container.append(cardHtml);
  });
}

function renderDashboardPTNSummary(choices, masterList, raporStats, tkaStats, utbkStats) {
  const container = $('#dashboard-ptn-summary-grid');
  if (container.length === 0) return;
  container.empty();

  choices.slice(0, 4).forEach((ptnId, idx) => {
    const ptnData = masterList.find(p => p.id === ptnId);
    if (!ptnData) return;

    const rationalization = CalculationService.calculateRationalization(ptnData, raporStats, tkaStats, utbkStats);

    const cardHtml = `
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#0066FF] dark:bg-blue-900/40 dark:text-blue-300">
              Pilihan ${idx + 1}
            </span>
            <span class="text-xs px-2 py-0.5 rounded-full border ${rationalization.snbp.statusBadge}">
              ${rationalization.snbp.status}
            </span>
          </div>
          <h5 class="font-bold text-slate-800 dark:text-white text-base leading-snug mb-1">${ptnData.prodi}</h5>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">${ptnData.ptn}</p>

          <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-700/40 p-2.5 rounded-xl mb-3">
            <div>
              <span class="text-slate-400 block">Keketatan SNBP</span>
              <span class="font-bold text-slate-700 dark:text-slate-200">${ptnData.keketatanSNBP}%</span>
            </div>
            <div>
              <span class="text-slate-400 block">Target UTBK</span>
              <span class="font-bold text-[#0066FF] dark:text-blue-400">${ptnData.passingGradeSNBT} Poin</span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700/60 text-slate-500 dark:text-slate-400">
          <span>Peluang SNBP: <strong class="text-emerald-600 dark:text-emerald-400">${rationalization.snbp.peluangPercent}%</strong></span>
          <span>SNBT: <strong class="text-blue-600 dark:text-blue-400">${rationalization.snbt.peluangPercent}%</strong></span>
        </div>
      </div>
    `;
    container.append(cardHtml);
  });
}
