/* rashifal.js — Vedic (sidereal) Rashi from birth date/time/place + daily horoscope
   Moon-sign (Janma Rashi) is standard in Vedic astrology. */

const Rashifal = (function () {

  // 12 Rashis (0=Mesha)
  const RASHI_KEYS = ["mesha","vrishabha","mithuna","karka","simha","kanya",
                      "tula","vrischika","dhanu","makara","kumbha","meena"];

  // Birth Moon rashi (Janma Rashi) — sidereal Moon longitude / 30
  function janmaRashi(birthDate, lat, lon) {
    // birthDate is a JS Date in local time of the city (assume already UTC-correct)
    const moonLon = PanchangCore.siderealLongitude(Astronomy.Body.Moon, birthDate);
    const index = Math.floor(moonLon / 30);
    // Nakshatra + pada for extra detail
    const nak = PanchangCore.computeNakshatra(birthDate);
    return { rashiIndex: index, rashiKey: RASHI_KEYS[index], moonLon, nakshatra: nak };
  }

  // Sun rashi (for those who want sun-sign context)
  function sunRashi(date) {
    const sunLon = PanchangCore.siderealLongitude(Astronomy.Body.Sun, date);
    return { rashiIndex: Math.floor(sunLon / 30), rashiKey: RASHI_KEYS[Math.floor(sunLon / 30)] };
  }

  // Deterministic daily horoscope index (0..N) per rashi per day — maps to i18n text bank
  function dailyHoroscopeIndex(rashiIndex, date) {
    const dayNum = Math.floor(date.getTime() / 86400000);
    // pseudo-random but stable per (rashi, day)
    const seed = (dayNum * 31 + rashiIndex * 7 + 13) % 8;
    return seed; // 0..7 -> pick from 8 horoscope templates in i18n
  }

  return { RASHI_KEYS, janmaRashi, sunRashi, dailyHoroscopeIndex };
})();
