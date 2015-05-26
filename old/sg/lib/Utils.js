var fs = require('fs');

module.exports.getShaderSource = function(str, searchPaths) {
  if (str.indexOf('void main') !== -1) return str;
  for(var i=0; i<searchPaths.length; i++) {
    var file = searchPaths[i] + '/' + str;
    if (fs.existsSync(file)) {
      return fs.readFileSync(file, 'utf8');
    }
  }
  return str;
}