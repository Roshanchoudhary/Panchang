/* app.js — Shared controller. Correct civil calendars for the 7 languages
   that have one; others show Hindu Panchang only (Gregorian date).
   Depends on: PanchangCore, Calendars, Rashifal, window.I18N */

const App = (function () {

  const LANG_ORDER = ["as","bn","brx","doi","gu","hi","kn","ks","kok","mai",
                      "ml","mni","mr","ne","or","pa","sa","sat","sd","ta","te","ur"];
  const ENGLISH_NAMES = {
    as:"Assamese", bn:"Bengali", brx:"Bodo", doi:"Dogri", gu:"Gujarati",
    hi:"Hindi", kn:"Kannada", ks:"Kashmiri", kok:"Konkani", mai:"Maithili",
    ml:"Malayalam", mni:"Manipuri", mr:"Marathi", ne:"Nepali", or:"Odia",
    pa:"Punjabi", sa:"Sanskrit", sat:"Santali", sd:"Sindhi", ta:"Tamil",
    te:"Telugu", ur:"Urdu"
  };

  // Languages WITH a distinct civil calendar
  const CIVIL_CAL = {
    "bangla-solar":1, "assamese-solar":1, "tamil-solar":1, "malayalam-solar":1,
    "nepali-solar":1, "meitei-solar":1, "gujarati-lunar":1
  };
  function hasCivilCalendar(cal) { return !!CIVIL_CAL[cal]; }
  function isSolarCivil(cal) { return hasCivilCalendar(cal) && cal !== "gujarati-lunar"; }

  function getLang() {
    const p = new URLSearchParams(location.search).get("lang");
    return (p && window.I18N && window.I18N[p]) ? p : "hi";
  }
  function digits(lang, val) {
    const d = window.I18N[lang] && window.I18N[lang].meta && window.I18N[lang].meta.digits;
    if (!d) return String(val);
    return String(val).replace(/[0-9]/g, n => d[+n]);
  }
  function fmtTime(lang, date) {
    if (!date || isNaN(date)) return "—";
    let h = date.getHours(), m = date.getMinutes();
    const ap = h < 12 ? "AM" : "PM", h12 = h % 12 || 12;
    return digits(lang, h12) + ":" + digits(lang, (m < 10 ? "0" : "") + m) + " " + ap;
  }
  function fmtRange(lang, p) { return p ? fmtTime(lang, p.start) + " – " + fmtTime(lang, p.end) : "—"; }
  function checkMissing() { return LANG_ORDER.filter(c => !(window.I18N && window.I18N[c])); }

  function buildChrome(lang, activeTab) {
    const L = window.I18N[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = L.meta.dir || "ltr";
    const host = document.getElementById("chrome");
    if (!host) return;
    const page = location.pathname.split("/").pop() || "daily.html";
    const loaded = LANG_ORDER.filter(code => window.I18N[code]);
    const options = loaded.map(code => {
      const nm = window.I18N[code].meta.name, en = ENGLISH_NAMES[code] || code;
      return `<option value="${code}"${code === lang ? " selected" : ""}>${nm} — ${en}</option>`;
    }).join("");
    const tab = (id, label, file) =>
      `<a class="${activeTab === id ? 'active' : ''}" href="${file}?lang=${lang}">${label}</a>`;
    host.innerHTML = `
      <header>
        <div class="header-top">
          <div class="header-title"><span class="om">🕉️</span>
            <div><h1>${L.ui.site}</h1><div class="region">📍 ${L.meta.region}</div></div></div>
          <div class="lang-select-wrap">
            <label for="langSelect" class="lang-select-label">🌐 ${L.ui.chooseLang || "भाषा · Language"}</label>
            <div class="select-shell"><select id="langSelect" class="lang-select">${options}</select></div>
          </div>
        </div>
      </header>
      <nav class="tabs">
        ${tab("daily", L.ui.daily, "daily.html")}
        ${tab("monthly", L.ui.monthly, "monthly.html")}
        ${tab("muhurta", L.ui.muhurta, "muhurta.html")}
        ${tab("mantra", L.ui.mantra, "mantra.html")}
        ${tab("rashifal", L.ui.rashifal, "rashifal.html")}
      </nav>`;
    const sel = document.getElementById("langSelect");
    if (sel) sel.addEventListener("change", () => { location.href = `${page}?lang=${sel.value}`; });
    const missing = checkMissing();
    if (missing.length) host.insertAdjacentHTML("beforeend",
      `<div style="background:#fff3cd;color:#8a5a30;text-align:center;padding:8px 12px;font-size:.82rem;">
        ⚠️ ${missing.length} भाषा फाइलें लोड नहीं हुईं: <b>${missing.join(", ")}</b></div>`);
  }

  // ---------- REGIONAL CIVIL DATE ----------
  // For the 7 civil-calendar languages -> real day/month/year.
  // For others -> null (they show only Gregorian + Hindu Panchang).
  function regionalDate(lang, date) {
    const L = window.I18N[lang];
    const cal = L.meta.calendar || "gregorian";
    if (!hasCivilCalendar(cal)) return null;

    if (cal === "bangla-solar")     { const b = Calendars.banglaDate(date);     return { day:b.day, monthName:L.maasa_solar[b.monthIndex], year:b.year, era:"বঙ্গাব্দ" }; }
    if (cal === "assamese-solar")   { const a = Calendars.assameseDate(date);   return { day:a.day, monthName:L.maasa_solar[a.monthIndex], year:a.year, era:"ভাস্করাব্দ" }; }
    if (cal === "tamil-solar")      { const t = Calendars.tamilDate(date);      return { day:t.day, monthName:L.maasa_solar[t.monthIndex], year:null, era:"" }; }
    if (cal === "malayalam-solar")  { const m = Calendars.malayalamDate(date);  return { day:m.day, monthName:L.maasa_solar[m.monthIndex], year:m.year, era:"കൊല്ലവർഷം" }; }
    if (cal === "nepali-solar")     { const n = Calendars.nepaliDate(date);     return { day:n.day, monthName:L.maasa_solar[n.monthIndex], year:n.year, era:"वि.सं." }; }
    if (cal === "meitei-solar")     { const e = Calendars.meiteiDate(date);     return { day:e.day, monthName:L.maasa_solar[e.monthIndex], year:e.year, era:"" }; }
    if (cal === "gujarati-lunar")   { const g = Calendars.gujaratiDate(date);
      return { day:g.tithiDay, monthName:L.maasa_lunar[g.monthIndex], year:g.year, era:"વિ.સં.", lunar:true, paksha:g.paksha }; }
    return null;
  }

  // Hindu Panchang month name (for the 15 languages without a civil calendar)
  function panchangMonth(lang, date, panchang) {
    const L = window.I18N[lang];
    // Purnimanta for North (hi, mai, ne, doi, sa, ks, ur, pa, sd, brx) else Amanta
    const purnimantaLangs = ["hi","mai","doi","sa","ks","ur","pa","sd","brx","kok"];
    const mIdx = purnimantaLangs.includes(lang) ? Calendars.purnimantaMonth(date) : Calendars.amantaMonth(date);
    const arr = L.maasa_lunar || L.maasa_solar;
    return arr[mIdx];
  }

  // Full local date string shown in date-hero
  function localDateString(lang, date, panchang) {
    const L = window.I18N[lang];
    const rd = regionalDate(lang, date);
    if (rd) {
      if (rd.lunar) { // Gujarati
        let s = L.paksha[rd.paksha] + " " + L.tithi[panchang.tithi.index] + " · " + rd.monthName;
        if (rd.year != null) s += " · " + digits(lang, rd.year) + " " + rd.era;
        return s;
      }
      let s = digits(lang, rd.day) + " " + rd.monthName;
      if (rd.year != null) s += " " + digits(lang, rd.year);
      if (rd.era) s += " " + rd.era;
      return s;
    }
    // No civil calendar -> Hindu Panchang (month + paksha + tithi)
    const mn = panchangMonth(lang, date, panchang);
    return mn + " · " + L.paksha[panchang.tithi.paksha] + " · " + L.tithi[panchang.tithi.index];
  }

  function pitem(label, value, sub) {
    return `<div class="pitem"><div class="label">${label}</div>
            <div class="value">${value}</div>${sub ? `<div class="sub">${sub}</div>` : ""}</div>`;
  }

  // ================= DAILY =================
  let dailyDate = new Date();
  function renderDaily() {
    if (!window.I18N || Object.keys(window.I18N).length === 0) { showFatal(); return; }
    const lang = getLang(); const L = window.I18N[lang];
    buildChrome(lang, "daily");
    const now = dailyDate;
    const { lat, lon } = L.meta;
    const p = PanchangCore.daily(now, lat, lon);
    const rd = regionalDate(lang, now);
    const el = document.getElementById("content");

    const greg = digits(lang, now.getDate()) + " / " + digits(lang, now.getMonth() + 1) + " / " + digits(lang, now.getFullYear());
    const local = localDateString(lang, now, p);
    const iso = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    const monthDisplay = rd ? rd.monthName : panchangMonth(lang, now, p);
    const yearDisplay = rd && rd.year != null ? digits(lang, rd.year) : "—";

    el.innerHTML = `
      <div class="container">
        <div class="card">
          <div class="date-picker">
            <button id="prevD">‹</button>
            <input type="date" id="pickD" value="${iso}">
            <button id="nextD">›</button>
            <button id="todayD" class="today-btn">${L.ui.today || "आज · Today"}</button>
          </div>
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
            ${pitem(L.labels.maasa, monthDisplay)}
            ${pitem(L.labels.samvat, yearDisplay)}
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

    document.getElementById("prevD").onclick = () => { dailyDate.setDate(dailyDate.getDate() - 1); renderDaily(); };
    document.getElementById("nextD").onclick = () => { dailyDate.setDate(dailyDate.getDate() + 1); renderDaily(); };
    document.getElementById("todayD").onclick = () => { dailyDate = new Date(); renderDaily(); };
    document.getElementById("pickD").onchange = (e) => {
      const [Y, M, D] = e.target.value.split("-").map(Number);
      if (Y) { dailyDate = new Date(Y, M - 1, D); renderDaily(); }
    };
  }

  // ================= MONTHLY =================
  let calDate = new Date();
  function renderMonthly() {
    if (!window.I18N || Object.keys(window.I18N).length === 0) { showFatal(); return; }
    const lang = getLang();
    buildChrome(lang, "monthly");
    document.getElementById("content").innerHTML = `
      <div class="container">
        <div class="card">
          <div class="cal-head">
            <button id="prevM">‹</button>
            <span class="cal-title" id="calTitle"></span>
            <button id="nextM">›</button>
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
    let title = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(calDate);
    const mid = new Date(y, mo, 15);
    const midP = PanchangCore.daily(mid, lat, lon);
    const rd = regionalDate(lang, mid);
    if (rd) title += ` · ${rd.monthName}` + (rd.year != null ? " " + digits(lang, rd.year) : "");
    else title += ` · ${panchangMonth(lang, mid, midP)}`;
    document.getElementById("calTitle").textContent = title;

    const cal = document.getElementById("cal"); cal.innerHTML = "";
    L.vaara.forEach(v => { const e = document.createElement("div"); e.className = "cal-dn"; e.textContent = v.slice(0, 2); cal.appendChild(e); });
    const first = new Date(y, mo, 1).getDay(), dim = new Date(y, mo + 1, 0).getDate(), today = new Date();
    for (let i = 0; i < first; i++) { const e = document.createElement("div"); e.className = "cal-cell empty"; cal.appendChild(e); }
    for (let d = 1; d <= dim; d++) {
      const cd = new Date(y, mo, d);
      const p = PanchangCore.daily(cd, lat, lon);
      const rdc = regionalDate(lang, cd);
      // corner number: civil day (solar) OR tithi number (lunar/no-calendar)
      const cornerNum = (rdc && !rdc.lunar) ? rdc.day : (p.tithi.inPaksha + 1);
      const cell = document.createElement("div"); cell.className = "cal-cell";
      if (d === today.getDate() && mo === today.getMonth() && y === today.getFullYear()) cell.classList.add("today");
      cell.innerHTML =
        `<span class="lnum">${digits(lang, cornerNum)}</span>
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
       <div class="local" style="margin-bottom:10px">📿 ${localDateString(lang, cd, p)}</div>
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

  // ================= RASHIFAL =================
  const CITIES = [
    ["Delhi",28.61,77.21],["Mumbai",19.08,72.88],["Kolkata",22.57,88.36],
    ["Chennai",13.08,80.27],["Bengaluru",12.97,77.59],["Hyderabad",17.38,78.49],
    ["Ahmedabad",23.03,72.58],["Patna",25.59,85.14],["Guwahati",26.14,91.74],
    ["Bhubaneswar",20.30,85.82],["Thiruvananthapuram",8.52,76.94],["Srinagar",34.08,74.80],
    ["Jaipur",26.91,75.79],["Lucknow",26.85,80.95],["Bhopal",23.26,77.41],
    ["Nagpur",21.15,79.09],["Pune",18.52,73.86],["Ranchi",23.34,85.31],
    ["Panaji",15.50,73.83],["Jammu",32.73,74.87],["Imphal",24.82,93.94],["Kathmandu",27.70,85.32]
  ];
  function renderRashifal() {
    if (!window.I18N || Object.keys(window.I18N).length === 0) { showFatal(); return; }
    const lang = getLang(); const L = window.I18N[lang];
    buildChrome(lang, "rashifal");
    const tiles = L.rashi.map((nm, i) =>
      `<div class="rashi-tile" onclick="App.showHoroscope('${lang}',${i})">
        <div class="sym">${L.rashiSymbols[i]}</div><div class="nm">${nm}</div></div>`).join("");
    const cityOpts = CITIES.map((c, i) => `<option value="${i}">${c[0]}</option>`).join("");
    document.getElementById("content").innerHTML = `
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
    if (!dv) { document.getElementById("rashiOut").innerHTML = `<div class="note">⚠️ ${L.ui.birthDate}?</div>`; return; }
    const [Y, M, D] = dv.split("-").map(Number);
    const [h, m] = tv.split(":").map(Number);
    const city = CITIES[ci];
    const r = Rashifal.janmaRashi(new Date(Y, M - 1, D, h, m), city[1], city[2]);
    const idx = r.rashiIndex;
    document.getElementById("rashiOut").innerHTML = `
      <div class="rashi-result"><div class="big">${L.rashiSymbols[idx]} ${L.rashi[idx]}</div>
      <div>${L.labels.nakshatra}: ${L.nakshatra[r.nakshatra.index]} (${L.labels.pada} ${digits(lang, r.nakshatra.pada)})</div></div>`;
    showHoroscope(lang, idx);
  }
  function showHoroscope(lang, idx) {
    const L = window.I18N[lang];
    const hi = Rashifal.dailyHoroscopeIndex(idx, new Date());
    const text = L.horoscope.templates[hi % L.horoscope.templates.length];
    document.getElementById("horoOut").innerHTML = `
      <div class="rashi-result"><div class="big">${L.rashiSymbols[idx]} ${L.rashi[idx]}</div>
      <p style="margin-top:10px">${text}</p></div>`;
    document.getElementById("horoOut").scrollIntoView({ behavior: "smooth" });
  }
  function showFatal() {
    const el = document.getElementById("content") || document.body;
    el.innerHTML = `<div class="container"><div class="card">
      <h2 style="color:#c1272d">⚠️ भाषा फाइलें लोड नहीं हुईं</h2>
      <p>script tags, lowercase नाम, Console (F12) में 404 जाँचें।</p></div></div>`;
  }

  return { renderDaily, renderMonthly, renderRashifal, calcRashi, showHoroscope };
})();
