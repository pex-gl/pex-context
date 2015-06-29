var loadImage = require('../load-image');
var isPlask = require('../is-plask');
var plask = isPlask ? require('plask') : {};

var tmpSkPaint = null;

function cropImagePlask(img, x, y, w, h) {
    var canvas = plask.SkCanvas.create(w, h);
    var paint = tmpSkPaint || new plask.SkPaint();
    canvas.drawCanvas(paint, img, 0, 0, w, h, x, y, x + w, y + h);
    return canvas;
}

function cropImageBrowser(img, x, y, w, h) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
    return canvas;
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
                face: i,
                level: 0,
                width: faceWidth,
                height: faceHeight,
                data: faceData
            })
        }

        callback(null, faces);
    })
}

module.exports = loadCubemapHStrip;
