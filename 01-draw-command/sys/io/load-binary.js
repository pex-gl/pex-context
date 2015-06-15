var Platform = require('../Platform');
var fs = require('fs');

var loadBinaryFilePlask = function (file, callback) {
  console.log('loadBinaryFile', file);
  try {
    if (!fs.existsSync(file)) {
      if (callback) {
        return callback('File doesn\t exist', null);
      }
    }
  }
  catch(e) {
    console.log(e.stack);
    throw new Error(e);
  }
  var rawData = fs.readFileSync(file);
  var data = toArrayBuffer(rawData);
  if (callback) {
    callback(null, data);
  }
}

var loadBinaryFileBrowser = function (url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = "arraybuffer";
  request.onreadystatechange = function (e) {
    if (request.readyState == 4) {
      if (request.status == 200) {
        if (callback) {
          callback(null, request.response);
        }
      } else {
        callback('loadTextFile error : ' + request.response, null);
      }
    }
  };
  request.send(null);
};

var loadBinaryFile = Platform.isBrowser ? loadBinaryFileBrowser : loadBinaryFilePlask;

function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
  }
  return ab;
}

module.exports = loadBinaryFile;
