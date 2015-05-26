var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');
var R = require('ramda');
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Geometry = geom.Geometry;

var Cube = gen.Cube;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var SolidColor = materials.SolidColor;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Platform = sys.Platform;

//-----------------------------------------------------------------------------

function makeCube(sx, sy, sz, nx, ny, nz) {
  sx = sx != null ? sx : 1;
  sy = sy != null ? sy : sx != null ? sx : 1;
  sz = sz != null ? sz : sx != null ? sx : 1;
  nx = nx || 1;
  ny = ny || 1;
  nz = nz || 1;

  var points = [];
  var faces = [];

  var vertexIndex = 0;

  function makePlane(u, v, w, su, sv, nu, nv, pw, flipu, flipv) {
    var vertShift = vertexIndex;
    for (var j=0; j<=nv; j++) {
      for (var i=0; i<=nu; i++) {
        vert = points[vertexIndex] = [];
        vert[u] = (-su / 2 + i * su / nu) * flipu;;
        vert[v] = (-sv / 2 + j * sv / nv) * flipv;
        vert[w] = pw;
        ++vertexIndex;
      }
    }
    for (var j=0; j<=nv-1; j++) {
      for (var i=0; i<=nu-1; i++) {
        var n = vertShift + j * (nu + 1) + i;
        faces.push([n, n + nu + 1, n + nu + 2, n + 1]);
      }
    }
  }

  makePlane(0, 1, 2, sx, sy, nx, ny, sz / 2, 1, -1);
  makePlane(0, 1, 2, sx, sy, nx, ny, -sz / 2, -1, -1);
  makePlane(2, 1, 0, sz, sy, nz, ny, -sx / 2, 1, -1);
  makePlane(2, 1, 0, sz, sy, nz, ny, sx / 2, -1, -1);
  makePlane(0, 2, 1, sx, sz, nx, nz, sy / 2, 1, 1);
  makePlane(0, 2, 1, sx, sz, nx, nz, -sy / 2, 1, -1);

  return {
    points: points,
    cells: faces
  }
}

//-----------------------------------------------------------------------------

function makeGeomEntity(g) {
  return [
    { id: '' },
    { type: 'attrib', name: 'position', values: g.points },
    { type: 'indices', name: 'faces', values: g.cells }
  ]
}

//-----------------------------------------------------------------------------

function copyArrayTo(src, dst) {
  for(var i=0; i<src.length; i++) {
    dst[i] = src[i];
  }
}

//-----------------------------------------------------------------------------

function updateAttribBuffer(gl, attrib) {
  if (!data || !data.length) return;

  if (!attrib.bufferHandle) {
    var data = R.flatten(attrib.values);
    var usage = attrib.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;

    attrib.bufferHandle = gl.createBuffer();
    if (!attrib.dataBuffer || attrib.dataBuffer.length != data.length) {
      attrib.dataBuffer = new Float32Array(data);
    }
    else {
      copyArrayTo(data, attrib.dataBuffer);
    }
  }
}

//-----------------------------------------------------------------------------

function updateGeometryBuffers(gl, g) {
  g.filter(R.where({ type: 'attrib' })).forEach(function(attrib) {
    if (attrib.dirty || !attrib.bufferHandle) {
      attrib.dirty = false;
      updateAttribBuffer(gl, attrib.buffer, attrib.values);
    }
  })
}

//-----------------------------------------------------------------------------

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: Platform.isBrowser ? true : false
  },
  init: function() {
    //var cube = new Cube();
    var cube = makeCube();
    var cubeGeom = makeGeomEntity(cube);
    updateGeometryBuffers(this.gl, cubeGeom);
    //cubeGeom.computeNormals();
    //this.mesh = new Mesh(cubeGeom, new SolidColor());

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Red);
    glu.enableDepthReadAndWrite(true);
    if (this.mesh) this.mesh.draw(this.camera);
  }
});
