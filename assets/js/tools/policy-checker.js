/**
 * Password Security Hub — Password Policy Checker Tool
 */
document.addEventListener('DOMContentLoaded', async () => {
  const presetSelect = document.getElementById('policy-preset');
  const pwdInput = document.getElementById('check-password');
  const togglePwd = document.getElementById('toggle-pwd-visibility');
  
  const ruleMin = document.getElementById('rule-min-length');
  const ruleMax = document.getElementById('rule-max-length');
  const ruleUpper = document.getElementById('rule-upper');
  const ruleLower = document.getElementById('rule-lower');
  const ruleDigit = document.getElementById('rule-digit');
  const ruleSymbol = document.getElementById('rule-symbol');
  const ruleNoSeq = document.getElementById('rule-no-seq');
  const ruleNoRep = document.getElementById('rule-no-rep');
  const ruleNotCommon = document.getElementById('rule-not-common');
  const ruleBanned = document.getElementById('rule-banned');
  
  const overallStatus = document.getElementById('overall-status');
  const checklist = document.getElementById('checklist');
  const exportBtn = document.getElementById('export-json');
  
  let commonPasswords = new Set(['password', '123456', 'qwerty', 'admin', 'welcome', '12345678', 'iloveyou', 'secret']);
  try {
    const res = await fetch('../assets/data/common-passwords.json');
    if (res.ok) {
      const data = await res.json();
      commonPasswords = new Set(data.map(p => p.toLowerCase()));
    }
  } catch (e) {
    console.warn('Common passwords database notice:', e);
  }

  const presets = {
    nist: { min: 8, max: 64, upper: false, lower: false, digit: false, symbol: false, seq: false, rep: false, common: true },
    pci: { min: 12, max: 128, upper: true, lower: true, digit: true, symbol: true, seq: false, rep: false, common: true },
    hipaa: { min: 8, max: 128, upper: true, lower: true, digit: true, symbol: true, seq: false, rep: false, common: true },
    custom: { min: 8, max: 64, upper: true, lower: true, digit: true, symbol: true, seq: true, rep: true, common: true }
  };

  function applyPreset() {
    if (!presetSelect) return;
    const p = presets[presetSelect.value] || presets.nist;
    if (ruleMin) ruleMin.value = p.min;
    if (ruleMax) ruleMax.value = p.max;
    if (ruleUpper) ruleUpper.checked = p.upper;
    if (ruleLower) ruleLower.checked = p.lower;
    if (ruleDigit) ruleDigit.checked = p.digit;
    if (ruleSymbol) ruleSymbol.checked = p.symbol;
    if (ruleNoSeq) ruleNoSeq.checked = p.seq;
    if (ruleNoRep) ruleNoRep.checked = p.rep;
    if (ruleNotCommon) ruleNotCommon.checked = p.common;
    evaluate();
  }

  function evaluate() {
    const pwd = pwdInput ? pwdInput.value : '';
    const minLen = parseInt(ruleMin ? ruleMin.value : 8, 10);
    const maxLen = parseInt(ruleMax ? ruleMax.value : 64, 10);

    const rules = [
      { name: `Minimum length of ${minLen} characters`, pass: pwd.length >= minLen, active: true },
      { name: `Maximum length of ${maxLen} characters`, pass: pwd.length <= maxLen, active: true }
    ];

    if (ruleUpper && ruleUpper.checked) rules.push({ name: 'Contains uppercase letter (A-Z)', pass: /[A-Z]/.test(pwd), active: true });
    if (ruleLower && ruleLower.checked) rules.push({ name: 'Contains lowercase letter (a-z)', pass: /[a-z]/.test(pwd), active: true });
    if (ruleDigit && ruleDigit.checked) rules.push({ name: 'Contains at least one number (0-9)', pass: /[0-9]/.test(pwd), active: true });
    if (ruleSymbol && ruleSymbol.checked) rules.push({ name: 'Contains at least one symbol (!@#$...)', pass: /[^a-zA-Z0-9]/.test(pwd), active: true });
    
    if (ruleNoSeq && ruleNoSeq.checked) {
      const hasSeq = /(?:012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(pwd);
      rules.push({ name: 'No 3+ sequential characters (e.g. 123, abc)', pass: !hasSeq, active: true });
    }

    if (ruleNoRep && ruleNoRep.checked) {
      const hasRep = /(.)\1{2,}/.test(pwd);
      rules.push({ name: 'No 3+ repeated characters (e.g. aaa, 111)', pass: !hasRep, active: true });
    }

    if (ruleNotCommon && ruleNotCommon.checked) {
      const isCommon = commonPasswords.has(pwd.toLowerCase());
      rules.push({ name: 'Not in top common dictionary passwords list', pass: !isCommon && pwd.length > 0, active: true });
    }

    const bannedStr = ruleBanned ? ruleBanned.value.trim() : '';
    if (bannedStr.length > 0) {
      const words = bannedStr.split(',').map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
      let containsBanned = false;
      words.forEach(w => {
        if (pwd.toLowerCase().includes(w)) containsBanned = true;
      });
      rules.push({ name: `Contains no banned substrings (${words.join(', ')})`, pass: !containsBanned, active: true });
    }

    if (checklist) {
      checklist.innerHTML = '';
      rules.forEach(r => {
        const li = document.createElement('li');
        li.className = `checklist__item ${r.pass ? 'checklist__item--pass' : 'checklist__item--fail'}`;
        li.innerHTML = `<span>${r.pass ? '✓' : '✗'}</span> <span>${r.name}</span>`;
        checklist.appendChild(li);
      });
    }

    const allPassed = pwd.length > 0 && rules.every(r => r.pass);
    if (overallStatus) {
      overallStatus.textContent = allPassed ? 'COMPLIANT ✓' : 'NON-COMPLIANT ✗';
      overallStatus.className = `badge ${allPassed ? 'badge--success' : 'badge--danger'}`;
    }
  }

  if (presetSelect) presetSelect.addEventListener('change', applyPreset);
  if (pwdInput) pwdInput.addEventListener('input', evaluate);

  if (togglePwd && pwdInput) {
    togglePwd.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
    });
  }

  [ruleMin, ruleMax, ruleUpper, ruleLower, ruleDigit, ruleSymbol, ruleNoSeq, ruleNoRep, ruleNotCommon, ruleBanned].forEach(el => {
    if (el) {
      el.addEventListener('input', () => {
        if (presetSelect) presetSelect.value = 'custom';
        evaluate();
      });
      el.addEventListener('change', () => {
        if (presetSelect) presetSelect.value = 'custom';
        evaluate();
      });
    }
  });

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const policyData = {
        name: presetSelect ? presetSelect.value : 'custom',
        minLength: parseInt(ruleMin ? ruleMin.value : 8, 10),
        maxLength: parseInt(ruleMax ? ruleMax.value : 64, 10),
        requireUppercase: ruleUpper ? ruleUpper.checked : false,
        requireLowercase: ruleLower ? ruleLower.checked : false,
        requireDigit: ruleDigit ? ruleDigit.checked : false,
        requireSymbol: ruleSymbol ? ruleSymbol.checked : false,
        disallowSequential: ruleNoSeq ? ruleNoSeq.checked : false,
        disallowRepeated: ruleNoRep ? ruleNoRep.checked : false,
        checkCommonPasswords: ruleNotCommon ? ruleNotCommon.checked : true,
        bannedWords: ruleBanned ? ruleBanned.value.split(',').map(w => w.trim()).filter(Boolean) : []
      };
      const blob = new Blob([JSON.stringify(policyData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'password-policy.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  applyPreset();
});
