const API_URL =
"https://script.google.com/macros/s/AKfycby49zpeFTHirUTn2X5PSvGk7zJtee-jsddtVNJV2kD3_VLm6obM4WJJCb1emV8dLo3O/exec";

async function loadPanchang(language = "en") {

const response = await fetch(API_URL);
const data = await response.json();

const today = new Date().toISOString().split("T")[0];

const row = data.find(r =>
r.Date === today &&
r.Language === language
);

if (!row) {
document.getElementById("content").innerHTML =
"<h2>No Panchang Available</h2>";
return;
}

document.getElementById("content").innerHTML = ` <div class="card"> <h2>${row.Date}</h2>

```
  <p><b>Tithi:</b> ${row.Tithi}</p>
  <p><b>Nakshatra:</b> ${row.Nakshatra}</p>
  <p><b>Yoga:</b> ${row.Yoga}</p>
  <p><b>Karana:</b> ${row.Karana}</p>

  <p><b>Sunrise:</b> ${row.Sunrise}</p>
  <p><b>Sunset:</b> ${row.Sunset}</p>

  <p><b>Rahu Kaal:</b> ${row.Rahu_Kaal}</p>
  <p><b>Yamaganda:</b> ${row.Yamaganda}</p>

  <p><b>Festival:</b> ${row.Festival || "-"}</p>
  <p><b>Vrat:</b> ${row.Vrat || "-"}</p>

  <p>${row.Description}</p>
</div>
```

`;
}

loadPanchang("en");
