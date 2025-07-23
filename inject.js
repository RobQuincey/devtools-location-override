// Injected script - runs in the page's main world to override geolocation
(function() {
    'use strict';

    let locationOverride = null;
    let isOverrideActive = false;

    // Store original geolocation methods
    const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
    const originalWatchPosition = navigator.geolocation.watchPosition.bind(navigator.geolocation);
    const originalClearWatch = navigator.geolocation.clearWatch.bind(navigator.geolocation);

    // Track active watch positions
    const activeWatches = new Map();

    // Create a mock position object
    function createMockPosition(lat, lng, accuracy) {
        return {
            coords: {
                latitude: lat,
                longitude: lng,
                altitude: null,
                accuracy: accuracy,
                altitudeAccuracy: null,
                heading: null,
                speed: null
            },
            timestamp: Date.now()
        };
    }

    // Override getCurrentPosition
    navigator.geolocation.getCurrentPosition = function(successCallback, errorCallback, options) {
        if (isOverrideActive && locationOverride) {
            console.log('[Location Override] Using overridden location:', locationOverride);
            
            // Simulate async behavior
            setTimeout(() => {
                const position = createMockPosition(
                    locationOverride.latitude,
                    locationOverride.longitude,
                    locationOverride.accuracy
                );
                successCallback(position);
            }, 10);
        } else {
            // Use original geolocation
            originalGetCurrentPosition(successCallback, errorCallback, options);
        }
    };

    // Override watchPosition
    navigator.geolocation.watchPosition = function(successCallback, errorCallback, options) {
        if (isOverrideActive && locationOverride) {
            console.log('[Location Override] Using overridden location for watch:', locationOverride);
            
            // Create a watch ID
            const watchId = Math.floor(Math.random() * 1000000);
            
            // Create watch info object
            const watchInfo = {
                successCallback,
                errorCallback,
                options,
                intervalId: null
            };
            
            // Store the watch
            activeWatches.set(watchId, watchInfo);
            
            // Start periodic updates (default to 1 second intervals)
            const updateInterval = (options && options.timeout) ? Math.min(options.timeout, 5000) : 1000;
            
            // Initial position callback
            setTimeout(() => {
                if (activeWatches.has(watchId)) {
                    const position = createMockPosition(
                        locationOverride.latitude,
                        locationOverride.longitude,
                        locationOverride.accuracy
                    );
                    successCallback(position);
                }
            }, 10);
            
            // Set up periodic updates
            watchInfo.intervalId = setInterval(() => {
                if (activeWatches.has(watchId) && isOverrideActive && locationOverride) {
                    const position = createMockPosition(
                        locationOverride.latitude,
                        locationOverride.longitude,
                        locationOverride.accuracy
                    );
                    successCallback(position);
                }
            }, updateInterval);
            
            return watchId;
        } else {
            // Use original geolocation
            return originalWatchPosition(successCallback, errorCallback, options);
        }
    };

    // Override clearWatch
    navigator.geolocation.clearWatch = function(watchId) {
        if (activeWatches.has(watchId)) {
            const watchInfo = activeWatches.get(watchId);
            if (watchInfo.intervalId) {
                clearInterval(watchInfo.intervalId);
            }
            activeWatches.delete(watchId);
            console.log('[Location Override] Cleared watch:', watchId);
        } else {
            // Use original clearWatch
            originalClearWatch(watchId);
        }
    };

    // Listen for messages from content script
    window.addEventListener('message', function(event) {
        if (event.source !== window) return;

        if (event.data.type === 'LOCATION_OVERRIDE_SET') {
            locationOverride = event.data.data;
            isOverrideActive = locationOverride && locationOverride.enabled;
            console.log('[Location Override] Override set:', locationOverride);
            
            // Trigger immediate updates for all active watches
            triggerWatchUpdates();
        }

        if (event.data.type === 'LOCATION_OVERRIDE_CLEAR') {
            isOverrideActive = false;
            locationOverride = null;
            console.log('[Location Override] Override cleared');
            
            // Clear all override watches
            clearAllOverrideWatches();
        }
    });

    // Helper function to trigger updates for all active watches
    function triggerWatchUpdates() {
        if (isOverrideActive && locationOverride) {
            activeWatches.forEach((watchInfo, watchId) => {
                const position = createMockPosition(
                    locationOverride.latitude,
                    locationOverride.longitude,
                    locationOverride.accuracy
                );
                watchInfo.successCallback(position);
            });
        }
    }

    // Helper function to clear all override watches
    function clearAllOverrideWatches() {
        activeWatches.forEach((watchInfo, watchId) => {
            if (watchInfo.intervalId) {
                clearInterval(watchInfo.intervalId);
            }
        });
        activeWatches.clear();
    }

    // Load initial settings from storage
    async function loadInitialSettings() {
        try {
            // Send message to background script to get stored settings
            const response = await new Promise((resolve) => {
                if (typeof chrome !== 'undefined' && chrome.runtime) {
                    chrome.runtime.sendMessage({ action: 'getLocationOverride' }, resolve);
                } else {
                    resolve(null);
                }
            });
            
            if (response && response.enabled) {
                locationOverride = response;
                isOverrideActive = true;
                console.log('[Location Override] Loaded initial settings:', locationOverride);
            }
        } catch (error) {
            console.log('[Location Override] Could not load initial settings:', error);
        }
    }

    // Initialize
    loadInitialSettings();

    console.log('[Location Override] Geolocation override script injected');
})();
