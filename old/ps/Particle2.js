define(["pex/core/Vec3", "pex/util/Time", "pex/core/Color"], function(Vec3, Time, Color) {
  var count = 0;
  function Particle(position, velocity, life) {
    this.position = position || new Vec3(0, 0, 0);
    this.history = [];
    this.prevPosition = this.position.dup();
    this.prevPositionDistance = 0.1;
    this.velocity = velocity || new Vec3(0, 0, 0);
    this.color = new Color(0,0,0,0);
    this.startLife = life || 1;
    this.life = life || 1;
    this.startColor = new Color(1, 1, 1, 1);
    this.endColor = new Color(1, 1, 0, 1);
    this.id = count++;
  }

  Particle.prototype.update = function() {
    this.history.push([this.position.dup(), this.color.dup()]);
    this.prevPosition = this.position.dup();
    this.position.add(this.velocity.scaled(Time.delta));
    this.life -= Time.delta;
    var t = this.getLifeTime();
    if (t > 0.5) {
      this.color.r = this.startColor.r + (this.endColor.r - this.startColor.r) * (1.0 - (t - 0.5) * 2);
      this.color.g = this.startColor.g + (this.endColor.g - this.startColor.g) * (1.0 - (t - 0.5) * 2);
      this.color.b = this.startColor.b + (this.endColor.b - this.startColor.b) * (1.0 - (t - 0.5) * 2);
      this.color.a = 1;
    }
    else {
      this.color.r = this.endColor.r;
      this.color.g = this.endColor.g;
      this.color.b = this.endColor.b;
      this.color.a = t*2;
    }
  };

  Particle.prototype.getLifeTime = function() {
    return this.life / this.startLife;
  };

  return Particle;
});