var prev = require('./prev');

//half edge vertex loop
function vertexEdgeLoop(edge, cb) {
  var curr = edge;

  do {
    cb(curr);
    curr = prev(curr).opposite;
  }
  while(curr != edge);
}

module.exports = vertexEdgeLoop;
