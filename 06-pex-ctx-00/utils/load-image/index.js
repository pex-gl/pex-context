var isPlask = require('../is-plask');
var plask = isPlask ? require('plask') : {};

function loadImage(url, callback) {
    if (isPlask) {
        var img = plask.SkCanvas.createFromImage(url);
        callback(null, img);
    }
    else {
        var img = new Image();
        img.onload = function() {
            callback(null, img);
        }
        img.src = url;
    }

}

module.exports = loadImage;
