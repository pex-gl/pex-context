var glu            = require('pex-glu');
var Window         = require('pex-sys').Window;
var GUI            = require('pex-gui').GUI;
var Color          = require('pex-color').Color;
var Vec3           = require('pex-geom').Vec3;
var PerspectiveCam = require('pex-glu').PerspectiveCamera;
var Arcball        = require('pex-glu').Arcball;
var Dodecahedron    = require('pex-gen').Dodecahedron;
var Cube           = require('pex-gen').Cube;
var Box            = require('pex-gen').Box;
var Sphere         = require('pex-gen').Sphere;
var LineBuilder    = require('pex-gen').LineBuilder;
var Mesh           = require('pex-glu').Mesh;
var Texture2D      = require('pex-glu').Texture2D;
var TextureCube    = require('pex-glu').TextureCube;
var ShowNormals    = require('pex-materials').ShowNormals;
var SolidColor     = require('pex-materials').SolidColor ;
var Platform       = require('pex-sys').Platform;
var R              = require('ramda');
var random         = require('pex-random');
var UberMaterial   = require('../../sh/UberMaterial');
var loadDDS        = require('../../glu/loadDDS');
var loadDDSMipMaps = require('../../glu/loadDDSMipMaps');
var SkyBox         = require('../../materials/SkyBox');
var TileRender     = require('../../glu/TileRender');

var DPI = 2;

Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: Platform.isBrowser,
    hightdpi: 2
  },
  needsRender: false,
  preview: false,
  init: function() {
    this.gui = new GUI(this);

    var box = new Box();
    box = box.catmullClark();
    box = box.catmullClark();

    var faces = box.faces.map(function(f, i) { return i; }).filter(function(i) { return i % 2 })
    var faces2 = box.faces.map(function(f, i) { return i; }).filter(function(i) { return (i % 2) == 0 })

    box = box.dooSabin(0.03)
    box = box.extrude(-0.06, faces, 0.2);
    box = box.extrude(0.06, faces2, 0.2);
    box = box.dooSabin(0.01);
    box = box.triangulate();//.toFlatGeometry();
    box = box.catmullClark();
    box.computeNormals();

    box = new Sphere(1);

    var lightPos = new Vec3(2, 2, 2);

    var cubemapFaces = [
      '../../assets/envmaps/mosque2/mosque_posx.jpg',
      '../../assets/envmaps/mosque2/mosque_negx.jpg',
      '../../assets/envmaps/mosque2/mosque_posy.jpg',
      '../../assets/envmaps/mosque2/mosque_negy.jpg',
      '../../assets/envmaps/mosque2/mosque_posz.jpg',
      '../../assets/envmaps/mosque2/mosque_negz.jpg',
    ];

    var uniforms = {
      albedoColor: Color.fromHSL(0.98, 0.9, 0.5),
      //albedoMap: State.albedoMap ? State.albedoMap : null,
      roughness: 0.5,
      //glossMap: State.glossMap ? State.glossMap : null,
      specularity: 0.904,
      //specularMap: State.specularMapEnabled ? State.specularMap : null,
      //genTexCoordTriPlanar: State.genTexCoordTriPlanar,
      lightPos: lightPos,
      lightColor: Color.White,
      useDiffuse: false,
      useSpecular: true,
      useFresnel: true,
      irradianceMap: loadDDS(this.gl, '../../assets/envmaps/ForestIrradiance.dds'),
      //reflectionMap: loadDDS(this.gl, '../../assets/envmaps/ForestReflection.dds'),
      reflectionMap: TextureCube.load(cubemapFaces),
      exposure: 1.5
    };

    var material = new UberMaterial(uniforms);

    var blob = new Mesh(box, material);
    blob.position.z = 0;
    blob.position.x = 0;

    this.scene = [];
    this.scene.push(blob);

    var skyBox = new Mesh(new Cube(1000), new SkyBox({ texture: uniforms.reflectionMap }))
    this.scene.push(skyBox);

    this.camera = new PerspectiveCam(90, this.width / this.height, 0.1, 1000);
    this.arcball = new Arcball(this, this.camera);

    this.gui.addParam('Exposure', material.uniforms, 'exposure', { min: 0, max: 5});
    this.gui.addParam('Roughness', material.uniforms, 'roughness');
    this.gui.addParam('Specularity', material.uniforms, 'specularity');
    this.gui.addParam('Albedo', material.uniforms, 'albedoColor', { palette: __dirname + '/../../assets/palettes/edgepaint.png' });
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    this.scene.forEach(function(mesh) {
      mesh.draw(this.camera);
    }.bind(this));

    this.gl.depthFunc(this.gl.LEQUAL)

    this.gui.draw();
  }
});
