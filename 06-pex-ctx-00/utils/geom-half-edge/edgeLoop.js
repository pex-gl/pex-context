var next = require('./next');

function edgeLoop(edge, cb) {
  var curr = edge;

  var i = 0;
  do {
    cb(curr, i++);
    curr = next(curr);
  }
  while(curr != edge);
}

module.exports = edgeLoop;
