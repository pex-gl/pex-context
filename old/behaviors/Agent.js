define(['pex/geom/Vec3'], function(Vec3) {
  function Agent() {
    this.location = Vec3.fromValues(0, 0, 0);
    this.target = Vec3.fromValues(0, -0.5,0);
    this.targetRadius = 0.2;
    this.velocity = Vec3.fromValues(0, 0, 0);
    this.acceleration = Vec3.fromValues(0, 0, 0);
    this.maxForce = 0.01;
    this.maxSpeed = 0.01;

    //tmp
    this.desired = Vec3.create();
    this.steer = Vec3.create();
  }

  Agent.prototype.update = function() {
    this.seek(this.target);
    Vec3.add(this.velocity, this.velocity, this.acceleration);
    if (Vec3.length(this.velocity) > this.maxSpeed) {
      Vec3.normalize(this.velocity, this.velocity);
      Vec3.scale(this.velocity, this.velocity, this.maxSpeed);
    }
    Vec3.add(this.location, this.location, this.velocity);
    Vec3.set(this.acceleration, 0, 0, 0);
  };

  Agent.prototype.applyForce = function(force) {
    Vec3.add(this.acceleration, this.acceleration, force);
  };

  Agent.prototype.seek = function(target) {
    Vec3.sub(this.desired, this.target, this.location);
    var distance = Vec3.length(this.desired);
    if (distance > 0) Vec3.scale(this.desired, this.desired, 1.0 / distance);
    if (distance < this.targetRadius) {
      Vec3.scale(this.desired, this.desired, this.maxSpeed * distance / this.targetRadius);
      if (distance < this.targetRadius / 10) {
        Vec3.set(this.target, Math.random()*0.4 - 0.2, Math.random() - 0.5, 0);
      }
    }
    else {
      Vec3.scale(this.desired, this.desired, this.maxSpeed);
    }

    Vec3.sub(this.steer, this.desired, this.velocity);
    var steerLength = Vec3.length(this.steer);
    if (steerLength > this.maxForce) {
      Vec3.scale(this.steer, this.steer, 1.0 / steerLength * this.maxForce);
    }
    this.applyForce(this.steer);
  };

  return Agent;
});