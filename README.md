# DevTools Location Override Extension

A modern Chrome/Edge DevTools extension that allows developers to override `window.geolocation` values for local development and testing of location-aware applications.

## Features

🌍 **Easy Location Override**: Override latitude, longitude, and accuracy with a simple interface
🎯 **Quick Presets**: Pre-configured locations for major cities (San Francisco, New York, London, Tokyo, Sydney)
🔄 **Persistent Settings**: Settings persist across page reloads and browser sessions
🛠️ **DevTools Integration**: Seamlessly integrated into Chrome/Edge Developer Tools
🎨 **Modern UI**: Clean, intuitive interface with responsive design
📱 **Real-time Updates**: Changes take effect immediately on new geolocation requests

## Installation

### For Development

1. Clone or download this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension will appear in your DevTools panels

### For Production

This extension can be packaged and distributed through the Chrome Web Store or Edge Add-ons store.

## Usage

1. **Open DevTools**: Press F12 or right-click → "Inspect Element"
2. **Find the Panel**: Look for the "Location Override" tab in DevTools
3. **Enable Override**: Toggle the "Enable Location Override" switch
4. **Set Coordinates**: 
   - Enter custom latitude/longitude values, or
   - Use one of the preset city locations
5. **Apply Changes**: Click "Apply Override"
6. **Test Your App**: Your web application will now receive the overridden location

### API Compatibility

The extension overrides both geolocation APIs:
- `navigator.geolocation.getCurrentPosition()`
- `navigator.geolocation.watchPosition()`

## Technical Details

### Architecture

- **Manifest V3**: Uses the latest Chrome extension format
- **Content Scripts**: Inject override logic into web pages
- **DevTools Panel**: Custom panel for configuration
- **Service Worker**: Background script for persistence
- **Storage API**: Maintains settings across sessions

### Files Structure

```
├── manifest.json          # Extension manifest
├── devtools.html          # DevTools entry point
├── devtools.js           # DevTools panel registration
├── panel.html            # Main UI panel
├── panel.css             # Panel styling
├── panel.js              # Panel logic and controls
├── background.js         # Service worker
├── content.js            # Content script bridge
├── inject.js             # Page-world geolocation override
└── icons/                # Extension icons
```

### Security

- Uses `web_accessible_resources` for secure script injection
- Minimal permissions (only `activeTab`, `scripting`, `storage`)
- Content Security Policy compliant
- No external dependencies

## Development

### Building

No build process required - this is a pure JavaScript extension.

### Testing

1. Load the extension in developer mode
2. Open any website that uses geolocation
3. Test with both `getCurrentPosition()` and `watchPosition()`
4. Verify override persistence across page reloads

### Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Any Chromium-based browser

## Common Use Cases

- **Local Development**: Test location-based features without GPS
- **Debugging**: Simulate different geographical locations
- **QA Testing**: Verify app behavior across various coordinates
- **Demo Preparation**: Set consistent location for presentations

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.0.0
- Initial release
- Basic location override functionality
- DevTools panel integration
- Preset city locations
- Persistent settings
