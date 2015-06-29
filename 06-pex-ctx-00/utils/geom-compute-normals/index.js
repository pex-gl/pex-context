//similar packages
//https://github.com/hughsk/mesh-normals

var Vec3 = require('../../math/Vec3');

function computeNormals(geometry) {
    var vertices = geometry.positions;
    var faces = geometry.cells;
    var normals = [];

    var count = [];
    for(var i=0; i<vertices.length; i++) {
        count[i] = 0;
    }

    var ab = [0, 0, 0];
    var ac = [0, 0, 0];
    var n = [0, 0, 0];

    for(var fi=0; fi<faces.length; fi++) {
        var f = faces[fi];
        var a = vertices[f[0]];
        var b = vertices[f[1]];
        var c = vertices[f[2]];
        Vec3.normalize(Vec3.sub(Vec3.set(ab, b), a));
        Vec3.normalize(Vec3.sub(Vec3.set(ac, c), a));
        Vec3.normalize(Vec3.cross(Vec3.set(n, ab), ac));
        for(var i=0; i<f.length; i++) {
            if (!normals[f[i]]) {
                normals[f[i]] = [0, 0, 0];
            }
            Vec3.add(normals[f[i]], n);
            count[f[i]]++;
        }
    }

    for(var i=0; i<normals.length; i++) {
        Vec3.normalize(normals[i])
    }
    return normals
}

module.exports = computeNormals;
