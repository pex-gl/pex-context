exports.Graph = require('./lib/Graph');
exports.Snippet = require('./lib/Snippet');

exports.graph = function(searchPaths) {
  return new exports.Graph(searchPaths);
}