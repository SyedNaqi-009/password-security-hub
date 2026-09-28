import { getSecureRandomInt } from '../utils/crypto.js';
import { copyToClipboard } from '../utils/clipboard.js';

let adjectivesData = [];
let nounsData = [];

const gamingAdjectives = ["Shadow", "Dark", "Storm", "Blaze", "Void", "Iron", "Ghost", "Frost", "Neon", "Cyber"];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [adjRes, nounRes] = await Promise.all([
            fetch('../assets/data/adjectives.json'),
            fetch('../assets/data/nouns.json')
        ]);
        if (adjRes.ok) adjectivesData = await adjRes.json();
        if (nounRes.ok) nounsData = await nounRes.json();
    } catch (error) {
        console.error("Failed to load word lists", error);
        // Fallback data
        adjectivesData = ["Swift", "Brave", "Clever", "Happy", "Lucky"];
        nounsData = ["Fox", "Bear", "Lion", "Wolf", "Owl"];
    }

    const form = document.getElementById('username-generator-form');
    const maxLengthInput = document.getElementById('maxLength');
    const maxLengthVal = document.getElementById('maxLengthVal');
    const outputGrid = document.getElementById('username-output-grid');
    const generateMoreBtn = document.getElementById('generate-more-btn');

    maxLengthInput.addEventListener('input', (e) => {
        maxLengthVal.textContent = e.target.value;
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        outputGrid.innerHTML = '';
        generateBatch(10);
    });

    generateMoreBtn.addEventListener('click', () => {
        generateBatch(10);
    });

    function generateBatch(count) {
        for (let i = 0; i < count; i++) {
            const username = generateUsername();
            renderUsernameCard(username);
        }
    }

    function renderUsernameCard(username) {
        const card = document.createElement('div');
        card.className = 'username-card';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = username;
        nameSpan.className = 'username-text';

        const actions = document.createElement('div');
        actions.className = 'username-actions';

        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.className = 'btn btn-small';
        copyBtn.addEventListener('click', () => copyToClipboard(nameSpan.textContent));

        const regenBtn = document.createElement('button');
        regenBtn.textContent = '↻';
        regenBtn.className = 'btn btn-small btn-icon';
        regenBtn.setAttribute('aria-label', 'Regenerate this username');
        regenBtn.addEventListener('click', () => {
            nameSpan.textContent = generateUsername();
        });

        actions.appendChild(regenBtn);
        actions.appendChild(copyBtn);
        card.appendChild(nameSpan);
        card.appendChild(actions);
        outputGrid.appendChild(card);
    }

    function getRandomItem(arr) {
        if (!arr || arr.length === 0) return "";
        return arr[getSecureRandomInt(0, arr.length - 1)];
    }

    function generateUsername() {
        const keyword = document.getElementById('keyword').value.trim();
        const style = document.querySelector('input[name="style"]:checked').value;
        const maxLength = parseInt(document.getElementById('maxLength').value, 10);
        const includeNumbers = document.getElementById('includeNumbers').checked;
        const includeUnderscores = document.getElementById('includeUnderscores').checked;
        
        let username = "";
        
        if (style === "Random") {
            const adj = getRandomItem(adjectivesData);
            const noun = keyword || getRandomItem(nounsData);
            username = adj + noun;
            if (includeNumbers) {
                username += getSecureRandomInt(10, 999).toString();
            }
        } else if (style === "Gaming") {
            const adj = getRandomItem(gamingAdjectives);
            const noun = keyword || getRandomItem(nounsData);
            username = adj + noun;
            if (includeNumbers) {
                username += getSecureRandomInt(1, 99).toString();
            }
        } else if (style === "Professional") {
            const initial = alphabet[getSecureRandomInt(0, 25)];
            const base = keyword || getRandomItem(nounsData);
            username = initial + (includeUnderscores ? "_" : "") + base;
            if (includeNumbers) {
                username += getSecureRandomInt(1, 99).toString();
            }
        } else if (style === "Funny") {
            let adj = getRandomItem(adjectivesData);
            const noun = keyword || getRandomItem(nounsData); // Real implementation would match letters for alliteration
            username = adj + noun;
        }

        if (includeUnderscores && style !== "Professional") {
            // Insert an underscore somewhere in the middle
            const pos = Math.max(1, Math.floor(username.length / 2));
            username = username.slice(0, pos) + "_" + username.slice(pos);
        }

        if (username.length > maxLength) {
            username = username.slice(0, maxLength);
        }

        return username;
    }
});
