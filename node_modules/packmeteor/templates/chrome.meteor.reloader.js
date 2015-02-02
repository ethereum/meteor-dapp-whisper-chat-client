      console.log('??');
      setTimeout(function() {
        console.log('...');
        if (Package && Package.reload && Package.reload.Reload) {
          console.log('Add to migrate');

          Package.reload.Reload._onMigrate('packmeteor', function(migrate) {
            // If in chrome packaged app
            if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.reload === 'function') {
              console.log('Migrate Chrome');
              setTimeout(function() {
                chrome.runtime.reload();
              }, 2000);
            } else {
              // If not in node js environment the migrate
              if (typeof process !== 'undefined' && typeof require !== 'undefined') {
                console.log('Migrate Node');
                Meteor.setTimeout(function() {
                  window.location.reload();
                  var gui = require('nw.gui');

                  var win = gui.Window.get();
                  win.reloadIgnoringCache();
                }, 2000);

              } else {
                // migrate();     
                return [true];       
              }
            }
            return false;
          });
        }

      }, 1000);
