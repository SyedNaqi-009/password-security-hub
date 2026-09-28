/**
 * Password Security Hub — Security Code Generator Tool
 */
import { getSecureRandomInt, generateUUID, generateHexKey, generateBase64Token, generateAlphanumericToken } from '../utils/crypto.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { exportAsTXT } from '../utils/export.js';

document.addEventListener('DOMContentLoaded', () => {
  const typePills = document.querySelectorAll('#code-type-pills .pill-btn');
  const lengthSliderGroup = document.getElementById('length-slider-group');
  const lengthSlider = document.getElementById('code-length-slider');
  const lengthVal = document.getElementById('code-length-val');
  const quantityInput = document.getElementById('code-quantity');
  
  const generateBtn = document.getElementById('generate-code-btn');
  const outputList = document.getElementById('code-output-list');
  const copyAllBtn = document.getElementById('copy-all-codes-btn');
  const exportTxtBtn = document.getElementById('export-codes-txt-btn');

  let currentType = 'otp';
  let generatedCodes = [];

  const typeConfig = {
    otp: { min: 4, max: 12, default: 6 },
    token: { min: 8, max: 128, default: 32 },
    hex: { min: 8, max: 128, default: 32 },
    uuid: { min: 36, max: 36, default: 36 },
    base64: { min: 8, max: 128, default: 32 }
  };

  typePills.forEach(pill => {
    pill.addEventListener('click', () => {
      typePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentType = pill.getAttribute('data-type');

      const config = typeConfig[currentType];
      if (currentType === 'uuid') {
        if (lengthSliderGroup) lengthSliderGroup.classList.add('hidden');
      } else {
        if (lengthSliderGroup) lengthSliderGroup.classList.remove('hidden');
        if (lengthSlider) {
          lengthSlider.min = config.min;
          lengthSlider.max = config.max;
          lengthSlider.value = config.default;
        }
        if (lengthVal) lengthVal.textContent = config.default;
      }
      generate();
    });
  });

  if (lengthSlider && lengthVal) {
    lengthSlider.addEventListener('input', (e) => {
      lengthVal.textContent = e.target.value;
      generate();
    });
  }

  function generateSingleCode(type, len) {
    if (type === 'otp') {
      let otp = '';
      for (let i = 0; i < len; i++) {
        otp += getSecureRandomInt(10).toString();
      }
      return otp;
    }
    if (type === 'uuid') {
      return generateUUID();
    }
    if (type === 'hex') {
      return generateHexKey(len);
    }
    if (type === 'base64') {
      return generateBase64Token(len);
    }
    return generateAlphanumericToken(len);
  }

  function formatDisplayCode(code, type) {
    if (type === 'otp' && code.length >= 6) {
      // Group in pairs or triplets
      return code.match(/.{1,3}/g).join(' ');
    }
    return code;
  }

  function generate() {
    const qty = Math.max(1, Math.min(20, parseInt(quantityInput ? quantityInput.value : 1, 10)));
    const len = parseInt(lengthSlider ? lengthSlider.value : 6, 10);

    generatedCodes = [];
    if (outputList) outputList.innerHTML = '';

    for (let i = 0; i < qty; i++) {
      const code = generateSingleCode(currentType, len);
      generatedCodes.push(code);

      const formatted = formatDisplayCode(code, currentType);
      const item = document.createElement('div');
      item.className = 'password-display';
      item.style.fontSize = '17px';
      item.style.padding = '10px 14px';
      item.innerHTML = `
        <span style="font-family: var(--font-mono); word-break: break-all;">${formatted}</span>
        <button type="button" class="btn btn--sm btn--secondary" style="flex-shrink:0;">Copy</button>
      `;
      item.querySelector('button').addEventListener('click', () => {
        copyToClipboard(code, 'Code');
      });
      if (outputList) outputList.appendChild(item);
    }
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', generate);
  }

  if (copyAllBtn) {
    copyAllBtn.addEventListener('click', () => {
      if (generatedCodes.length > 0) {
        copyToClipboard(generatedCodes.join('\n'), 'All Codes');
      }
    });
  }

  if (exportTxtBtn) {
    exportTxtBtn.addEventListener('click', () => {
      if (generatedCodes.length > 0) {
        exportAsTXT(generatedCodes, 'security-codes.txt');
      }
    });
  }

  generate();
});
