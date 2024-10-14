// translations.js
const defaultTranslations = [
    { "key": 0, "title_en": "title English", "title_vi": "title Vietnamese", "text": "Hello", "translate": "Xin chào", updated_at: new Date().toISOString() },
    { "key": 1, "title_en": "title English", "title_vi": "title Vietnamese", "text": "Goodbye", "translate": "Tạm biệt", updated_at: new Date().toISOString() },
    { "key": 2, "title_en": "title English", "title_vi": "title Vietnamese", "text": "Thank you", "translate": "Cảm ơn", updated_at: new Date().toISOString() },
];

var currentTranslate;

// Function to fill each item in the translation list
function fillEachItemInList(item, listElement) {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.textContent = `${new Date(item.updated_at).toLocaleString()} - ${item.title_en} - ${item.title_vi}`;

    // Create a delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = function (event) {
        event.stopPropagation(); // Prevent the event from bubbling up to the list item
        currentTranslate = item;
        if (confirm('Are you sure you want to delete this translation?')) {
            deleteTranslation(item.key, function (updatedTranslations) {
                currentTranslate = undefined;
                createTranslationList(updatedTranslations); // Refresh the list
            });
        }
    };

    // Add click event to open modal
    listItem.addEventListener('click', function () {
        currentTranslate = item;
        fillDataToModal(item);
    });

    listItem.appendChild(deleteButton); // Append delete button to list item
    listElement.appendChild(listItem); // Append list item to the list
}

// Update createTranslationList to use fillEachItemInList
function createTranslationList(translateFromStorage) {
    translateFromStorage = translateFromStorage || [];
    const listElement = document.getElementById('translationList');
    listElement.innerHTML = ''; // Clear existing list
    translateFromStorage.reverse().forEach(item => {
        fillEachItemInList(item, listElement); // Use the new function
    });
}

// Function to fill data to modal
function fillDataToModal(item) {
    document.getElementById('title_en').value = item.title_en; // Set English title
    document.getElementById('title_vi').value = item.title_vi; // Set Vietnamese title
    document.getElementById('englishText').value = item.text; // Set English text
    document.getElementById('vietnameseText').value = item.translate; // Set Vietnamese translation
    openModal(); // Show the custom modal
}

// Load translations and create the list
loadTranslations(function (translate) {
    createTranslationList(translate);
});

const modal = document.getElementById("translationModal");
const closeModal = document.getElementById("closeModal");
const closeModalFooter = document.getElementById("closeModalFooter");

// Function to open the modal
function openModal() {
    modal.style.display = "block";
}

// Function to close the modal
function closeModalFunction() {
    currentTranslate = undefined;
    modal.style.display = "none";
}

// Event listeners for closing the modal
if (closeModal) {
    closeModal.onclick = closeModalFunction; // Close modal on close button click
}

if (closeModalFooter) {
    closeModalFooter.onclick = closeModalFunction; // Close modal on footer button click
}



function save(isAutoSave) {
    const titleEn = document.getElementById('title_en').value;
    const titleVi = document.getElementById('title_vi').value;
    const englishText = document.getElementById('englishText').value;
    const vietnameseText = document.getElementById('vietnameseText').value;

    const updatedTranslation = {
        key: currentTranslate.key,
        title_en: titleEn,
        title_vi: titleVi,
        text: englishText,
        translate: vietnameseText,
        updated_at: new Date().toISOString()
    };

    updateTranslation(updatedTranslation, function (translations) {
        createTranslationList(translations); // Refresh the list
        if (isAutoSave == false) {
            closeModalFunction(); // Close the modal
        }

    });
}

// Save button functionality
document.getElementById('saveButton').onclick = function () {
    save(false)
};

document.getElementById('backButton').onclick = function () {
    window.close();
};


// Discard button functionality
document.getElementById('discardButton').onclick = function () {
    if (confirm('Are you sure you want to discard changes?')) {
        closeModalFunction(); // Close the modal without saving
    }
};

// Add a button to create a new translation
document.getElementById('newTranslationButton').onclick = function () {
    // Create a new translation item with all fields empty and key as datetime
    currentTranslate = {
        key: Date.now(),
        title_en: '',
        title_vi: '',
        text: '',
        translate: ''
    };
    fillDataToModal(currentTranslate);
};

// Auto-save functionality every 10 seconds
setInterval(function () {
    if (currentTranslate != undefined) {
        save(true)

        const currentTime = new Date().toLocaleTimeString(); // Get current time
        document.getElementById('autoSaveText').textContent = 'Auto save: ' + currentTime; // Update the modal time display
    }
}, 10000); // 10 seconds