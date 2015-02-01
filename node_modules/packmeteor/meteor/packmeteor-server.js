var crypto = Npm.require('crypto');
var fs = Npm.require('fs');
var path = Npm.require('path');


var beforeFiles = [];
var afterFiles = [];

Packmeteor = {
  config: function(options) {

  },
  addFile: function(url, before) {
    if (before) {
      beforeFiles.push(url);
    } else {
      afterFiles.push(url);
    }
  }
};

WebApp.connectHandlers.use(function(req, res, next) {
  if (req.url !== '/packmeteor.manifest') {
    return next();
  }

  var manifest = '#PACKMETEOR\n';

  manifest += '/' + '\n';

  _.each(WebApp.clientPrograms['web.browser'].manifest, function (resource) {
    if (resource.where === 'client') {

      var url = resource.url.split('?')[0];
      manifest += url + '\n';
    }
  });

  manifest += '#BEFORE\n';

  _.each(beforeFiles, function (url) {
    manifest += url + '\n';
  });  

  manifest += '#AFTER\n';

  _.each(afterFiles, function (url) {
    manifest += url + '\n';
  });

  // content length needs to be based on bytes
  var body = new Buffer(manifest);

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  return res.end(body);
});
