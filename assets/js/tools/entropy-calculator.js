// Simulated import for modularity
const calculateEntropy = (password) => {
    let r = 0;
    if (/[a-z]/.test(password)) r += 26;
    if (/[A-Z]/.test(password)) r += 26;
    if (/[0-9]/.test(password)) r += 10;
    if (/[^a-zA-Z0-9]/.test(password)) r += 33;
    
    if (password.length > 0 && r === 0) r = 1;
    const l = password.length;
    const entropy = l === 0 ? 0 : l * Math.log2(r);
    return { entropy, l, r };
};

const calculatePolicyEntropy = (l, r) => {
    return { entropy: l * Math.log2(r), l, r };
};

document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const analyzeInput = document.getElementById('analyze-password');
    const toggleAnalyzeVisibility = document.getElementById('toggle-analyze-visibility');
    
    const charsetSizeInput = document.getElementById('charset-size');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const passwordLengthInput = document.getElementById('password-length');
    const lengthVal = document.getElementById('length-val');
    
    const entropyValue = document.getElementById('entropy-value');
    const entropyMeter = document.getElementById('entropy-meter');
    const strengthCategory = document.getElementById('strength-category');
    const calculationSteps = document.getElementById('calculation-steps');
    const copyBtn = document.getElementById('copy-entropy');
    const detectedR = document.getElementById('detected-r');

    let currentMode = 'analyze-mode';

    const updateUI = (entropy, l, r) => {
        const bits = Math.max(0, Math.round(entropy * 100) / 100);
        entropyValue.textContent = bits;
        calculationSteps.textContent = `E = ${l} * log2(${r || 0}) = ${bits} bits`;
        
        let strength = 'Very Weak';
        let color = 'var(--danger)';

        if (bits === 0) { strength = 'None'; color = 'var(--bg-tertiary)'; }
        else if (bits < 28) { strength = 'Very Weak'; color = 'var(--danger)'; }
        else if (bits < 36) { strength = 'Weak'; color = 'var(--warning)'; }
        else if (bits < 60) { strength = 'Fair'; color = 'var(--warning)'; }
        else if (bits < 128) { strength = 'Strong'; color = 'var(--success)'; }
        else { strength = 'Very Strong'; color = 'var(--success)'; }

        strengthCategory.textContent = strength;
        entropyMeter.style.width = `${Math.min(100, (bits / 128) * 100)}%`;
        entropyMeter.style.backgroundColor = color;
    };

    const handleAnalyze = () => {
        const pwd = analyzeInput.value;
        const res = calculateEntropy(pwd);
        detectedR.textContent = res.r;
        updateUI(res.entropy, res.l, res.r);
    };

    const handlePolicy = () => {
        const r = parseInt(charsetSizeInput.value) || 2;
        const l = parseInt(passwordLengthInput.value) || 1;
        const res = calculatePolicyEntropy(l, r);
        updateUI(res.entropy, res.l, res.r);
    };

    const update = () => {
        if (currentMode === 'analyze-mode') handleAnalyze();
        else handlePolicy();
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');
            
            btn.classList.add('active');
            currentMode = btn.dataset.target;
            document.getElementById(currentMode).style.display = 'block';
            update();
        });
    });

    toggleAnalyzeVisibility.addEventListener('click', () => {
        const type = analyzeInput.getAttribute('type') === 'password' ? 'text' : 'password';
        analyzeInput.setAttribute('type', type);
        toggleAnalyzeVisibility.textContent = type === 'password' ? 'Show' : 'Hide';
    });

    analyzeInput.addEventListener('input', update);
    charsetSizeInput.addEventListener('input', update);
    
    passwordLengthInput.addEventListener('input', (e) => {
        lengthVal.textContent = e.target.value;
        update();
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            charsetSizeInput.value = btn.dataset.r;
            update();
        });
    });

    copyBtn.addEventListener('click', () => {
        const text = `Entropy: ${entropyValue.textContent} bits\nStrength: ${strengthCategory.textContent}\nCalculation: ${calculationSteps.textContent}`;
        navigator.clipboard.writeText(text);
    });

    update();
});
