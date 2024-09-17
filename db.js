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