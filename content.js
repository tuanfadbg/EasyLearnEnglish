chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'getSelectedText') {
    const selectedText = window.getSelection().toString();
    sendResponse({ word: selectedText });
  }
});

// Variables to track Control key presses
let ctrlPressCount = 0;
let lastCtrlPressTime = 0;
const doublePressThreshold = 300; // Time in milliseconds to consider as double press

// Listen for keydown events on the document
document.addEventListener('keydown', (event) => {
  if (shouldAddTextInput()) {
    if (event.key === 'Control') {
      const currentTime = new Date().getTime();

      // Check if the time between presses is within the threshold
      if (currentTime - lastCtrlPressTime <= doublePressThreshold) {
        ctrlPressCount++;
      } else {
        ctrlPressCount = 1; // Reset count if time exceeds threshold
      }

      lastCtrlPressTime = currentTime; // Update the last press time

      // Check if Control key was pressed twice
      if (ctrlPressCount === 2) {
        console.log('Control key pressed twice!');
        // Perform your action here
        var inputElement = document.getElementById('dictationInputTuanFadbg');
        inputElement.value = ''; // Example action: clear the input
        ctrlPressCount = 0; // Reset count after action
      }
    }
  }
});

function shouldAddTextInput() {
  return true;
}

const inputElement = document.createElement('textarea');

// Set attributes for the input element
inputElement.id = 'dictationInputTuanFadbg'; // Set an ID for the input
inputElement.placeholder = 'Type your dictation here';
inputElement.style.width = '100%';
inputElement.style.padding = '10px';
inputElement.style.marginTop = '10px'; // Optional: Add some margin
inputElement.style.border = 'none'; // Remove border
inputElement.rows = 2; // Set the number of rows for a 2-line text input

inputElement.addEventListener('dblclick', () => {
  inputElement.value = ''; // Clear the input field
});
// Create a clear button
const clearButton = document.createElement('button');
clearButton.textContent = 'Clear';
clearButton.style.marginTop = '10px'; // Optional: Add some margin
clearButton.className = 'btn btn-primary'; // Optional: Add Bootstrap class for styling

// Add event listener to the clear button
clearButton.addEventListener('click', () => {
  inputElement.value = ''; // Clear the input field
});

// Check if the current URL is YouTube
if (window.location.hostname === "www.youtube.com") {
  setTimeout(() => {
    console.log("www.youtube.com")
    // Find the div with the ID 'title'
    const titleDiv = document.getElementById('below');

    // Check if the div exists
    if (titleDiv) {
      console.log(titleDiv)
      inputElement.style.fontSize = '2rem'
      // Add the input element at the beginning of the div
      titleDiv.insertBefore(clearButton, titleDiv.firstChild);
      titleDiv.insertBefore(inputElement, titleDiv.firstChild);
    } else {
      console.error("Div with ID 'title' not found.");
    }
  }, 2000);
}

if (window.location.hostname === "dailydictation.com") {
  setTimeout(() => {
    console.log("DOMContentLoaded");
    // Find the div with the ID 'app-dictation'
    var dictationDiv;
    dictationDiv = document.getElementById('app-dictation');

    // Check if the div exists
    if (dictationDiv) {
      console.log("Dictation div found");
      // Append the input element and clear button to the div
      dictationDiv.appendChild(inputElement);
      dictationDiv.appendChild(clearButton);
    } else {
      console.error("Div with ID 'app-dictation' not found.");
    }

  }, 2000);
}
