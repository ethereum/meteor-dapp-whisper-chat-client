// The appcache loader

// HTTP
var http = require('http');

var appcacheManifest = function(host, port, callback) {
  var options = {
    hostname: host,
    port: port,
    path: '/app.manifest',
    headers: {'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.60 Safari/537.17'},
    method: 'GET'
  };

  var req = http.request(options, function(res) {
    var body = '';
    var filelist = [];

    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));
    // res.headers.content-length
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      // Make sure we got the app.manifest
      if (body.length) {
        var lines = body.split('\n');
        // The spec defaults to cache
        var where = 'cache';
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          // Remove comment
          var line = line.split('#')[0];
          // Parse lines
          if (line == '' || line == 'CACHE MANIFEST') {} else
          if (line == 'CACHE:') { where = 'cache'; } else
          if (line == 'FALLBACK:') { where = 'fallback'; } else
          if (line == 'NETWORK:') { where = 'network'; } else
          if (line == 'SETTINGS:') { where = 'settings'; } else
          if (where == 'cache') {
            // This line is cache line
            var filename = line.split('?')[0];
            filename = (filename == '/')?'index.html':filename;
            // Adds task to queue...
            filelist.push({
              name: filename,
              url: line
            });
            //saveFileFromServer(filename, line);
          } else
          if (where == 'fallback') {
            // This line is a fallback line
            //console.log('Fallback: ' + line);
            // TODO: Figure out a way to parse this... Filenames should be url
            // Encoded? - watchout for spaces in filenames...
            //saveFileFromServer(filename, line);
          }
        }
        // Send the file list to callback
        callback({ files: filelist, before:{}, after: {} });
        
      } else {
        console.log(' Add the appcache package'.red);
      }
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.end();

};

var packmeteorManifest = function(host, port, callback) {
  var options = {
    hostname: host,
    port: port,
    path: '/packmeteor.manifest',
    method: 'GET'
  };

  var req = http.request(options, function(res) {
    var body = '';
    var filelist = [];

    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      // Make sure we got the app.manifest
      if (body.length) {
        var lines = body.split('\n');
        if (lines[0] !== '#PACKMETEOR') {
          console.log('Incompatible packmeteor.manifest format');
          process.exit();
        }

        var result = {
          files: [],
          before: [],
          after: []
        };
        var where = 'files';

        for (var i = 1; i < lines.length; i++) {
          var line = lines[i];
          if (line.length) {

            if (line == '#BEFORE') {
              where = 'before';
            } else if (line == '#AFTER') {
              where = 'after';
            } else {            
              // Adds task to queue...
              result[where].push({
                name: (line == '/')?'index.html':line,
                url: line
              });
              //saveFileFromServer(filename, line);
            }
            
          }
        }

        // console.log(filelist);
        // Send the file list to callback
        callback(result); // TODO add before after files...They are local
        // files - so they should not be downloaded
        
      } else {
        console.log(' Add the packmeteor package'.red);
      }
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.end();

};



//module.exports = appcacheManifest;
module.exports = packmeteorManifest;
