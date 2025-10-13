// Content script - runs in ISOLATED world with access to chrome APIs
(function() {
    'use strict';

    // Guard to prevent multiple injections
    if (window.locationOverrideContentScriptLoaded) {
        return;
    }
    window.locationOverrideContentScriptLoaded = true;

    // Listen for messages from inject.js (MAIN world)
    window.addEventListener('message', async function(event) {
        if (event.source !== window) return;

        if (event.data.type === 'LOCATION_OVERRIDE_GET_INITIAL') {
            // Get initial settings from background/storage
            try {
                const response = await chrome.runtime.sendMessage({ action: 'getLocationOverride' });
                window.postMessage({
                    type: 'LOCATION_OVERRIDE_INITIAL',
                    data: response
                }, '*');
            } catch (error) {
                console.log('[Location Override] Could not load initial settings:', error);
            }
        }
    });

    // Listen for messages from DevTools panel
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'ping') {
            sendResponse({ success: true });
            return true;
        }
        
        if (request.action === 'setLocationOverride') {
            // Forward to MAIN world script via window.postMessage
            window.postMessage({
                type: 'LOCATION_OVERRIDE_SET',
                data: request.data
            }, '*');
            sendResponse({ success: true });
        }
        
        if (request.action === 'clearLocationOverride') {
            // Forward to MAIN world script via window.postMessage
            window.postMessage({
                type: 'LOCATION_OVERRIDE_CLEAR'
            }, '*');
            sendResponse({ success: true });
        }
        
        return true;
    });
})();
