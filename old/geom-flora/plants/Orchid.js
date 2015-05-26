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
  }

  Turtle.prototype.move = function(distance) {
    this.hem
      .clearFaceSelection()
      .selectFace(this.face)
      .extrude(distance, this.direction)
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
      width: 1024,
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
      this.arcball = new pex.scene.Arcball(this, this.camera, 5);
      this.material = new pex.materials.Diffuse();
      this.material = new pex.materials.ShowNormals();
      this.selectionMaterial = new pex.materials.Diffuse({ ambientColor : Vec4.create(0.2, 0, 0, 1), diffuseColor : Vec4.create(1, 0, 0, 1) });

      this.framerate(30);

      this.saveModel = false;

      var self = this;
      this.on('keyDown', function(e) {
        switch(e.str) {
          case ' ': break;
        }
        switch(e.keyCode) {
          case 48:  //TAB
          this.hem.subdivide();
          this.hem.toFlatGeometry(this.mesh.geometry);
          break;
        }
      }.bind(this));

      this.on('leftMouseUp', function(e) {
        /*
        this.totalLength = 0;
        this.hem = hem().fromGeometry(new pex.geom.gen.Sphere(0.5, 5, 5));
        //this.mesh = new pex.gl.Mesh(this.hem.toFlatGeometry(), this.material, { primitiveType : this.gl.LINES });
        this.mesh = new pex.gl.Mesh(this.hem.toFlatGeometry(), this.material);
        //this.mesh.geometry.assureSize(32000);
        this.hem.selectRandomFaces(10);
        var selectedFaces = this.hem.getSelectedFaces();

        this.turtles = selectedFaces.map(function(face) {
          return new Turtle(this.hem, face);
        }.bind(this));
        */
      }.bind(this))

      //this.hem = hem().fromGeometry(new pex.geom.gen.Cube(1));
      this.hem = hem().fromGeometry(new pex.geom.gen.Sphere(0.5, 5, 5));
      //this.mesh = new pex.gl.Mesh(this.hem.toFlatGeometry(), this.material, { primitiveType : this.gl.LINES });
      //this.mesh = new pex.gl.Mesh(this.hem.toFlatGeometry(), this.material);
      this.mesh = new pex.gl.Mesh(this.hem.toFlatGeometry(), new SolidColor({color: Color.Black}));
      this.mesh.geometry.computeEdges();
      //this.meshWireframe = new pex.gl.Mesh(this.mesh.geometry, new SolidColor({color: Color.White}), {useEdges:true, primitiveType : this.gl.LINES});
      //this.mesh.geometry.assureSize(32000);
      this.hem.selectRandomFaces(10);
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
      if (this.totalLength < 3) {
        console.log(this.hem.faces.length);
        var tmp = Vec3.create();
        this.turtles.forEach(function(turtle) {
          turtle.radiusScale = 1 + 0.9 * Math.sin(Time.seconds * 4);
          //turtle.direction[1] += 0.1;
          //turtle.direction[0] -= Math.sin(Time.seconds * 3);

          //ugly!
          //Vec3.scale(tmp, turtle.face.getCenter(), 0.1);
          //Vec3.add(turtle.direction, turtle.direction, tmp);
          //Vec3.normalize(turtle.direction, turtle.direction);

          //better?
          //turtle.direction.set3(turtle.face.getCenter()).scale(0.1)
          turtle.move(0.1);
        });
        this.hem.toFlatGeometry(this.mesh.geometry);
      }
      else {
        if (!this.writing && this.saveModel) {
          this.writing = true;
          //ObjWriter.save(this.mesh.geometry, 'orchid-'+Date.now()+'.obj', function() {
          //  process.exit();
          //});
        }
      }
      this.totalLength += 0.1;


      var gl = pex.gl.Context.currentContext.gl;
      gl.clearColor(0, 0, 0, 1);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      if (this.mesh) {
        this.mesh.draw(this.camera);
        if (!this.meshWireframe && Time.seconds > 2) {
          this.meshWireframe = new pex.gl.Mesh(this.hem.toFlatGeometry(), new SolidColor({color: Color.White}), {useEdges:true, primitiveType : this.gl.LINES});
          this.meshWireframe.geometry.vertices.dirty = true;
        }
      }
      if (this.meshWireframe) this.meshWireframe.draw(this.camera);
      if (this.selectionMesh) this.selectionMesh.draw(this.camera);
    }
  })
});