/* calendars.js — Regional civil calendars.
   Only 7 languages have a distinct civil calendar (date/month/year differs).
   Depends on: PanchangCore, Astronomy */

const Calendars = (function () {

  // Solar month = which rashi Sun occupies (sidereal). 0=Mesha..11=Meena
  function solarMonthIndex(date) {
    const sunLon = PanchangCore.siderealLongitude(Astronomy.Body.Sun, date);
    return Math.floor(sunLon / 30);
  }

  // Day within solar month = days since Sun entered current rashi
  function solarDayOfMonth(date) {
    const target = solarMonthIndex(date);
    let probe = new Date(date), day = 1;
    for (let i = 0; i < 40; i++) {
      const prev = new Date(probe); prev.setDate(prev.getDate() - 1);
      if (solarMonthIndex(prev) !== target) break;
      day++; probe = prev;
    }
    return day;
  }

  // ---- Lunar month (Amanta / Purnimanta) — for Gujarati & Hindu Panchang display ----
  function amantaMonth(date) {
    let d = new Date(date), nm = new Date(date);
    for (let i = 0; i < 32; i++) {
      const tt = PanchangCore.computeTithi(d);
      if (tt.paksha === 0 && tt.inPaksha === 0) { nm = new Date(d); break; }
      d.setDate(d.getDate() - 1);
    }
    const sunLon = PanchangCore.siderealLongitude(Astronomy.Body.Sun, nm);
    return Math.floor(sunLon / 30) % 12; // 0=Chaitra
  }
  function purnimantaMonth(date) {
    const t = PanchangCore.computeTithi(date);
    let m = amantaMonth(date);
    if (t.paksha === 1) m = (m + 1) % 12;
    return m;
  }

  // ---- Era years ----
  function shakaYear(date) { return date.getFullYear() - 78; }
  function kollamYear(date) {
    const y = date.getFullYear();
    return (date.getMonth() >= 7) ? y - 824 : y - 825;
  }

  // ===== 1. Bengali (Bangabda) — solar =====
  // Months indexed 0=Mesha=Baishakh .. 11=Meena=Choitro
  function banglaDate(date) {
    const m = solarMonthIndex(date);
    const day = solarDayOfMonth(date);
    const y = date.getFullYear();
    // New year at Mesha sankranti (~Apr 14). Solar months Makar/Kumbha/Meena (9,10,11)
    // fall Jan-mid Apr => still previous Bangabda year.
    let bYear = (m >= 9) ? y - 594 : y - 593;
    return { monthIndex: m, day, year: bYear };
  }

  // ===== 2. Assamese (Bhaskarabda) — solar =====
  // Same solar months as Bengali; Bhaskarabda year = Gregorian - 593 (approx, Bohag start)
  function assameseDate(date) {
    const m = solarMonthIndex(date);
    const day = solarDayOfMonth(date);
    const y = date.getFullYear();
    let bYear = (m >= 9) ? y - 594 : y - 593;
    return { monthIndex: m, day, year: bYear };
  }

  // ===== 3. Tamil — solar =====
  // 0=Mesha=Chithirai .. 11=Meena=Panguni
  function tamilDate(date) {
    const m = solarMonthIndex(date);
    const day = solarDayOfMonth(date);
    const cycleYear = ((date.getFullYear() - 1987) % 60 + 60) % 60; // 1987=Prabhava
    return { monthIndex: m, day, cycleIndex: cycleYear };
  }

  // ===== 4. Malayalam (Kollam) — solar =====
  // Kerala year starts Chingam (Simha, rashi idx 4)
  function malayalamDate(date) {
    const m = solarMonthIndex(date);
    const day = solarDayOfMonth(date);
    const keralaMonth = (m - 4 + 12) % 12; // Chingam = month 0
    return { monthIndex: keralaMonth, day, year: kollamYear(date) };
  }

  // ===== 5. Nepali (Bikram Sambat) — solar approximation =====
  // 0=Mesha=Baishakh .. 11=Meena=Chaitra
  function nepaliDate(date) {
    const m = solarMonthIndex(date);
    const day = solarDayOfMonth(date);
    const y = date.getFullYear();
    // Baishakh (Mesha) ~ mid-April. Solar months 9,10,11 (Jan-Apr) => prev BS year end.
    let bsYear = (m >= 9) ? y + 56 : y + 57;
    return { monthIndex: m, day, year: bsYear };
  }

  // ===== 6. Manipuri (Meitei) — solar =====
  // Meitei year starts Sajibu (~Mesha). Use solar months in Meitei order (0=Mesha=Sajibu).
  function meiteiDate(date) {
    const m = solarMonthIndex(date);
    const day = solarDayOfMonth(date);
    const y = date.getFullYear();
    let meiteiYear = (m >= 9) ? y - 33 : y - 32; // Meitei era ~ Gregorian - 32 (approx)
    return { monthIndex: m, day, year: meiteiYear };
  }

  // ===== 7. Gujarati — Kartikadi Vikram Samvat (lunar, year starts Kartik/Diwali) =====
  // Uses AMANTA lunar months, but the YEAR increments at Kartik Shukla Pratipada.
  function gujaratiDate(date) {
    const mIdx = amantaMonth(date);          // 0=Chaitra .. 11=Falgun
    const t = PanchangCore.computeTithi(date);
    const y = date.getFullYear();
    // Vikram year normally = Greg + 57. But Gujarati increments at Kartik (month idx 7).
    // From Kartik(7) onward in Oct-Dec, year = Greg + 57; Jan-Kartik = Greg + 56.
    // Approx: if Gregorian month >= October => +57 else +56
    let vsYear = (date.getMonth() >= 9) ? y + 57 : y + 56;
    return { monthIndex: mIdx, tithiDay: t.inPaksha + 1, paksha: t.paksha, year: vsYear };
  }

  return {
    solarMonthIndex, solarDayOfMonth, amantaMonth, purnimantaMonth,
    shakaYear, kollamYear,
    banglaDate, assameseDate, tamilDate, malayalamDate,
    nepaliDate, meiteiDate, gujaratiDate
  };
})();
