/**
 * Password Security Hub — Password Strength Checker Tool
 */
import { loadZxcvbn, analyzePassword, updateStrengthBar, formatCrackTimes, getCompositeScore, updateGauge, detectPatterns } from '../utils/strength.js';
import { calculateEntropy } from '../utils/crypto.js';

document.addEventListener('DOMContentLoaded', async () => {
  const pwdInput = document.getElementById('password-input');
  const toggleBtn = document.getElementById('toggle-visibility');
  const strengthBar = document.getElementById('strength-bar');
  const strengthScoreText = document.getElementById('strength-score-text');
  const entropyText = document.getElementById('entropy-text');
  
  const gaugeEl = document.getElementById('strength-gauge');
  const crackOnlineThrottled = document.getElementById('crack-online-throttled');
  const crackOnlineFast = document.getElementById('crack-online-fast');
  const crackOfflineSlow = document.getElementById('crack-offline-slow');
  const crackOfflineFast = document.getElementById('crack-offline-fast');
  
  const feedbackSection = document.getElementById('feedback-section');
  const patternsList = document.getElementById('patterns-list');
  const suggestionsBox = document.getElementById('suggestions-box');

  // Pre-load zxcvbn
  try {
    await loadZxcvbn();
  } catch (e) {
    console.warn('zxcvbn library loading notice:', e);
  }

  let debounceTimer;

  async function checkStrength() {
    const val = pwdInput.value;

    if (!val || val.length === 0) {
      if (strengthBar) {
        strengthBar.className = 'strength-bar';
        const fill = strengthBar.querySelector('.strength-bar__fill');
        if (fill) fill.style.width = '0%';
      }
      if (strengthScoreText) {
        strengthScoreText.textContent = 'Start typing...';
        strengthScoreText.className = 'strength-label';
      }
      if (entropyText) entropyText.textContent = '0 bits';
      if (crackOnlineThrottled) crackOnlineThrottled.textContent = '—';
      if (crackOnlineFast) crackOnlineFast.textContent = '—';
      if (crackOfflineSlow) crackOfflineSlow.textContent = '—';
      if (crackOfflineFast) crackOfflineFast.textContent = '—';
      if (gaugeEl) updateGauge(gaugeEl, 0, 0);
      if (feedbackSection) feedbackSection.classList.add('hidden');
      return;
    }

    try {
      const entropy = calculateEntropy(val);
      if (entropyText) entropyText.textContent = `${entropy} bits`;

      const analysis = await analyzePassword(val);
      const compositeScore = getCompositeScore(analysis.score, analysis.guessesLog10);

      // Strength Bar
      if (strengthBar) {
        updateStrengthBar(strengthBar, strengthScoreText, analysis.score);
      }

      // Gauge
      if (gaugeEl) {
        updateGauge(gaugeEl, compositeScore, analysis.score);
      }

      // Crack times
      const times = formatCrackTimes(analysis.crackTimesDisplay);
      if (crackOnlineThrottled) crackOnlineThrottled.textContent = times.onlineThrottled;
      if (crackOnlineFast) crackOnlineFast.textContent = times.onlineUnthrottled;
      if (crackOfflineSlow) crackOfflineSlow.textContent = times.offlineSlowHash;
      if (crackOfflineFast) crackOfflineFast.textContent = times.offlineFastHash;

      // Patterns & Feedback
      const patterns = detectPatterns(analysis.sequence);
      const warning = analysis.feedback?.warning;
      const suggestions = analysis.feedback?.suggestions || [];

      if (patterns.length > 0 || warning || suggestions.length > 0) {
        if (feedbackSection) feedbackSection.classList.remove('hidden');

        if (patternsList) {
          patternsList.innerHTML = '';
          if (warning) {
            const li = document.createElement('li');
            li.className = 'checklist__item checklist__item--fail';
            li.textContent = `⚠️ Warning: ${warning}`;
            patternsList.appendChild(li);
          }
          patterns.forEach(p => {
            const li = document.createElement('li');
            li.className = 'checklist__item';
            li.textContent = `• Pattern detected: ${p}`;
            patternsList.appendChild(li);
          });
        }

        if (suggestionsBox) {
          if (suggestions.length > 0) {
            suggestionsBox.innerHTML = `<strong>Recommendations:</strong><ul style="margin-top: 6px; padding-left: 18px;">${suggestions.map(s => `<li>${s}</li>`).join('')}</ul>`;
          } else {
            suggestionsBox.innerHTML = `<em>No specific suggestions. Password follows good complexity patterns.</em>`;
          }
        }
      } else {
        if (feedbackSection) feedbackSection.classList.add('hidden');
      }

    } catch (err) {
      console.error('Strength checking error:', err);
    }
  }

  if (pwdInput) {
    pwdInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(checkStrength, 150);
    });
  }

  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      toggleBtn.setAttribute('aria-label', isPwd ? 'Hide password' : 'Show password');
    });
  }
});
