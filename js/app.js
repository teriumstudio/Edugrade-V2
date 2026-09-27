/**
 * EduGrade v1.0 — Global App Script & UI Controller
 * Lomba INVENTION 2026: "Building Smarter Communities Through Digital Learning"
 */

$(document).ready(function () {
  // Inisialisasi Profil & Header
  syncGlobalProfile();
  initThemeSwitcher();
  setupGlobalModals();
  setupMobileNav();

  // Highlight Current Navigation Link
  highlightActiveNav();
});

/**
 * Sinkronisasi Foto Profil, Nama, dan Kelas di Header Global
 */
function syncGlobalProfile() {
  const profile = StorageService.getProfile();
  
  // Teks & Foto Header Global
  $('.header-user-name').text(profile.nama || 'Bhisma');
  $('.header-user-class').text(profile.kelas || 'XII IPA');
  if (profile.foto) {
    $('.header-user-avatar').attr('src', profile.foto);
  }

  // Dinamis Salam Sesuai Jam
  const hour = new Date().getHours();
  let waktuSalam = 'Selamat pagi';
  if (hour >= 11 && hour < 15) waktuSalam = 'Selamat siang';
  else if (hour >= 15 && hour < 18) waktuSalam = 'Selamat sore';
  else if (hour >= 18 || hour < 4) waktuSalam = 'Selamat malam';

  $('.hero-greeting-text').text(`${waktuSalam}, ${profile.nama || 'Bhisma'}.`);
}

/**
 * Pengaturan Tema Dark / Light
 */
function initThemeSwitcher() {
  const currentTheme = StorageService.getTheme();
  applyTheme(currentTheme);

  // Update button toggle UI pada Modal Setting
  updateThemeToggleUI(currentTheme);

  // Event handler tombol ganti tema di Modal Setting
  $(document).on('click', '.btn-theme-select', function () {
    const selectedTheme = $(this).data('theme');
    StorageService.setTheme(selectedTheme);
    applyTheme(selectedTheme);
    updateThemeToggleUI(selectedTheme);
    showToast(`Tema berhasil diubah ke ${selectedTheme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}`);
  });
}

function applyTheme(theme) {
  if (theme === 'dark') {
    $('html').addClass('dark');
  } else {
    $('html').removeClass('dark');
  }
}

function updateThemeToggleUI(theme) {
  $('.btn-theme-select').removeClass('ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/30');
  $(`.btn-theme-select[data-theme="${theme}"]`).addClass('ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/30');
  
  const iconHtml = theme === 'dark' ? '<i class="fa-solid fa-moon text-blue-400"></i>' : '<i class="fa-solid fa-sun text-amber-500"></i>';
  $('.theme-current-icon').html(iconHtml);
  $('.theme-current-label').text(theme === 'dark' ? 'Mode Gelap (Dark)' : 'Mode Terang (Light)');
}

/**
 * Setup Global Modal (Setting & Guide)
 */
function setupGlobalModals() {
  // Buka Modal Setting
  $(document).on('click', '[data-modal-trigger="setting"]', function (e) {
    e.preventDefault();
    openSettingModal();
  });

  // Buka Modal Guide
  $(document).on('click', '[data-modal-trigger="guide"]', function (e) {
    e.preventDefault();
    openGuideModal();
  });

  // Tombol Tutup Modal (Semua modal)
  $(document).on('click', '.btn-close-modal, .modal-backdrop', function () {
    closeAllModals();
  });

  // Cegah penutupan modal saat klik di dalam modal-box
  $(document).on('click', '.modal-content-box', function (e) {
    e.stopPropagation();
  });

  // Tab Switcher di Modal Setting (Profile vs Theme)
  $(document).on('click', '.tab-setting-btn', function () {
    const targetTab = $(this).data('tab');
    $('.tab-setting-btn').removeClass('active border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold').addClass('text-slate-500 dark:text-slate-400');
    $(this).addClass('active border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold').removeClass('text-slate-500 dark:text-slate-400');

    $('.setting-tab-pane').addClass('hidden');
    $(`#setting-pane-${targetTab}`).removeClass('hidden');
  });

  // Tab Switcher di Modal Guide (Tentang, FAQ, Tutorial, Glosarium, Contact)
  $(document).on('click', '.tab-guide-btn', function () {
    const targetTab = $(this).data('tab');
    $('.tab-guide-btn').removeClass('active bg-blue-600 text-white font-medium').addClass('text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800');
    $(this).addClass('active bg-blue-600 text-white font-medium').removeClass('text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800');

    $('.guide-tab-pane').addClass('hidden');
    $(`#guide-pane-${targetTab}`).removeClass('hidden');
  });

  // Form Simpan Profile di Modal Setting
  $(document).on('submit', '#form-setting-profile', function (e) {
    e.preventDefault();
    const newName = $('#input-setting-nama').val().trim();
    const newClass = $('#input-setting-kelas').val().trim();
    const newPass = $('#input-setting-password').val().trim();

    if (!newName || !newClass) {
      showToast('Nama dan kelas wajib diisi!', 'error');
      return;
    }

    const currentProfile = StorageService.getProfile();
    currentProfile.nama = newName;
    currentProfile.kelas = newClass;
    if (newPass) {
      currentProfile.passwordUpdated = true;
    }

    StorageService.setProfile(currentProfile);
    syncGlobalProfile();
    showToast('Profil akun berhasil diperbarui!');
    closeAllModals();
  });

  // Tombol Reset Akun di Modal Setting
  $(document).on('click', '#btn-reset-akun', function () {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data simulasi ke pengaturan bawaan awal? Tindakan ini akan mengembalikan data nilai dan tools.')) {
      StorageService.resetAllData();
      showToast('Seluruh data simulasi telah di-reset ke nilai default!', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 600);
    }
  });

  // Feedback form di Guide Modal Contact Tab
  $(document).on('submit', '#form-guide-feedback', function (e) {
    e.preventDefault();
    showToast('Terima kasih! Masukan Anda telah tersimpan untuk dewan juri & tim EduGrade.', 'success');
    $(this)[0].reset();
  });
}

function openSettingModal() {
  const profile = StorageService.getProfile();
  $('#input-setting-nama').val(profile.nama || 'Bhisma');
  $('#input-setting-kelas').val(profile.kelas || 'XII IPA');
  $('#input-setting-password').val('');
  
  // Set tab default ke Profile
  $('.tab-setting-btn[data-tab="profile"]').trigger('click');
  $('#modal-setting').removeClass('hidden').addClass('flex');
}

function openGuideModal() {
  $('.tab-guide-btn[data-tab="tentang"]').trigger('click');
  $('#modal-guide').removeClass('hidden').addClass('flex');
}

function closeAllModals() {
  $('#modal-setting').addClass('hidden').removeClass('flex');
  $('#modal-guide').addClass('hidden').removeClass('flex');
  $('.generic-popup-modal').addClass('hidden').removeClass('flex');
}

/**
 * Mobile Navigation Drawer
 */
function setupMobileNav() {
  $(document).on('click', '#btn-toggle-mobile-menu', function () {
    $('#mobile-sidebar-drawer').toggleClass('hidden');
  });

  $(document).on('click', '#btn-close-mobile-menu, #mobile-sidebar-backdrop', function () {
    $('#mobile-sidebar-drawer').addClass('hidden');
  });
}

/**
 * Highlight link aktif pada sidebar berdasarkan URL file
 */
function highlightActiveNav() {
  const path = window.location.pathname;
  let activePage = 'dashboard';

  if (path.includes('analisa-nilai')) {
    activePage = 'analisa';
  } else if (path.includes('alat-pelajar')) {
    activePage = 'alat';
  }

  $(`.nav-link-item[data-page="${activePage}"]`).addClass('active-nav-item bg-white text-[#0066FF] font-bold shadow-md')
    .removeClass('text-blue-100 hover:bg-blue-700/50 hover:text-white');
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'success') {
  let toastContainer = $('#toast-container');
  if (toastContainer.length === 0) {
    $('body').append('<div id="toast-container" class="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none"></div>');
    toastContainer = $('#toast-container');
  }

  const iconClass = type === 'error' ? 'fa-circle-exclamation text-rose-500' : (type === 'info' ? 'fa-circle-info text-blue-500' : 'fa-circle-check text-emerald-500');
  const bgClass = 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xl';

  const toastId = 'toast-' + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="pointer-events-auto flex items-center px-4 py-3 rounded-xl ${bgClass} transition-all duration-300 transform translate-y-2 opacity-0 text-sm font-medium">
      <i class="fa-solid ${iconClass} text-lg mr-3"></i>
      <span>${message}</span>
    </div>
  `;

  toastContainer.append(toastHtml);
  const el = $(`#${toastId}`);

  setTimeout(() => {
    el.removeClass('translate-y-2 opacity-0').addClass('translate-y-0 opacity-100');
  }, 20);

  setTimeout(() => {
    el.removeClass('translate-y-0 opacity-100').addClass('translate-y-2 opacity-0');
    setTimeout(() => el.remove(), 300);
  }, 3500);
}
