define(['pex/geom/Vec3', 'pex/utils/MathUtils', 'pex/utils/Time'], function(Vec3, MathUtils, Time) {
  function ZigZagAgent(bounds, speed) {
    this.bounds = bounds;
    this.position = Vec3.clone(bounds.getCenter());
    this.chooseTarget();

    this.speed = speed || 2;
    this.dir = Vec3.create();
    this.disturb = Vec3.create();
    this.front = Vec3.fromValues(0, 0, 1);

    this.oldPositions = [];
  }

  ZigZagAgent.prototype.chooseTarget = function() {
    this.target = MathUtils.randomVec3InBoundingBox(this.bounds);
  }

  ZigZagAgent.prototype.update = function() {
    if (Time.frameNumber % 5 == 0) {
      this.oldPositions.push([this.position[0], this.position[1], this.position[2]]);
      if (this.oldPositions.length > 20) this.oldPositions.shift();
    }

    Vec3.sub(this.dir, this.target, this.position);
    Vec3.normalize(this.dir, this.dir);

    Vec3.cross(this.disturb, this.dir, this.front);
    Vec3.normalize(this.disturb, this.disturb);
    Vec3.scale(this.disturb, this.disturb, 0.5 * Math.sin(this.speed * Time.seconds * 10));

    Vec3.add(this.dir, this.dir, this.disturb);
    //Vec3.scale(this.disturb, this.disturb, );
    Vec3.normalize(this.dir, this.dir);
    Vec3.scale(this.dir, this.dir, this.speed * Time.delta);
    Vec3.add(this.position, this.position, this.dir);

    var dist = Vec3.distance(this.position, this.target);
    if (dist < 0.1) {
      this.chooseTarget();
    }
  }

  return ZigZagAgent;
});