// tools/security-code-generator.js

function getSecureRandomInt(max) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return randomBuffer[0] % max;
}

function getSecureRandomBytes(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
}

function generateOTP(length) {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += digits[getSecureRandomInt(10)];
    }
    // Format OTP (e.g. 123456 -> 123 456)
    if (length === 6) return `${otp.slice(0,3)} ${otp.slice(3)}`;
    if (length > 6) {
        return otp.match(/.{1,3}/g).join(' '); // group by 3
    }
    return otp;
}

function generateAlphanumericToken(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
        token += chars[getSecureRandomInt(chars.length)];
    }
    return token;
}

function generateHexKey(length) {
    const bytes = getSecureRandomBytes(Math.ceil(length / 2));
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, length).toUpperCase();
}

function generateUUID() {
    return crypto.randomUUID();
}

function generateBase64Token(length) {
    // Generate enough bytes so that the base64 string meets the length requirement
    // 3 bytes = 4 base64 characters
    const byteLength = Math.ceil((length * 3) / 4);
    const bytes = getSecureRandomBytes(byteLength);
    
    // btoa expects a string
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    
    const base64 = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    return base64.slice(0, length);
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

document.addEventListener('DOMContentLoaded', () => {
    const typeButtons = document.querySelectorAll('.pill-btn');
    const lengthConfig = document.getElementById('length-config');
    const lengthSlider = document.getElementById('length-slider');
    const lengthDisplay = document.getElementById('length-display');
    const quantitySlider = document.getElementById('quantity-slider');
    const quantityDisplay = document.getElementById('quantity-display');
    const generateBtn = document.getElementById('generate-btn');
    const codeOutputList = document.getElementById('code-output-list');
    
    const copyAllBtn = document.getElementById('copy-all-btn');
    const exportTxtBtn = document.getElementById('export-txt-btn');

    let currentType = 'otp';
    let currentCodes = [];

    const typeConfig = {
        'otp': { min: 4, max: 12, default: 6, hasLength: true },
        'alpha': { min: 8, max: 256, default: 32, hasLength: true },
        'hex': { min: 8, max: 128, default: 32, hasLength: true },
        'uuid': { hasLength: false },
        'base64': { min: 8, max: 256, default: 32, hasLength: true }
    };

    function updateConfigUI(type) {
        currentType = type;
        const config = typeConfig[type];
        
        typeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });

        if (config.hasLength) {
            lengthConfig.style.display = 'block';
            lengthSlider.min = config.min;
            lengthSlider.max = config.max;
            lengthSlider.value = config.default;
            lengthDisplay.textContent = config.default;
        } else {
            lengthConfig.style.display = 'none';
        }
    }

    typeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            updateConfigUI(e.target.dataset.type);
            generateCodes(); // Auto-generate on type switch
        });
    });

    lengthSlider.addEventListener('input', (e) => {
        lengthDisplay.textContent = e.target.value;
    });

    quantitySlider.addEventListener('input', (e) => {
        quantityDisplay.textContent = e.target.value;
    });

    function generateCodes() {
        const qty = parseInt(quantitySlider.value, 10);
        const len = parseInt(lengthSlider.value, 10);
        
        currentCodes = [];
        codeOutputList.innerHTML = '';

        for (let i = 0; i < qty; i++) {
            let code = "";
            switch (currentType) {
                case 'otp': code = generateOTP(len); break;
                case 'alpha': code = generateAlphanumericToken(len); break;
                case 'hex': code = generateHexKey(len); break;
                case 'uuid': code = generateUUID(); break;
                case 'base64': code = generateBase64Token(len); break;
            }
            currentCodes.push(code);

            const div = document.createElement('div');
            div.className = 'code-item';
            
            // Clean up code for copy value (remove spaces from OTP)
            const copyValue = currentType === 'otp' ? code.replace(/\s/g, '') : code;
            
            div.innerHTML = `
                <span class="code-text" style="font-family: 'JetBrains Mono', monospace; word-break: break-all;">${code}</span>
                <button class="btn btn-icon copy-single" data-copy="${copyValue}">Copy</button>
            `;
            codeOutputList.appendChild(div);
        }

        // Attach copy events
        document.querySelectorAll('.copy-single').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const text = e.target.getAttribute('data-copy');
                const success = await copyToClipboard(text);
                if (success) {
                    const orig = e.target.textContent;
                    e.target.textContent = 'Copied!';
                    setTimeout(() => e.target.textContent = orig, 1500);
                }
            });
        });
    }

    generateBtn.addEventListener('click', generateCodes);

    copyAllBtn.addEventListener('click', async () => {
        if (!currentCodes.length) return;
        // Clean up OTPs for copying all
        const textToCopy = currentCodes.map(c => currentType === 'otp' ? c.replace(/\s/g, '') : c).join('\n');
        const success = await copyToClipboard(textToCopy);
        if (success) {
            copyAllBtn.textContent = 'Copied All!';
            setTimeout(() => copyAllBtn.textContent = 'Copy All', 2000);
        }
    });

    exportTxtBtn.addEventListener('click', () => {
        if (!currentCodes.length) return;
        const textToExport = currentCodes.map(c => currentType === 'otp' ? c.replace(/\s/g, '') : c).join('\n');
        exportAsTXT(textToExport, 'security_codes.txt');
    });

    // Initial generation
    generateCodes();
});
