document.addEventListener('DOMContentLoaded', async () => {
    const presetSelect = document.getElementById('policy-preset');
    const pwdInput = document.getElementById('check-password');
    const togglePwd = document.getElementById('toggle-pwd-visibility');
    
    const rulesPanel = document.getElementById('rules-panel');
    const toggleRulesBtn = document.getElementById('toggle-rules');
    
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
    
    let commonPasswords = new Set(['password', '123456', 'qwerty', 'admin']);
    try {
        const res = await fetch('../assets/data/common-passwords.json');
        if (res.ok) {
            const data = await res.json();
            commonPasswords = new Set(data);
        }
    } catch (e) {
        console.warn('Could not load common passwords, using fallback list', e);
    }

    const presets = {
        nist: { min: 8, max: 64, upper: false, lower: false, digit: false, symbol: false, seq: false, rep: false, common: true },
        pci: { min: 12, max: 128, upper: true, lower: true, digit: true, symbol: true, seq: false, rep: false, common: false },
        hipaa: { min: 8, max: 128, upper: true, lower: true, digit: true, symbol: true, seq: false, rep: false, common: false },
        custom: { min: 8, max: 64, upper: true, lower: true, digit: true, symbol: true, seq: true, rep: true, common: true }
    };

    const applyPreset = () => {
        const p = presets[presetSelect.value];
        ruleMin.value = p.min;
        ruleMax.value = p.max;
        ruleUpper.checked = p.upper;
        ruleLower.checked = p.lower;
        ruleDigit.checked = p.digit;
        ruleSymbol.checked = p.symbol;
        ruleNoSeq.checked = p.seq;
        ruleNoRep.checked = p.rep;
        ruleNotCommon.checked = p.common;
        if (presetSelect.value !== 'custom') {
            rulesPanel.style.display = 'none';
        } else {
            rulesPanel.style.display = 'block';
        }
        checkPolicy();
    };

    presetSelect.addEventListener('change', applyPreset);
    toggleRulesBtn.addEventListener('click', () => {
        presetSelect.value = 'custom';
        applyPreset();
        rulesPanel.style.display = 'block';
    });

    const checkPolicy = () => {
        const pwd = pwdInput.value;
        const results = [];
        let compliant = true;
        
        const addCheck = (name, passed) => {
            results.push({ name, passed });
            if (!passed) compliant = false;
        };

        const min = parseInt(ruleMin.value) || 0;
        const max = parseInt(ruleMax.value) || 128;
        addCheck(`Length between ${min} and ${max}`, pwd.length >= min && pwd.length <= max);
        
        if (ruleUpper.checked) addCheck('Contains uppercase', /[A-Z]/.test(pwd));
        if (ruleLower.checked) addCheck('Contains lowercase', /[a-z]/.test(pwd));
        if (ruleDigit.checked) addCheck('Contains digit', /[0-9]/.test(pwd));
        if (ruleSymbol.checked) addCheck('Contains symbol', /[^a-zA-Z0-9]/.test(pwd));
        
        if (ruleNoSeq.checked) {
            addCheck('No sequential chars (e.g. 123, abc)', !/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(pwd));
        }
        if (ruleNoRep.checked) {
            addCheck('No repeated chars (3+)', !/(.)\1{2,}/.test(pwd));
        }
        if (ruleNotCommon.checked) {
            addCheck('Not in common passwords list', pwd.length > 0 && !commonPasswords.has(pwd.toLowerCase()));
        }
        
        const banned = ruleBanned.value.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        if (banned.length > 0) {
            const hasBanned = banned.some(b => pwd.toLowerCase().includes(b));
            addCheck('No custom banned words', !hasBanned || pwd.length === 0);
        }

        checklist.innerHTML = results.map(r => 
            `<li style="color: ${r.passed ? 'var(--success)' : 'var(--danger)'}; margin-bottom: 5px;">
                <span aria-hidden="true">${r.passed ? '✓' : '✗'}</span> ${r.name}
            </li>`
        ).join('');

        if (pwd.length === 0) compliant = false;

        overallStatus.textContent = compliant ? 'COMPLIANT ✓' : 'NON-COMPLIANT ✗';
        overallStatus.style.color = compliant ? 'var(--success)' : 'var(--danger)';
    };

    [ruleMin, ruleMax, ruleBanned, pwdInput].forEach(el => el.addEventListener('input', checkPolicy));
    [ruleUpper, ruleLower, ruleDigit, ruleSymbol, ruleNoSeq, ruleNoRep, ruleNotCommon].forEach(el => el.addEventListener('change', checkPolicy));

    togglePwd.addEventListener('click', () => {
        const type = pwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
        pwdInput.setAttribute('type', type);
        togglePwd.textContent = type === 'password' ? 'Show' : 'Hide';
    });

    exportBtn.addEventListener('click', () => {
        const policy = {
            min: parseInt(ruleMin.value),
            max: parseInt(ruleMax.value),
            upper: ruleUpper.checked,
            lower: ruleLower.checked,
            digit: ruleDigit.checked,
            symbol: ruleSymbol.checked,
            noSeq: ruleNoSeq.checked,
            noRep: ruleNoRep.checked,
            notCommon: ruleNotCommon.checked,
            banned: ruleBanned.value.split(',').map(s => s.trim()).filter(s => s)
        };
        const blob = new Blob([JSON.stringify(policy, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'password-policy.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    applyPreset();
});
