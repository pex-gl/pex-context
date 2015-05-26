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
  var on = (enabled !== undefined) ? enabled : true;
  if (on) this.currentStyle.setFill();
  else this.currentStyle.setStroke();
  return this;
};

SkCanvasCrayon.prototype.stroke = function(enabled) {
  //this.currentStyle.setStroke((enabled !== undefined) ? enabled : true);
  var on = (enabled !== undefined) ? enabled : true;
  if (on) this.currentStyle.setStroke();
  else this.currentStyle.setFill();
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

  var steer = new Vec3(Math.cos(steeringAngle), Math.sin(steeringAngle), 0);
  if (steer.length() > 0)
    steer.normalize().scale(this.maxForce);
  this.applyForce(steer);
};

//-----------------------------------------------------------------------------

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
  joints2: [
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
  creature: {
    tentacles : []
  },
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

    for(var i=0; i<6; i++) {
      var joints = [];
      this.creature.tentacles.push(joints);
      for(var j=0; j< 5 + Math.random()*4; j++) {
        joints.push(new plask.Vec2(0,0));
      }
    }
  },
  time: 0,
  frameCount: 0,
  drawSegment: function(joints, i, xin, yin, delta) {
    var dx = xin - joints[i].x;
    var dy = yin - joints[i].y;
    var angle = Math.atan2(dy, dx);
    joints[i].x = xin - Math.cos(angle + delta) * this.segmentLength;
    joints[i].y = yin - Math.sin(angle + delta) * this.segmentLength;

    this.crayon
      .color([0, 0, 0, 50])
      .line(joints[i].x, joints[i].y, xin, yin)
      //.stroke(true).circle(joints[i].x, joints[i].y, 5);
  },
  draw: function() {
    this.time += 1/30;
    this.crayon.clear();

    var cx = this.width * 0.5;
    var cy = this.height * 0.5;
    var t = this.time * 10;

    this.agent.update();

    this.creature.tentacles.forEach(function(joints, ti) {
      joints[0].x = this.agent.location.x;
      joints[0].y = this.agent.location.y;
      for(var i=1; i<joints.length; i++) {
        this.drawSegment(joints, i, joints[i-1].x, joints[i-1].y, Math.PI/200 * ti);
      }
    }.bind(this));

    //this.joints[0].x = this.agent.location.x;
    //this.joints[0].y = this.agent.location.y;
    //for(var i=1; i<this.joints.length; i++) {
    //  this.drawSegment(this.joints, i, this.joints[i-1].x, this.joints[i-1].y, 0);
    //}
//
    //this.joints2[0].x = this.agent.location.x;
    //this.joints2[0].y = this.agent.location.y;
    //for(var i=1; i<this.joints2.length; i++) {
    //  this.drawSegment(this.joints2, i, this.joints2[i-1].x, this.joints2[i-1].y, i>1 ? 0 : 0.05);
    //}

    this.crayon
      .fill(false)
      .color([255, 0, 0])
      .circle(this.agent.target.x, this.agent.target.y, 5)
      .circle(this.agent.target.x, this.agent.target.y, this.agent.targetRadius)
      .line(this.agent.location.x, this.agent.location.y, this.agent.location.x + this.agent.velocity.x, this.agent.location.y + this.agent.velocity.y)
      .color([0, 255, 0])
      .line(this.agent.location.x, this.agent.location.y, this.agent.location.x + this.agent.acceleration.x*10, this.agent.location.y + this.agent.acceleration.y*10)

  }
});