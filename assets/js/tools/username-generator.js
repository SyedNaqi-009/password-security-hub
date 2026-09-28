/**
 * Password Security Hub — Username Generator Tool
 */
import { getSecureRandomInt } from '../utils/crypto.js';
import { copyToClipboard } from '../utils/clipboard.js';

let adjectivesData = [];
let nounsData = [];

const FALLBACK_ADJECTIVES = ["Swift", "Brave", "Clever", "Silent", "Shadow", "Neon", "Cyber", "Atomic", "Mighty", "Cosmic", "Lunar", "Solar", "Vivid", "Epic", "Apex"];
const FALLBACK_NOUNS = ["Falcon", "Tiger", "Dragon", "Phoenix", "Wolf", "Panther", "Viper", "Hawk", "Eagle", "Knight", "Hunter", "Matrix", "Cipher", "Titan", "Specter"];
const GAMING_PREFIXES = ["Shadow", "Dark", "Storm", "Blaze", "Void", "Iron", "Ghost", "Frost", "Neon", "Cyber", "Fatal", "Reaper", "Vortex", "Rogue", "Hyper"];
const FUNNY_ANIMALS = ["Panda", "Otter", "Llama", "Sloth", "Penguin", "Badger", "Hamster", "Duck", "Walrus", "Wombat", "Koala"];

async function loadWordData() {
  try {
    const [adjRes, nounRes] = await Promise.all([
      fetch('../assets/data/adjectives.json'),
      fetch('../assets/data/nouns.json')
    ]);
    if (adjRes.ok) adjectivesData = await adjRes.json();
    if (nounRes.ok) nounsData = await nounRes.json();
  } catch (e) {
    adjectivesData = FALLBACK_ADJECTIVES;
    nounsData = FALLBACK_NOUNS;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const keywordInput = document.getElementById('keyword-input');
  const stylePills = document.querySelectorAll('#style-pills .pill-btn');
  const numbersChk = document.getElementById('include-numbers');
  const underscoresChk = document.getElementById('include-underscores');
  
  const generateBtn = document.getElementById('generate-usernames-btn');
  const generateMoreBtn = document.getElementById('generate-more-btn');
  const grid = document.getElementById('usernames-grid');

  let currentStyle = 'random';

  await loadWordData();

  stylePills.forEach(pill => {
    pill.addEventListener('click', () => {
      stylePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentStyle = pill.getAttribute('data-style');
      if (grid) grid.innerHTML = '';
      generateBatch(10);
    });
  });

  function createUsername() {
    const kw = (keywordInput ? keywordInput.value.trim() : '').replace(/[^a-zA-Z0-9]/g, '');
    const incNum = numbersChk ? numbersChk.checked : true;
    const incUnder = underscoresChk ? underscoresChk.checked : false;
    const sep = incUnder ? '_' : '';

    const adjs = adjectivesData.length ? adjectivesData : FALLBACK_ADJECTIVES;
    const nouns = nounsData.length ? nounsData : FALLBACK_NOUNS;

    let base = '';

    if (currentStyle === 'gaming') {
      const prefix = GAMING_PREFIXES[getSecureRandomInt(GAMING_PREFIXES.length)];
      const noun = kw || nouns[getSecureRandomInt(nouns.length)];
      base = `${prefix}${sep}${noun}`;
    } else if (currentStyle === 'professional') {
      const adj = adjs[getSecureRandomInt(adjs.length)];
      const noun = kw || nouns[getSecureRandomInt(nouns.length)];
      base = `${adj.charAt(0).toUpperCase()}${sep}${noun}`;
    } else if (currentStyle === 'funny') {
      const animal = FUNNY_ANIMALS[getSecureRandomInt(FUNNY_ANIMALS.length)];
      const adj = adjs[getSecureRandomInt(adjs.length)];
      base = `${adj}${sep}${kw || animal}`;
    } else {
      // Random
      const adj = adjs[getSecureRandomInt(adjs.length)];
      const noun = kw || nouns[getSecureRandomInt(nouns.length)];
      base = `${adj}${sep}${noun}`;
    }

    if (incNum) {
      base += `${sep}${getSecureRandomInt(100)}`;
    }

    return base;
  }

  function generateBatch(count = 10) {
    if (!grid) return;
    for (let i = 0; i < count; i++) {
      const name = createUsername();
      const card = document.createElement('div');
      card.className = 'card';
      card.style.padding = '12px 16px';
      card.style.display = 'flex';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'space-between';
      card.style.gap = '8px';
      card.innerHTML = `
        <span class="font-bold text-mono" style="font-size: 15px; word-break: break-all;">${name}</span>
        <button type="button" class="btn btn--sm btn--secondary" style="flex-shrink:0;">Copy</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        copyToClipboard(name, 'Username');
      });
      grid.appendChild(card);
    }
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      if (grid) grid.innerHTML = '';
      generateBatch(10);
    });
  }

  if (generateMoreBtn) {
    generateMoreBtn.addEventListener('click', () => {
      generateBatch(10);
    });
  }

  generateBatch(10);
});
