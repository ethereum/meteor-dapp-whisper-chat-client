Packmeteor = {
  chrome: {},
  cordova: {}
};

// Cordova device ready dependency
var deviceReady = false;
var deviceReadyDeps = new Deps.Dependency();

// Chrome packaged apps
var chromePackagedApp = (typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined');

Packmeteor.chrome.isReady = function() {
  return chromePackagedApp;
};

Packmeteor.cordova.isReady = function() {
  deviceReadyDeps.depend();
  return deviceReady;
};

// Listen to the cordova event
document.addEventListener("deviceready", function() {
  deviceReady = true;
  deviceReadyDeps.changed();
}, false);

// This package will stop Migration
if (typeof Reload !== 'undefined') {
  Reload._onMigrate('Packmeteor', function() {
    // Nope we will not allow reload
    return false;
  });
}