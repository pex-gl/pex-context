var fs = require('fs');
var save = require("save-pixels");
var ndarray = require('ndarray');
var parseHdr = require('./lib/parseHdr');

function hdr2rgbe(inputFile, outputFile) {

  var hdrBuff = fs.readFileSync(inputFile);
  var hdrData = parseHdr(hdrBuff);
  var width = hdrData.width;
  var height = hdrData.height;
  var data = hdrData.data;

  var result = new Uint8ClampedArray(width*height*4)
  var pixels = ndarray(result, [width, height, 4]);

  var out = fs.createWriteStream(outputFile);

  for(var i=0; i<width*height; i++) {
    var x = i % width;
    var y = ~~( i / width );
    pixels.set(x, y, 0, data[i*4 + 0]);
    pixels.set(x, y, 1, data[i*4 + 1]);
    pixels.set(x, y, 2, data[i*4 + 2]);
    pixels.set(x, y, 3, data[i*4 + 3]);
  }

  save(pixels, 'png').pipe(out);
}

module.exports = hdr2rgbe;