define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals, ShowColors } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage, Context } = pex.gl
  { hem, Vec2, Vec3, Geometry, Edge, Mat4, Spline3D, Face3, Quat, hem } = pex.geom
  { Cube, Octahedron, Sphere, Dodecahedron, Icosahedron, LineBuilder, Plane, HexSphere } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils } = pex.utils
  { map, seed, randomVec3, randomFloat } = MathUtils
  { GUI } = require('pex/gui')
  { cos, sin, PI, sqrt, abs, random, floor, min, max, exp, log } = Math
  Agent = require('flora/growth/Agent')
  Cylinder = require('geom/gen/Cylinder')
  Plane = require('geom/Plane')
  Loft = require('geom/Loft')
  Spline1D = require('geom/Spline1D')
  Gene = require('flora/plants/Gene')
  gh = require('geom/gh')
  AnimatedVec3 = require('flora/growth/AnimatedVec3')
  AnimatedFloat = require('flora/growth/AnimatedFloat')
  Config = require('flora/game/Config')
  GeomExtensions = require('geom/Extensions')
  Timeline = require('lib/timeline').Timeline
  CameraOrbiterTouch = require('utils/CameraOrbiterTouch')
  Instance = require('flora/plants/Instance')

  lerp = (va, vb, t) ->
    Vec3.create(
      va.x + (vb.x - va.x) * t,
      va.y + (vb.y - va.y) * t,
      va.z + (vb.z - va.z) * t
    )

  shuffle = (list) ->
    for i in [0...list.length]
      a = floor(random() * list.length)
      b = floor(random() * list.length)
      tmp = list[a]
      list[a] = list[b]
      list[b] = tmp
    list

  UP = new Vec3(0, 1, 0)

  class Grass
    constructor: (@app) ->
      @type = 'grass'
      Time.verbose = true
      @gl = Context.currentContext.gl
      @camera = new PerspectiveCamera(60, @app.width / @app.height, 0.25, 10)
      if @app.on then @cameraController = new CameraOrbiterTouch(@app, @camera, 2.5, 45)

      @genes = {
        numLeaves: new Gene('numLeaves', 5, 0, 20, { type: 'int' })
        pliability: new Gene('pliability', 1, 0, 2)
        distribution: new Gene('distribution', 0.2, 0, 1)
        scale: new Gene('scale', 1.2, 0.5, 2)
        bulb: new Gene('bulb', 0.07, 0.02, 0.15)
        shape: new Gene('shape',1, 0, 1)
        leafHoles: new Gene('leafHoles', 0.0, 0.0, 1)
        height: new Gene('height', 1, 0.2, 2)
        spread: new Gene('spread', 0.4, 0.1, 1)
        gravity: new Gene('gravity', -0.3, -0, -2)
        numLeafSegments: new Gene('numLeafSegments', 5, 3, 10)
        initialGrowthSpeed: new Gene('initialGrowthSpeed', 1, 0.5, 5)
        numFlowers: new Gene('numFlowers', 5, 0, 20)
        bulbsPerLeaf: new Gene('bulbsPerLeaf', 5, 1, 5, { type: 'int' })
      }

      @buildGUI()
      @buildMaterials()
      @buildMeshes()
      @buildInstances()

    buildMaterials: () ->
      @fillMaterial = new SolidColor({color: new Color(0.03, 0.03, 0.03, 1.0) });
      @fillMaterial2 = new SolidColor({color: Config.colors.yellow });
      @edgesMaterial = new SolidColor({ color: Config.colors.yellow  })
      @edgesMaterial2 = new SolidColor({ color: Config.colors.orange }) #new Color(0.23, 0.63, 0.03, 1.0)
      @dotsMaterial = new SolidColor({ color: Config.colors.gold, pointSize: 2});
      @highlightsMaterial = new SolidColor({ color: Config.colors.yellow });
      @darkGoldMaterial = new SolidColor({color: Config.secondaryColors.yellow});

    buildMeshes: () ->
      @leafCellGeom = new Cube(1, 1, 1)
      @leafCellGeom = hem().fromGeometry(@leafCellGeom)
      @leafCellGeom.vertices[0].sharp = true
      @leafCellGeom.vertices[1].sharp = true
      @leafCellGeom.vertices[2].sharp = true
      @leafCellGeom.vertices[3].sharp = true
      @leafCellGeom = @leafCellGeom
      .subdivide()
      .toFlatGeometry()
      @leafCellGeom.translate(new Vec3(0, 0, 0.5))
      @leafCellGeom.computeEdges()
      @leafCellMesh = new Mesh(@leafCellGeom, @fillMaterial2)
      @leafCellEdgesMesh = new Mesh(@leafCellGeom, @edgesMaterial2, { useEdges: true })
      @leafCellDotsMesh = new Mesh(@leafCellGeom, @dotsMaterial, { primitiveType: @gl.POINTS })

      @bulbGeom = new Dodecahedron()
      @bulbGeom = hem().fromGeometry(@bulbGeom).triangulate().toFlatGeometry()
      @bulbMesh = new Mesh(@bulbGeom, @fillMaterial)
      @bulbEdgesMesh = new Mesh(@bulbGeom, @edgesMaterial, { useEdges: true })

      @stemGeom = new Cube(1, 1, 1)
      @stemGeom = hem().fromGeometry(@stemGeom)
      @stemGeom.faces[0].edgePairLoop (edge) ->
        edge.sharp = true
      @stemGeom.faces[1].edgePairLoop (edge) ->
        edge.sharp = true
      @stemGeom = @stemGeom.subdivide().toFlatGeometry()
      @stemGeom.translate(new Vec3(0, 0, 0.5))
      @stemGeom.computeEdges()
      @stemMesh = new Mesh(@stemGeom, @fillMaterial)
      @stemEdgesMesh = new Mesh(@stemGeom, @edgesMaterial, { useEdges: true })

      @globeGeom = new HexSphere(6)
      @globeGeom = hem().fromGeometry(@globeGeom).triangulate().toFlatGeometry()
      @globeGeom.computeEdges()
      @globe = new Mesh(@globeGeom, @darkGoldMaterial, { useEdges : true })

    buildInstances: () ->
      @leafInstances = [0...200].map () -> new Instance(2.5)
      @bulbInstances = [0...@genes.numLeaves.max*@genes.bulbsPerLeaf.max].map () -> new Instance(2.5)
      @stemInstances = [0...50].map () -> new Instance(2.5)

    buildGUI: () ->
      if !@app.gui then return
      for geneName, gene of @genes
        if gene.options.enabled then @app.gui.addParam(gene.name, gene, "normalizedValue", null, () => @dirty = true)

    rebuild: () ->
      @dirty = false

      start = new Vec3(0, 0, 0)
      spread = @genes.spread.value
      numLeaves = floor(@genes.numLeaves.value)
      height = @genes.height.value
      gravity = @genes.gravity.value
      numLeafSegments = @genes.numLeafSegments.value
      initialGrowthSpeed = @genes.initialGrowthSpeed.value
      numFlowers = @genes.numFlowers.value
      distribution = @genes.distribution.value
      scale = @genes.scale.value
      shape = @genes.shape.value
      pliability = @genes.pliability.value
      bulbsPerLeaf = floor(@genes.bulbsPerLeaf.value)
      numStems = 3
      distributionRadius = 2
      numLeafSegments = 7

      leafShapeFuncU = new Spline1D([0.1/5, 0.2/5, 0.01/5])
      leafShapeFuncV = new Spline1D([0.1/5, 0.1/10, 0])
      circle = gh.circle(gh.point(0, height, 0), spread)

      if !@circlePoints
        @circlePoints = shuffle(gh.flatten(gh.divide(circle, @genes.numLeaves.max)))

      if !@startPositions
        @startPositions = [0...@genes.numLeaves.max].map () -> new Vec3(
            randomFloat(-distributionRadius/2,distributionRadius/2)
            -1
            randomFloat(-distributionRadius/2,distributionRadius/2)
          )

      seed(0)
      instanceIndex = 0
      for leafIndex in [0...numLeaves]
        instancePliability = pliability * randomFloat(0.5, 1) + 0.1 * sin(Time.seconds + (leafIndex * PI) % 2.12)
        instanceScape = scale# * randomFloat(0.5, 1.0)
        basePos = @startPositions[leafIndex].dup().scale(distribution)
        pos = @startPositions[leafIndex].dup().scale(distribution)
        bendAxis = new Vec3(0, 0, 1).transformQuat(Quat.create().setAxisAngle(UP, randomFloat(0, 360)))
        bendRot = Quat.create().setAxisAngle(bendAxis, instancePliability * 10)
        direction = new Vec3(0, 1, 0)

        for bulbIndex in [0...bulbsPerLeaf]
          @bulbInstances[leafIndex*bulbsPerLeaf + bulbIndex].targetScale.set(@genes.bulb.value, @genes.bulb.value, @genes.bulb.value)
          @bulbInstances[leafIndex*bulbsPerLeaf + bulbIndex].targetPosition
            .set(basePos.x, basePos.y - @genes.bulb.value/2, basePos.z)
            .add(randomVec3().scale(@genes.bulb.value))

        for leafSegmentIndex in [0...numLeafSegments]
          direction.transformQuat(bendRot)
          dirRot = Quat.fromDirection(direction)
          segmentScale = 1.1-Timeline.Easing.Cubic.EaseInOut(leafSegmentIndex/numLeafSegments)


          sx = instanceScape * 0.1 * segmentScale
          sy = instanceScape * 0.1/4 * segmentScale
          sz = instanceScape * 0.1 * segmentScale

          if shape > 0.5
            sx *= map(shape, 0.5, 1, 1, 0.5)
            sz *= map(shape, 0.5, 1, 1, 2)
          else
            sx *= map(shape, 0, 0.5, 1.5, 1)
            sz *= map(shape, 0, 0.5, 0.75, 1)

          @leafInstances[instanceIndex].targetScale.set(sx, sy, sz)
          @leafInstances[instanceIndex].targetPosition.setVec3(pos)
          #@leafInstances[instanceIndex].targetPosition.y -= 2
          @leafInstances[instanceIndex].targetRotation.copy(dirRot)
          pos.addScaled(direction, sz * 0.9)
          instanceIndex++

      for i in [instanceIndex...@leafInstances.length]
        @leafInstances[i].targetScale.set(0,0,0)

      instanceIndex = 0

      for leafIndex in [0...numLeaves]
        if leafIndex % 2 == 0 then continue
        instancePliability = pliability * randomFloat(0.5, 1) + 0.1 * sin(Time.seconds + (leafIndex * PI) % 2.12)
        instancePliability /= 4
        instanceScape = scale# * randomFloat(0.5, 1.0)
        basePos = @startPositions[leafIndex].dup().scale(distribution)
        pos = @startPositions[leafIndex].dup().scale(distribution)
        bendAxis = new Vec3(0, 0, 1).transformQuat(Quat.create().setAxisAngle(UP, randomFloat(0, 360)))
        bendRot = Quat.create().setAxisAngle(bendAxis, instancePliability * 10)
        direction = new Vec3(0, 1, 0)

        for leafSegmentIndex in [0...numLeafSegments/2]
          direction.transformQuat(bendRot)
          dirRot = Quat.fromDirection(direction)
          segmentScale = 1.1-Timeline.Easing.Cubic.EaseInOut(leafSegmentIndex/numLeafSegments)
          segmentScale /= 2

          sx = instanceScape * 0.025 * segmentScale
          sy = instanceScape * 0.025 * segmentScale
          sz = instanceScape * 0.5 * segmentScale

          if !@stemInstances[instanceIndex] then continue

          @stemInstances[instanceIndex].targetScale.set(sx, sy, sz)
          @stemInstances[instanceIndex].targetPosition.setVec3(pos)
          @stemInstances[instanceIndex].targetRotation.copy(dirRot)
          pos.addScaled(direction, sz)
          instanceIndex++

      for i in [instanceIndex...@stemInstances.length]
        @stemInstances[i].targetScale.set(0,0,0)

      for i in [numLeaves*bulbsPerLeaf...@genes.numLeaves.max*bulbsPerLeaf]
        @bulbInstances[i].targetScale.set(0,0,0)

    animateInstances: (instances) ->
      for instance, instanceIndex in instances
        instance.update()

    update: () ->
      @cameraController.update() if @cameraController
      if Time.frameNumber % 5 == 0 then @rebuild()

      @animateInstances(@leafInstances)
      @animateInstances(@bulbInstances)
      @animateInstances(@stemInstances)

    draw: (perspectiveCamera) ->
      camera = perspectiveCamera || @camera


      @update()
      @gl.enable(@gl.DEPTH_TEST)
      @gl.enable(@gl.CULL_FACE)
      @gl.disable(@gl.BLEND)
      @gl.blendFunc(@gl.ONE, @gl.ONE)

      @globe.draw(camera)

      numLeaves = floor(@genes.numLeaves.value)
      bulbsPerLeaf = floor(@genes.bulbsPerLeaf.value)

      @gl.lineWidth(1)

      @leafCellMesh.drawInstances(camera, @leafInstances, numLeaves)
      @stemMesh.drawInstances(camera, @stemInstances, numLeaves)
      @bulbMesh.drawInstances(camera, @bulbInstances, numLeaves * bulbsPerLeaf)

      #@gl.enable(@gl.DEPTH_TEST)
      #@gl.enable(@gl.CULL_FACE)
      #@gl.enable(@gl.BLEND)
      #@gl.blendFunc(@gl.ONE, @gl.ONE)

      @leafCellEdgesMesh.drawInstances(camera, @leafInstances, numLeaves)
      @bulbEdgesMesh.drawInstances(camera, @bulbInstances, numLeaves * bulbsPerLeaf)
      @stemEdgesMesh.drawInstances(camera, @stemInstances, numLeaves)

      @leafCellDotsMesh.drawInstances(camera, @leafInstances, numLeaves)

      @gl.disable(@gl.CULL_FACE)
      #@app.gui.draw()