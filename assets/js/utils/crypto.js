/**
 * Password Security Hub — Crypto Utilities
 * CSPRNG wrapper using Web Crypto API
 * NEVER uses Math.random()
 */

/**
 * Generate a cryptographically secure random integer in [0, max)
 * @param {number} max - Exclusive upper bound
 * @returns {number}
 */
export function getSecureRandomInt(max) {
  if (max <= 0) throw new RangeError('max must be positive');
  if (max === 1) return 0;

  const array = new Uint32Array(1);
  const maxValid = Math.floor(0xFFFFFFFF / max) * max;

  do {
    crypto.getRandomValues(array);
  } while (array[0] >= maxValid);

  return array[0] % max;
}

/**
 * Generate an array of cryptographically secure random bytes
 * @param {number} length - Number of bytes
 * @returns {Uint8Array}
 */
export function getSecureRandomBytes(length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

/**
 * Securely shuffle an array in-place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} The same array, shuffled
 */
export function secureShuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generate a random password with given options
 * @param {Object} options
 * @param {number} options.length - Password length
 * @param {boolean} options.uppercase - Include uppercase letters
 * @param {boolean} options.lowercase - Include lowercase letters
 * @param {boolean} options.numbers - Include digits
 * @param {boolean} options.symbols - Include symbols
 * @param {boolean} options.excludeAmbiguous - Exclude ambiguous chars (il1Lo0O)
 * @param {string} options.excludeChars - Custom characters to exclude
 * @returns {string}
 */
export function generatePassword(options) {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    excludeAmbiguous = false,
    excludeChars = ''
  } = options;

  let uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  let numberChars = '0123456789';
  let symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

  const ambiguousChars = 'il1Lo0O';

  if (excludeAmbiguous) {
    uppercaseChars = uppercaseChars.split('').filter(c => !ambiguousChars.includes(c)).join('');
    lowercaseChars = lowercaseChars.split('').filter(c => !ambiguousChars.includes(c)).join('');
    numberChars = numberChars.split('').filter(c => !ambiguousChars.includes(c)).join('');
    symbolChars = symbolChars.split('').filter(c => !ambiguousChars.includes(c)).join('');
  }

  if (excludeChars) {
    const excluded = new Set(excludeChars.split(''));
    uppercaseChars = uppercaseChars.split('').filter(c => !excluded.has(c)).join('');
    lowercaseChars = lowercaseChars.split('').filter(c => !excluded.has(c)).join('');
    numberChars = numberChars.split('').filter(c => !excluded.has(c)).join('');
    symbolChars = symbolChars.split('').filter(c => !excluded.has(c)).join('');
  }

  let charset = '';
  const requiredChars = [];

  if (uppercase && uppercaseChars.length > 0) {
    charset += uppercaseChars;
    requiredChars.push(uppercaseChars[getSecureRandomInt(uppercaseChars.length)]);
  }
  if (lowercase && lowercaseChars.length > 0) {
    charset += lowercaseChars;
    requiredChars.push(lowercaseChars[getSecureRandomInt(lowercaseChars.length)]);
  }
  if (numbers && numberChars.length > 0) {
    charset += numberChars;
    requiredChars.push(numberChars[getSecureRandomInt(numberChars.length)]);
  }
  if (symbols && symbolChars.length > 0) {
    charset += symbolChars;
    requiredChars.push(symbolChars[getSecureRandomInt(symbolChars.length)]);
  }

  if (charset.length === 0) {
    throw new Error('At least one character set must be selected');
  }

  const passwordArray = [];

  // Add required characters first
  for (const char of requiredChars) {
    passwordArray.push(char);
  }

  // Fill remaining with random characters from charset
  for (let i = requiredChars.length; i < length; i++) {
    passwordArray.push(charset[getSecureRandomInt(charset.length)]);
  }

  // Shuffle to randomize positions
  secureShuffleArray(passwordArray);

  return passwordArray.join('');
}

/**
 * Generate a random PIN
 * @param {Object} options
 * @param {number} options.length - PIN length
 * @param {boolean} options.noSequential - No 3+ sequential digits
 * @param {boolean} options.noRepeated - No 3+ repeated digits
 * @returns {string}
 */
export function generatePIN(options) {
  const { length = 4, noSequential = false, noRepeated = false } = options;
  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    attempts++;
    let pin = '';
    for (let i = 0; i < length; i++) {
      pin += getSecureRandomInt(10).toString();
    }

    if (noSequential && hasSequentialDigits(pin)) continue;
    if (noRepeated && hasRepeatedDigits(pin)) continue;

    return pin;
  }

  // Fallback: return without constraints
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += getSecureRandomInt(10).toString();
  }
  return pin;
}

function hasSequentialDigits(pin) {
  for (let i = 0; i < pin.length - 2; i++) {
    const a = parseInt(pin[i]);
    const b = parseInt(pin[i + 1]);
    const c = parseInt(pin[i + 2]);
    if ((b === a + 1 && c === b + 1) || (b === a - 1 && c === b - 1)) {
      return true;
    }
  }
  return false;
}

function hasRepeatedDigits(pin) {
  return /(.)\1{2,}/.test(pin);
}

/**
 * Generate a UUID v4
 * @returns {string}
 */
export function generateUUID() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Manual implementation
  const bytes = getSecureRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Generate a hex key
 * @param {number} length - Length in hex characters
 * @returns {string}
 */
export function generateHexKey(length) {
  const byteLength = Math.ceil(length / 2);
  const bytes = getSecureRandomBytes(byteLength);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, length);
}

/**
 * Generate a base64 token
 * @param {number} length - Approximate length
 * @returns {string}
 */
export function generateBase64Token(length) {
  const byteLength = Math.ceil(length * 0.75);
  const bytes = getSecureRandomBytes(byteLength);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/[+/=]/g, c => {
    if (c === '+') return '-';
    if (c === '/') return '_';
    return '';
  }).slice(0, length);
}

/**
 * Generate an alphanumeric token
 * @param {number} length
 * @returns {string}
 */
export function generateAlphanumericToken(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += charset[getSecureRandomInt(charset.length)];
  }
  return token;
}

/**
 * Calculate entropy bits for a password
 * @param {string} password
 * @returns {number}
 */
export function calculateEntropy(password) {
  if (!password || password.length === 0) return 0;

  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;

  if (charsetSize === 0) return 0;
  return Math.round(password.length * Math.log2(charsetSize) * 100) / 100;
}

/**
 * Calculate entropy from policy (charset size and length)
 * @param {number} charsetSize
 * @param {number} length
 * @returns {number}
 */
export function calculatePolicyEntropy(charsetSize, length) {
  if (charsetSize <= 0 || length <= 0) return 0;
  return Math.round(length * Math.log2(charsetSize) * 100) / 100;
}
