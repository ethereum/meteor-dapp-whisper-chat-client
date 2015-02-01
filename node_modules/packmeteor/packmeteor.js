#!/usr/bin/env node
/*

  We bundle Meteor client into a Chrome Packaged App folder

*/


// CLI Options
var program = require('commander');
// CLI Colored text
var colors = require('colors');
// CLI Progress bar
var ProgressBar = require('progress');
// CLI DDP connection
var DDPClient = require("ddp");
// Filesystem
var fs = require('fs');
// Url parsing
var url = require('url');
// Path
var path = require('path');
// File Extended
var fsx = require('./fsx');
// Chrome browser - only tested on mac
var chrome = 'open -a Google\\ Chrome ';
// Queue
var Queue = require('./queue');
// Read the filemanifest from the source server
var filemanifest = require('./filemanifest');
// Get current path
var currentPath = path.resolve();
// currentBuild
var currentBuild = 0;
// Build queue syncron
var queue = new Queue();
// List of replacements for correcting index.html
var fileList = [];
// Add local files before / after the main file list
var beforeFileList = [];
var afterFileList = [];

// Name of reloader script
var reloaderFile = 'chrome.meteor.reloader.js';
// Path of this script - Used by creating app from templates
var scriptPath = path.dirname(require.main.filename);
// Templates folder
var templatePath = path.join(scriptPath, path.sep, 'templates');

program
  .version('0.1.1')
  .option('-c, --create <name>', 'Create Packaged App')
  .option('-a, --autobuild', 'Auto build on server update')
  .option('-r, --reload', 'Reload app')

  .option('-u, --url [url]', 'Client code url [http://localhost:3000]', 'http://localhost:3000')
  .option('-s, --server <url>', 'Server url, default to build url [http://localhost:3000]')

  .option('-t, --target [packaged, cordova]', 'Target platform, default is autodetect')
  .option('-e, --emulate [platform]', 'Reload emulator [android]')
  .option('-d, --device [platform]', 'Reload device [android]')
  .option('-m, --migration', 'Enable Meteor hotcode push')

  .parse(process.argv);

// If user only uses the -e or --emulate the assume android platform
if (program.emulate === true) {
  program.emulate = 'android';
}

if (program.device === true) {
  program.device = 'android';
}

// Check that we are in a packaged app directory
var inPackagedAppFolder = fs.existsSync('manifest.json');
var inCordovaAppFolder = fs.existsSync('config.xml');
var inNewCordovaOutSideWWW = fs.existsSync('www');

if (inNewCordovaOutSideWWW) {
  console.log('Cordova found - but you have to be inside the www folder');
  process.exit();
}

// We could be in the new cordova structure so better test...
if (!inCordovaAppFolder)
  inCordovaAppFolder = fs.existsSync(path.resolve('../config.xml'));

if (!program.target) {
  // If target not set then detect packaged or cordova
  if (inPackagedAppFolder) {
    program.target = 'packaged';
  }

  if (inCordovaAppFolder) {
    program.target = 'cordova';
  }
}

// If chrome packaged app and reload is on then force Meteor migration...
if (program.target === 'packaged' && program.reload && !program.migration) {
  program.migration = true;
}

// This function returns array of IPv4 interfaces
var getIps = function() {
  // OS for ip
  var os = require('os');
  // Get interfaces
  var netInterfaces = os.networkInterfaces();
  // Result
  var result = [];
  for (var id in netInterfaces) {
    var netFace = netInterfaces[id];
    for (var i = 0; i < netFace.length; i++) {
      var ip = netFace[i];
      if (ip.internal === false && ip.family === 'IPv4') {
        result.push(ip);
      }
    }
  }
  return result;
};

// Init urls
var urls = {
  build: url.parse(program.url),
  server: url.parse(program.server || program.url)
};

// If user havent specified server adr when on cordova - we'll help the user
if (!program.server) {
  // Get list of ip's
  var ips = getIps();
  // If we got any results
  if (ips.length) {
    // Create new adr
    var newAdr = urls.server.protocol + '//' + ips[0].address + ':' + urls.server.port;
    // Parse the server urls
    urls.server = url.parse(newAdr);
  }
}



var saveFileFromServer = function(filename, url) {

  var filepath = path.join(currentPath, filename);
  var dirname = path.dirname(filepath);
  if (url !== '/') {
    fileList.push({
      url: url,
      filename: filename
    });
  }

  // Load resources from server url
  var urlpath = urls.build.href + url.substr(1);

  // Add task to queue
  queue.add(function(complete) {
    
    // Dont clean this filename
    fsx.updatedFolder(filename);
    
    // Make sure the path exists
    fsx.ensureFolderExists(dirname);

    // Save the remote file on to the filesystem
    fsx.saveRemoteFile(filepath, urlpath, complete);

  });
};

var correctIndexJs = function(code) {
  var result = '';
  // We have to set new loading parametres
  // __meteor_runtime_config__ = {"meteorRelease":"0.6.5.1","ROOT_URL":"http://localhost:3000/","ROOT_URL_PATH_PREFIX":"","serverId":"","DDP_DEFAULT_CONNECTION_URL":"http://localhost:3000"};
  var jsonSettings = code.replace('__meteor_runtime_config__ = ', '').replace('};', '}');
  var settings = {};
  try {
    settings = JSON.parse(jsonSettings);
  } catch(err) {
    settings = {
      'meteorRelease':'unknown',
      'ROOT_URL_PATH_PREFIX': '',
      'serverId': 'migrate'
    };
  }
  // Stop hot code push
  if (!program.migration) {
    settings.serverId = '';
  }

  // Set server connection
  settings.ROOT_URL = urls.server.href;
  settings.DDP_DEFAULT_CONNECTION_URL = urls.server.href;

  runtimeConfig = '__meteor_runtime_config__ = ' + JSON.stringify(settings) + ';';

  // We have to add this workaround - CPA dont support the 'unload' event
  // and we dont bother rewriting sockJS
  var socketJSWorkaround = fs.readFileSync(path.join(templatePath, 'chrome-packaged-apps.js'), 'utf8');
    /*"window.orgAddEventListener = window.addEventListener;\n" +
    "window.addEventListener = function(event, listener, bool) {\n" +
    " if (event !== 'unload') {\n" +
    "  window.orgAddEventListener(event, listener, bool);\n" +
    " }\n" +
    "};\n";*/

  // Rig the result
  result = runtimeConfig;
  // Add a console log stating that we are up
  result += '\nconsole.log("Packed Meteor is loaded...");\n';
  // Chrome packaged apps are pr. default set as target
  if (program.target === 'packaged') {
    // Add the socketJS workaround
    result += socketJSWorkaround;
  }
  return result;
};

var chromeAppReloader = function() {
  var addReloader = program.target === 'packaged';// && program.reload;
  if (addReloader) {
   /* var code =
    "if (Package && Package.reload && Package.reload.Reload) {\n" +
    "  Package.reload.Reload._onMigrate('packmeteor', function(migrate) {\n" +
    "    if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.reload === 'function') {\n" +
    "      setTimeout(function() {\n" +
    "        chrome.runtime.reload();\n" +
    "      }, 2000);\n" +
    "    } else {\n" +
    "      migrate();\n" +
    "    }\n" +
    "  });\n" +
    "}\n";

    fs.writeFileSync(reloaderFile, code, 'utf8');*/
    fsx.copyFile(path.join(templatePath, path.sep, reloaderFile), reloaderFile);
    // Return the text to add
    return '  <script type="text/javascript" src="' + reloaderFile + '"></script>\n\n';
  }

  return '';
};

var correctIndexHtml = function(complete) {
  var indexName = 'index.html';
  if (fs.existsSync(indexName)) {
    // Load index.html
    var text = fs.readFileSync(indexName, 'utf8');
    // Get the chrome reloader script
    var theChromeAppReloaderScript = chromeAppReloader();
    // Add the script to the file
    text = text.replace('</body', theChromeAppReloaderScript + '</body');
    // Chrome packaged apps doesnt allow inline scripts.. We extract it into
    // a seperate file called index.js and add the loader for it
    // We only intercept the first script tag
    text = text.replace('</script>', '<!-- CI -->');
    // Adapt to latest meteor ' instead of "
    text = text.replace("'text/javascript'", '"text/javascript"');
    // Divide the source
    text = text.replace('\n<script type="text/javascript">', '<!-- SCRIPT -->');
    var listA = text.split('<!-- SCRIPT -->');
    // Check for parsing errors
    if (listA.length !== 2) {
      console.log(text);
      throw new Error('Not compatible with the current Meteor version');
    }
    // Divide the source again
    var listB = listA[1].split('<!-- CI -->');
    // Check for parsing errors
    if (listB.length !== 2) {
      throw new Error('Not compatible with the current Meteor version');
    }
    //console.log(listB);
    text = listA[0];
    // If building for cordova then add the cordova script
    if (program.target === 'cordova') {
      // XXX: dont mess with headers
      // text = text.replace('<head>\n',
      //   '<head>\n' +
      //   '  <meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>\n' +
      //   '  <meta name="format-detection" content="telephone=no" />\n' +
      //   '  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0">\n\n'
      // );

// TODO: beforeFileList
      // TODO: Check if we should add more files like plugins
      text += '  <script type="text/javascript" src="cordova.js"></script>\n';

      // Add after files
      for (var i = 0; i < afterFileList.length; i++) {
        text += '  <script type="text/javascript" src="' + afterFileList[i].url + '"></script>\n';
      }
    }
    // Add the rest of html
    text += '  <script type="text/javascript" src="index.js"></script>';
    text += listB[1];
    // Code that should go into index.js
    var code = correctIndexJs(listB[0]);

    // Create the index.js file
    fs.writeFileSync('index.js', code, 'utf8');

    // Loop through fileList
    while (fileList.length) {
      var item = fileList.pop();
      if (item) {
        // Replace url with filename
        text = text.replace(item.url, item.filename.substr(1));
      }
    }
    
    // Reset fileList
    fileList = [];

    // Save file
    fs.writeFileSync(indexName, text, 'utf8');
  } else {
    console.log(indexName + ' not found - cant correct filenames');
  }

  // Done
  complete();
};



/*
  Create app
*/
if (program.create) {
  if (program.create === ''+program.create) {
    if (fs.existsSync(program.create)) {
      console.log('Cannot create app, Folder "' + program.create.bold + '" allready exists');
    } else {
      // Create the app dir and rig basic files
      fs.mkdirSync(program.create);
      if (fs.existsSync(program.create)) {
        // Init manifest.json
        var manifest = {
          "manifest_version": 1,
          "name": program.create,
          "version": "0.0.1",
          "permissions": [],
          "app": {
            "background": {
              "scripts": [
                "main.js"
              ]
            }
          },
          "minimum_chrome_version": "23"      
        };
        // Add the server permissions
        manifest.permissions.push(urls.server.href);
        // Write manifest file
        fs.writeFileSync(program.create + '/manifest.json', JSON.stringify(manifest, null, '\t'), 'utf8');
        // Write the main.js file
        var mainFile = fs.readFileSync(path.join(templatePath, 'chrome.main.js'));
        /*"// Autogenerated file - packmeteor\n" +
        "chrome.app.runtime.onLaunched.addListener(function() {\n" +
        "  chrome.app.window.create('index.html', {\n" +
        //"          id: 'appTestID',\n" +
        "    bounds: {\n" +
        "      width: 500, height: 300\n" +
        "    }\n" +
        "  });\n" +
        "});\n";*/
        // Write the main.js file
        fs.writeFileSync(program.create + '/main.js', mainFile, 'utf8');
        // Display some helpful guide
        console.log('Created packaged folder "' + program.create.bold + '" and manifest.json file');
        console.log('');
        console.log('$ cd ' + program.create);
        console.log('$ packmeteor -ar' + ' (autobuild and autoreload on)'.grey);
      } else {
        console.log('Could not create folder: ' + program.create);
      }
    } // EO folder not found so create app...
  } else {
    program.help();
  }

} else {
  console.log('-------------------------------------------');
  console.log('Packaging app from ...: ' + urls.build.href);
  console.log('Connect client app to : ' + urls.server.href);
  console.log('-------------------------------------------');

  if (inPackagedAppFolder || inCordovaAppFolder) {

    if (program.reload) {
      if (program.target === 'packaged') {
        console.log('Starting app via `Chrome` ' + currentPath + '');        
      }
      if (program.target === 'cordova') {
        console.log('Rebuilding app via `cordova build`');        
      }
    }

    if (program.emulate) {
      console.log('Restart emulator via `cordova emulate ' + program.emulate + '`');
    }


    if (program.target === 'cordova') {
      // We dont touch the res/* folder could hold icons for the cordova build?
      fsx.addDontSync('res');
    }

    // If we are using the reload then and on chrome packaged apps then
    if (program.target === 'packaged' && program.reload) {
      // Dont sync the reloader file
      fsx.addDontSync(reloaderFile);
    }

    var buildPackagedApp = function() {
      currentBuild++;
      
      queue.reset();

      queue.add(fsx.cleanFolderInit);

      var manifest = {
        "manifest_version": 1
      };
      // Load manifest.json file
      if (inPackagedAppFolder) {
        var manifestString = fs.readFileSync('manifest.json', 'utf8');

        try {
          manifest = JSON.parse(manifestString);  
        } catch(err) {
          throw new Error('manifest.json invalid format, Error: ' + (err.trace || err.message));
        }
      }

      // Load all files from /packmeteor.manifest - serves a list of clientfiles
      // to save into the packaged app - or could we use the appcache manifest?
      // TODO: if we make a Meteor package we should have a better interface
      // than using the appcache?

      filemanifest(urls.build.hostname, urls.build.port, function(result) {
        var filelist = result.files;
        // TODO: Handle before and after local files could be plugins
        beforeFileList = result.before;
        afterFileList = result.after;

        for (var i = 0; i < filelist.length; i++) {
          // Adds task to queue...
          var fileItem = filelist[i];
          saveFileFromServer(fileItem.name, fileItem.url);
        }

        // Correct the file names in the index.html
        queue.add(correctIndexHtml);

        // Save the manifest file
        queue.add(function(complete) {
          //console.log('write manifest');
          // Increase version nr in configuration
          manifest.manifest_version++;
          //manifest.version++;
          // Save new manifest
          manifestString = JSON.stringify(manifest, null, '\t');
          fs.writeFileSync('manifest.json', manifestString, 'utf8');
          complete();
        });

        // Clean the app folder after rebuilding?
        queue.add(fsx.cleanFolder);

        // If user wants to reload chrome app or at first run
        if (program.reload || currentBuild === 1) {
          if (program.target === 'cordova') {
            // Cordova
            queue.add(testCordovaPlatform);
            queue.add(prepareCordovaApps);
            queue.add(compileCordovaApps);
          } else {
            // Default target is packaged
            //queue.add(killChrome);
            // We are reloading but only do this the first time
            if (currentBuild === 1) {
              queue.add(reloadChromeApps);
            }
          }
        }

        if (program.target === 'cordova' && program.emulate) {
          queue.add(emulateCordovaApps);
        }

        if (program.target === 'cordova' && program.device) {
          queue.add(runCordovaApps);
        }

        // Start the build
        queue.run();

      });

    };

    // General function for executing shell commands
    var execute = function(command, name, complete) {
      var exec = require('child_process').exec;
      var completeFunc = (typeof complete === 'function')?complete:console.log;

      // console.log('Execute: ' + name + ' : ' + command);
      exec(command, function(err) {
        if(err){ //process error
          completeFunc('Could not ' + name);
          //completeFunc('Could not ' + name + ', Error: ' + (err.trace || err.message));
        } else {
          completeFunc();
        }
      });
    };    

    // Parse the cordova platforms output into a object
    var parseCordovaPlatforms = function(text) {
      var list = text.split('\n');
      var platforms = {};
      for (var i = 0; i < list.length; i++) {
        var split = list[i].split(': ');
        if (split[0]) {
          platforms[split[0]] = split[1]; //.split(', ');
        }
      }
      return platforms;      
    };

    // Test that platforms are added
    var testCordovaPlatform = function(complete) {
      var exec = require('child_process').exec;
      var completeFunc = (typeof complete === 'function')?complete:console.log;

      // console.log('Execute: ' + name + ' : ' + command);
      exec('cordova platforms', function(err, stin) {
        if(err){ //process error
          completeFunc('Could not use cordova, is it installed?');
          //completeFunc('Could not ' + name + ', Error: ' + (err.trace || err.message));
        } else {
          platforms = parseCordovaPlatforms(stin);

          var target = program.emulate || program.device;
          var installed = platforms['Installed platforms'];
          var available = platforms['Available platforms'];

          var isInstalled = (installed && installed.indexOf(target) >= 0);
          var isAvailable = (available && available.indexOf(target) >= 0);

          if (!target) {
            if (installed) {
              // Ok, no target but have a platform installed
              // we are not emulating or running
              completeFunc(); 
              return;             
            } else {
              // No platforms are installed - we install default android
              target = 'android';
            }
          }

          if (isInstalled) {
            // All is good
            completeFunc();
          } else {
            if (!isInstalled && isAvailable) {
              var message = 'Platform missing, trying to add ' + target;
              console.log(message.green);
              // Ok we can help trying fix this..
              execute('cordova platform add ' + target, 'add platform ' + target, complete);
            } else {
              // All is bad - the platform is not available
              completeFunc('Could not use platform ' + target);
            }
          }
        }
      });      
    };

    var killChrome = function(complete) {
      var command = 'killall Google\ Chrome';
      execute(command, 'kill all Chrome', complete);
    };

    // Start or restart the app
    var reloadChromeApps = function(complete) {
      //var appId = 'appTestID';
      //var command = chrome + '--args --app-id=' + appId;
      var command = chrome + '--args --load-and-launch-app=' + currentPath;// + ' --no-startup-window';
      execute(command, 'start Chrome packaged app', complete);
    };

    var prepareCordovaApps = function(complete) {
      var command = 'cordova prepare';
      execute(command, 'prepare cordova app', complete);
    };

    var compileCordovaApps = function(complete) {
      var command = 'cordova compile';
      execute(command, 'compile cordova app', complete);
    };

    var emulateCordovaApps = function(complete) {
      var command = 'cordova emulate ' + program.emulate;
      var name = 'run emulator for ' + program.emulate + ' cordova app';
      execute(command, name, complete);
    };

    var runCordovaApps = function(complete) {
      var command = 'cordova run ' + program.device;
      var name = 'run on ' + program.device + ' cordova app';
      execute(command, name, complete);
    };


    /*

      Rig the forever build option

    */
    // Run a function f at every connect host:port event 
    var runForever = function(host, port, f) {
      // Create connection listener
      var ddpclient = new DDPClient({ host: host, port: port });

      // When we are connected / reconnected then run the handed function
      ddpclient.connect(function(error) {
        // TODO: Test if allready building?
        if (!error) {
          if (typeof f === 'function') {
            try {
              f();
            } catch(err) {
              throw new Error('Could not run function, forever, Error: ' + (err.trace || err.message) );
            }
          } else {
            throw new Error('runForever expects a function');
          }
        }
      });
    };


    // If autobuild added
    if (program.autobuild) {
      // If source is server then listen to the servers ddp
      var buildbar = new ProgressBar('Auto building ' + program.target + ' Meteor app (:current%)', {
        total: 120,
        complete: '',
        incomplete: ''
      });

      queue.progress = function(count, total) {
        var progress = total - count;
        // The queue will update this
        var pct = (total > 0) ? Math.round(progress / total * 100) : 0;
        // Update the gui
        buildbar.curr = pct;
        buildbar.render();
      };

      runForever(urls.build.hostname, urls.build.port, function() {
        // Run builder
        buildPackagedApp();
      });
    } else {
      console.log('Start building ' + program.target + ' Meteor app');
      // Run builder
      buildPackagedApp();      
    }
  } else {
    // No packaged app found
    console.log('Must be in a ' + program.target + ' app folder');
  }
}




// program
//   .version('0.0.1')
//   .option('-p, --peppers', 'Add peppers')
//   .option('-P, --pineapple', 'Add pineapple')
//   .option('-b, --bbq', 'Add bbq sauce')
//   .option('-C, --cheese <type>', 'Add the specified type of cheese [marble]', 'marble')
//   .parse(process.argv);

// console.log('you ordered a pizza with:'.underline.green);
// if (program.peppers) console.log('  - peppers');
// if (program.pineapple) console.log('  - pineapple');
// if (program.bbq) console.log('  - bbq');
// console.log('  - %s cheese', program.cheese);


// var bar = new ProgressBar('downloading [:bar] :percent :etas', {
//   complete: '=',
//   incomplete: ' ',
//   width: 40,
//   total: 100
// });
// var timer = setInterval(function(){
//   bar.tick(1);
//   if (bar.complete) {
//     console.log('\ncomplete\n');
//     clearInterval(timer);
//   }
// }, 100);