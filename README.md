# DevTools Location Override Extension

A modern Chrome/Edge DevTools extension that allows developers to override all `navigator.geolocation` values for local development and testing of location-aware applications.

## Features

- **Advanced Location Override**: Override latitude, longitude, accuracy, heading, speed, altitude and altitude accuracy with a simple interface
- **Route Simulation**: Upload KML, GeoJSON, or GPX files to simulate movement along routes and override or randomize advanced location values
- **Time-based Playback**: Real-time or custom-speed route simulation with timestamp support
- **Persistent Settings**: Settings persist across page reloads and browser sessions

## Installation

### Install from Chrome or Edge Extensions stores
- [Install from Chrome Web store](https://chromewebstore.google.com/detail/devtools-advanced-locatio/pboglnnmnkkbdgflckmjhakpdejmnpli)
- [Install from Edge Add-ons store](https://microsoftedge.microsoft.com/addons/detail/devtools-advanced-locatio/fnancgkkcmppanndodgcafcacohmdfhc)

### For development

1. Clone or download this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension will appear in your DevTools panels

## Usage

### Manual location override

1. **Open DevTools**: Press F12 or right-click → "Inspect Element"
2. **Find the panel**: Look for the "Location Override" tab in DevTools
3. **Select Manual Override tab**: Click on "Manual Override" tab
4. **Enable override**: Toggle the "Enable Location Override" switch
5. **Set coordinates**: Enter custom latitude/longitude values, as well as accuracy, heading, speed, altitude and altitude accuracy 
6. **Apply changes**: Click "Apply Override"
7. **Test your app**: Your web application will now receive the overridden location
8. **Save your override as a preset**: Optionally save your override as a preset that you can recall at any time

### Route Simulation

1. **Open DevTools**: Navigate to the "Location Override" panel
2. **Select Route Simulation tab**: Click on "Route Simulation" tab
3. **Upload route file**: Choose a KML, GeoJSON, or GPX file containing route data
4. **Configure settings**:
   - Set playback speed (0.5x to 10x)
   - Adjust default interval for points without timestamps
   - Set default accuracy, or set it to randomize between two values
5. **Configure advanced settings**:
   - Set heading, or set it to calcuate a heading based on upcoming point
   - Set speed, altitude and altitude accuracy overrides, or randomize them between two values
   - Overrides are optional. Extension will use file provided values if available
6. **Start simulation**: Click "▶️ Start Route" to begin
7. **Control playback**: Use pause/resume and stop controls as needed

#### Supported file formats

- **KML**: Google Earth format with LineString or Point coordinates
- **GeoJSON**: Geographic data with LineString, Point, or MultiLineString features
- **GPX**: GPS Exchange format with track points and waypoints

#### Route file requirements

- Files should contain coordinate sequences (LineString/track points)
- Timestamps are optional but recommended for realistic simulation
- Altitude data is supported when available

## Development

### Testing

1. Load the extension in developer mode
2. Open any website that uses geolocation, or use the included `test-page.html` file
3. Test with both `getCurrentPosition()` and `watchPosition()`

### Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Any Chromium-based browser

## Common Use Cases

- **Local Development**: Test location-based features without GPS
- **Route Testing**: Simulate movement along predefined paths
- **GPS Simulation**: Test navigation apps with realistic route data
- **Debugging**: Simulate different geographical locations
- **QA Testing**: Verify app behavior across various coordinates and routes
- **Demo Preparation**: Set consistent location or route for presentations

## Troubleshooting

### Extension Not Working
- Ensure DevTools is open
- Check that the extension is enabled
- Try refreshing the page after applying override

### Location Not Updating
- Click "Apply Override" after changing coordinates
- Verify "Enable Location Override" is checked
- Some apps cache location - try hard refresh (Ctrl+F5)

### DevTools Panel Missing
- Extension must be loaded and enabled
- Try closing and reopening DevTools
- Check browser compatibility

## Bugs

Please use the [GitHub issue tracker](https://github.com/RobQuincey/devtools-location-override/issues) for all bugs and feature requests. Before creating a new issue, do a quick search to see if the problem has been reported already.

## Contributing

Please see our guide on [contributing](CONTRIBUTING.md) if you're interested in getting involved.

## Licence
Unless stated otherwise, the codebase is released under the MIT License. This covers both the codebase and any sample code in the documentation.

## Like it?
This extension is free forever, and MIT licenced, but if you really like it, you can always [Buy me a coffee](https://buymeacoffee.com/robquincey)
