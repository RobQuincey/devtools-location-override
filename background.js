// Background script for handling extension lifecycle
chrome.runtime.onInstalled.addListener(() => {
    console.log('DevTools Location Override extension installed');
});

// Handle messages from content scripts and DevTools
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getLocationOverride') {
        chrome.storage.local.get(['locationOverride'], (result) => {
            sendResponse(result.locationOverride || null);
        });
        return true; // Keep message channel open for async response
    }
    
    if (request.action === 'setLocationOverride') {
        chrome.storage.local.set({ locationOverride: request.data }, () => {
            sendResponse({ success: true });
        });
        return true;
    }
});
