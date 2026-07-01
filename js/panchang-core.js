/* panchang-core.js — Accurate Panchang using astronomy-engine (sidereal / Lahiri)
   Requires: astronomy-engine loaded globally as `Astronomy`
   All angles in degrees. Uses Lahiri ayanamsha for sidereal (Vedic) positions. */

const PanchangCore = (function () {

  // ---- Lahiri Ayanamsha (approx, arc-min accurate) ----
  function lahiriAyanamsha(date) {
    // Reference: ayanamsha ~ 23.85° at J2000, precession ~50.29"/yr
    const jd = Astronomy.MakeTime(date).tt; // days since J2000 (TT)
    const T = jd / 36525.0;
    // Lahiri: 23°51'11" at J2000 approx + precession
    return 23.85272 + 1.396042 * T + 0.000308 * T * T;
  }

  function norm360(x) { return ((x % 360) + 360) % 360; }

  // Geocentric ecliptic longitude (tropical) of a body
  function tropicalLongitude(body, date) {
    const t = Astronomy.MakeTime(date);
    const vec = Astronomy.GeoVector(body, t, true);
    const ecl = Astronomy.Ecliptic(vec);
    return norm360(ecl.elon);
  }

  function siderealLongitude(body, date) {
    return norm360(tropicalLongitude(body, date) - lahiriAyanamsha(date));
  }

  // ---- Core five limbs ----
  // Tithi: 1..30 based on (Moon - Sun) sidereal longitude / 12°
  function computeTithi(date) {
    const sun = siderealLongitude(Astronomy.Body.Sun, date);
    const moon = siderealLongitude(Astronomy.Body.Moon, date);
    const diff = norm360(moon - sun);
    const index = Math.floor(diff / 12); // 0..29
    const paksha = index < 15 ? 0 : 1;   // 0=Shukla, 1=Krishna
    const inPaksha = index % 15;         // 0..14
    const fraction = (diff % 12) / 12;   // progress within tithi
    return { index, paksha, inPaksha, tithiNo: index + 1, fraction, diff };
  }

  // Nakshatra: Moon sidereal longitude / (360/27)
  function computeNakshatra(date) {
    const moon = siderealLongitude(Astronomy.Body.Moon, date);
    const span = 360 / 27;
    const index = Math.floor(moon / span); // 0..26
    const pada = Math.floor((moon % span) / (span / 4)) + 1; // 1..4
    return { index, pada, longitude: moon };
  }

  // Yoga: (Sun + Moon) sidereal / (360/27)
  function computeYoga(date) {
    const sun = siderealLongitude(Astronomy.Body.Sun, date);
    const moon = siderealLongitude(Astronomy.Body.Moon, date);
    const sum = norm360(sun + moon);
    const index = Math.floor(sum / (360 / 27)); // 0..26
    return { index };
  }

  // Karana: half-tithi. 60 karanas per lunar month; 11 distinct names.
  function computeKarana(date) {
    const t = computeTithi(date);
    const half = Math.floor(t.diff / 6); // 0..59
    // Karana sequence mapping (standard Vedic)
    let name;
    if (half === 0) name = 10;              // Kimstughna (first half of Shukla Pratipada) idx→ use 10
    else if (half >= 57) name = 7 + (half - 57); // last three fixed: Shakuni,Chatushpada,Naga,Kimstughna
    else name = (half - 1) % 7;             // 7 repeating movable karanas (0..6)
    return { index: name, half };
  }

  function computeVaara(date) { return date.getDay(); } // 0=Sun

  // ---- Sunrise / Sunset / Moonrise for a location ----
  function riseSet(body, date, lat, lon, direction) {
    const observer = new Astronomy.Observer(lat, lon, 0);
    const startTime = Astronomy.MakeTime(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
    const ev = Astronomy.SearchRiseSet(body, observer, direction, startTime, 1);
    return ev ? ev.date : null;
  }

  function sunrise(date, lat, lon) { return riseSet(Astronomy.Body.Sun, date, lat, lon, +1); }
  function sunset(date, lat, lon)  { return riseSet(Astronomy.Body.Sun, date, lat, lon, -1); }
  function moonrise(date, lat, lon){ return riseSet(Astronomy.Body.Moon, date, lat, lon, +1); }

  // ---- Rahu Kaal / Gulika / Yamaganda (based on real sunrise/sunset) ----
  const RAHU = [8, 2, 7, 5, 6, 4, 3];   // Sun..Sat (1-indexed segment of 8)
  const GULIKA = [7, 6, 5, 4, 3, 2, 1];
  const YAMA = [5, 4, 3, 2, 1, 7, 6];

  function inauspiciousPeriod(seqArr, vaara, sr, ss) {
    if (!sr || !ss) return null;
    const seg = (ss - sr) / 8;
    const start = new Date(sr.getTime() + (seqArr[vaara] - 1) * seg);
    const end = new Date(start.getTime() + seg);
    return { start, end };
  }

  // Abhijit Muhurat: midday ±24 min (8th muhurta of day)
  function abhijit(sr, ss) {
    if (!sr || !ss) return null;
    const dayLen = ss - sr;
    const muhurtaLen = dayLen / 15;
    const start = new Date(sr.getTime() + 7 * muhurtaLen);
    const end = new Date(start.getTime() + muhurtaLen);
    return { start, end };
  }

  // Full daily panchang for a date + location
  function daily(date, lat, lon) {
    const sr = sunrise(date, lat, lon);
    const ss = sunset(date, lat, lon);
    const vaara = computeVaara(date);
    // Panchang elements are conventionally taken at sunrise
    const refTime = sr || date;
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
