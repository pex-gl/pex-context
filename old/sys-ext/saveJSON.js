var Promise = require('bluebird');
var fs      = require('fs');

function saveJSON(file, data) {
  return new Promise(function(resolve, reject) {
    fs.writeFileSync(file, JSON.stringify(data));
    resolve();
  })
}

module.exports = saveJSON;