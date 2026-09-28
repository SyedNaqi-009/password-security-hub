# Password Security Hub 🔒

A free, privacy-first, browser-based suite of 10 password and security tools. **100% Client-Side** — no user data or generated passwords ever leave your device.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## ✨ Included Tools

1. **Strong Password Generator** (`/pages/password-generator.html`) — Customizable character sets, exclusion rules, entropy, crack time, and multiple generation.
2. **Password Strength Checker** (`/pages/password-strength-checker.html`) — Real-time debounced zxcvbn analysis, 0-100 circular gauge, crack times, and pattern detection.
3. **Memorable Passphrase Generator** (`/pages/passphrase-generator.html`) — Diceware/EFF large wordlist (7,776 words) passphrase generator.
4. **Random PIN Generator** (`/pages/pin-generator.html`) — Secure numeric PINs with anti-sequential and anti-repeated digit controls.
5. **Creative Username Generator** (`/pages/username-generator.html`) — Gaming, Professional, Random, and Funny username generator.
6. **Password Entropy Calculator** (`/pages/password-entropy-calculator.html`) — Information-theoretic entropy calculator ($E = L \times \log_2(R)$) and policy comparison table.
7. **Password Policy Checker** (`/pages/password-policy-checker.html`) — Real-time validation against NIST SP 800-63B, PCI DSS, and HIPAA standards.
8. **Online Hash Generator** (`/pages/hash-generator.html`) — Real-time text and drag-and-drop file hashing (MD5, SHA-1, SHA-256, SHA-384, SHA-512).
9. **Bulk Password Generator** (`/pages/bulk-password-generator.html`) — Batch generation of up to 500 passwords with CSV/TXT export.
10. **Random Security Code Generator** (`/pages/security-code-generator.html`) — Numeric OTPs, alphanumeric tokens, hex keys, UUID v4, and base64 tokens.

## 🛡️ Security & Privacy Architecture

- **Zero Server-Side Code**: Pure static HTML5, CSS3, and modern ES modules.
- **True CSPRNG**: Powered strictly by Web Crypto API (`crypto.getRandomValues()`). Never uses `Math.random()`.
- **Zero Telemetry / Storage**: No passwords, hashes, or inputs are stored in `localStorage`, cookies, or remote databases.
- **PWA & Offline Ready**: Service worker caching allows 100% offline usage after initial load.

## 🚀 Deployment

Designed to be hosted with zero configuration on **Vercel**, **GitHub Pages**, **Cloudflare Pages**, or **Netlify**.
