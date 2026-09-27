/**
 * EduGrade v1.0 — Mathematical & Analytics Engine
 * Lomba INVENTION 2026: "Building Smarter Communities Through Digital Learning"
 */

const CalculationService = {
  /**
   * Menghitung rata-rata nilai rapor per mata pelajaran dan keseluruhan
   */
  calculateRaporStats(subjects) {
    if (!subjects || subjects.length === 0) {
      return { overallAvg: 0, umumAvg: 0, peminatanAvg: 0, subjectDetails: [] };
    }

    let totalSum = 0;
    let totalCount = 0;
    let umumSum = 0;
    let umumCount = 0;
    let peminatanSum = 0;
    let peminatanCount = 0;

    const subjectDetails = subjects.map(sub => {
      const sems = [sub.sem1, sub.sem2, sub.sem3, sub.sem4, sub.sem5].filter(v => v !== null && v !== undefined && !isNaN(v));
      const subAvg = sems.length > 0 ? (sems.reduce((a, b) => a + Number(b), 0) / sems.length) : 0;

      totalSum += subAvg;
      totalCount += 1;

      if (sub.tipe === 'Peminatan') {
        peminatanSum += subAvg;
        peminatanCount += 1;
      } else {
        umumSum += subAvg;
        umumCount += 1;
      }

      return {
        ...sub,
        avg: Number(subAvg.toFixed(1)),
        isAboveKKM: subAvg >= (sub.kkm || 75),
        activeSemsCount: sems.length
      };
    });

    const overallAvg = totalCount > 0 ? Number((totalSum / totalCount).toFixed(1)) : 0;
    const umumAvg = umumCount > 0 ? Number((umumSum / umumCount).toFixed(1)) : 0;
    const peminatanAvg = peminatanCount > 0 ? Number((peminatanSum / peminatanCount).toFixed(1)) : 0;

    return {
      overallAvg,
      umumAvg,
      peminatanAvg,
      subjectDetails
    };
  },

  /**
   * Menghitung regresi linier sederhana y = mx + c
   * Points: [{ x: 1, y: 710 }, { x: 2, y: 725 }, ...]
   */
  calculateLinearRegression(points) {
    const n = points.length;
    if (n === 0) return { slope: 0, intercept: 0, r2: 0, nextPrediction: 0, formula: 'y = 0' };
    if (n === 1) {
      return {
        slope: 0,
        intercept: points[0].y,
        r2: 1,
        nextPrediction: points[0].y,
        formula: `y = ${points[0].y}`
      };
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    for (let i = 0; i < n; i++) {
      const x = points[i].x;
      const y = points[i].y;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    }

    const denominator = (n * sumX2) - (sumX * sumX);
    if (denominator === 0) {
      const avgY = sumY / n;
      return { slope: 0, intercept: avgY, r2: 0, nextPrediction: Math.round(avgY), formula: `y = ${avgY.toFixed(1)}` };
    }

    const slope = ((n * sumXY) - (sumX * sumY)) / denominator;
    const intercept = (sumY - (slope * sumX)) / n;

    // Koefisien Determinasi R^2
    const numeratorR = (n * sumXY) - (sumX * sumY);
    const denomR = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
    const r = denomR !== 0 ? (numeratorR / denomR) : 0;
    const r2 = Math.min(1, Math.max(0, r * r));

    const nextX = n + 1;
    const nextY = (slope * nextX) + intercept;

    return {
      slope: Number(slope.toFixed(2)),
      intercept: Number(intercept.toFixed(2)),
      r2: Number(r2.toFixed(3)),
      nextX,
      nextPrediction: Math.round(Math.min(1000, Math.max(0, nextY))),
      formula: `y = ${slope >= 0 ? '+' : ''}${slope.toFixed(2)}x + ${intercept.toFixed(1)}`
    };
  },

  /**
   * Analisis Regresi Nilai Tryout TKA (3 Mapel Wajib + 2 Mapel Pilihan)
   */
  calculateTKAStats(tryouts) {
    if (!tryouts || tryouts.length === 0) {
      return { tryoutDetails: [], regression: null, nextPrediction: 0, latestAvg: 0 };
    }

    const tryoutDetails = tryouts.map((to, index) => {
      const scores = [
        Number(to.bIndo || 0),
        Number(to.matWajib || 0),
        Number(to.bIng || 0),
        Number(to.mapelPilihan1Nilai || 0),
        Number(to.mapelPilihan2Nilai || 0)
      ];
      const avg = Number((scores.reduce((a, b) => a + b, 0) / 5).toFixed(1));

      return {
        ...to,
        toKe: to.toKe || (index + 1),
        avg,
        scores
      };
    });

    const points = tryoutDetails.map((to, idx) => ({ x: idx + 1, y: to.avg }));
    const regression = this.calculateLinearRegression(points);
    const latestAvg = tryoutDetails[tryoutDetails.length - 1].avg;

    return {
      tryoutDetails,
      regression,
      nextPrediction: regression.nextPrediction || latestAvg,
      latestAvg
    };
  },

  /**
   * Analisis Regresi Nilai Tryout UTBK (7 Subtopik/Subtes SNBT)
   */
  calculateUTBKStats(tryouts) {
    if (!tryouts || tryouts.length === 0) {
      return { tryoutDetails: [], regression: null, nextPrediction: 0, latestAvg: 0, subtestAverages: {} };
    }

    const subkeys = ['pu', 'ppu', 'pbm', 'pk', 'pm', 'litIndo', 'litIng'];
    const subtestSums = { pu: 0, ppu: 0, pbm: 0, pk: 0, pm: 0, litIndo: 0, litIng: 0 };

    const tryoutDetails = tryouts.map((to, index) => {
      const scores = subkeys.map(k => Number(to[k] || 0));
      const avg = Number((scores.reduce((a, b) => a + b, 0) / 7).toFixed(1));

      subkeys.forEach(k => {
        subtestSums[k] += Number(to[k] || 0);
      });

      return {
        ...to,
        toKe: to.toKe || (index + 1),
        avg,
        scores
      };
    });

    const n = tryoutDetails.length;
    const subtestAverages = {};
    subkeys.forEach(k => {
      subtestAverages[k] = Number((subtestSums[k] / n).toFixed(1));
    });

    const points = tryoutDetails.map((to, idx) => ({ x: idx + 1, y: to.avg }));
    const regression = this.calculateLinearRegression(points);
    const latestAvg = tryoutDetails[tryoutDetails.length - 1].avg;

    return {
      tryoutDetails,
      regression,
      nextPrediction: regression.nextPrediction || latestAvg,
      latestAvg,
      subtestAverages
    };
  },

  /**
   * Rasionalisasi PTN untuk Jalur SNBP & SNBT
   */
  calculateRationalization(ptnItem, raporStats, tkaStats, utbkStats) {
    if (!ptnItem) return null;

    // --- ANALISIS SNBP (Rapor + TKA) ---
    // Skor Komposit SNBP Siswa: Bobot Rapor 70%, TKA dinormalisasi skala 100 (TKA/10) 30%
    const studentRaporAvg = raporStats.overallAvg || 0;
    const studentTkaAvgNormalized = (tkaStats.latestAvg ? (tkaStats.latestAvg / 10) : studentRaporAvg);
    const studentSNBPScore = Number(((studentRaporAvg * 0.7) + (studentTkaAvgNormalized * 0.3)).toFixed(1));

    const snbpGap = Number((studentSNBPScore - ptnItem.passingGradeSNBP).toFixed(1));

    let snbpStatus = 'Kompetitif';
    let snbpStatusBadge = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300';
    let snbpPeluangPercent = 65;

    if (snbpGap >= 1.5) {
      snbpStatus = 'Sangat Berpeluang';
      snbpStatusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300';
      snbpPeluangPercent = Math.min(96, Math.round(82 + (snbpGap * 4)));
    } else if (snbpGap >= 0) {
      snbpStatus = 'Peluang Aman';
      snbpStatusBadge = 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300';
      snbpPeluangPercent = Math.round(70 + (snbpGap * 6));
    } else if (snbpGap >= -1.5) {
      snbpStatus = 'Ketatan Ketat';
      snbpStatusBadge = 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300';
      snbpPeluangPercent = Math.max(35, Math.round(55 + (snbpGap * 10)));
    } else {
      snbpStatus = 'Perlu Peningkatan';
      snbpStatusBadge = 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300';
      snbpPeluangPercent = Math.max(15, Math.round(40 + (snbpGap * 8)));
    }

    // --- ANALISIS SNBT (UTBK) ---
    // Menggunakan Nilai Rata-Rata UTBK terbaru atau hasil prediksi
    const studentUTBKScore = utbkStats.nextPrediction || utbkStats.latestAvg || 0;
    const snbtGap = Math.round(studentUTBKScore - ptnItem.passingGradeSNBT);

    let snbtStatus = 'Kompetitif';
    let snbtStatusBadge = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300';
    let snbtPeluangPercent = 62;

    if (snbtGap >= 20) {
      snbtStatus = 'Sangat Berpeluang';
      snbtStatusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300';
      snbtPeluangPercent = Math.min(95, Math.round(80 + (snbtGap * 0.4)));
    } else if (snbtGap >= 0) {
      snbtStatus = 'Peluang Aman';
      snbtStatusBadge = 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/40 dark:text-teal-300';
      snbtPeluangPercent = Math.round(68 + (snbtGap * 0.5));
    } else if (snbtGap >= -25) {
      snbtStatus = 'Persaingan Tinggi';
      snbtStatusBadge = 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300';
      snbtPeluangPercent = Math.max(35, Math.round(52 + (snbtGap * 0.6)));
    } else {
      snbtStatus = 'Risiko Tinggi';
      snbtStatusBadge = 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300';
      snbtPeluangPercent = Math.max(12, Math.round(35 + (snbtGap * 0.5)));
    }

    return {
      ptn: ptnItem,
      snbp: {
        studentScore: studentSNBPScore,
        passingGrade: ptnItem.passingGradeSNBP,
        gap: snbpGap,
        status: snbpStatus,
        statusBadge: snbpStatusBadge,
        peluangPercent: snbpPeluangPercent,
        keketatan: ptnItem.keketatanSNBP,
        dayaTampung: ptnItem.dayaTampungSNBP,
        peminat: ptnItem.peminatSNBP
      },
      snbt: {
        studentScore: studentUTBKScore,
        passingGrade: ptnItem.passingGradeSNBT,
        gap: snbtGap,
        status: snbtStatus,
        statusBadge: snbtStatusBadge,
        peluangPercent: snbtPeluangPercent,
        keketatan: ptnItem.keketatanSNBT,
        dayaTampung: ptnItem.dayaTampungSNBT,
        peminat: ptnItem.peminatSNBT
      }
    };
  },

  /**
   * Menghitung Indeks Kesiapan Akademik Keseluruhan (0 - 100%)
   */
  calculateAcademicReadinessIndex(raporAvg, tkaPred, utbkPred, streakDays = 12) {
    // Komponen Rapor: bobot 35% (90+ bernilai 35 penuh)
    const raporScore = Math.min(35, Math.max(0, (raporAvg / 100) * 35));

    // Komponen TKA: bobot 25% (750+ bernilai 25)
    const tkaScore = Math.min(25, Math.max(0, (tkaPred / 800) * 25));

    // Komponen UTBK: bobot 30% (750+ bernilai 30)
    const utbkScore = Math.min(30, Math.max(0, (utbkPred / 800) * 30));

    // Komponen Konsistensi / Streak: bobot 10% (10+ hari bernilai 10)
    const streakScore = Math.min(10, Math.max(0, streakDays));

    const total = Number((raporScore + tkaScore + utbkScore + streakScore).toFixed(1));
    return Math.min(99.5, Math.max(10, total));
  }
};
