// ====== यूज़र लॉगिन सिस्टम (LocalStorage आधारित) ======
const Auth = {
    users: {},
    currentUser: null,

    init: function() {
        // स्टोरेज से यूज़र लोड करें
        const saved = localStorage.getItem('panchang_users');
        if (saved) {
            this.users = JSON.parse(saved);
        }
        const current = localStorage.getItem('panchang_current_user');
        if (current) {
            this.currentUser = JSON.parse(current);
        }
        this.updateUI();
    },

    save: function() {
        localStorage.setItem('panchang_users', JSON.stringify(this.users));
        if (this.currentUser) {
            localStorage.setItem('panchang_current_user', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('panchang_current_user');
        }
    },

    register: function(username, password) {
        if (this.users[username]) {
            return { success: false, message: 'यह यूज़रनेम पहले से मौजूद है' };
        }
        if (username.length < 3 || password.length < 4) {
            return { success: false, message: 'यूज़रनेम 3+ और पासवर्ड 4+ अक्षर का होना चाहिए' };
        }
        this.users[username] = { password: password, created: new Date().toISOString() };
        this.save();
        return { success: true, message: 'रजिस्टर सफल! अब लॉगिन करें' };
    },

    login: function(username, password) {
        if (!this.users[username]) {
            return { success: false, message: 'यूज़र नहीं मिला' };
        }
        if (this.users[username].password !== password) {
            return { success: false, message: 'गलत पासवर्ड' };
        }
        this.currentUser = { username: username };
        this.save();
        this.updateUI();
        return { success: true, message: 'लॉगिन सफल! 🙏' };
    },

    logout: function() {
        this.currentUser = null;
        localStorage.removeItem('panchang_current_user');
        this.updateUI();
        return { success: true, message: 'लॉगआउट किया गया' };
    },

    isLoggedIn: function() {
        return this.currentUser !== null;
    },

    updateUI: function() {
        const userEl = document.getElementById('userDisplay');
        const loginLink = document.getElementById('loginLink');
        if (this.isLoggedIn()) {
            if (userEl) userEl.textContent = '🙏 ' + this.currentUser.username;
            if (loginLink) loginLink.textContent = '🚪 लॉगआउट';
        } else {
            if (userEl) userEl.textContent = '';
            if (loginLink) loginLink.textContent = '🔑 लॉगिन';
        }
    }
};

// पेज लोड होने पर Auth इनिशियलाइज़ करें
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
});
