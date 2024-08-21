document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#wordsTable tbody');
    const clearAllButton = document.getElementById('clearAllButton');
    const sortByTimeButton = document.getElementById('sortByTimeButton');


    const loadRandomButton = document.getElementById('random10');
    const allButton = document.getElementById('loadall');

    let isAscending = true; // Default sorting direction

    // Function to load and display words
    function loadWords() {
        chrome.storage.local.get({ words: [] }, function (result) {
            let words = result.words;
            // Sort words by timestamp (newest first)
        
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
        words.sort(function (a, b) {
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
            words.forEach(function (wordData) {
                const row = document.createElement('tr');

                const timestampCell = document.createElement('td');
                timestampCell.textContent = formatDate(wordData.timestamp);
                row.appendChild(timestampCell);

                const wordCell = document.createElement('td');
                wordCell.textContent = wordData.word;
                // Add copy icon
                const copyIcon = document.createElement('span');
                copyIcon.innerHTML = '📋'; // You can replace this with a better icon if you like
                copyIcon.style.cursor = 'pointer';
                copyIcon.style.marginLeft = '10px';
                copyIcon.addEventListener('click', function () {
                    copyToClipboard(wordData.word);
                });
                wordCell.appendChild(copyIcon);
                row.appendChild(wordCell);

                const meaningCell = document.createElement('td');
                meaningCell.textContent = wordData.meaning;
                row.appendChild(meaningCell);

                const noteCell = document.createElement('td');
                noteCell.textContent = wordData.note;
                row.appendChild(noteCell);



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


    loadWords();
});
