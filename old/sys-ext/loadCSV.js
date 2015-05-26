var IO  = require('pex-sys').IO;
var csv = require('csv');
var Promise = require('bluebird');

function loadCSV(file, debug) {
  if (debug) console.time('loadCSV', file);
  return new Promise(function(resolve, reject) {
    IO.loadTextFile(file, function(dataStr) {
      csv()
      .from.string(dataStr, { columns: true })
      .to.array(function(data) {
        if (debug) console.timeEnd('loadCSV', file);
        resolve(data);
      }.bind(this));
    });
  });
}

module.exports = loadCSV;