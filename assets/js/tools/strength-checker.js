// strength-checker.js
import { analyzePasswordStrength } from '../utils/strength.js';
import { calculateEntropy } from '../utils/crypto.js';

document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const toggleVisibility = document.getElementById('toggle-visibility');
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    const scoreValue = document.getElementById('score-value');
    const gaugeFill = document.getElementById('gauge-fill');
    
    const entropyValue = document.getElementById('entropy-value');
    const crackFast = document.getElementById('crack-fast');
    const crackSlow = document.getElementById('crack-slow');
    const crackOnlineFast = document.getElementById('crack-online-fast');
    const crackOnlineSlow = document.getElementById('crack-online-slow');
    
    const detectedPatterns = document.getElementById('detected-patterns');
    const improvementSuggestions = document.getElementById('improvement-suggestions');

    // Debounce helper
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Toggle visibility
    toggleVisibility.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        toggleVisibility.textContent = type === 'password' ? '👁️' : '🙈';
    });

    const updateUI = (password) => {
        if (!password) {
            strengthBar.style.width = '0%';
            strengthBar.style.backgroundColor = 'transparent';
            strengthText.textContent = 'Very Weak';
            scoreValue.textContent = '0';
            gaugeFill.style.strokeDashoffset = '314'; // 2 * PI * 50
            entropyValue.textContent = '0 bits';
            crackFast.textContent = 'Instant';
            crackSlow.textContent = 'Instant';
            crackOnlineFast.textContent = 'Instant';
            crackOnlineSlow.textContent = 'Instant';
            detectedPatterns.innerHTML = '<li>No patterns detected yet.</li>';
            improvementSuggestions.innerHTML = '<li>Start typing to get suggestions.</li>';
            return;
        }

        const entropy = calculateEntropy(password);
        entropyValue.textContent = `${entropy.toFixed(2)} bits`;

        let zxcvbnResult = null;
        if (typeof window.zxcvbn !== 'undefined') {
            zxcvbnResult = window.zxcvbn(password);
        }
        
        let strengthResult = analyzePasswordStrength(password, zxcvbnResult);

        // Update strength bar & text
        const scores = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
        const colors = ['var(--danger)', 'var(--warning)', '#F59E0B', 'var(--success)', 'var(--success)'];
        
        const score = Math.max(0, Math.min(4, strengthResult.score)); // 0-4
        strengthBar.style.width = `${(score + 1) * 20}%`;
        strengthBar.style.backgroundColor = colors[score] || '#16A34A';
        strengthText.textContent = scores[score];
        
        // Update score 0-100 (approximate based on zxcvbn guesses or score)
        const score100 = zxcvbnResult ? Math.min(100, Math.floor((zxcvbnResult.guesses_log10 / 14) * 100)) : (score * 25);
        scoreValue.textContent = score100;
        
        // Circular gauge
        const circumference = 2 * Math.PI * 50;
        const offset = circumference - (score100 / 100) * circumference;
        gaugeFill.style.strokeDasharray = `${circumference}`;
        gaugeFill.style.strokeDashoffset = offset;

        // Update crack times
        if (zxcvbnResult && zxcvbnResult.crack_times_display) {
            crackFast.textContent = zxcvbnResult.crack_times_display.offline_fast_hashing_1e10_per_second;
            crackSlow.textContent = zxcvbnResult.crack_times_display.offline_slow_hashing_1e4_per_second;
            crackOnlineFast.textContent = zxcvbnResult.crack_times_display.online_no_throttling_10_per_second;
            crackOnlineSlow.textContent = zxcvbnResult.crack_times_display.online_throttling_100_per_hour;
        }

        // Patterns
        if (zxcvbnResult && zxcvbnResult.sequence && zxcvbnResult.sequence.length > 0) {
            detectedPatterns.innerHTML = '';
            const patternTypes = new Set(zxcvbnResult.sequence.map(s => s.pattern));
            patternTypes.forEach(p => {
                const li = document.createElement('li');
                li.textContent = `Pattern found: ${p}`;
                detectedPatterns.appendChild(li);
            });
        } else {
            detectedPatterns.innerHTML = '<li>No obvious patterns.</li>';
        }

        // Suggestions
        if (zxcvbnResult && zxcvbnResult.feedback) {
            improvementSuggestions.innerHTML = '';
            const suggestions = zxcvbnResult.feedback.suggestions || [];
            if (zxcvbnResult.feedback.warning) {
                suggestions.unshift(zxcvbnResult.feedback.warning);
            }
            if (suggestions.length === 0) {
                improvementSuggestions.innerHTML = '<li>Great password!</li>';
            } else {
                suggestions.forEach(s => {
                    const li = document.createElement('li');
                    li.textContent = s;
                    improvementSuggestions.appendChild(li);
                });
            }
        }
    };

    const handleInput = debounce((e) => {
        updateUI(e.target.value);
    }, 150);

    passwordInput.addEventListener('input', handleInput);
});
