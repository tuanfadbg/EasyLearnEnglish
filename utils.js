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
    const translateUrl = `https://translate.google.com/?sl=en&tl=vi&text=${encodeURIComponent(text)}&op=translate`;

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

