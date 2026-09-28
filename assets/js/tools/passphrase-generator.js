// Import modules when available in a full project structure
// import { getSecureRandomInt } from '../utils/crypto.js';
// import { calculateEntropy, getCrackTime } from '../utils/strength.js';
// import { copyToClipboard } from '../utils/clipboard.js';

const EFF_WORDLIST_URL = '../assets/data/eff-wordlist.json';
let wordlist = [];

/**
 * Returns a cryptographically secure random integer between min and max (inclusive).
 */
function getSecureRandomInt(min, max) {
    const range = max - min + 1;
    const maxSafe = Math.floor((4294967295) / range) * range;
    const randomBuffer = new Uint32Array(1);
    let randomVal;
    do {
        crypto.getRandomValues(randomBuffer);
        randomVal = randomBuffer[0];
    } while (randomVal >= maxSafe);
    return min + (randomVal % range);
}

/**
 * Loads the EFF wordlist from the local JSON file
 */
async function loadWordlist() {
    try {
        const response = await fetch(EFF_WORDLIST_URL);
        if (response.ok) {
            wordlist = await response.json();
        } else {
            console.warn("Could not load wordlist from network, using fallback list.");
            throw new Error("Network response was not ok");
        }
    } catch (e) {
        // Fallback list to ensure functionality even if fetch fails
        wordlist = ["apple", "banana", "cherry", "dragon", "eagle", "forest", "galaxy", "harbor", "island", "jungle", "knight", "lizard", "monkey", "nebula", "ocean", "planet", "quasar", "river", "sunset", "tiger", "unicorn", "valley", "window", "xenon", "yellow", "zebra"];
    }
}

function calculateEntropy(wordCount, hasNumber) {
    // EFF large wordlist has 7776 words. log2(7776) ≈ 12.92
    let entropy = 12.92 * wordCount;
    if (hasNumber) {
        entropy += Math.log2(100); // 2 digit number
    }
    return Math.round(entropy * 10) / 10;
}

function getCrackTime(entropy) {
    if (entropy < 40) return "Instant";
    if (entropy < 60) return "Minutes to Hours";
    if (entropy < 80) return "Decades";
    if (entropy < 100) return "Centuries";
    return "Eons";
}

function generatePassphrase() {
    if (wordlist.length === 0) return;
    
    const wordCount = parseInt(document.getElementById('word-count').value, 10);
    const separatorSelect = document.getElementById('separator').value;
    const customSep = document.getElementById('custom-separator').value;
    const separator = separatorSelect === 'custom' ? customSep : separatorSelect;
    const capitalize = document.getElementById('capitalize').checked;
    const appendNumber = document.getElementById('append-number').checked;

    let words = [];
    for (let i = 0; i < wordCount; i++) {
        let word = wordlist[getSecureRandomInt(0, wordlist.length - 1)];
        if (capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        words.push(word);
    }

    if (appendNumber) {
        const num = getSecureRandomInt(10, 99);
        words[words.length - 1] += num;
    }

    displayPassphrase(words, separator);
    updateStrength(wordCount, appendNumber);
}

function displayPassphrase(words, separator) {
    const display = document.getElementById('passphrase-display');
    display.innerHTML = ''; // Clear current contents
    
    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word;
        // Alternating colors for readability
        span.style.color = index % 2 === 0 ? 'var(--accent)' : 'var(--text-primary)';
        display.appendChild(span);
        
        if (index < words.length - 1) {
            const sepSpan = document.createElement('span');
            sepSpan.textContent = separator;
            sepSpan.style.color = 'var(--text-secondary)';
            display.appendChild(sepSpan);
        }
    });
}

function updateStrength(wordCount, hasNumber) {
    const entropy = calculateEntropy(wordCount, hasNumber);
    const crackTime = getCrackTime(entropy);
    
    document.getElementById('entropy-display').textContent = `Entropy: ${entropy} bits`;
    document.getElementById('crack-time').textContent = `Crack time: ${crackTime}`;
    
    const bar = document.getElementById('strength-bar');
    let width = Math.min(100, (entropy / 120) * 100); 
    bar.style.width = `${width}%`;
    
    if (entropy < 40) {
        bar.style.backgroundColor = 'var(--danger)';
    } else if (entropy < 70) {
        bar.style.backgroundColor = 'var(--warning)';
    } else {
        bar.style.backgroundColor = 'var(--success)';
    }
}

function copyPassphrase() {
    const display = document.getElementById('passphrase-display');
    const text = display.innerText;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyFeedback();
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    } else {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showCopyFeedback();
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
    }
}

function showCopyFeedback() {
    const btn = document.getElementById('copy-btn');
    const origText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = origText; }, 2000);
}

document.addEventListener('DOMContentLoaded', async () => {
    // Await loading of the wordlist
    await loadWordlist();
    
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) generateBtn.addEventListener('click', generatePassphrase);
    
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) copyBtn.addEventListener('click', copyPassphrase);
    
    const wordCountInput = document.getElementById('word-count');
    const wordCountVal = document.getElementById('word-count-val');
    if (wordCountInput) {
        wordCountInput.addEventListener('input', (e) => {
            if(wordCountVal) wordCountVal.textContent = e.target.value;
            generatePassphrase();
        });
    }

    const sepSelect = document.getElementById('separator');
    const customSep = document.getElementById('custom-separator');
    if (sepSelect) {
        sepSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customSep.style.display = 'inline-block';
            } else {
                customSep.style.display = 'none';
            }
            generatePassphrase();
        });
    }
    
    if (customSep) customSep.addEventListener('input', generatePassphrase);
    
    const capitalizeCb = document.getElementById('capitalize');
    if (capitalizeCb) capitalizeCb.addEventListener('change', generatePassphrase);
    
    const appendNumCb = document.getElementById('append-number');
    if (appendNumCb) appendNumCb.addEventListener('change', generatePassphrase);
    
    // Initial generation
    generatePassphrase();
});
