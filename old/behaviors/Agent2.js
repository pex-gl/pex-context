define(['pex/geom/Vec3', 'pex/geom/Line2D', 'pex/utils/Time'], function(Vec3, Line2D, Time) {
  function Agent() {
    this.area = { x:-0.5, y:-1, width:1, height: 2};
    this.location = Vec3.fromValues(0,0,0);
    this.target = Vec3.fromValues(0,0.5,0);
    this.targetRadius = 0.2;
    this.velocity = Vec3.fromValues(0,0.1,0);
    this.acceleration = Vec3.fromValues(0,0,0);
    this.maxForce = 0.0008;
    this.maxSpeed = 0.005;

    //tmp
    this.desired = Vec3.create();
    this.normalizedVelocity = Vec3.fromValues(0,0.1,0);
    var a = Vec3.create();
    var b = Vec3.create();
    this.testLine = new Line2D(a, b);

    this.steer = Vec3.create();
  }

  Agent.prototype.update = function() {
    if (Time.paused) return;
    this.seek(this.target);
    Vec3.add(this.velocity, this.velocity, this.acceleration);
    var velocityLength = Vec3.length(this.velocity);
    if (velocityLength > this.maxSpeed) {
      Vec3.scale(this.velocity, this.velocity, this.maxSpeed / velocityLength);
    }
    Vec3.add(this.location, this.location, this.velocity);
  };

  Agent.prototype.applyForce = function(force) {
    Vec3.add(this.acceleration, this.acceleration, force);
  };

  Agent.prototype.seek = function(target) {
    Vec3.set(this.acceleration, 0, 0, 0);

    //desired direction
    Vec3.sub(this.desired, this.target, this.location);
    var distance = Vec3.length(this.desired);
    if (distance > 0) Vec3.scale(this.desired, this.desired, 1.0 / distance);

    //if we are close to target change it to a new one
    if (distance < this.targetRadius) {
      this.target = Vec3.fromValues(this.area.x + this.area.width * Math.random(), this.area.y + this.area.height * Math.random(), 0);
    }

    if (distance < this.targetRadius * 1.5) {
      Vec3.scale(this.velocity, this.velocity, 0.9);
    }

    if (Vec3.length(this.desired) == 0) return;

    var desiredAngle = Math.atan2(this.desired[1], this.desired[0]);
    var velocityAngle = Math.atan2(this.velocity[1], this.velocity[0]);
    Vec3.normalize(this.desired, this.desired);
    Vec3.normalize(this.normalizedVelocity, this.velocity);

    var dot = this.desired[0] * this.normalizedVelocity[0] + this.desired[1] * this.normalizedVelocity[1];
    if (dot > 1) dot = 1;
    var dotAngle = Math.acos(dot);
    var steeringAngle = 0;

    Vec3.copy(this.testLine.a, this.location);
    Vec3.add(this.testLine.b, this.location, this.velocity);

    if (this.testLine.isPointOnTheLeftSide(this.target)) {
      steeringAngle = velocityAngle - dotAngle/2;
    }
    else {
      steeringAngle = velocityAngle + dotAngle/2;
    }

    Vec3.set(this.steer, Math.cos(steeringAngle), Math.sin(steeringAngle), 0);
    if (Vec3.length(this.steer) > 0) {
      Vec3.normalize(this.steer, this.steer);
      Vec3.scale(this.steer, this.steer, this.maxForce);
    }
    this.applyForce(this.steer);
  };

  return Agent;
});