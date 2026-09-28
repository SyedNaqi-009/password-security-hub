import { generatePIN } from '../utils/crypto.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { exportAsText } from '../utils/export.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pin-generator-form');
    const lengthRadios = document.querySelectorAll('input[name="pinLengthPreset"]');
    const customLengthContainer = document.getElementById('custom-length-container');
    const customLengthInput = document.getElementById('customLength');
    const quantityInput = document.getElementById('pinQuantity');
    const noSequentialCb = document.getElementById('noSequential');
    const noRepeatedCb = document.getElementById('noRepeated');
    const outputList = document.getElementById('pin-output-list');
    const copyAllBtn = document.getElementById('copy-all-btn');
    const exportTxtBtn = document.getElementById('export-txt-btn');

    let currentPins = [];

    // Handle radio changes for custom length display
    lengthRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customLengthContainer.style.display = 'block';
            } else {
                customLengthContainer.style.display = 'none';
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let length = 4;
        const selectedPreset = document.querySelector('input[name="pinLengthPreset"]:checked').value;
        if (selectedPreset === 'custom') {
            length = parseInt(customLengthInput.value, 10);
            if (length < 3) length = 3;
            if (length > 12) length = 12;
        } else {
            length = parseInt(selectedPreset, 10);
        }

        let quantity = parseInt(quantityInput.value, 10);
        if (quantity < 1) quantity = 1;
        if (quantity > 20) quantity = 20;

        const options = {
            noSequential: noSequentialCb.checked,
            noRepeated: noRepeatedCb.checked
        };

        currentPins = [];
        for (let i = 0; i < quantity; i++) {
            currentPins.push(generatePIN(length, options));
        }

        renderPins();
    });

    function renderPins() {
        outputList.innerHTML = '';
        currentPins.forEach((pin, index) => {
            const li = document.createElement('li');
            li.className = 'pin-item';
            
            const pinText = document.createElement('span');
            pinText.textContent = pin;
            pinText.className = 'pin-text';
            
            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copy';
            copyBtn.className = 'btn btn-small';
            copyBtn.setAttribute('aria-label', `Copy PIN ${index + 1}`);
            copyBtn.addEventListener('click', () => copyToClipboard(pin));

            li.appendChild(pinText);
            li.appendChild(copyBtn);
            outputList.appendChild(li);
        });
    }

    copyAllBtn.addEventListener('click', () => {
        if (currentPins.length > 0) {
            copyToClipboard(currentPins.join('\n'));
        }
    });

    exportTxtBtn.addEventListener('click', () => {
        if (currentPins.length > 0) {
            exportAsText(currentPins.join('\n'), 'secure-pins.txt');
        }
    });
});
