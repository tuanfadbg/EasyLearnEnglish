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
        // wordbook.reverse();
        // Check if each item of wordbook has no time_updated, time updated = time created

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
});

const editAndSaveWord = document.getElementById('editAndSaveWord');
editAndSaveWord.addEventListener('click', function () {
    addWord(wordInput.value, meaningInput.value, noteInput.value, () => {
        
    });
});

// Add event listener for close button
document.getElementById('closeButton').addEventListener('click', () => window.close());

// chrome.storage.local.get(['wordbook'], function (data) {
//     const wordbook = data.wordbook || [];
    
//     // Replace the context of all entries with an empty array
//     const updatedWordbook = wordbook.map(entry => ({
//         ...entry,
//         context: [entry.context] // Set context to an empty array for all entries
//     }));
  
//     // Update the storage with the modified wordbook
//     chrome.storage.local.set({ wordbook: updatedWordbook }, function () {
//     });
//   });
