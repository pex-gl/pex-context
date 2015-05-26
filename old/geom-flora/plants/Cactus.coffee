define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage, Context } = pex.gl
  { hem, Vec3, Geometry, hem, Quat, Mat4, Face3 } = pex.geom
  { Cube, Octahedron, Sphere, LineBuilder, HexSphere } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils, ObjWriter } = pex.utils
  { map, randomVec3, randomFloat, randomElement, seed, clamp } = MathUtils
  { cos, sin, PI, sqrt, abs, random, floor, min, max, exp, log } = Math
  fem = require('geom/fem')
  CameraOrbiterTouch = require('utils/CameraOrbiterTouch')
  Cylinder = require('geom/gen/Cylinder')
  HEDuplicate = require('geom/hem/HEDuplicate')
  Config = require('flora/game/Config')
  Gene = require('flora/plants/Gene')
  FlatToonShading = require('materials/FlatToonShading')
  Instance = require('flora/plants/Instance')
  gh = require('geom/gh')

  class Cactus
    constructor: (@app) ->
      @type = 'cactus'
      @gl = Context.currentContext.gl
      @camera = new PerspectiveCamera(60, @app.width / @app.height)
      #if @app.on then @cameraController = new CameraOrbiterTouch(@app, @camera, 2.5, 0*45)
      if @app.on then @cameraController = new CameraOrbiterTouch(@app, @camera, 2.5, 45)

      @step = 0
      @initGeometry()

    initGeometry: () ->
      @genes = {
        ridges: new Gene('ridges', 24, 8, 36, { type: 'int' })
        shape: new Gene('shape', 0.99, 0.5, 1.5)
        flower: new Gene('flower', 0.1, 0, 1)
        branches: new Gene('branches', 0, 1, 5)
        spikes: new Gene('spikes', 0.0, 0.4, 1)
        root: new Gene('root', 0.1, 0.4, 1)
        poison: new Gene('poison', 0, 1, 8)
      }

      @cactusMaterial = new SolidColor({color:Config.colors.gold});
      @cactusMaterialFill = new SolidColor({color:Color.Black});

      @cactusPoisonMaterial = new SolidColor({color:Config.colors.pink});

      @spikeMaterialFill = new SolidColor({color:Config.colors.skyblue});
      @spikeMaterialEdge = new SolidColor({color:Color.White});

      @cactusGeom = new Cylinder(0.5, 0.1, 18, 1)

      @cactusMaterial = new ShowNormals();
      @cactusMaterial = new FlatToonShading({colorBands: Texture2D.load('assets/toon/colors2b.png')})
      @cactusEdgesMaterial = new SolidColor({color: Config.colors.blue})

      @goldMaterial = new SolidColor({color: Config.colors.gold});
      @darkGoldMaterial = new SolidColor({color: Config.secondaryColors.skyblue});

      UP = new Vec3(0, 1, 0)
      @numSpikes = 50

      @rebuildGeom()

      @petalMaterialEdge = new SolidColor({color: new Color(0.5,0.5,0, 1)});
      @petalMaterialFill = new SolidColor({color: new Color(1, 1, 1, 1)});

      @cactusInstances = [0...10].map () -> new Instance()
      @petalInstances = [0...10].map () -> new Instance()
      @rootInstances = [0...10].map () -> new Instance()
      @spikeInstances = [0...5*@numSpikes].map () -> new Instance()
      @rootInstances = [0...5].map () -> new Instance()

      @rebuildExtraGeom()

      #@cactusInstances[0].targetScale.set(1,1,1)

    rebuildGeom: () ->
      console.log('rebuildGeom')
      @numSides = floor(@genes.ridges.intValue / 2) * 2
      ridgeSize = map(@genes.ridges.value, @genes.ridges.min, @genes.ridges.max, 1.5, 0.75)

      @cactusGeom = new Cylinder(0.15, 1, @numSides, 10)
      hemGeom = hem().fromGeometry(@cactusGeom)

      up = new Vec3(0, 1, 0)
      hemGeom.vertices.forEach (v, vi) =>
        n = v.getNormal()
        if vi < hemGeom.vertices.length - 1 - @numSides && vi > @numSides
          len = sqrt(v.position.x * v.position.x + v.position.z * v.position.z)
          r = 0.3 * ridgeSize
          if vi % 2 == 0
            r = 0.3 / (1 + ridgeSize)
          v.position.x = v.position.x/len * r
          v.position.z = v.position.z/len * r

      hemGeom.subdivide()
      #hemGeom.subdivide()
      #@cactusWireframeGeom = hemGeom.toEdgesGeometry(0.005)
      @hemGeomGeom = hemGeom.toFlatGeometry()
      @hemGeomGeom.computeEdges()
      @highlightsGeom = hemGeom.triangulate().toFlatGeometry()
      @poisonGeom = hemGeom.toFlatGeometry()

      @hemGeomGeom.translate(new Vec3(0, 0.5, 0))
      rot = new Quat().setAxisAngle(new Vec3(1, 0, 0), 90)
      @hemGeomGeom.rotate(rot)
      @highlightsGeom.translate(new Vec3(0, 0.5, 0))
      @highlightsGeom.rotate(rot)
      @poisonGeom.translate(new Vec3(0, 0.5, 0))
      @poisonGeom.scale(1.001)
      @poisonGeom.rotate(rot)

      @highlightsGeom.faces = @highlightsGeom.faces.filter (f, fi) -> fi % 2 == 0

      @poisonGeom.faces = @poisonGeom.faces.filter (f, fi) -> fi % 1 == 0

      if !@cactusMesh
        @cactusMesh = new Mesh(@hemGeomGeom, @cactusMaterialFill)
        @cactusWireframe = new Mesh(@hemGeomGeom, @cactusEdgesMaterial, { useEdges: true } )
        @cactusHightlights = new Mesh(@highlightsGeom, @cactusMaterial)
        @cactusPoison = new Mesh(@poisonGeom, @cactusPoisonMaterial)
      else
        @cactusMesh.geometry = @hemGeomGeom
        @cactusWireframe.geometry = @hemGeomGeom
        @cactusHightlights.geometry = @highlightsGeom
        @cactusPoison.geometry = @poisonGeom

      @rootGeom = new Cylinder(0.15, 1, 6, 10)
      @rootGeom.translate(new Vec3(0, 0.5, 0))
      rot = new Quat().setAxisAngle(new Vec3(1, 0, 0), 90)
      @rootGeom.rotate(rot)
      @rootGeom.computeEdges()
      @rootMeshFill = new Mesh(@rootGeom, new SolidColor({color:Color.Black}))
      @rootMeshEdges = new Mesh(@rootGeom, new SolidColor({color:Color.White}), { useEdges: true })


    rebuildExtraGeom: () ->
      petalGeom = hem().fromGeometry(new Cube(2,0.25,1))
      petalGeom.splitFaceAtPoint(petalGeom.faces[0], petalGeom.faces[0].getCenter())
      petalGeom.vertices[petalGeom.vertices.length-1].selected = true
      petalGeom.pull(2)
      petalGeom.subdivide()
      petalGeom = petalGeom.toFlatGeometry()
      petalGeom.computeEdges()
      @petalMeshEdges = new Mesh(petalGeom, @petalMaterialEdge, { useEdges: true})
      @petalMeshFill = new Mesh(petalGeom, @petalMaterialFill)

      spike = new Cube()
      spike = hem().fromGeometry(spike)
      spike.faces[4].getAllVertices().forEach (v) ->
        v.position.x *= 0.0
        v.position.y = 1.5
        v.position.z *= 0.0
      spike.subdivide()
      spike = spike.toFlatGeometry()
      rot = new Quat().setAxisAngle(new Vec3(1, 0, 0), 90)
      spike.rotate(rot)
      spike.computeEdges()

      @spikeMesh = new Mesh(spike, @spikeMaterialFill)
      @spikeMeshEdge = new Mesh(spike, @spikeMaterialEdge, { useEdges: true })

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

    rebuild: () ->
      #for cactus, cactusIndex in @cactusInstances
      #  cactus.update()

      shapeScale = @genes.shape.value
      width = map(shapeScale, 0.5, 1.5, 1, 0.5)
      numBranches = @genes.branches.intValue

      flowerPower = @genes.flower.value

      yshift = -0.2 - shapeScale/3

      @cactusInstances[0].targetScale.set(width, width, shapeScale)
      @cactusInstances[0].targetPosition.y = yshift
      #rot = new Quat().setAxisAngle(new Vec3(0, 1, 0), 90)
      rot = Quat.fromDirection(new Vec3(0,1,0)).dup()
      @cactusInstances[0].targetRotation = rot.dup()

      seed(14)

      for i in [0...numBranches]
        branchSize = 0.3
        inst = @cactusInstances[i + 1]
        inst.targetPosition = randomVec3(width/4 + (1-shapeScale)*0.5)
        inst.targetPosition.y = randomFloat(shapeScale/4, shapeScale/2) * shapeScale + yshift
        inst.targetScale.set(width/2, width/2, shapeScale/2)
        dirVec = inst.targetPosition.dup()
        dirVec.y += 0.5 + max(0, (1 - shapeScale)) * 3
        dirVec.scale(5.5)
        dirVec.y /= 4
        dir = Quat.fromDirection(dirVec).dup()
        inst.targetRotation = dir

      for i in [1+numBranches...@cactusInstances.length]
        @cactusInstances[i].targetScale.set(0, 0, 0)

      seed(0)
      spikeIndex = 0
      for cactus, cactusIndex in @cactusInstances
        for i in [0...@numSpikes]
          size = 0.1 * cactus.scale.x * @genes.spikes.value
          vertexIndex = (i * 424) % @cactusHightlights.geometry.vertices.length
          pos = @cactusHightlights.geometry.vertices[vertexIndex].dup()
          #@cactusHightlights.geometry.normals[vertexIndex].dup()
          pos.x *= cactus.scale.x
          pos.y *= cactus.scale.y
          pos.z *= cactus.scale.z
          pos.transformQuat(cactus.rotation)
          pos.add(cactus.position)
          dir = pos.dup()
          spike = @spikeInstances[spikeIndex++]
          if !spike then continue
          spike.targetScale.set(size, size, size)
          spike.targetPosition.setVec3(pos)
          spike.position.setVec3(pos)
          spike.targetRotation.copy(Quat.fromDirection(dir))

      numPetals = @petalInstances.length

      startPositions = gh.flatten(gh.divide(gh.circle(gh.point(0, shapeScale+yshift, 0), 0.1 * flowerPower), numPetals))
      targetPositions = gh.flatten(gh.divide(gh.circle(gh.point(0, shapeScale+yshift+ 0.4 + 0.2, 0), 3 * flowerPower), numPetals))

      dir = new Vec3()
      for petal, petalIndex in @petalInstances
        layerScale = 0.1 * flowerPower
        petalSize = 1.5
        dir.asSub(targetPositions[petalIndex], startPositions[petalIndex])
        dir.y += (petalIndex % 2) * 0.5
        if petalIndex % 2 == 0
          dir.scale(0.5)
        petalDir = Quat.fromDirection(dir)
        @petalInstances[petalIndex].targetPosition.setVec3(startPositions[petalIndex])
        @petalInstances[petalIndex].targetScale.set(layerScale, layerScale * petalSize, layerScale)
        @petalInstances[petalIndex].targetRotation.copy(petalDir)
      #cactus.targetPosition.set(1, 0, 2)

      @rootTargets = gh.flatten(gh.divide(gh.circle(gh.point(0, -2 - @genes.root.value, 0), 1 + @genes.root.value), @rootInstances.length - 1))

      for root, rootIndex in @rootInstances
        root.targetScale.set(0.15, 0.15, 0.5*@genes.root.value)
        root.targetPosition.set(0, -shapeScale/2, 0)
        if rootIndex > 0
          root.targetRotation.copy(Quat.fromDirection(@rootTargets[rootIndex-1]))
        else
          root.targetRotation.copy(Quat.fromDirection(new Vec3(0, -1, 0)))

      @poisonGeom.faces = @cactusMesh.geometry.faces.filter (f, fi) => (@genes.poison.intValue > 0) && (fi % (10-@genes.poison.intValue) == 0)
      if @poisonGeom.faces.length == 0
        @poisonGeom.faces.push(new Face3(0,0,0))
      @poisonGeom.faces.dirty = true

    update: () ->
      if Time.frameNumber % 2 == 0
        currNumSides = floor(@genes.ridges.intValue / 2) * 2
        if currNumSides != @numSides
          @rebuildGeom()
        @rebuild()

      @cameraController.update() if @cameraController

      @animateInstances(@cactusInstances)
      @animateInstances(@petalInstances)
      @animateInstances(@rootInstances)
      @animateInstances(@spikeInstances)
      @animateInstances(@rootInstances)

    draw: (projectionCamera) ->
      camera = projectionCamera || @camera
      @update()

      @gl.enable(@gl.CULL_FACE)
      @gl.enable(@gl.DEPTH_TEST)
      @gl.lineWidth(0.5)
      @gl.disable(@gl.BLEND)

      @cactusMesh.drawInstances(camera, @cactusInstances)
      @cactusWireframe.drawInstances(camera, @cactusInstances)
      @cactusHightlights.drawInstances(camera, @cactusInstances)
      @cactusPoison.drawInstances(camera, @cactusInstances)

      @petalMeshFill.drawInstances(camera, @petalInstances)
      @petalMeshEdges.drawInstances(camera, @petalInstances)

      @spikeMeshEdge.drawInstances(camera, @spikeInstances)
      @spikeMesh.drawInstances(camera, @spikeInstances)

      @rootMeshFill.drawInstances(camera, @rootInstances)
      @rootMeshEdges.drawInstances(camera, @rootInstances)

      @gl.lineWidth(2)
      @globe.draw(camera)
      #@globeLinesMesh.draw(@camera)