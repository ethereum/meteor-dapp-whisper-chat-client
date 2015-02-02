// File handling stuff

// Filesystem
var fs = require('fs');
// Path
var path = require('path');
// HTTP
var http = require('http');
// Folder list
var folderObject = {};
// Files to exclude from folder sync
var dontSync = {
  'manifest.json': true,  // Chrome packaged apps
  'package.json': true,   // node-webkit
  'config.xml': true,     // cordova
  'index.js': true,
  'index.html': true,
  'main.js': true
};

// Copy text file
var copyFile = function(source, destination) {
  try {
    var data = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(destination, data, 'utf8');
  }catch(err) {
    return false;
  }
  return true;
};

// Check folder and create if not found
var ensureFolderExists = function(fullpath) {
  var list = fullpath.split(path.sep);
  var pathname = '';
  while (list.length) {
    if (pathname === '') {
      pathname = path.join(path.sep, list.shift());
    } else {
      pathname = path.join(pathname, path.sep, list.shift());
    }
    if (pathname !== '') {
      // If path not found then create
      if (!fs.existsSync(pathname)) {
        fs.mkdirSync(pathname);
      }
    }
  }
};


// We have an array/flat object of files in the folder - this is to keep track
// of files to remove - since we are syncronizing with a source
var folderObjectUpdate = function(fullpath) {

  var folder = fs.readdirSync(fullpath || '.');
  if (typeof fullpath === 'undefined') {
    // Reset array
    folderObject = {};
  }

  for (var i = 0; i < folder.length; i++) {
    var filename = folder[i];
    var pathname = ((fullpath)? fullpath + '/' : '') + filename;
    try {
      if (!dontSync[pathname]) {
        folderObjectUpdate(pathname);
        folderObject[pathname] = 'path';
      }
    } catch(err) {
      folderObject[pathname] = true;
    }
  }  
};

var addDontSync = function(filename) {
  dontSync[filename] = true;
};

cleanFolderInit = function(complete) {
  // Clear container
  folderObject = {};
  // Scan the folder
  folderObjectUpdate();
  // Next
  complete();
};

var cleanFolder = function(complete) {
  // Clean folder after all new files are syncronized,
  for (var file in folderObject) {
    var value = folderObject[file];
    if (value === true || value === 'path') {
      if (value === 'path') {
        try {
          fs.rmdirSync(file);
        } catch(err) {
          // The folder is not empty, thats ok
        }
      } else {
        try {
          fs.unlinkSync(file);
        } catch(err) {
          // This would be an error
          var error = 'Could not remove: ' + file;
          // console.log(error.red);
        }
      }
    }
  }
  complete();
};

var updatedFolder = function(path) {
  // Set a "dont remove" flag
  var id = (path.substr(0,1) === '/')?path.substr(1) : path;
  folderObject[id] = false;
};

var saveRemoteFile = function(filepath, urlpath, complete) {
  // File descriptor
  var fd;

  // Start downloading a file
  http.get(urlpath, function(response) {
    if (response.statusCode !== 200) {
      if (response) { 
        complete('Error while downloading: ' + urlpath + ' Code: ' + response.statusCode);
      }
    } else {
      var contentLength = +(response.headers['content-length'] || -1);
      var loadedLength = 0;

      fd = fs.openSync(filepath, 'w');
      response.on("data", function(chunk) {
        loadedLength += chunk.length;   
        fs.write(fd, chunk,  0, chunk.length, null, function(err, written, buffer) {
          if(err) {
            complete('Error while downloading: ' + urlpath + ', Error: ' + err.message);
          } else {
            // TODO: Show file download progress?
            if (contentLength == loadedLength) {
              // Done
            }
          }
        }); 
       });
      
      response.on("end", function() {
        // Check if fd exists?
        setTimeout(function() {
          if (contentLength != loadedLength && contentLength > -1) {
            console.log('File not fully loaded: ' + path.basename(filepath) + ' ' + filename);
          }
          fs.closeSync(fd);
        }, 300);
        complete();
      });
    }
  }).on('error', function(e) {
    complete('Error while downloading: ' + urlpath);
  });
};

module.exports = {
  saveRemoteFile: saveRemoteFile,
  copyFile: copyFile,
  ensureFolderExists: ensureFolderExists,
  folderObjectUpdate: folderObjectUpdate,
  addDontSync:addDontSync,
  cleanFolderInit: cleanFolderInit,
  cleanFolder: cleanFolder,
  updatedFolder: updatedFolder
};
