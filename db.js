function updateWord(wordToUpdate) {
    chrome.storage.local.get(['words'], function (result) {
        const words = result.words || [];
        // Find the word in the words array and update its note
        const updatedWords = words.map(word => word.word === wordToUpdate.word ? wordToUpdate : word);

        // Save the updated words array to storage
        chrome.storage.local.set({ words: updatedWords }, function () {
            console.log('Note saved:', wordToUpdate);
        });
    });
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

function addWord(word, meaning, note, callback) {
    const timestamp = new Date().toLocaleString();
    chrome.storage.local.get({ words: [] }, function (result) {
        const words = result.words;
        words.push({ timestamp, word, meaning, note });
        updateWordInStorage(words, callback);
    });
}

function deleteWord(wordData, callback) {
    console.log(wordData);
    if (confirm('Are you sure you want to delete this wordssss?')) {
        // Remove the word from the words array and update storage
        // console.log(wordData);
        chrome.storage.local.get({ words: [] }, function (result) {
            console.log(result.words);
            let words = result.words.filter(word => 
                (word.timestamp !== wordData.timestamp)
            );
            console.log(words);
            updateWordInStorage(words, callback);
        });
    }
}

function deleteWordBook(word, callback) {
    if (confirm('Are you sure you want to delete this wordbook?')) {
        chrome.storage.local.get(['wordbook'], function (data) {
            let wordbook = data.wordbook || [];
            // Update the filter logic to use AND (&&) instead of OR (||)
            wordbook = wordbook.filter(entry => 
                // entry.text !== word.text && 
                // entry.context !== word.context && 
                entry.time_created !== word.time_created
            ); // Filter out the deleted word by text and context
            chrome.storage.local.set({ wordbook }, function () {
                if (callback) callback();
            });
        });
    }   
}

function updateWord(currentWord, updatedWord, callback) {
    chrome.storage.local.get({ words: [] }, function (result) {
        result.words.forEach(word => {
            if (word.word == currentWord.word) {
                console.log(word);
                word.word = updatedWord.word
                word.meaning = updatedWord.meaning;
                word.note = updatedWord.note;
            }
        });
        updateWordInStorage(result.words, callback);
    });
    
}
function updateWordInStorage(words) {
    chrome.storage.local.set({ words: words }, function () {
        // Reload the table to reflect the changes

    });
}

function updateWordInStorage(words, callback) {
    chrome.storage.local.set({ words: words }, function () {
        if (callback) callback();
    });
}

// Load translations from chrome.storage.local or use default
function loadTranslations(callback) {
    chrome.storage.local.get(['translations'], function (result) {
        const translate = result.translations || defaultTranslations;
        callback(translate);
    });
}

// Save translations to chrome.storage.local
function updateTranslation(updatedTranslation, callback) {
    // Load current translations
    loadTranslations(function (allTranslations) {
        // Find the index of the current translation to update
        const index = allTranslations.findIndex(item => item.key === updatedTranslation.key);
        
        if (index !== -1) {
            allTranslations[index] = updatedTranslation; // Update existing translation
        } else {
            allTranslations.push(updatedTranslation); // Add new translation
        }

        chrome.storage.local.set({ translations: allTranslations }, function () {
            console.log('Translations saved to chrome.storage.local');
            callback(allTranslations);
        });
    });
}
function saveTranslations(updatedTranslations, callback) {
    chrome.storage.local.set({ translations: updatedTranslations }, function () {
        console.log('Translations saved to chrome.storage.local');
        callback(updatedTranslations);
    });
}

// Function to delete a translation
function deleteTranslation(key, callback) {
    // Load current translations
    loadTranslations(function (translate) {
        // Filter out the translation to delete
        const updatedTranslations = translate.filter(item => item.key !== key);
        saveTranslations(updatedTranslations, callback); // Save updated translations
    });
}
