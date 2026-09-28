/**
 * Password Security Hub — Hash Generator Tool
 */
import { copyToClipboard } from '../utils/clipboard.js';

document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('hash-text-input');
  const dropZone = document.getElementById('file-drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileNameDisplay = document.getElementById('file-name-display');
  const caseToggleBtn = document.getElementById('case-toggle-btn');
  const clearBtn = document.getElementById('clear-hash-btn');
  
  const md5El = document.getElementById('hash-md5');
  const sha1El = document.getElementById('hash-sha1');
  const sha256El = document.getElementById('hash-sha256');
  const sha384El = document.getElementById('hash-sha384');
  const sha512El = document.getElementById('hash-sha512');
  
  const copyBtns = document.querySelectorAll('.copy-hash-btn');

  let isUppercase = false;
  let currentHashes = { md5: '', sha1: '', sha256: '', sha384: '', sha512: '' };
  let debounceTimer;

  async function computeHashForBuffer(buffer) {
    const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
    const results = {};

    for (const algo of algos) {
      try {
        const hashBuf = await crypto.subtle.digest(algo, buffer);
        const hashHex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
        results[algo.toLowerCase().replace('-', '')] = hashHex;
      } catch (err) {
        results[algo.toLowerCase().replace('-', '')] = 'Error';
      }
    }

    // MD5 computation
    try {
      if (typeof window.md5 === 'function') {
        const uint8 = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        results['md5'] = window.md5(binary);
      } else {
        results['md5'] = 'MD5 library not loaded';
      }
    } catch (e) {
      results['md5'] = 'Error';
    }

    currentHashes = results;
    renderHashes();
  }

  function renderHashes() {
    const format = (h) => isUppercase ? h.toUpperCase() : h.toLowerCase();
    if (md5El) md5El.textContent = currentHashes.md5 ? format(currentHashes.md5) : '—';
    if (sha1El) sha1El.textContent = currentHashes.sha1 ? format(currentHashes.sha1) : '—';
    if (sha256El) sha256El.textContent = currentHashes.sha256 ? format(currentHashes.sha256) : '—';
    if (sha384El) sha384El.textContent = currentHashes.sha384 ? format(currentHashes.sha384) : '—';
    if (sha512El) sha512El.textContent = currentHashes.sha512 ? format(currentHashes.sha512) : '—';
  }

  function hashText() {
    const txt = textInput ? textInput.value : '';
    if (!txt) {
      currentHashes = { md5: '', sha1: '', sha256: '', sha384: '', sha512: '' };
      renderHashes();
      return;
    }
    const encoder = new TextEncoder();
    const buffer = encoder.encode(txt);
    computeHashForBuffer(buffer);
  }

  if (textInput) {
    textInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(hashText, 150);
    });
  }

  // File Drop
  if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        processFile(fileInput.files[0]);
      }
    });
  }

  function processFile(file) {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10 MB maximum limit for browser hashing.');
      return;
    }
    if (fileNameDisplay) {
      fileNameDisplay.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      fileNameDisplay.classList.remove('hidden');
    }
    if (textInput) textInput.value = '';

    const reader = new FileReader();
    reader.onload = (e) => {
      computeHashForBuffer(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  }

  if (caseToggleBtn) {
    caseToggleBtn.addEventListener('click', () => {
      isUppercase = !isUppercase;
      renderHashes();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (textInput) textInput.value = '';
      if (fileNameDisplay) fileNameDisplay.classList.add('hidden');
      if (fileInput) fileInput.value = '';
      currentHashes = { md5: '', sha1: '', sha256: '', sha384: '', sha512: '' };
      renderHashes();
    });
  }

  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl && targetEl.textContent && targetEl.textContent !== '—') {
        copyToClipboard(targetEl.textContent, 'Hash');
      }
    });
  });
});
