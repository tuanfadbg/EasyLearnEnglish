function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    // alert('Copied to clipboard: ' + text);
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
}

function createCopyIcon(text) {
    let copyIcon = document.createElement('span');
    copyIcon.innerHTML = '📋'; // You can replace this with a better icon if you like
    copyIcon.style.cursor = 'pointer';
    copyIcon.style.marginLeft = '10px';
    copyIcon.addEventListener('click', function () {
        copyToClipboard(text);
    });
    return copyIcon;
}


function seedData() {
    let sampleWords = [
        { word: 'Apple', meaning: 'A fruit', note: 'A common fruit', timestamp: new Date().toISOString() },
        { word: 'Banana', meaning: 'A yellow fruit', note: 'Rich in potassium', timestamp: new Date().toISOString() },
        { word: 'Cherry', meaning: 'A small red fruit', note: 'Often used in desserts', timestamp: new Date().toISOString() },
        { word: 'Date', meaning: 'A sweet fruit from palm trees', note: 'Often eaten dried', timestamp: new Date().toISOString() },
        { word: 'Elderberry', meaning: 'A dark purple fruit', note: 'Used in syrups and jams', timestamp: new Date().toISOString() }
    ];

    // Generate random timestamps for each entry
    const now = new Date();
    let sampleWordsWithPrefix = []
    for (var i = 0; i < 10; i++) {
        sampleWords.forEach(word => {
            let randomOffset = Math.floor(i * 1000000000); // Random offset in milliseconds

            let wordCopied = {};
            wordCopied.timestamp = new Date(now.getTime() - randomOffset).toISOString();
            wordCopied.word = word.word + " " + i;
            wordCopied.meaning = word.meaning;
            wordCopied.note = word.note;
            sampleWordsWithPrefix.push(wordCopied);
        });
    }

    // sampleWords.forEach(word => {
    //     let randomOffset = Math.floor(Math.random() * 1000000000); // Random offset in milliseconds
    //     word.timestamp = new Date(now.getTime() - randomOffset).toISOString();
    // });

    chrome.storage.local.set({ words: sampleWordsWithPrefix }, function () {
        alert('Sample data seeded!');
        location.reload(); // Reload to show the new data
    });
}

function toggleNightMode() {
    document.body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// Add event delegation to handle clicks on all <p class="openTranslate">
document.addEventListener('click', function(event) {
    // Check if a <p> element with class "openTranslate" was clicked
    let target = event.target;
    if (target && target.tagName === 'P' && target.classList.contains('openTranslate')) {
        openGoogleTranslate(target.textContent.trim());
    }
});

// Add click event to the word element to open Google Translate
function openGoogleTranslate(text) {
    // If text is an array, concatenate all elements with newline character
    if (Array.isArray(text)) {
        text = text.join('\n');
    }
    
    const translateUrl = `https://translate.google.com/details?sl=en&tl=vi&text=${encodeURIComponent(text)}&op=translate`;

    // Check for existing Google Translate tab
    chrome.tabs.query({}, (tabs) => {
        const existingTab = tabs.find(tab => tab.url && tab.url.startsWith("https://translate.google.com/"));
        if (existingTab) {
            // If the tab exists, update its URL and focus on it
            chrome.tabs.update(existingTab.id, { url: translateUrl, active: true });
        } else {
            // If not, create a new tab
            chrome.tabs.create({ url: translateUrl });
        }
    });
}

// Check for saved preference on page load
window.onload = function() {
    const nightMode = document.getElementById('nightMode');
    
    nightMode.addEventListener('click', function () {
        toggleNightMode();
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function convertForSearch(word) {
    // Define regular expressions for different patterns
    const patterns = [
        { regex: /^(.*)ies$/, replacement: '$1y' },          // Change 'ies' to 'y' (e.g., babies => baby)
        { regex: /^(.*)ed$/, replacement: '$1' },            // Remove 'ed' (e.g., tempered => temper)
        { regex: /^(.*)ing$/, replacement: '$1' },           // Remove 'ing' (e.g., running => run)
        { regex: /^(.*)ate$/, replacement: '$1' },           // Remove 'ate' (e.g., conflated => conflat)
        { regex: /^(.*)ly$/, replacement: '$1' },            // Remove 'ly' (e.g., quickly => quick)
        { regex: /^(.*)s$/, replacement: '$1' },             // Remove 's' (e.g., cats => cat)
        { regex: /^(.*)es$/, replacement: '$1' },            // Remove 'es' (e.g., boxes => box)
        { regex: /^(.*)ion$/, replacement: '$1' },           // Remove 'ion' (e.g., action => act)
        { regex: /^(.*)ify$/, replacement: '$1' },           // Remove 'ify' (e.g., simplify => simple)
        { regex: /^(.*)ment$/, replacement: '$1' },          // Remove 'ment' (e.g., development => develop)
        { regex: /^(.*)ness$/, replacement: '$1' },          // Remove 'ness' (e.g., happiness => happy)
        { regex: /^(.*)ful$/, replacement: '$1' },           // Remove 'ful' (e.g., beautiful => beauti)
        { regex: /^(.*)less$/, replacement: '$1' },          // Remove 'less' (e.g., helpless => help)
        { regex: /^(.*)ous$/, replacement: '$1' },           // Remove 'ous' (e.g., joyous => joy)
        { regex: /^(.*)ive$/, replacement: '$1' },           // Remove 'ive' (e.g., creative => creat)
        { regex: /^(.*)al$/, replacement: '$1' },            // Remove 'al' (e.g., personal => person)
        { regex: /^(.*)er$/, replacement: '$1' },            // Remove 'er' (e.g., teacher => teach)
        { regex: /^(.*)est$/, replacement: '$1' },           // Remove 'est' (e.g., biggest => big)
        { regex: /^(.*)y$/, replacement: '$1' },             // Remove 'y' (e.g., happy => happ)
        { regex: /^(.*)e$/, replacement: '$1' },             // Remove 'e' (e.g., make => mak)
        { regex: /^(.*)ic$/, replacement: '$1' },            // Remove 'ic' (e.g., music => musi)
        { regex: /^(.*)ity$/, replacement: '$1' },           // Remove 'ity' (e.g., activity => activ)
        { regex: /^(.*)ty$/, replacement: '$1' },            // Remove 'ty' (e.g., beauty => beaut)
        { regex: /^(.*)ment$/, replacement: '$1' },          // Remove 'ment' (e.g., enjoyment => enjoy)
        { regex: /^(.*)tion$/, replacement: '$1' },          // Remove 'tion' (e.g., information => inform)
        { regex: /^(.*)sion$/, replacement: '$1' },          // Remove 'sion' (e.g., decision => decide)
        { regex: /^(.*)hood$/, replacement: '$1' },          // Remove 'hood' (e.g., childhood => child)
        { regex: /^(.*)ship$/, replacement: '$1' },          // Remove 'ship' (e.g., friendship => friend)
        { regex: /^(.*)dom$/, replacement: '$1' },           // Remove 'dom' (e.g., kingdom => king)
        { regex: /^(.*)er$/, replacement: '$1' },            // Remove 'er' (e.g., player => play)
        { regex: /^(.*)ing$/, replacement: '$1' },           // Remove 'ing' (e.g., playing => play)
        { regex: /^(.*)ed$/, replacement: '$1' },            // Remove 'ed' (e.g., played => play)
        { regex: /^(.*)s$/, replacement: '$1' },             // Remove 's' (e.g., dogs => dog)
    ];

    // Iterate through the patterns and apply the first match
    for (const { regex, replacement } of patterns) {
        if (regex.test(word)) {
            return word.replace(regex, replacement);
        }
    }

    // Return the original word if no patterns matched
    return word;
}


function markdownToHtml(markdown, isOpenGoogleTranslateEnable = false) {
    if (typeof markdown !== 'string') {
        return JSON.stringify(markdown);
    }

    let html = markdown;
    const lines = html.split('\n');
    let processedLines = [];
    let tableRows = [];
    let inTable = false;

    // Process tables line by line
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Check if this is a table row
        if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
            // Skip separator rows (|---|---|)
            if (!trimmedLine.match(/^\|[\s\-:]+\|$/)) {
                if (!inTable) {
                    inTable = true;
                    tableRows = [];
                }
                const cells = trimmedLine.split('|').slice(1, -1).map(cell => cell.trim());
                tableRows.push(cells);
            }
        } else {
            // If we were in a table, close it
            if (inTable && tableRows.length > 0) {
                let tableHtml = '<table class="table table-bordered table-sm mt-2 mb-2" style="font-size: 0.9em;"><tbody>';
                tableRows.forEach((row, idx) => {
                    tableHtml += '<tr>';
                    row.forEach(cell => {
                        const tag = idx === 0 ? 'th' : 'td';
                        const cellContent = markdownToHtmlInline(cell);
                        tableHtml += `<${tag} style="padding: 8px;">${cellContent}</${tag}>`;
                    });
                    tableHtml += '</tr>';
                });
                tableHtml += '</tbody></table>';
                processedLines.push(tableHtml);
                tableRows = [];
                inTable = false;
            }
            processedLines.push(line);
        }
    }
    
    // Handle table at end of text
    if (inTable && tableRows.length > 0) {
        let tableHtml = '<table class="table table-bordered table-sm mt-2 mb-2" style="font-size: 0.9em;"><tbody>';
        tableRows.forEach((row, idx) => {
            tableHtml += '<tr>';
            row.forEach(cell => {
                const tag = idx === 0 ? 'th' : 'td';
                const cellContent = markdownToHtmlInline(cell);
                tableHtml += `<${tag} style="padding: 8px;">${cellContent}</${tag}>`;
            });
            tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table>';
        processedLines.push(tableHtml);
    }
    
    html = processedLines.join('\n');

    // Convert headers (### Header)
    html = html.replace(/^### (.+)$/gm, '<h3 class="mt-3 mb-2" style="font-size: 1.2em; font-weight: bold;">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="mt-3 mb-2" style="font-size: 1.3em; font-weight: bold;">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="mt-3 mb-2" style="font-size: 1.5em; font-weight: bold;">$1</h1>');

    // Convert blockquotes (> text)
    html = html.replace(/^> (.+)$/gm, '<blockquote class="blockquote border-left pl-3 mb-2" style="border-left: 3px solid #ccc; padding-left: 15px; margin: 10px 0;">$1</blockquote>');

    // Convert bold (**text**) - must be done after other processing
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert inline code (`code`)
    html = html.replace(/`([^`]+)`/g, '<code style="background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px;">$1</code>');

    // Convert line breaks (but preserve existing HTML)
    if (typeof isOpenGoogleTranslateEnable !== 'undefined' && isOpenGoogleTranslateEnable === true) {
        html = html
            .split('\n')
            .map(line => `<p class="openTranslate">${line}</p>`)
            .join('');
    } else {
        html = html.replace(/\n/g, '<br>');
    }

    return html;
}

function markdownToHtmlInline(text) {
    if (!text) return '';
    let html = text;
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    return html;
}

function markCorrectionWords(input, correctedInput) {
    const inputWords = tokenizeWords(input);
    const correctedWords = tokenizeWords(correctedInput);

    // Compute LCS indices between input and corrected (case-insensitive),
    // then mark corrected words that are NOT part of the LCS.
    const lcsPairs = lcsWordPairs(inputWords, correctedWords);
    const correctedInLcs = new Set(lcsPairs.map(([, j]) => j));

    return correctedWords
        .map((t, j) => {
            const raw = t.raw;
            return correctedInLcs.has(j) ? escapeHtml(raw) : `<mark>${escapeHtml(raw)}</mark>`;
        })
        .join(' ');
}

function tokenizeWords(text) {
    if (!text) return [];
    return String(text)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(raw => ({ raw, norm: normalizeToken(raw) }));
}

function normalizeToken(raw) {
    // Normalize apostrophes/quotes so Don’t vs Don't doesn't count as a diff
    // and ignore leading/trailing punctuation like ".", ",", "!" etc.
    return String(raw)
        .toLowerCase()
        .replace(/[\u2018\u2019\u201B\u2032]/g, "'") // curly apostrophes → '
        .replace(/[\u201C\u201D\u2033]/g, '"') // curly quotes → "
        .replace(/^[^\p{L}\p{N}']+|[^\p{L}\p{N}']+$/gu, '') // trim punctuation (keep letters/numbers/apostrophe)
        .trim();
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Returns array of matched index pairs: [ [iIndex, jIndex], ... ] for the LCS.
function lcsWordPairs(aWords, bWords) {
    const n = aWords.length;
    const m = bWords.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if ((aWords[i - 1].norm || '') === (bWords[j - 1].norm || '')) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to get matched pairs
    const pairs = [];
    let i = n;
    let j = m;
    while (i > 0 && j > 0) {
        if ((aWords[i - 1].norm || '') === (bWords[j - 1].norm || '')) {
            pairs.push([i - 1, j - 1]);
            i--;
            j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }
    pairs.reverse();
    return pairs;
}