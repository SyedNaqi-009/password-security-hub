/**
 * Password Security Hub — Password Generator Tool
 */
import { generatePassword, calculateEntropy } from '../utils/crypto.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { loadZxcvbn, analyzePassword, updateStrengthBar, formatCrackTimes } from '../utils/strength.js';

document.addEventListener('DOMContentLoaded', async () => {
  const lengthSlider = document.getElementById('length-slider');
  const lengthVal = document.getElementById('length-val') || document.getElementById('length-display');
  
  const chkUpper = document.getElementById('uppercase') || document.getElementById('chk-uppercase');
  const chkLower = document.getElementById('lowercase') || document.getElementById('chk-lowercase');
  const chkNumbers = document.getElementById('numbers') || document.getElementById('chk-numbers');
  const chkSymbols = document.getElementById('symbols') || document.getElementById('chk-symbols');
  const chkAmbiguous = document.getElementById('exclude-ambiguous') || document.getElementById('chk-exclude-ambiguous');
  const excludeCharsInput = document.getElementById('exclude-chars') || document.getElementById('custom-exclude');
  
  const multipleToggle = document.getElementById('multiple-toggle') || document.getElementById('generate-multiple-toggle');
  const multipleContainer = document.getElementById('multiple-container') || document.getElementById('multiple-passwords-container');
  const multipleQuantity = document.getElementById('multiple-quantity') || document.getElementById('quantity-selector');
  const multipleOutputList = document.getElementById('multiple-output-list');
  
  const passwordOutput = document.getElementById('password-output');
  const copyBtn = document.getElementById('copy-btn');
  const regenerateBtn = document.getElementById('regenerate-btn');
  const toggleVisibilityBtn = document.getElementById('toggle-visibility-btn');
  
  const strengthBarContainer = document.getElementById('strength-bar-container') || document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text') || document.getElementById('strength-feedback');
  const crackTimeDisplay = document.getElementById('crack-time-display') || document.getElementById('crack-time');
  const entropyDisplay = document.getElementById('entropy-display') || document.getElementById('entropy');
  const lengthStatDisplay = document.getElementById('length-stat-display');

  let currentPassword = '';
  let isMasked = false;

  // Pre-load zxcvbn
  try {
    await loadZxcvbn();
  } catch (e) {
    console.warn('zxcvbn load warning:', e);
  }

  function getOptions() {
    return {
      length: parseInt(lengthSlider ? lengthSlider.value : 16, 10),
      uppercase: chkUpper ? chkUpper.checked : true,
      lowercase: chkLower ? chkLower.checked : true,
      numbers: chkNumbers ? chkNumbers.checked : true,
      symbols: chkSymbols ? chkSymbols.checked : true,
      excludeAmbiguous: chkAmbiguous ? chkAmbiguous.checked : false,
      excludeChars: excludeCharsInput ? excludeCharsInput.value : ''
    };
  }

  async function generate() {
    const opts = getOptions();

    // Ensure at least one charset is selected
    if (!opts.uppercase && !opts.lowercase && !opts.numbers && !opts.symbols) {
      if (chkLower) chkLower.checked = true;
      opts.lowercase = true;
    }

    try {
      currentPassword = generatePassword(opts);
      
      if (passwordOutput) {
        passwordOutput.textContent = isMasked ? '•'.repeat(currentPassword.length) : currentPassword;
      }

      // Entropy calculation
      const entropy = calculateEntropy(currentPassword);
      if (entropyDisplay) {
        entropyDisplay.textContent = `${entropy} bits`;
      }
      if (lengthStatDisplay) {
        lengthStatDisplay.textContent = opts.length;
      }

      // Strength analysis
      const analysis = await analyzePassword(currentPassword);
      if (strengthBarContainer) {
        updateStrengthBar(strengthBarContainer, strengthText, analysis.score);
      }
      if (crackTimeDisplay) {
        const times = formatCrackTimes(analysis.crackTimesDisplay);
        crackTimeDisplay.textContent = `Crack time: ${times.offlineSlowHash}`;
      }

      // Generate Multiple if enabled
      if (multipleToggle && multipleToggle.checked && multipleOutputList) {
        const qty = parseInt(multipleQuantity ? multipleQuantity.value : 5, 10);
        multipleOutputList.innerHTML = '';
        for (let i = 0; i < qty; i++) {
          const pwd = generatePassword(opts);
          const item = document.createElement('div');
          item.className = 'password-display';
          item.style.fontSize = '15px';
          item.style.padding = '8px 12px';
          item.innerHTML = `<span style="word-break: break-all;">${pwd}</span><button type="button" class="btn btn--sm btn--secondary" style="flex-shrink:0;">Copy</button>`;
          item.querySelector('button').addEventListener('click', () => {
            copyToClipboard(pwd, 'Password');
          });
          multipleOutputList.appendChild(item);
        }
      }
    } catch (err) {
      console.error('Password generation error:', err);
    }
  }

  // Event Listeners
  if (lengthSlider) {
    lengthSlider.addEventListener('input', (e) => {
      if (lengthVal) lengthVal.textContent = e.target.value;
      generate();
    });
  }

  [chkUpper, chkLower, chkNumbers, chkSymbols, chkAmbiguous].forEach(el => {
    if (el) {
      el.addEventListener('change', () => {
        // Prevent deselecting all
        const anyChecked = [chkUpper, chkLower, chkNumbers, chkSymbols].some(c => c && c.checked);
        if (!anyChecked && el) {
          el.checked = true;
        }
        generate();
      });
    }
  });

  if (excludeCharsInput) {
    excludeCharsInput.addEventListener('input', generate);
  }

  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', generate);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (currentPassword) {
        copyToClipboard(currentPassword, 'Password');
      }
    });
  }

  if (toggleVisibilityBtn) {
    toggleVisibilityBtn.addEventListener('click', () => {
      isMasked = !isMasked;
      toggleVisibilityBtn.setAttribute('aria-label', isMasked ? 'Show password' : 'Hide password');
      if (passwordOutput) {
        passwordOutput.textContent = isMasked ? '•'.repeat(currentPassword.length) : currentPassword;
      }
    });
  }

  if (multipleToggle) {
    multipleToggle.addEventListener('change', () => {
      if (multipleContainer) {
        multipleContainer.classList.toggle('hidden', !multipleToggle.checked);
      }
      generate();
    });
  }

  if (multipleQuantity) {
    multipleQuantity.addEventListener('input', generate);
  }

  // Initial generation
  generate();
});
