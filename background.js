// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.type === 'save') { 
//         chrome.storage.local.get({words: []}, function(result) {
//         let words = result.words;
//         words.push(request.word);
//         chrome.storage.local.set({words: words}, function() {
//             console.log('Word saved: ' + request.word);
//         });
//         });
//     }
// });
