define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage, Context } = pex.gl
  { hem, Vec3, Geometry, Edge, Mat4, Spline3D, Quat } = pex.geom
  { Cube, Octahedron, Sphere, Dodecahedron, Icosahedron, LineBuilder, HexSphere } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils } = pex.utils
  { map, randomVec3, seed } = MathUtils
  { cos, sin, PI, sqrt, abs, random, floor, min, max, exp, log } = Math
  CameraOrbiterTouch = require('utils/CameraOrbiterTouch')
  Cylinder = require('geom/gen/Cylinder')
  Config = require('flora/game/Config')
  Gene = require('flora/plants/Gene')
  Instance = require('flora/plants/Instance')
  gh = require('geom/gh')

  class Fruit
    type: 'fruit'
    constructor: (@app) ->
      @type = 'fruit'
      @gl = Context.currentContext.gl
      @camera = new PerspectiveCamera(60, @app.width / @app.height)
      if @app.on then @cameraController = new CameraOrbiterTouch(@app, @camera, 2.5, 45)

      @genes = {
        bunchiness: new Gene('bunchiness', 0, 0, 3)
        size: new Gene('size', 1, 0.3, 1)
        seeds: new Gene('seeds', 1, 0, 10)
        layers: new Gene('layers', 0, 0, 0.6)
        #spikes: new Gene('spikes', 0.5, 0, 1)
        #shape: new Gene('shape', 1, 0.2, 1)
        thickness: new Gene('thickness', 1, 4, 10)
      }

      @material = new SolidColor({color:Config.colors.orange});
      @materialFill = new SolidColor({color:Color.Black});
      @darkGoldMaterial = new SolidColor({color: Config.secondaryColors.orange});
      @layerMaterial = new SolidColor({color:Config.colors.pink});

      #@seedMaterial = new Diffuse({diffuseColor:Config.colors.yellow, ambientColor:Config.colors.orange, wrap:0});
      @seedMaterial = new SolidColor({color: Config.colors.yellow.clone(), diffuseColor:Config.colors.yellow.clone(), ambientColor:Config.colors.orange, wrap:0});

      @geom = hem().fromGeometry(new Cube(0.6, 0.6, 1)).subdivide().subdivide().subdivide().toFlatGeometry()
      @mesh = new Mesh(@geom, @material, { useEdges: true})
      @meshFill = new Mesh(@geom, @materialFill )

      @layerGeom = hem().fromGeometry(new Cube(0.6, 0.6, 1)).subdivide().subdivide().subdivide().toFlatGeometry()
      @layerMesh = new Mesh(@layerGeom, @layerMaterial)

      @maxFruitsPerBunch = 6
      @maxSeedsPerFruit = @genes.seeds.max
      @fruitInstances = [0...@genes.bunchiness.max*(5 + @maxFruitsPerBunch)].map () -> new Instance()
      @fruitLayerInstances = [0...@genes.bunchiness.max*(5 + @maxFruitsPerBunch)].map () -> new Instance()
      @fruitLayerInstances2 = [0...@genes.bunchiness.max*(5 + @maxFruitsPerBunch)].map () -> new Instance()
      @seedInstances = [0...@genes.bunchiness.max*(5 + @maxFruitsPerBunch)*@maxSeedsPerFruit].map () -> new Instance()

      @globeGeom = new HexSphere(6)
      @globeGeom = hem().fromGeometry(@globeGeom).triangulate().toFlatGeometry()
      @globeGeom.computeEdges()
      @globe = new Mesh(@globeGeom, @darkGoldMaterial, { useEdges : true })

      #@seedGeom = new HexSphere(0.3)
      #@seedGeom = hem().fromGeometry(@seedGeom).triangulate().toFlatGeometry()
      @seedGeom = hem().fromGeometry(new Cube(0.3, 0.3, 0.4)).subdivide().subdivide().toFlatGeometry()
      @seedMesh = new Mesh(@seedGeom, @seedMaterial)

      @genes.thickness.currValue = 0
      @genes.layers.currValue = 0

    rebuild: () ->
      seed(0)

      fruitScale = @genes.size.value
      bunchScale = map(fruitScale, @genes.size.min, @genes.size.max, 1, 0)
      bunchSpreadScaleR = map(fruitScale, @genes.size.min, @genes.size.max, 0.4, 1)
      bunchSpreadScaleY = map(fruitScale, @genes.size.min, @genes.size.max, 0.4, 1)
      fruitsPerBunch = 5 + floor(bunchScale * @maxFruitsPerBunch)

      fruit = @fruitInstances[0]
      fruit.targetPosition = new Vec3(0,0,0)
      fruit.targetRotation.copy(Quat.fromDirection( new Vec3(0, 1, 0)))
      fruit.targetScale.set(fruitScale, fruitScale, fruitScale)

      fruitIndex = 1
      for bunch in [0...@genes.bunchiness.max]
        fruitPositions = gh.flatten(gh.divide(gh.circle(gh.point(0, 0.2 + 0.4*bunch*bunchSpreadScaleY - 0.3*bunchScale, 0), 0.5*bunchSpreadScaleR), fruitsPerBunch))
        fruitTargets = gh.flatten(gh.divide(gh.circle(gh.point(0, -2*bunchSpreadScaleR + 0.4*bunch*bunchSpreadScaleY - 0.3*bunchScale, 0), 1.5), fruitsPerBunch))
        for bunchFruit in [0...5+@maxFruitsPerBunch]
          fruit = @fruitInstances[fruitIndex++]

          if !fruit then continue
          if bunchFruit > fruitsPerBunch || bunch >= @genes.bunchiness.intValue
            fruit.targetScale.set(0, 0, 0)
          else
            fruit.targetRotation.copy(Quat.fromDirection(fruitTargets[(fruitIndex-1)%fruitsPerBunch]))
            fruit.targetPosition.copy(fruitPositions[(fruitIndex-1)%fruitsPerBunch])
            fruit.targetScale.set(fruitScale,fruitScale,fruitScale)

      for i in [0...@fruitLayerInstances.length]
        fruit = @fruitInstances[i]
        fruitLayer = @fruitLayerInstances[i]
        fruitLayer.targetPosition.copy(fruit.targetPosition)
        fruitLayer.targetRotation.copy(fruit.targetRotation)
        fruitLayer.targetScale.copy(fruit.targetScale).scale(0.8)

      seed(0)
      seedInstanceIndex = 0
      numSeedsPerFruit = @genes.seeds.intValue
      for fruit in @fruitInstances
        for i in [0...@genes.seeds.max]
          seedInstance = @seedInstances[seedInstanceIndex++]
          offset = randomVec3()
          if i > numSeedsPerFruit || fruit.targetScale.x < 0.001
            seedInstance.targetScale.set(0, 0, 0)
          else
            distScale = 0
            seedScale = fruitScale * 1/numSeedsPerFruit
            if @genes.seeds.normalizedValue > 0.5 then distScale = 1
            seedScale = max(0.1, seedScale * fruit.scale.x)
            seedInstance.targetScale.set(seedScale, seedScale, seedScale)
            seedInstance.targetPosition.copy(fruit.targetPosition).add(offset.scale(fruitScale*0.7*distScale))
            seedInstance.targetRotation.copy(fruit.targetRotation)


    animateInstances: (instances) ->
      for instance, instanceIndex in instances
        instance.update()

    update: () ->
      @cameraController.update() if @cameraController
      #if Time.frameNumber % 2 == 0 then 
      @rebuild()

      @genes.thickness.currValue += (@genes.thickness.value - @genes.thickness.currValue) * 0.1
      @genes.layers.currValue += (@genes.layers.value - @genes.layers.currValue) * 0.1

      @animateInstances(@fruitInstances)
      @animateInstances(@seedInstances)
      @animateInstances(@fruitLayerInstances)

    draw: (projectionCamera) ->

      @update()

      camera = projectionCamera || @camera
      @gl.enable(@gl.DEPTH_TEST)
      @gl.lineWidth(2)
      @gl.disable(@gl.BLEND)

      @globe.draw(camera)

      @gl.lineWidth(@genes.thickness.currValue)
      @material.uniforms.color = Config.colors.yellow
      @mesh.drawInstances(camera, @fruitInstances)

      @gl.clear(@gl.DEPTH_BUFFER_BIT)

      @material.uniforms.color = Config.colors.orange
      @gl.lineWidth(2)
      @meshFill.drawInstances(camera, @fruitInstances)
      @gl.depthMask(0)
      @gl.disable(@gl.DEPTH_TEST)
      @gl.lineWidth(5)
      @layerMesh.material.uniforms.color.a = @genes.layers.currValue
      @seedMaterial.uniforms.color.a = 0.1 + 0.5 * @genes.seeds.normalizedValue
      @gl.enable(@gl.BLEND)
      @gl.blendFunc(@gl.SRC_ALPHA, @gl.ONE_MINUS_SRC_ALPHA)
      @layerMesh.drawInstances(camera, @fruitLayerInstances)
      @seedMesh.drawInstances(camera, @seedInstances)
      @gl.disable(@gl.BLEND)
      @gl.depthMask(1)
      @gl.enable(@gl.DEPTH_TEST)
      @gl.lineWidth(2)
      @mesh.drawInstances(camera, @fruitInstances)

