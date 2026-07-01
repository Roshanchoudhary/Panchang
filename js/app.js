/* app.js — Shared controller for all pages.
   Reads ?lang= from URL, renders daily / monthly / rashifal.
   Depends on: PanchangCore, Calendars, Rashifal, window.I18N
   ------------------------------------------------------------------ */

const App = (function () {

  // Fixed alphabetical order of all 22 official languages
  const LANG_ORDER = ["as","bn","brx","doi","gu","hi","kn","ks","kok","mai",
                      "ml","mni","mr","ne","or","pa","sa","sat","sd","ta","te","ur"];

  // English display names for the selector + cards
  const ENGLISH_NAMES = {
    as:"Assamese", bn:"Bengali", brx:"Bodo", doi:"Dogri", gu:"Gujarati",
    hi:"Hindi", kn:"Kannada", ks:"Kashmiri", kok:"Konkani", mai:"Maithili",
    ml:"Malayalam", mni:"Manipuri", mr:"Marathi", ne:"Nepali", or:"Odia",
    pa:"Punjabi", sa:"Sanskrit", sat:"Santali", sd:"Sindhi", ta:"Tamil",
    te:"Telugu", ur:"Urdu"
  };

  // ---------- helpers ----------
  function getLang() {
    const p = new URLSearchParams(location.search).get("lang");
    return (p && window.I18N && window.I18N[p]) ? p : "hi";
  }

  // localize digits (0-9) into the language's own script
  function digits(lang, val) {
    const d = window.I18N[lang] && window.I18N[lang].meta && window.I18N[lang].meta.digits;
    if (!d) return String(val);
    return String(val).replace(/[0-9]/g, n => d[+n]);
  }

  function fmtTime(lang, date) {
    if (!date || isNaN(date)) return "—";
    let h = date.getHours(), m = date.getMinutes();
    const ap = h < 12 ? "AM" : "PM";
    const h12 = h % 12 || 12;
    return digits(lang, h12) + ":" + digits(lang, (m < 10 ? "0" : "") + m) + " " + ap;
  }
  function fmtRange(lang, p) { return p ? fmtTime(lang, p.start) + " – " + fmtTime(lang, p.end) : "—"; }

  // ---------- diagnostic banner (shows missing i18n files) ----------
  function checkMissing() {
    const missing = LANG_ORDER.filter(c => !(window.I18N && window.I18N[c]));
    if (missing.length) {
      console.warn("i18n files NOT loaded:", missing);
    }
    return missing;
  }

  // ---------- header + language dropdown + tabs ----------
  function buildChrome(lang, activeTab) {
    const L = window.I18N[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = L.meta.dir || "ltr";
    const host = document.getElementById("chrome");
    if (!host) return;

    const page = location.pathname.split("/").pop() || "daily.html";

    // Only list languages whose i18n actually loaded — each as "Native — English"
    const loaded = LANG_ORDER.filter(code => window.I18N[code]);
    const options = loaded.map(code => {
      const nm = window.I18N[code].meta.name;
      const en = ENGLISH_NAMES[code] || code;
      const sel = code === lang ? " selected" : "";
      return `<option value="${code}"${sel}>${nm} — ${en}</option>`;
    }).join("");

    const tab = (id, label, file) =>
      `<a class="${activeTab === id ? 'active' : ''}" href="${file}?lang=${lang}">${label}</a>`;

    host.innerHTML = `
      <header>
        <div class="header-top">
          <div class="header-title">
            <span class="om">🕉️</span>
            <div>
              <h1>${L.ui.site}</h1>
              <div class="region">📍 ${L.meta.region}</div>
            </div>
          </div>
          <div class="lang-select-wrap">
            <label for="langSelect" class="lang-select-label">🌐 ${L.ui.chooseLang || "भाषा · Language"}</label>
            <div class="select-shell">
              <select id="langSelect" class="lang-select" aria-label="Select language">${options}</select>
            </div>
          </div>
        </div>
      </header>
      <nav class="tabs">
        ${tab("daily", L.ui.daily, "daily.html")}
        ${tab("monthly", L.ui.monthly, "monthly.html")}
        ${tab("rashifal", L.ui.rashifal, "rashifal.html")}
      </nav>`;

    // language switch -> same page, new lang
    const sel = document.getElementById("langSelect");
    if (sel) sel.addEventListener("change", () => { location.href = `${page}?lang=${sel.value}`; });

    // show missing-file warning under the nav
    const missing = checkMissing();
    if (missing.length) {
      host.insertAdjacentHTML("beforeend",
        `<div style="background:#fff3cd;color:#8a5a30;text-align:center;padding:8px 12px;font-size:.82rem;">
          ⚠️ ${missing.length} भाषा फाइलें लोड नहीं हुईं / not loaded:
          <b>${missing.join(", ")}</b> — <code>js/i18n/</code> जाँचें
        </div>`);
    }
  }

  // ---------- month name per calendar type ----------
  function monthName(lang, date, panchang) {
    const L = window.I18N[lang];
    const cal = L.meta.calendar;

    if (cal === "bangla-solar") {
      const b = Calendars.banglaDate(date);
      return { name: (L.maasa_solar || L.maasa_lunar)[b.monthIndex], day: b.day, year: b.year };
    }
    if (cal === "tamil-solar") {
      const td = Calendars.tamilDate(date);
      return { name: (L.maasa_solar || L.maasa_lunar)[td.monthIndex], day: td.day, year: null };
    }
    if (cal === "malayalam-solar") {
      const md = Calendars.malayalamDate(date);
      return { name: (L.maasa_solar || L.maasa_lunar)[md.monthIndex], day: md.day, year: md.year };
    }
    // lunar (purnimanta / amanta / gujarati)
    const mIdx = (cal === "purnimanta")
      ? Calendars.purnimantaMonth(date)
      : Calendars.amantaMonth(date);
    const arr = L.maasa_lunar || L.maasa_solar;
    return { name: arr[mIdx], day: panchang.tithi.inPaksha + 1, year: null };
  }

  function localDateString(lang, date, panchang) {
    const L = window.I18N[lang];
    const mn = monthName(lang, date, panchang);
    let s = "";
    if ((L.meta.calendar || "").endsWith("solar")) {
      s = digits(lang, mn.day) + " " + mn.name;
      if (mn.year) s += " " + digits(lang, mn.year);
      if (L.meta.era === "bangabda") s += " বঙ্গাব্দ";
    } else {
      s = mn.name + " · " + L.paksha[panchang.tithi.paksha] + " · " + L.tithi[panchang.tithi.index];
    }
    return s;
  }

  function pitem(label, value, sub) {
    return `<div class="pitem"><div class="label">${label}</div>
            <div class="value">${value}</div>${sub ? `<div class="sub">${sub}</div>` : ""}</div>`;
  }

  // ================= DAILY PAGE =================
  function renderDaily() {
    if (!window.I18N || Object.keys(window.I18N).length === 0) { showFatal(); return; }
    const lang = getLang(); const L = window.I18N[lang];
    buildChrome(lang, "daily");

    const now = new Date();
    const { lat, lon } = L.meta;
    const p = PanchangCore.daily(now, lat, lon);
    const el = document.getElementById("content");

    const greg = digits(lang, now.getDate()) + " / " + digits(lang, now.getMonth() + 1) + " / " + digits(lang, now.getFullYear());
    const local = localDateString(lang, now, p);

    el.innerHTML = `
      <div class="container">
        <div class="card">
          <div class="date-hero">
            <div class="greg">${greg} · ${L.vaara[p.vaara]}</div>
            <div class="local">📿 ${local}</div>
          </div>
          <div class="grid">
            ${pitem(L.labels.tithi, L.paksha[p.tithi.paksha] + " " + L.tithi[p.tithi.index])}
            ${pitem(L.labels.nakshatra, L.nakshatra[p.nakshatra.index], L.labels.pada + " " + digits(lang, p.nakshatra.pada))}
            ${pitem(L.labels.yoga, L.yoga[p.yoga.index])}
            ${pitem(L.labels.karana, L.karana[p.karana.index])}
            ${pitem(L.labels.vaara, L.vaara[p.vaara])}
            ${pitem(L.labels.sunrise, fmtTime(lang, p.sunrise))}
            ${pitem(L.labels.sunset, fmtTime(lang, p.sunset))}
            ${pitem(L.labels.moonrise, fmtTime(lang, p.moonrise))}
            ${pitem(L.labels.ayanamsha, digits(lang, p.ayanamsha.toFixed(2)) + "°")}
          </div>
        </div>
        <div class="card">
          <h2>⏰ ${L.ui.muhurat}</h2>
          <div class="grid">
            ${pitem(L.labels.abhijit, fmtRange(lang, p.abhijit))}
            ${pitem(L.labels.rahu, fmtRange(lang, p.rahu))}
            ${pitem(L.labels.gulika, fmtRange(lang, p.gulika))}
            ${pitem(L.labels.yamaganda, fmtRange(lang, p.yamaganda))}
          </div>
          <div class="note">${L.meta.region} · Lahiri Ayanamsha · astronomy-engine</div>
        </div>
      </div>`;
  }

  // ================= MONTHLY PAGE =================
  let calDate = new Date();
  function renderMonthly() {
    if (!window.I18N || Object.keys(window.I18N).length === 0) { showFatal(); return; }
    const lang = getLang(); const L = window.I18N[lang];
    buildChrome(lang, "monthly");
    const el = document.getElementById("content");
    el.innerHTML = `
      <div class="container">
        <div class="card">
          <div class="cal-head">
            <button id="prevM" aria-label="Previous month">‹</button>
            <span class="cal-title" id="calTitle"></span>
            <button id="nextM" aria-label="Next month">›</button>
          </div>
          <div class="calendar" id="cal"></div>
        </div>
        <div class="card" id="detail" style="display:none"></div>
      </div>`;
    document.getElementById("prevM").onclick = () => { calDate.setMonth(calDate.getMonth() - 1); drawCal(lang); };
    document.getElementById("nextM").onclick = () => { calDate.setMonth(calDate.getMonth() + 1); drawCal(lang); };
    drawCal(lang);
  }

  function drawCal(lang) {
    const L = window.I18N[lang]; const { lat, lon } = L.meta;
    const y = calDate.getFullYear(), mo = calDate.getMonth();
    document.getElementById("calTitle").textContent =
      new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(calDate);

    const cal = document.getElementById("cal"); cal.innerHTML = "";
    L.vaara.forEach(v => {
      const e = document.createElement("div"); e.className = "cal-dn"; e.textContent = v.slice(0, 2); cal.appendChild(e);
    });

    const first = new Date(y, mo, 1).getDay();
    const dim = new Date(y, mo + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < first; i++) {
      const e = document.createElement("div"); e.className = "cal-cell empty"; cal.appendChild(e);
    }
    for (let d = 1; d <= dim; d++) {
      const cd = new Date(y, mo, d);
      const p = PanchangCore.daily(cd, lat, lon);
      const cell = document.createElement("div"); cell.className = "cal-cell";
      if (d === today.getDate() && mo === today.getMonth() && y === today.getFullYear()) cell.classList.add("today");
      cell.innerHTML =
        `<span class="lnum">${digits(lang, p.tithi.inPaksha + 1)}</span>
         <div class="num">${digits(lang, d)}</div>
         <div class="tithi">${L.tithi[p.tithi.index]}</div>`;
      cell.onclick = () => showDetail(lang, cd);
      cal.appendChild(cell);
    }
  }

  function showDetail(lang, cd) {
    const L = window.I18N[lang]; const { lat, lon } = L.meta;
    const p = PanchangCore.daily(cd, lat, lon);
    const box = document.getElementById("detail");
    box.style.display = "block";
    box.innerHTML =
      `<h2>📌 ${L.ui.dayDetail} — ${digits(lang, cd.getDate())}/${digits(lang, cd.getMonth() + 1)}</h2>
       <div class="grid">
         ${pitem(L.labels.tithi, L.paksha[p.tithi.paksha] + " " + L.tithi[p.tithi.index])}
         ${pitem(L.labels.nakshatra, L.nakshatra[p.nakshatra.index])}
         ${pitem(L.labels.yoga, L.yoga[p.yoga.index])}
         ${pitem(L.labels.karana, L.karana[p.karana.index])}
         ${pitem(L.labels.sunrise, fmtTime(lang, p.sunrise))}
         ${pitem(L.labels.sunset, fmtTime(lang, p.sunset))}
       </div>`;
    box.scrollIntoView({ behavior: "smooth" });
  }

  // ================= RASHIFAL PAGE =================
  // City list with coordinates (extend freely)
  const CITIES = [
    ["Delhi", 28.61, 77.21], ["Mumbai", 19.08, 72.88], ["Kolkata", 22.57, 88.36],
    ["Chennai", 13.08, 80.27], ["Bengaluru", 12.97, 77.59], ["Hyderabad", 17.38, 78.49],
    ["Ahmedabad", 23.03, 72.58], ["Patna", 25.59, 85.14], ["Guwahati", 26.14, 91.74],
    ["Bhubaneswar", 20.30, 85.82], ["Thiruvananthapuram", 8.52, 76.94], ["Srinagar", 34.08, 74.80],
    ["Jaipur", 26.91, 75.79], ["Lucknow", 26.85, 80.95], ["Bhopal", 23.26, 77.41],
    ["Nagpur", 21.15, 79.09], ["Pune", 18.52, 73.86], ["Ranchi", 23.34, 85.31],
    ["Panaji", 15.50, 73.83], ["Jammu", 32.73, 74.87], ["Imphal", 24.82, 93.94],
    ["Kathmandu", 27.70, 85.32]
  ];

  function renderRashifal() {
    if (!window.I18N || Object.keys(window.I18N).length === 0) { showFatal(); return; }
    const lang = getLang(); const L = window.I18N[lang];
    buildChrome(lang, "rashifal");
    const el = document.getElementById("content");

    const tiles = L.rashi.map((nm, i) =>
      `<div class="rashi-tile" onclick="App.showHoroscope('${lang}',${i})">
        <div class="sym">${L.rashiSymbols[i]}</div><div class="nm">${nm}</div>
      </div>`).join("");

    const cityOpts = CITIES.map((c, i) => `<option value="${i}">${c[0]}</option>`).join("");

    el.innerHTML = `
      <div class="container">
        <div class="card">
          <h2>🔮 ${L.ui.yourRashi} — ${L.ui.moonSign}</h2>
          <div class="form-row">
            <label>${L.ui.birthDate}<input type="date" id="bDate"></label>
            <label>${L.ui.birthTime}<input type="time" id="bTime" value="12:00"></label>
            <label>${L.ui.birthCity}<select id="bCity">${cityOpts}</select></label>
          </div>
          <button class="btn" onclick="App.calcRashi('${lang}')">${L.ui.calculate}</button>
          <div id="rashiOut"></div>
        </div>
        <div class="card">
          <h2>✨ ${L.ui.todayHoroscope}</h2>
          <div class="rashi-grid">${tiles}</div>
          <div id="horoOut"></div>
        </div>
      </div>`;
  }

  function calcRashi(lang) {
    const L = window.I18N[lang];
    const dv = document.getElementById("bDate").value;
    const tv = document.getElementById("bTime").value || "12:00";
    const ci = +document.getElementById("bCity").value;
    if (!dv) {
      document.getElementById("rashiOut").innerHTML = `<div class="note">⚠️ ${L.ui.birthDate}?</div>`;
      return;
    }
    const [Y, M, D] = dv.split("-").map(Number);
    const [h, m] = tv.split(":").map(Number);
    const city = CITIES[ci];
    const birth = new Date(Y, M - 1, D, h, m);
    const r = Rashifal.janmaRashi(birth, city[1], city[2]);
    const idx = r.rashiIndex;

    document.getElementById("rashiOut").innerHTML = `
      <div class="rashi-result">
        <div class="big">${L.rashiSymbols[idx]} ${L.rashi[idx]}</div>
        <div>${L.labels.nakshatra}: ${L.nakshatra[r.nakshatra.index]} (${L.labels.pada} ${digits(lang, r.nakshatra.pada)})</div>
      </div>`;
    showHoroscope(lang, idx);
  }

  function showHoroscope(lang, idx) {
    const L = window.I18N[lang];
    const hi = Rashifal.dailyHoroscopeIndex(idx, new Date());
    const text = L.horoscope.templates[hi % L.horoscope.templates.length];
    document.getElementById("horoOut").innerHTML = `
      <div class="rashi-result">
        <div class="big">${L.rashiSymbols[idx]} ${L.rashi[idx]}</div>
        <p style="margin-top:10px">${text}</p>
      </div>`;
    document.getElementById("horoOut").scrollIntoView({ behavior: "smooth" });
  }

  // ---------- fatal fallback if NO i18n loaded ----------
  function showFatal() {
    const el = document.getElementById("content") || document.body;
    el.innerHTML = `<div class="container"><div class="card">
      <h2 style="color:#c1272d">⚠️ भाषा फाइलें लोड नहीं हुईं</h2>
      <p>कोई भी <code>js/i18n/*.js</code> फाइल लोड नहीं हुई। कृपया जाँचें:</p>
      <ul style="margin:10px 0 0 20px">
        <li>सभी 22 <code>&lt;script src="js/i18n/xx.js"&gt;</code> tags इस page में हैं?</li>
        <li>फाइल नाम बिलकुल lowercase हैं? (जैसे <code>te.js</code>, <code>Te.js</code> नहीं)</li>
        <li>Browser Console (F12) में कौन सी file 404 दे रही है?</li>
      </ul>
    </div></div>`;
  }

  // public API
  return { renderDaily, renderMonthly, renderRashifal, calcRashi, showHoroscope };
})();
