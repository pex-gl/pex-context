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
  this.currentStyle.setColor(c[0], c[1], c[2], c[3]);
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
  this.target = new Vec3(0,100,0);
  this.targetRadius = 100;
  this.velocity = new Vec3(0,1,0);
  this.acceleration = new Vec3(0,0,0);
  this.maxForce = 2;
  this.maxSpeed = 10;
}

Agent.prototype.update = function() {
  this.seek(this.target);
  this.velocity.add(this.acceleration);
  if (this.velocity.length() > this.maxSpeed) {
    this.velocity.normalize().scale(this.maxSpeed);
  }
  this.location.add(this.velocity);
};

Agent.prototype.applyForce = function(force) {
  this.acceleration.add(force);
};

Agent.prototype.seek = function(target) {
  //console.log("####");
  this.acceleration.scale(0);
  var desired = this.target.subbed(this.location);
  var distance = desired.length();
  if (desired.length() > 0) desired.normalize();
  if (distance < this.targetRadius) {
    this.target = new Vec3(this.area.x + this.area.width * Math.random(), this.area.y + this.area.height * Math.random(),0);
  }

  //var velocity = new plask.Vec2(0, -100);
  var desiredAngle = Math.atan2(desired.y, desired.x);
  var velocityAngle = Math.atan2(this.velocity.y, this.velocity.x);
  //if (desired.length() == 0) return;
  //if (desired.length() == 0) return;
  var nd = (desired.length() > 0) ? desired.normalized() : desired.dup();
  var nv = (this.velocity.length() > 0) ? this.velocity.normalized() : this.velocity.dup();
  var dot = nd.x*nv.x + nd.y*nv.y;
  //console.log("dot", dot, desired.length(), this.velocity.length(), nd, nv);
  var dotAngle = Math.acos(dot);
  //console.log("dotAngle", dotAngle);
  var steeringAngle = 0;
  var line = new Line2D(this.location, this.location.added(this.velocity));
  if (line.isPointOnTheLeftSide(this.target)) {
    steeringAngle = velocityAngle - dotAngle/2;
  }
  else {
    steeringAngle = velocityAngle + dotAngle/2;
  }

  //console.log("steeringAngle", steeringAngle);

  //var heading = Math.atan2(this.velocity.y, this.velocity.x);
  //var desiredAngle = Math.atan2(desired.y, desired.x);
  //var newHeading = (heading + desiredAngle)/2;
  //desired.x = Math.cos(newHeading);
  //desired.y = Math.sin(newHeading);
  //desired.normalize();
  ////desired.scale(this.maxSpeed);
  //desired.scale(this.maxForce);
  //this.applyForce(desired);
  var steer = new Vec3(Math.cos(steeringAngle), Math.sin(steeringAngle), 0);
  if (steer.length() > 0)
    steer.normalize().scale(this.maxForce);
  //if (steer.length() > this.maxForce) {
  //  steer.normalize().scale(this.maxForce);
  //}
  //console.log("steer", steer);
  this.applyForce(steer);
};

function Line2D(a, b) {
    this.a = a;
    this.b = b;
  }

  //http://stackoverflow.com/questions/3461453/determine-which-side-of-a-line-a-point-lies
  //AB cross (AP), or determinant of 2x2 matrix
  Line2D.prototype.isPointOnTheLeftSide = function(p){
    return ((this.b.x - this.a.x)*(p.y - this.a.y) - (this.b.y - this.a.y)*(p.x - this.a.x)) <= 0;
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
    this.agent.area.x = 50;
    this.agent.area.y = 50;
    this.agent.area.width = this.width - 100;
    this.agent.area.height = this.height - 100;
    this.crayon = new Crayon(this.canvas);
    this.on('mouseMoved', function(e) {
      this.joints[0].x = e.x;
      this.joints[0].y = e.y;
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });
    this.framerate(30);
  },
  time: 0,
  frameCount: 0,
  drawSegment: function(i, xin, yin) {
    var dx = xin - this.joints[i].x;
    var dy = yin - this.joints[i].y;
    var angle = Math.atan2(dy, dx);
    this.joints[i].x = xin - Math.cos(angle) * this.segmentLength;
    this.joints[i].y = yin - Math.sin(angle) * this.segmentLength;

    this.crayon
      .color([0, 0, 0])
      .line(this.joints[i].x, this.joints[i].y, xin, yin)
      .stroke(0).circle(this.joints[i].x, this.joints[i].y, 10)
      .color([255, 0, 0])
      .circle(this.agent.target.x, this.agent.target.y, 5)
      .circle(this.agent.target.x, this.agent.target.y, this.agent.targetRadius)
      .line(this.agent.location.x, this.agent.location.y, this.agent.location.x + this.agent.velocity.x, this.agent.location.y + this.agent.velocity.y)
      .color([0, 255, 0])
      .line(this.agent.location.x, this.agent.location.y, this.agent.location.x + this.agent.acceleration.x*10, this.agent.location.y + this.agent.acceleration.y*10)
  },
  draw: function() {
    this.time += 1/30;
    this.crayon.clear();

    var cx = this.width * 0.5;
    var cy = this.height * 0.5;
    var t = this.time * 10;

    this.agent.update();

    var pos = new plask.Vec2(this.width/2, this.height/2);
    var mouse = new plask.Vec2(this.mouse.x, this.mouse.y);
    var desired = mouse.subbed(pos).normalize().scale(100);
    var velocity = new plask.Vec2(0, -100);
    var desiredAngle = Math.atan2(desired.y, desired.x);
    var velocityAngle = Math.atan2(velocity.y, velocity.x);
    var nd = desired.normalized();
    var nv = velocity.normalized();
    var dotAngle = Math.acos(nd.x*nv.x + nd.y*nv.y);
    var steeringAngle = 0;
    var line = new Line2D(pos, pos.added(velocity));
    if (line.isPointOnTheLeftSide(mouse)) {
      steeringAngle = velocityAngle - dotAngle/2;
    }
    else {
      steeringAngle = velocityAngle + dotAngle/2;
    }

    //this.crayon
    //  .color([255, 0, 0])
    //  .line(pos.x, pos.y, pos.x + desired.x, pos.y + desired.y)
    //  .color([100, 100, 100])
    //  .line(pos.x, pos.y, pos.x + velocity.x, pos.y + velocity.y)
    //  .color([0, 200, 0])
    //  .line(pos.x, pos.y, pos.x + seering.x, pos.y + seering.y)

    //this.agent.target.x = cx + Math.sin( t * 0.2 ) * Math.cos( t * 0.005 ) * cx * 0.5;
    //this.agent.target.y = cy + Math.sin( t * 0.3 ) * Math.tan( Math.sin( t * 0.03 ) * 1.15 ) * cy * 0.4;

    this.joints[0].x = this.agent.location.x;
    this.joints[0].y = this.agent.location.y;
    for(var i=1; i<this.joints.length; i++) {
      this.drawSegment(i, this.joints[i-1].x, this.joints[i-1].y);
    }
  }
});