var IO = require('pex-sys').IO;
var Promise = require('bluebird');

function loadJSON(file) {
  return new Promise(function(resolve, reject) {
    IO.loadTextFile(file, function(data) {
      resolve(JSON.parse(data));
    });
  });
}

module.exports = loadJSON;