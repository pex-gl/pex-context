define(["ps/ParticleSystemRenderer", "ps/Particle", "pex/util/RandUtils"], function(ParticleSystemRenderer, Particle, RandUtils) {
  function ParticleSystem() {
    this.particles = [];
    this.emitters = [];

    this.renderer = new ParticleSystemRenderer();
    this.renderer.particleSystem = this;
  }

  ParticleSystem.prototype.addEmitter = function(emitter) {
    emitter.setParticleSystem(this);
    this.emitters.push(emitter);
  };

  ParticleSystem.prototype.clearEmitters = function(emitter) {
    this.emitters.length = 0;
  };

  ParticleSystem.prototype.update = function() {
    this.emitters.forEach(function(e) {
      e.update();
    });
    this.particles.forEach(function(p) {
      p.update();
    });
    for(var i=0; i<this.particles.length; i++) {
      if (this.particles[i].life < 0) {
        this.particles.splice(i, 1);
        --i;
      }
    }
    this.renderer.update();
  };

  ParticleSystem.prototype.draw = function(camera) {
    this.renderer.draw(camera);
  };


  return ParticleSystem;
});