chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getSelectedText') {
    const selectedText = window.getSelection().toString();
    sendResponse({ word: selectedText });
  } else if (request.action === "findElement") {
    findTextAndAddToWordbook(request);
  } else if (request.type == 'getTranslationValue') {
    console.log("Received translated sentences:");
    var hiddenOutput;
    hiddenOutput = document.getElementById('translation-data-hidden-output');
    console.log(hiddenOutput.innerHTML)
    const data = JSON.parse(hiddenOutput.innerHTML);
    saveToTranslation(data, () => {
      sendResponse({ status: "oke" });
    });

  } else if (request.type == 'sendTranslationDataToContentJS') {
    var data = request.translation;
    console.log("Received translation data:", data);
    var hiddenInput = document.getElementById('translation-data-hidden-input');
    hiddenInput.value = JSON.stringify(request.translation);
    hiddenInput.dispatchEvent(new Event('input'));
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
        ctrlPressCount = 0; // Reset count after action
        console.log('Control key pressed twice!');
        // Perform your action here
        var inputElement = document.getElementById('dictationInputTuanFadbg');
        if (inputElement != null) {
          inputElement.value = ''; // Example action: clear the input
          inputElement.focus(); // Focus the keyboard to the input element
        }

      }
    }
  }
});

let lastAltPressTime = 0;
document.addEventListener('keydown', function (event) {
    if (event.key === 'Alt') {
        const currentTime = new Date().getTime();
        if (currentTime - lastAltPressTime < 500) { // 500 milliseconds for double-click
            findTextAndAddToWordbook();
        }
        lastAltPressTime = currentTime;
    }
});

let lastShiftPressTime = 0;
document.addEventListener('keydown', function (event) {
    if (event.key === 'Shift') {
        const currentTime = new Date().getTime();
        if (currentTime - lastShiftPressTime < 500) { // 500 milliseconds for double-click
            console.log('Shift key pressed twice!');
            openGoogleTranslateSelectedText();
        }
        lastShiftPressTime = currentTime;
    }
});

function openGoogleTranslateSelectedText() {
  let text = window.getSelection().toString();
  if (text == '') { // check simple translate extension
    const element = document.querySelector('p.simple-translate-result'); 
    if (element == undefined)
      text = '';
    else
      text = element.textContent || element.innerText;
    console.log(element);
  }
  if (text == '') { // check ejoy
    text = getEjoySelectedContext()
    console.log(text);
  }
  if (text == '') 
    return;
  console.log(text);
  chrome.runtime.sendMessage({ action: "openGoogleTranslate", data: text});
}


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
      console.log("Div with ID 'title' not found.");
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
      console.log("Div with ID 'app-dictation' not found.");
    }

  }, 2000);
}


function saveToTranslation(dataContainer, callback) {
  //   var dataContainer = {
  //     id: translationId,//11231231231231232
  //     content: translatedSentences //[{id: "id-1", text: "1 con vịt", translated: "a duck", my_translation: "1 duck"}]
  // };
  chrome.storage.local.get(['translationContainer'], function (result) {
    const translationContainer = result.translationContainer || [];
    console.log(translationContainer);
    const existingEntry = translationContainer.find(entry => entry.id === dataContainer.id);
    if (existingEntry) {
      existingEntry.content = dataContainer.content;
      existingEntry.chatgpt = dataContainer.chatgpt;
      existingEntry.time_updated = new Date().toISOString();
    } else {
      translationContainer.push({
        "id": dataContainer.id,
        "content": dataContainer.content,
        "time_updated": new Date().toISOString(),
      }); // Add the new entry
    }
    chrome.storage.local.set({ translationContainer: translationContainer }, function () {
      console.log('added to translationContainer: ', translationContainer);
      if (callback())
        callback();
    });
  });
}

function findTextAndAddToWordbook(request) {
  const ejoySelectedText = getEjoySelectedText();
  if (ejoySelectedText === '') {
    const selectedText = window.getSelection().toString();
    if (selectedText === '') {
      console.log("Element not found.");
      if (request && request.type == "no-alert") {

      } else {
        showAlert("Element not found")
      }
    } else {
      saveToWordbook(selectedText);
    }
  } else {
    const context = getEjoySelectedContext();
    saveToWordbook(ejoySelectedText, context);
  }
}

/**
 * Function to get all text from the specified div
 * @returns {string} - The concatenated text from the div
 */
function getEjoySelectedContext() {
  const div = document.querySelector('.glot-subtitles__sub__con');
  if (div) {
    // Get all span elements with class "ejoy-word" and concatenate their data-text attributes
    const spans = div.querySelectorAll('span.ejoy-word[data-hover="true"]');
    const texts = Array.from(spans).map(span => span.getAttribute('data-text')).join(' ');
    console.log(`All text from div: ${texts}`);
    return texts;
  } else {
    // If div is not found, find the text "danger"
    const dangerDiv = document.querySelector('.word_content .word_word');
    if (dangerDiv) {
      const dangerText = dangerDiv.textContent;
      console.log(`Found danger text: ${dangerText}`);
      return dangerText;
    } else {
      console.log("Div not found and danger text not found.");
      alert("Div not found and danger text not found.");
      return '';
    }
  }
}

function getEjoySelectedText() {
  let element = document.querySelector('span.ejoy-word.ejoy-sub-hovered[data-hover="true"]');
  if (element) {
  } else {
    element = document.querySelector('span.ejoy-word.ejoy-sub-active');
  }
  if (element) {
    const text = element.getAttribute('data-text'); // Get the data-text attribute
    console.log(`Found element with text: ${text}`);
    return text;
  } else {
    return '';
  }
}

function saveToWordbook(text, context) {
  text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  text = text.toLowerCase();
  chrome.storage.local.get(['wordbook'], function (result) {
    const wordbook = result.wordbook || [];
    console.log(wordbook);
    const existingEntry = wordbook.find(entry => entry.text === text);
    if (existingEntry) {
      existingEntry.context.push(context);
      existingEntry.time_updated = new Date().toISOString();
    } else {
      wordbook.push({
        "text": text,
        "context": [context],
        "time_created": new Date().toISOString(),
        "time_updated": new Date().toISOString(),
        "added_to_saved_word": "false"
      }); // Add the new entry
    }
    chrome.storage.local.set({ wordbook: wordbook }, function () {
      console.log('added to wordbook: ', wordbook);
      showAlert("Saved to wordbook");
    });
  });
}

function showAlert(text) {
  // Check if the popup already exists
  let popup = document.getElementById('popup');

  if (!popup) {
    // Create the popup element
    popup = document.createElement('div');
    popup.id = 'popup';
    document.body.appendChild(popup);

    // Style the popup element
    const style = document.createElement('style');
    style.textContent = `
        #popup {
            visibility: hidden;
            min-width: 250px;
            background-color: #4CAF50;
            color: white;
            text-align: center;
            border-radius: 2px;
            padding: 16px;
            position: fixed;
            z-index: 1;
            left: 50%;
            bottom: 30px;
            font-size: 17px;
            transform: translateX(-50%);
        }
    `;
    document.head.appendChild(style);
  }

  popup.textContent = text;

  // Show the popup
  popup.style.visibility = 'visible';
  setTimeout(function () {
    popup.style.visibility = 'hidden';
  }, 2000);


}