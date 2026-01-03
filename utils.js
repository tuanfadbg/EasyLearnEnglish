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

// // Example usage
// console.log(convertForSearch('likes'));      // Output: like
// console.log(convertForSearch('conciously')); // Output: concious
// console.log(convertForSearch('imposing'));   // Output: impose
// console.log(convertForSearch('running'));     // Output: run
// console.log(convertForSearch('quickly'));     // Output: quick
// console.log(convertForSearch('cats'));        // Output: cat
// console.log(convertForSearch('tempered'));    // Output: temper
// console.log(convertForSearch('conflated'));   // Output: conflat
// console.log(convertForSearch('exhaling'));     // Output: exhale
// console.log(convertForSearch('unknown'));     // Output: unknown
// console.log(convertForSearch('action'));      // Output: act
// console.log(convertForSearch('simplify'));    // Output: simple
// console.log(convertForSearch('development')); // Output: develop
// console.log(convertForSearch('happiness'));   // Output: happy
// console.log(convertForSearch('friendship'));  // Output: friend
// console.log(convertForSearch('childhood'));   // Output: child
// console.log(convertForSearch('kingdom'));     // Output: king
// console.log(convertForSearch('creativity'));  // Output: creat