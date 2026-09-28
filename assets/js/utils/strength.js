/**
 * Password Security Hub — Strength Meter Utility
 * Renders strength bar and formats crack time using zxcvbn
 */

let zxcvbnLoaded = false;
let zxcvbnModule = null;

/**
 * Lazy-load zxcvbn library
 * @returns {Promise<Function>}
 */
export async function loadZxcvbn() {
  if (zxcvbnModule) return zxcvbnModule;

  return new Promise((resolve, reject) => {
    if (typeof window.zxcvbn === 'function') {
      zxcvbnModule = window.zxcvbn;
      zxcvbnLoaded = true;
      resolve(zxcvbnModule);
      return;
    }

    const script = document.createElement('script');
    script.src = getBasePath() + 'assets/js/lib/zxcvbn.min.js';
    script.onload = () => {
      zxcvbnModule = window.zxcvbn;
      zxcvbnLoaded = true;
      resolve(zxcvbnModule);
    };
    script.onerror = () => reject(new Error('Failed to load zxcvbn'));
    document.head.appendChild(script);
  });
}

function getBasePath() {
  // Determine base path based on current page location
  const path = window.location.pathname;
  if (path.includes('/pages/')) {
    return '../';
  }
  return './';
}

/**
 * Analyze a password using zxcvbn
 * @param {string} password
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzePassword(password) {
  const zxcvbn = await loadZxcvbn();
  const result = zxcvbn(password);

  return {
    score: result.score, // 0-4
    crackTimesDisplay: result.crack_times_display,
    crackTimesSeconds: result.crack_times_seconds,
    feedback: result.feedback,
    guesses: result.guesses,
    guessesLog10: result.guesses_log10,
    sequence: result.sequence,
    calcTime: result.calc_time
  };
}

/**
 * Get strength label from score
 * @param {number} score - zxcvbn score (0-4)
 * @returns {Object} { label, class, percent }
 */
export function getStrengthInfo(score) {
  const map = {
    0: { label: 'Very Weak', cssClass: 'very-weak', percent: 10, color: 'danger' },
    1: { label: 'Weak', cssClass: 'weak', percent: 25, color: 'danger' },
    2: { label: 'Fair', cssClass: 'fair', percent: 50, color: 'warning' },
    3: { label: 'Strong', cssClass: 'strong', percent: 75, color: 'success' },
    4: { label: 'Very Strong', cssClass: 'very-strong', percent: 100, color: 'success' }
  };
  return map[score] || map[0];
}

/**
 * Update a strength bar element
 * @param {HTMLElement} barContainer - The .strength-bar container
 * @param {HTMLElement} labelElement - The .strength-label element
 * @param {number} score - zxcvbn score (0-4)
 */
export function updateStrengthBar(barContainer, labelElement, score) {
  const info = getStrengthInfo(score);

  // Remove all strength classes
  barContainer.className = 'strength-bar';
  barContainer.classList.add(`strength-bar--${info.cssClass}`);

  if (labelElement) {
    labelElement.textContent = info.label;
    labelElement.className = 'strength-label';
    labelElement.classList.add(`strength-label--${info.cssClass}`);
  }
}

/**
 * Format crack time for display
 * @param {Object} crackTimes - zxcvbn crack_times_display object
 * @returns {Object} Formatted crack times
 */
export function formatCrackTimes(crackTimes) {
  return {
    onlineThrottled: crackTimes.online_throttling_100_per_hour || 'N/A',
    onlineUnthrottled: crackTimes.online_no_throttling_10_per_second || 'N/A',
    offlineSlowHash: crackTimes.offline_slow_hashing_1e4_per_second || 'N/A',
    offlineFastHash: crackTimes.offline_fast_hashing_1e10_per_second || 'N/A'
  };
}

/**
 * Get a composite score (0-100) from zxcvbn analysis
 * @param {number} score - zxcvbn score (0-4)
 * @param {number} guessesLog10 - Log10 of guesses
 * @returns {number} Score 0-100
 */
export function getCompositeScore(score, guessesLog10) {
  // Map score 0-4 to base range, then refine with guesses
  const baseScores = [5, 20, 45, 70, 90];
  const base = baseScores[score] || 0;

  // Add bonus based on guesses (capped)
  const bonus = Math.min(10, Math.max(0, (guessesLog10 - 6) * 1.5));

  return Math.min(100, Math.round(base + bonus));
}

/**
 * Update a circular gauge SVG
 * @param {HTMLElement} gaugeElement - The .gauge element
 * @param {number} value - Value 0-100
 * @param {number} score - zxcvbn score (0-4) for coloring
 */
export function updateGauge(gaugeElement, value, score) {
  const fill = gaugeElement.querySelector('.gauge__fill');
  const valueEl = gaugeElement.querySelector('.gauge__value span') ||
                  gaugeElement.querySelector('.gauge__value');
  const info = getStrengthInfo(score);

  // Circle calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  fill.style.strokeDasharray = circumference;
  fill.style.strokeDashoffset = offset;

  // Color based on score
  const colors = {
    danger: 'var(--danger)',
    warning: 'var(--warning)',
    success: 'var(--success)'
  };
  fill.style.stroke = colors[info.color] || colors.danger;

  if (valueEl) {
    const spanEl = valueEl.querySelector('span');
    if (spanEl) {
      spanEl.textContent = value;
    } else {
      valueEl.textContent = value;
    }
  }
}

/**
 * Detect patterns in a password
 * @param {Array} sequence - zxcvbn sequence array
 * @returns {string[]} Array of pattern descriptions
 */
export function detectPatterns(sequence) {
  if (!sequence || sequence.length === 0) return [];

  const patternNames = {
    dictionary: 'Dictionary word',
    spatial: 'Keyboard pattern',
    repeat: 'Repeated characters',
    sequence: 'Sequential characters',
    date: 'Date pattern',
    bruteforce: 'Random characters',
    regex: 'Common pattern'
  };

  return sequence
    .filter(s => s.pattern !== 'bruteforce')
    .map(s => {
      const name = patternNames[s.pattern] || s.pattern;
      const token = s.token ? ` ("${s.token}")` : '';
      return `${name}${token}`;
    });
}
