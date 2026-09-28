/**
 * Password Security Hub — Passphrase Generator Tool
 */
import { getSecureRandomInt } from '../utils/crypto.js';
import { copyToClipboard } from '../utils/clipboard.js';

const EFF_WORDLIST_URL = '../assets/data/eff-wordlist.json';
let wordlist = [];

const FALLBACK_WORDS = [
  "abacus", "abbey", "ability", "ablaze", "abnormal", "aboard", "abolish", "abound", "abrasive", "abroad",
  "abrupt", "absent", "absorb", "abstract", "absurd", "accent", "accept", "access", "accident", "acclaim",
  "accord", "account", "accuracy", "accurate", "accuse", "ace", "achieve", "acid", "acoustic", "acquire",
  "across", "act", "action", "active", "actor", "actress", "actual", "acute", "adapt", "add", "addition",
  "adequate", "adhere", "adjacent", "adjoin", "adjust", "admiral", "admire", "admit", "adopt", "advance"
];

async function loadWordlist() {
  try {
    const res = await fetch(EFF_WORDLIST_URL);
    if (res.ok) {
      wordlist = await res.json();
    } else {
      wordlist = FALLBACK_WORDS;
    }
  } catch (err) {
    wordlist = FALLBACK_WORDS;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const outputEl = document.getElementById('passphrase-output');
  const copyBtn = document.getElementById('copy-passphrase-btn');
  const regenerateBtn = document.getElementById('regenerate-passphrase-btn');
  
  const wordCountSlider = document.getElementById('word-count-slider');
  const wordCountVal = document.getElementById('word-count-val');
  const separatorSelect = document.getElementById('separator-select');
  const customSepGroup = document.getElementById('custom-sep-group');
  const customSepInput = document.getElementById('custom-sep-input');
  const capitalizeChk = document.getElementById('capitalize-words');
  const appendNumberChk = document.getElementById('append-number');
  
  const entropyStat = document.getElementById('passphrase-entropy');
  const wordsStat = document.getElementById('passphrase-words-stat');
  const crackTimeStat = document.getElementById('passphrase-crack-time');

  let currentPassphrase = '';

  await loadWordlist();

  function getSeparator() {
    if (!separatorSelect) return '-';
    if (separatorSelect.value === 'custom') {
      return customSepInput ? (customSepInput.value || '') : '-';
    }
    return separatorSelect.value;
  }

  function generate() {
    if (!wordlist || wordlist.length === 0) return;

    const count = parseInt(wordCountSlider ? wordCountSlider.value : 4, 10);
    const sep = getSeparator();
    const capitalize = capitalizeChk ? capitalizeChk.checked : true;
    const appendNum = appendNumberChk ? appendNumberChk.checked : false;

    const chosenWords = [];
    for (let i = 0; i < count; i++) {
      let word = wordlist[getSecureRandomInt(wordlist.length)];
      if (capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      chosenWords.push(word);
    }

    let phrase = chosenWords.join(sep);
    if (appendNum) {
      phrase += `${sep}${getSecureRandomInt(100)}`;
    }

    currentPassphrase = phrase;
    if (outputEl) {
      outputEl.textContent = currentPassphrase;
    }

    // Entropy: log2(7776) ≈ 12.9248 bits per word
    let entropy = count * 12.92;
    if (appendNum) entropy += 6.64; // log2(100)
    entropy = Math.round(entropy * 10) / 10;

    if (entropyStat) entropyStat.textContent = `${entropy} bits`;
    if (wordsStat) wordsStat.textContent = count;
    if (crackTimeStat) {
      if (entropy < 40) crackTimeStat.textContent = 'Instant';
      else if (entropy < 60) crackTimeStat.textContent = 'Days to Years';
      else if (entropy < 80) crackTimeStat.textContent = 'Centuries';
      else crackTimeStat.textContent = 'Millions of Years';
    }
  }

  if (wordCountSlider) {
    wordCountSlider.addEventListener('input', (e) => {
      if (wordCountVal) wordCountVal.textContent = e.target.value;
      generate();
    });
  }

  if (separatorSelect) {
    separatorSelect.addEventListener('change', () => {
      if (customSepGroup) {
        customSepGroup.classList.toggle('hidden', separatorSelect.value !== 'custom');
      }
      generate();
    });
  }

  if (customSepInput) {
    customSepInput.addEventListener('input', generate);
  }

  if (capitalizeChk) {
    capitalizeChk.addEventListener('change', generate);
  }

  if (appendNumberChk) {
    appendNumberChk.addEventListener('change', generate);
  }

  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', generate);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (currentPassphrase) {
        copyToClipboard(currentPassphrase, 'Passphrase');
      }
    });
  }

  generate();
});
