var Platform = require('../Platform');
var plask = Platform.isPlask ? require('plask') : {};

function loadImage(url, callback) {
    if (Platform.isPlask) {
        var img = plask.SkCanvas.createFromImage(url);
        callback(null, img);
    }
    else if (Platform.isBrowser) {
        var img = new Image();
        img.onload = function() {
            callback(null, img);
        }
        img.src = url;
    }

}

module.exports = loadImage;
