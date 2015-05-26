define(["pex/util/Time", "ps/Particle", "pex/util/RandUtils"], function(Time, Particle, RandUtils) {
  function bump(t) {
    return 0.5 - 0.5*Math.cos(t * 2 * Math.PI);
  }

  function scurve(t) {
    return 0.5 - 0.5 * Math.cos(t * Math.PI);
  }

  function ecg(time, bpm) {
    bpm = bpm || 75;
    var period = 60/bpm; //length of one period in seconds
    var t = time - Math.floor(time / period) * period;
    t /= period;

    if (t < 0.5/20) {
      return 0;
    }
    //else if (t < 4.5/20) {
    //  return 0.15 * bump(remap(t, 1.5/20, 4.5/20, 0, 1));
    //}
    //else if (t < 6/20) {
    //  return 0;
    //}
    //else if (t < 6.5/20) {
    //  return 0 - 0.1 * scurve(remap(t, 5/20, 5.5/20, 0, 1));
    //}
    else if (t < 7.5/20) {
      //return -0.1 + 1.1 * scurve(remap(t, 6.5/20, 7.5/20, 0, 1));
      return -0.1 + 1.1 * scurve(remap(t, 1.5/20, 7.5/20, 0, 1));
    }
    else if (t < 12/20) {
      return 1.0 - 1.3 * scurve(remap(t, 7.5/20, 12/20, 0, 1));
    }
    //else if (t < 8.5/20) {
    //  return remap(t, 8.0/20, 8.5/20, -0.3, 0);
    //}
    //else if (t < 12/20) {
    //  return 0;
    //}
    else if (t < 15/20) {
      return 0.2 * scurve(remap(t, 12/20, 15/20, 0, 1));
    }
    else if (t < 17/20) {
      return 0.2 - 0.2 * scurve(remap(t, 15/20, 17/20, 0, 1));
    }
    else if (t < 17.5/20) {
      return 0;
    }
    else if (t < 19/20) {
      return 0.05 * bump(remap(t, 17.5/20, 19/20, 0, 1));;
    }

    return 0;
  }

  function remap(value, oldMin, oldMax, newMin, newMax) {
    return newMin + (value - oldMin)/(oldMax - oldMin)*(newMax - newMin);
  }

  function LinearParticleEmitter(source, target) {
    this.source = source;
    this.target = target;
    this.particleSystem = null;
    this.timeSinceLastUpdate = 0;
    this.speed = 0.5;
  }

  LinearParticleEmitter.period = 0.025;
  LinearParticleEmitter.radius = 0.05;
  LinearParticleEmitter.emitType = "Continuous";
  LinearParticleEmitter.rhythmSpeed = 2;
  LinearParticleEmitter.beat = 0;

  LinearParticleEmitter.prototype.update = function() {
    if (LinearParticleEmitter.emitType == "Continuous") {
      this.timeSinceLastUpdate += Time.delta;
    }
    if (LinearParticleEmitter.emitType == "Pulse") {
      this.timeSinceLastUpdate += Time.delta * (0.5 + 0.5 * Math.sin(Time.seconds * LinearParticleEmitter.rhythmSpeed));
    }
    if (LinearParticleEmitter.emitType == "HeatBeat") {
      this.timeSinceLastUpdate += Time.delta;
      if (this.timeSinceLastUpdate > LinearParticleEmitter.period) {
        var val = Math.max(0, ecg(Time.seconds * LinearParticleEmitter.rhythmSpeed / 2, 60));
        LinearParticleEmitter.beat = val;
        this.emitParticles(0.5 * ((1+val)*(1+val) - 1) / LinearParticleEmitter.period / 5, 2);
        this.timeSinceLastUpdate = 0;
      }
    }

    if (this.timeSinceLastUpdate > LinearParticleEmitter.period) {
      this.timeSinceLastUpdate = 0;
      this.emitParticles(1);
    }
  };

  LinearParticleEmitter.prototype.emitParticles = function(n, maxLife) {
    maxLife = maxLife || 2;
    for(var i=0; i<n; i++) {
      var offset = RandUtils.randomVec3InSphere(LinearParticleEmitter.radius);
      var pos = this.source.dup().add(offset);
      var velocity = this.target.added(offset).sub(this.source).normalize().scale(this.speed);
      var dist =  this.target.added(offset).sub(this.source).length();
      var life = dist / velocity.length() * RandUtils.randomFloat(0.5, maxLife);
      this.particleSystem.particles.push(new Particle(pos, velocity, life));
    }
  }

  return LinearParticleEmitter;
});