// tools/bulk-generator.js

// Standalone functions instead of importing from non-existent utils if not set up yet
// We'll implement secure generation here to ensure it works

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
const AMBIGUOUS = "Il1O0";

function getSecureRandomInt(max) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] % max;
}

function generateSinglePassword(length, options) {
    let charset = "";
    if (options.uppercase) charset += UPPERCASE;
    if (options.lowercase) charset += LOWERCASE;
    if (options.numbers) charset += NUMBERS;
    if (options.symbols) charset += SYMBOLS;
    
    if (charset === "") charset = LOWERCASE; // fallback

    if (options.excludeAmbiguous) {
        for (let i = 0; i < AMBIGUOUS.length; i++) {
            charset = charset.split(AMBIGUOUS[i]).join('');
        }
    }
    
    if (options.excludeChars) {
        for (let i = 0; i < options.excludeChars.length; i++) {
            charset = charset.split(options.excludeChars[i]).join('');
        }
    }

    if (charset === "") charset = "abcdef"; // absolute fallback if they excluded everything

    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset[getSecureRandomInt(charset.length)];
    }
    return password;
}

function calculateStrength(password) {
    let score = 0;
    if (password.length > 8) score += 1;
    if (password.length > 12) score += 1;
    if (password.length >= 16) score += 1;
    
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    if (score < 3) return { label: 'Weak', class: 'badge-danger' };
    if (score < 5) return { label: 'Fair', class: 'badge-warning' };
    if (score < 7) return { label: 'Good', class: 'badge-success' };
    return { label: 'Strong', class: 'badge-success' };
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
}

function exportAsTXT(data, filename) {
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function exportAsCSV(dataMatrix, filename) {
    const csvContent = dataMatrix.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
    const lengthSlider = document.getElementById('length-slider');
    const lengthDisplay = document.getElementById('length-display');
    const quantitySlider = document.getElementById('quantity-slider');
    const quantityDisplay = document.getElementById('quantity-display');
    
    const chkUpper = document.getElementById('chk-uppercase');
    const chkLower = document.getElementById('chk-lowercase');
    const chkNum = document.getElementById('chk-numbers');
    const chkSym = document.getElementById('chk-symbols');
    const chkExcAmb = document.getElementById('chk-exclude-ambiguous');
    const excChars = document.getElementById('exclude-chars');
    
    const generateBtn = document.getElementById('generate-btn');
    const tableBody = document.querySelector('#password-table tbody');
    
    const toggleRevealBtn = document.getElementById('toggle-reveal-btn');
    const copyAllBtn = document.getElementById('copy-all-btn');
    const exportTxtBtn = document.getElementById('export-txt-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');

    let currentPasswords = [];
    let allRevealed = false;

    lengthSlider.addEventListener('input', (e) => lengthDisplay.textContent = e.target.value);
    quantitySlider.addEventListener('input', (e) => quantityDisplay.textContent = e.target.value);

    generateBtn.addEventListener('click', () => {
        const length = parseInt(lengthSlider.value, 10);
        const qty = parseInt(quantitySlider.value, 10);
        
        const options = {
            uppercase: chkUpper.checked,
            lowercase: chkLower.checked,
            numbers: chkNum.checked,
            symbols: chkSym.checked,
            excludeAmbiguous: chkExcAmb.checked,
            excludeChars: excChars.value
        };

        currentPasswords = [];
        tableBody.innerHTML = '';
        allRevealed = false;
        toggleRevealBtn.textContent = 'Reveal All';

        // Use DocumentFragment for performance
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < qty; i++) {
            const pwd = generateSinglePassword(length, options);
            const strength = calculateStrength(pwd);
            currentPasswords.push({ pwd, strength: strength.label });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${i + 1}</td>
                <td>
                    <div class="pwd-cell">
                        <span class="pwd-text blurred" data-index="${i}">${pwd}</span>
                    </div>
                </td>
                <td><span class="badge ${strength.class}">${strength.label}</span></td>
                <td>
                    <button class="btn btn-icon copy-single" data-index="${i}">Copy</button>
                </td>
            `;
            fragment.appendChild(tr);
        }
        
        tableBody.appendChild(fragment);
        
        // Add listeners for individual blurred text toggle
        document.querySelectorAll('.pwd-text').forEach(el => {
            el.addEventListener('click', (e) => {
                e.target.classList.toggle('blurred');
            });
        });

        // Copy single
        document.querySelectorAll('.copy-single').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const idx = e.target.getAttribute('data-index');
                const success = await copyToClipboard(currentPasswords[idx].pwd);
                if (success) {
                    const orig = e.target.textContent;
                    e.target.textContent = 'Copied!';
                    setTimeout(() => e.target.textContent = orig, 1500);
                }
            });
        });
    });

    toggleRevealBtn.addEventListener('click', () => {
        allRevealed = !allRevealed;
        toggleRevealBtn.textContent = allRevealed ? 'Hide All' : 'Reveal All';
        document.querySelectorAll('.pwd-text').forEach(el => {
            if (allRevealed) {
                el.classList.remove('blurred');
            } else {
                el.classList.add('blurred');
            }
        });
    });

    copyAllBtn.addEventListener('click', async () => {
        if (!currentPasswords.length) return;
        const text = currentPasswords.map(p => p.pwd).join('\n');
        const success = await copyToClipboard(text);
        if (success) {
            copyAllBtn.textContent = 'Copied All!';
            setTimeout(() => copyAllBtn.textContent = 'Copy All', 2000);
        }
    });

    exportTxtBtn.addEventListener('click', () => {
        if (!currentPasswords.length) return;
        const text = currentPasswords.map(p => p.pwd).join('\n');
        exportAsTXT(text, 'passwords.txt');
    });

    exportCsvBtn.addEventListener('click', () => {
        if (!currentPasswords.length) return;
        const data = [["#", "Password", "Strength"]];
        currentPasswords.forEach((p, i) => {
            // escape quotes in password just in case
            const safePwd = p.pwd.replace(/"/g, '""');
            data.push([i + 1, `"${safePwd}"`, p.strength]);
        });
        exportAsCSV(data, 'passwords.csv');
    });
});
