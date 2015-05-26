var Promise = require('bluebird');
var fs      = require('fs');

function saveTXT(file, data) {
  return new Promise(function(resolve, reject) {
    fs.writeFileSync(file, data);
    resolve();
  })
}

module.exports = saveTXT;