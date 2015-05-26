define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage, Context } = pex.gl
  { hem, Vec3, Geometry, hem, Quat, Rect } = pex.geom
  { GenesPanel, KnobsPanel, PlantsPanel, ConnectionStatus, TextLabel, GameInfo } = require('flora/game/ui')
  { Cube, Octahedron, Sphere } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils, ObjWriter } = pex.utils
  { cos, sin, PI, sqrt, abs, random, atan2 } = Math
  fem = require('geom/fem')
  Cylinder = require('geom/gen/Cylinder')
  HEDuplicate = require('geom/hem/HEDuplicate')
  Plane = require('flora/land/Plane')
  Voxels = require('flora/land/Voxels')
  IsoLines = require('flora/land/IsoLines')
  BellCurve = require('flora/land/surface/BellCurve')
  Cosine = require('flora/land/surface/Cosine')
  Noise = require('flora/land/surface/Noise')
  CameraOrbiter = require('utils/CameraOrbiter')
  Config = require('flora/game/Config')
  FloraLayer = require('flora/projection/FloraLayer')

  GENERATING = 'generating'
  GAME = 'game'
  SIMULATION_1 = 'simulation_round1'
  SIMULATION_2 = 'simulation_round2'
  SIMULATION_3 = 'simulation_round3'
  RESULTS = 'results'
  RESULTS_WINNER = 'results_winner'
  FEEDBACK = 'feedback'

  modeTextures = {}
  modeTextures[GENERATING] = 'assets/projection/msg_generating.png'
  modeTextures[GAME] = 'assets/projection/msg_waiting.png'
  modeTextures[SIMULATION_1] = 'assets/projection/msg_round1.png'
  modeTextures[SIMULATION_2] = 'assets/projection/msg_round2.png'
  modeTextures[SIMULATION_3] = 'assets/projection/msg_round3.png'
  modeTextures[RESULTS] = 'assets/projection/msg_bestplant.png'
  modeTextures[RESULTS_WINNER] = 'assets/projection/msg_winner.png'

  class Simulation
    constructor: (@app, @width, @height) ->
      @gl = Context.currentContext.gl
      @initGeometry()
      @initCameras()
      @initTexts()

    initGeometry: () ->
      @surface = new Noise(4, 0.5)
      @landscape = new Voxels(Config.simulation.numTilesX, Config.simulation.numTilesY)
      @landscape.update(@surface)
      @floraLayer = new FloraLayer(Config.simulation.numTilesX, Config.simulation.numTilesY, @landscape.instances, this)

    initCameras: () ->
      @camera = new PerspectiveCamera(60, @width/@height)
      #@arcball = new Arcball(this, @camera, 2)
      @orbiter = new CameraOrbiter(@camera, 0.6, 35)

      @rtWidth = 2048
      @rtHeight = 1024
      @simRTViewport = new Viewport({}, new Rect(0, 0, @rtWidth, @rtHeight))
      @simRT = new RenderTarget(@rtWidth, @rtHeight, { depth: true })
      @simScreenImage = new ScreenImage(@simRT.getColorAttachement(0), 0, 0, @rtWidth, @rtHeight, @rtWidth, @rtHeight)
      @timeLabel = new TextLabel(this, new Vec3(500, 500, 0), "00:30", 500, 0.6)


    initTexts: () ->
      for modeName, textureFile of modeTextures
        modeTextures[modeName] = new ScreenImage(Texture2D.load(textureFile), 0, 0, @width, @height, @width, @height)
      @fadeToBlack = new ScreenImage(Texture2D.load('assets/img/black.png'), 0, 0, @width, @height, @width, @height)

    draw: () ->
      if Config.simulation.landscapeRotation
        @orbiter.phi += Time.delta * 10
      else
        @orbiter.phi = 90
      @orbiter.update()

      modeName = @app.projectionClient.mode

      @gl.enable(@gl.CULL_FACE)
      @gl.enable(@gl.DEPTH_TEST)
      @gl.lineWidth(2)

      #modeName = SIMULATION_1

      if modeName == GENERATING
        @landscape.setWireframe(true)
      else
        @landscape.setWireframe(false)

      if modeName == FEEDBACK
        @landscape.setHeight(0)
        @app.videosPanel.showFeedback(true)
      else
        @landscape.setHeight(1)
        @app.videosPanel.showFeedback(false)

      if (modeName == SIMULATION_1 or modeName == SIMULATION_2 or modeName == SIMULATION_3)
        @floraLayer.startSimulation() if not @floraLayer.simulating
      else
        @floraLayer.stopSimulation() if @floraLayer.simulating

      @landscape.update(@surface, Time.delta)

      @simRTViewport.bind()
      @simRT.bind()
      @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
      @landscape.draw(@camera)
      @floraLayer.draw(@camera)
      @simRT.unbind()
      @simRTViewport.unbind()

      @simRT.getColorAttachement(0).bind()
      @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MAG_FILTER, @gl.LINEAR);
      @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MIN_FILTER, @gl.LINEAR_MIPMAP_LINEAR);
      @gl.generateMipmap(@gl.TEXTURE_2D);

      @simScreenImage.draw()

      @gl.disable(@gl.DEPTH_TEST)
      @gl.enable(@gl.BLEND)
      @gl.blendFunc(@gl.SRC_ALPHA, @gl.ONE_MINUS_SRC_ALPHA)
      #@fadeToBlack.draw()
      #@fadeToBlack.setAlpha(0.5)
      #if modeTextures[modeName]
      #  modeTextures[modeName].draw()
      @timeLabel.draw()
      @gl.disable(@gl.BLEND)
