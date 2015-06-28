var createMesh = require('../')
var createCamera = require('perspective-camera')
var createApp = require('canvas-loop')
var createShader = require('glo-shader')
var createTexture = require('glo-texture/2d')
var createContext = require('get-canvas-context')
var loadImage = require('img')
var material = require('./mat-basic')
var assign = require('object-assign')

var gl = createContext('webgl')

var canvas = document.body.appendChild(gl.canvas)

var shader = createShader(gl, assign({
    // we can hard-code some defaults here
    uniforms: [
        { type: 'vec2', name: 'repeat', value: [ 8, 8 ] },
        { type: 'sampler2D', name: 'iChannel0', value: 0 }
    ]
}, material))

// var torus = require('primitive-sphere')(1)
// var torus = require('primitive-icosphere')(1)
var torus = require('torus-mesh')({ majorRadius: 1, minorRadius: 0.5 })
var model = require('gl-mat4/identity')([])

var camera = createCamera()

var mesh = createMesh(gl, {
  vao: true
})
  .attribute('position', torus.positions)
  .attribute('uv', torus.uvs)
  .attribute('normal', torus.normals)
  .elements(torus.cells)

var time = 0
var tex
var app = createApp(canvas)
  .on('tick', render)

// loadImage(require('baboon-image-uri'), function (err, img) {
//   if (err) throw err
  var img = [
    [0xff, 0xff, 0xff, 0xff], [0xcc, 0xcc, 0xcc, 0xff],
    [0xcc, 0xcc, 0xcc, 0xff], [0xff, 0xff, 0xff, 0xff]
  ]
  tex = createTexture(gl, img, [ 2, 2 ], {
    wrap: gl.REPEAT,
    minFilter: gl.NEAREST,
    magFilter: gl.NEAREST
  })
  app.start()
// })

function render (dt) {
  time += dt / 1000

  var width = gl.drawingBufferWidth
  var height = gl.drawingBufferHeight
  gl.viewport(0, 0, width, height)
  gl.clearColor(0, 0, 0, 1)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.enable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)

  camera.viewport = [0, 0, width, height]
  camera.identity()
  var angle = time
  var distance = 5
  camera.translate([ Math.cos(angle) * distance, 0, Math.sin(angle) * distance ])
  camera.lookAt([ 0, 0, 0 ])
  camera.update()

  shader.bind()
  // shader.uniforms.repeat([ 8, 8 ])
  shader.uniforms.projection(camera.projection)
  shader.uniforms.view(camera.view)
  shader.uniforms.model(model)
  shader.uniforms.iChannel0(0)

  tex.bind()
  mesh.bind(shader)
  mesh.draw(gl.TRIANGLES)
  mesh.unbind(shader)
}
