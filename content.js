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
  chrome.runtime.sendMessage({ action: "openGoogleTranslate", data: text });
}


function shouldAddTextInput() {
  return true;
}

const inputElement = document.createElement('textarea');
const clearButton = document.createElement('button');
const transcriptDivElement = document.createElement('div');
initButtonAndTextArea();

// Check if the current URL is YouTube
function handleYouTubeContent() {
    console.log("www.youtube.com")
    // Find the div with the ID 'title'
    const titleDiv = document.getElementById('below');

    // Check if the div exists
    if (titleDiv) {
      console.log(titleDiv)
      
      // Add the input element at the beginning of the div
      titleDiv.insertBefore(clearButton, titleDiv.firstChild);
      titleDiv.insertBefore(inputElement, titleDiv.firstChild);

      const scrollContainerDiv = document.querySelector('div.style-scope ytd-watch-next-secondary-results-renderer');
      if (scrollContainerDiv) {
        scrollContainerDiv.insertBefore(transcriptDivElement, scrollContainerDiv.firstChild);
        // transcriptDivElement.appendChild(transcriptTextElement);
      } else {
        console.log("Div with class 'style-scope yt-chip-cloud-renderer' not found.");
      }

      let observeSubtitles = function () {
        if (!observeSubtitlesChanges()) {
          setTimeout(observeSubtitles, 3000);
        }
      };
      observeSubtitles();
      return true;
    } else {
      console.log("Div with ID 'title' not found.");
      return false;
    }
}

function handleDailyDictationContent() {
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

if (window.location.hostname === "www.youtube.com") {
  let handleYouTubeContentInterval = setInterval(() => {
    if (handleYouTubeContent()) {
      clearInterval(handleYouTubeContentInterval);
    }
  }, 2000);
}

if (window.location.hostname === "dailydictation.com") {
  handleDailyDictationContent();
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

function getCurrentEjoyEnglishText() {
  const div = document.querySelector('.glot-subtitles__sub__con');
  if (div) {
    // Get all span elements with class "ejoy-word" and concatenate their data-text attributes
    const spans = div.querySelectorAll('span.ejoy-word[data-hover="true"]');
    const texts = Array.from(spans).map(span => span.getAttribute('data-text')).join(' ');
    console.log(`All text from div: ${texts}`);
    return texts;
  }
  return '';
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


function observeSubtitlesChanges() {
  console.log("Starting to observe changes in subtitles");
  // Listen for changes in the glot-subtitles__sub__con element
  let targetNode = document.querySelector('.ejoy-subtitles');
  if (!targetNode) {
    console.error('Target node for observing subtitles changes is not ready.');
    return false;
  }
  let config = { childList: true, subtree: true };

  let callback = function (mutationsList, observer) {
    console.log('callback');
    for (let mutation of mutationsList) {
      if (mutation.type == 'childList') {
        // Store the text and time into a passage array
        let text = getCurrentEjoyEnglishText();
        let timeInSeconds = getCurrentTime();
        processPassage(text, timeInSeconds);
        selectWordInTranscriptAndScroll(text);
      }
    }
  };

  let observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
  console.log("observer.observe(targetNode, config);");
  return true;
}

let passage = [];
let lastText = '';
function processPassage(text, timeInSeconds) {
  if (text !== lastText) {
    let duplicateIndex = passage.findIndex(p => p.text === text && Math.abs(p.time - timeInSeconds) < 5);
    if (duplicateIndex !== -1) { // duplicate
      // passage.splice(duplicateIndex, 1); 
    } else {
      passage.push({text: text, time: timeInSeconds});
      passage.sort((a, b) => a.time - b.time);
      lastText = text;
    }
  }
  transcriptDivElement.innerHTML = passage.map(p => `${p.text}`).join(' ');
}

function getCurrentTime() {
  const video = document.querySelector('video');
  if (video) {
    return video.currentTime;
  }
  return 0;
}

function selectWordInTranscriptAndScroll(word) {
    const text = transcriptDivElement.innerHTML;

    // Create a regex to find the target word (case-sensitive)
    const regex = new RegExp(`\\b(${word})\\b`, 'g');

    // Replace the word with a highlighted version
    const highlightedText = text.replace(regex, '<span class="highlight">$1</span>');

    // Update the container with the highlighted text
    transcriptDivElement.innerHTML = highlightedText;
    scrollToHighlightedText();
}

function scrollToHighlightedText() {
  // Find the first highlighted element
  const highlightedElement = transcriptDivElement.querySelector(".highlight");
  if (!highlightedElement) {
      console.error("No highlighted text found");
      return;
  }

  // Scroll the container to the highlighted element
  highlightedElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
}



function initButtonAndTextArea() {
  // Set attributes for the input element
  inputElement.id = 'dictationInputTuanFadbg'; // Set an ID for the input
  inputElement.placeholder = 'Type your dictation here';
  inputElement.style.width = '100%';
  // inputElement.style.padding = '10px';
  inputElement.style.marginTop = '10px'; // Optional: Add some margin
  inputElement.style.border = 'none'; // Remove border
  inputElement.rows = 2; // Set the number of rows for a 2-line text input
  inputElement.style.fontSize = '2rem'
  inputElement.addEventListener('dblclick', () => {
    inputElement.value = ''; // Clear the input field
  });

  clearButton.textContent = 'Clear';
  clearButton.style.marginTop = '10px'; // Optional: Add some margin
  clearButton.className = 'btn btn-primary'; // Optional: Add Bootstrap class for styling

  // Add event listener to the clear button
  clearButton.addEventListener('click', () => {
    inputElement.value = ''; // Clear the input field
  });

  transcriptDivElement.id = 'tuanfadbg-transcript';
}

function addDynamicCSS() {
  // Create a <style> element
  const style = document.createElement('style');
  style.type = 'text/css';

  // Define the CSS rules
  const css = `
      .highlight {
          background-color: #20b2b2;
      }

      #tuanfadbg-transcript {
          max-height: 300px; /* Maximum height */
          overflow-y: auto;  /* Enable vertical scrolling */
          padding: 10px; /* Optional: Add some padding */
          color: white;
          font-family: "Roboto", "Arial", sans-serif;
          font-size: 2rem;
      }    
  `;

  // Add the CSS rules to the <style> element
  style.appendChild(document.createTextNode(css));

  // Append the <style> element to the <head>
  document.head.appendChild(style);
}

// Call the function to add the CSS
addDynamicCSS();
