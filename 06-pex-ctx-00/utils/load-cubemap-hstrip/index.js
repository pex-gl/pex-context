var loadImage = require('../load-image');
var isPlask = require('../is-plask');
var plask = isPlask ? require('plask') : {};

var TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;

var tmpSkPaint = null;

function cropImagePlask(img, x, y, w, h) {
    var canvas = plask.SkCanvas.create(w, h);
    var paint = tmpSkPaint || new plask.SkPaint();
    canvas.drawCanvas(paint, img, 0, 0, w, h, x, y, x + w, y + h);
    return canvas;
}

function cropImageBrowser(img, x, y, w, h) {

}

/**
 * Loads cubemap faces from a image containing 6 faces next to each other in order: +X -X +Y -Y +Z -Z
 * @param  {String}   url
 * @param  {Function} callback(err, images)
 */
function loadCubemapHStrip(url, callback) {
    console.log('loadCubemapHStrip', url);
    loadImage(url, function(err, img) {
        if (err) return callback(err, null);
        console.log('loadCubemapHStrip', 'width:', img.width, 'height:', img.height);

        var faceWidth = img.height;
        var faceHeight = img.height;

        var cropImage = isPlask ? cropImagePlask : cropImageBrowser;

        var faces = [];
        var numFaces = 6;
        for(var i=0; i<numFaces; i++) {
            var faceData = cropImage(img, i * faceWidth, 0, faceWidth, faceHeight);
            faces.push({
                data: faceData,
                target: TEXTURE_CUBE_MAP_POSITIVE_X + i,
                width: faceWidth,
                height: faceHeight,
                level: 0
            })
        }

        callback(null, faces);
    })
}

module.exports = loadCubemapHStrip;
