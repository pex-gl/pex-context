define(["pex/core/Vec3", "pex/util/Time", "ps/Particle", "ps/ParticleEmitter", "pex/util/RandUtils", "pex/core/Color"], 
  function(Vec3, Time, Particle, ParticleEmmiter, RandUtils, Color) {
  function BasicEmitter(position) {
    this.position = position || new Vec3(0, 0, 0);
    this.emitPeriod = 1/30;
    this.time = 0;
    this.particleSpeed = 0.1;
    this.particleLife = 2;
    this.startColor = new Color(1, 1, 1, 1);
    this.endColor = new Color(1, 1, 0, 1);
  }

  BasicEmitter.prototype = new ParticleEmmiter();

  BasicEmitter.prototype.update = function() {
    this.time += Time.delta;
    if (this.time > this.emitPeriod) {
      this.time -= this.emitPeriod;
      for(var i=0; i<10; i++) {
        var velocity = RandUtils.randomVec3OnSphere(this.particleSpeed);
        var p = new Particle(this.position.dup(), velocity, this.particleLife);
        p.startColor = this.startColor;
        p.endColor = this.endColor;
        this.particleSystem.particles.push(p);
      }
    }
  };

  return BasicEmitter;
});