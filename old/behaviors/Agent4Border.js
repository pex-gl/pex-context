define(['pex/geom/Vec3', 'pex/geom/Line2D', 'pex/utils/Time'], function(Vec3, Line2D, Time) {
  function Agent(bounds, speed, turning) {
    this.bounds = bounds;
    this.position = Vec3.create();
    bounds.getCenter(this.position);
    this.position[0] += (Math.random() - 0.5) * (bounds.max[0] - bounds.min[0]) * 0.2;
    this.position[1] += (Math.random() - 0.5) * (bounds.max[1] - bounds.min[1]) * 0.2;
    //this.target =  MathUtils.randomVec3InBoundingBox(bounds);
    this.target = Vec3.fromValues(Math.random() - 0.5, Math.random() - 0.5,0);
    this.targetRadius = 0.2;
    this.velocity = Vec3.fromValues(0,0.1,0);
    this.acceleration = Vec3.fromValues(0,0,0);
    this.maxForce = 0.0008;
    this.maxSpeed = 0.005;
    this.turning = turning || 0.00005;
    this.speed = 1;

    //tmp
    this.desired = Vec3.create();
    this.normalizedVelocity = Vec3.fromValues(0,0.1,0);
    var a = Vec3.create();
    var b = Vec3.create();
    this.testLine = new Line2D(a, b);

    this.steer = Vec3.create();

    this.front = Vec3.fromValues(0, 0, 1);
    this.disturb = Vec3.create();

    this.steeringAngle = 0;

    this.oldPositions = [];
  }

  //update-seek
  //velocity += acceleration
  //velocity = limit(velocity, maxSpeed)
  //position += velocity

  Agent.prototype.update = function() {
    if (Time.paused) return;
    if (Time.frameNumber % 5 == 0) {
      this.oldPositions.push([this.position[0], this.position[1], this.position[2]]);
      if (this.oldPositions.length > 20) this.oldPositions.shift();
    }
    this.seek(this.target);
    Vec3.add(this.velocity, this.velocity, this.acceleration);
    var velocityLength = Vec3.length(this.velocity);
    if (velocityLength > this.maxSpeed) {
      var speed = this.maxSpeed * (1 + 0.9 * Math.sin(Time.delta * 5 * this.energy));
      Vec3.scale(this.velocity, this.velocity, speed / velocityLength);
    }

    this.position[0] += this.velocity[0] * Time.delta * 10 * 5;
    this.position[1] += this.velocity[1] * Time.delta * 10 * 5;
    this.position[2] += this.velocity[2] * Time.delta * 10 * 5;
  };

  Agent.prototype.applyForce = function(force) {
    Vec3.add(this.acceleration, this.acceleration, force);
  };

  //acceleration = 0
  //desired = target - position
  //distance = length(desired)
  //desired = normalize(desired)
  //newTarget if distance < targetRadius
  //desiredAngle = atan2(desired.y, desired.x)
  //velocityAngle = atan(velocity.y, velocity.x)
  //normalizedVelcity = normalize(velocity)
  //

  Agent.prototype.seek = function(target) {
    Vec3.set(this.acceleration, 0, 0, 0);

    //desired direction
    Vec3.sub(this.desired, this.target, this.position);
    var distance = Vec3.length(this.desired);
    if (distance > 0) Vec3.scale(this.desired, this.desired, 1.0 / distance);

    //if we are close to target change it to a new one
    if (distance < this.targetRadius) {
      //this.target = MathUtils.randomVec3InBoundingBox(this.bounds);
      var nx = (this.target[0] < 0) ? 0.7 : -0.7;

      this.target = Vec3.fromValues(
        (this.bounds.min[0] + this.bounds.max[0]) / 2 + (this.bounds.max[0] - this.bounds.min[0]) * nx,
        this.bounds.min[1] + (this.bounds.max[1] - this.bounds.min[1]) * Math.random(),
        this.bounds.min[2] + (this.bounds.max[2] - this.bounds.min[2]) * Math.random()
      );
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

    Vec3.copy(this.testLine.a, this.position);
    Vec3.add(this.testLine.b, this.position, this.velocity);

    if (this.testLine.isPointOnTheLeftSide(this.target)) {
      steeringAngle = velocityAngle - dotAngle/5 * this.energy;
    }
    else {
      steeringAngle = velocityAngle + dotAngle/5 * this.energy;
    }

    this.steeringAngle = steeringAngle;

    Vec3.set(this.steer, Math.cos(this.steeringAngle), Math.sin(this.steeringAngle), 0);

    if (Vec3.length(this.steer) > 0) {
      Vec3.normalize(this.steer, this.steer);
      Vec3.scale(this.steer, this.steer, this.maxForce);
    }

    Vec3.cross(this.disturb, this.velocity, this.front);
    Vec3.normalize(this.disturb, this.disturb);
    Vec3.scale(this.disturb, this.disturb, Math.min(this.maxForce/2, this.turning) * Math.sin(this.maxSpeed * Time.seconds * 2));

    Vec3.add(this.steer, this.steer, this.disturb);

    this.applyForce(this.steer);
  };

  return Agent;
});