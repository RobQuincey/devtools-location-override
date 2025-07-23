# Quick Start Guide

## Installation Steps

1. **Download the Extension**
   - Clone or download this repository to your local machine
   - Extract if downloaded as ZIP

2. **Load in Browser**
   - Open Chrome or Edge
   - Navigate to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `devtools-location-override` folder

3. **Verify Installation**
   - You should see the extension in your extensions list
   - The extension will be active for all websites

## Using the Extension

### Basic Usage

1. **Open a Website**
   - Navigate to any website that uses geolocation
   - Or open the included `test-page.html` file

2. **Open DevTools**
   - Press `F12` or right-click → "Inspect"
   - Look for the "Location Override" tab

3. **Configure Location**
   - Toggle "Enable Location Override"
   - Set your desired coordinates:
     - Latitude: -90 to 90
     - Longitude: -180 to 180  
     - Accuracy: minimum 1 meter
   - Or use one of the preset city locations

4. **Apply Override**
   - Click "Apply Override"
   - Refresh the page if needed
   - Test geolocation in your app

### Testing with Included Test Page

1. Open `test-page.html` in your browser
2. Open DevTools and go to "Location Override" panel
3. Set a location (e.g., San Francisco preset)
4. Click "Apply Override"
5. Back on the test page, click "Get Current Position"
6. Verify the overridden coordinates appear

## Preset Locations

The extension includes these preset locations:

- 📍 **San Francisco**: 37.7749, -122.4194
- 🗽 **New York**: 40.7128, -74.0060
- 🏰 **London**: 51.5074, -0.1278
- 🗾 **Tokyo**: 35.6762, 139.6503
- 🇦🇺 **Sydney**: -33.8688, 151.2093

## Troubleshooting

### Extension Not Appearing
- Make sure Developer mode is enabled
- Try refreshing the extensions page
- Check that all files are present in the folder

### Location Not Working
- Ensure "Enable Location Override" is checked
- Click "Apply Override" after setting coordinates
- Try refreshing the webpage
- Check browser console for error messages

### DevTools Panel Missing
- Close and reopen DevTools
- Make sure the extension is enabled
- Try on a different website

## Development Notes

- Settings persist across browser sessions
- Works with both `getCurrentPosition()` and `watchPosition()`
- Override takes effect immediately on new geolocation requests
- Original geolocation is restored when override is disabled

## Browser Support

- ✅ Chrome 88+
- ✅ Microsoft Edge 88+
- ✅ Any Chromium-based browser
- ❌ Firefox (different extension format)
- ❌ Safari (different extension format)
