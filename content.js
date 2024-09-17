chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'getSelectedText') {
    const selectedText = window.getSelection().toString();
    sendResponse({ word: selectedText });
  }
});

// Wait for the DOM to be fully loaded


setTimeout(() => {
  if (isDictationWeb()) {
    console.log("DOMContentLoaded");
    // Find the div with the ID 'app-dictation'
    const dictationDiv = document.getElementById('app-dictation');

    // Check if the div exists
    if (dictationDiv) {
      console.log("Dictation div found");
      // Create a new input element
      const inputElement = document.createElement('input');

      // Set attributes for the input element
      inputElement.type = 'text';
      inputElement.id = 'dictationInputTuanFadbg'; // Set an ID for the input
      inputElement.placeholder = 'Type your dictation here';
      inputElement.style.width = '100%';
      inputElement.style.marginTop = '10px'; // Optional: Add some margin
      inputElement.style.border = 'none'; // Remove border

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

      // Append the input element and clear button to the div
      dictationDiv.appendChild(inputElement);
      dictationDiv.appendChild(clearButton);
    } else {
      console.error("Div with ID 'app-dictation' not found.");
    }
    // ... rest of the code ...
  }
}, 2000);

// Variables to track Control key presses
let ctrlPressCount = 0;
let lastCtrlPressTime = 0;
const doublePressThreshold = 300; // Time in milliseconds to consider as double press

// Listen for keydown events on the document
document.addEventListener('keydown', (event) => {
  if (isDictationWeb()) {
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

function isDictationWeb() {
  return true
  // Check if chrome.tabs is available
  // if (typeof chrome !== 'undefined' && chrome.tabs) {
  //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //     const currentTab = tabs[0];
  //     if (currentTab && currentTab.url.includes("facebook.com")) {
  //       return true;
  //     }
  //     return false;
  //   });
  // }
  // return false; // Return false if chrome.tabs is not available
}
