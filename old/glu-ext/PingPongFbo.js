var glu = require('pex-glu');
var RenderTarget = glu.RenderTarget;

function PingPongFbo(w, h, options) {
  options = options || {};
  this.curr = new RenderTarget(w, h, options);
  this.prev = new RenderTarget(w, h, options);
  this.curr.name = 'curr';
  this.prev.name = 'prev';
}

PingPongFbo.prototype.swap = function() {
  var tmp = this.curr;
  this.curr = this.prev;
  this.prev = tmp;
}

module.exports = PingPongFbo;