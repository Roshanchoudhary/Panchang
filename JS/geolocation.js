// ====== शहर ऑटो-डिटेक्ट ======
const GeoLocation = {
    city: 'दिल्ली',
    lat: 28.6139,
    lon: 77.2090,
    loaded: false,

    detect: function(callback) {
        // 1. IP Geolocation API (निःशुल्क)
        fetch('https://ipapi.co/json/')
            .then(res => {
                if (!res.ok) throw new Error('API failed');
                return res.json();
            })
            .then(data => {
                this.city = data.city || data.region || 'दिल्ली';
                this.lat = parseFloat(data.latitude) || 28.6139;
                this.lon = parseFloat(data.longitude) || 77.2090;
                this.loaded = true;
                if (callback) callback(this.city, this.lat, this.lon);
            })
            .catch(() => {
                // 2. बैकअप: IPInfo.io
                fetch('https://ipinfo.io/json')
                    .then(res => res.json())
                    .then(data => {
                        this.city = data.city || 'दिल्ली';
                        const loc = data.loc ? data.loc.split(',') : [28.6139, 77.2090];
                        this.lat = parseFloat(loc[0]) || 28.6139;
                        this.lon = parseFloat(loc[1]) || 77.2090;
                        this.loaded = true;
                        if (callback) callback(this.city, this.lat, this.lon);
                    })
                    .catch(() => {
                        // 3. डिफ़ॉल्ट (दिल्ली)
                        if (callback) callback(this.city, this.lat, this.lon);
                    });
            });
    },

    // HTML में सिटी दिखाने के लिए
    updateUI: function() {
        const badges = document.querySelectorAll('.city-badge');
        badges.forEach(el => {
            if (el) el.textContent = '📍 ' + this.city;
        });
    }
};

// पेज लोड होने पर डिटेक्ट करें
document.addEventListener('DOMContentLoaded', function() {
    GeoLocation.detect(function(city, lat, lon) {
        GeoLocation.updateUI();
        console.log('शहर:', city, 'अक्षांश:', lat, 'देशांतर:', lon);
    });
});
