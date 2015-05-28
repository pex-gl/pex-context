var plask = require('plask');

function createWindow(opts) {
  opts.settings = opts.settings || {};
  opts.settings.type = '3d';
  plask.simpleWindow(opts);
}

module.exports = createWindow;
