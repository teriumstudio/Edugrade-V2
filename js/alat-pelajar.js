/**
 * EduGrade v1.0 — Alat Pelajar Controller
 * Lomba INVENTION 2026: "Building Smarter Communities Through Digital Learning"
 */

let activeTool = null; // 'pomodoro', 'pembersih', 'sitasi', 'jadwal'
let pomodoroTimer = null;
let pomodoroSecondsLeft = 25 * 60;
let pomodoroIsRunning = false;
let pomodoroMode = 'work'; // 'work', 'short_break', 'long_break'
let completedPomodoroSessions = 0;
let taskFilter = 'all';

$(document).ready(function () {
  setupToolSelection();
  checkURLParamsForTool();
});

function checkURLParamsForTool() {
  const urlParams = new URLSearchParams(window.location.search);
  const toolParam = urlParams.get('tool');
  if (toolParam && ['pomodoro', 'pembersih', 'sitasi', 'jadwal'].includes(toolParam)) {
    activateTool(toolParam);
  }
}

function setupToolSelection() {
  $('.card-tool-demo').on('click', function () {
    const toolId = $(this).data('tool-id');
    activateTool(toolId);
  });
}

function activateTool(toolId) {
  activeTool = toolId;
  StorageService.logToolUsage(toolId);

  // Update visual card active state di Section 1 Top Grid Menu
  $('.card-tool-demo').removeClass('ring-2 ring-[#0066FF] border-[#0066FF] bg-blue-50/70 dark:bg-blue-900/20 shadow-md')
    .addClass('border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800');
  $(`.card-tool-demo[data-tool-id="${toolId}"]`)
    .addClass('ring-2 ring-[#0066FF] border-[#0066FF] bg-blue-50/70 dark:bg-blue-900/20 shadow-md')
    .removeClass('border-slate-200/80 dark:border-slate-700');

  // Hide placeholder default state, show working frame container
  $('#tool-default-state').addClass('hidden');
  $('#tool-working-frame').removeClass('hidden');

  // Switch working interfaces
  $('.tool-pane').addClass('hidden');
  $(`#pane-${toolId}`).removeClass('hidden');

  // Inisialisasi logika tool yang dibuka
  if (toolId === 'pomodoro') initPomodoroTool();
  else if (toolId === 'pembersih') initPembersihTool();
  else if (toolId === 'sitasi') initSitasiTool();
  else if (toolId === 'jadwal') initJadwalTool();

  // Smooth scroll ke area working frame jika di mobile
  if (window.innerWidth < 768) {
    $('html, body').animate({
      scrollTop: $('#tool-working-frame').offset().top - 80
    }, 400);
  }
}

/* ========================================================
   1. POMODORO TIMER TOOL
   ======================================================== */
function initPomodoroTool() {
  updatePomodoroDisplay();

  // Mode button click
  $('.btn-pomo-mode').off('click').on('click', function () {
    $('.btn-pomo-mode').removeClass('bg-blue-600 text-white font-bold').addClass('bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300');
    $(this).addClass('bg-blue-600 text-white font-bold').removeClass('bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300');

    pausePomodoro();
    pomodoroMode = $(this).data('mode');
    if (pomodoroMode === 'work') pomodoroSecondsLeft = 25 * 60;
    else if (pomodoroMode === 'short_break') pomodoroSecondsLeft = 5 * 60;
    else if (pomodoroMode === 'long_break') pomodoroSecondsLeft = 15 * 60;

    updatePomodoroDisplay();
  });

  // Start / Pause
  $('#btn-pomo-start').off('click').on('click', function () {
    if (pomodoroIsRunning) {
      pausePomodoro();
    } else {
      startPomodoro();
    }
  });

  // Reset
  $('#btn-pomo-reset').off('click').on('click', function () {
    pausePomodoro();
    if (pomodoroMode === 'work') pomodoroSecondsLeft = 25 * 60;
    else if (pomodoroMode === 'short_break') pomodoroSecondsLeft = 5 * 60;
    else if (pomodoroMode === 'long_break') pomodoroSecondsLeft = 15 * 60;
    updatePomodoroDisplay();
  });
}

function startPomodoro() {
  pomodoroIsRunning = true;
  $('#btn-pomo-start').html('<i class="fa-solid fa-pause mr-2"></i>Jeda Sesi').removeClass('bg-[#0066FF]').addClass('bg-amber-600');

  pomodoroTimer = setInterval(() => {
    if (pomodoroSecondsLeft > 0) {
      pomodoroSecondsLeft--;
      updatePomodoroDisplay();
    } else {
      pausePomodoro();
      playChimeAudio();
      if (pomodoroMode === 'work') {
        completedPomodoroSessions++;
        $('#pomo-completed-count').text(completedPomodoroSessions);
        showToast('Sesi belajar tuntas! Waktunya istirahat sejenak.', 'success');
      } else {
        showToast('Waktu istirahat selesai! Mari kembali fokus belajar.', 'info');
      }
    }
  }, 1000);
}

function pausePomodoro() {
  pomodoroIsRunning = false;
  clearInterval(pomodoroTimer);
  $('#btn-pomo-start').html('<i class="fa-solid fa-play mr-2"></i>Mulai Fokus').removeClass('bg-amber-600').addClass('bg-[#0066FF]');
}

function updatePomodoroDisplay() {
  const m = Math.floor(pomodoroSecondsLeft / 60);
  const s = pomodoroSecondsLeft % 60;
  const timeFormatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  $('#pomo-time-display').text(timeFormatted);

  let totalDuration = 25 * 60;
  if (pomodoroMode === 'short_break') totalDuration = 5 * 60;
  if (pomodoroMode === 'long_break') totalDuration = 15 * 60;

  const progressPercent = Math.round(((totalDuration - pomodoroSecondsLeft) / totalDuration) * 100);
  $('#pomo-progress-bar').css('width', `${progressPercent}%`);
}

function playChimeAudio() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch (err) {
    console.log('Audio not supported:', err);
  }
}

/* ========================================================
   2. PEMBERSIH TEKS TOOL
   ======================================================== */
function initPembersihTool() {
  const input = $('#text-cleaner-input');

  input.off('input').on('input', function () {
    updateCleanerMetrics();
  });

  // Action buttons
  $('#btn-clean-spaces').off('click').on('click', function () {
    let text = input.val();
    text = text.replace(/[ \t]+/g, ' '); // spasi ganda jadi satu
    input.val(text);
    updateCleanerMetrics();
    showToast('Spasi ganda berhasil dirapikan!');
  });

  $('#btn-clean-lines').off('click').on('click', function () {
    let text = input.val();
    text = text.replace(/\n\s*\n\s*\n+/g, '\n\n'); // bersihkan enter berlebihan
    input.val(text);
    updateCleanerMetrics();
    showToast('Jarak baris berhasil dirapikan!');
  });

  $('#btn-clean-titlecase').off('click').on('click', function () {
    let text = input.val();
    text = text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    input.val(text);
    updateCleanerMetrics();
    showToast('Format huruf diubah menjadi Title Case!');
  });

  $('#btn-clean-uppercase').off('click').on('click', function () {
    input.val(input.val().toUpperCase());
    updateCleanerMetrics();
    showToast('Diubah ke Huruf Besar Semua!');
  });

  $('#btn-clean-lowercase').off('click').on('click', function () {
    input.val(input.val().toLowerCase());
    updateCleanerMetrics();
    showToast('Diubah ke Huruf Kecil Semua!');
  });

  $('#btn-clean-symbols').off('click').on('click', function () {
    let text = input.val();
    text = text.replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-'); // ganti bullet aneh jadi strip standar
    text = text.replace(/[""]/g, '"').replace(/['']/g, "'");
    input.val(text);
    updateCleanerMetrics();
    showToast('Karakter non-standar dibersihkan!');
  });

  $('#btn-clean-copy').off('click').on('click', function () {
    const text = input.val();
    if (!text.trim()) {
      showToast('Tidak ada teks untuk disalin!', 'error');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast('Teks bersih berhasil disalin ke clipboard!', 'success');
    });
  });

  $('#btn-clean-clear').off('click').on('click', function () {
    input.val('');
    updateCleanerMetrics();
  });
}

function updateCleanerMetrics() {
  const val = $('#text-cleaner-input').val();
  const charCount = val.length;
  const wordCount = val.trim() ? val.trim().split(/\s+/).length : 0;
  const readMinutes = Math.ceil(wordCount / 200);

  $('#metric-char-count').text(charCount);
  $('#metric-word-count').text(wordCount);
  $('#metric-read-time').text(`~${readMinutes} mnt baca`);
}

/* ========================================================
   3. GENERATOR SITASI TOOL (APA, MLA, IEEE)
   ======================================================== */
function initSitasiTool() {
  // Ganti tipe sumber: Buku, Jurnal, Website
  $('.btn-citation-source').off('click').on('click', function () {
    $('.btn-citation-source').removeClass('bg-blue-600 text-white font-bold').addClass('bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300');
    $(this).addClass('bg-blue-600 text-white font-bold').removeClass('bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300');

    const source = $(this).data('source');
    updateCitationFormFields(source);
    generateCitation();
  });

  // Ganti style format: APA 7th, MLA 9th, IEEE
  $('input[name="citation-style"]').off('change').on('change', function () {
    generateCitation();
  });

  // Re-generate saat form input diketik
  $('#form-citation input').off('input').on('input', function () {
    generateCitation();
  });

  // Tombol Salin Sitasi
  $('#btn-copy-citation').off('click').on('click', function () {
    const text = $('#citation-output-raw').text();
    if (!text.trim()) {
      showToast('Belum ada sitasi untuk disalin!', 'error');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast('Format sitasi berhasil disalin ke clipboard!', 'success');
    });
  });

  // Inisialisasi awal
  generateCitation();
}

function updateCitationFormFields(source) {
  if (source === 'book') {
    $('#field-source-name-label').text('Nama Penerbit / Kota');
    $('#field-extra-label').text('Edisi Buku (Opsional)');
  } else if (source === 'journal') {
    $('#field-source-name-label').text('Nama Jurnal Ilmiah');
    $('#field-extra-label').text('Volume & Nomor Terbit (cth: Vol. 12 No. 2)');
  } else if (source === 'web') {
    $('#field-source-name-label').text('Nama Situs / Portal Web');
    $('#field-extra-label').text('Tanggal Akses Web (cth: 24 Mei 2026)');
  }
}

function generateCitation() {
  const style = $('input[name="citation-style"]:checked').val() || 'apa';
  const source = $('.btn-citation-source.bg-blue-600').data('source') || 'book';

  const author = $('#cite-input-author').val().trim() || 'Sudirman, A.';
  const year = $('#cite-input-year').val().trim() || '2024';
  const title = $('#cite-input-title').val().trim() || 'Metodologi Penelitian & Sains Modern';
  const sourceName = $('#cite-input-source').val().trim() || 'Penerbit ITB Press';
  const extra = $('#cite-input-extra').val().trim();
  const url = $('#cite-input-url').val().trim();

  let formattedHtml = '';
  let formattedRaw = '';

  if (style === 'apa') {
    // APA 7th Edition: Author, A. A. (Year). *Title of work*. Source. DOI/URL
    if (source === 'book') {
      formattedHtml = `${author} (${year}). <em class="font-serif italic font-semibold">${title}</em>. ${sourceName}. ${url ? `<span class="text-blue-500">${url}</span>` : ''}`;
      formattedRaw = `${author} (${year}). ${title}. ${sourceName}. ${url || ''}`;
    } else if (source === 'journal') {
      formattedHtml = `${author} (${year}). ${title}. <em class="font-serif italic font-semibold">${sourceName}</em>${extra ? `, ${extra}` : ''}. ${url ? `<span class="text-blue-500">${url}</span>` : ''}`;
      formattedRaw = `${author} (${year}). ${title}. ${sourceName}${extra ? `, ${extra}` : ''}. ${url || ''}`;
    } else {
      formattedHtml = `${author} (${year}). <em class="font-serif italic font-semibold">${title}</em>. ${sourceName}. ${url ? `<span class="text-blue-500">${url}</span>` : ''}`;
      formattedRaw = `${author} (${year}). ${title}. ${sourceName}. ${url || ''}`;
    }
  } else if (style === 'mla') {
    // MLA 9th Edition: Author. *Title*. Source, Year, URL.
    if (source === 'book') {
      formattedHtml = `${author}. <em class="font-serif italic font-semibold">${title}</em>. ${sourceName}, ${year}.`;
      formattedRaw = `${author}. ${title}. ${sourceName}, ${year}.`;
    } else {
      formattedHtml = `${author}. "${title}." <em class="font-serif italic font-semibold">${sourceName}</em>${extra ? `, ${extra}` : ''}, ${year}${url ? `, <span class="text-blue-500">${url}</span>` : ''}.`;
      formattedRaw = `${author}. "${title}." ${sourceName}${extra ? `, ${extra}` : ''}, ${year}${url ? `, ${url}` : ''}.`;
    }
  } else if (style === 'ieee') {
    // IEEE: [1] A. Author, *Title*. City: Publisher, Year.
    formattedHtml = `[1] ${author}, <em class="font-serif italic font-semibold">"${title},"</em> ${sourceName}, ${year}${url ? `, [Online]. Available: <span class="text-blue-500">${url}</span>` : ''}.`;
    formattedRaw = `[1] ${author}, "${title}," ${sourceName}, ${year}${url ? `, [Online]. Available: ${url}` : ''}.`;
  }

  $('#citation-output-preview').html(formattedHtml);
  $('#citation-output-raw').text(formattedRaw);
}

/* ========================================================
   4. PERENCANA JADWAL BELAJAR TOOL
   ======================================================== */
function initJadwalTool() {
  renderStudyTasks();

  // Tambah tugas baru
  $('#form-add-task').off('submit').on('submit', function (e) {
    e.preventDefault();
    const mapel = $('#input-task-mapel').val().trim();
    const judul = $('#input-task-judul').val().trim();
    const durasi = $('#input-task-durasi').val().trim() || '45 Menit';
    const prioritas = $('#input-task-prioritas').val() || 'Tinggi';

    if (!mapel || !judul) {
      showToast('Mata pelajaran dan rincian tugas wajib diisi!', 'error');
      return;
    }

    const tasks = StorageService.getStudyTasks();
    tasks.unshift({
      id: 'task-' + Date.now(),
      mapel,
      judul,
      durasi,
      prioritas,
      selesai: false
    });

    StorageService.setStudyTasks(tasks);
    $('#input-task-judul').val('');
    renderStudyTasks();
    showToast('Tugas belajar berhasil ditambahkan!');
  });

  // Filter tugas
  $('.btn-filter-task').off('click').on('click', function () {
    $('.btn-filter-task').removeClass('bg-blue-600 text-white font-bold').addClass('bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300');
    $(this).addClass('bg-blue-600 text-white font-bold').removeClass('bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300');
    taskFilter = $(this).data('filter');
    renderStudyTasks();
  });

  // Toggle Selesai
  $(document).on('change', '.task-checkbox', function () {
    const taskId = $(this).data('task-id');
    const isChecked = $(this).is(':checked');
    const tasks = StorageService.getStudyTasks();
    const t = tasks.find(item => item.id === taskId);
    if (t) {
      t.selesai = isChecked;
      StorageService.setStudyTasks(tasks);
      renderStudyTasks();
      if (isChecked) showToast('Hebat! Satu tugas belajar telah diselesaikan.');
    }
  });

  // Hapus Tugas
  $(document).on('click', '.btn-delete-task', function () {
    const taskId = $(this).data('task-id');
    let tasks = StorageService.getStudyTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    StorageService.setStudyTasks(tasks);
    renderStudyTasks();
    showToast('Tugas belajar dihapus.', 'info');
  });
}

function renderStudyTasks() {
  const tasks = StorageService.getStudyTasks();
  const container = $('#tasks-list-container');
  container.empty();

  let filtered = tasks;
  if (taskFilter === 'pending') filtered = tasks.filter(t => !t.selesai);
  else if (taskFilter === 'done') filtered = tasks.filter(t => t.selesai);

  // Update progress tracker
  const total = tasks.length;
  const done = tasks.filter(t => t.selesai).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  $('#task-progress-text').text(`${done}/${total} Target Tercapai (${percent}%)`);
  $('#task-progress-bar').css('width', `${percent}%`);

  if (filtered.length === 0) {
    container.html('<div class="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">Belum ada agenda belajar dalam kategori ini.</div>');
    return;
  }

  filtered.forEach(task => {
    let priorityBadge = 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
    if (task.prioritas === 'Sedang') priorityBadge = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    else if (task.prioritas === 'Rendah') priorityBadge = 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';

    const itemHtml = `
      <div class="flex items-center justify-between p-4 rounded-2xl border transition-all ${
        task.selesai
          ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 opacity-75'
          : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 shadow-sm'
      }">
        <div class="flex items-center gap-3.5 flex-1 min-w-0">
          <input type="checkbox" class="task-checkbox w-5 h-5 rounded-md text-[#0066FF] border-slate-300 focus:ring-blue-500 cursor-pointer" data-task-id="${task.id}" ${task.selesai ? 'checked' : ''}>
          <div class="truncate">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-xs font-bold text-[#0066FF] dark:text-blue-400">${task.mapel}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold ${priorityBadge}">${task.prioritas}</span>
              <span class="text-[11px] text-slate-400"><i class="fa-regular fa-clock mr-1"></i>${task.durasi}</span>
            </div>
            <h5 class="text-sm font-semibold text-slate-800 dark:text-slate-100 ${task.selesai ? 'line-through text-slate-400 dark:text-slate-500' : ''}">${task.judul}</h5>
          </div>
        </div>
        <button class="btn-delete-task text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors ml-2" data-task-id="${task.id}" title="Hapus Tugas">
          <i class="fa-solid fa-trash-can text-sm"></i>
        </button>
      </div>
    `;
    container.append(itemHtml);
  });
}
