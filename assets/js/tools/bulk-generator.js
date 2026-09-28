/**
 * Password Security Hub — Bulk Password Generator Tool
 */
import { generatePassword, calculateEntropy } from '../utils/crypto.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { exportAsTXT, exportAsCSV } from '../utils/export.js';

document.addEventListener('DOMContentLoaded', () => {
  const quantitySlider = document.getElementById('bulk-quantity');
  const quantityVal = document.getElementById('quantity-val');
  const lengthSlider = document.getElementById('bulk-length');
  const lengthVal = document.getElementById('length-val');
  
  const chkUpper = document.getElementById('bulk-upper');
  const chkLower = document.getElementById('bulk-lower');
  const chkNumbers = document.getElementById('bulk-numbers');
  const chkSymbols = document.getElementById('bulk-symbols');
  const chkAmbiguous = document.getElementById('bulk-exclude-ambiguous');
  
  const generateBtn = document.getElementById('generate-bulk-btn');
  const tableBody = document.getElementById('bulk-table-body');
  const copyAllBtn = document.getElementById('copy-all-bulk-btn');
  const exportTxtBtn = document.getElementById('export-bulk-txt-btn');
  const exportCsvBtn = document.getElementById('export-bulk-csv-btn');
  const toggleMaskBtn = document.getElementById('toggle-mask-btn');

  let generatedList = [];
  let isMasked = false;

  if (quantitySlider && quantityVal) {
    quantitySlider.addEventListener('input', (e) => {
      quantityVal.textContent = e.target.value;
    });
  }

  if (lengthSlider && lengthVal) {
    lengthSlider.addEventListener('input', (e) => {
      lengthVal.textContent = e.target.value;
    });
  }

  function getOptions() {
    return {
      length: parseInt(lengthSlider ? lengthSlider.value : 16, 10),
      uppercase: chkUpper ? chkUpper.checked : true,
      lowercase: chkLower ? chkLower.checked : true,
      numbers: chkNumbers ? chkNumbers.checked : true,
      symbols: chkSymbols ? chkSymbols.checked : true,
      excludeAmbiguous: chkAmbiguous ? chkAmbiguous.checked : false
    };
  }

  function generate() {
    const qty = parseInt(quantitySlider ? quantitySlider.value : 20, 10);
    const opts = getOptions();

    if (!opts.uppercase && !opts.lowercase && !opts.numbers && !opts.symbols) {
      if (chkLower) chkLower.checked = true;
      opts.lowercase = true;
    }

    generatedList = [];
    if (tableBody) tableBody.innerHTML = '';

    for (let i = 1; i <= qty; i++) {
      const pwd = generatePassword(opts);
      const entropy = calculateEntropy(pwd);
      generatedList.push({ id: i, password: pwd, entropy: `${entropy} bits` });

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i}</td>
        <td class="text-mono ${isMasked ? 'masked' : ''}" style="font-size: 14px; word-break: break-all;">${isMasked ? '••••••••••••' : pwd}</td>
        <td><span class="badge badge--success">${entropy} bits</span></td>
        <td><button type="button" class="btn btn--sm btn--secondary">Copy</button></td>
      `;
      tr.querySelector('button').addEventListener('click', () => {
        copyToClipboard(pwd, 'Password');
      });
      if (tableBody) tableBody.appendChild(tr);
    }
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', generate);
  }

  if (toggleMaskBtn) {
    toggleMaskBtn.addEventListener('click', () => {
      isMasked = !isMasked;
      generate();
    });
  }

  if (copyAllBtn) {
    copyAllBtn.addEventListener('click', () => {
      if (generatedList.length > 0) {
        copyToClipboard(generatedList.map(g => g.password).join('\n'), 'All Passwords');
      }
    });
  }

  if (exportTxtBtn) {
    exportTxtBtn.addEventListener('click', () => {
      if (generatedList.length > 0) {
        exportAsTXT(generatedList.map(g => g.password), 'passwords.txt');
      }
    });
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      if (generatedList.length > 0) {
        const headers = ['Index', 'Password', 'Entropy'];
        const rows = generatedList.map(g => [g.id, g.password, g.entropy]);
        exportAsCSV(headers, rows, 'passwords.csv');
      }
    });
  }

  generate();
});
