var plask = require('plask');

//-----------------------------------------------------------------------------

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

//-----------------------------------------------------------------------------

plask.simpleWindow({
  settings: {
    width: 900,
    height: 720,
    type: '2d'
  },
  segmentLength: 50,
  joints: [new plask.Vec2(0,0), new plask.Vec2(0,0), new plask.Vec2(0,0), new plask.Vec2(0,0)],
  mouse: {
    x: 0,
    y: 0
  },
  init: function() {
    this.crayon = new Crayon(this.canvas);
    this.on('mouseMoved', function(e) {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });
    this.framerate(30);
  },
  drawSegment: function(i, xin, yin) {
    var dx = xin - this.joints[i].x;
    var dy = yin - this.joints[i].y;
    var angle = Math.atan2(dy, dx);
    this.joints[i].x = xin - Math.cos(angle) * this.segmentLength;
    this.joints[i].y = yin - Math.sin(angle) * this.segmentLength;

    this.crayon
      .line(this.joints[i].x, this.joints[i].y, xin, yin)
      .stroke(0).circle(this.joints[i].x, this.joints[i].y, 10);
  },
  draw: function() {
    this.crayon.clear();
    this.drawSegment(0, this.mouse.x, this.mouse.y);
    this.drawSegment(1, this.joints[0].x, this.joints[0].y);
    this.drawSegment(2, this.joints[1].x, this.joints[1].y);
    this.drawSegment(3, this.joints[2].x, this.joints[2].y);
  }
});