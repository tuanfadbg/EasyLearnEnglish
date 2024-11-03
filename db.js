function getRandomWord(count) {
    console.log(`Getting ${count} random words.`);
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['words'], function (result) {
            const words = result.words || [];
            // Find the word in the words array and update its note
            const randomWords = words.sort(() => Math.random() - 0.5).slice(0, count);
            console.log('Random words:', randomWords);
            resolve(randomWords);
        });
    });
}

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

function updateWordWithCallBack(wordToUpdate, callback) {
    chrome.storage.local.get(['words'], function (result) {
        const words = result.words || [];
        // Find the word in the words array and update its note
        const updatedWords = words.map(word => word.word === wordToUpdate.word ? wordToUpdate : word);

        // Save the updated words array to storage
        chrome.storage.local.set({ words: updatedWords }, function () {
            console.log('Note saved:', wordToUpdate);
            if (callback) callback();
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

function findWord(wordWanttoFind) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['words'], function (result) {
            const words = result.words || [];
            const foundWord = words.find(word => word.word === wordWanttoFind);
            resolve(foundWord);
        });
    });
}


function addWordOrUpdateIfExist(word, meaning, note, callback) {
    console.log(`addWordOrUpdateIfExist: ${word}, Meaning: ${meaning}, Note: ${note}, Callback: ${callback}`);
    chrome.storage.local.get(['words'], function (result) {
        const words = result.words || [];
        const wordExists = words.some(w => w.word == word);
        if (wordExists) {
            const updatedWord = words.find(w => w.word == word);
            updatedWord.meaning = meaning;
            updatedWord.note = note;
            updateWordWithCallBack(updatedWord, callback);
        } else {
            addWord(word, meaning, note, callback);
        }
    });
}

function addLinkedToSavedWord(wordInWordBook, wordInSavedWord, callback) {
    console.log(`addLinkedToSavedWord: ${wordInWordBook}, ${wordInSavedWord}, ${callback}`);
    chrome.storage.local.get(['wordbook'], function (data) {
        let wordbook = data.wordbook || [];
        const word = wordbook.find(entry => entry.text === wordInWordBook);
        if (word) {
            word.linkedTo = wordInSavedWord;
        }
        console.log(word);
        chrome.storage.local.set({ wordbook }, function () {
            if (callback) callback();
        });
    });
}

function addWord(word, meaning, note, callback) {
    console.log(`Adding word: ${word}, meaning: ${meaning}, note: ${note}`);
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

// Function to update remember statistics in local storage
function updateRememberStatisticsDB(word, remembered, remember_forever) {
    chrome.storage.local.get(['remember_statistic'], function (data) {
        const rememberStatistic = data.remember_statistic || {};

        // Initialize the word entry if it doesn't exist
        if (!rememberStatistic[word]) {
            rememberStatistic[word] = { re: 0, not_re: 0, re_fo: 0 }; // Add re_fo key
        }

        if (remember_forever) {
            if (isNaN(rememberStatistic[word].re_fo))
                rememberStatistic[word].re_fo = 1
            else
                rememberStatistic[word].re_fo += 1; // Increment remembered forever count
        } else {
            // Update the counts based on whether the word was remembered or not
            if (remembered) {
                rememberStatistic[word].re += 1; // Increment remembered count
            } else {
                rememberStatistic[word].not_re += 1; // Increment not remembered count
            }
        }

        console.log(rememberStatistic);
        // Save the updated statistics back to local storage
        chrome.storage.local.set({ remember_statistic: rememberStatistic }, function () {
            console.log(`Updated statistics for "${word}":`, rememberStatistic[word]);
        });
    });
}

function updateRememberForeverStatistics(word) {
    updateRememberStatisticsDB(word, true, true);
}
function updateRememberStatistics(word, remembered) {
    updateRememberStatisticsDB(word, remembered, false);
}