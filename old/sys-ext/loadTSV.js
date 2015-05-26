var IO = require('pex-sys').IO;
var R = require('ramda');
var Promise = require('bluebird');

function loadTSV(file) {
  return new Promise(function(resolve, reject) {
    IO.loadTextFile(file, function(data) {
      var lines = data.trim().split('\n');
      columns = lines.shift().split('\t');
      var results = lines.map(function(line) {
        var values = line.split('\t');
        //automatically parse numbers
        values = values.map(function(value) {
          if (isNaN(Number(value))) return value;
          else return Number(value);
        })
        return R.zipObj(columns, values);
      });
      resolve(results);
    });
  })
}

module.exports = loadTSV;