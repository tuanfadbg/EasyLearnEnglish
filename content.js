chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'getSelectedText') {
    const selectedText = window.getSelection().toString();
    sendResponse({ word: selectedText });
  }
});

// Wait for the DOM to be fully loaded


setTimeout(() => {
  
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
      inputElement.id = 'dictationInput'; // Set an ID for the input
      inputElement.placeholder = 'Type your dictation here';
      inputElement.style.width = 'calc(100% - 100px)'; // Adjust width to account for the button
      inputElement.style.marginTop = '10px'; // Optional: Add some margin

      // Create a clear button
      const clearButton = document.createElement('button');
      clearButton.textContent = 'Clear';
      clearButton.style.marginLeft = '10px'; // Optional: Add some margin
      clearButton.className = 'btn btn-danger'; // Optional: Add Bootstrap class for styling

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
},2000);


