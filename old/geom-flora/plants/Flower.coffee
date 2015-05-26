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
  { map, randomFloat, seed, clamp } = MathUtils
  { cos, sin, PI, sqrt, abs, random, floor, min, max, exp, log } = Math
  Cylinder = require('geom/gen/Cylinder')
  Config = require('flora/game/Config')
  Gene = require('flora/plants/Gene')
  Instance = require('flora/plants/Instance')
  Timeline = require('lib/timeline').Timeline
  CameraOrbiterTouch = require('utils/CameraOrbiterTouch')
  gh = require('geom/gh')

  class Flower
    constructor: (@app) ->
      @type = 'flower'
      @gl = Context.currentContext.gl
      @camera = new PerspectiveCamera(60, @app.width / @app.height)
      if @app.on then @cameraController = new CameraOrbiterTouch(@app, @camera, 2.5, 25)

      @genes = {
        density: new Gene('density', 5, 5, 10)
        layers: new Gene('layers', 2, 1, 4, { type : 'int'} )
        #pistil: new Gene('pistil', 0.3, 0, 1)
        sepal: new Gene('sepal', 0.2, 0.1, 1)
        size: new Gene('size', 0.75, 0.5, 2)
        #stamen: new Gene('stamen', 0.2, 0.2, 1)
        stripes: new Gene('stripes', 0.5, 0, 1)
      }

      @petalMaterial = new SolidColor({color:Config.colors.pink.clone()});
      @leafMaterial = new SolidColor({color:Config.colors.green});
      @materialFill = new SolidColor({color:Color.Black});
      @goldMaterial = new SolidColor({color: Config.colors.gold});
      @darkGoldMaterial = new SolidColor({color: Config.secondaryColors.pink});

      UP = new Vec3(0, 1, 0)

      @maxNumPetals = @genes.density.max * @genes.layers.max

      @petalInstances = [0...@maxNumPetals].map () -> new Instance()
      @leafInstances = [0...@maxNumPetals].map () -> new Instance()
      @stemInstances = [0...30].map () -> new Instance()
      @coreInstances = [0...1].map () -> new Instance()

      #petal
      petalGeom = hem().fromGeometry(new Cube(2,0.25,1))
      petalGeom.splitFaceAtPoint(petalGeom.faces[0], petalGeom.faces[0].getCenter())
      petalGeom.vertices[petalGeom.vertices.length-1].selected = true
      petalGeom.pull(2)
      petalGeom.subdivide()
      petalGeom = petalGeom.toFlatGeometry()
      petalGeom.computeEdges()
      @petalMeshEdges = new Mesh(petalGeom, @petalMaterial, { useEdges: true})
      @petalMeshFill = new Mesh(petalGeom, @materialFill)

      coreGeom = hem().fromGeometry(new Dodecahedron(0.4)).subdivide().triangulate().toFlatGeometry()
      coreGeom.computeEdges()
      @coreMeshEdges = new Mesh(coreGeom, @petalMaterial, { useEdges: true})
      @coreMeshFill = new Mesh(coreGeom, @materialFill)
      @coreMeshEdges.scale.set(1, 0.2, 1)
      @coreMeshFill.scale.set(1, 0.2, 1)

      leafGeom = hem().fromGeometry(new Cube(2,0.25,1))
      leafGeom.splitFaceAtPoint(leafGeom.faces[0], leafGeom.faces[0].getCenter())
      leafGeom.vertices[leafGeom.vertices.length-1].selected = true
      leafGeom.vertices[leafGeom.vertices.length-1].sharp = true
      leafGeom.pull(2.3)
      leafGeom.subdivide().subdivide()
      leafGeom = leafGeom.toFlatGeometry()
      leafGeom.computeEdges()
      @leafMeshEdges = new Mesh(leafGeom, @leafMaterial, { useEdges: true})
      @leafMeshFill = new Mesh(leafGeom, @materialFill)

      @stemGeom = new Cube(1, 1, 1)
      @stemGeom = hem().fromGeometry(@stemGeom)
      @stemGeom.faces[0].edgePairLoop (edge) ->
        edge.sharp = true
      @stemGeom.faces[1].edgePairLoop (edge) ->
        edge.sharp = true
      @stemGeom = @stemGeom.subdivide().toFlatGeometry()
      @stemGeom.translate(new Vec3(0, 0, 0.5))
      @stemGeom.computeEdges()
      @stemMeshEdges = new Mesh(@stemGeom, @leafMaterial, { useEdges: true })
      @stemMeshFill = new Mesh(@stemGeom, @materialFill)

      @globeGeom = new HexSphere(6)
      @globeGeom = hem().fromGeometry(@globeGeom).triangulate().toFlatGeometry()
      @globeGeom.computeEdges()
      @globe = new Mesh(@globeGeom, @darkGoldMaterial, { useEdges : true })

      @globeLinesGeom = new LineBuilder()
      @circleLines = gh.flatten(
        gh.splitPolylineSegments(
          gh.makePolyline(
            gh.divide(
              gh.circle(gh.point(0, 0, 0), 1), 8
            )
          ,true)
        )
      )

      for line in @circleLines
        @globeLinesGeom.addLine(line.from, line.to)

      @globeLinesMesh = new Mesh(@globeLinesGeom, @goldMaterial, { primitiveType : @gl.LINES })


    animateInstances: (instances) ->
      for instance, instanceIndex in instances
        instance.update()

    update: () ->
      if @cameraController
        @cameraController.update()
      if Time.frameNumber % 5 == 0 then @rebuild()

      @petalMaterial.uniforms.color.b = @genes.stripes.value

      @animateInstances(@petalInstances)
      @animateInstances(@leafInstances)
      @animateInstances(@stemInstances)
      @animateInstances(@coreInstances)

    rebuild: () ->
      petalInstanceIndex = 0
      numLayers = @genes.layers.value
      numPetals = @genes.density.value
      petalSize = @genes.size.value
      sepalLength = @genes.sepal.value
      layerRotation = new Quat()
      UP = new Vec3(0, 1, 0)
      layerDir = new Vec3()
      layerPos = new Vec3()

      seed(2)

      @coreInstances[petalInstanceIndex].targetPosition.set(0, sepalLength / 2, 0)
      @coreInstances[petalInstanceIndex].targetScale.set(1,0.5,1)

      for layerI in [0...numLayers]
        startPositions = gh.flatten(gh.divide(gh.circle(gh.point(0, sepalLength / 2, 0), 0.2), numPetals))
        targetPositions = gh.flatten(gh.divide(gh.circle(gh.point(0, sepalLength / 2 + 0.4 - 0.6*numLayers/@genes.layers.max + 0.2 * layerI, 0), 0.6 - 0.1 * layerI), @genes.density.value))
        layerScale = map(numLayers, @genes.layers.min, @genes.layers.max, 0.2, 0.35)
        layerScale *= map(layerI, 0, numLayers, 1, 0.5)
        for petalI in [0...numPetals]
          layerRotation.setAxisAngle(UP, 360/numPetals/2 * layerI)
          layerPos.copy(startPositions[petalI])
          layerDir.copy(targetPositions[petalI])
          layerDir.y += 0.15 + 0.1 * sin(Time.seconds)
          layerPos.transformQuat(layerRotation)
          layerDir.transformQuat(layerRotation)
          rotation = Quat.fromDirection(layerDir)
          @petalInstances[petalInstanceIndex].targetPosition.setVec3(layerPos)
          @petalInstances[petalInstanceIndex].targetScale.set(layerScale, layerScale, layerScale * petalSize)
          @petalInstances[petalInstanceIndex].targetRotation.copy(rotation)
          petalInstanceIndex++

      for i in [petalInstanceIndex...@petalInstances.length]
        @petalInstances[i].targetScale.set(0, 0, 0)
        @petalInstances[i].targetPosition.set(0, sepalLength/2, 0)

      numLeafLayers = 3
      numLeafs = 5
      leafInstanceIndex = 0
      for layerI in [0...numLeafLayers]
        startPositions = gh.flatten(gh.divide(gh.circle(gh.point(0, sepalLength / 2 + -0.05 - 0.05 * layerI, 0), 0.2 - 0.06 * layerI), numLeafs*2))
        targetPositions = gh.flatten(gh.divide(gh.circle(gh.point(0,sepalLength / 2 +  0.3 - 0.1 * numLayers, 0), 0.5), numLeafs*2))
        for leafI in [0...numLeafs]
          leafPos = startPositions[(leafI*2+layerI)%startPositions.length]
          leafDir = targetPositions[(leafI*2+layerI)%targetPositions.length].dup().sub(leafPos)
          rotation = Quat.fromDirection(leafDir)
          layerScale = 0.1 * map(numLayers, @genes.layers.min, @genes.layers.max, 1, 2)
          @leafInstances[leafInstanceIndex].targetPosition.setVec3(leafPos)
          @leafInstances[leafInstanceIndex].targetScale.set(layerScale, layerScale, layerScale)
          @leafInstances[leafInstanceIndex].targetRotation.copy(rotation)
          leafInstanceIndex++


      instancePliability = 0.1
      pos = Vec3.create(0, -0.1 + sepalLength / 2 ,0)
      bendAxis = new Vec3(0, 0, 1).transformQuat(Quat.create().setAxisAngle(UP, randomFloat(0, 360)))
      bendRot = Quat.create().setAxisAngle(bendAxis, instancePliability * 10)
      direction = new Vec3(0, -1, 0)
      pos1 = null
      pos2 = null
      for stemSegmentIndex in [0...10]
        direction.transformQuat(bendRot)
        dirRot = Quat.fromDirection(direction)
        segmentScale = sepalLength

        sx = 0.025 * 1
        sy = 0.025 * 1
        sz = 0.1 * segmentScale

        if stemSegmentIndex == 5
          pos1 = pos.dup()

        if stemSegmentIndex == 7
          pos2 = pos.dup()

        @stemInstances[stemSegmentIndex].targetScale.set(sx, sy, sz)
        @stemInstances[stemSegmentIndex].targetPosition.setVec3(pos)
        @stemInstances[stemSegmentIndex].targetRotation.copy(dirRot)
        pos.addScaled(direction, sz)


      direction = new Vec3(1, 1, 0)
      bendAxis = new Vec3(0, 1, 0).transformQuat(Quat.create().setAxisAngle(UP, randomFloat(0, 360)))
      bendRot = Quat.create().setAxisAngle(bendAxis, 10)
      pos = pos1
      for stemSegmentIndex in [10...20]
        if !pos1
          @stemInstances[stemSegmentIndex].targetScale.set(0, 0, 0)
          continue
        direction.transformQuat(bendRot)
        dirRot = Quat.fromDirection(direction)
        segmentScale = @genes.sepal.value

        sx = 0.025 * 1
        sy = 0.025 * 1
        sz = 0.06 * segmentScale * clamp(map(sepalLength, 0.4, 0.8, 0, 1), 0, 1)

        @stemInstances[stemSegmentIndex].targetScale.set(sx, sy, sz)
        @stemInstances[stemSegmentIndex].targetPosition.setVec3(pos)
        @stemInstances[stemSegmentIndex].targetRotation.copy(dirRot)
        pos.addScaled(direction, sz * 0.8)

      direction = new Vec3(-1, 1, 0)
      pos = pos2
      for stemSegmentIndex in [20...30]
        if !pos2
          @stemInstances[stemSegmentIndex].targetScale.set(0, 0, 0)
          continue
        direction.transformQuat(bendRot)
        dirRot = Quat.fromDirection(direction)
        segmentScale = @genes.sepal.value

        sx = 0.025 * 1
        sy = 0.025 * 1
        sz = 0.06 * segmentScale * clamp(map(sepalLength, 0.7, 1, 0, 1), 0, 1)

        @stemInstances[stemSegmentIndex].targetScale.set(sx, sy, sz)
        @stemInstances[stemSegmentIndex].targetPosition.setVec3(pos)
        @stemInstances[stemSegmentIndex].targetRotation.copy(dirRot)
        pos.addScaled(direction, sz)

    draw: (projectionCamera) ->
      camera = projectionCamera || @camera
      @update()

      @gl.enable(@gl.DEPTH_TEST)
      @gl.disable(@gl.BLEND)
      @gl.lineWidth(2)

      @petalMeshFill.drawInstances(camera, @petalInstances)
      @petalMeshEdges.drawInstances(camera, @petalInstances)

      @coreMeshFill.drawInstances(camera, @coreInstances)
      @coreMeshEdges.drawInstances(camera, @coreInstances)

      @leafMeshFill.drawInstances(camera, @leafInstances)
      @leafMeshEdges.drawInstances(camera, @leafInstances)

      @stemMeshFill.drawInstances(camera, @stemInstances)
      @stemMeshEdges.drawInstances(camera, @stemInstances)

      @globe.draw(camera)

      #@globeLinesMesh.draw(@camera)