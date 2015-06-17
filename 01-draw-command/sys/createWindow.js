var R = require('ramda');
var Platform = require('./Platform');
var createBrowserWindow = require('./createBrowserWindow');
var Promise = require('bluebird');

function createWindow(opts) {
  opts.settings = opts.settings || {};
  opts.settings.type = '3d';
  opts.settings.highdpi = 1;

  //wait for all resources to load
  if (opts.resources) {
    opts._init = opts.init;
    opts._draw = opts.draw;
    opts.draw = function() {};
    opts.init = function() {
      //Add missing webgl context props
      this.gl.drawingBufferWidth = this.width;
      this.gl.drawingBufferHeight = this.height;

      Promise.all(R.values(opts.resources)).then(function(resources) {
        opts.draw = function() {
          if (opts.update) {
            opts.update();
          }
          opts._draw();
        };
        opts._init();
      }).done();
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
