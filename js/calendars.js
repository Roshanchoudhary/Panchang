/* calendars.js — Regional calendar conversions
   Types: purnimanta (N.India), amanta (Maharashtra/South), bangla-solar,
   tamil-solar, malayalam-solar (Kollam), gujarati (Kartikadi Vikram)
   Depends on: PanchangCore, Astronomy */

const Calendars = (function () {

  // Solar month = which rashi the Sun occupies (sidereal). 0=Mesha..11=Meena
  function solarMonthIndex(date) {
    const sunLon = PanchangCore.siderealLongitude(Astronomy.Body.Sun, date);
    return Math.floor(sunLon / 30); // 0..11
  }

  // Day within solar month = days since Sun entered current rashi
  function solarDayOfMonth(date) {
    const targetMonth = solarMonthIndex(date);
    let probe = new Date(date);
    let day = 1;
    for (let i = 0; i < 40; i++) {
      const prev = new Date(probe); prev.setDate(prev.getDate() - 1);
      if (solarMonthIndex(prev) !== targetMonth) break;
      day++; probe = prev;
    }
    return day;
  }

  // Amanta lunar month = solar rashi at the new moon (Amavasya) that begins it
  function amantaMonth(date) {
    let d = new Date(date);
    let nm = new Date(date);
    for (let i = 0; i < 32; i++) {
      const tt = PanchangCore.computeTithi(d);
      if (tt.paksha === 0 && tt.inPaksha === 0) { nm = new Date(d); break; }
      d.setDate(d.getDate() - 1);
    }
    const sunLon = PanchangCore.siderealLongitude(Astronomy.Body.Sun, nm);
    return Math.floor(sunLon / 30) % 12; // 0 = Chaitra
  }

  // Purnimanta month = one ahead of Amanta during Krishna paksha
  function purnimantaMonth(date) {
    const t = PanchangCore.computeTithi(date);
    let m = amantaMonth(date);
    if (t.paksha === 1) m = (m + 1) % 12;
    return m;
  }

  // ---- Era years ----
  function vikramYear(date) { return date.getFullYear() + 57; }
  function shakaYear(date) { return date.getFullYear() - 78; }
  function kollamYear(date) {
    const y = date.getFullYear();
    return (date.getMonth() >= 7) ? y - 824 : y - 825;
  }

  // ---- Bengali (Bangabda) — solar, Poila Boishakh ~Apr 14/15 ----
  const BANGLA_MONTHS_START = [ // [gregorian month(0-idx), day]
    [3,15],[4,15],[5,15],[6,16],[7,16],[8,16],[9,17],[10,16],[11,15],[0,14],[1,13],[2,15]
  ];
  function banglaDate(date) {
    const y = date.getFullYear();
    let mIdx = 11, start = null;
    for (let i = BANGLA_MONTHS_START.length - 1; i >= 0; i--) {
      const [mm, dd] = BANGLA_MONTHS_START[i];
      const s = new Date(y, mm, dd);
      if (date >= s) { mIdx = i; start = s; break; }
    }
    if (!start) { const [mm, dd] = BANGLA_MONTHS_START[11]; start = new Date(y - 1, mm, dd); mIdx = 11; }
    const day = Math.floor((date - start) / 86400000) + 1;
    let bYear = y - 593;
    if (date < new Date(y, 3, 15)) bYear = y - 594;
    return { monthIndex: mIdx, day, year: bYear };
  }

  // ---- Tamil solar date (Chithirai..Panguni) ----
  function tamilDate(date) {
    const m = solarMonthIndex(date);   // 0=Mesha=Chithirai
    const d = solarDayOfMonth(date);
    const cycleYear = ((date.getFullYear() - 1987) % 60 + 60) % 60; // 1987=Prabhava
    return { monthIndex: m, day: d, cycleIndex: cycleYear };
  }

  // ---- Malayalam (Kollam) solar date ----
  function malayalamDate(date) {
    const m = solarMonthIndex(date);          // 0=Mesha
    const d = solarDayOfMonth(date);
    const keralaMonth = (m - 4 + 12) % 12;    // Chingam (Simha, idx4) = month 0
    return { monthIndex: keralaMonth, day: d, year: kollamYear(date) };
  }

  return {
    solarMonthIndex, solarDayOfMonth,
    amantaMonth, purnimantaMonth,
    vikramYear, shakaYear, kollamYear,
    banglaDate, tamilDate, malayalamDate
  };
})();
