document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save');
    const wordInput = document.getElementById('word');
    const meaningInput = document.getElementById('meaning');
    const noteInput = document.getElementById('note');
    const savedWordsList = document.getElementById('savedWords');
    const viewSavedWordsLink = document.getElementById('viewSavedWords');

    wordInput.value = window.getSelection().toString().trim()

    // Send a message to the content script to get the selected text
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'getSelectedText' }, function (response) {
        if (response && response.word) {
            wordInput.value = response.word;
        }
        });
    });
    
    // Listen for the selected word from content script
    chrome.runtime.onMessage.addListener(function(request) {
        if (request.word) {
            wordInput.value = request.word;
        }
    });

    // // Load saved words
    // chrome.storage.local.get({words: []}, function(result) {
    //     result.words.forEach(item => {
    //         addListItem(item.word, item.meaning, item.note);
    //     });
    // });

    // Save word, meaning, and note
    saveButton.addEventListener('click', function() {
        const timestamp = new Date().toLocaleString();
        const word = wordInput.value.trim();
        const meaning = meaningInput.value.trim();
        const note = noteInput.value.trim();

        if (word) {
            chrome.storage.local.get({words: []}, function(result) {
                const words = result.words;
                words.push({timestamp, word, meaning, note});
                chrome.storage.local.set({words: words}, function() {
                    addListItem(word, meaning, note);
                    wordInput.value = '';
                    meaningInput.value = '';
                    noteInput.value = '';
                    console.log('Word saved: ' + words);
                });
            });
        }
    });

    // Function to add a list item
    function addListItem(word, meaning, note) {
        const li = document.createElement('li');
        li.textContent = `Word: ${word}, Meaning: ${meaning}, Note: ${note}`;
        savedWordsList.appendChild(li);
    }

    // Open saved_words.html in a new tab
    viewSavedWordsLink.addEventListener('click', function() {
        chrome.tabs.create({ url: chrome.runtime.getURL('saved_words.html') });
    });
});
