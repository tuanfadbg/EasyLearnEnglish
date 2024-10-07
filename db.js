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

function deleteWord(wordData, callback) {
    if (confirm('Are you sure you want to delete this word?')) {
        // Remove the word from the words array and update storage
        // console.log(wordData);
        chrome.storage.local.get({ words: [] }, function (result) {
            let words = result.words.filter(word => word.word != wordData.word);

            // console.log(words);
            updateWordInStorage(words);
            if (callback) callback();
        });
    }
}

function updateWordInStorage(words) {
    chrome.storage.local.set({ words: words }, function () {
        // Reload the table to reflect the changes

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