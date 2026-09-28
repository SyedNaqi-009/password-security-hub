// tools/hash-generator.js

// Using global copyToClipboard from a shared utils script if available, 
// otherwise we can implement a simple copy function inline.
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const fileDropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('file-input');
    const encodingSelect = document.getElementById('encoding-select');
    const caseToggle = document.getElementById('case-toggle');
    const hashOutputs = document.querySelectorAll('.hash-output');

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

    async function computeHashes(dataBuffer) {
        const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
        const results = {};
        
        // WebCrypto for SHA
        for (const algo of algos) {
            try {
                const hashBuffer = await crypto.subtle.digest(algo, dataBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                results[algo.toLowerCase().replace('-', '')] = hashHex;
            } catch (e) {
                console.error(`Error hashing with ${algo}`, e);
            }
        }
        
        // MD5 from global md5 lib loaded via CDN
        if (window.md5) {
            const uint8 = new Uint8Array(dataBuffer);
            // Process in chunks or as a binary string (md5 library handles strings well)
            // For large files this string conversion might be slow, but ok for <=10MB
            let binaryString = '';
            for (let i = 0; i < uint8.length; i++) {
                binaryString += String.fromCharCode(uint8[i]);
            }
            results['md5'] = window.md5(binaryString);
        }
        
        return results;
    }

    function displayResults(results) {
        const toUpper = caseToggle.value === 'uppercase';
        hashOutputs.forEach(output => {
            const algo = output.dataset.algo;
            if (results[algo]) {
                const input = output.querySelector('.hash-result');
                input.value = toUpper ? results[algo].toUpperCase() : results[algo];
            }
        });
    }

    const handleTextInput = debounce(async () => {
        const text = textInput.value;
        if (!text) {
            hashOutputs.forEach(out => out.querySelector('.hash-result').value = '');
            return;
        }
        
        const encoder = new TextEncoder(); // UTF-8 by default
        let encoded;
        
        if (encodingSelect.value === 'ascii') {
            const arr = new Uint8Array(text.length);
            for(let i=0; i<text.length; i++) {
                let code = text.charCodeAt(i);
                arr[i] = code > 127 ? 63 : code; // Map non-ASCII to '?'
            }
            encoded = arr;
        } else {
            encoded = encoder.encode(text);
        }
        
        const results = await computeHashes(encoded.buffer);
        displayResults(results);
    }, 200);

    // Event Listeners
    textInput.addEventListener('input', handleTextInput);
    encodingSelect.addEventListener('change', handleTextInput);
    caseToggle.addEventListener('change', () => {
        if(textInput.value || fileDropZone.dataset.hasFile === "true") {
            // Reprocess the displayed output case without recalculating if possible
            // For simplicity, just re-trigger
            if (textInput.value) {
                handleTextInput();
            } else if (fileInput.files.length) {
                handleFile(fileInput.files[0]);
            }
        }
    });

    // File Handling
    fileDropZone.addEventListener('click', () => fileInput.click());
    
    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.classList.add('dragover');
    });
    
    fileDropZone.addEventListener('dragleave', () => {
        fileDropZone.classList.remove('dragover');
    });
    
    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFile(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit.');
            fileInput.value = "";
            return;
        }
        
        textInput.value = ''; // Clear text input when using file
        fileDropZone.dataset.hasFile = "true";
        fileDropZone.querySelector('p').textContent = `Selected: ${file.name} (${(file.size/1024).toFixed(2)} KB)`;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            const results = await computeHashes(e.target.result);
            displayResults(results);
        };
        reader.readAsArrayBuffer(file);
    }

    // Copy Buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const input = e.target.parentElement.querySelector('.hash-result');
            if (input.value) {
                const success = await copyToClipboard(input.value);
                if (success) {
                    const originalText = e.target.textContent;
                    e.target.textContent = 'Copied!';
                    e.target.classList.add('success');
                    setTimeout(() => {
                        e.target.textContent = originalText;
                        e.target.classList.remove('success');
                    }, 2000);
                }
            }
        });
    });
});
