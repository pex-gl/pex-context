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

var Vec3 = plask.Vec3;

function Agent() {
  this.area = {x:0, y:0, width:100, height: 100};
  this.location = new Vec3(0,0,0);
  this.target = new Vec3(0,0,0);
  this.targetRadius = 10;
  this.velocity = new Vec3(0,0,0);
  this.acceleration = new Vec3(0,0,0);
  this.maxForce = 10;
  this.maxSpeed = 10;
}

Agent.prototype.update = function() {
  this.seek(this.target);
  this.velocity.add(this.acceleration);
  if (this.velocity.length() > this.maxSpeed) {
    this.velocity.normalize().scale(this.maxSpeed);
  }
  this.location.add(this.velocity);
  this.acceleration.scale(0);
};

Agent.prototype.applyForce = function(force) {
  this.acceleration.add(force);
};

Agent.prototype.seek = function(target) {
  var desired = this.target.subbed(this.location);
  var distance = desired.length();
  if (desired.length() > 0) desired.normalize();
  if (distance < this.targetRadius) {
    desired.scale(this.maxSpeed * distance / this.targetRadius);
    if (distance < this.targetRadius / 10) {
      this.target = new Vec3(this.area.x + this.area.width * Math.random(), this.area.y + this.area.height * Math.random(),0);
    }
  }
  else {
    desired.scale(this.maxSpeed);
  }
  //if (desired.length() > 0)
  //  desired.normalize().scale(this.maxSpeed);
  var steer = desired.subbed(this.velocity);
  if (steer.length() > this.maxForce) {
    steer.normalize().scale(this.maxForce);
  }
  this.applyForce(steer);
};

//-----------------------------------------------------------------------------

plask.simpleWindow({
  settings: {
    width: 900,
    height: 720,
    type: '2d'
  },
  segmentLength: 50,
  joints: [
    new plask.Vec2(0,0),
    new plask.Vec2(0,0),
    new plask.Vec2(0,0),
    new plask.Vec2(0,0),
    new plask.Vec2(0,0),
    new plask.Vec2(0,0),
    new plask.Vec2(0,0),
    new plask.Vec2(0,0),
    new plask.Vec2(0,0)
  ],
  mouse: {
    x: 0,
    y: 0
  },
  init: function() {
    this.agent = new Agent();
    this.agent.area.width = this.width;
    this.agent.area.height = this.height;
    this.crayon = new Crayon(this.canvas);
    this.on('mouseMoved', function(e) {
      this.joints[0].x = e.x;
      this.joints[0].y = e.y;
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
    this.agent.update();
    this.joints[0].x = this.agent.location.x;
    this.joints[0].y = this.agent.location.y;
    this.crayon.clear();
    for(var i=1; i<this.joints.length; i++) {
      this.drawSegment(i, this.joints[i-1].x, this.joints[i-1].y);
    }
  }
});