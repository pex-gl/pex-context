var sh = require('sh');

var sys = require('pex-sys');
var glu = require('pex-glu');
var color = require('pex-color');
var gen = require('pex-gen');
var geom = require('pex-geom');
var gui = require('pex-gui');
var helpers = require('pex-helpers');
var materials = require('pex-materials');
var GeometrySubdivide = require('./Geometry.Subdivide');
var TexturedTriPlanar = require('./materials/TexturedTriPlanar');
var ObjReader = require('./utils/ObjReader');
var fs = require('fs');
var fx = require('pex-fx');
var pbr = require('./fx/PBR');
var SSAO = require('./fx/SSAO');

var Window = sys.Window;
var Cube = gen.Cube;
var Sphere = gen.Sphere;
var Box = gen.Box;
var Loft = gen.Loft;
var Mesh = glu.Mesh;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var Vec3 = geom.Vec3;
var Vec2 = geom.Vec2;
var Path = geom.Path;
var Spline3D = geom.Spline3D;
var Time = sys.Time;
var GUI = gui.GUI;
var EdgeHelper = helpers.EdgeHelper;
var VertexHelper = helpers.VertexHelper;
var FaceNormalHelper = helpers.FaceNormalHelper;
var LineBuilder = gen.LineBuilder;
var ShowColors = materials.ShowColors;
var ShowNormals = materials.ShowNormals;
var ShowPosition = materials.ShowPosition;
var FlatToonShading = materials.FlatToonShading;
var MatCap = materials.MatCap;
var Diffuse = materials.Diffuse;
var Textured = materials.Textured;
var ShowDepth = materials.ShowDepth;
var Platform = sys.Platform;
var Texture2D = glu.Texture2D;
var TextureCube = glu.TextureCube;
var SolidColor = materials.SolidColor;

var points = [
  { x: 9.18454765366783e-17, y: 1.5, z: 0 },
  { x: 0.3882285676537811, y: 1.4488887394336025, z: 0 },
  { x: 0.7499999999999998, y: 1.299038105676658, z: 0.2 },
  { x: 1.0606601717798214, y: 1.0606601717798212, z: 0 },
  { x: 1.299038105676658, y: 0.75, z: 0 },
  { x: 1.4488887394336025, y: 0.388228567653781, z: 0 },
  { x: 1.5, y: 0, z: 0 },
  { x: 1.4488887394336025, y: -0.388228567653781, z: 0 },
  { x: 1.338550514724323, y: -0.7728124999999998, z: 0 },
  { x: 1.1689358976490114, y: -1.1689358976490112, z: 0.2 },
  { x: 0.7778124999999998, y: -1.3472107687621675, z: 0.3 },
  { x: 0.39874309136107133, y: -1.4881294761265955, z: 0.5 },
  { x: 1.0837766231328038e-16, y: -1.77, z: 0 },
  { x: -0.4100664245843065, y: -1.5303887310267428, z: 0.2 },
  { x: -0.7824999999999996, y: -1.3553297569226466, z: 0.1 },
  { x: -1.1702617228637355, y: -1.1702617228637369, z: -0.1 },
  { x: -2.1179733781303174, y: -1.222812500000001, z: 0 },
  { x: -1.5726479859268894, y: -0.42138975780754134, z: 0 },
  { x: -1.54125, y: -1.887424542828739e-16, z: 0 },
  { x: -1.4669998486765228, y: 0.3930814247494528, z: -0.3 },
  { x: -1.3298902606864786, y: 0.7678125000000002, z: -0.5 },
  { x: -1.0606601717798214, y: 1.0606601717798212, z: -0.3 },
  { x: -0.7500000000000007, y: 1.2990381056766576, z: 0 },
  { x: -0.3882285676537823, y: 1.448888739433602, z: 0 }
];

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    highdpi: Platform.isBrowser ? 2 : 1,
    fullscreen: Platform.isBrowser
  },
  init: function() {
    this.initGUI();
    this.updateGeometry();
    this.updateMaterials();
    this.updateScene();
  },
  params: {
    //LIGH
    lightPosMode: 1,
    lightPos: new Vec3(0, 0, 0),
    //MATERIAL
    baseColor: new Color(0.5, 0.5, 0.1, 1.0),
    metallic: 0,
    roughness: 0,
    exposure: 1,
    textureScale: 1,
    //SHOW
    showVertices: false,
    showEdges: false,
    showFaces: true,
    showFaceNormals: false,
    showPath: false,
    showLoftDebug: false,
    showLight: true,
    //GEOM
    loftWidth: 1,
    loftSegments: 4,
    loftSteps: 100,
    makeCircle: false,
    makeSphere: true,
    makeClosedPath: true,
    extrude: true,
    subdivide: true,
    flatFaces: false,
    //FX
    showNormals: false,
    showDepth: false,
    showAlbedo: false,
    showSSAO: false,
    showPBR: true,
    showTonemap: false,
    showGamma: false,
    showFinal: false
  },
  updateMaterials: function() {
    this.irradianceMap = TextureCube.loadLod('assets/cubemaps/uffizi-large-cross-irradiance_LOD_####.png', ['c00', 'c01', 'c02', 'c03', 'c04', 'c05'], ['m00']);
    this.reflectionMap = TextureCube.loadLod('assets/cubemaps/more/uffizi_LOD_####.png', ['c00', 'c01', 'c02', 'c03', 'c04', 'c05'], ['m00','m01','m02','m03','m04','m05','m06','m07']);
    this.showNormals = new ShowNormals();
    this.showDepth = new ShowDepth();
    this.showPosition = new ShowPosition();
    this.solidColor = new SolidColor();
    this.encodingColor = new SolidColor();
    this.flatToonShading = new MatCap({ texture: Texture2D.load('assets/textures/matcap.jpg')})
    this.flatToonShading = new FlatToonShading({ colorBands: Texture2D.load('assets/textures/palette_green.png')})
    this.textured1 = new TexturedTriPlanar({ texture: Texture2D.load('assets/textures/pattern_6.jpg', { repeat: true }) })
    this.textured2 = new TexturedTriPlanar({ texture: Texture2D.load('assets/textures/pattern_roughness.jpg', { repeat: true }) })
    this.lightMaterial = new SolidColor({ color: Color.Yellow });
  },
  updateScene: function() {
    if (!this.camera) this.camera = new PerspectiveCamera(60, this.width / this.height, 1.5, 15);
    if (!this.arcball) {
      this.arcball = new Arcball(this, this.camera, 4);
    }
    if (!this.mesh) {
      this.meshes = [];

      this.mesh = new Mesh(this.geometry, this.meshMaterial);
      this.mesh.position.y = 0.5
      this.mesh.rotation.setAxisAngle(new Vec3(1, 0, 0), 90);
      this.mesh.color = Color.fromHSL(0.05, 0.95, 0.4, 1.0);
      this.mesh.albedo = this.solidColor;

      this.mesh2 = new Mesh(this.geometry2, this.meshMaterial);
      //this.mesh2.position.y = -0.5
      this.mesh2.rotation.setAxisAngle(new Vec3(1, 0, 0), -40);
      //this.mesh2.color = Color.fromHSL(0.4, 0.5, 0.55, 0.07);
      this.mesh2.color = Color.fromHSL(0.0, 0.0, 0.85, 1.0);
      this.mesh2.albedo = this.solidColor;

      this.mesh3 = new Mesh(this.geometry3, this.meshMaterial);
      this.mesh3.position.x = 0.5;
      this.mesh3.color = Color.fromHSL(0.7, 0.0, 1, 1.0);
      this.mesh3.albedo = this.solidColor;

      this.mesh4 = new Mesh(this.geometry4, this.meshMaterial);
      this.mesh4.position.x = -0.5;
      this.mesh4.color = Color.fromHSL(0.9, 0.95, 0, 1.0);
      this.mesh4.albedo = this.solidColor;

      this.mesh5 = new Mesh(this.geometry5, this.meshMaterial);
      this.mesh5.color = Color.fromHSL(0.6, 0.9, 0.9, 1.0);
      this.mesh5.albedo = this.solidColor;

      this.mesh6 = new Mesh(this.geometry6, this.meshMaterial);
      this.mesh6.position.y = 1;
      this.mesh6.color = Color.fromHSL(0.1, 0.9, 0.9, 1.0);
      this.mesh6.albedo = this.solidColor;

      //this.meshes.push(this.mesh);
      this.meshes.push(this.mesh2);
      //this.meshes.push(this.mesh3);
      //this.meshes.push(this.mesh4);
      this.meshes.push(this.mesh5);
      //this.meshes.push(this.mesh6);
    }

    if (!this.lightMesh) {
      this.lightMesh = new Mesh(new Sphere(0.2), this.lightMaterial);
    }

  },
  updateGeometry: function() {
    var shapePath = new Path([
      new Vec3(-0.1*this.params.loftWidth, -0.4, 0),
      new Vec3( 0.1*this.params.loftWidth, -0.4, 0),
      new Vec3( 0.1*this.params.loftWidth,  0.4, 0),
      new Vec3(-0.1*this.params.loftWidth,  0.4, 0)
    ]);
    var splinePoints = points;
    if (this.params.makeCircle) {
      splinePoints = points.map(function(p, pi) {
        return new Vec3(
          Math.sin(Math.PI * 2 * pi / points.length),
          Math.cos(Math.PI * 2 * pi / points.length),
          0
        );
      });
    }
    var spline = new Spline3D(splinePoints, this.params.makeClosedPath);
    var loft = new Loft(spline, {
      shapePath: shapePath,
      caps: true,
      numSteps: 40,//this.params.loftSteps,
      numSegments: this.params.loftSegments
    });
    this.geometry = loft;

    var facesToExtrude = this.geometry.faces.map(function(f, i) { return i;}).filter(function() { return Math.random() > 0.8; });
    if (this.params.extrude) this.geometry2 = this.geometry.extrude(0.042, facesToExtrude);
    if (this.params.subdivide) this.geometry2 = this.geometry2.catmullClark();//.catmullClark();
    if (this.params.flatFaces)
      this.geometry2 = this.geometry2.toFlatGeometry();

    //this.geometry = this.geometry.dooSabin(0.03).catmullClark()//.toFlatGeometry();
    this.geometry.computeNormals();
    this.geometry2.computeNormals();

    this.geometry.addAttrib('texCoords', 'texCoord', this.geometry.vertices.map(function() { return new Vec2(0.0, 0.0); }));
    this.geometry2.addAttrib('texCoords', 'texCoord', this.geometry2.vertices.map(function() { return new Vec2(0.0, 0.0); }));

    if (this.mesh) {
      this.mesh.geometry.vertices.length = 0;
      this.mesh.geometry.normals.length = 0;
      this.mesh.geometry.faces.length = 0;
      this.mesh.geometry.texCoords.length = 0;
      this.geometry.vertices.forEach(function(v) {
        this.mesh.geometry.vertices.push(v);
      }.bind(this));
      this.geometry.normals.forEach(function(n) {
        this.mesh.geometry.normals.push(n);
      }.bind(this));
      this.geometry.faces.forEach(function(f) {
        this.mesh.geometry.faces.push(f);
      }.bind(this));
       this.geometry.texCoords.forEach(function(t) {
        this.mesh.geometry.texCoords.push(t);
      }.bind(this));
      this.mesh.geometry.vertices.dirty = true;
      this.mesh.geometry.normals.dirty = true;
      this.mesh.geometry.faces.dirty = true;
      this.mesh.geometry.texCoords.dirty = true;
    }

    if (this.meshEdgeHelper) { this.meshEdgeHelper.dispose(); }
    if (this.meshVertexHelper) { this.meshVertexHelper.dispose(); }
    if (this.meshFaceNormalHelper) { this.meshFaceNormalHelper.dispose(); }
    if (this.pathHelper) { this.pathHelper.dispose(); }
    if (this.loftDebug) { this.loftDebug.dispose(); }

    this.meshEdgeHelper = new EdgeHelper(this.geometry, new Color(0.5, 0.0, 0.0, 0.1));
    this.meshEdgeHelper.rotation.setAxisAngle(new Vec3(1, 0, 0), 90);
    this.meshVertexHelper = new VertexHelper(this.geometry);
    this.meshVertexHelper.rotation.setAxisAngle(new Vec3(1, 0, 0), 90);
    this.meshFaceNormalHelper = new FaceNormalHelper(this.geometry);
    this.meshFaceNormalHelper.rotation.setAxisAngle(new Vec3(1, 0, 0), 90);
    var splineGeom = new LineBuilder().addPath(spline);
    this.pathVertexHelper = new VertexHelper(splineGeom, Color.Green);
    this.pathVertexHelper.rotation.setAxisAngle(new Vec3(1, 0, 0), 90);
    var splineGeom2 = new LineBuilder().addPath(spline, Color.Green, 100);
    this.pathEdgeHelper = new EdgeHelper(splineGeom2, Color.Green);
    this.pathEdgeHelper.rotation.setAxisAngle(new Vec3(1, 0, 0), 90);
    this.loftDebug = new Mesh(loft.toDebugLines(), new ShowColors(), { lines: true });
    this.loftDebug.rotation.setAxisAngle(new Vec3(1, 0, 0), 90);

    ObjReader.load('assets/models/blob.obj', function(g) {
      this.geometry3 = g;
    }.bind(this));

    this.geometry4 = new Sphere();
    this.geometry5 = new Cube(10);
    this.geometry5.normals.forEach(function(n) { n.scale(-1); });
    this.geometry6 = new Cube();
  },
  initGUI: function() {
    this.gui = new GUI(this);
    this.gui.addHeader('MATERIAL');
    this.gui.addParam('Base color', this.params, 'baseColor', {
      palette: 'assets/palette_nike.png'
    });
    this.gui.addParam('metallic', this.params, 'metallic');
    this.gui.addParam('roughness', this.params, 'roughness');
    this.gui.addParam('exposure', this.params, 'exposure', { min: 0.5, max: 10});
    this.gui.addParam('scale', this.params, 'textureScale', { min: 0.05, max: 3});

    this.gui.addHeader('Fx')
    this.gui.addParam('Normals', this.params, 'showNormals');
    this.gui.addParam('Depth', this.params, 'showDepth');
    this.gui.addParam('Albedo', this.params, 'showAlbedo');
    this.gui.addParam('SSAO', this.params, 'showSSAO');
    this.gui.addParam('PBR', this.params, 'showPBR');
    this.gui.addParam('Tonemap', this.params, 'showTonemap');
    this.gui.addParam('Gamma', this.params, 'showGamma');
    this.gui.addParam('Final', this.params, 'showFinal');
    this.gui.addHeader('Debug');

    this.on('keyDown', function(e) {
      if (e.str == 'S') {
        this.gui.save('Settings2.json');
      }
    }.bind(this));

    this.gui.load('Settings2.json', function() {
      this.updateGeometry();
      this.updateMaterials()
    }.bind(this));
  },
  drawNormals: function() {
    glu.clearColorAndDepth(Color.Black);
    this.meshes.forEach(function(mesh) {
      mesh.setMaterial(this.showNormals);
      mesh.draw(this.camera);
    }.bind(this));
    this.lightMesh.draw(this.camera);
  },
  drawDepth: function() {
    glu.clearColorAndDepth(Color.Black);

    this.showDepth.uniforms.near = this.camera.getNear();
    this.showDepth.uniforms.far = this.camera.getFar();

    this.meshes.forEach(function(mesh) {
      mesh.setMaterial(this.showDepth);
      mesh.draw(this.camera);
    }.bind(this));
    this.lightMesh.draw(this.camera);
  },
  drawAlbedo: function() {
    glu.clearColorAndDepth(Color.Black);

    this.meshes.forEach(function(mesh) {
      this.solidColor.uniforms.color = mesh.color;
      mesh.setMaterial(mesh.albedo);
      mesh.setMaterial(this.textured1);
      if (mesh == this.mesh5) {
        this.solidColor.uniforms.color.r = 0.0;
        this.solidColor.uniforms.color.g = 0.0;
        this.solidColor.uniforms.color.b = 0.0;
        this.solidColor.uniforms.color.a = 1.0;
        mesh.setMaterial(this.solidColor);
      }
      this.textured1.uniforms.scale = this.params.textureScale;
      mesh.draw(this.camera);
    }.bind(this));
    this.lightMesh.draw(this.camera);
  },
  drawSpecular: function() {
    glu.clearColorAndDepth(Color.Black);
    this.meshes.forEach(function(mesh) {
      this.encodingColor.uniforms.color.r = this.params.metallic;
      this.encodingColor.uniforms.color.g = this.params.roughness;
      this.encodingColor.uniforms.color.b = 0;
      this.encodingColor.uniforms.color.a = 0;
      this.textured2.uniforms.scale = this.params.textureScale;
      mesh.setMaterial(this.encodingColor);
      //mesh.setMaterial(this.textured2);
      if (mesh == this.mesh5) {
        this.solidColor.uniforms.color.r = 1;
        this.solidColor.uniforms.color.g = 0;
        this.solidColor.uniforms.color.b = -1;
        this.solidColor.uniforms.color.a = 0;
        mesh.setMaterial(this.solidColor);
      }
      mesh.draw(this.camera);
    }.bind(this));
    this.lightMesh.draw(this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.DarkGrey);
    glu.enableDepthReadAndWrite(true);

    this.params.lightPos.set(2, 2, 2);
    this.lightMesh.position.setVec3(this.params.lightPos);

    this.meshes[0].color.r = this.params.baseColor.r;
    this.meshes[0].color.g = this.params.baseColor.g;
    this.meshes[0].color.b = this.params.baseColor.b;

    var root = fx();
    var normals = root.render({ drawFunc: this.drawNormals.bind(this), depth: true, bpp: 32 });
    var depth = root.render({ drawFunc: this.drawDepth.bind(this), depth: true, bpp: 32 });
    var albedo = root.render({ drawFunc: this.drawAlbedo.bind(this), depth: true, bpp: 32 });
    var specular = root.render({ drawFunc: this.drawSpecular.bind(this), depth: true, bpp: 32 });
    var ssao = root.ssao({ depthMap: depth, camera: this.camera, width: this.width, height: this.height, bpp: 32 }).blur3({ bbp: 32 });
    var pbr = root.pbr({
        baseColor: this.params.baseColor,
        normalMap: normals, depthMap: depth, albedoMap: albedo, specularMap: specular, reflectionMap: this.reflectionMap,
        camera: this.camera, lightPos: this.params.lightPos,
        occlusionMap: ssao, bpp: 32
    });
    var tonemap = pbr.tonemapReinhard({ exposure: this.params.exposure, bpp: 32 });
    var gamma = tonemap.correctGamma({ bpp: 32 });

    var finalColor = gamma.fxaa();

    if (this.params.showNormals) normals.blit({ width: this.width, height: this.height});
    if (this.params.showDepth) depth.blit({ width: this.width, height: this.height});
    if (this.params.showAlbedo) albedo.blit({ width: this.width, height: this.height});
    if (this.params.showSSAO) ssao.blit({ width: this.width, height: this.height});
    if (this.params.showPBR) pbr.blit({ width: this.width, height: this.height});
    if (this.params.showTonemap) tonemap.blit({ width: this.width, height: this.height});
    if (this.params.showGamma) gamma.blit({ width: this.width, height: this.height});
    if (this.params.showFinal) finalColor.blit({ width: this.width, height: this.height});

    glu.enableAlphaBlending(false);

    this.gui.draw();
  }
});



