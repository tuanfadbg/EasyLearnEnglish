document.addEventListener('DOMContentLoaded', function () {
    const wordInputPopup = document.getElementById('word');
    const meaningInput = document.getElementById('meaning');
    const noteInput = document.getElementById('note');
    const saveButton = document.getElementById('save');
    const savedWordsList = document.getElementById('savedWords');
    const viewSavedWordsLink = document.getElementById('viewSavedWords');

    wordInputPopup.value = window.getSelection().toString().trim()
    // Add input event listeners for auto-saving
    wordInputPopup.addEventListener('input', saveTemp);
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
            // if (response && response.word) {
            //     wordInputPopup.value = response.word;
            // }
        });
    });

    // Listen for the selected word from content script
    chrome.runtime.onMessage.addListener(function (request) {
        // chrome.storage.local.get(['temp'], function (data) {
        //     if (data.temp) {
        //         if (request.word != null && (data.temp.word == null || data.temp.word == "")) {
        //             wordInputPopup.value = request.word;
        //         }
        //     }
        // });
    });

    // Restore saved values from chrome.storage.local
    function restoreTempData() {
        chrome.storage.local.get(['temp'], function (data) {
            console.log("temp: " + data.temp)
            if (data.temp) {
                wordInputPopup.value = data.temp.word || '';
                meaningInput.value = data.temp.meaning || '';
                noteInput.value = data.temp.note || '';
                checkWordIsValid();
            }
        });
    }

    // Save word, meaning, and note
    function handleSave() {
        const timestamp = new Date().toLocaleString();
        const word = wordInputPopup.value.trim();
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
            word: wordInputPopup.value.trim(),
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
        wordInputPopup.value = '';
        meaningInput.value = '';
        noteInput.value = '';
    }

    wordInputPopup.addEventListener('input', function () {
        checkWordIsValid();
    });

    function checkWordIsValid() {
        const word = wordInputPopup.value.trim();
        const errorMessage = document.getElementById('error-message'); // Add this line to get the error message element
        errorMessage.textContent = ''; // Clear previous error message

        if (word) {
            checkWordIsExisted(word).then(exists => {
                if (exists) {
                    console.log(`Word "${word}" already exists.`);
                    errorMessage.textContent = `Error: Word "${word}" already exists.`; // Display error message
                } else {
                    console.log(`Word "${word}" does not exist.`);
                }
            });
        }
    }

    function checkWordIsExisted(wordWanttoCheck) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['words'], function (result) {
                const words = result.words || [];
                const wordExists = words.some(word => word.word === wordWanttoCheck);
                resolve(wordExists);
            });
        });
    }
});


document.getElementById('saveToTranslation').addEventListener('click', function () {
    // Add your code here
    console.log("translatedSentences");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'getTranslationValue' }, function (response) {
            if (response && response.word) {

            }
        });
    });
});

document.getElementById('listTranslations').addEventListener('click', loadListTranslation);

function loadListTranslation() {
    const translationsDiv = document.getElementById('list-translations');
    translationsDiv.innerHTML = ''; // Clear previous translations
    chrome.storage.local.get(['translationContainer'], function (result) {
        const translationContainer = result.translationContainer || [];
        console.log(translationContainer);
        translationContainer.reverse();
        translationContainer.forEach(translation => {
            const translationItem = document.createElement('div');
            translationItem.textContent = `${translation.content[0].text}`;
            translationItem.id = 'item-' + translation.id;
            translationItem.style = 'margin-bottom: 10px; padding: 10px; border-radius: 5px; background-color: #f0f0f0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
            translationItem.addEventListener('click', function () {
                console.log(`Translation item clicked: ${translation.content[0].text}`);
                sendTranslationDataToContentJS(translation);
            });
            translationsDiv.appendChild(translationItem);
        });
    });
}

function sendTranslationDataToContentJS(translation) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'sendTranslationDataToContentJS', translation: translation }, function (response) {

        });
    });
}

