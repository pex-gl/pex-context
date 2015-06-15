//similar packages
//https://github.com/hughsk/mesh-normals

function computeNormals = function(vertices, faces) {
  if (!this.faces) {
    throw 'Geometry[2]omputeSmoothNormals no faces found';
  }
  if (!this.normals) {
    this.addAttrib('normals', 'normal', null, false);
  }

  if (this.normals.length > this.vertices.length) {
    this.normals.length = this.vertices.length;
  }
  else {
    while (this.normals.length < this.vertices.length) {
      this.normals.push(new Vec3(0, 0, 0));
    }
  }


  var vertices = this.vertices;
  var faces = this.faces;
  var normals = this.normals;

  var count = [];
  for(var i=0; i<vertices.length; i++) {
    count[i] = 0;
  }

  var ab = new Vec3();
  var ac = new Vec3();
  var n = new Vec3();

  for(var fi=0; fi<faces.length; fi++) {
    var f = faces[fi];
    var a = vertices[f[0]];
    var b = vertices[f[1]];
    var c = vertices[f[2]];
    ab.asSub(b, a).normalize();
    ac.asSub(c, a).normalize();
    n.asCross(ab, ac);
    for(var i=0; i<f.length; i++) {
      normals[f[i]].add(n);
      count[f[i]]++;
    }
  }

  for(var i=0; i<normals.length; i++) {
    normals[i].normalize();
  }
  this.normals.dirty = true;
}

module.exports = computeNormals;
