/**
 * Password Security Hub — Clipboard Utility
 */

import { showToast } from './toast.js';

/**
 * Copy text to clipboard with toast feedback
 * @param {string} text - Text to copy
 * @param {string} [label='Text'] - Label for toast message
 */
export async function copyToClipboard(text, label = 'Text') {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    showToast(`${label} copied to clipboard!`, 'success');
  } catch (err) {
    showToast('Failed to copy. Please try again.', 'error');
    console.error('Copy failed:', err);
  }
}

/**
 * Initialize copy buttons with data-copy attribute
 */
export function initCopyButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;

    const targetId = btn.getAttribute('data-copy');
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const text = targetEl.textContent || targetEl.value;
      copyToClipboard(text, 'Text');
    }
  });
}
