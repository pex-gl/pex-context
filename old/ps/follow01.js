var plask = require('plask');

function SkCanvasCrayon(canvas) {
  this.canvas = canvas;
  this.styles = {};
  this.styles['default'] = this.createStyle();
  this.currentStyle = this.styles['default'];
}

SkCanvasCrayon.prototype.createStyle = function() {
  var style = new plask.SkPaint();
  style.setAntiAlias(true);
  return style;
};

SkCanvasCrayon.prototype.style = function(styleName) {
  if (!this.styles[styleName]) {
    this.styles[styleName] = this.createStyle();
  }
  this.currentStyle = this.styles[styleName];
  return this;
};

SkCanvasCrayon.prototype.color = function(c) {
  this.currentStyle.setColor(255*c[0], 255*c[1], 255*c[2], 255*c[3]);
  return this;
};

SkCanvasCrayon.prototype.fill = function(enabled) {
  this.currentStyle.setFill((enabled !== undefined) ? enabled : true);
  return this;
};

SkCanvasCrayon.prototype.stroke = function(enabled) {
  this.currentStyle.setStroke((enabled !== undefined) ? enabled : true);
  return this;
};

SkCanvasCrayon.prototype.rect = function(x, y, w, h) {
  this.canvas.drawRect(this.currentStyle, x, y, w, h);
  return this;
};

SkCanvasCrayon.prototype.circle = function(x, y, r) {
  this.canvas.drawCircle(this.currentStyle, x, y, r);
  return this;
};

SkCanvasCrayon.prototype.line = function(x1, y1, x2, y2) {
  this.canvas.drawLine(this.currentStyle, x1, y1, x2, y2);
  return this;
};

SkCanvasCrayon.prototype.clear = function() {
  this.canvas.eraseColor(255, 255, 255, 255);
  return this;
};

var Crayon = SkCanvasCrayon;

plask.simpleWindow({
  settings: {
    width: 900,
    height: 720,
    type: '2d'
  },
  agent: {
    x: 100,
    y: 100,
    length: 50
  },
  mouse: {
    x: 0,
    y: 0
  },
  init: function() {
    this.crayon = new Crayon(this.canvas);
    //this.crayon
    //  .color([255, 0, 0]).stroke().fill(false).rect(0, 0, 50, 50)
    //  .color([255, 255, 0]).circle(0, 0, 25);
    this.on('mouseMoved', function(e) {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });
    this.framerate(30);
  },
  draw: function() {
    var dx = this.mouse.x - this.agent.x;
    var dy = this.mouse.y - this.agent.y;
    var angle = Math.atan2(dy, dx);
    this.agent.x = this.mouse.x - Math.cos(angle) * this.agent.length;
    this.agent.y = this.mouse.y - Math.sin(angle) * this.agent.length;

    this.crayon
      .clear()
      .line(this.agent.x, this.agent.y, this.mouse.x, this.mouse.y);
      .crayon.stroke(0).circle(this.agent.x, this.agent.y, 10);
  }
});