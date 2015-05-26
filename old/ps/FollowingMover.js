define(["pex/util/Time", "lib/timeline"], function(Time, timeline) {
  var anim = timeline.anim;
  var Timeline = timeline.Timeline;

  function FollowingMover(obj, property, target, speed) {
    this.obj = obj;
    this.property = property;
    this.target = target;
    this.force = target.subbed(obj[property]);
    this.speed = speed ? speed : 1;
    this.speedup = 0;
    var delay = Math.random();
    anim(this).to(delay, {speedup:1}, 1, Timeline.Easing.Cubic.EaseIn);
  }

  FollowingMover.prototype.update = function() {
    var position = this.obj[this.property];
    var force = this.force;
    force.setVec3(this.target);
    force.sub(position);
    force.normalize();
    force.scale(this.speed * this.speedup * Time.delta);

    position.add(force);
  }

  return FollowingMover;
})