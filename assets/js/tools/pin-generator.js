/**
 * Password Security Hub — PIN Generator Tool
 */
import { generatePIN } from '../utils/crypto.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { exportAsTXT } from '../utils/export.js';

document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('#pin-length-pills .pill-btn');
  const customLengthGroup = document.getElementById('custom-pin-length-group');
  const customLengthInput = document.getElementById('custom-pin-length');
  const quantityInput = document.getElementById('pin-quantity');
  const noSequentialChk = document.getElementById('no-sequential');
  const noRepeatedChk = document.getElementById('no-repeated');
  
  const generateBtn = document.getElementById('generate-pin-btn');
  const outputList = document.getElementById('pin-output-list');
  const copyAllBtn = document.getElementById('copy-all-pins-btn');
  const exportTxtBtn = document.getElementById('export-pins-txt-btn');

  let selectedLength = 4;
  let generatedPINs = [];

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const val = pill.getAttribute('data-length');
      if (val === 'custom') {
        if (customLengthGroup) customLengthGroup.classList.remove('hidden');
        selectedLength = parseInt(customLengthInput ? customLengthInput.value : 4, 10);
      } else {
        if (customLengthGroup) customLengthGroup.classList.add('hidden');
        selectedLength = parseInt(val, 10);
      }
      generate();
    });
  });

  if (customLengthInput) {
    customLengthInput.addEventListener('input', () => {
      selectedLength = parseInt(customLengthInput.value, 10);
      generate();
    });
  }

  function generate() {
    const qty = Math.max(1, Math.min(20, parseInt(quantityInput ? quantityInput.value : 1, 10)));
    const len = Math.max(3, Math.min(16, selectedLength || 4));
    const noSeq = noSequentialChk ? noSequentialChk.checked : true;
    const noRep = noRepeatedChk ? noRepeatedChk.checked : true;

    generatedPINs = [];
    if (outputList) outputList.innerHTML = '';

    for (let i = 0; i < qty; i++) {
      const pin = generatePIN({ length: len, noSequential: noSeq, noRepeated: noRep });
      generatedPINs.push(pin);

      const item = document.createElement('div');
      item.className = 'password-display';
      item.style.fontSize = '20px';
      item.style.letterSpacing = '0.15em';
      item.style.padding = '10px 16px';
      item.innerHTML = `<span>${pin}</span><button type="button" class="btn btn--sm btn--secondary" style="flex-shrink:0;">Copy</button>`;
      item.querySelector('button').addEventListener('click', () => {
        copyToClipboard(pin, 'PIN');
      });
      if (outputList) outputList.appendChild(item);
    }
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', generate);
  }

  if (copyAllBtn) {
    copyAllBtn.addEventListener('click', () => {
      if (generatedPINs.length > 0) {
        copyToClipboard(generatedPINs.join('\n'), 'All PINs');
      }
    });
  }

  if (exportTxtBtn) {
    exportTxtBtn.addEventListener('click', () => {
      if (generatedPINs.length > 0) {
        exportAsTXT(generatedPINs, 'pins.txt');
      }
    });
  }

  generate();
});
