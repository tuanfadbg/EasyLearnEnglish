document.addEventListener('DOMContentLoaded', function () {
    const wordsTableBody = document.querySelector('#wordsTable tbody');

    // Fetch the wordbook data from chrome.storage.local
    chrome.storage.local.get(['wordbook'], function (data) {
        const wordbook = data.wordbook || []; // Default to an empty array if not found

        // Check if the wordbook is empty
        if (wordbook.length === 0) {
            wordsTableBody.innerHTML = '<tr><td colspan="4">No words found in the wordbook.</td></tr>';
            return;
        }
        wordbook.reverse();

        // Iterate over the wordbook and create table rows
        wordbook.forEach(entry => {
            const row = document.createElement('tr');

            // Create cells for each entry
            const timeCell = document.createElement('td');
            timeCell.textContent = new Date(entry.time_created).toLocaleString(); // Format time to local string
            row.appendChild(timeCell);

            const wordCell = document.createElement('td');
            wordCell.textContent = entry.text;
            row.appendChild(wordCell);

            const contextCell = document.createElement('td');
            contextCell.textContent = entry.context;
            row.appendChild(contextCell);

            const actionCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.onclick = () => {
                deleteWordBook(entry, ()=> {
                    location.reload(); // Reload the page to refresh the table
                });
            };
            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.className = 'btn btn-primary btn-sm ml-2';
            editButton.textContent = 'Add';
            editButton.onclick = () => {
                showDialogEditAndFillDataByWordbook(entry); // Function to edit the word
            };
            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            // Append the row to the table body
            wordsTableBody.appendChild(row);
        });
    });
});

const editAndSaveWord = document.getElementById('editAndSaveWord');
editAndSaveWord.addEventListener('click', function () {
    addWord(wordInput.value, meaningInput.value, noteInput.value, () => {
        
    });
});

// Add event listener for close button
document.getElementById('closeButton').addEventListener('click', () => window.close());