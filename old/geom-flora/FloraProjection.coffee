define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage } = pex.gl
  { hem, Vec3, Geometry, hem, Quat, Rect } = pex.geom
  { Cube, Octahedron, Sphere } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils, ObjWriter } = pex.utils
  { cos, sin, PI, sqrt, abs, random, atan2, min, max, floor } = Math
  { Fruit, Cactus, Herb, Algae, Grass, Flower } = require('flora/plants')

  Simulation = require('flora/projection/Simulation')
  VideosPanel = require('flora/projection/VideosPanel')
  Config = require('flora/game/Config')
  ProjectionClient = require('flora/projection/ProjectionClient')
  CameraOrbiterTouch = require('utils/CameraOrbiterTouch')

  Window.create
    settings:
      canvas: if Platform.isBrowser then document.getElementById('gameboard') else null
      width: 1050
      height: 1050
    init: () ->
      @projection = true
      @scaling = false

      Time.verbose = true
      @simulation = new Simulation(this, @width, @width/2)
      @simulationViewport = new Viewport(this, new Rect(40, 260, 970, 514))
      @plantViewports = []

      @projectionClient = new ProjectionClient()
      @projectionClient.init()
      @projectionClient.onPing = @onPing.bind(this)
      @projectionClient.onGenotype = @onGenotype.bind(this)

      @videosPanel = new VideosPanel()

      margin = 40
      plantViewY = 869
      plantViewWidth = 142
      plantViewHeight = 142
      spacing = (@width - plantViewWidth * 6 - margin*2)/5
      for i in [0...6]
        @plantViewports.push(new Viewport(this, new Rect(margin + i * plantViewWidth + i * spacing, plantViewY, plantViewWidth, plantViewHeight)))

      @rtSize = 512
      @plantRTViewport = new Viewport({}, new Rect(0, 0, @rtSize, @rtSize))
      @plantRT = new RenderTarget(@rtSize, @rtSize, { depth: true })
      @plantScreenImage = new ScreenImage(@plantRT.getColorAttachement(0), 0, 0, plantViewWidth, plantViewWidth, plantViewWidth, plantViewWidth)
      #@plantScreenImage = new ScreenImage(Texture2D.load('assets/icons/Algae.png'), 0, 0, plantViewWidth, plantViewWidth, plantViewWidth, plantViewWidth)

      @plants = [
        new Fruit({ projection: true, width: plantViewWidth, height:plantViewHeight })
        new Algae({ projection: true, width: plantViewWidth, height:plantViewHeight })
        new Flower({ projection: true, width: plantViewWidth, height:plantViewHeight })
        new Herb({ projection: true, width: plantViewWidth, height:plantViewHeight })
        new Grass({ projection: true, width: plantViewWidth, height:plantViewHeight })
        new Cactus({ projection: true, width: plantViewWidth, height:plantViewHeight })
      ]

      @plantCamera = new PerspectiveCamera(60, 1)
      @plantCameraController = new CameraOrbiterTouch(this, @plantCamera, 1.8, 30)

      for plant in @plants
        plant.ping = 0

      if (typeof(window) != 'undefined')
        @adjustLayout()
        window.onresize = @adjustLayout.bind(this)

    onPing: (plantType) ->
      console.log('FloraProjection.onPing', plantType)
      for plant in @plants
        console.log(plantType, plant.type)
        if plantType == plant.type
          console.log('fire!!')
          plant.ping = 1

    onGenotype: (plantType, genotype) ->
      #console.log('FloraProjection.onGenotype', plantType)
      for plant in @plants
        if plantType == plant.type
          for geneName, gene of plant.genes
            gene.normalizedValue = genotype[geneName]

    adjustLayout: () ->
      scale = 1
      if @scaling
        scale = min(window.innerWidth / Config.projection.width, window.innerHeight / Config.projection.height)
        containerWrapper.style.transform = "scale(#{scale}, #{scale})"
        containerWrapper.style.webkitTransform = "scale(#{scale}, #{scale})"
      console.log('scale', scale)
      width = scale * Config.projection.width
      height = scale * Config.projection.height
      containerWrapper = document.getElementById('containerWrapper')
      #containerWrapper.style.marginLeft = Math.floor(window.innerWidth - width)/2 + 'px'
      document.body.style.height = height + 'px'
      document.body.style.overflow = 'hidden'
      this.canvas.style.background = 'transparent'

    draw: () ->
      @plantCameraController.update()

      @gl.clearColor(0, 0, 0, 0)
      @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
      @simulationViewport.bind()
      @gl.clearColor(0, 0, 0, 1)
      @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
      @simulation.draw()
      @simulationViewport.unbind()

      for plant, i in @plants
        @plantRTViewport.bind()
        @plantRT.bind()
        plant.ping *= 0.9
        @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
        @gl.clearColor(plant.ping, plant.ping*0.8, plant.ping*0.5, 1)
        @gl.clear(@gl.COLOR_BUFFER_BIT)
        plant.draw(@plantCamera)
        @plantRT.unbind()
        @plantRTViewport.unbind()

        @plantRT.getColorAttachement(0).bind()
        @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MAG_FILTER, @gl.LINEAR);
        @gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MIN_FILTER, @gl.LINEAR_MIPMAP_LINEAR);
        @gl.generateMipmap(@gl.TEXTURE_2D);

        @plantViewports[i].bind()
        @plantScreenImage.draw()
        @plantViewports[i].unbind()

      #@cactusMesh.drawInstances(@camera, @instances)
      #@cactusWireframe.drawInstances(@camera, @instances)