function updateWord(wordToUpdate) {
        chrome.storage.local.get(['words'], function(result) {
            const words = result.words || [];
            // Find the word in the words array and update its note
            const updatedWords = words.map(word => word.word === wordToUpdate.word ? wordToUpdate : word);

            // Save the updated words array to storage
            chrome.storage.local.set({ words: updatedWords }, function() {
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