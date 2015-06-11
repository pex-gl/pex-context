var R = require('ramda');
var Platform = require('./Platform');
var createBrowserWindow = require('./createBrowserWindow');

function createWindow(opts) {
  opts.settings = opts.settings || {};
  opts.settings.type = '3d';

  //wait for all resources to load
  if (opts.resources) {
    opts._init = opts.init;
    opts._draw = opts.draw;
    opts.draw = function() {};
    opts.init = function() {
      Promise.all(R.values(opts.resources)).then(function(resources) {
        opts.draw = function() {
          if (opts.update) {
            opts.update();
          }
          opts._draw();
        };
        console.log('init resources', resources.length);
        try {
          opts._init();
        }
        catch(e) {
          console.log()
        }
        console.log('init end');
      }).catch(function(e) {
        console.log(e.stack);
        throw e;
      })
    }
  }
  if (Platform.isPlask) {
    var plask = require('plask');
    plask.simpleWindow(opts);
  }
  else if (Platform.isBrowser) {
    var win = createBrowserWindow(opts);
  }
  else {
    throw new Error('Can\'t create Window. Unknown platform');
  }
}

module.exports = createWindow;
