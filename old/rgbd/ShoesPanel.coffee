define (require) ->
  { Viewport, Mesh, Context, Texture2D, ScreenImage } = require('pex/gl')
  { Scene, PerspectiveCamera, Arcball } = require('pex/scene')
  { Rect, BoundingBox } = require('pex/geom')
  { Cube } = require('pex/geom/gen')
  { Test } = require('pex/materials')
  { Color } = require('pex/color')
  { Quat, Vec3 } = require('pex/geom')
  { Time } = require('pex/utils')
  { ShowNormals, Test, SolidColor, Textured } = require('pex/materials')
  ObjReader = require('utils/ObjReader')
  CameraOrbiter = require('utils/CameraOrbiter')

  class ShoesPanel
    constructor: (@window)->
      @scenes = []
      @shoeViewportSize = 112

      @bounds = new Rect(20, 20, @shoeViewportSize, @shoeViewportSize)
      @defaultBounds = new Rect(20, 20, @shoeViewportSize, @shoeViewportSize)
      @hoverBounds = new Rect(10, 10, @shoeViewportSize*1.2, @shoeViewportSize*1.2)
      @targetBounds = @defaultBounds

      @logo = new ScreenImage(Texture2D.load('assets/images/stussy_w.png'), 20, 20, @shoeViewportSize, @shoeViewportSize, @window.width, @window.height)
      @timber = new ScreenImage(Texture2D.load('assets/images/TIMBERLAND_white_sm.png'), 20, 460, @shoeViewportSize, @shoeViewportSize*73/409, @window.width, @window.height)
      @bg = new ScreenImage(Texture2D.load('assets/images/sidepanelbg.png'), 0, 0, @shoeViewportSize + 50, @window.height, @window.width, @window.height)

      @addShoe('06_Shoe1_Brown', false) #Color.Red
      @addShoe('07_Shoe2_Camel', false) #Color.Green
      @addShoe('08_Shoe3_Black', false) #Color.Blue

      @window.on 'mouseMoved', (e) =>
        if e.x < @shoeViewportSize && e.y < 4 * @shoeViewportSize
          effectIndex = Math.floor(e.y / @shoeViewportSize)
          if effectIndex == 0
            @targetBounds = @hoverBounds
          else
            @targetBounds = @defaultBounds
        else
          @targetBounds = @defaultBounds

      @window.on 'leftMouseDown', (e) =>
        if e.x < @shoeViewportSize && e.y < 4 * @shoeViewportSize
          effectIndex = Math.floor(e.y / @shoeViewportSize)
          if effectIndex == 0
            effectIndex = (@window.effectId + 1) % @window.numEffects
          @window.effectId = effectIndex
          e.handled = true

    addShoe: (name, clearColor, i) ->

      viewport = new Viewport(@window, new Rect(20, @shoeViewportSize + @scenes.length * @shoeViewportSize, @shoeViewportSize, @shoeViewportSize))

      scene = new Scene()
      scene.id = i
      scene.setClearColor(clearColor)
      scene.setViewport(viewport)
      camera = new PerspectiveCamera(60, 1)
      scene.add(camera)
      @scenes.push(scene)

      modelPath = "assets/models/#{name}/#{name}.obj"
      texturePath = "assets/models/#{name}/#{name}.jpg"

      modelTexture = Texture2D.load(texturePath)

      self = this

      ObjReader.load modelPath, (geom) =>
        gl = Context.currentContext.gl
        bbox = BoundingBox.fromPoints(geom.vertices)
        bboxSize = bbox.getSize()
        r = Math.max(bboxSize.x, bboxSize.y, bboxSize.z)
        scene.cameras[0].setFar(20);

        scene.orbiter = new CameraOrbiter(scene.cameras[0], r*1.2)
        scene.orbiter.target = bbox.getCenter()
        scene.orbiter.update()
        shoeMesh = new Mesh(geom, new Textured( { texture: modelTexture}))
        scene.add(shoeMesh)

    draw: () ->
      gl = Context.currentContext.gl


      @bounds.x += (@targetBounds.x - @bounds.x) * 0.1
      @bounds.y += (@targetBounds.y - @bounds.y) * 0.1
      @bounds.width += (@targetBounds.width - @bounds.width) * 0.1
      @bounds.height += (@targetBounds.height - @bounds.height) * 0.1
      @logo.setBounds(@bounds)

      gl.disable(gl.DEPTH_TEST)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      @bg.draw()

      gl.blendFunc(gl.SRC_COLOR, gl.ONE)
      gl.disable(gl.DEPTH_TEST)
      @logo.draw()
      @timber.draw()
      gl.enable(gl.DEPTH_TEST)
      gl.disable(gl.BLEND)
      for scene in @scenes
        if scene.orbiter
          scene.orbiter.phi += Time.delta * 30
          scene.orbiter.update()
        scene.draw()
