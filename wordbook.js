document.addEventListener('DOMContentLoaded', function () {
    const wordsTableBody = document.querySelector('#wordsTable tbody');
    const timeHeader = document.querySelector('#wordsTable th[data-sort="time"]'); // Select the time header
    let sortOrder = 'desc'; // Default sort order

    // Fetch the wordbook data from chrome.storage.local
    chrome.storage.local.get(['wordbook'], function (data) {
        const wordbook = data.wordbook || []; // Default to an empty array if not found

        wordbook.forEach(item => {
            if (!item.time_updated) {
                item.time_updated = item.time_created;
            }
        });

        // Check if the wordbook is empty
        if (wordbook.length === 0) {
            wordsTableBody.innerHTML = '<tr><td colspan="5">No words found in the wordbook.</td></tr>';
            return;
        }

        // Update the title with the number of words
        document.getElementById('title').innerHTML = `WordBook (${wordbook.length} words)`; // Update the title
        

        console.log(wordbook);
        // Iterate over the wordbook and create table rows
        sortWordbook(wordbook, sortOrder);
        populateTable(wordbook);

        // Add click event to the time header for sorting
        timeHeader.addEventListener('click', () => {
            sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'; // Toggle sort order
            sortWordbook(wordbook, sortOrder);
            populateTable(wordbook);
        });
    });

    function sortWordbook(wordbook, order) {
        wordbook.sort((a, b) => {
            return order === 'desc' 
                ? new Date(b.time_updated) - new Date(a.time_updated) 
                : new Date(a.time_updated) - new Date(b.time_updated);
        });
    }

    function populateTable(wordbook) {
        wordsTableBody.innerHTML = ''; // Clear existing rows
        wordbook.forEach(entry => {
            const row = document.createElement('tr');

            // Create cells for each entry
            const timeCell = document.createElement('td');
            timeCell.textContent = formatDate(entry.time_updated); // Format time to custom string
            row.appendChild(timeCell);

            const wordCell = document.createElement('td');
            wordCell.textContent = entry.text;
            wordCell.addEventListener('click', function () {
                openGoogleTranslate(entry.text);
            });
            row.appendChild(wordCell);

            const contextCell = document.createElement('td');
            contextCell.innerHTML = entry.context.join('<br\/>');
            contextCell.addEventListener('click', function () {
                openGoogleTranslate(entry.context);
            });
            row.appendChild(contextCell);

            const action1Cell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.className = 'btn btn-primary btn-sm ml-2';
            editButton.textContent = 'Add';
            editButton.onclick = () => {
                showDialogEditAndFillDataByWordbook(entry); // Function to edit the word
            };

            action1Cell.appendChild(editButton);
            row.appendChild(action1Cell);

            const action2Cell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.onclick = () => {
                deleteWordBook(entry, () => {
                    location.reload(); // Reload the page to refresh the table
                });
            };
            action2Cell.appendChild(deleteButton);
            row.appendChild(action2Cell);

            // Append the row to the table body
            wordsTableBody.appendChild(row);
        });
    }

    // Function to sort the statistics table
    function sortTable(table, columnIndex, order) {
        const rows = Array.from(table.rows).slice(1); // Exclude header row
        rows.sort((a, b) => {
            const aText = a.cells[columnIndex].textContent;
            const bText = b.cells[columnIndex].textContent;

            if (order === 'asc') {
                return aText.localeCompare(bText, undefined, { numeric: true });
            } else {
                return bText.localeCompare(aText, undefined, { numeric: true });
            }
        });

        // Append sorted rows back to the table
        rows.forEach(row => table.appendChild(row));
    }

    // Add event listeners for sorting
    const statisticsContent = document.getElementById('statisticsContent');

    // Attach sorting to the table headers after the modal is shown
    $('#statisticsModal').on('shown.bs.modal', function () {
        const table = statisticsContent.querySelector('table');

        // Add click event listeners to each header cell
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            let order = 'asc'; // Default sort order
            header.addEventListener('click', () => {
                sortTable(table, index, order);
                order = order === 'asc' ? 'desc' : 'asc'; // Toggle order
            });
        });
    });
});

// Add event listener for memory game button
document.getElementById('memoryGame').addEventListener('click', function () {
    showRandomWord();
});

// Function to show a random word
function showRandomWord() {
    // Fetch the wordbook data from chrome.storage.local
    chrome.storage.local.get(['wordbook'], function (data) {
        const wordbook = data.wordbook || []; // Default to an empty array if not found

        if (wordbook.length === 0) {
            alert('No words found in the wordbook.');
            return;
        }

        // Select a random word from the wordbook
        const randomIndex = Math.floor(Math.random() * wordbook.length);
        const randomWordEntry = wordbook[randomIndex];

        // Display the random word and context in the modal
        document.getElementById('randomWord').textContent = `${randomWordEntry.text}`;
        document.getElementById('randomContext').innerHTML = `${randomWordEntry.context.join('<br/>')}`;

        document.getElementById('randomWord').addEventListener('click', function () {
            openGoogleTranslate(randomWordEntry.text);
        });

        document.getElementById('randomContext').addEventListener('click', function () {
            openGoogleTranslate(randomWordEntry.context.join('<br/>'));
        });

        // Store the current word for remembering/not remembering
        document.getElementById('rememberButton').dataset.word = randomWordEntry.text;

        // Show the modal
        $('#memoryGameModal').modal('show');
    });
}

// Handle Remember button click
document.getElementById('rememberButton').addEventListener('click', function () {
    const word = this.dataset.word; // Get the word from the dataset
    updateRememberStatistics(word, true); // Update statistics for remembering
    showRandomWord(); // Show the next random word
});

// Handle Not Remember button click
document.getElementById('notRememberButton').addEventListener('click', function () {
    const word = document.getElementById('rememberButton').dataset.word; // Get the word from the dataset
    updateRememberStatistics(word, false); // Update statistics for not remembering
    showRandomWord(); // Show the next random word
});

// Add event listener for Remember Forever button click
document.getElementById('rememberForeverButton').addEventListener('click', function () {
    const word = document.getElementById('rememberButton').dataset.word; // Get the word from the dataset
    updateRememberForeverStatistics(word); // Update statistics for remembering forever
    showRandomWord(); // Show the next random word
});

const editAndSaveWord = document.getElementById('editAndSaveWord');
editAndSaveWord.addEventListener('click', function () {
    addWord(wordInput.value, meaningInput.value, noteInput.value, () => {
        
    });
});

// Add event listener for close button
document.getElementById('closeButton').addEventListener('click', () => window.close());

// Function to show game statistics
function showGameStatistics() {
    chrome.storage.local.get(['remember_statistic'], function (data) {
        const rememberStatistic = data.remember_statistic || {};
        const statisticsContent = document.getElementById('statisticsContent');

        // Clear previous content
        statisticsContent.innerHTML = '';

        // Check if there are any statistics to display
        if (Object.keys(rememberStatistic).length === 0) {
            statisticsContent.innerHTML = '<p>No statistics available.</p>';
            $('#statisticsModal').modal('show');
            return;
        }

        // Create a table to display statistics
        const table = document.createElement('table');
        table.className = 'table table-striped';
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = '<th>Word</th><th>Remembered</th><th>Not Remembered</th><th>Remember Forever</th>';
        table.appendChild(headerRow);

        // Populate the table with statistics
        for (const word in rememberStatistic) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${word}</td>
                <td>${rememberStatistic[word].re}</td>
                <td>${rememberStatistic[word].not_re}</td>
                <td>${rememberStatistic[word].re_fo}</td>
            `;
            table.appendChild(row);
        }

        // Append the table to the statistics content
        statisticsContent.appendChild(table);

        // Show the statistics modal
        $('#statisticsModal').modal('show');
    });
}

// Add event listener for a button to show statistics
document.getElementById('showStatisticsButton').addEventListener('click', showGameStatistics);
