# Privacy Policy for DevTools Location Override

**Last updated: July 31, 2025**

## Overview

DevTools Advanced Location Override is a browser extension designed for developers to test location-based functionality in web applications. We are committed to protecting your privacy and being transparent about our data practices.

## Data Collection and Usage

### What Data We Collect
- **Location Coordinates**: The extension stores location override settings (latitude, longitude, accuracy, etc.) that you manually configure
- **User Presets**: Custom location presets you create are stored locally
- **Route Files**: When you upload KML, GPX, or GeoJSON files, they are processed locally and not transmitted
- **UI Preferences**: Settings like advanced options state are stored locally

### How We Use Your Data
- **Local Storage Only**: All data is stored locally in your browser using Chrome's storage API
- **No Data Transmission**: We do not send any data to external servers
- **Development Testing**: The extension only overrides geolocation for development and testing purposes

### Data Storage
- All data is stored locally on your device using Chrome's `chrome.storage.local` API
- No data is uploaded to any servers or third-party services
- You can clear all stored data by removing the extension

## Permissions Explanation

### Required Permissions
- **activeTab**: Allows the extension to access the current tab to override geolocation
- **scripting**: Enables injection of location override scripts into web pages
- **storage**: Stores your preferences and presets locally
- **host_permissions**: Required to override geolocation on all websites for development testing

### How Permissions Are Used
- **Website Access**: Only used to inject geolocation override functionality for testing
- **No Data Collection**: The extension does not collect or monitor your browsing activity
- **Development Focus**: Permissions are solely for providing geolocation testing capabilities

## Third-Party Services

This extension does not use any third-party services, analytics, or tracking tools.

## Data Security

- All data processing happens locally on your device
- No network requests are made to external servers
- Your location data never leaves your device

## Your Rights

You have full control over your data:
- **View Data**: All stored data can be viewed in the extension interface
- **Delete Data**: You can delete individual presets or clear all data
- **Data Portability**: Data is stored in standard JSON format locally

## Changes to This Policy

We may update this privacy policy from time to time. The updated version will be indicated by an updated "Last updated" date at the top of this policy.

## Contact Information

If you have questions about this privacy policy or our data practices, please contact us at:
- GitHub: https://github.com/RobQuincey/devtools-location-override/issues

## Open Source

This extension is open source. You can review the complete source code at:
https://github.com/RobQuincey/devtools-location-override
