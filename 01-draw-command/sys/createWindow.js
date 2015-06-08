var plask = require('plask');
var R = require('ramda');

function createWindow(opts) {
  opts.settings = opts.settings || {};
  opts.settings.type = '3d';

  //wait for all resources to load
  if (opts.resources) {
    var oldInit = opts.init;
    var oldDraw = opts.draw;
    opts.draw = function() {};
    opts.init = function() {
      Promise.all(R.values(opts.resources)).then(function(resources) {
        opts.init = oldInit;
        opts.draw = oldDraw;
        opts.init();
      }).catch(function(e) {
        console.log(e.stack);
        throw e;
      })
    }
  }
  plask.simpleWindow(opts);
}

module.exports = createWindow;
