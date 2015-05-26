var geom = require('pex-geom');
var R    = require('ramda');
var fn   = require('../utils/fn');

var Mat4 = geom.Mat4;
var Vec3 = geom.Vec3;
var Quat = geom.Quat;

function Skeleton(bones, bonesAnimation) {
  this.bones = bones;
  this.bonesAnimation = bonesAnimation;
  this.init();
  this.update(-1);
}

Skeleton.prototype.init = function() {
  this.initAnimation();
  this.initBones();
}

Skeleton.prototype.initBones = function() {
  this.bones.forEach(function(bone) {
    bone.positionWorld = new Vec3();
    bone.localTransform = new Mat4();
    bone.localTransform.identity();
    bone.transform = new Mat4();
    bone.transform.identity();
    bone.localRotation = new Mat4();
    bone.localRotation.identity();
    bone.localPosition = new Mat4();
    bone.localPosition.identity();
    bone.invBindPose = new Mat4();
    bone.invBindPose.identity();
  });

  this.updateBones();

  this.bones.forEach(function(bone) {
    bone.bindPose = bone.transform.dup();
    bone.invBindPose = bone.transform.dup().invert();
  });
}

Skeleton.prototype.initAnimation = function() {
  if (!this.bonesAnimation) return;

  this.animationDuration = R.pipe(
    R.map(R.last),                  //take last keyframe for each bone
    R.map(R.prop('time')),          //get keyframe time
    R.max                           //find max keyframe time
  )(this.bonesAnimation);
}

Skeleton.prototype.update = function(time) {
  this.updateAnimation(time);
  this.updateBones();
}

Skeleton.prototype.updateAnimation = function(time) {
  if (!this.bonesAnimation) return;

  var animationTime = time % this.animationDuration;

  var boneFrames = this.bonesAnimation.map(function(boneFrames) {
    var prevFrame = null;
    var frame = null;
    for(var i=0; i<boneFrames.length; i++) {
      frame = boneFrames[i];
      if (frame.time >= animationTime) {
        break;
      }
      prevFrame = frame;
    }
    if (prevFrame) {
      var t = (animationTime - prevFrame.time)/(frame.time - prevFrame.time);
      return {
        position: prevFrame.position.dup().lerp(frame.position, t),
        rotation: prevFrame.rotation.dup().slerp(frame.rotation, t)
      }
    }
    else return frame;
  });

  if (animationTime >= 0) {
    fn.zip(this.bones, boneFrames).forEach(function(bonePair) {
      var bone = bonePair[0];
      var frame = bonePair[1];
      bone.motionPosition = frame.position;
      bone.motionRotation = frame.rotation;
    });
  }
  else {
    fn.zip(this.bones, boneFrames).forEach(function(bonePair) {
      var bone = bonePair[0];
      var frame = bonePair[1];
      bone.motionPosition = bone.position;
      bone.motionRotation = new Quat();
    });
  }
}

Skeleton.prototype.updateBones = function() {
  this.bones.forEach(function(bone) {
    bone.localRotation = bone.motionRotation ? bone.motionRotation.toMat4() : bone.rotation.toMat4();
    if (bone.parent) {
      bone.localPosition.identity();
      if (bone.motionPosition) {
        bone.localPosition.translate(bone.motionPosition.x, bone.motionPosition.y, bone.motionPosition.z);
      }
      else {
        bone.localPosition.translate(bone.position.x, bone.position.y, bone.position.z);
      }

      bone.localTransform = bone.localPosition.dup().mul(bone.localRotation);
      bone.transform = bone.parent.transform.dup().mul(bone.localTransform);
      bone.positionWorld.scale(0).transformMat4(bone.transform);
    }
    else {
      bone.localPosition.identity();
      bone.localPosition.translate(bone.position.x, bone.position.y, bone.position.z);
      bone.localTransform = bone.localPosition.dup().mul(bone.localRotation)
      bone.transform = bone.localTransform;
      bone.positionWorld.scale(0).transformMat4(bone.transform);
    }

    bone.boneMatrix = bone.transform.dup().mul(bone.invBindPose);
  })
}

Skeleton.prototype.applyToMesh = function(mesh) {
  this.bones.forEach(function(bone, i) {
    mesh.material.uniforms['boneMatrices['+i+']'] = bone.boneMatrix;
  })
}

module.exports = Skeleton;