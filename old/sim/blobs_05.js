var pex = pex || require('./lib/pex');

var Vec3 = pex.geom.Vec3;
var Time = pex.utils.Time;
var Platform = pex.sys.Platform;
var MathUtils = pex.utils.MathUtils;
var Geometry = pex.geom.Geometry;
var Face3 = pex.geom.Face3;
var Mesh = pex.gl.Mesh;
var Color = pex.color.Color;
var Texture2D = pex.gl.Texture2D;
var SolidColor = pex.materials.SolidColor;
var ShowColors = pex.materials.ShowColors;
var sin = Math.sin;
var cos = Math.cos;
var abs = Math.abs;
var random = Math.random;
var floor = Math.floor;
var map = MathUtils.map;
var randomFloat = MathUtils.randomFloat;
var TWOPI = 2 * Math.PI;

pex.require(['lib/voronoi', 'blob_05Material', ''], function(Voronoi, Blob_05Material, MovieRecorder) {
  pex.sys.Window.create({
    settings: {
      width: 1280,
      height: 720,
      type: '3d',
      vsync: false,
      multisample: true,
      fullscreen: Platform.isBrowser,
      center: true
    },
    spreadRadius: 5,
    numBlobs: 200,
    numPointsPerBlob: 32,
    blobSize: 0.15,
    wobbleSize: 0.001,
    init: function() {
      this.camera = new pex.scene.PerspectiveCamera(60, this.width/this.height);
      this.arcball = new pex.scene.Arcball(this, this.camera, 5);
      this.framerate(30);

      Time.verbose = true;

      this.makeBackground();
      this.makeBlobs();

      //this.recorder = new MovieRecorder('frames');
      //this.recorder.start();
    },
    makeBackground: function() {
      var vertices = [];
      var w = 16;
      var h = 2;
      for(var i=0; i<100; i++) {
        vertices.push({ x : Math.random() * w, y : Math.random() * h });
      }
      var polygons = Voronoi.tesselate(vertices, w, h);
      polygons = polygons.map(function(vertices) {
        return vertices.map(function(v) {
          return [
            new Vec3(v[0].x - w/2, v[0].y - h/2, 0),
            new Vec3(v[1].x - w/2, v[1].y - h/2, 0)
          ];
        })
      });

      var geom = new Geometry({vertices:true, faces:true, colors:true});
      var vertexIndex = 0;
      for(var i=0; i<polygons.length; i++) {
        var polygonVertices = polygons[i];
        var center = new Vec3(0, 0, 0);
        polygonVertices.forEach(function(v) {
          center.add(v[0]);
        })
        center.scale(1/polygonVertices.length);

        polygonVertices.forEach(function(v) {
          var c = new Color(0.35, (0.5 + 0.5*Math.random()), 0.5, 1.0);
          var c1 = new Color(0.35, c.r, 0.5, 1.0);
          var c2 = new Color(0.35, c.r, 0.5, 1.0);
          geom.vertices.push(center);
          geom.vertices.push(v[0]);
          geom.vertices.push(v[1]);
          geom.colors.push(c);
          geom.colors.push(c1);
          geom.colors.push(c2);
          geom.faces.push(new Face3(vertexIndex, vertexIndex+1, vertexIndex+2));
          vertexIndex += 3;
        })
      }

      this.bgMesh = new Mesh(geom, new ShowColors())
    },
    makeBlobs: function() {
      var geom = new Geometry({vertices:true, colors: true, normals:true, faces:true});
      var points = geom.vertices;
      var normals = geom.normals;
      var colors = geom.colors;
      var faces = geom.faces;
      var n = this.numPointsPerBlob;
      var offsets = [];
      for(var i=0; i<this.numBlobs; i++) {
        var center = new Vec3(randomFloat(-8, 8), randomFloat(-1, 1), randomFloat(-1, 1));
        center.y *= 0.5;
        var offset = center.clone();
        offset.originalY = offset.y;
        offsets.push(offset);
        var pointOffset = points.length;
        points.push(center);
        var niter = floor(3 * random());
        var depth = map(center.z, -1, 1, 1, 0);
        var c = new Color(map(center.x, -8, 8, 0, 1), map(center.y, -1, 1, 0, 1), 0, depth);
        colors.push(c);
        normals.push(new Vec3());
        for(var j=0; j<this.numPointsPerBlob; j++) {
          if (j < this.numPointsPerBlob) {
            var p = center.clone();
            var t = j/(this.numPointsPerBlob-1);
            var r = this.blobSize; 
            r *= 1 + 0.2 * sin(t * TWOPI * (2 + niter));
            p.x += r * cos(t * TWOPI);
            p.y += r * sin(t * TWOPI);
            p.z += 0;
            points.push(p);
            colors.push(c);
            normals.push(new Vec3());
          }
          if (j < this.numPointsPerBlob - 2)
            faces.push(new Face3(i*(n+1), i*(n+1)+j+1, i*(n+1)+j+2));
          else if (j < this.numPointsPerBlob - 1)
            faces.push(new Face3(i*(n+1), i*(n+1)+j+1, i*(n+1)+1));
        }
      }

      material = new Blob_05Material();

      this.blobsMesh = new Mesh(geom, material);
      this.offsets = offsets;
    },
    update: function() {
      var vertices = this.blobsMesh.geometry.vertices;
      var normals = this.blobsMesh.geometry.normals;
      var t = Time.seconds
      for(var i=0; i<this.offsets.length; i++) {
        this.offsets[i].x += Time.delta / 2;
        this.offsets[i].y = this.offsets[i].originalY + 0.2 * Math.sin(2*this.offsets[i].z + 2*this.offsets[i].x + this.offsets[i].originalY);
        if (this.offsets[i].x > 8) {
          this.offsets[i].x = -8;
        }
      }
      for(var i=0; i<vertices.length; i++) {
        var blobIndex = floor(i / (this.numPointsPerBlob + 1));
        vertices[i].x += this.wobbleSize * sin(t * 5 + i/2);
        vertices[i].y += this.wobbleSize * cos(t * 5);
        vertices[i].z += this.wobbleSize * sin(t * 5);
        normals[i] = this.offsets[blobIndex];
      }
      vertices.dirty = true;
      normals.dirty = true;
    },
    draw: function() {
      //Time.delta = 1/24;
      this.update();

      var gl = pex.gl.Context.currentContext.gl;
      gl.clearColor(0.5, 0.8, 0.5, 1);
      gl.lineWidth(2.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      gl.depthMask(0);
      this.bgMesh.draw(this.camera);
      gl.depthMask(1);

      gl.enable(gl.BLEND);
      //gl.disable(gl.DEPTH_TEST);
      //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      //gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
      gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE );
      this.blobsMesh.draw(this.camera);
      gl.disable(gl.BLEND);

      //this.recorder.capture();
    }
  });
})

