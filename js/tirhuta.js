/* ===========================================================
   Tirhuta Converter
   Part 1 : Mapping + Vowels
   =========================================================== */

(function(){

const TIRHUTA_MAP = {

//
// Independent Vowels
//

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

//
// Matras
//

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

//
// Signs
//

"ं":"𑓀",
"ः":"𑓁",
"ँ":"𑒿",
"्":"𑓂",

//
// Om
//

"ॐ":"𑓇",

//
// Digits
//

"०":"𑓐",
"१":"𑓑",
"२":"𑓒",
"३":"𑓓",
"४":"𑓔",
"५":"𑓕",
"६":"𑓖",
"७":"𑓗",
"८":"𑓘",
"९":"𑓙"

};

window.TIRHUTA_MAP = TIRHUTA_MAP;

})();
/* ===========================================================
   Part 2 : Consonants Mapping
   =========================================================== */

Object.assign(window.TIRHUTA_MAP,{

//
// Ka Varga
//

"क":"𑒏",
"ख":"𑒐",
"ग":"𑒑",
"घ":"𑒒",
"ङ":"𑒓",

//
// Cha Varga
//

"च":"𑒔",
"छ":"𑒕",
"ज":"𑒖",
"झ":"𑒗",
"ञ":"𑒘",

//
// Ta Varga (Retroflex)
//

"ट":"𑒙",
"ठ":"𑒚",
"ड":"𑒛",
"ढ":"𑒜",
"ण":"𑒝",

//
// Ta Varga (Dental)
//

"त":"𑒞",
"थ":"𑒟",
"द":"𑒠",
"ध":"𑒡",
"न":"𑒢",

//
// Pa Varga
//

"प":"𑒣",
"फ":"𑒤",
"ब":"𑒥",
"भ":"𑒦",
"म":"𑒧",

//
// Semi Vowels
//

"य":"𑒨",
"र":"𑒩",
"ल":"𑒪",
"व":"𑒫",

//
// Sibilants
//

"श":"𑒬",
"ष":"𑒭",
"स":"𑒮",
"ह":"𑒯",

//
// Additional Letters
//

"ळ":"𑒰",
"क्ष":"𑒁𑓂𑒭",
/* ===========================================================
   PART 3
   Conjuncts + Special Replacements
=========================================================== */

const SPECIAL_WORDS = {
    "क्ष":"𑒏𑓂𑒫",
    "त्र":"𑒞𑓂𑒩",
    "ज्ञ":"𑒕𑓂𑒖",
    "श्र":"𑒫𑓂𑒩"
};

function replaceSpecialWords(str){

    Object.keys(SPECIAL_WORDS).forEach(function(k){

        str = str.split(k).join(SPECIAL_WORDS[k]);

    });

    return str;

}


/* ===========================
   Halant Processing
=========================== */

function applyHalant(str){

    str = str.replace(/्/g,"𑓂");

    return str;

}


/* ===========================
   Nukta
=========================== */

function applyNukta(str){

    str = str.replace(/़/g,"");

    return str;

}


/* ===========================
   Danda
=========================== */

function replaceSymbols(str){

    str = str.replace(/।/g,"𑓇");
    str = str.replace(/॥/g,"𑓈");

    return str;

}


/* ===========================
   Complete Converter
=========================== */

function devanagariToTirhuta(text){

    text = replaceSpecialWords(text);

    text = convertIndependentVowels(text);

    text = convertConsonants(text);

    text = convertMatras(text);

    text = convertNumbers(text);

    text = applyHalant(text);

    text = applyNukta(text);

    text = replaceSymbols(text);

    return text;

}
/* ===========================================================
   PART 4
   DOM Converter
=========================================================== */

function convertTextNode(node){

    if(!node || !node.nodeValue) return;

    node.nodeValue = devanagariToTirhuta(node.nodeValue);

}


/* ===========================================================
   Walk Through DOM
=========================================================== */

function walk(node){

    if(!node) return;

    if(node.nodeType===3){

        convertTextNode(node);

        return;

    }

    if(node.nodeType!==1) return;

    const tag=node.tagName.toLowerCase();

    if(
        tag==="script" ||
        tag==="style" ||
        tag==="textarea" ||
        tag==="code" ||
        tag==="pre"
    ){
        return;
    }

    for(let i=0;i<node.childNodes.length;i++){

        walk(node.childNodes[i]);

    }

}


/* ===========================================================
   Public Function
=========================================================== */

function convertPageToTirhuta(root){

    root=root||document.body;

    walk(root);

}


/* ===========================================================
   Convert Placeholder
=========================================================== */

function convertPlaceholders(){

    document.querySelectorAll("input").forEach(function(el){

        if(el.placeholder){

            el.placeholder=devanagariToTirhuta(el.placeholder);

        }

    });

}


/* ===========================================================
   Convert Buttons
=========================================================== */

function convertButtons(){

    document.querySelectorAll("input[type=button],input[type=submit]").forEach(function(el){

        if(el.value){

            el.value=devanagariToTirhuta(el.value);

        }

    });

}
/* ===========================================================
   PART 5
   Auto Update + Mutation Observer
=========================================================== */

let tirhutaObserver = null;

function startTirhutaObserver(){

    if(tirhutaObserver){

        tirhutaObserver.disconnect();

    }

    tirhutaObserver = new MutationObserver(function(mutations){

        mutations.forEach(function(m){

            m.addedNodes.forEach(function(node){

                if(node.nodeType===3){

                    convertTextNode(node);

                }else if(node.nodeType===1){

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
   Main Function
=========================================================== */

function enableTirhuta(){

    convertPageToTirhuta(document.body);

    convertPlaceholders();

    convertButtons();

    startTirhutaObserver();

}


/* ===========================================================
   Disable
=========================================================== */

function disableTirhuta(){

    stopTirhutaObserver();

}


/* ===========================================================
   Export
=========================================================== */

window.convertPageToTirhuta = convertPageToTirhuta;
window.enableTirhuta = enableTirhuta;
window.disableTirhuta = disableTirhuta;
window.devanagariToTirhuta = devanagariToTirhuta;
