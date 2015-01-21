Package.describe({
  name: 'frozeman:loading-screen',
  summary: 'Shows a loading screen before all JavaScript files of your app will be loaded',
  version: '0.0.1',
  git: 'https://github.com/frozeman/meteor-initial-loader'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.1');

  api.use('meteorhacks:inject-initial@1.0.2', 'server');

  api.addFiles('remove-injection.js', 'client');
  api.addFiles('injection-code.js', 'server');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('frozeman:loading-screen');
  api.addFiles('loading-screen-tests.js');
});
