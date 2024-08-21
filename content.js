// document.addEventListener('mouseup', function() {
//     let selectedText = window.getSelection().toString().trim();
    
//     if (selectedText) {
//       // Send the selected text to the popup
//       chrome.runtime.sendMessage({word: selectedText});
//     }
//   });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'getSelectedText') {
      const selectedText = window.getSelection().toString();
      sendResponse({ word: selectedText });
    }
});