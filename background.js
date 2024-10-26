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
    if (info.menuItemId === "addToWordbook") {
        // Send a message to the content script
        chrome.tabs.sendMessage(tab.id, { action: "findElement" });
    }
});
