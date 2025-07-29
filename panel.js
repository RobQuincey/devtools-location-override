// DevTools Panel JavaScript
class LocationOverridePanel {
    constructor() {
        this.tabId = chrome.devtools.inspectedWindow.tabId;
        this.routeSimulation = new RouteSimulation(this.tabId);
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.loadPresets();
        this.loadAdvancedOptionsState();
        this.updateUI();
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Toggle override
        document.getElementById('enableOverride').addEventListener('change', (e) => {
            this.toggleOverride(e.target.checked);
        });

        // Input changes
        ['latitude', 'longitude', 'accuracy', 'heading', 'speed', 'altitude', 'altitudeAccuracy'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.validateInputs();
            });
        });

        // Preset management
        this.bindPresetEvents();

        // Advanced options
        this.bindAdvancedOptionsEvents();

        // Action buttons
        document.getElementById('applyBtn').addEventListener('click', () => {
            this.applyOverride();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearOverride();
        });
    }

    bindPresetEvents() {
        // Save preset button
        document.getElementById('savePresetBtn').addEventListener('click', () => {
            this.saveCurrentAsPreset();
        });

        // Cancel preset button
        document.getElementById('cancelPresetBtn').addEventListener('click', () => {
            this.hidePresetControls();
        });

        // Clear all presets link
        document.getElementById('clearPresetsLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.clearAllPresets();
        });

        // Preset name input - enable/disable save button based on content
        document.getElementById('presetName').addEventListener('input', (e) => {
            const saveBtn = document.getElementById('savePresetBtn');
            saveBtn.disabled = !e.target.value.trim();
        });

        // Enable save button when Enter is pressed in preset name input
        document.getElementById('presetName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                this.saveCurrentAsPreset();
            } else if (e.key === 'Escape') {
                this.hidePresetControls();
            }
        });
    }

    bindAdvancedOptionsEvents() {
        const advancedOptions = document.getElementById('advancedOptions');
        
        // Save the state when toggled
        advancedOptions.addEventListener('toggle', () => {
            this.saveAdvancedOptionsState(advancedOptions.open);
        });
    }

    async loadAdvancedOptionsState() {
        try {
            const result = await chrome.storage.local.get(['advancedOptionsOpen']);
            const isOpen = result.advancedOptionsOpen;
            
            if (isOpen !== undefined) {
                const advancedOptions = document.getElementById('advancedOptions');
                advancedOptions.open = isOpen;
            }
        } catch (error) {
            console.error('Failed to load advanced options state:', error);
        }
    }

    async saveAdvancedOptionsState(isOpen) {
        try {
            await chrome.storage.local.set({ advancedOptionsOpen: isOpen });
        } catch (error) {
            console.error('Failed to save advanced options state:', error);
        }
    }

    async loadPresets() {
        try {
            const result = await chrome.storage.local.get(['userPresets']);
            const presets = result.userPresets || [];
            this.displayPresets(presets);
        } catch (error) {
            console.error('Failed to load presets:', error);
        }
    }

    displayPresets(presets) {
        const container = document.getElementById('presetButtons');
        container.innerHTML = '';

        // Add existing presets
        presets.forEach((preset, index) => {
            const button = document.createElement('button');
            button.className = 'preset-btn';
            button.innerHTML = `
                📍 ${preset.name}
                <span class="delete-preset">✕</span>
            `;
            
            // Load preset on button click (but not on delete button)
            button.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-preset')) {
                    this.loadPreset(preset);
                }
            });

            // Delete preset on X click
            button.querySelector('.delete-preset').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deletePreset(index);
            });

            container.appendChild(button);
        });

        // Add "Add preset" button
        const addButton = document.createElement('button');
        addButton.className = 'preset-btn add-preset';
        addButton.innerHTML = '+ Add preset';
        addButton.addEventListener('click', () => {
            this.showPresetControls();
        });
        container.appendChild(addButton);
    }

    loadPreset(preset) {
        document.getElementById('latitude').value = preset.latitude;
        document.getElementById('longitude').value = preset.longitude;
        document.getElementById('accuracy').value = preset.accuracy;
        document.getElementById('heading').value = preset.heading || '';
        document.getElementById('speed').value = preset.speed || '';
        document.getElementById('altitude').value = preset.altitude || '';
        document.getElementById('altitudeAccuracy').value = preset.altitudeAccuracy || '';

        this.validateInputs();
        this.showStatus(`Preset "${preset.name}" loaded`, 'info');
    }

    showPresetControls() {
        const presetManagement = document.getElementById('presetManagement');
        const presetNameInput = document.getElementById('presetName');
        const saveBtn = document.getElementById('savePresetBtn');
        
        presetManagement.style.display = 'block';
        presetNameInput.value = '';
        presetNameInput.focus();
        saveBtn.disabled = true;
    }

    hidePresetControls() {
        const presetManagement = document.getElementById('presetManagement');
        const presetNameInput = document.getElementById('presetName');
        const saveBtn = document.getElementById('savePresetBtn');
        
        presetManagement.style.display = 'none';
        presetNameInput.value = '';
        saveBtn.disabled = true;
    }

    async saveCurrentAsPreset() {
        const presetName = document.getElementById('presetName').value.trim();
        if (!presetName) {
            this.showStatus('Please enter a preset name', 'error');
            return;
        }

        if (!this.validateInputs()) {
            this.showStatus('Please fix validation errors before saving preset', 'error');
            return;
        }

        const preset = {
            name: presetName,
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value),
            accuracy: parseInt(document.getElementById('accuracy').value),
            heading: parseFloat(document.getElementById('heading').value) || null,
            speed: parseFloat(document.getElementById('speed').value) || null,
            altitude: parseFloat(document.getElementById('altitude').value) || null,
            altitudeAccuracy: parseFloat(document.getElementById('altitudeAccuracy').value) || null,
            createdAt: new Date().toISOString()
        };

        try {
            const result = await chrome.storage.local.get(['userPresets']);
            const presets = result.userPresets || [];
            
            // Check for duplicate names
            const existingIndex = presets.findIndex(p => p.name === presetName);
            if (existingIndex !== -1) {
                if (!confirm(`A preset named "${presetName}" already exists. Replace it?`)) {
                    return;
                }
                presets[existingIndex] = preset;
            } else {
                presets.push(preset);
            }

            await chrome.storage.local.set({ userPresets: presets });
            
            // Hide controls and reload presets
            this.hidePresetControls();
            
            this.displayPresets(presets);
            this.showStatus(`Preset "${presetName}" saved successfully!`, 'success');
            
        } catch (error) {
            console.error('Failed to save preset:', error);
            this.showStatus('Failed to save preset', 'error');
        }
    }

    async deletePreset(index) {
        try {
            const result = await chrome.storage.local.get(['userPresets']);
            const presets = result.userPresets || [];
            
            if (index >= 0 && index < presets.length) {
                const presetName = presets[index].name;
                
                if (confirm(`Delete preset "${presetName}"?`)) {
                    presets.splice(index, 1);
                    await chrome.storage.local.set({ userPresets: presets });
                    
                    this.displayPresets(presets);
                    this.showStatus(`Preset "${presetName}" deleted`, 'info');
                }
            }
        } catch (error) {
            console.error('Failed to delete preset:', error);
            this.showStatus('Failed to delete preset', 'error');
        }
    }

    async clearAllPresets() {
        if (confirm('Delete all saved presets? This cannot be undone.')) {
            try {
                await chrome.storage.local.set({ userPresets: [] });
                this.displayPresets([]);
                this.showStatus('All presets cleared', 'info');
            } catch (error) {
                console.error('Failed to clear presets:', error);
                this.showStatus('Failed to clear presets', 'error');
            }
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
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
                document.getElementById('heading').value = settings.heading || null;
                document.getElementById('speed').value = settings.speed || null;
                document.getElementById('altitude').value = settings.altitude || null;
                document.getElementById('altitudeAccuracy').value = settings.altitudeAccuracy || null;

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
            accuracy: parseInt(document.getElementById('accuracy').value) || 10,
            heading: parseFloat(document.getElementById('heading').value) || null,
            speed: parseFloat(document.getElementById('speed').value) || null,
            altitude: parseFloat(document.getElementById('altitude').value) || null,
            altitudeAccuracy: parseFloat(document.getElementById('altitudeAccuracy').value) || null
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
        const heading = parseFloat(document.getElementById('heading').value) || null;
        const speed = parseFloat(document.getElementById('speed').value) || null;
        const altitude = parseFloat(document.getElementById('altitude').value) || null;
        const altitudeAccuracy = parseFloat(document.getElementById('altitudeAccuracy').value) || null;

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
            errors.push('Accuracy must be at least 1 metre');
            isValid = false;
        }
        if (heading !== null && (isNaN(heading) || heading < 0 || heading > 360)) {
            errors.push('Heading must be between 0 and 360 degrees, or not set');
            isValid = false;
        }
        if (speed !== null && (isNaN(speed) || speed < 0)) {
            errors.push('Speed must be a non-negative number, or not set');
            isValid = false;
        }
        if (altitude !== null && (isNaN(altitude))) {
            errors.push('Altitude must be a number, or not set');
            isValid = false;
        }
        if (altitudeAccuracy !== null && (isNaN(altitudeAccuracy) || altitudeAccuracy < 0)) {
            errors.push('Altitude Accuracy must be a non-negative number, or not set');
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
            accuracy: parseInt(document.getElementById('accuracy').value),
            heading: parseFloat(document.getElementById('heading').value) || null,
            speed: parseFloat(document.getElementById('speed').value) || null,
            altitude: parseFloat(document.getElementById('altitude').value) || null,
            altitudeAccuracy: parseFloat(document.getElementById('altitudeAccuracy').value) || null
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
            const heading = document.getElementById('heading').value || 'N/A';
            const speed = document.getElementById('speed').value || 'N/A';
            const altitude = document.getElementById('altitude').value || 'N/A';
            const altitudeAccuracy = document.getElementById('altitudeAccuracy').value || 'N/A';

            currentLocationDiv.innerHTML = `
                <p><strong>Override Active:</strong></p>
                <p>Latitude: ${lat}°</p>
                <p>Longitude: ${lng}°</p>
                <p>Accuracy: ${acc} metres</p>
                <p>Heading: ${heading}°</p>
                <p>Speed: ${speed} m/s</p>
                <p>Altitude: ${altitude} m</p>
                <p>Altitude Accuracy: ${altitudeAccuracy} m</p>
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

// Route Simulation Class
class RouteSimulation {
    constructor(tabId) {
        this.tabId = tabId;
        this.routeData = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentIndex = 0;
        this.intervalId = null;
        this.startTime = null;
        this.pausedTime = 0;
        this.bindRouteEvents();
        this.loadRouteAdvancedOptionsState();
    }

    bindRouteEvents() {
        // File upload
        document.getElementById('routeFile').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Route controls
        document.getElementById('startRouteBtn').addEventListener('click', () => {
            this.startRoute();
        });

        document.getElementById('pauseRouteBtn').addEventListener('click', () => {
            this.pauseRoute();
        });

        document.getElementById('stopRouteBtn').addEventListener('click', () => {
            this.stopRoute();
        });

        // Randomize accuracy toggle
        document.getElementById('randomizeAccuracy').addEventListener('change', (e) => {
            this.toggleAccuracyRange(e.target.checked);
        });

        // Randomize speed toggle
        document.getElementById('randomizeSpeed').addEventListener('change', (e) => {
            this.toggleSpeedRange(e.target.checked);
        });

        // Randomize altitude toggle
        document.getElementById('randomizeAltitude').addEventListener('change', (e) => {
            this.toggleAltitudeRange(e.target.checked);
        });

        // Randomize altitude accuracy toggle
        document.getElementById('randomizeAltitudeAccuracy').addEventListener('change', (e) => {
            this.toggleAltitudeAccuracyRange(e.target.checked);
        });

        // Calculate bearing toggle
        document.getElementById('calculateBearing').addEventListener('change', (e) => {
            this.toggleBearingMode(e.target.checked);
        });

        // Route advanced options
        const routeAdvancedOptions = document.getElementById('routeAdvancedOptions');
        if (routeAdvancedOptions) {
            routeAdvancedOptions.addEventListener('toggle', () => {
                this.saveRouteAdvancedOptionsState(routeAdvancedOptions.open);
            });
        }
    }

    toggleAccuracyRange(show) {
        const rangeElement = document.getElementById('accuracyRange');
        if (show) {
            rangeElement.style.display = 'block';
        } else {
            rangeElement.style.display = 'none';
        }
    }

    toggleSpeedRange(show) {
        const rangeElement = document.getElementById('speedRange');
        if (show) {
            rangeElement.style.display = 'block';
        } else {
            rangeElement.style.display = 'none';
        }
    }

    toggleAltitudeRange(show) {
        const rangeElement = document.getElementById('altitudeRange');
        if (show) {
            rangeElement.style.display = 'block';
        } else {
            rangeElement.style.display = 'none';
        }
    }

    toggleAltitudeAccuracyRange(show) {
        const rangeElement = document.getElementById('altitudeAccuracyRange');
        if (show) {
            rangeElement.style.display = 'block';
        } else {
            rangeElement.style.display = 'none';
        }
    }

    toggleBearingMode(calculateMode) {
        const headingInput = document.getElementById('routeHeading');
        const headingLabel = headingInput.parentElement.querySelector('label');
        
        if (calculateMode) {
            headingInput.disabled = true;
            headingInput.placeholder = 'Auto-calculated from route';
            if (headingLabel) {
                headingLabel.textContent = 'Heading (auto-calculated):';
            }
        } else {
            headingInput.disabled = false;
            headingInput.placeholder = '';
            if (headingLabel) {
                headingLabel.textContent = 'Heading (degrees):';
            }
        }
    }

    getAccuracy() {
        const randomizeAccuracy = document.getElementById('randomizeAccuracy').checked;
        
        if (randomizeAccuracy) {
            const minAccuracy = parseInt(document.getElementById('minAccuracy').value) || 5;
            const maxAccuracy = parseInt(document.getElementById('maxAccuracy').value) || 20;
            
            // Ensure min is not greater than max
            const min = Math.min(minAccuracy, maxAccuracy);
            const max = Math.max(minAccuracy, maxAccuracy);
            
            // Generate random accuracy between min and max (inclusive)
            return Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
            return parseInt(document.getElementById('defaultAccuracy').value) || 10;
        }
    }

    getSpeed() {
        const randomizeSpeed = document.getElementById('randomizeSpeed').checked;
        
        if (randomizeSpeed) {
            const minSpeed = parseFloat(document.getElementById('minSpeed').value) || 1.0;
            const maxSpeed = parseFloat(document.getElementById('maxSpeed').value) || 5.0;
            
            // Ensure min is not greater than max
            const min = Math.min(minSpeed, maxSpeed);
            const max = Math.max(minSpeed, maxSpeed);
            
            // Generate random speed between min and max, rounded to nearest integer
            return Math.round(Math.random() * (max - min) + min);
        } else {
            const routeSpeed = parseFloat(document.getElementById('routeSpeed').value);
            return routeSpeed || null;
        }
    }

    getAltitude() {
        const randomizeAltitude = document.getElementById('randomizeAltitude').checked;
        
        if (randomizeAltitude) {
            const minAltitude = parseFloat(document.getElementById('minAltitude').value) || 50;
            const maxAltitude = parseFloat(document.getElementById('maxAltitude').value) || 150;
            
            // Ensure min is not greater than max
            const min = Math.min(minAltitude, maxAltitude);
            const max = Math.max(minAltitude, maxAltitude);
            
            // Generate random altitude between min and max, rounded to nearest integer
            return Math.round(Math.random() * (max - min) + min);
        } else {
            const routeAltitude = parseFloat(document.getElementById('routeAltitude').value);
            return routeAltitude || null;
        }
    }

    getAltitudeAccuracy() {
        const randomizeAltitudeAccuracy = document.getElementById('randomizeAltitudeAccuracy').checked;
        
        if (randomizeAltitudeAccuracy) {
            const minAltitudeAccuracy = parseFloat(document.getElementById('minAltitudeAccuracy').value) || 5;
            const maxAltitudeAccuracy = parseFloat(document.getElementById('maxAltitudeAccuracy').value) || 25;
            
            // Ensure min is not greater than max
            const min = Math.min(minAltitudeAccuracy, maxAltitudeAccuracy);
            const max = Math.max(minAltitudeAccuracy, maxAltitudeAccuracy);
            
            // Generate random altitude accuracy between min and max, rounded to nearest integer
            return Math.round(Math.random() * (max - min) + min);
        } else {
            const routeAltitudeAccuracy = parseFloat(document.getElementById('routeAltitudeAccuracy').value);
            return routeAltitudeAccuracy || null;
        }
    }

    /**
     * Calculate the bearing (heading) from one coordinate to another using the haversine formula
     * @param {number} lat1 - Latitude of the first point in degrees
     * @param {number} lng1 - Longitude of the first point in degrees
     * @param {number} lat2 - Latitude of the second point in degrees
     * @param {number} lng2 - Longitude of the second point in degrees
     * @returns {number} - Bearing in degrees (0-360), where 0 is North
     */
    calculateBearing(lat1, lng1, lat2, lng2) {
        // Convert degrees to radians
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        // Calculate bearing using haversine formula
        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

        // Convert to degrees and normalize to 0-360
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        bearing = (bearing + 360) % 360;

        return Math.round(bearing);
    }

    getBearing(currentIndex = null) {
        const calculateBearing = document.getElementById('calculateBearing').checked;
        
        if (calculateBearing && this.routeData && currentIndex !== null) {
            // Calculate bearing to next point
            const nextIndex = currentIndex + 1;
            if (nextIndex < this.routeData.length) {
                const currentPoint = this.routeData[currentIndex];
                const nextPoint = this.routeData[nextIndex];
                
                return this.calculateBearing(
                    currentPoint.lat, 
                    currentPoint.lng, 
                    nextPoint.lat, 
                    nextPoint.lng
                );
            } else {
                // For the last point, return the same bearing as the previous segment
                if (currentIndex > 0) {
                    const prevPoint = this.routeData[currentIndex - 1];
                    const currentPoint = this.routeData[currentIndex];
                    
                    return this.calculateBearing(
                        prevPoint.lat, 
                        prevPoint.lng, 
                        currentPoint.lat, 
                        currentPoint.lng
                    );
                }
                // If only one point, return null
                return null;
            }
        } else {
            const routeHeading = parseFloat(document.getElementById('routeHeading').value);
            return routeHeading || null;
        }
    }

    async loadRouteAdvancedOptionsState() {
        try {
            const result = await chrome.storage.local.get(['routeAdvancedOptionsOpen']);
            const isOpen = result.routeAdvancedOptionsOpen;
            
            if (isOpen !== undefined) {
                const routeAdvancedOptions = document.getElementById('routeAdvancedOptions');
                if (routeAdvancedOptions) {
                    routeAdvancedOptions.open = isOpen;
                }
            }
        } catch (error) {
            console.error('Failed to load route advanced options state:', error);
        }
    }

    async saveRouteAdvancedOptionsState(isOpen) {
        try {
            await chrome.storage.local.set({ routeAdvancedOptionsOpen: isOpen });
        } catch (error) {
            console.error('Failed to save route advanced options state:', error);
        }
    }

    getRouteAdvancedOptions(currentIndex = null) {
        return {
            heading: this.getBearing(currentIndex),
            speed: this.getSpeed(),
            altitude: this.getAltitude(),
            altitudeAccuracy: this.getAltitudeAccuracy()
        };
    }

    async handleFileUpload(file) {
        if (!file) return;

        try {
            const text = await this.readFileAsText(file);
            const extension = file.name.split('.').pop().toLowerCase();
            
            let routeData;
            switch (extension) {
                case 'kml':
                    routeData = this.parseKML(text);
                    break;
                case 'geojson':
                case 'json':
                    routeData = this.parseGeoJSON(text);
                    break;
                case 'gpx':
                    routeData = this.parseGPX(text);
                    break;
                default:
                    throw new Error('Unsupported file format');
            }

            if (!routeData || routeData.length === 0) {
                throw new Error('No valid coordinates found in file');
            }

            this.routeData = routeData;
            await this.displayFileInfo(file.name, routeData.length);

        } catch (error) {
            console.error('File parsing error:', error);
            this.showRouteStatus(`Error loading file: ${error.message}`, 'error');
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    parseKML(text) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'application/xml');
        const coordinates = [];

        // Look for LineString coordinates
        const lineStrings = doc.querySelectorAll('LineString coordinates');
        lineStrings.forEach(coordElement => {
            const coordText = coordElement.textContent.trim();
            const points = coordText.split(/\s+/);
            
            points.forEach(point => {
                const parts = point.split(',');
                if (parts.length >= 2) {
                    const lng = parseFloat(parts[0]);
                    const lat = parseFloat(parts[1]);
                    const alt = parts[2] ? parseFloat(parts[2]) : null;
                    
                    if (!isNaN(lat) && !isNaN(lng)) {
                        coordinates.push({ lat, lng, altitude: alt });
                    }
                }
            });
        });

        // Also look for individual Placemark points
        const placemarks = doc.querySelectorAll('Placemark Point coordinates');
        placemarks.forEach(coordElement => {
            const coordText = coordElement.textContent.trim();
            const parts = coordText.split(',');
            if (parts.length >= 2) {
                const lng = parseFloat(parts[0]);
                const lat = parseFloat(parts[1]);
                const alt = parts[2] ? parseFloat(parts[2]) : null;
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    coordinates.push({ lat, lng, altitude: alt });
                }
            }
        });

        return coordinates;
    }

    parseGeoJSON(text) {
        const data = JSON.parse(text);
        const coordinates = [];

        const extractCoordinates = (feature) => {
            const geometry = feature.geometry || feature;
            
            if (geometry.type === 'LineString') {
                geometry.coordinates.forEach(coord => {
                    const [lng, lat, alt] = coord;
                    if (!isNaN(lat) && !isNaN(lng)) {
                        coordinates.push({ 
                            lat, 
                            lng, 
                            altitude: alt || null,
                            timestamp: feature.properties?.time || null
                        });
                    }
                });
            } else if (geometry.type === 'Point') {
                const [lng, lat, alt] = geometry.coordinates;
                if (!isNaN(lat) && !isNaN(lng)) {
                    coordinates.push({ 
                        lat, 
                        lng, 
                        altitude: alt || null,
                        timestamp: feature.properties?.time || null
                    });
                }
            } else if (geometry.type === 'MultiLineString') {
                geometry.coordinates.forEach(line => {
                    line.forEach(coord => {
                        const [lng, lat, alt] = coord;
                        if (!isNaN(lat) && !isNaN(lng)) {
                            coordinates.push({ 
                                lat, 
                                lng, 
                                altitude: alt || null
                            });
                        }
                    });
                });
            }
        };

        if (data.type === 'FeatureCollection') {
            data.features.forEach(extractCoordinates);
        } else if (data.type === 'Feature') {
            extractCoordinates(data);
        } else if (data.geometry) {
            extractCoordinates(data);
        }

        return coordinates;
    }

    parseGPX(text) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'application/xml');
        const coordinates = [];

        // Look for track points
        const trackPoints = doc.querySelectorAll('trkpt');
        trackPoints.forEach(trkpt => {
            const lat = parseFloat(trkpt.getAttribute('lat'));
            const lng = parseFloat(trkpt.getAttribute('lon'));
            
            if (!isNaN(lat) && !isNaN(lng)) {
                const eleElement = trkpt.querySelector('ele');
                const timeElement = trkpt.querySelector('time');
                
                coordinates.push({
                    lat,
                    lng,
                    altitude: eleElement ? parseFloat(eleElement.textContent) : null,
                    timestamp: timeElement ? timeElement.textContent : null
                });
            }
        });

        // Also look for waypoints if no track points
        if (coordinates.length === 0) {
            const waypoints = doc.querySelectorAll('wpt');
            waypoints.forEach(wpt => {
                const lat = parseFloat(wpt.getAttribute('lat'));
                const lng = parseFloat(wpt.getAttribute('lon'));
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    const eleElement = wpt.querySelector('ele');
                    const timeElement = wpt.querySelector('time');
                    
                    coordinates.push({
                        lat,
                        lng,
                        altitude: eleElement ? parseFloat(eleElement.textContent) : null,
                        timestamp: timeElement ? timeElement.textContent : null
                    });
                }
            });
        }

        return coordinates;
    }

    async displayFileInfo(fileName, pointCount) {
        document.getElementById('fileName').textContent = fileName;
        document.getElementById('pointCount').textContent = pointCount;
        
        // Calculate estimated duration
        const defaultInterval = parseFloat(document.getElementById('defaultInterval').value);
        const estimatedDuration = Math.round(pointCount * defaultInterval);
        document.getElementById('routeDuration').textContent = `~${estimatedDuration}s`;
        
        document.getElementById('fileInfo').style.display = 'block';
        document.getElementById('routeSettings').style.display = 'block';
        
        // Immediately apply the first route point as override
        await this.applyInitialRouteOverride();
    }

    async applyInitialRouteOverride() {
        if (!this.routeData || this.routeData.length === 0) return;
        
        try {
            const firstPoint = this.routeData[0];
            const accuracy = this.getAccuracy();
            const advancedOptions = this.getRouteAdvancedOptions(0); // Pass index 0 for first point
            
            const locationData = {
                enabled: true,
                latitude: firstPoint.lat,
                longitude: firstPoint.lng,
                accuracy: accuracy,
                altitude: advancedOptions.altitude !== null ? advancedOptions.altitude : firstPoint.altitude,
                altitudeAccuracy: advancedOptions.altitudeAccuracy !== null ? advancedOptions.altitudeAccuracy : (firstPoint.altitude ? accuracy : null),
                heading: advancedOptions.heading,
                speed: advancedOptions.speed
            };

            await chrome.tabs.sendMessage(this.tabId, {
                action: 'setLocationOverride',
                data: locationData
            });

            // Show initial position in UI
            this.updateCurrentPoint(firstPoint, 0);
            this.updateProgress(0); // Start at 0% since simulation hasn't started
            
            // Show progress section but don't enable buttons yet
            document.getElementById('routeProgress').style.display = 'block';
            
            this.showRouteStatus('✅ Route loaded! Location set to starting point. You can now start watching position.', 'success');
            
        } catch (error) {
            console.error('Failed to apply initial route override:', error);
            this.showRouteStatus('Route loaded but could not apply override. Try refreshing the page.', 'error');
        }
    }

    async startRoute() {
        if (!this.routeData || this.routeData.length === 0) {
            this.showRouteStatus('Please upload a route file first', 'error');
            return;
        }

        if (this.isPlaying && !this.isPaused) {
            this.showRouteStatus('Route is already playing', 'info');
            return;
        }

        this.isPlaying = true;
        this.isPaused = false;
        
        if (this.currentIndex === 0) {
            this.startTime = Date.now();
            this.pausedTime = 0;
            // Start from the first point since we want to simulate the entire route
            this.currentIndex = 0;
        } else {
            // Resuming from pause
            this.startTime += (Date.now() - this.pausedTime);
        }

        document.getElementById('startRouteBtn').disabled = true;
        document.getElementById('pauseRouteBtn').disabled = false;
        document.getElementById('stopRouteBtn').disabled = false;

        this.showRouteStatus('🎬 Route simulation started', 'success');
        
        // Start simulation immediately
        this.simulateRoute();
    }

    pauseRoute() {
        if (!this.isPlaying || this.isPaused) return;

        this.isPaused = true;
        this.pausedTime = Date.now();
        
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }

        document.getElementById('startRouteBtn').disabled = false;
        document.getElementById('pauseRouteBtn').disabled = true;
        
        this.showRouteStatus('Route simulation paused', 'info');
    }

    stopRoute() {
        this.isPlaying = false;
        this.isPaused = false;
        this.currentIndex = 0;
        
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }

        document.getElementById('startRouteBtn').disabled = false;
        document.getElementById('pauseRouteBtn').disabled = true;
        document.getElementById('stopRouteBtn').disabled = true;
        
        // Reset to starting position
        if (this.routeData && this.routeData.length > 0) {
            this.updateCurrentPoint(this.routeData[0], 0);
            this.updateProgress(0);
            this.showRouteStatus('🔄 Route stopped. Position reset to start.', 'info');
            
            // Reapply the initial override to return to starting position
            this.applyInitialRouteOverride();
        } else {
            this.updateProgress(0);
            this.showRouteStatus('Route simulation stopped', 'info');
            
            // Clear any active override if no route data
            try {
                chrome.tabs.sendMessage(this.tabId, {
                    action: 'clearLocationOverride'
                });
            } catch (error) {
                console.error('Failed to clear override:', error);
            }
        }
    }

    completeRoute() {
        // Similar to stopRoute but stays at final position instead of returning to start
        this.isPlaying = false;
        this.isPaused = false;
        this.currentIndex = 0; // Reset for next run
        
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }

        document.getElementById('startRouteBtn').disabled = false;
        document.getElementById('pauseRouteBtn').disabled = true;
        document.getElementById('stopRouteBtn').disabled = true;
        
        // Stay at final position (don't reset progress or location)
        this.showRouteStatus('🏁 Route completed! Staying at final destination.', 'success');
        
        // Note: We intentionally don't reset to starting position or clear override
        // The user stays at the final destination point
    }

    async simulateRoute() {
        if (!this.isPlaying || this.isPaused || this.currentIndex >= this.routeData.length) {
            if (this.currentIndex >= this.routeData.length) {
                this.showRouteStatus('🏁 Route simulation completed!', 'success');
                this.completeRoute();
            }
            return;
        }

        const point = this.routeData[this.currentIndex];
        const playbackSpeed = parseFloat(document.getElementById('playbackSpeed').value);
        const defaultInterval = parseFloat(document.getElementById('defaultInterval').value) * 1000; // Convert to ms
        const accuracy = this.getAccuracy();
        const advancedOptions = this.getRouteAdvancedOptions(this.currentIndex); // Pass current index

        // Create location override data
        const locationData = {
            enabled: true,
            latitude: point.lat,
            longitude: point.lng,
            accuracy: accuracy,
            altitude: advancedOptions.altitude !== null ? advancedOptions.altitude : point.altitude,
            altitudeAccuracy: advancedOptions.altitudeAccuracy !== null ? advancedOptions.altitudeAccuracy : (point.altitude ? accuracy : null),
            heading: advancedOptions.heading,
            speed: advancedOptions.speed
        };

        try {
            // Apply the location override
            await chrome.tabs.sendMessage(this.tabId, {
                action: 'setLocationOverride',
                data: locationData
            });

            // Update UI
            this.updateCurrentPoint(point, this.currentIndex);
            this.updateProgress((this.currentIndex + 1) / this.routeData.length * 100);

            this.currentIndex++;

            // Calculate next interval
            let nextInterval = defaultInterval / playbackSpeed;
            
            // If we have timestamps, try to use them
            if (point.timestamp && this.currentIndex < this.routeData.length) {
                const nextPoint = this.routeData[this.currentIndex];
                if (nextPoint.timestamp) {
                    const currentTime = new Date(point.timestamp).getTime();
                    const nextTime = new Date(nextPoint.timestamp).getTime();
                    const realInterval = nextTime - currentTime;
                    
                    if (realInterval > 0 && realInterval < 60000) { // Max 1 minute between points
                        nextInterval = realInterval / playbackSpeed;
                    }
                }
            }

            // Schedule next point
            this.intervalId = setTimeout(() => {
                this.simulateRoute();
            }, Math.max(100, nextInterval)); // Minimum 100ms interval

        } catch (error) {
            console.error('Failed to apply location override:', error);
            this.showRouteStatus('Error applying location override', 'error');
        }
    }

    updateCurrentPoint(point, index) {
        document.getElementById('currentLat').textContent = point.lat.toFixed(6);
        document.getElementById('currentLng').textContent = point.lng.toFixed(6);
        document.getElementById('currentStep').textContent = index + 1;
        document.getElementById('totalSteps').textContent = this.routeData.length;
        document.getElementById('currentTime').textContent = point.timestamp || 'N/A';
    }

    updateProgress(percentage) {
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressText').textContent = `${Math.round(percentage)}%`;
    }

    showRouteStatus(message, type = 'info') {
        const statusDiv = document.getElementById('routeStatus');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        
        // Auto-hide after 3 seconds for non-error messages
        // if (type !== 'error') {
        //     setTimeout(() => {
        //         statusDiv.textContent = '';
        //         statusDiv.className = 'status';
        //     }, 3000);
        // }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LocationOverridePanel();
});
