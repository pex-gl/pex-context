var Promise = require('bluebird');

function loadImage(path) {
  return new Promise(function(resolve, reject) {
    try {
      var plask = require('plask');
      var canvas = plask.SkCanvas.createFromImage(path);
      resolve(canvas);
    }
    catch(e) {
      reject(e);
    }
  });
}

module.exports = loadImage;
