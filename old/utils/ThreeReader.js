var sys = require('pex-sys');
var geom = require('pex-geom');
var color = require('pex-color');
var fn = require('../utils/fn');
var Skeleton = require('../geom/Skeleton');
var SkeletonAnimation = require('../geom/SkeletonAnimation');

var IO = sys.IO;
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Quat = geom.Quat;
var Color = color.Color;
var Geometry = geom.Geometry;

function ThreeReader() {

}

ThreeReader.load = function(path, cb) {
  console.log('ThreeReader.load', path);
  IO.loadTextFile(path, function(dataStr) {
    var data = JSON.parse(dataStr);
    ThreeReader.parse(data, cb);
  });
}

//https://github.com/mrdoob/three.js/wiki/JSON-Model-format-3
ThreeReader.parse = function(json, cb) {

  function isBitSet(value, position) {
    return value & (1 << position);
  };

  var i, j;

  var offset, zLength;

  var type;
  var isQuad;
  var hasMaterial;
  var hasFaceUv, hasFaceVertexUv;
  var hasFaceNormal, hasFaceVertexNormal;
  var hasFaceColor, hasFaceVertexColor;

  var vertex, face;

  var faces = json.faces;
  var vertices = json.vertices;
  var normals = json.normals;
  var colors = json.colors;

  var nUvLayers = 0;

  var scope = {
    faceUvs: [],
    faceVertexUvs: [],
    vertices: [],
    faces: [],
    vertexNormals: [],
    materials: []
  }

  // disregard empty arrays
  for (i = 0; i < json.uvs.length; i++) {
    if (json.uvs[ i ].length) nUvLayers ++;
  }

  for (i = 0; i < nUvLayers; i++) {
    scope.faceUvs[ i ] = [];
    scope.faceVertexUvs[ i ] = [];
  }

  offset = 0;
  zLength = vertices.length;

  while (offset < zLength) {
    vertex = new Vec3();
    vertex.x = vertices[ offset ++ ];
    vertex.y = vertices[ offset ++ ];
    vertex.z = vertices[ offset ++ ];
    scope.vertices.push(vertex);
  }

  offset = 0;
  zLength = faces.length;

  while (offset < zLength) {

    type = faces[ offset ++ ];

    isQuad              = isBitSet(type, 0);
    hasMaterial         = isBitSet(type, 1);
    hasFaceUv           = isBitSet(type, 2);
    hasFaceVertexUv     = isBitSet(type, 3);
    hasFaceNormal       = isBitSet(type, 4);
    hasFaceVertexNormal = isBitSet(type, 5);
    hasFaceColor        = isBitSet(type, 6);
    hasFaceVertexColor  = isBitSet(type, 7);

    if (isQuad) {
      face = [];

      face[0] = faces[ offset ++ ];
      face[1] = faces[ offset ++ ];
      face[2] = faces[ offset ++ ];
      face[3] = faces[ offset ++ ];

      nVertices = 4;

    }
    else {
      face = [];

      face[0] = faces[ offset ++ ];
      face[1] = faces[ offset ++ ];
      face[2] = faces[ offset ++ ];

      nVertices = 3;
    }

    if (hasMaterial) {
      materialIndex = faces[ offset ++ ];
      face.materials = scope.materials[ materialIndex ];
    }

    if (hasFaceUv) {
      for (i = 0; i < nUvLayers; i++) {
        uvLayer = json.uvs[ i ];

        uvIndex = faces[ offset ++ ];

        u = uvLayer[ uvIndex * 2 ];
        v = uvLayer[ uvIndex * 2 + 1 ];

        scope.faceUvs[ i ].push([u, v]);
      }
    }

    if (hasFaceVertexUv) {
      for (i = 0; i < nUvLayers; i++) {
        uvLayer = json.uvs[ i ];

        uvs = [];

        for (j = 0; j < nVertices; j ++) {
          uvIndex = faces[ offset ++ ];

          u = uvLayer[ uvIndex * 2 ];
          v = uvLayer[ uvIndex * 2 + 1 ];

          uvs[ j ] = [u, v];
        }

        scope.faceVertexUvs[ i ].push(uvs);
      }
    }

    if (hasFaceNormal) {
      normalIndex = faces[ offset ++ ] * 3;

      normal = new Vec3();

      normal.x = normals[ normalIndex ++ ];
      normal.y = normals[ normalIndex ++ ];
      normal.z = normals[ normalIndex ];

      //face.normal = normal; //FIXME: not supported
    }

    if (hasFaceVertexNormal) {
      for (i = 0; i < nVertices; i++) {
        normalIndex = faces[ offset ++ ] * 3;

        normal = new Vec3();

        normal.x = normals[ normalIndex ++ ];
        normal.y = normals[ normalIndex ++ ];
        normal.z = normals[ normalIndex ];

        //face.vertexNormals.push(normal); //FIXME: not supported
      }
    }

    if (hasFaceColor) {
      color = new Color(faces[ offset ++ ]);
      face.color = color;
    }

    if (hasFaceVertexColor) {
      for (i = 0; i < nVertices; i++) {
        colorIndex = faces[ offset ++ ];

        color = new Color(colors[ colorIndex ]);
        //face.vertexColors.push(color); //FIXME: not supported
      }
    }
    scope.faces.push(face);
  }

  var bones = json.bones ? json.bones.map(function(bone, boneIndex) {
    var b = {
      position: new Vec3(bone.pos[0], bone.pos[1], bone.pos[2]),
      rotation: new Quat(bone.rotq[0], bone.rotq[1], bone.rotq[2], bone.rotq[3]),
      parent: bone.parent
    };
    return b;
  }) : null;

  if (bones) bones.forEach(function(bone) {
    bone.parent = bones[bone.parent];
  });


  var animationData = json.animation.hierarchy ? json.animation.hierarchy.map(function(boneAnim, boneIndex) {
    var prevRot = null;
    var prevPos = null;
    return boneAnim.keys.map(function(keyframe) {
      var pos = keyframe.pos ? new Vec3(keyframe.pos[0], keyframe.pos[1], keyframe.pos[2]) : null;
      var rot = keyframe.rot ? new Quat(keyframe.rot[0], keyframe.rot[1], keyframe.rot[2], keyframe.rot[3]) : null;
      var frame = {
        time: keyframe.time,
        position: pos || prevPos,
        rotation: rot || prevRot
      };
      prevPos = pos || prevPos;
      prevRot = rot || prevRot;
      return frame;
    })
  }) : null;

  var morphTargets = (json.morphTargets.length > 0) ? json.morphTargets.map(function(morphTarget) {
    var vertices = [];
    var vLen = morphTarget.vertices.length;
    for(var i=0; i<vLen; i+=3) {
      vertices.push(new Vec3(morphTarget.vertices[i], morphTarget.vertices[i+1], morphTarget.vertices[i+2]));
    }
    return {
      name: morphTarget.name,
      vertices: vertices
    };
  }) : null;


  //exported weights don't necessarily add to 1, so we need to normalize them
  //we assume to 2 bones per vertex
  json.skinWeights = fn.flatten(fn.partition(json.skinWeights, 2).map(function(weights) {
    var sum = weights[0] + weights[1];
    return [weights[0]/sum, weights[1]/sum];
  }))


  var texCoords = null;
  if (scope.faceVertexUvs.length > 0) {
    texCoords = [];
    for(var i=0; i<scope.faces.length; i++) {
      var face = scope.faces[i];
      var uvs = scope.faceVertexUvs[0][i];
      for(var j=0; j<face.length; j++) {
        texCoords[face[j]] = new Vec2(uvs[j][0], uvs[j][1]);
      }
    }
  }

  var g = new Geometry({ vertices: scope.vertices, faces: scope.faces, texCoords: texCoords });
  g.computeNormals();

  var skeleton = bones ? new Skeleton(bones) : null;
  var skeletonAnimation = animationData ? new SkeletonAnimation(skeleton, animationData, json.skinIndices, json.skinWeights) : null;

  cb(g, skeleton, skeletonAnimation, morphTargets, json, scope);
}

module.exports = ThreeReader;