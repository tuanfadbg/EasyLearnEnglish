// Create context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "addToWordbook",
        title: "Add to Wordbook",
        contexts: ["all"] // Show this menu item everywhere
    });
});

// Handle the click event on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log(info);
    if (info.menuItemId === "addToWordbook") {
        // Send a message to the content script
        chrome.tabs.sendMessage(tab.id, { action: "findElement" });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request);
    if (request.action === "openGoogleTranslate") {
        openGoogleTranslate(request.data);
    }
});

// Add click event to the word element to open Google Translate
function openGoogleTranslate(text) {
    const translateUrl = `https://translate.google.com/?sl=en&tl=vi&text=${encodeURIComponent(text)}&op=translate`;

    // Check for existing Google Translate tab
    chrome.tabs.query({}, (tabs) => {
        const existingTab = tabs.find(tab => tab.url && tab.url.startsWith("https://translate.google.com/"));
        if (existingTab) {
            // If the tab exists, update its URL and focus on it
            chrome.tabs.update(existingTab.id, { url: translateUrl, active: true });
        } else {
            // If not, create a new tab
            chrome.tabs.create({ url: translateUrl });
        }
    });
}
