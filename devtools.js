// DevTools entry point
chrome.devtools.panels.create(
  "Location Override",
  "icons/icon-monotone.svg",
  "panel.html",
  function(panel) {
    console.log("Location Override panel created");
  }
);
