/* app.js — Shared controller. Reads ?lang= , renders daily/monthly/rashifal.
   Depends on: PanchangCore, Calendars, Rashifal, window.I18N */

const App = (function () {

  const LANG_ORDER = ["as","bn","brx","doi","gu","hi","kn","ks","kok","mai","ml","mni","mr","ne","or","pa","sa","sat","sd","ta","te","ur"];

  function getLang() {
    const p = new URLSearchParams(location.search).get("lang");
    return (p && window.I18N[p]) ? p : "hi";
  }

  // localize digits using the language's digit set
  function digits(lang, val) {
    const d = window.I18N[lang]?.meta?.digits;
    if (!d) return String(val);
    return String(val).replace(/[0-9]/g, n => d[+n]);
  }

  function fmtTime(lang, date) {
    if (!date) return "—";
    let h = date.getHours(), m = date.getMinutes();
    const ap = h < 12 ? "AM" : "PM"; const h12 = h % 12 || 12;
    return digits(lang, h12) + ":" + digits(lang, (m<10?"0":"")+m) + " " + ap;
  }
  function fmtRange(lang, p) { return p ? fmtTime(lang,p.start)+" – "+fmtTime(lang,p.end) : "—"; }

  // Header + language bar builder (shared)
  function buildChrome(lang, activeTab) {
    const L = window.I18N[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = L.meta.dir;
    const host = document.getElementById("chrome");
    if (!host) return;
    const langBar = LANG_ORDER.map(code => {
      const nm = window.I18N[code] ? window.I18N[code].meta.name : code;
      const cls = code === lang ? "active" : "";
      const page = location.pathname.split("/").pop() || "daily.html";
      return `<a class="${cls}" href="${page}?lang=${code}">${nm}</a>`;
    }).join("");
    const tab = (id,label,file)=>`<a class="${activeTab===id?'active':''}" href="${file}?lang=${lang}">${label}</a>`;
    host.innerHTML = `
      <header>
        <span class="om">🕉️</span>
        <h1>${L.ui.site}</h1>
        <div class="region">📍 ${L.meta.region}</div>
      </header>
      <div class="lang-bar">${langBar}</div>
      <nav class="tabs">
        ${tab("daily",L.ui.daily,"daily.html")}
        ${tab("monthly",L.ui.monthly,"monthly.html")}
        ${tab("rashifal",L.ui.rashifal,"rashifal.html")}
      </nav>`;
  }

  // ---- Month name resolution per calendar type ----
  function monthName(lang, date, panchang) {
    const L = window.I18N[lang];
    const cal = L.meta.calendar;
    if (cal === "bangla-solar") {
      const b = Calendars.banglaDate(date);
      return { name: L.maasa_solar[b.monthIndex], day: b.day, year: b.year };
    }
    if (cal === "tamil-solar") {
      const td = Calendars.tamilDate(date);
      return { name: L.maasa_solar[ttIdx(td.monthIndex)], day: td.day, year: null };
    }
    if (cal === "malayalam-solar") {
      const md = Calendars.malayalamDate(date);
      return { name: L.maasa_solar[md.monthIndex], day: md.day, year: md.year };
    }
    // lunar (purnimanta / amanta / gujarati)
    const mIdx = (cal === "purnimanta")
      ? Calendars.purnimantaMonth(date)
      : Calendars.amantaMonth(date);
    const arr = L.maasa_lunar || L.maasa_solar;
    return { name: arr[mIdx], day: panchang.tithi.inPaksha + 1, year: null };
  }
  function ttIdx(i){return i;} function tIdx(i){return i;} // tamil months already Chithirai-first

  function localDateString(lang, date, panchang) {
    const L = window.I18N[lang];
    const mn = monthName(lang, date, panchang);
    let s = "";
    if (L.meta.calendar.endsWith("solar")) {
      s = digits(lang, mn.day) + " " + mn.name;
      if (mn.year) s += " " + digits(lang, mn.year);
      if (L.meta.era === "bangabda") s += " বঙ্গাব্দ";
    } else {
      s = mn.name + " " + L.paksha[panchang.tithi.paksha] + " " +
          L.tithi[panchang.tithi.index];
    }
    return s;
  }

  function pitem(label, value, sub) {
    return `<div class="pitem"><div class="label">${label}</div>
            <div class="value">${value}</div>${sub?`<div class="sub">${sub}</div>`:""}</div>`;
  }

  // ---------- DAILY PAGE ----------
  function renderDaily() {
    const lang = getLang(); const L = window.I18N[lang];
    buildChrome(lang, "daily");
    const now = new Date();
    const { lat, lon } = L.meta;
    const p = PanchangCore.daily(now, lat, lon);
    const el = document.getElementById("content");

    const greg = digits(lang, now.getDate()) + " / " + digits(lang,(now.getMonth()+1)) + " / " + digits(lang, now.getFullYear());
    const local = localDateString(lang, now, p);

    el.innerHTML = `
      <div class="container">
        <div class="card">
          <div class="date-hero">
            <div class="greg">${greg} · ${L.vaara[p.vaara]}</div>
            <div class="local">📿 ${local}</div>
          </div>
          <div class="grid">
            ${pitem(L.labels.tithi, L.paksha[p.tithi.paksha]+" "+L.tithi[p.tithi.index])}
            ${pitem(L.labels.nakshatra, L.nakshatra[p.nakshatra.index], L.labels.pada+" "+digits(lang,p.nakshatra.pada))}
            ${pitem(L.labels.yoga, L.yoga[p.yoga.index])}
            ${pitem(L.labels.karana, L.karana[p.karana.index])}
            ${pitem(L.labels.vaara, L.vaara[p.vaara])}
            ${pitem(L.labels.sunrise, fmtTime(lang,p.sunrise))}
            ${pitem(L.labels.sunset, fmtTime(lang,p.sunset))}
            ${pitem(L.labels.moonrise, fmtTime(lang,p.moonrise))}
            ${pitem(L.labels.ayanamsha, digits(lang, p.ayanamsha.toFixed(2))+"°")}
          </div>
        </div>
        <div class="card">
          <h2>⏰ ${L.ui.muhurat}</h2>
          <div class="grid">
            ${pitem(L.labels.abhijit, fmtRange(lang,p.abhijit))}
            ${pitem(L.labels.rahu, fmtRange(lang,p.rahu))}
            ${pitem(L.labels.gulika, fmtRange(lang,p.gulika))}
            ${pitem(L.labels.yamaganda, fmtRange(lang,p.yamaganda))}
          </div>
          <div class="note">${L.meta.region} · Lahiri Ayanamsha · astronomy-engine</div>
        </div>
      </div>`;
  }

  // ---------- MONTHLY PAGE ----------
  let calDate = new Date();
  function renderMonthly() {
    const lang = getLang(); const L = window.I18N[lang];
    buildChrome(lang, "monthly");
    const el = document.getElementById("content");
    el.innerHTML = `<div class="container"><div class="card">
      <div class="cal-head">
        <button id="prevM">‹</button>
        <span class="cal-title" id="calTitle"></span>
        <button id="nextM">›</button>
      </div>
      <div class="calendar" id="cal"></div>
    </div><div class="card" id="detail" style="display:none"></div></div>`;
    document.getElementById("prevM").onclick=()=>{calDate.setMonth(calDate.getMonth()-1);drawCal(lang);};
    document.getElementById("nextM").onclick=()=>{calDate.setMonth(calDate.getMonth()+1);drawCal(lang);};
    drawCal(lang);
  }
  function drawCal(lang) {
    const L = window.I18N[lang]; const { lat, lon } = L.meta;
    const y=calDate.getFullYear(), mo=calDate.getMonth();
    document.getElementById("calTitle").textContent =
      new Intl.DateTimeFormat("en-IN",{month:"long",year:"numeric"}).format(calDate);
    const cal=document.getElementById("cal"); cal.innerHTML="";
    L.vaara.forEach(v=>{const e=document.createElement("div");e.className="cal-dn";e.textContent=v.slice(0,2);cal.appendChild(e);});
    const first=new Date(y,mo,1).getDay(), dim=new Date(y,mo+1,0).getDate(), today=new Date();
    for(let i=0;i<first;i++){const e=document.createElement("div");e.className="cal-cell empty";cal.appendChild(e);}
    for(let d=1;d<=dim;d++){
      const cd=new Date(y,mo,d);
      const p=PanchangCore.daily(cd,lat,lon);
      const cell=document.createElement("div"); cell.className="cal-cell";
      if(d===today.getDate()&&mo===today.getMonth()&&y===today.getFullYear())cell.classList.add("today");
      cell.innerHTML=`<span class="lnum">${digits(lang,p.tithi.inPaksha+1)}</span>
        <div class="num">${digits(lang,d)}</div>
        <div class="tithi">${L.tithi[p.tithi.index]}</div>`;
      cell.onclick=()=>showDetail(lang,cd);
      cal.appendChild(cell);
    }
  }
  function showDetail(lang,cd){
    const L=window.I18N[lang]; const {lat,lon}=L.meta;
    const p=PanchangCore.daily(cd,lat,lon);
    const box=document.getElementById("detail"); box.style.display="block";
    box.innerHTML=`<h2>📌 ${L.ui.dayDetail} — ${digits(lang,cd.getDate())}/${digits(lang,cd.getMonth()+1)}</h2>
      <div class="grid">
        ${pitem(L.labels.tithi,L.paksha[p.tithi.paksha]+" "+L.tithi[p.tithi.index])}
        ${pitem(L.labels.nakshatra,L.nakshatra[p.nakshatra.index])}
        ${pitem(L.labels.yoga,L.yoga[p.yoga.index])}
        ${pitem(L.labels.karana,L.karana[p.karana.index])}
        ${pitem(L.labels.sunrise,fmtTime(lang,p.sunrise))}
        ${pitem(L.labels.sunset,fmtTime(lang,p.sunset))}
      </div>`;
    box.scrollIntoView({behavior:"smooth"});
  }

  // ---------- RASHIFAL PAGE ----------
  function renderRashifal() {
    const lang=getLang(); const L=window.I18N[lang];
    buildChrome(lang,"rashifal");
    const el=document.getElementById("content");
    const tiles = L.rashi.map((nm,i)=>`
      <div class="rashi-tile" onclick="App.showHoroscope('${lang}',${i})">
        <div class="sym">${L.rashiSymbols[i]}</div><div class="nm">${nm}</div>
      </div>`).join("");
    el.innerHTML=`<div class="container">
      <div class="card">
        <h2>🔮 ${L.ui.yourRashi} — ${L.ui.moonSign}</h2>
        <div class="form-row">
          <label>${L.ui.birthDate}<input type="date" id="bDate"></label>
          <label>${L.ui.birthTime}<input type="time" id="bTime"></label>
          <label>${L.ui.birthCity}
            <select id="bCity"></select>
          </label>
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
    fillCities();
  }

  // Sample city list with coordinates (extend as needed)
  const CITIES = [
    ["Delhi",28.61,77.21],["Mumbai",19.08,72.88],["Kolkata",22.57,88.36],
    ["Chennai",13.08,80.27],["Bengaluru",12.97,77.59],["Hyderabad",17.38,78.49],
    ["Ahmedabad",23.03,72.58],["Patna",25.59,85.14],["Guwahati",26.14,91.74],
    ["Bhubaneswar",20.30,85.82],["Thiruvananthapuram",8.52,76.94],["Srinagar",34.08,74.80],
    ["Jaipur",26.91,75.79],["Lucknow",26.85,80.95],["Kathmandu",27.70,85.32]
  ];
  function fillCities(){
    const sel=document.getElementById("bCity"); if(!sel)return;
    sel.innerHTML=CITIES.map((c,i)=>`<option value="${i}">${c[0]}</option>`).join("");
  }

  function calcRashi(lang){
    const L=window.I18N[lang];
    const dv=document.getElementById("bDate").value;
    const tv=document.getElementById("bTime").value||"12:00";
    const ci=+document.getElementById("bCity").value;
    if(!dv){document.getElementById("rashiOut").innerHTML=`<div class="note">${L.ui.birthDate} ?</div>`;return;}
    const [Y,M,D]=dv.split("-").map(Number);
    const [h,m]=tv.split(":").map(Number);
    const city=CITIES[ci];
    // Build a Date in IST (approx) then let astronomy-engine use UTC internally
    const birth=new Date(Y,M-1,D,h,m);
    const r=Rashifal.janmaRashi(birth,city[1],city[2]);
    const idx=r.rashiIndex;
    document.getElementById("rashiOut").innerHTML=`
      <div class="rashi-result">
        <div class="big">${L.rashiSymbols[idx]} ${L.rashi[idx]}</div>
        <div>${L.labels.nakshatra}: ${L.nakshatra[r.nakshatra.index]} (${L.labels.pada} ${digits(lang,r.nakshatra.pada)})</div>
      </div>`;
    showHoroscope(lang, idx);
  }

  function showHoroscope(lang, idx){
    const L=window.I18N[lang];
    const hi=Rashifal.dailyHoroscopeIndex(idx,new Date());
    const text=L.horoscope.templates[hi % L.horoscope.templates.length];
    document.getElementById("horoOut").innerHTML=`
      <div class="rashi-result">
        <div class="big">${L.rashiSymbols[idx]} ${L.rashi[idx]}</div>
        <p style="margin-top:10px">${text}</p>
      </div>`;
    document.getElementById("horoOut").scrollIntoView({behavior:"smooth"});
  }

  return { renderDaily, renderMonthly, renderRashifal, calcRashi, showHoroscope };
})();
