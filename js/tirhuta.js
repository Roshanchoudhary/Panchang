/* ===========================================================
   Tirhuta Converter - Complete Version
   मैथिली देवनागरी → तिरहुता लिपि कन्वर्टर
   =========================================================== */

(function() {

    'use strict';

    // ============================================================
    // 1. COMPLETE MAPPING
    // ============================================================

    const TIRHUTA_MAP = {

        // ----- INDEPENDENT VOWELS (स्वर) -----
        "अ": "𑒁", "आ": "𑒂", "इ": "𑒃", "ई": "𑒄",
        "उ": "𑒅", "ऊ": "𑒆", "ऋ": "𑒇", "ॠ": "𑒈",
        "ऌ": "𑒉", "ॡ": "𑒊", "ए": "𑒋", "ऐ": "𑒌",
        "ओ": "𑒍", "औ": "𑒎",

        // ----- CONSONANTS (व्यंजन) -----
        "क": "𑒏", "ख": "𑒐", "ग": "𑒑", "घ": "𑒒", "ङ": "𑒓",
        "च": "𑒔", "छ": "𑒕", "ज": "𑒖", "झ": "𑒗", "ञ": "𑒘",
        "ट": "𑒙", "ठ": "𑒚", "ड": "𑒛", "ढ": "𑒜", "ण": "𑒝",
        "त": "𑒞", "थ": "𑒟", "द": "𑒠", "ध": "𑒡", "न": "𑒢",
        "प": "𑒣", "फ": "𑒤", "ब": "𑒥", "भ": "𑒦", "म": "𑒧",
        "य": "𑒨", "र": "𑒩", "ल": "𑒪", "व": "𑒫",
        "श": "𑒬", "ष": "𑒭", "स": "𑒮", "ह": "𑒯",

        // ----- DEPENDENT VOWEL SIGNS (मात्राएँ) -----
        "ा": "𑒰", "ि": "𑒱", "ी": "𑒲",
        "ु": "𑒳", "ू": "𑒴", "ृ": "𑒵",
        "ॄ": "𑒶", "ॢ": "𑒷", "ॣ": "𑒸",
        "े": "𑒹", "ै": "𑒺", "ो": "𑒻", "ौ": "𑒼",

        // ----- OTHER SIGNS -----
        "ँ": "𑒿",  // चन्द्रबिन्दु
        "ं": "𑓀",  // अनुस्वार
        "ः": "𑓁",  // विसर्ग
        "्": "𑓂",  // हलंत (Virama)
        "़": "𑓃", 

        // ----- DIGITS (अंक) -----
        "०": "𑓐", "१": "𑓑", "२": "𑓒", "३": "𑓓",
        "४": "𑓔", "५": "𑓕", "६": "𑓖", "७": "𑓗",
        "८": "𑓘", "९": "𑓙",
         "0": "𑓐", "1": "𑓑", "2": "𑓒", "3": "𑓓",
        "4": "𑓔", "5": "𑓕", "6": "𑓖", "7": "𑓗",
        "8": "𑓘", "9": "𑓙",
        // ----- PUNCTUATION (विराम चिह्न) -----
        "।": "𑓇", "॥": "𑓈",
        "·": "·", "—": "—", "–": "–",
        " ": " ",  // स्पेस
        "📍": "📍", "🕉️": "🕉️", "📿": "📿", "⏰": "⏰",
        "📌": "📌", "🔮": "🔮", "✨": "✨", "💍": "💍",
        "🏠": "🏠", "🧱": "🧱", "🏡": "🏡", "👶": "👶",
        "🍚": "🍚", "✂️": "✂️", "👂": "👂", "📚": "📚",
        "✍️": "✍️", "🚗": "🚗", "🏘️": "🏘️", "🏪": "🏪",
        "🏢": "🏢", "🏭": "🏭", "✈️": "✈️", "💊": "💊"
    };

    // ============================================================
    // 2. SPECIAL CONJUNCTS (संयुक्त अक्षर)
    // ============================================================

    const SPECIAL_CONJUNCTS = {
        // देवनागरी → तिरहुता
        "क्ष": "𑒏𑓂𑒭",
        "त्र": "𑒞𑓂𑒩",
        "ज्ञ": "𑒖𑓂𑒘",
        "श्र": "𑒬𑓂𑒩",
        "द्य": "𑒠𑓂𑒨",
        "द्व": "𑒠𑓂𑒫",
        "द्भ": "𑒠𑓂𑒦",
        "द्ध": "𑒠𑓂𑒡",
        "द्ग": "𑒠𑓂𑒑",
        "द्घ": "𑒠𑓂𑒒",
        "द्म": "𑒠𑓂𑒧",
        "द्र": "𑒠𑓂𑒩",
        "द्ल": "𑒠𑓂𑒪",
        "द्व": "𑒠𑓂𑒫",
        "ह्र": "𑒯𑓂𑒩",
        "ह्ल": "𑒯𑓂𑒪",
        "ह्म": "𑒯𑓂𑒧",
        "ह्ण": "𑒯𑓂𑒝",
        "ह्ण": "𑒯𑓂𑒝",
        "ह्ण": "𑒯𑓂𑒝",
        "ग्ध": "𑒑𑓂𑒡",
        "ग्ध": "𑒑𑓂𑒡",
        "ग्घ": "𑒑𑓂𑒒",
        "ग्ण": "𑒑𑓂𑒝",
        "ग्द": "𑒑𑓂𑒠",
        "ग्ध": "𑒑𑓂𑒡",
        "ग्न": "𑒑𑓂𑒢",
        "ग्भ": "𑒑𑓂𑒦",
        "ग्म": "𑒑𑓂𑒧",
        "ग्र": "𑒑𑓂𑒩",
        "ग्ल": "𑒑𑓂𑒪",
        "ग्व": "𑒑𑓂𑒫",
        "ड्ड": "𑒛𑓂𑒛",
        "ड्ढ": "𑒛𑓂𑒜",
        "ण्ट": "𑒝𑓂𑒙",
        "ण्ठ": "𑒝𑓂𑒚",
        "ण्ड": "𑒝𑓂𑒛",
        "ण्ढ": "𑒝𑓂𑒜",
        "ण्ण": "𑒝𑓂𑒝",
        "ण्म": "𑒝𑓂𑒧",
        "ण्य": "𑒝𑓂𑒨",
        "ण्व": "𑒝𑓂𑒫",
        "त्थ": "𑒞𑓂𑒟",
        "त्प": "𑒞𑓂𑒣",
        "त्ब": "𑒞𑓂𑒥",
        "त्भ": "𑒞𑓂𑒦",
        "त्म": "𑒞𑓂𑒧",
        "त्य": "𑒞𑓂𑒨",
        "त्र": "𑒞𑓂𑒩",
        "त्व": "𑒞𑓂𑒫",
        "त्स": "𑒞𑓂𑒮",
        "त्स": "𑒞𑓂𑒮",
        "थ्य": "𑒟𑓂𑒨",
        "द्द": "𑒠𑓂𑒠",
        "द्ध": "𑒠𑓂𑒡",
        "द्न": "𑒠𑓂𑒢",
        "द्ब": "𑒠𑓂𑒥",
        "द्भ": "𑒠𑓂𑒦",
        "द्म": "𑒠𑓂𑒧",
        "द्य": "𑒠𑓂𑒨",
        "द्र": "𑒠𑓂𑒩",
        "द्व": "𑒠𑓂𑒫",
        "द्य": "𑒠𑓂𑒨",
        "द्ध": "𑒠𑓂𑒡",
        "ध्न": "𑒡𑓂𑒢",
        "ध्म": "𑒡𑓂𑒧",
        "ध्य": "𑒡𑓂𑒨",
        "ध्र": "𑒡𑓂𑒩",
        "ध्व": "𑒡𑓂𑒫",
        "न्न": "𑒢𑓂𑒢",
        "न्म": "𑒢𑓂𑒧",
        "न्य": "𑒢𑓂𑒨",
        "न्र": "𑒢𑓂𑒩",
        "न्व": "𑒢𑓂𑒫",
        "प्प": "𑒣𑓂𑒣",
        "प्त": "𑒣𑓂𑒞",
        "प्थ": "𑒣𑓂𑒟",
        "प्न": "𑒣𑓂𑒢",
        "प्य": "𑒣𑓂𑒨",
        "प्र": "𑒣𑓂𑒩",
        "प्ल": "𑒣𑓂𑒪",
        "प्व": "𑒣𑓂𑒫",
        "ब्ब": "𑒥𑓂𑒥",
        "ब्य": "𑒥𑓂𑒨",
        "ब्र": "𑒥𑓂𑒩",
        "ब्ल": "𑒥𑓂𑒪",
        "भ्य": "𑒦𑓂𑒨",
        "भ्र": "𑒦𑓂𑒩",
        "म्न": "𑒧𑓂𑒢",
        "म्प": "𑒧𑓂𑒣",
        "म्फ": "𑒧𑓂𑒤",
        "म्ब": "𑒧𑓂𑒥",
        "म्भ": "𑒧𑓂𑒦",
        "म्म": "𑒧𑓂𑒧",
        "म्य": "𑒧𑓂𑒨",
        "म्र": "𑒧𑓂𑒩",
        "म्ल": "𑒧𑓂𑒪",
        "ल्ल": "𑒪𑓂𑒪",
        "ल्व": "𑒪𑓂𑒫",
        "ल्य": "𑒪𑓂𑒨",
        "ल्ह": "𑒪𑓂𑒯",
        "ष्ट": "𑒭𑓂𑒙",
        "ष्ठ": "𑒭𑓂𑒚",
        "ष्ण": "𑒭𑓂𑒝",
        "ष्प": "𑒭𑓂𑒣",
        "ष्फ": "𑒭𑓂𑒤",
        "ष्ब": "𑒭𑓂𑒥",
        "ष्म": "𑒭𑓂𑒧",
        "ष्य": "𑒭𑓂𑒨",
        "ष्व": "𑒭𑓂𑒫",
        "स्क": "𑒮𑓂𑒏",
        "स्ख": "𑒮𑓂𑒐",
        "स्ग": "𑒮𑓂𑒑",
        "स्घ": "𑒮𑓂𑒒",
        "स्च": "𑒮𑓂𑒔",
        "स्छ": "𑒮𑓂𑒕",
        "स्ज": "𑒮𑓂𑒖",
        "स्झ": "𑒮𑓂𑒗",
        "स्ट": "𑒮𑓂𑒙",
        "स्ठ": "𑒮𑓂𑒚",
        "स्ड": "𑒮𑓂𑒛",
        "स्ढ": "𑒮𑓂𑒜",
        "स्ण": "𑒮𑓂𑒝",
        "स्त": "𑒮𑓂𑒞",
        "स्थ": "𑒮𑓂𑒟",
        "स्द": "𑒮𑓂𑒠",
        "स्ध": "𑒮𑓂𑒡",
        "स्न": "𑒮𑓂𑒢",
        "स्प": "𑒮𑓂𑒣",
        "स्फ": "𑒮𑓂𑒤",
        "स्ब": "𑒮𑓂𑒥",
        "स्भ": "𑒮𑓂𑒦",
        "स्म": "𑒮𑓂𑒧",
        "स्य": "𑒮𑓂𑒨",
        "स्र": "𑒮𑓂𑒩",
        "स्ल": "𑒮𑓂𑒪",
        "स्व": "𑒮𑓂𑒫",
        "ह्ण": "𑒯𑓂𑒝",
        "ह्न": "𑒯𑓂𑒢",
        "ह्म": "𑒯𑓂𑒧",
        "ह्य": "𑒯𑓂𑒨",
        "ह्र": "𑒯𑓂𑒩",
        "ह्ल": "𑒯𑓂𑒪",
        "ह्व": "𑒯𑓂𑒫",
        "क्क": "𑒏𑓂𑒏",
        "क्ट": "𑒏𑓂𑒙",
        "क्त": "𑒏𑓂𑒞",
        "क्थ": "𑒏𑓂𑒟",
        "क्न": "𑒏𑓂𑒢",
        "क्प": "𑒏𑓂𑒣",
        "क्फ": "𑒏𑓂𑒤",
        "क्ब": "𑒏𑓂𑒥",
        "क्म": "𑒏𑓂𑒧",
        "क्य": "𑒏𑓂𑒨",
        "क्र": "𑒏𑓂𑒩",
        "क्ल": "𑒏𑓂𑒪",
        "क्व": "𑒏𑓂𑒫",
        "क्ष": "𑒏𑓂𑒭",
        "ख्य": "𑒐𑓂𑒨",
        "ख्र": "𑒐𑓂𑒩",
        "ग्ल": "𑒑𑓂𑒪",
        "ग्र": "𑒑𑓂𑒩",
        "ग्व": "𑒑𑓂𑒫",
        "घ्न": "𑒒𑓂𑒢",
        "घ्र": "𑒒𑓂𑒩",
        "घ्व": "𑒒𑓂𑒫",
        "ङ्क": "𑒓𑓂𑒏",
        "ङ्ख": "𑒓𑓂𑒐",
        "ङ्ग": "𑒓𑓂𑒑",
        "ङ्घ": "𑒓𑓂𑒒",
        "ङ्म": "𑒓𑓂𑒧",
        "ङ्य": "𑒓𑓂𑒨",
        "च्च": "𑒔𑓂𑒔",
        "च्छ": "𑒔𑓂𑒕",
        "च्य": "𑒔𑓂𑒨",
        "च्र": "𑒔𑓂𑒩",
        "ज्ज": "𑒖𑓂𑒖",
        "ज्झ": "𑒖𑓂𑒗",
        "ज्ञ": "𑒖𑓂𑒘",
        "ज्य": "𑒖𑓂𑒨",
        "ज्र": "𑒖𑓂𑒩",
        "ज्व": "𑒖𑓂𑒫",
        "ञ्च": "𑒘𑓂𑒔",
        "ञ्छ": "𑒘𑓂𑒕",
        "ञ्ज": "𑒘𑓂𑒖",
        "ञ्झ": "𑒘𑓂𑒗",
        "ञ्य": "𑒘𑓂𑒨",
        "ट्ट": "𑒙𑓂𑒙",
        "ट्ठ": "𑒙𑓂𑒚",
        "ट्य": "𑒙𑓂𑒨",
        "ट्र": "𑒙𑓂𑒩",
        "ड्ड": "𑒛𑓂𑒛",
        "ड्ढ": "𑒛𑓂𑒜",
        "ड्य": "𑒛𑓂𑒨",
        "ड्र": "𑒛𑓂𑒩",
        "ढ्य": "𑒜𑓂𑒨",
        "ण्ट": "𑒝𑓂𑒙",
        "ण्ठ": "𑒝𑓂𑒚",
        "ण्ड": "𑒝𑓂𑒛",
        "ण्ढ": "𑒝𑓂𑒜",
        "ण्ण": "𑒝𑓂𑒝",
        "ण्म": "𑒝𑓂𑒧",
        "ण्य": "𑒝𑓂𑒨",
        "ण्व": "𑒝𑓂𑒫",
        "त्थ": "𑒞𑓂𑒟",
        "त्प": "𑒞𑓂𑒣",
        "त्ब": "𑒞𑓂𑒥",
        "त्म": "𑒞𑓂𑒧",
        "त्य": "𑒞𑓂𑒨",
        "त्र": "𑒞𑓂𑒩",
        "त्व": "𑒞𑓂𑒫",
        "त्स": "𑒞𑓂𑒮"
       "ढ़": "𑒜𑓃"
    };

    // ============================================================
    // 3. CONVERTER FUNCTIONS
    // ============================================================

    function replaceSpecialConjuncts(text) {
        if (!text) return "";
        let result = text;
        // सबसे लंबे से शुरू करें
        const keys = Object.keys(SPECIAL_CONJUNCTS).sort((a, b) => b.length - a.length);
        for (const key of keys) {
            result = result.split(key).join(SPECIAL_CONJUNCTS[key]);
        }
        return result;
    }

    function convertUsingMap(text, map) {
        if (!text) return "";
        let result = text;
        // सबसे लंबे से शुरू करें
        const keys = Object.keys(map).sort((a, b) => b.length - a.length);
        for (const key of keys) {
            result = result.split(key).join(map[key]);
        }
        return result;
    }

    function devanagariToTirhuta(text) {
        if (!text) return "";
        
        // Step 1: पहले स्पेशल कंजंक्ट्स
        let result = replaceSpecialConjuncts(text);
        
        // Step 2: बाकी मैपिंग
        result = convertUsingMap(result, TIRHUTA_MAP);
        
        return result;
    }

    // ============================================================
    // 4. DOM CONVERTER
    // ============================================================

    function convertTextNode(node) {
        if (!node || !node.nodeValue) return;
        // सिर्फ देवनागरी टेक्स्ट को ही कन्वर्ट करें
        const devanagariRegex = /[\u0900-\u097F]/;
        if (devanagariRegex.test(node.nodeValue)) {
            node.nodeValue = devanagariToTirhuta(node.nodeValue);
        }
    }

    function walkDOM(node) {
        if (!node) return;
        
        // Text node
        if (node.nodeType === Node.TEXT_NODE) {
            convertTextNode(node);
            return;
        }
        
        // Element node
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        
        // इन टैग्स को छोड़ें
        const tag = node.tagName.toLowerCase();
        const skipTags = ['script', 'style', 'textarea', 'pre', 'code', 'noscript', 'template'];
        if (skipTags.includes(tag)) return;
        
        // input, select, button के value को न बदलें
        if (tag === 'input' || tag === 'select' || tag === 'button') {
            return;
        }
        
        // सभी child nodes को process करें
        for (let i = 0; i < node.childNodes.length; i++) {
            walkDOM(node.childNodes[i]);
        }
    }

    function convertPageToTirhuta(root) {
        root = root || document.body;
        if (!root) return;
        walkDOM(root);
        
        // Placeholders को कन्वर्ट करें
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
            if (el.placeholder && /[\u0900-\u097F]/.test(el.placeholder)) {
                el.placeholder = devanagariToTirhuta(el.placeholder);
            }
        });
    }

    // ============================================================
    // 5. OBSERVER FOR DYNAMIC CONTENT
    // ============================================================

    let observer = null;

    function startObserver() {
        if (observer) {
            observer.disconnect();
        }
        
        observer = new MutationObserver(function(mutations) {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        convertTextNode(node);
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        // नए element को process करें
                        walkDOM(node);
                    }
                }
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    // ============================================================
    // 6. ENABLE / DISABLE FUNCTIONS
    // ============================================================

   function applyTirhutaFont() {
    document.documentElement.classList.add('tirhuta-font');
    document.documentElement.classList.add('lang-mai');

    // --- FONT KO DIRECT INJECT KAREIN ---
    if (!document.getElementById('tirhuta-inline-font')) {
        const fontStyle = document.createElement('style');
        fontStyle.id = 'tirhuta-inline-font';
        fontStyle.textContent = `
            @font-face {
                font-family: 'MithilaUni';
                src: url('../fonts/MithilaUni.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
            }
            .tirhuta-font, .tirhuta-font * {
                font-family: 'MithilaUni', 'Noto Sans Tirhuta', sans-serif !important;
            }
            .lang-mai.tirhuta-font .date-hero {
                font-size: 1.4em !important;
                line-height: 1.8 !important;
            }
        `;
        document.head.appendChild(fontStyle);
        console.log('✅ फ़ॉन्ट सीधे इंजेक्ट किया गया!');
    }
}
    // ============================================================
    // 7. TOGGLE FUNCTION
    // ============================================================

    function toggleTirhuta() {
        const isActive = document.documentElement.classList.contains('tirhuta-font');
        if (isActive) {
            disableTirhuta();
            return false;
        } else {
            enableTirhuta();
            return true;
        }
    }

    // ============================================================
    // 8. EXPORT
    // ============================================================

    window.TIRHUTA_MAP = TIRHUTA_MAP;
    window.SPECIAL_CONJUNCTS = SPECIAL_CONJUNCTS;
    window.devanagariToTirhuta = devanagariToTirhuta;
    window.convertPageToTirhuta = convertPageToTirhuta;
    window.enableTirhuta = enableTirhuta;
    window.disableTirhuta = disableTirhuta;
    window.toggleTirhuta = toggleTirhuta;
    window.startTirhutaObserver = startObserver;
    window.stopTirhutaObserver = stopObserver;

    // ============================================================
    // 9. AUTO-INITIALIZE ON PAGE LOAD
    // ============================================================

    document.addEventListener('DOMContentLoaded', function() {
        // चेक करें कि पेज मैथिली है या नहीं
        const lang = document.documentElement.lang || 'hi';
        if (lang === 'mai') {
            const script = localStorage.getItem('maiScript') || 'deva';
            if (script === 'tirhuta') {
                enableTirhuta();
            }
        }
    });

    console.log('📜 तिरहुता कन्वर्टर लोड हुआ (Tirhuta Converter loaded)');

})();
// ============================================================
// 10. FORCE APPLY - हमेशा काम करेगा
// ============================================================

(function forceApply() {
    console.log('🔥 FORCE APPLY RUNNING...');
    
    // सीधे CSS इंजेक्ट करें
    const style = document.createElement('style');
    style.id = 'tirhuta-force-style';
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tirhuta&display=swap');
        .tirhuta-font, .tirhuta-font * {
            font-family: 'Noto Sans Tirhuta', 'MithilaUni', sans-serif !important;
        }
        .lang-mai.tirhuta-font .date-hero {
            font-size: 1.4em !important;
            line-height: 1.8 !important;
        }
        .lang-mai.tirhuta-font .grid .pitem {
            font-size: 1.2em !important;
        }
        .lang-mai.tirhuta-font .cal-cell {
            font-size: 1.1em !important;
        }
    `;
    document.head.appendChild(style);
    console.log('✅ CSS इंजेक्ट हो गया!');
    
    // क्लास ऐड करें
    document.documentElement.classList.add('tirhuta-font');
    document.documentElement.classList.add('lang-mai');
    console.log('✅ क्लास ऐड हो गई!');
    
    // कन्वर्ट करें
    if (typeof window.convertPageToTirhuta === 'function') {
        setTimeout(function() {
            window.convertPageToTirhuta(document.body);
            console.log('✅ कन्वर्जन हो गया!');
        }, 200);
    }
})();
