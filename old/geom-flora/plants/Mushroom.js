define(function(require) {
  var pex = require('pex');

  var hem = pex.geom.hem;
  var Vec3 = pex.geom.Vec3;
  var Vec4 = pex.geom.Vec4;
  var ArrayUtils = pex.utils.ArrayUtils;
  var Time = pex.utils.Time;
  var ObjWriter = pex.utils.ObjWriter;
  var SolidColor = pex.materials.SolidColor;
  var Color = pex.color.Color;

  function Turtle(hem, face) {
    this.hem = hem;
    this.face = face;
    this.direction = face.getNormal().clone();
    var center = face.getCenter();
    var avgDist = 0;
    var vertices = face.getAllVertices();
    this.distances = vertices.map(function(v) {
      var dist = v.position.distance(center);
      avgDist += dist;
    });
    this.avgDist = avgDist / vertices.length;
    this.radiusScale = 1;

    if (this.direction.dot(new Vec3(0, 1, 0)) < 0) {
      this.face = null;
    }
  }

  Turtle.prototype.move = function(distance) {
    if (!this.face) return;
    this.hem
      .clearFaceSelection()
      .selectFace(this.face)
      //.extrude(distance, this.direction)
      .extrude(distance)
    ;
    var distances = this.distances;
    var center = this.face.getCenter();
    var radiusScale = this.radiusScale;
    var avgDist = this.avgDist;
    this.face.getAllVertices().forEach(function(v, i) {
      v.position.asSub(v.position, center).normalize().scale(avgDist * radiusScale).add(center);
    });
  }

  pex.sys.Window.create({
    settings: {
      width: 1280,
      height: 720,
      type: '3d',
      vsync: true,
      multisample: true,
      fullscreen: false,
      center: true
    },
    init: function() {
      var gl = pex.gl.Context.currentContext.gl;

      gl.clearColor(0, 0, 0, 1);
      gl.enable(gl.DEPTH_TEST);

      this.camera = new pex.scene.PerspectiveCamera(60, this.width/this.height);
      this.arcball = new pex.scene.Arcball(this, this.camera, 3);
      this.material = new pex.materials.Diffuse();
      this.material = new pex.materials.ShowNormals();
      this.selectionMaterial = new pex.materials.Diffuse({ ambientColor : Vec4.create(0.2, 0, 0, 1), diffuseColor : Vec4.create(1, 0, 0, 1) });

      this.framerate(30);

      this.saveModel = false;

      var self = this;
      this.on('keyDown', function(e) {
        switch(e.str) {
          case ' ': break;
          case 'e':
            this.hem.extrude(1);
            this.hem.toFlatGeometry(this.mesh.geometry);
            break;
        }
        switch(e.keyCode) {
          case 48:  //TAB
          this.hem.subdivide();
          this.hem.toFlatGeometry(this.mesh.geometry);
          break;
        }
      }.bind(this));

      this.on('leftMouseDown', function(e) {
        //this.hem.subdivide();
        //this.hem.toFlatGeometry(this.mesh.geometry);
      }.bind(this))

      this.hem = hem().fromGeometry(new pex.geom.gen.Cube(1, 1, 1));
      //this.hem = hem().fromGeometry(new pex.geom.gen.Sphere(0.5, 8, 8));
      //this.mesh = new pex.gl.Mesh(this.hem.toFlatGeometry(), this.material, { primitiveType : this.gl.LINES });
      this.mesh = new pex.gl.Mesh(this.hem.toFlatGeometry(), new SolidColor({color: Color.Black}));
      this.mesh.geometry.computeEdges();
      this.mesh.position.y = -0.5;
      //this.mesh.geometry.assureSize(32000);
      this.hem.selectRandomFaces().subdivide().selectRandomFaces(1000);
      this.hem.toFlatGeometry(this.mesh.geometry);
      var selectedFaces = this.hem.getSelectedFaces();

      this.turtles = selectedFaces.map(function(face) {
        return new Turtle(this.hem, face);
      }.bind(this));

      //this.selectionMesh = new pex.gl.Mesh(this.hem.toFlatGeometry(null, true), this.selectionMaterial);
      console.log('this.hem.faces.length', this.hem.faces.length);
    },
    totalLength: 0,
    draw: function() {
      //if (this.hem.vertices.length < 30000)
      if (this.totalLength < 1 && Time.frameNumber % 5 == 0) {
        var tmp = Vec3.create();
        this.turtles.forEach(function(turtle, i) {
          if (Time.seconds < 2) {
            turtle.move(0.1);
          }
          turtle.radiusScale = 0.1 + 0.6 * Math.random();
          turtle.move(0.1);
          turtle.move(0.1);
          turtle.move(0.1);
          turtle.radiusScale *= 1.5;
          turtle.move(0.1);
          turtle.radiusScale *= 1.5;
          turtle.move(0.1);
          turtle.radiusScale *= 1.5;
          turtle.move(0.1);
          turtle.radiusScale *= 0.8;
          turtle.move(0.05);
          turtle.radiusScale *= 0.8;
          turtle.move(0.05);
          turtle.radiusScale *= 0.8;
          turtle.move(-0.05);
          turtle.radiusScale *= 0.1;
          turtle.move(-0.5);
          //turtle.radiusScale *= 0.1;
          turtle.move(0.6);
          turtle.radiusScale *= 2;
          turtle.move(0.1);
          turtle.radiusScale *= 2;
          turtle.move(0.1);
          turtle.radiusScale *= 2;
          turtle.move(0.1);
        });
        this.hem.vertices.forEach(function(v) {
          if (v.position.y < 0) v.position.y = 0;
        })
        this.hem.subdivide();

        this.hem.toFlatGeometry(this.mesh.geometry);
        this.totalLength += 10.2;

        if (!this.writing && this.saveModel) {
          this.writing = true;
          ObjWriter.save(this.mesh.geometry, 'herb-'+Date.now()+'.obj', function() {
            process.exit();
          });
        }
      }


      var gl = pex.gl.Context.currentContext.gl;
      gl.clearColor(0, 0, 0, 1);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      if (this.mesh) {
        this.mesh.draw(this.camera);
        if (!this.meshWireframe && Time.seconds > 1) {
          this.meshWireframe = new pex.gl.Mesh(this.hem.toFlatGeometry(), new SolidColor({color: Color.White}), {useEdges:true, primitiveType : this.gl.LINES});
          this.meshWireframe.position.y = -0.5;
          this.meshWireframe.geometry.vertices.dirty = true;
        }
      }
      if (this.meshWireframe) this.meshWireframe.draw(this.camera);
      if (this.selectionMesh) this.selectionMesh.draw(this.camera);
    }
  });

})
