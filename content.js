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

function addDynamicCSS() {
  // Create a <style> element
  const style = document.createElement('style');
  style.type = 'text/css';

  // Define the CSS rules
  const css = `
      .pre-highlight {
          color: #90EE90;
      }    
      .highlight {
          background-color: #198e8e;
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

const style = document.createElement('style');
style.textContent = `
  .gtx-bubble {
    z-index: 9998!important;
  }
`;
document.head.appendChild(style);


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

document.addEventListener('keydown', function (event) {
  if (event.metaKey && event.key === 'u' || event.metaKey && event.key === 'U') {
    console.log('Command + U key pressed!');
    let broadDiv = document.getElementById('broadDiv');
    if (broadDiv) {
      broadDiv.remove();
    } else {
      showTypeAndVoiceInputOnBottomRight();
    }
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
const switchButton = createSwitchButton();
const switchButtonLabel = createSwitchButtonLabel();
const switchButtonDiv = createSwitchButtonDiv();

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

      scrollContainerDiv.insertBefore(switchButtonDiv, scrollContainerDiv.firstChild);
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
    // check if dictationInput is not empty 
    const context = document.getElementById('dictationInput') ? document.getElementById('dictationInput').value : '';
    if (selectedText === '') {
      console.log("Element not found.");
      if (request && request.type == "no-alert") {

      } else {
        showAlert("Element not found")
      }
    } else {
      saveToWordbook(selectedText, context);
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
    return texts.replace(/&nbsp;/g, ' ').replace(/\s{2,}/g, ' ');
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

    let previousWord = '';
    for (let i = wordbook.length - 1; i >= 0; i--) {
      if (wordbook[i].text !== text) {
        previousWord = wordbook[i].text;
        break;
      }
    }

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
    showFixedBroadOnBottomLeft(text, previousWord);

    chrome.storage.local.set({ wordbook: wordbook }, function () {
      console.log('added to wordbook: ', wordbook);
      showAlert("Saved to wordbook");
    });
  });
}
const webhookUrl = 'http://localhost:5678/webhook/word';

function showFixedBroadOnBottomLeft(text, previousWord) {
  createFixedBroad();

  let loadingButton = document.getElementById('loadingButton');
  if (loadingButton) {
    loadingButton.style.display = 'block';
  }

  fetch(`${webhookUrl}?word=${text}&previousWord=${previousWord}`)
    .then(response => response.json())
    .then(data => {
      let loadingButton = document.getElementById('loadingButton');
      if (loadingButton) {
        loadingButton.style.display = 'none';
      }
      fillBroadData(data);
    })
    .catch(error => {
      let errorData = { "output": [error] }
      fillBroadData(errorData);
      setTimeout(closeFixedBroad, 2000);
    });
}

function fillBroadData(data) {
  let outputDiv = document.getElementById('outputDiv');
  outputDiv.innerHTML = "";
  // data = {"output":["The artist hopes to create a beautiful sculpture from this block of marble.","The company's creative team is brainstorming new ideas for the next advertising campaign.","Her innovative creations have earned her recognition in the design world."]}
  data.output.forEach((item) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = item;
    outputDiv.appendChild(paragraph);
  });
}

function closeFixedBroad() {
  let fixedDiv = document.getElementById('fixedDiv');
  fixedDiv.remove();
}

function createFixedBroad() {
  let fixedDiv = document.getElementById('fixedDiv');
  if (!fixedDiv) {
    fixedDiv = document.createElement('div');
    fixedDiv.id = 'fixedDiv';
    fixedDiv.style.position = 'fixed';
    fixedDiv.style.bottom = '16px';
    fixedDiv.style.left = '16px'; // Changed from '50%' to '0' to position on the left of the screen
    fixedDiv.style.width = '40%';
    fixedDiv.style.backgroundColor = 'gray';
    fixedDiv.style.color = 'white';
    fixedDiv.style.padding = '16px';
    fixedDiv.style.borderRadius = '6px';
    fixedDiv.style.zIndex = '9999';
  }

  let closeButton = document.getElementById('closeButton');
  if (!closeButton) {
    closeButton = document.createElement('button');
    closeButton.id = 'closeButton';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '0';
    closeButton.style.right = '0';
    closeButton.textContent = 'X';
    closeButton.style.padding = '10px'; // Added padding 10px
    closeButton.onclick = function () {
      closeFixedBroad();
    };
  }

  let loadingButton = document.getElementById('loadingButton');
  if (!loadingButton) {
    loadingButton = document.createElement('p');
    loadingButton.id = 'loadingButton';
    loadingButton.textContent = 'Loading...';
    loadingButton.style.fontSize = '15px';
  }

  let outputDiv = document.getElementById('outputDiv');
  if (!outputDiv) {
    outputDiv = document.createElement('div');
    outputDiv.id = 'outputDiv';
    outputDiv.style.overflowY = 'auto';
    outputDiv.style.marginRight = '40px';
    outputDiv.style.maxHeight = '200px';
    outputDiv.style.fontSize = '15px';
  }

  fixedDiv.appendChild(closeButton);
  fixedDiv.appendChild(loadingButton);
  fixedDiv.appendChild(outputDiv);
  document.body.appendChild(fixedDiv);
}

function showTypeAndVoiceInputOnBottomRight() {
  let broadDiv = document.getElementById('broadDiv');
  if (!broadDiv) {
    broadDiv = document.createElement('div');
    broadDiv.id = 'broadDiv';
    broadDiv.style.position = 'fixed';
    broadDiv.style.bottom = '16px';
    broadDiv.style.right = '16px';
    broadDiv.style.width = '40%';
    broadDiv.style.backgroundColor = 'gray';
    broadDiv.style.color = 'white';
    broadDiv.style.padding = '10px';
    broadDiv.style.borderRadius = '6px';
    broadDiv.style.zIndex = '9999';
  }

  let textInput = document.getElementById('broadDivInput');
  if (!textInput) {
    textInput = document.createElement('textarea');
    textInput.id = 'broadDivInput';
    textInput.style.width = '100%';
    textInput.style.height = '100px';
    textInput.style.resize = 'none';
    textInput.style.fontSize = '15px';
    textInput.style.borderRadius = '6px';
    textInput.style.boxSizing = 'border-box'; // Add box-sizing
  }

  // broadDiv.appendChild(closeButton);
  broadDiv.appendChild(textInput);
  document.body.appendChild(broadDiv);
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
        console.log('text: ' + text);
        let timeInSeconds = getCurrentTime();
        processPassage(text, timeInSeconds);
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
    preHighlight = lastText;
    let duplicateIndex = passage.findIndex(p => p.text === text && Math.abs(p.time - timeInSeconds) < 5);
    if (duplicateIndex !== -1) { // duplicate
      // passage.splice(duplicateIndex, 1); 
    } else {
      passage.push({ text: text, time: timeInSeconds });
      passage.sort((a, b) => a.time - b.time);
      lastText = text;
    }
  }

  let surroundingItems = getSurroundingItems(text);
  // console.log('Before Item:', surroundingItems.before ? surroundingItems.before.text : 'None');
  // console.log('After Item:', surroundingItems.after ? surroundingItems.after.text : 'None');

  displaySurroundingItems(surroundingItems);

  let formattedPassage = formatPassage(passage, text, preHighlight);
  transcriptDivElement.innerHTML = formattedPassage;
  if (document.getElementById('autoscrollTranscriptButton').checked) {
    scrollToHighlightedText();
  }
}

function formatPassage(passage, text, preHighlight) {
  return passage.map(p => {
    if (p.text === text) {
      return `<span class="highlight">${p.text}</span>`;
    } else if (p.text === preHighlight) {
      return `<span class="pre-highlight">${p.text}</span>`;
    } else {
      return `${p.text}`;
    }
  }).join(' ');
}

let beforeText = "";

function displaySurroundingItems(surroundingItems) {
  console.log(beforeText);
  if (surroundingItems.before == null) return;
  if (beforeText === surroundingItems.before.text) return;

  beforeText = surroundingItems.before.text;
  addHightlightSubtitleWraper();
  if (surroundingItems.before == null) {
    document.querySelector('.pre-highlight-subtitle').innerHTML = "";
  } else {
    document.querySelector('.pre-highlight-subtitle').innerHTML = convertRawTextToSubtitleFormat(surroundingItems.before.text);
  }
  // if (surroundingItems.after == null) {
  //   document.querySelector('.post-highlight-subtitle').innerHTML = "";
  // } else {
  //   document.querySelector('.post-highlight-subtitle').innerHTML = convertRawTextToSubtitleFormat(surroundingItems.after.text);
  // }
}

// Function to get 1 item before and 1 item after text inside passage
function getSurroundingItems(text) {
  let index = passage.findIndex(p => p.text === text);
  let beforeItem = index > 0 ? passage[index - 1] : null;
  let afterItem = index < passage.length - 1 ? passage[index + 1] : null;
  return { before: beforeItem, after: afterItem };
}

function addPreHighlightSubtitle(rawText) {
  addHightlightSubtitleWraper();
  document.querySelector('.pre-highlight-subtitle').innerHTML = convertRawTextToSubtitleFormat(rawText);
}

function convertRawTextToSubtitleFormat(rawText) {
  if (rawText == null) return "";
  const words = rawText.split(' ');
  let html = '';
  words.forEach((word) => {
    html += `<span class="ejoy-word" data-hover="true" data-text="${word}">${word} </span><span> </span>`;
  });
  return html;
}

function addHightlightSubtitleWraper() {
  if (!document.querySelector('.pre-highlight-subtitle')) {
    let html = '<div class="pre-highlight-subtitle" style="display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-end;"></div>';
    document.querySelector('.ejoy-subs-wrap').insertAdjacentHTML(
      'afterbegin', html);

    let htmlpost = '<div class="post-highlight-subtitle" style="display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-end;"></div>';
    document.querySelector('.ejoy-subs-wrap').insertAdjacentHTML(
      'beforeend', htmlpost);
  }
}

function getCurrentTime() {
  const video = document.querySelector('video');
  if (video) {
    return video.currentTime;
  }
  return 0;
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
  inputElement.id = 'dictationInputTuanFadbg';
  inputElement.placeholder = 'Type your dictation here';
  inputElement.style.width = '100%';
  // inputElement.style.backgroundColor = 'white';
  inputElement.style.borderRadius = '12px';
  inputElement.style.marginTop = '10px';
  inputElement.style.border = 'none';
  inputElement.rows = 2;
  inputElement.style.fontSize = '2rem';
  inputElement.style.boxSizing = 'border-box';
  inputElement.style.padding = '12px';
  inputElement.addEventListener('dblclick', () => {
    inputElement.value = '';
  });

  clearButton.textContent = 'Clear';
  clearButton.style.marginTop = '10px';
  clearButton.style.fontSize = '1.5rem';
  clearButton.style.backgroundColor = 'rgba(128, 128, 128, 0.2)';
  clearButton.style.color = 'white';
  clearButton.style.padding = '8px';
  clearButton.style.borderRadius = '12px';

  // Add event listener to the clear button
  clearButton.addEventListener('click', () => {
    inputElement.value = ''; // Clear the input field
  });

  transcriptDivElement.id = 'tuanfadbg-transcript';
}

// Function to create and configure the switch button
function createSwitchButton() {
  const switchButton = document.createElement('input');
  switchButton.type = 'checkbox';
  switchButton.id = 'autoscrollTranscriptButton';
  switchButton.checked = false;
  switchButton.style.fontSize = 'larger';
  switchButton.style.textAlign = 'left';
  switchButton.style.marginLeft = '0px';
  switchButton.style.display = 'inline-block';
  return switchButton;
}

// Function to create and configure the switch button label
function createSwitchButtonLabel() {
  const switchButtonLabel = document.createElement('label');
  switchButtonLabel.htmlFor = 'autoscrollTranscriptButton';
  switchButtonLabel.style.fontSize = 'larger';
  switchButtonLabel.style.marginLeft = '5px';
  switchButtonLabel.style.color = 'white';
  switchButtonLabel.textContent = 'Auto Scroll';
  switchButtonLabel.style.display = 'inline-block';
  return switchButtonLabel;
}

// Function to create and configure the switch button container
function createSwitchButtonDiv() {
  const switchButtonDiv = document.createElement('div');
  switchButtonDiv.style.display = 'flex';
  switchButtonDiv.style.alignItems = 'center';
  switchButtonDiv.style.justifyContent = 'center';
  switchButtonDiv.appendChild(switchButton);
  switchButtonDiv.appendChild(switchButtonLabel);
  return switchButtonDiv;
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