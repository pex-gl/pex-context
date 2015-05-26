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
    this.on('keyDown', function(e) {
      if (e.str == 'c') {
        this.clear = !this.clear;
      }
      if (e.str == '1') this.updateTentacles = this.updateTentacles1;
      if (e.str == '2') this.updateTentacles = this.updateTentacles2;
    });
    this.on('mouseMoved', function(e) {
      this.joints[0].x = e.x;
      this.joints[0].y = e.y;
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });
    this.framerate(30);

    for(var i=0; i<8; i++) {
      var tentacle = {
        nodes:[],
        length: 5 + Math.random() * 5,
        spacing: 5 + Math.random() * 5,
        friction: 0.1 + Math.random() * 0.3
      };
      for(var j=0; j<3 + Math.random() * 3; j++) {
        var node = {};
        node.position = new plask.Vec2(0,0);
        node.oldPosition = new plask.Vec2(0,0);
        node.velocity = new plask.Vec2(0,0);
        tentacle.nodes.push(node);
      }
      this.creature.tentacles.push(tentacle);
    }

    this.updateTentacles = this.updateTentacles1;
  },
  time: 0,
  frameCount: 0,
  clear: true,
  updateTentacles: null,
  updateTentacles1: function() {
    var crayon = this.crayon;
    var agent = this.agent;
    var wind = 0.02;
    var gravity = 0.01;

    this.creature.tentacles.forEach(function(tentacle, ti) {
      var nodes = tentacle.nodes;
      nodes[0].position.x = agent.location.x;
      nodes[0].position.y = agent.location.y;

      var prev = nodes[0];
      for(var i=1; i<nodes.length; i++) {
        var node = nodes[i];

        //where the node is now
        node.position.add(node.velocity);

        //where is it going?
        var delta = prev.position.subbed(node.position);
        var deltaAngle = Math.atan2(delta.y, delta.x);

        //where it should be according to constraints
        var px = node.position.x + Math.cos( deltaAngle ) * tentacle.spacing * tentacle.length;
        var py = node.position.y + Math.sin( deltaAngle ) * tentacle.spacing * tentacle.length;

        //push it away
        node.position.x = prev.position.x - ( px - node.position.x );
        node.position.y = prev.position.y - ( py - node.position.y );

        node.velocity.x = node.position.x - node.oldPosition.x;
        node.velocity.y = node.position.y - node.oldPosition.y;

        node.velocity.scale(1 - tentacle.friction);

        node.velocity.x += wind;
        node.velocity.y += gravity;

        crayon.color([0, 0, 0, 100])
        crayon.line(prev.position.x, prev.position.y, node.position.x, node.position.y)
        crayon.circle(node.position.x, node.position.y, 10)

        node.oldPosition = node.position.dup();

        prev = node;
      }
    }.bind(this));
  },
  updateTentacles2: function() {
    var crayon = this.crayon;
    var agent = this.agent;
    var wind = 0.02;
    var gravity = 0.01;

    this.creature.tentacles.forEach(function(tentacle, ti) {
      var nodes = tentacle.nodes;
      nodes[0].position.x = agent.location.x;
      nodes[0].position.y = agent.location.y;

      var prev = nodes[0];
      for(var i=1; i<nodes.length; i++) {
        var node = nodes[i];

        //where the node is now
        node.position.add(node.velocity);

        //where is it going?
        var delta = prev.position.subbed(node.position);
        var dir = delta.normalize().scale(tentacle.spacing * tentacle.length);

        //push it away keeping constraints
        node.position.setVec2(prev.position).sub(dir);//node.position = prev.position.subbed(dir);

        node.velocity.setVec2(node.position).sub(node.oldPosition);//node.velocity = node.position.subbed(node.oldPosition);
        node.velocity.scale(1 - tentacle.friction);

        node.velocity.x += wind;
        node.velocity.y += gravity;

        crayon.color([0, 0, 0, 100])
        crayon.line(prev.position.x, prev.position.y, node.position.x, node.position.y)
        crayon.circle(node.position.x, node.position.y, 10)

        node.oldPosition.setVec2(node.position);//node.oldPosition = node.position.dup();

        prev = node;
      }
    }.bind(this));
  },
  avg: 0,
  frameCount: 0,
  draw: function() {
    this.time += 1/30;
    if (this.clear) this.crayon.clear();

    var cx = this.width * 0.5;
    var cy = this.height * 0.5;
    var t = this.time * 10;

    this.agent.update();

    var start = (new Date()).getTime();
    this.updateTentacles();
    var end = (new Date()).getTime();
    var delta = end - start;
    this.avg = (this.avg + delta)/2;
    if (this.frameCount++ % 10 == 0) {
      console.log(Math.floor(this.avg), process.memoryUsage().heapTotal, process.memoryUsage().heapUsed);
    }

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