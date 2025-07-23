// DevTools Panel JavaScript
class LocationOverridePanel {
    constructor() {
        this.tabId = chrome.devtools.inspectedWindow.tabId;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.updateUI();
    }

    bindEvents() {
        // Toggle override
        document.getElementById('enableOverride').addEventListener('change', (e) => {
            this.toggleOverride(e.target.checked);
        });

        // Input changes
        ['latitude', 'longitude', 'accuracy'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.validateInputs();
            });
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lat = btn.dataset.lat;
                const lng = btn.dataset.lng;
                const acc = btn.dataset.acc;
                
                document.getElementById('latitude').value = lat;
                document.getElementById('longitude').value = lng;
                document.getElementById('accuracy').value = acc;
                
                this.validateInputs();
                this.showStatus('Preset location loaded', 'info');
            });
        });

        // Action buttons
        document.getElementById('applyBtn').addEventListener('click', () => {
            this.applyOverride();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearOverride();
        });
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['locationOverride']);
            const settings = result.locationOverride;
            
            if (settings) {
                document.getElementById('enableOverride').checked = settings.enabled || false;
                document.getElementById('latitude').value = settings.latitude || 37.7749;
                document.getElementById('longitude').value = settings.longitude || -122.4194;
                document.getElementById('accuracy').value = settings.accuracy || 10;
                
                this.updateUI();
                this.updateCurrentLocation();
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async saveSettings() {
        const settings = {
            enabled: document.getElementById('enableOverride').checked,
            latitude: parseFloat(document.getElementById('latitude').value) || 0,
            longitude: parseFloat(document.getElementById('longitude').value) || 0,
            accuracy: parseInt(document.getElementById('accuracy').value) || 10
        };

        try {
            await chrome.storage.local.set({ locationOverride: settings });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    toggleOverride(enabled, skipClear = false) {
        document.getElementById('locationInputs').classList.toggle('enabled', enabled);
        this.saveSettings();
        this.updateCurrentLocation();
        
        if (enabled) {
            this.showStatus('Location override enabled', 'info');
        } else {
            this.showStatus('Location override disabled', 'info');
            if (!skipClear) {
                this.clearOverride();
            }
        }
    }

    validateInputs() {
        const lat = parseFloat(document.getElementById('latitude').value);
        const lng = parseFloat(document.getElementById('longitude').value);
        const acc = parseInt(document.getElementById('accuracy').value);

        let isValid = true;
        let errors = [];

        if (isNaN(lat) || lat < -90 || lat > 90) {
            errors.push('Latitude must be between -90 and 90');
            isValid = false;
        }

        if (isNaN(lng) || lng < -180 || lng > 180) {
            errors.push('Longitude must be between -180 and 180');
            isValid = false;
        }

        if (isNaN(acc) || acc < 1) {
            errors.push('Accuracy must be at least 1 meter');
            isValid = false;
        }

        const applyBtn = document.getElementById('applyBtn');
        applyBtn.disabled = !isValid;

        if (!isValid && errors.length > 0) {
            this.showStatus(errors[0], 'error');
        }

        return isValid;
    }

    async applyOverride() {
        if (!this.validateInputs()) {
            return;
        }

        const enabled = document.getElementById('enableOverride').checked;
        if (!enabled) {
            this.showStatus('Please enable location override first', 'error');
            return;
        }

        const settings = {
            enabled: true,
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value),
            accuracy: parseInt(document.getElementById('accuracy').value)
        };

        try {
            // Save settings
            await this.saveSettings();

            // Send message to content script to apply override
            await chrome.tabs.sendMessage(this.tabId, {
                action: 'setLocationOverride',
                data: settings
            });

            this.showStatus('✅ Location override applied successfully!', 'success');
            this.updateCurrentLocation();
        } catch (error) {
            console.error('Failed to apply override:', error);
            this.showStatus('❌ Failed to apply override. Try refreshing the page.', 'error');
        }
    }

    async clearOverride() {
        try {
            // Clear from storage
            const currentSettings = await chrome.storage.local.get(['locationOverride']);
            if (currentSettings.locationOverride) {
                currentSettings.locationOverride.enabled = false;
                await chrome.storage.local.set({ locationOverride: currentSettings.locationOverride });
            }

            // Send message to content script to clear override
            await chrome.tabs.sendMessage(this.tabId, {
                action: 'clearLocationOverride'
            });

            document.getElementById('enableOverride').checked = false;
            this.toggleOverride(false, true); // Pass skipClear=true to prevent recursion
            this.showStatus('🔄 Location override cleared', 'info');
            this.updateCurrentLocation();
        } catch (error) {
            console.error('Failed to clear override:', error);
            this.showStatus('❌ Failed to clear override', 'error');
        }
    }

    updateUI() {
        const enabled = document.getElementById('enableOverride').checked;
        document.getElementById('locationInputs').classList.toggle('enabled', enabled);
    }

    updateCurrentLocation() {
        const enabled = document.getElementById('enableOverride').checked;
        const currentLocationDiv = document.getElementById('currentLocation');
        
        if (enabled) {
            const lat = document.getElementById('latitude').value;
            const lng = document.getElementById('longitude').value;
            const acc = document.getElementById('accuracy').value;
            
            currentLocationDiv.innerHTML = `
                <p><strong>Override Active:</strong></p>
                <p>Latitude: ${lat}°</p>
                <p>Longitude: ${lng}°</p>
                <p>Accuracy: ${acc} meters</p>
            `;
        } else {
            currentLocationDiv.innerHTML = '<p>No override active</p>';
        }
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        
        // Auto-hide after 3 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                statusDiv.textContent = '';
                statusDiv.className = 'status';
            }, 3000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LocationOverridePanel();
});
