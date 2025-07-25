// Content script - runs in the context of web pages
(function() {
    'use strict';

    // Guard to prevent multiple injections
    if (window.locationOverrideContentScriptLoaded) {
        return;
    }
    window.locationOverrideContentScriptLoaded = true;

    let injected = false;

    // Inject the override script into the page's main world
    function injectScript() {
        if (injected) return;
        injected = true;

        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('inject.js');
        script.onload = function() {
            this.remove();
        };
        (document.head || document.documentElement).appendChild(script);
    }

    // Listen for messages from DevTools panel
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'ping') {
            // Simple ping to check if content script is available
            sendResponse({ success: true });
            return true;
        }
        
        if (request.action === 'setLocationOverride') {
            // Forward to injected script
            window.postMessage({
                type: 'LOCATION_OVERRIDE_SET',
                data: request.data
            }, '*');
            sendResponse({ success: true });
        }
        
        if (request.action === 'clearLocationOverride') {
            // Forward to injected script
            window.postMessage({
                type: 'LOCATION_OVERRIDE_CLEAR'
            }, '*');
            sendResponse({ success: true });
        }
        
        return true;
    });

    // Inject script when DOM is ready or immediately if already ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectScript);
    } else {
        injectScript();
    }
})();
