//records positions with time or distance intervals
define(["pex/util/Time", "pex/core/Vec3"], function(Time, Vec3) {
  function Tracer(obj, properties, updatePeriod) {
    this.obj = obj;
    this.tracks = {};
    properties.forEach(function(propName) {
      if (obj[propName].dup) {
        this.tracks[propName] = [ obj[propName].dup() ];
      }
      else {
        this.tracks[propName] = [ obj[propName] ];
      }
    }.bind(this));

    this.updatePeriod = updatePeriod || 1 / 10; //10x / second
    this.timeSinceLastUpate = 0;
  }

  Tracer.prototype.update = function() {
    this.timeSinceLastUpate += Time.delta;
    if (this.timeSinceLastUpate > this.updatePeriod) {
      this.timeSinceLastUpate -= this.updatePeriod;

      for(var propName in this.tracks) {
        var val = this.obj[propName];
        var track = this.tracks[propName];
        if (val.dup) {
          if (track.length > 0) {
            var dst = track[track.length-1].distance(val);
            if (dst > 0.01) {
              track.push(val.dup());
            }
          }
          else {
            track.push(val.dup());
          }
        }
        else {
          track.push(val);
        }
      }
    }
  }

  return Tracer;
});