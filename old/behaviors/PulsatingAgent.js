define(['pex/geom/Vec3', 'pex/utils/MathUtils', 'pex/utils/Time'], function(Vec3, MathUtils, Time) {
  function PulsatingAgent(bounds, speed) {
    this.bounds = bounds;
    this.position = Vec3.clone(bounds.getCenter());
    this.chooseTarget();

    this.speed = speed || 1;
    this.maxSpeed = speed;
    this.tmp = Vec3.create();
    this.radius = 0;
    this.oldPositions = []
  }

  PulsatingAgent.prototype.chooseTarget = function() {
    this.target = MathUtils.randomVec3InBoundingBox(this.bounds);
  }

  PulsatingAgent.prototype.update = function() {
    if (Time.frameNumber % 5 == 0) {
      this.oldPositions.push([this.position[0], this.position[1], this.position[2]]);
      if (this.oldPositions.length > 20) this.oldPositions.shift();
    }
    this.radius = this.speed = this.maxSpeed * (0.6 + 0.4 * Math.sin(2 * Math.PI * Time.seconds));
    Vec3.sub(this.tmp, this.target, this.position);
    Vec3.normalize(this.tmp, this.tmp);
    Vec3.scale(this.tmp, this.tmp, this.speed * Time.delta);
    Vec3.add(this.position, this.position, this.tmp);

    var dist = Vec3.distance(this.position, this.target);
    if (dist < this.speed / 100) {
      this.chooseTarget();
    }
  }

  return PulsatingAgent;
});