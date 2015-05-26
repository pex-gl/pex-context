define(["pex/core/Vec3", "pex/core/Line2D"], function(Vec3, Line2D) {
  function HoveringAgent() {
    this.location = new Vec3(0,0,0);
    this.target = new Vec3(0,0,0);
    this.targetRadius = 0.1;
    this.velocity = new Vec3(0,1,0);
    this.acceleration = new Vec3(0,0,0);
    this.maxForce = 0.0002;
    this.maxSpeed = 0.004;
  }

  HoveringAgent.prototype.update = function() {
    this.seek(this.target);
    this.velocity.add(this.acceleration);
    if (this.velocity.length() > this.maxSpeed) {
      this.velocity.normalize().scale(this.maxSpeed);
    }
    this.location.add(this.velocity);
  };

  HoveringAgent.prototype.applyForce = function(force) {
    this.acceleration.add(force);
  };

  HoveringAgent.prototype.seek = function(target) {
    //console.log("####");
    this.acceleration.scale(0);
    var desired = this.target.subbed(this.location);
    var distance = desired.length();
    if (desired.length() > 0) desired.normalize();
    if (distance < this.targetRadius) {
      this.target = new Vec3(Math.random()*0.2 - 0.1, Math.random()*0.8 - 0.4,0);
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
  return HoveringAgent;
});