{ Geometry, Vec2, Vec3 } = require('pex-geom')
{ Mesh, Texture2D, Context, OrthographicCamera, PerspectiveCamera } = require('pex-glu')
{ SolidColor, Textured } = require('pex-materials')
{ Cube } = require('pex-gen')
{ Color } = require('pex-color')

class TextLabel
  constructor: (@app, @position, text, @fontSize=50, @letterWidth=0.8) ->
    @gl = Context.currentContext

    @maxLen = 10;

    @camera = new OrthographicCamera(0, 0, @app.width, @app.height, 1, -1, new Vec3(0, 0, 1), new Vec3(0, 0, 0))

    @geom = new Geometry({vertices:true, texCoords:true, faces:true })

    for i in [0...@maxLen]
      @geom.vertices.push(new Vec3(i*@letterWidth, 0, 0))
      @geom.vertices.push(new Vec3((i+1)*@letterWidth, 0, 0))
      @geom.vertices.push(new Vec3((i+1)*@letterWidth, 1, 0))
      @geom.vertices.push(new Vec3(i*@letterWidth, 1, 0))
      coords = @charToTexCoords(text[i] || ' ');
      for coord in coords
        @geom.texCoords.push(coord)
      @geom.faces.push([i*4, i*4+1, i*4+2, i*4+3])

    @geom.computeEdges()

    @fontTexture = Texture2D.load('assets/ui/font.png');
    @mesh = new Mesh(@geom, new Textured({ texture: @fontTexture }))
    @mesh.scale.set(@fontSize, @fontSize, @fontSize)
    @mesh.position = @position.dup()
    @mesh.position.x -= text.length / 2 * @fontSize * @letterWidth

    this.alpha = 1

  charToTexCoords: (c) ->
    letters = " ABCDEFGHIJKLMNOPQRSTUWVXYZ0123456789-:";
    lettersPerRow = 8
    charIndex = letters.indexOf(c)
    row = charIndex % lettersPerRow
    col = Math.floor(charIndex / lettersPerRow)
    dt = 1/lettersPerRow
    return [
      new Vec2(-0.1 * dt + row * dt + (1.0-@letterWidth)/2/8, 1 - col * dt)
      new Vec2(-0.1 * dt + (row + 1) * dt - (1.0-@letterWidth)/2/8, 1 - col * dt)
      new Vec2(-0.1 * dt + (row + 1) * dt - (1.0-@letterWidth)/2/8, 1 - (col + 1) * dt)
      new Vec2(-0.1 * dt + row * dt + (1.0-@letterWidth)/2/8      , 1 - (col + 1) * dt)
    ]

  setText: (text="") ->
    @mesh.position = @position.dup()
    @mesh.position.x -= text.length / 2 * @fontSize * @letterWidth
    for i in [0...@maxLen]
      coords = @charToTexCoords(text[i] || ' ');
      for coord, coordIndex in coords
        @geom.texCoords[i*4 + coordIndex] = coord
      @geom.texCoords.dirty = true

  setTime: (minutes, seconds) ->
    m = '' + Math.floor(minutes)
    m = '0' + m if m.length == 1
    s = '' + Math.floor(seconds)
    s = '0' + s if s.length == 1
    @setText(m + ':' + s)

  draw: (c) ->
    this.camera = c
    @mesh.material.uniforms.color.a = this.alpha;
    @gl.disable(@gl.DEPTH_TEST)
    @gl.enable(@gl.BLEND)
    @gl.blendFunc(@gl.SRC_ALPHA, @gl.ONE)
    @gl.disable(@gl.DEPTH_TEST)
    @mesh.draw(@camera)
    #

module.exports = TextLabel;