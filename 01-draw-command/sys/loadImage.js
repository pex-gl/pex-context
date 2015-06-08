var plask = require('plask');

function loadImage(path) {
  return new Promise(function(resolve, reject) {
    try {
      var canvas = plask.SkCanvas.createFromImage(path);
      resolve(canvas);
    }
    catch(e) {
      reject(e);
    }
  });
}

module.exports = loadImage;
