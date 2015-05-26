var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');

var Cube = gen.Cube;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Platform = sys.Platform;
var Texture2D = glu.Texture2D;


//  ## state : Geometry
//  -> state : Geometry.attributes.position
//  -> state : TypedArray buffer
//  -> state : GL buffer                          + gl buffer binding
//  -> vert : attribute : position / vec3         + shader attribute location binding
//  -> vert : position / vec4
//  -> vert : worldSpace : position / vec4
//  -> vert : eyeSpace : position / vec4
//  -> vert : ndcSpace : position / vec4
//  -> gl_Position / vec4

//  ## state : Geometry
//  -> state : Geometry.attributes.color
//  -> state : TypedArray buffer
//  -> state : GL buffer                          + gl buffer binding
//  -> vert : attribute : color                   + shader attribute location binding
//  -> vert : varying : color
//  -> frag : varying : color
//  -> gl_FragColor

//  ## state : "file.jpg"
//  -> state : TypeArray
//  -> state : GL Texture2D                       + gl texture binding
//  -> vert : uniform : tex                       + shader uniform location binding
//  -> frag : uniform : tex / sampler2D
//  -> frag : color / vec4                        <- + texCoord derived as above
//  -> gl_FragColor

//  ## state : "file.hdr"
//  -> state : TypeArray[s]
//  -> state : GL TextureCubeMap                  + gl texture binding
//  -> vert : uniform : tex                       + shader uniform location binding
//  -> frag : uniform : tex / samplerCube
//  -> frag : color / vec4                        <- + N derived as above
//  -> gl_FragColor


function stringPatterMatch(s) {
  if (s.match(/\.jpg$/)) return 'texture2D/jpg';
  if (s.match(/\.png$/)) return 'texture2D/png';
  if (s.match(/.+(##).+(##)\.dds$/)) return 'textureCube/dds';
  if (s.match(/\.dds$/)) return 'texture?/dds';
}

function matchString(regexp) {
  return function(s) {
    return s.match(regexp);
  }
}

function matchType(type) {
  return function(o) {
    return o instanceof type;
  }
}

function matchGLSL(code) {
  return function() {

  }
}

function loadTexture2D(path) {
  return Texture2D.load(path);
}

function bindUniform(o) {
  
}


function shaderGen(geometry) {
  var transformations = [
    { from: { str: /\.jpg$/ }, to: { type : Texture2D }, using: loadTexture2D },
    { from: { type : Texture2D }, to: { glsl: { stage: vert } }, using: bindUniform, require: { type: Shader } }
  ];



  var flows = [
    [['state', geometry], ['vert', 'position'], ['vert', 'gl_Position']]
  ];
}

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    type: '3d',
    fullscreen: Platform.isBrowser ? true : false
  },
  init: function() {
    var cube = new Cube();
    this.mesh = new Mesh(cube, new ShowNormals());

    shaderGen(cube);

    this.camera = new PerspectiveCamera(60, this.width / this.height);
    this.arcball = new Arcball(this, this.camera);
  },
  draw: function() {
    glu.clearColorAndDepth(Color.Black);
    glu.enableDepthReadAndWrite(true);
    //this.mesh.draw(this.camera);
  }
});
