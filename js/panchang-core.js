/* panchang-core.js — Accurate Panchang using astronomy-engine (sidereal / Lahiri)
   Requires: astronomy-engine loaded globally as `Astronomy` */

const PanchangCore = (function () {

  // ---- Lahiri (Chitrapaksha) Ayanamsha ----
  // Astronomy.MakeTime(date).tt = days since J2000 (TT). Convert to centuries.
  function lahiriAyanamsha(date) {
    const days = Astronomy.MakeTime(date).tt;   // days since J2000
    const T = days / 36525.0;                    // Julian centuries
    // Lahiri ≈ 23.85° at J2000; precession ≈ 1.3969°/century (50.2564"/yr)
    return 23.853 + 1.3969 * T + 0.0000308 * T * T;
  }

  function norm360(x) { return ((x % 360) + 360) % 360; }

  function tropicalLongitude(body, date) {
    const t = Astronomy.MakeTime(date);
    const vec = Astronomy.GeoVector(body, t, true);
    const ecl = Astronomy.Ecliptic(vec);
    return norm360(ecl.elon);
  }

  function siderealLongitude(body, date) {
    return norm360(tropicalLongitude(body, date) - lahiriAyanamsha(date));
  }

  // ---- Tithi: (Moon - Sun) / 12° ----
  function computeTithi(date) {
    const sun = siderealLongitude(Astronomy.Body.Sun, date);
    const moon = siderealLongitude(Astronomy.Body.Moon, date);
    const diff = norm360(moon - sun);
    const index = Math.floor(diff / 12);   // 0..29
    const paksha = index < 15 ? 0 : 1;
    const inPaksha = index % 15;
    const fraction = (diff % 12) / 12;
    return { index, paksha, inPaksha, tithiNo: index + 1, fraction, diff };
  }

  // ---- Nakshatra: Moon / 13°20' ----
  function computeNakshatra(date) {
    const moon = siderealLongitude(Astronomy.Body.Moon, date);
    const span = 360 / 27;                 // 13.3333°
    const index = Math.floor(moon / span); // 0..26
    const pada = Math.floor((moon % span) / (span / 4)) + 1; // 1..4
    return { index, pada, longitude: moon };
  }

  // ---- Yoga: (Sun + Moon) / 13°20' ----
  function computeYoga(date) {
    const sun = siderealLongitude(Astronomy.Body.Sun, date);
    const moon = siderealLongitude(Astronomy.Body.Moon, date);
    const sum = norm360(sun + moon);
    const index = Math.floor(sum / (360 / 27)); // 0..26
    return { index };
  }

  // ---- Karana: 60 half-tithis per lunar month, 11 distinct names ----
  // i18n karana array (11): [Bava,Balava,Kaulava,Taitila,Gara,Vanija,Vishti,
  //                          Shakuni,Chatushpada,Naga,Kimstughna]
  //   indices:                0     1       2       3      4    5      6
  //                           7        8           9     10
  // Sequence rule:
  //  - half 0            -> Kimstughna (10)  [first half of Shukla Pratipada]
  //  - half 1..56 (56)   -> 7 movable (0..6) repeating -> ((half-1) % 7)
  //  - half 57,58,59     -> Shakuni(7), Chatushpada(8), Naga(9)
  function computeKarana(date) {
    const t = computeTithi(date);
    const half = Math.floor(t.diff / 6);   // 0..59
    let name;
    if (half === 0) name = 10;             // Kimstughna
    else if (half <= 56) name = (half - 1) % 7;   // movable Bava..Vishti
    else name = 7 + (half - 57);           // 57->Shakuni,58->Chatushpada,59->Naga
    return { index: name, half };
  }

  function computeVaara(date) { return date.getDay(); }

  // ---- Rise / Set (accurate) ----
  function riseSet(body, date, lat, lon, direction) {
    try {
      const observer = new Astronomy.Observer(lat, lon, 0);
      const startTime = Astronomy.MakeTime(
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
      const ev = Astronomy.SearchRiseSet(body, observer, direction, startTime, 1);
      return ev ? ev.date : null;
    } catch (e) { return null; }
  }
  function sunrise(date, lat, lon)  { return riseSet(Astronomy.Body.Sun, date, lat, lon, +1); }
  function sunset(date, lat, lon)   { return riseSet(Astronomy.Body.Sun, date, lat, lon, -1); }
  function moonrise(date, lat, lon) { return riseSet(Astronomy.Body.Moon, date, lat, lon, +1); }

  // ---- Rahu / Gulika / Yamaganda (real sunrise..sunset, 8 segments) ----
  const RAHU   = [8, 2, 7, 5, 6, 4, 3];  // Sun..Sat
  const GULIKA = [7, 6, 5, 4, 3, 2, 1];
  const YAMA   = [5, 4, 3, 2, 1, 7, 6];

  function inauspiciousPeriod(seqArr, vaara, sr, ss) {
    if (!sr || !ss) return null;
    const seg = (ss - sr) / 8;
    const start = new Date(sr.getTime() + (seqArr[vaara] - 1) * seg);
    return { start, end: new Date(start.getTime() + seg) };
  }

  // Abhijit: 8th of 15 day-muhurtas (midday)
  function abhijit(sr, ss) {
    if (!sr || !ss) return null;
    const mLen = (ss - sr) / 15;
    const start = new Date(sr.getTime() + 7 * mLen);
    return { start, end: new Date(start.getTime() + mLen) };
  }

  // ---- Full daily panchang ----
  function daily(date, lat, lon) {
    const sr = sunrise(date, lat, lon);
    const ss = sunset(date, lat, lon);
    const vaara = computeVaara(date);
    const refTime = sr || date;   // panchang taken at sunrise
    return {
      date,
      tithi: computeTithi(refTime),
      nakshatra: computeNakshatra(refTime),
      yoga: computeYoga(refTime),
      karana: computeKarana(refTime),
      vaara,
      sunrise: sr, sunset: ss,
      moonrise: moonrise(date, lat, lon),
      ayanamsha: lahiriAyanamsha(refTime),
      rahu: inauspiciousPeriod(RAHU, vaara, sr, ss),
      gulika: inauspiciousPeriod(GULIKA, vaara, sr, ss),
      yamaganda: inauspiciousPeriod(YAMA, vaara, sr, ss),
      abhijit: abhijit(sr, ss)
    };
  }

  return {
    lahiriAyanamsha, siderealLongitude, tropicalLongitude,
    computeTithi, computeNakshatra, computeYoga, computeKarana, computeVaara,
    sunrise, sunset, moonrise, daily, norm360
  };
})();
