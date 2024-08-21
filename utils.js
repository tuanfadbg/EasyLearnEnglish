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
    return `${day}/${month}/${year} ${hours}:${minutes}`;
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
            let randomOffset = Math.floor(Math.random() * 1000000000); // Random offset in milliseconds
            
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