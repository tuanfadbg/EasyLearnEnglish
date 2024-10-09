document.addEventListener('DOMContentLoaded', function () {
    const wordInput = document.getElementById('word');
    const meaningInput = document.getElementById('meaning');
    const noteInput = document.getElementById('note');
    const saveButton = document.getElementById('save');
    const savedWordsList = document.getElementById('savedWords');
    const viewSavedWordsLink = document.getElementById('viewSavedWords');

    wordInput.value = window.getSelection().toString().trim()
    // Add input event listeners for auto-saving
    wordInput.addEventListener('input', saveTemp);
    meaningInput.addEventListener('input', saveTemp);
    noteInput.addEventListener('input', saveTemp);

    saveButton.addEventListener('click', handleSave);

    restoreTempData();

    // Open saved_words.html in a new tab
    viewSavedWordsLink.addEventListener('click', function () {
        chrome.tabs.create({ url: chrome.runtime.getURL('saved_words.html') });
    });
    
    // Send a message to the content script to get the selected text
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'getSelectedText' }, function (response) {
            if (response && response.word) {
                wordInput.value = response.word;
            }
        });
    });

    // Listen for the selected word from content script
    chrome.runtime.onMessage.addListener(function (request) {
        if (request.word) {
            wordInput.value = request.word;
        }
    });

    // Restore saved values from chrome.storage.local
    function restoreTempData() {
        chrome.storage.local.get(['temp'], function (data) {
            console.log("temp: " + data.temp)
            if (data.temp) {
                wordInput.value = data.temp.word || '';
                meaningInput.value = data.temp.meaning || '';
                noteInput.value = data.temp.note || '';
            }
        });
    }

    // Save word, meaning, and note
    function handleSave() {
        const timestamp = new Date().toLocaleString();
        const word = wordInput.value.trim();
        const meaning = meaningInput.value.trim();
        const note = noteInput.value.trim();

        if (word) {
            chrome.storage.local.get({ words: [] }, function (result) {
                const words = result.words;
                words.push({ timestamp, word, meaning, note });
                chrome.storage.local.set({ words: words }, function () {
                    addListItem(word, meaning, note);
                    clearInputs();
                    clearTemp();
                    console.log('Word saved: ' + words);
                });
            });
        }
    }

    // Function to add a list item
    function addListItem(word, meaning, note) {
        const li = document.createElement('li');
        li.textContent = `Word: ${word}, Meaning: ${meaning}, Note: ${note}`;
        savedWordsList.appendChild(li);
    }

    function saveTemp() {
        const temp = {
            word: wordInput.value.trim(),
            meaning: meaningInput.value.trim(),
            note: noteInput.value.trim()
        };

        // Save the temp object to chrome.storage.local
        chrome.storage.local.set({ temp }, function () {
            console.log('Temporary values auto-saved:', temp);
        });
    }

    function clearTemp() {
        const temp = {
            word: "",
            meaning: "",
            note: ""
        };

        chrome.storage.local.set({ temp }, function () {
            console.log('clearTemp:', temp);
        });
    }

    function clearInputs() {
        wordInput.value = '';
        meaningInput.value = '';
        noteInput.value = '';
    }
});
