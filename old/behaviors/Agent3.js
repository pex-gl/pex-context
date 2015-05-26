define(['pex/geom/Vec3', 'pex/geom/Line2D', 'pex/utils/Time'], function(Vec3, Line2D, Time) {
  Vec3.str = function(v) {
    var x = '' + Math.floor(v[0] * 1000)/1000;
    var y = '' + Math.floor(v[1] * 1000)/1000;
    var z = '' + Math.floor(v[2] * 1000)/1000;
    if (x.indexOf('.') == -1) x += '.000';
    if (x.indexOf('.') == x.length-2) x += '00';
    if (x.indexOf('.') == x.length-3) x += '0';
    if (x[0] != '-') x = ' ' + x;
    if (y.indexOf('.') == -1) y += '.000';
    if (y.indexOf('.') == y.length-2) y += '00';
    if (y.indexOf('.') == y.length-3) y += '0';
    if (y[0] != '-') y = ' ' + y;
    if (z.indexOf('.') == -1) z += '.000';
    if (z.indexOf('.') == z.length-2) z += '00';
    if (z.indexOf('.') == z.length-3) z += '0';
    if (z[0] != '-') z = ' ' + z;
    return '{' + x + ',' + y + ',' + z + '}';
  }
  function Agent(bounds, speed, turning) {
    this.bounds = bounds;
    bounds.getCenter(this.position);
    this.position = Vec3.fromValues(
      this.bounds.min[0] + (this.bounds.max[0] - this.bounds.min[0]) * Math.random(),
      this.bounds.min[1] + (this.bounds.max[1] - this.bounds.min[1]) * Math.random(),
      this.bounds.min[2] + (this.bounds.max[2] - this.bounds.min[2]) * Math.random()
    );
    //this.target =  MathUtils.randomVec3InBoundingBox(bounds);
    this.target = Vec3.fromValues(0,0.5,0);
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

  }

  //update-seek
  //velocity += acceleration
  //velocity = limit(velocity, maxSpeed)
  //position += velocity

  Agent.prototype.update = function() {
    if (Time.paused) return;
    this.seek(this.target);
    this.velocity[0] += this.acceleration[0];
    this.velocity[1] += this.acceleration[1];
    this.velocity[2] += this.acceleration[2];
    //Vec3.add(this.velocity, this.velocity, this.acceleration);
    var velocityLength = Vec3.length(this.velocity);
    if (velocityLength > this.maxSpeed) {
      Vec3.scale(this.velocity, this.velocity, this.maxSpeed / velocityLength);
    }
    this.position[0] += this.velocity[0] * Time.delta * 10 * 5;
    this.position[1] += this.velocity[1] * Time.delta * 10 * 5;
    this.position[2] += this.velocity[2] * Time.delta * 10 * 5;

    if (this.energy < 0 || this.energy > 1) {
      console.log('To big energy for agent ' + agent.energy);
    }
    if (!this.bounds.contains(this.position, 0.5)) {
      console.log('Agent outside of bounds', this.id,
        'min:',Vec3.str(this.bounds.min),
        'max:',Vec3.str(this.bounds.max),
        'p:', Vec3.str(this.position),
        'tgt:', Vec3.str(this.target),
        //'vel:', Vec3.str(this.velocity),
        //'acc:', Vec3.str(this.acceleration),
        'ste:', Vec3.str(this.steer),
        'dis:', Vec3.str(this.disturb),
        'force:', this.maxForce
      );
    }
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
      this.target = Vec3.fromValues(
        this.bounds.min[0] + (this.bounds.max[0] - this.bounds.min[0]) * Math.random(),
        this.bounds.min[1] + (this.bounds.max[1] - this.bounds.min[1]) * Math.random(),
        this.bounds.min[2] + (this.bounds.max[2] - this.bounds.min[2]) * Math.random()
      );
    }

    if (distance < this.targetRadius * 2) {
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
      steeringAngle = velocityAngle - dotAngle/5;
    }
    else {
      steeringAngle = velocityAngle + dotAngle/5;
    }

    this.steeringAngle = steeringAngle;

    Vec3.set(this.steer, Math.cos(this.steeringAngle), Math.sin(this.steeringAngle), 0);
    if (Vec3.length(this.steer) > 0) {
      Vec3.normalize(this.steer, this.steer);
      Vec3.scale(this.steer, this.steer, this.maxForce);
    }
    else {
      console.log('Agent no steering', this.id, 'angle:', this.steeringAngle);
    }

    Vec3.cross(this.disturb, this.velocity, this.front);
    Vec3.normalize(this.disturb, this.disturb);
    Vec3.scale(this.disturb, this.disturb, Math.min(this.maxForce/2, this.turning) * Math.sin(this.maxSpeed * Time.seconds * 2));

    Vec3.add(this.steer, this.steer, this.disturb);

    this.applyForce(this.steer);
  };

  return Agent;
});