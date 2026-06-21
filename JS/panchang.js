// ====== पंचांग गणना लॉजिक ======
const Panchang = {
    // लुकअप टेबल
    rashis: ['मेष','वृषभ','मिथुन','कर्क','सिंह','कन्या','तुला','वृश्चिक','धनु','मकर','कुंभ','मीन'],
    nakshatras: ['अश्विनी','भरणी','कृत्तिका','रोहिणी','मृगशिरा','आर्द्रा','पुनर्वसु','पुष्य','आश्लेषा','मघा','पूर्वाफाल्गुनी','उत्तराफाल्गुनी','हस्त','चित्रा','स्वाती','विशाखा','अनुराधा','ज्येष्ठा','मूल','पूर्वाषाढ़ा','उत्तराषाढ़ा','श्रवण','धनिष्ठा','शतभिषा','पूर्वाभाद्रपदा','उत्तराभाद्रपदा','रेवती'],
    tithiNames: ['प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','पूर्णिमा','प्रतिपदा','द्वितीया','तृतीया','चतुर्थी','पंचमी','षष्ठी','सप्तमी','अष्टमी','नवमी','दशमी','एकादशी','द्वादशी','त्रयोदशी','चतुर्दशी','अमावस्या'],
    weekdays: ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'],
    yogaNames: ['विष्कुम्भ','प्रीति','आयुष्मान','सौभाग्य','शोभन','अतिगण्ड','सुकर्मा','धृति','शूल','गण्ड','वृद्धि','ध्रुव','व्याघात','हर्षण','वज्र','सिद्धि','व्यतिपात','वरियान','परिघ','शिव','सिद्ध','साध्य','शुभ','शुक्ल','ब्रह्म','इन्द्र','वैधृति'],
    karanNames: ['बव','बालव','कौलव','तैतिल','गर','वणिज','विष्टि','शकुनी','चतुष्पाद','नाग','किंस्तुघ्न'],
    monthNames: ['चैत्र','वैशाख','ज्येष्ठ','आषाढ़','श्रावण','भाद्रपद','अश्विन','कार्तिक','अग्रहायण','पौष','माघ','फाल्गुन'],

    // जूलियन दिन
    julianDay: function(year, month, day) {
        if (month <= 2) { year--; month += 12; }
        let A = Math.floor(year / 100);
        let B = 2 - A + Math.floor(A / 4);
        return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
    },

    // सूर्य देशांतर
    sunLongitude: function(jd) {
        const D = jd - 2451545.0;
        const g = (357.529 + 0.98560028 * D) % 360;
        const q = (280.459 + 0.98564736 * D) % 360;
        const L = q + 1.915 * Math.sin(g * Math.PI / 180) + 0.020 * Math.sin(2 * g * Math.PI / 180);
        return ((L % 360) + 360) % 360;
    },

    // चंद्र देशांतर
    moonLongitude: function(jd) {
        const D = jd - 2451545.0;
        const Lp = (218.316 + 13.176396 * D) % 360;
        const M = (134.963 + 13.064993 * D) % 360;
        const N = (93.272 + 13.229350 * D) % 360;
        const E = Lp + 6.289 * Math.sin(M * Math.PI / 180) + 1.274 * Math.sin((2 * N - M) * Math.PI / 180);
        return ((E % 360) + 360) % 360;
    },

    // मुख्य पंचांग गणना
    getPanchang: function(year, month, day) {
        const jd = this.julianDay(year, month + 1, day);
        const sunLon = this.sunLongitude(jd);
        const moonLon = this.moonLongitude(jd);
        const sunLonNorm = (sunLon + 360) % 360;
        const moonLonNorm = (moonLon + 360) % 360;

        const moonRashi = this.rashis[Math.floor(moonLonNorm / 30)];
        const sunRashi = this.rashis[Math.floor(sunLonNorm / 30)];
        const nakshatra = this.nakshatras[Math.floor(moonLonNorm / (360/27))];

        let diff = (moonLonNorm - sunLonNorm + 360) % 360;
        let tithiIdx = Math.floor(diff / 12);
        const tithi = this.tithiNames[tithiIdx];

        // पक्ष
        const paksh = (tithiIdx < 15) ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';

        // योग
        const yogaSum = (sunLonNorm + moonLonNorm) % 360;
        const yogaIdx = Math.floor(yogaSum / (360/27));
        const yoga = this.yogaNames[yogaIdx % 27];

        // करण
        const karanIdx = Math.floor((diff / 6) % 11);
        const karan = this.karanNames[karanIdx % 11];

        const weekday = this.weekdays[new Date(year, month, day).getDay()];
        const monthIdx = Math.floor(sunLonNorm / 30);
        const hinduMonth = this.monthNames[monthIdx % 12];

        return {
            tithi, nakshatra, weekday, sunRashi, moonRashi, yoga, karan,
            paksh, hinduMonth, sunLonNorm, moonLonNorm, jd,
            tithiIdx, diff
        };
    },

    // पूरे महीने के लिए
    getMonthPanchang: function(year, month) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const result = [];
        for (let d = 1; d <= daysInMonth; d++) {
            result.push({
                date: d,
                ...this.getPanchang(year, month, d)
            });
        }
        return result;
    }
};
