function createModal() {
    const modalHtml = `
    <div class="modal fade" id="confirmDialog" tabindex="-1" role="dialog" aria-labelledby="confirmDialogLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="confirmDialogLabel">Edit</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="container">
                        <label for="word">Word:</label>
                        <input type="text" id="word" placeholder="Enter word">
                        <div id="error-message" style="color: red;"></div>
                        <label for="meaning">Meaning:</label><br/>
                        <input type="text" id="meaning" placeholder="Enter meaning"><br/>
                        <label for="note">Note:</label><br/>
                        <textarea id="note" placeholder="Enter note" rows="5" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ced4da; border-radius: 4px; box-sizing: border-box;"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" id="editAndSaveWord" class="btn btn-primary" data-dismiss="modal">OK</button>
                </div>
            </div>
        </div>
    </div>`;

    // Create a div element and set its innerHTML to the modal HTML
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHtml;

    // Append the modal to the body
    document.body.appendChild(modalDiv);

    // Optional: Initialize modal behavior using Bootstrap's JavaScript
    $('#confirmDialog').modal({
        show: false
    });
}

// Call the function to create the modal
createModal();

const wordInput = document.getElementById('word');
const meaningInput = document.getElementById('meaning');
const noteInput = document.getElementById('note');

wordInput.addEventListener('input', function() {
    checkWordIsValid();
});

function checkWordIsValid() {
    const word = wordInput.value.trim();
    const errorMessage = document.getElementById('error-message'); // Add this line to get the error message element
    errorMessage.textContent = ''; // Clear previous error message

    if (word) {
        checkWordIsExisted(word).then(exists => {
            if (exists) {
                console.log(`Word "${word}" already exists.`);
                errorMessage.textContent = `Error: Word "${word}" already exists.`; // Display error message
            } else {
                console.log(`Word "${word}" does not exist.`);
            }
        });
    }
}

function showDialogEditAndFillData(wordData) {
    $('#confirmDialog').modal('show');
    wordInput.value = wordData.word;
    meaningInput.value = wordData.meaning;
    noteInput.value = wordData.note;
    checkWordIsValid();
}

function showDialogEditAndFillDataByWordbook(wordbookItem) {
    $('#confirmDialog').modal('show');
    wordInput.value = wordbookItem.text;
    meaningInput.value = '';
    noteInput.value = wordbookItem.context.join('\n');
    checkWordIsValid();
}
