document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#wordsTable tbody');
    const clearAllButton = document.getElementById('clearAllButton');
    const title = document.getElementById('title');
    const sortByTimeButton = document.getElementById('sortByTimeButton');


    const loadRandomButton = document.getElementById('random10');
    const allButton = document.getElementById('loadall');
    const editAndSaveWord = document.getElementById('editAndSaveWord');
    let currentWordEdited;

    let isAscending = false; // Default sorting direction
    var wordInTable;
    
    // Function to load and display words
    function loadWords() {
        chrome.storage.local.get({ words: [] }, function (result) {
            let words = result.words;
            title.innerHTML = "Saved Words(" + words.length + ")";

            fillInTable(words)
        });
    }

    // Load words on page load

    function loadRandom(count) {
        chrome.storage.local.get({ words: [] }, function (result) {
            let words = result.words;
            // Shuffle the words array
            for (let i = words.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [words[i], words[j]] = [words[j], words[i]]; // Swap elements
            }
            let randomWords = words.slice(0, count);
            fillInTable(randomWords)
        });
    }
    
    function fillInTable(words) {
        wordInTable = words;
        wordInTable.sort(function (a, b) {
            return isAscending
                ? new Date(a.timestamp) - new Date(b.timestamp)
                : new Date(b.timestamp) - new Date(a.timestamp);
        });
        tableBody.innerHTML = '';
        if (words.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 4;
            emptyCell.textContent = 'No words saved yet.';
            emptyRow.appendChild(emptyCell);
            tableBody.appendChild(emptyRow);
        } else {
            wordInTable.forEach(function (wordData) {
                const row = document.createElement('tr');

                const timestampCell = document.createElement('td');
                timestampCell.textContent = formatDate(wordData.timestamp);
                row.appendChild(timestampCell);

                const wordCell = document.createElement('td');
                wordCell.textContent = wordData.word;
                const copyIcon = createCopyIcon(wordData.word);
                wordCell.appendChild(copyIcon);
                row.appendChild(wordCell);

                wordCell.addEventListener('click', function () {
                    openGoogleTranslate(wordData.word);
                });

                const meaningCell = document.createElement('td');
                meaningCell.textContent = wordData.meaning;
                row.appendChild(meaningCell);
                
                const noteCell = document.createElement('td');
                noteCell.innerHTML = wordData.note.replace(/\n/g, '<br>');
                row.appendChild(noteCell);

                // Create edit and delete icons
                const editIcon = document.createElement('span');
                editIcon.innerHTML = '✏️'; // Edit icon (pencil)
                editIcon.style.cursor = 'pointer';
                editIcon.style.marginLeft = '10px';
                editIcon.addEventListener('click', function () {
                    // Implement edit functionality here
                    // Populate a form with current word details for editing
                    showDialogEditAndFillData(wordData);
                    currentWordEdited = wordData;
                });

                const deleteIcon = document.createElement('span');
                deleteIcon.innerHTML = '🗑️'; // Delete icon (trash can)
                deleteIcon.style.cursor = 'pointer';
                deleteIcon.style.marginLeft = '10px';
                deleteIcon.addEventListener('click', function () {
                    deleteWord(wordData, () => {
                        wordInTable = wordInTable.filter(word => word.word != wordData.word);
                        fillInTable(wordInTable);
                    });
                });

                // Append edit and delete icons to the row
                row.appendChild(editIcon);
                row.appendChild(deleteIcon);

                tableBody.appendChild(row);
            });
        }
    }


    sortByTimeButton.addEventListener('click', function () {
        isAscending = !isAscending; // Toggle sorting direction
        sortByTimeButton.textContent = isAscending ? 'Sort by Time (Asc)' : 'Sort by Time (Desc)';
    });

    // Add event listener to "Clear All" button
    clearAllButton.addEventListener('click', function () {
        if (confirm('Are you sure you want to clear all saved words?')) {
            chrome.storage.local.set({ words: [] }, function () {
                loadWords(); // Reload the table to show the empty state
                alert('All words cleared!');
            });
        }
    });

    loadRandomButton.addEventListener('click', function () {
        loadRandom(10);
    });

    allButton.addEventListener('click', function () {
        loadWords();
    });

    function updateTheTable() {
        let isModifyWord = true;
        wordInTable.forEach(word => {
            if (word.word == wordInput.value) {
                isModifyWord = false;
                word.meaning = meaningInput.value;
                word.note = noteInput.value;
            }
        });
        if (isModifyWord == true) {
            loadWords();
        } else {
            fillInTable(wordInTable);
        }
    }

    editAndSaveWord.addEventListener('click', function () {
        const updatedWord = {
            word: wordInput.value,
            meaning: meaningInput.value,
            note: noteInput.value
        };
        updateWord(currentWordEdited, updatedWord, () => {
            updateTheTable()
        });
    });


    loadWords();
});
