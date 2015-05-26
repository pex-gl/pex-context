define([], function() {
  function ParticleEmitter() {
    this.particleSystem = null;
  }

  ParticleEmitter.prototype.update = function() {

  };

  ParticleEmitter.prototype.setParticleSystem = function(parent) {
    this.particleSystem = parent;
  };

  return ParticleEmitter;
});