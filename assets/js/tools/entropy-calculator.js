/**
 * Password Security Hub — Password Entropy Calculator Tool
 */
import { calculateEntropy, calculatePolicyEntropy } from '../utils/crypto.js';

document.addEventListener('DOMContentLoaded', () => {
  const modePills = document.querySelectorAll('#entropy-mode-pills .pill-btn');
  const analyzeSection = document.getElementById('analyze-mode-section');
  const policySection = document.getElementById('policy-mode-section');
  
  const pwdInput = document.getElementById('entropy-password-input');
  const togglePwdBtn = document.getElementById('entropy-toggle-pwd');
  
  const lengthSlider = document.getElementById('policy-length-slider');
  const lengthVal = document.getElementById('policy-length-val');
  const poolInput = document.getElementById('policy-pool-input');
  const presetPoolBtns = document.querySelectorAll('.preset-pool-btn');
  
  const bitsOutput = document.getElementById('entropy-bits-output');
  const badgeOutput = document.getElementById('entropy-strength-badge');
  const explanationOutput = document.getElementById('entropy-explanation');

  let currentMode = 'analyze';

  modePills.forEach(pill => {
    pill.addEventListener('click', () => {
      modePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentMode = pill.getAttribute('data-mode');
      
      if (currentMode === 'analyze') {
        if (analyzeSection) analyzeSection.classList.remove('hidden');
        if (policySection) policySection.classList.add('hidden');
      } else {
        if (analyzeSection) analyzeSection.classList.add('hidden');
        if (policySection) policySection.classList.remove('hidden');
      }
      calculate();
    });
  });

  presetPoolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (poolInput) poolInput.value = btn.getAttribute('data-pool');
      calculate();
    });
  });

  function getRating(bits) {
    if (bits < 28) return { label: 'Very Weak', cls: 'badge--danger' };
    if (bits < 36) return { label: 'Weak', cls: 'badge--danger' };
    if (bits < 60) return { label: 'Fair', cls: 'badge--warning' };
    if (bits < 128) return { label: 'Strong', cls: 'badge--success' };
    return { label: 'Very Strong', cls: 'badge--success' };
  }

  function calculate() {
    let bits = 0;
    let poolSize = 0;
    let len = 0;

    if (currentMode === 'analyze') {
      const pwd = pwdInput ? pwdInput.value : '';
      bits = calculateEntropy(pwd);
      len = pwd.length;
      if (/[a-z]/.test(pwd)) poolSize += 26;
      if (/[A-Z]/.test(pwd)) poolSize += 26;
      if (/[0-9]/.test(pwd)) poolSize += 10;
      if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 33;
    } else {
      len = parseInt(lengthSlider ? lengthSlider.value : 16, 10);
      poolSize = parseInt(poolInput ? poolInput.value : 95, 10);
      bits = calculatePolicyEntropy(poolSize, len);
    }

    if (bitsOutput) bitsOutput.textContent = `${bits} bits`;

    const rating = getRating(bits);
    if (badgeOutput) {
      badgeOutput.textContent = rating.label;
      badgeOutput.className = `badge ${rating.cls}`;
    }

    if (explanationOutput) {
      if (len === 0) {
        explanationOutput.textContent = 'Enter a password or define parameters to calculate bits.';
      } else {
        explanationOutput.innerHTML = `Formula: <code>${len} × log₂(pool size ${poolSize})</code> = <strong>2<sup>${Math.round(bits)}</sup></strong> total combinations.`;
      }
    }
  }

  if (pwdInput) {
    pwdInput.addEventListener('input', calculate);
  }

  if (togglePwdBtn && pwdInput) {
    togglePwdBtn.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
    });
  }

  if (lengthSlider) {
    lengthSlider.addEventListener('input', (e) => {
      if (lengthVal) lengthVal.textContent = e.target.value;
      calculate();
    });
  }

  if (poolInput) {
    poolInput.addEventListener('input', calculate);
  }

  calculate();
});
