pex = pex || require('./lib/pex')

{ Platform } = pex.sys
{ PerspectiveCamera } = pex.scene
{ GUI } = pex.gui
{ Vec2, Vec3, Vec4, Mat4, Rect, BoundingBox } = pex.geom
{ Mesh, Texture2D } = pex.gl
{ Cube } = pex.geom.gen
{ SolidColor } = pex.materials
{ Color } = pex.color
{ Time, MathUtils } = pex.utils
fx = pex.fx

pex.require ['SourcesScene', 'EffectsScene', 'helpers/BoundingBoxHelper',
'ShoesPanel', 'PeopleCarousel', 'utils/SlidingArcball',
'fx/ThresholdBW', 'fx/Downsample4A', 'fx/Downsample2A', 'fx/RGBShift', 'fx/Scale'],
(SourcesScene, EffectsScene, BoundingBoxHelper,
  ShoesPanel, PeopleCarousel, SlidingArcball,
  ThresholdBW, Downsample4A, Downsample2A, RGBShift) ->
  try
    pex.sys.Window.create
      settings:
        type: '3d'
        fullscreen: false,
        width: if Platform.isBrowser then window.innerWidth else 1280
        height: 555
        canvas: if Platform.isBrowser then document.getElementById('webglcanvas') else null
      maxDepth: 5999
      sourceId: 2
      effectId: 0
      numEffects: 4
      debugMode: false
      drawMeshes: true
      drawPeople: true
      drawFloor: false
      pointSize: 2
      showGUI: false
      mousePos: new Vec3(0, 0)
      distance: 2000
      minDistance: 500
      maxDistance: 2500
      useEffects: true
      gravitySpeed: -500
      mouseEffectEnabled: false
      init: () ->
        @gui = new GUI(this)
        @framerate(30)

        OES_texture_float = @gl.getExtension('OES_texture_float')
        if !OES_texture_float
           throw new Error("No support for OES_texture_float")

        @shoesPanel = new ShoesPanel(this)

        if Platform.isBrowser
          mousewheelevt = if (/Firefox/i.test(navigator.userAgent)) then 'DOMMouseScroll' else 'mousewheel'
          @settings.canvas.addEventListener mousewheelevt, (e) ->
            e.preventDefault()
            return false
          rgbdMusicFile = document.getElementById('rgbdMusicFile')
          rgbdMusicFile.play()
          rgbdMuteBtn = document.getElementById('rgbdMuteBtn')
          rgbdMuteBtn.addEventListener 'click', () ->
            if rgbdMusicFile.paused
              rgbdMuteBtn.className = ''
              rgbdMusicFile.play()
            else
              rgbdMuteBtn.className = 'active'
              rgbdMusicFile.pause()

          rgbdCreditsBtn = document.getElementById('rgbdCreditsBtn')
          rgbdCredits = document.getElementById('rgbdCredits')
          rgbdCreditsBtn.addEventListener 'click', () ->
            openCredits()

          closeCredits = (e) ->
            if e.target.parentNode.nodeName == 'A' then return
            rgbdCredits.style.display = 'none'
            window.removeEventListener('mousedown', closeCredits)

          openCredits = () ->
            rgbdCredits.style.display = 'block'
            window.addEventListener('mousedown', closeCredits)

          rgbdInfoBtn = document.getElementById('rgbdInfoBtn')
          rgbdInfoBtn.addEventListener 'click', () ->
            openInstructions()

          rgbdInstructions = document.getElementById('rgbdInstructions')

          closeInstructions = () ->
            rgbdInstructions.style.display = 'none'
            window.removeEventListener('mousedown', closeInstructions)

          openInstructions = () ->
            rgbdInstructions.style.display = 'block'
            window.addEventListener('mousedown', closeInstructions)

          openInstructions();

        @camera = new PerspectiveCamera(60, @width/@height, 0.1, 10000)
        @sourcesScene = new SourcesScene(this, @onSourcesLoaded.bind(this))
        @slidingArcball = new SlidingArcball(this, @camera, 2000)
        @slidingArcball.setTarget(@sourcesScene.cameraTarget.dup())

        Time.verbose = true

        @peopleCarousel = new PeopleCarousel(this, @sourcesScene)

      onSourcesLoaded: (sourcesScene) ->
        @effectsScene = new EffectsScene(this, sourcesScene, sourcesScene.sources, @sourceId)
        @initHelpers(sourcesScene)

      initHelpers: (sourcesScene) ->
        console.log('initHelpers')
        @boundingBoxHelper = new BoundingBoxHelper(sourcesScene.boundingBox)
        @effectBoundingBoxHelper = new BoundingBoxHelper(sourcesScene.effectBoundingBox, new Color(0.2, 0.5, 1.0, 1.0))

        planeGeom = new Cube(sourcesScene.boundingBox.getSize().x, 1, sourcesScene.boundingBox.getSize().z, 12, 1, 12)
        planeGeom.computeEdges()
        @plane = new Mesh(planeGeom, new SolidColor(), { primiveType: @gl.LINES, useEdges:true })
        @plane.position = sourcesScene.modelBaseCenter

        @gui.addLabel('RGB+D').setPosition(@width - 180, 10)
        @gui.addLabel(' ')
        @gui.addParam('Paricle size', this, 'pointSize', {min:1, max:10})
        @gui.addParam('Mouse Effect', this, 'mouseEffectEnabled')

        @gui.addLabel(' ')
        @gui.addRadioList('Effects', this, 'effectId', [
          { name:'Twirl', value:0 }
          { name:'Hologram', value:1 }
          { name:'Splash', value:2 }
          { name:'Fluid', value:3 }
          { name:'Triangles', value:4 }
          { name:'Blink', value:5 }
        ])

        @on 'keyDown', (e) =>
          #if e.str == 'S' then console.log('Saving..'); @gui.save('settings.txt')
          #if e.str == 'L' then @gui.load('settings.txt')
          if e.str == 'D' then @debugMode = !@debugMode
          if e.str == 'T' then @effectId = 4
          if e.str == 'B' then @effectId = 5
          #if e.str == 'm' then @drawMeshes = !@drawMeshes
          if e.str == 'G' then @showGUI = !@showGUI
          if e.str == 'F' then @drawFloor = !@drawFloor
          if e.str == '1' then @sourceId = 0
          if e.str == '2' then @sourceId = 1
          if e.str == '3' then @sourceId = 2
          if e.str == '4' then @sourceId = 3
          if e.str == '5' then @sourceId = 4
          if e.str == '6' then @sourceId = 5
          if e.str == '7' then @sourceId = 6

        @on 'mouseMoved', (e) =>
          @mousePos.set(e.x, e.y)

        @on 'scrollWheel', (e) =>
          @distance = Math.min(@maxDistance, Math.max(@distance + e.dy/100*(@maxDistance-@minDistance), @minDistance))

        @gui.load('settings.txt')

      easeInOut: ( k ) ->
        if ( ( k *= 2 ) < 1 ) then 0.5 * k * k * k
        else 0.5 * ( ( k -= 2 ) * k * k + 2 )

      update: () ->
        for source, sourceIndex in @sourcesScene.sources
          if !source then continue
          source.playing = (sourceIndex == @sourceId)
          source.update()

        @slidingArcball.update() if @slidingArcball

        if !@effectsScene then return

        mesh = @sourcesScene.mesh
        source = @sourcesScene.sources[@sourceId]
        effect = @effectsScene.effects[@effectId]

        if !mesh || !source || !effect then return

        source.groundLevel = if @removeGround then -970 else -9999

        rotDist = Math.abs(360 - Math.abs(@slidingArcball.phi))
        meshOpacity = @easeInOut(MathUtils.map(rotDist, 0, 360, 0, 1))
        mesh.material.uniforms.opacity = meshOpacity
        effect.amount = 1.0 - meshOpacity
        if @mouseEffectEnabled
          effect.amountMouse = @mousePos.x / @width
        else
          effect.amountMouse = 0
        if effect.material && effect.material.uniforms && effect.material.rgbd
          effect.material.rgbd = source
        if @effectId == 1
          effect.cutout = effect.amount
        else
          effect.cutout = 1
        @effectsScene.converter.source = source
        @effectsScene.converter.debugMode = @debugMode

        if @effectId == 6 #blink
          mesh.material.uniforms.opacity = 1

        @peopleCarousel.drawFloor = @drawFloor
        @peopleCarousel.texturedParticles = @texturedParticles
        @peopleCarousel.pointSize = @pointSize

      drawDebugThings: () ->
        @peopleCarousel.drawDebug(@camera) if @peopleCarousel and @debugMode
        @plane.draw(@camera) if @plane and @debugMode
        @boundingBoxHelper.draw(@camera) if @boundingBoxHelper and @debugMode
        @effectBoundingBoxHelper.draw(@camera) if @effectBoundingBoxHelper and @debugMode

      drawScene: () ->
        @gl.clearColor(0, 0, 0, 0)
        @gl.enable(@gl.DEPTH_TEST)
        @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
        @gl.clear(@gl.DEPTH_BUFFER_BIT)

        @effectsScene.converter.draw() if @effectsScene

        @gl.enable(@gl.BLEND)
        @gl.blendFunc(@gl.SRC_ALPHA, @gl.ONE_MINUS_SRC_ALPHA)

        @gl.enable(@gl.DEPTH_TEST)
        @drawDebugThings() if @debugMode

        if @drawMeshes
          mesh = @sourcesScene.mesh
          if mesh
            mesh.material.uniforms.debugMode = @debugMode
            mesh.material.uniforms.texturedParticles = @texturedParticles
            mesh.material.uniforms.pointSize = @pointSize
            mesh.source = @sourcesScene.sources[@sourceId]
            mesh.updateChannels()
            mesh.draw(@camera)

        if @useEffects && @effectsScene
          for effect, effectIndex in @effectsScene.effects
            if !effect || effectIndex != @effectId then continue
            effect.debugMode = @debugMode
            effect.source = @sourcesScene.sources[@sourceId]
            effect.draw(@camera)

        @gl.disable(@gl.BLEND)

      drawSceneNoEffect: () ->
        @gl.clearColor(0, 0, 0, 0)
        @gl.enable(@gl.DEPTH_TEST)
        @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)

        @effectsScene.converter.draw() if @effectsScene

        @gl.enable(@gl.BLEND)
        @gl.blendFunc(@gl.SRC_ALPHA, @gl.ONE_MINUS_SRC_ALPHA)

        @gl.enable(@gl.DEPTH_TEST)
        @drawDebugThings() if @debugMode

        if @drawMeshes
          mesh = @sourcesScene.mesh
          if mesh
            mesh.material.uniforms.debugMode = @debugMode
            mesh.material.uniforms.pointSize = @pointSize
            mesh.source = @sourcesScene.sources[@sourceId]
            mesh.updateChannels()
            mesh.draw(@camera)

        @gl.disable(@gl.BLEND)

      drawSceneNoMesh: () ->
        @gl.clearColor(0, 0, 0, 0)
        @gl.enable(@gl.DEPTH_TEST)
        @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)

        @gl.enable(@gl.BLEND)
        @gl.blendFunc(@gl.SRC_ALPHA, @gl.ONE_MINUS_SRC_ALPHA)

        @gl.enable(@gl.DEPTH_TEST)

        if @useEffects && @effectsScene
          for effect, effectIndex in @effectsScene.effects
            if !effect || effectIndex != @effectId then continue
            effect.debugMode = @debugMode
            effect.source = @sourcesScene.sources[@sourceId]
            effect.draw(@camera)

        @gl.disable(@gl.BLEND)

      draw: () ->
        @update()

        @gl.clearColor(0, 0, 0, 1)
        @gl.enable(@gl.DEPTH_TEST)
        @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
        @gl.clear(@gl.DEPTH_BUFFER_BIT)

        if !@effectsScene then return

        effect = @effectsScene.effects[@effectId]
        if @effectId == 1 && effect
          mesh = @sourcesScene.mesh

          color = fx().render({drawFunc:@drawSceneNoEffect.bind(this), depth:true})
          color2 = color.render({drawFunc:@drawSceneNoMesh.bind(this), depth:true})
          threshold = color2.thresholdBW({threshold:0.5})
          small = threshold.downsample2A().downsample2A().blur7()
          shift = 1 / 1280 * 0.3 #@mousePos.x / @width
          final = threshold.add(small).rgbShift({r:new Vec2(15 * shift, 0) ,g: new Vec2(0, 5 * shift),b:new Vec2(-10*shift)})#.scale({scale:effect.amount})

          @gl.disable(@gl.BLEND)
          @gl.enable(@gl.DEPTH_TEST)
          @peopleCarousel.draw(@camera) if @drawPeople

          @gl.enable(@gl.BLEND)
          @gl.blendFunc(@gl.SRC_ALPHA, @gl.ONE_MINUS_SRC_ALPHA)

          color.blit({x:0, y:0, width:@width, height:@height})
          final.blit({x:0, y:0, width:@width, height:@height})
          @gl.disable(@gl.BLEND)
        else
          @drawScene()
          @peopleCarousel.draw(@camera) if @drawPeople

        @gl.enable(@gl.DEPTH_TEST)
        @shoesPanel.draw() if @shoesPanel

        @gui.draw() if @showGUI
  catch e
    if Platform.isBrowser
      rgbdNoWebGL = document.getElementById('rgbdNoWebGL')
      rgbdNoWebGL.style.display = 'block'