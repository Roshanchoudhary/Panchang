/* ===========================================================
   Tirhuta Converter
   Part 1 : Base + Complete Mapping
   =========================================================== */

(function () {

const TIRHUTA_MAP = {

    /* Independent Vowels */

    "अ":"𑒁",
    "आ":"𑒂",
    "इ":"𑒃",
    "ई":"𑒄",
    "उ":"𑒅",
    "ऊ":"𑒆",
    "ऋ":"𑒇",
    "ॠ":"𑒈",
    "ऌ":"𑒉",
    "ॡ":"𑒊",
    "ए":"𑒋",
    "ऐ":"𑒌",
    "ओ":"𑒍",
    "औ":"𑒎",

    /* Consonants */

    "क":"𑒏",
    "ख":"𑒐",
    "ग":"𑒑",
    "घ":"𑒒",
    "ङ":"𑒓",

    "च":"𑒔",
    "छ":"𑒕",
    "ज":"𑒖",
    "झ":"𑒗",
    "ञ":"𑒘",

    "ट":"𑒙",
    "ठ":"𑒚",
    "ड":"𑒛",
    "ढ":"𑒜",
    "ण":"𑒝",

    "त":"𑒞",
    "थ":"𑒟",
    "द":"𑒠",
    "ध":"𑒡",
    "न":"𑒢",

    "प":"𑒣",
    "फ":"𑒤",
    "ब":"𑒥",
    "भ":"𑒦",
    "म":"𑒧",

    "य":"𑒨",
    "र":"𑒩",
    "ल":"𑒪",
    "व":"𑒫",

    "श":"𑒬",
    "ष":"𑒭",
    "स":"𑒮",
    "ह":"𑒯",

    /* Matras */

    "ा":"𑒰",
    "ि":"𑒱",
    "ी":"𑒲",
    "ु":"𑒳",
    "ू":"𑒴",
    "ृ":"𑒵",
    "ॄ":"𑒶",
    "ॢ":"𑒷",
    "ॣ":"𑒸",
    "े":"𑒹",
    "ै":"𑒺",
    "ो":"𑒻",
    "ौ":"𑒼",

    /* Signs */

    "ँ":"𑒿",
    "ं":"𑓀",
    "ः":"𑓁",
    "्":"𑓂",

    /* Digits */

    "०":"𑓐",
    "१":"𑓑",
    "२":"𑓒",
    "३":"𑓓",
    "४":"𑓔",
    "५":"𑓕",
    "६":"𑓖",
    "७":"𑓗",
    "८":"𑓘",
    "९":"𑓙",

    /* Punctuation */

    "।":"𑓇",
    "॥":"𑓈"

};

window.TIRHUTA_MAP = TIRHUTA_MAP;

})();
/* ===========================================================
   Part 2 : Basic Converter Functions
   =========================================================== */

function convertUsingMap(text){

    if(!text) return "";

    for(const key in window.TIRHUTA_MAP){

        text = text.split(key).join(window.TIRHUTA_MAP[key]);

    }

    return text;

}

/* ===========================================================
   Individual Converters
   =========================================================== */

function convertIndependentVowels(text){

    return convertUsingMap(text);

}

function convertConsonants(text){

    return convertUsingMap(text);

}

function convertMatras(text){

    return convertUsingMap(text);

}

function convertNumbers(text){

    return convertUsingMap(text);

}

function convertSigns(text){

    return convertUsingMap(text);

}
/* ===========================================================
   Part 3 : Special Conjuncts + Main Converter
   =========================================================== */

/* Common Sanskrit / Hindi Conjuncts */

const SPECIAL_WORDS = {

    "क्ष":"𑒏𑓂𑒭",
    "त्र":"𑒞𑓂𑒩",
    "ज्ञ":"𑒖𑓂𑒘",
    "श्र":"𑒬𑓂𑒩"

};


/* ===========================================================
   Replace Common Conjuncts
   =========================================================== */

function replaceSpecialWords(text){

    if(!text) return "";

    for(const key in SPECIAL_WORDS){

        text = text.split(key).join(SPECIAL_WORDS[key]);

    }

    return text;

}


/* ===========================================================
   Main Converter
   =========================================================== */

function devanagariToTirhuta(text){

    if(!text) return "";

    text = replaceSpecialWords(text);

    text = convertIndependentVowels(text);

    text = convertConsonants(text);

    text = convertMatras(text);

    text = convertSigns(text);

    text = convertNumbers(text);

    return text;

}


/* ===========================================================
   Export
   =========================================================== */

window.devanagariToTirhuta = devanagariToTirhuta;
/* ===========================================================
   Part 4 : DOM Converter
   =========================================================== */

function convertTextNode(node){

    if(!node) return;

    if(!node.nodeValue) return;

    node.nodeValue = devanagariToTirhuta(node.nodeValue);

}


/* ===========================================================
   Walk DOM
   =========================================================== */

function walkDOM(node){

    if(!node) return;

    if(node.nodeType===3){

        convertTextNode(node);

        return;

    }

    if(node.nodeType!==1){

        return;

    }

    const tag=node.tagName.toLowerCase();

    if(
        tag==="script" ||
        tag==="style" ||
        tag==="textarea" ||
        tag==="pre" ||
        tag==="code"
    ){

        return;

    }

    for(let i=0;i<node.childNodes.length;i++){

        walkDOM(node.childNodes[i]);

    }

}


/* ===========================================================
   Convert Whole Page
   =========================================================== */

function convertPageToTirhuta(root){

    root=root||document.body;

    walkDOM(root);

}


/* ===========================================================
   Convert Input Placeholder
   =========================================================== */

function convertPlaceholders(){

    document.querySelectorAll("input,textarea").forEach(function(el){

        if(el.placeholder){

            el.placeholder=devanagariToTirhuta(el.placeholder);

        }

    });

}


/* ===========================================================
   Convert Button Text
   =========================================================== */

function convertButtons(){

    document.querySelectorAll("input[type=button],input[type=submit]").forEach(function(el){

        if(el.value){

            el.value=devanagariToTirhuta(el.value);

        }

    });

}


/* ===========================================================
   Export
   =========================================================== */

window.convertPageToTirhuta = convertPageToTirhuta;
/* ===========================================================
   Part 5 : Auto Update + Observer
   =========================================================== */

let tirhutaObserver = null;


/* ===========================================================
   Start Observer
   =========================================================== */

function startTirhutaObserver(){

    if(tirhutaObserver){

        tirhutaObserver.disconnect();

    }

    tirhutaObserver = new MutationObserver(function(mutations){

        mutations.forEach(function(mutation){

            mutation.addedNodes.forEach(function(node){

                if(node.nodeType===3){

                    convertTextNode(node);

                }

                else if(node.nodeType===1){

                    convertPageToTirhuta(node);

                }

            });

        });

    });

    tirhutaObserver.observe(document.body,{

        childList:true,
        subtree:true

    });

}


/* ===========================================================
   Stop Observer
   =========================================================== */

function stopTirhutaObserver(){

    if(tirhutaObserver){

        tirhutaObserver.disconnect();

        tirhutaObserver=null;

    }

}


/* ===========================================================
   Enable Tirhuta
   =========================================================== */

function enableTirhuta(){

    convertPageToTirhuta(document.body);

    convertPlaceholders();

    convertButtons();

    startTirhutaObserver();

}


/* ===========================================================
   Disable Tirhuta
   =========================================================== */

function disableTirhuta(){

    stopTirhutaObserver();

}


/* ===========================================================
   Auto Font Class
   =========================================================== */

function applyTirhutaFont(){

    document.documentElement.classList.add("tirhuta-font");

}


/* ===========================================================
   Remove Font Class
   =========================================================== */

function removeTirhutaFont(){

    document.documentElement.classList.remove("tirhuta-font");

}


/* ===========================================================
   Enable Complete Tirhuta Mode
   =========================================================== */

window.enableCompleteTirhuta=function(){

    applyTirhutaFont();

    enableTirhuta();

};


/* ===========================================================
   Disable Complete Tirhuta Mode
   =========================================================== */

window.disableCompleteTirhuta=function(){

    removeTirhutaFont();

    disableTirhuta();

};
