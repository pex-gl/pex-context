define(["pex/core/Vec3", "pex/util/Time", "pex/core/Color"], function(Vec3, Time, Color) {
  function Particle(position, velocity, life) {
    this.position = position || new Vec3(0, 0, 0);
    this.prevPosition = this.position.dup();
    this.prevPositionDistance = 0.1;
    this.velocity = velocity || new Vec3(0, 0, 0);
    this.color = new Color(0,0,0,0);
    this.life = life || 1;
  }

  Particle.prototype.update = function() {
    this.prevPosition = this.position.dup();
    this.position.add(this.velocity.scaled(Time.delta));
    this.life -= Time.delta;
    this.color.r = this.color.g = this.color.b = this.color.a = this.life;
  };

  return Particle;
});var right = dir.crossed(up).normalized();
    up = right.crossed(dir).normalized();
    this.up = up;
  }

  Particle.prototype.update = function(t) {
    t *= 2;
    t = Math.min(t, 1);
    this.position = MathUtil.mixVec3(this.startPos, this.endPos, t);
    this.position.add(this.up.scaled(0.4 * Math.sin(t * Math.PI)));

    this.color = MathUtil.mixColor(this.startColor, this.endColor, t);

    if (this.lastT < 1) {
      this.positions.push(this.position);
      this.colors.push(this.color);
    }
    if (this.positions.length > this.maxSteps || t == 1) this.positions.shift();
    this.lastT = t;
  }

  return Particle;
});