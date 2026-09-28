import { generatePassword, calculateEntropy } from '../utils/crypto.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { loadZxcvbn, analyzePassword, updateStrengthBar, formatCrackTimes, getStrengthInfo } from '../utils/strength.js';

document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const lengthSlider = document.getElementById('length-slider');
    const lengthDisplay = document.getElementById('length-display');
    const lengthWarning = document.getElementById('length-warning');
    
    const chkUpper = document.getElementById('chk-uppercase');
    const chkLower = document.getElementById('chk-lowercase');
    const chkNumbers = document.getElementById('chk-numbers');
    const chkSymbols = document.getElementById('chk-symbols');
    const chkExcludeAmbiguous = document.getElementById('chk-exclude-ambiguous');
    const customExclude = document.getElementById('custom-exclude');
    
    const generateMultipleToggle = document.getElementById('generate-multiple-toggle');
    const quantityContainer = document.getElementById('quantity-container');
    const quantitySelector = document.getElementById('quantity-selector');
    
    const passwordOutput = document.getElementById('password-output');
    const toggleVisibilityBtn = document.getElementById('toggle-visibility-btn');
    const copyBtn = document.getElementById('copy-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const generatorForm = document.getElementById('generator-form');
    
    const strengthBar = document.getElementById('strength-bar');
    const crackTimeDisplay = document.getElementById('crack-time');
    const entropyDisplay = document.getElementById('entropy');
    const strengthFeedback = document.getElementById('strength-feedback');
    const multiplePasswordsContainer = document.getElementById('multiple-passwords-container');

    let currentPassword = '';
    let isPasswordVisible = true;

    // Initialize strength library
    try {
        await loadZxcvbn();
    } catch(e) {
        console.warn('Failed to load zxcvbn strength estimation library');
    }

    // Handlers
    const updateLengthDisplay = () => {
        const val = parseInt(lengthSlider.value, 10);
        lengthDisplay.textContent = val;
        if (val < 12) {
            lengthWarning.classList.remove('hidden');
        } else {
            lengthWarning.classList.add('hidden');
        }
    };

    const validateCheckboxes = (changedEl) => {
        const checkedCount = [chkUpper, chkLower, chkNumbers, chkSymbols].filter(el => el.checked).length;
        if (checkedCount === 0) {
            changedEl.checked = true; // prevent unchecking the last one
        }
    };

    const getGenerationOptions = () => {
        return {
            length: parseInt(lengthSlider.value, 10),
            uppercase: chkUpper.checked,
            lowercase: chkLower.checked,
            numbers: chkNumbers.checked,
            symbols: chkSymbols.checked,
            excludeAmbiguous: chkExcludeAmbiguous.checked,
            customExclude: customExclude.value || ''
        };
    };

    const handleGenerate = () => {
        const options = getGenerationOptions();
        const isMultiple = generateMultipleToggle.checked;
        
        if (isMultiple) {
            const quantity = Math.min(Math.max(parseInt(quantitySelector.value, 10) || 5, 2), 10);
            const passwords = [];
            for (let i = 0; i < quantity; i++) {
                passwords.push(generatePassword(options));
            }
            displayMultiplePasswords(passwords);
            
            // Analyze the first password for strength
            currentPassword = passwords[0];
        } else {
            multiplePasswordsContainer.classList.add('hidden');
            multiplePasswordsContainer.innerHTML = '';
            currentPassword = generatePassword(options);
        }
        
        updatePasswordDisplay();
        analyzeCurrentPassword();
    };

    const displayMultiplePasswords = (passwords) => {
        multiplePasswordsContainer.classList.remove('hidden');
        multiplePasswordsContainer.innerHTML = '';
        passwords.forEach(pwd => {
            const row = document.createElement('div');
            row.className = 'password-list-item';
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'center';
            row.style.padding = '8px';
            row.style.borderBottom = '1px solid var(--border)';
            
            const pwdText = document.createElement('span');
            pwdText.style.fontFamily = 'var(--font-mono, "JetBrains Mono", monospace)';
            pwdText.style.wordBreak = 'break-all';
            pwdText.textContent = isPasswordVisible ? pwd : '•'.repeat(pwd.length);
            
            const copyItemBtn = document.createElement('button');
            copyItemBtn.className = 'btn btn-sm btn-secondary';
            copyItemBtn.textContent = 'Copy';
            copyItemBtn.onclick = () => {
                copyToClipboard(pwd);
                copyItemBtn.textContent = 'Copied!';
                setTimeout(() => copyItemBtn.textContent = 'Copy', 2000);
            };
            
            row.appendChild(pwdText);
            row.appendChild(copyItemBtn);
            multiplePasswordsContainer.appendChild(row);
        });
    };

    const updatePasswordDisplay = () => {
        if (!currentPassword) return;
        
        passwordOutput.textContent = isPasswordVisible ? currentPassword : '•'.repeat(currentPassword.length);
    };

    const analyzeCurrentPassword = () => {
        if (!currentPassword) return;
        
        const options = getGenerationOptions();
        const poolSize = (options.uppercase ? 26 : 0) + (options.lowercase ? 26 : 0) + (options.numbers ? 10 : 0) + (options.symbols ? 32 : 0);
        
        let entropy = 0;
        if (poolSize > 0) {
            entropy = calculateEntropy(options.length, poolSize);
        }
        entropyDisplay.textContent = `Entropy: ${Math.round(entropy)} bits`;

        const analysis = analyzePassword(currentPassword);
        if (analysis) {
            updateStrengthBar(strengthBar, analysis.score);
            crackTimeDisplay.textContent = `Crack Time: ${formatCrackTimes(analysis.crack_times_display)}`;
            const strengthInfo = getStrengthInfo(analysis.score);
            strengthFeedback.textContent = strengthInfo.label;
            strengthFeedback.style.color = `var(--${strengthInfo.colorClass.replace('text-', '')})`;
            
            if (analysis.feedback.warning) {
                strengthFeedback.textContent += ` - ${analysis.feedback.warning}`;
            }
        } else {
            const score = Math.min(4, Math.floor(entropy / 25));
            updateStrengthBar(strengthBar, score);
            crackTimeDisplay.textContent = 'Crack Time: Unknown';
        }
    };

    // Event Listeners
    lengthSlider.addEventListener('input', () => {
        updateLengthDisplay();
        handleGenerate();
    });

    [chkUpper, chkLower, chkNumbers, chkSymbols].forEach(chk => {
        chk.addEventListener('change', (e) => {
            validateCheckboxes(e.target);
            handleGenerate();
        });
    });
    
    chkExcludeAmbiguous.addEventListener('change', handleGenerate);
    customExclude.addEventListener('input', handleGenerate);

    generateMultipleToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            quantityContainer.classList.remove('hidden');
        } else {
            quantityContainer.classList.add('hidden');
            multiplePasswordsContainer.classList.add('hidden');
        }
        handleGenerate();
    });
    
    quantitySelector.addEventListener('input', handleGenerate);

    generatorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleGenerate();
    });
    
    regenerateBtn.addEventListener('click', handleGenerate);

    copyBtn.addEventListener('click', () => {
        if (currentPassword) {
            copyToClipboard(currentPassword);
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = originalText, 2000);
        }
    });

    toggleVisibilityBtn.addEventListener('click', () => {
        isPasswordVisible = !isPasswordVisible;
        toggleVisibilityBtn.textContent = isPasswordVisible ? 'Hide' : 'Show';
        updatePasswordDisplay();
        
        if (generateMultipleToggle.checked && multiplePasswordsContainer.children.length > 0) {
            handleGenerate();
        }
    });

    // Initial setup
    updateLengthDisplay();
    handleGenerate();
});
