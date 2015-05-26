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
  { map, randomVec3, randomFloat, randomChance, seed } = MathUtils
  { cos, sin, PI, sqrt, abs, random, floor, min, max, exp, log } = Math
  CameraOrbiterTouch = require('utils/CameraOrbiterTouch')
  Cylinder = require('geom/gen/Cylinder')
  Config = require('flora/game/Config')
  Gene = require('flora/plants/Gene')
  gh = require('geom/gh')
  Instance = require('flora/plants/Instance')

  lerp = (va, vb, t) ->
    Vec3.create(
      va.x + (vb.x - va.x) * t,
      va.y + (vb.y - va.y) * t,
      va.z + (vb.z - va.z) * t
    )

  class Herb
    constructor: (@app) ->
      @type = 'herb'
      @gl = Context.currentContext.gl
      @camera = new PerspectiveCamera(60, @app.width / @app.height)
      if @app.on then @cameraController = new CameraOrbiterTouch(@app, @camera, 2.5, 45)

      @randomSeed = Date.now()

      @genes = {
        density: new Gene('density', 0.3, 0.1, 1)
        branch: new Gene('branch', 4, 3, 13)
        leafSize: new Gene('leafSize', 0.7, 0.5, 2)
        leafLength: new Gene('leafLength', 0.7, 0.2, 1)
        flower: new Gene('flower', 0, 0, 1)
        #leafShape: new Gene('leafShape', 0.5, 0, 1)
        #hair: new Gene('hair', 0.7, 0, 1)
      }

      @material = new SolidColor({color:Config.colors.green});
      @materialFill = new SolidColor({color:Color.Black});
      @darkGoldMaterial = new SolidColor({color: Config.secondaryColors.green});

      @geom = hem().fromGeometry(new Cube(0.5))
      @geom.subdivide()
      @geom.extrude(0.35)
      @geom.subdivide()
      @geom = @geom.toFlatGeometry()
      @mesh = new Mesh(@geom, @material, { useEdges: true })
      @meshFill = new Mesh(@geom, @materialFill)

      @globeGeom = new HexSphere(6)
      @globeGeom = hem().fromGeometry(@globeGeom).triangulate().toFlatGeometry()
      @globeGeom.computeEdges()
      @globe = new Mesh(@globeGeom, @darkGoldMaterial, { useEdges : true })

      @flowerGeom = new Cube(0.13, 0.13, 0.13)
      @flowerGeom = hem().fromGeometry(@flowerGeom).subdivide().toFlatGeometry()
      @flowerGeom.computeEdges()
      @flowerMesh = new Mesh(@flowerGeom, new Diffuse({diffuseColor:Config.colors.pink})) #, { useEdges: true }

      #@stemGeom = hem().fromGeometry(new Cube(0.03, 0.03, 0.25)).subdivide().toFlatGeometry()
      @stemGeom = new Cube(0.02, 0.02, 0.25)
      @stemGeom.computeEdges()
      @stemGeom.translate(new Vec3(0, 0, 0.125))
      @stemMesh = new Mesh(@stemGeom, new SolidColor({color:Color.Black}))
      @stemMeshEdges = new Mesh(@stemGeom, new SolidColor({color:Config.colors.green}), { useEdges: true})

      @leafGeom = new Cube(0.06, 0.03, 0.15)
      @leafGeom.translate(new Vec3(0, 0, 0.12))
      @leafMesh = new Mesh(@leafGeom, new Diffuse({color:Config.colors.green}))

      @stemInstances = []
      @flowerInstances = []
      @leafInstances = []

      @lineBuilder = new LineBuilder()
      @lineBuilder.addLine(new Vec3(0,0,0), new Vec3(0, 0, 0))
      @lines = new Mesh(@lineBuilder, new SolidColor(), { useEdges: true})

    rebuild: () ->
      @lineBuilder.reset()
      #points = [new Vec3(0, 0, 0), new Vec3(0, 0.5, 0.2), new Vec3(0.2, 0.5, 0.2)]

      stemInstance = 0
      leafInstance = 0
      flowerInstance = 0

      for oldStem in @stemInstances
        oldStem.targetScale.set(0, 0, 0)

      for oldLeaf in @leafInstances
        oldLeaf.targetScale.set(0, 0, 0)

      for oldFruit in @flowerInstances
        oldFruit.targetScale.set(0, 0, 0)

      addLeaf = (pos, dir) =>
        if !@leafInstances[leafInstance] then @leafInstances[leafInstance] = new Instance()
        leaf = @leafInstances[leafInstance]
        leaf.position.setVec3(pos)
        leaf.targetPosition.setVec3(pos)
        scale = @genes.leafSize.value
        leaf.targetScale.set(scale,scale,scale)

        look = randomVec3(0.2)
        look.y = 0
        look.add(dir)
        leaf.targetRotation.copy(Quat.fromDirection(look))
        #q = new Quat().setAxisAngle(dir.cross(new Vec3(1, 0, 0)).normalize(), randomFloat(-00, 00))

        if !leaf.uniforms then leaf.uniforms = {}
        leaf.uniforms.diffuseColor = Config.colors.green.clone()
        leaf.uniforms.diffuseColor.r *= randomFloat(0.8, 1.2)
        leaf.uniforms.diffuseColor.b *= randomFloat(0.8, 1.2)

        if !randomChance(@genes.density.value)
          leaf.targetScale.set(0, 0, 0)
        leafInstance++

      addFruit = (pos, dir) =>
        if !@flowerInstances[flowerInstance] then @flowerInstances[flowerInstance] = new Instance()
        flower = @flowerInstances[flowerInstance]
        flower.targetPosition.copy(pos)
        flower.targetPosition.add(randomVec3(0.021))
        flower.targetScale.set(0.5, 0.5, 0.5)
        flower.targetRotation.copy(Quat.fromDirection(dir))

        if !randomChance(@genes.flower.value)
          flower.targetScale.set(0, 0, 0)
        flowerInstance++

      makeBranch = (startPos, dir, kick, rot) =>
        branchPoints = []
        n = 5
        prevP = startPos.dup()
        for i in [0...n]
          t = i/n
          r = 0.06
          h = 1
          period = 2 * PI
          p = prevP.dup().add(dir.dup().scale(t))
          if randomChance(0.5) || i == 0
            p.add(kick)
          prevP.setVec3(p)
          branchPoints.push(p)

        for p in branchPoints
          p.y -= 0.5
          @lineBuilder.addCross(p)

        spline = gh.spline(branchPoints)
        segments = gh.flatten(gh.splitPolylineSegments(gh.makePolyline(gh.divide(spline, 10))))
        dir = new Vec3()
        for segment in segments
          if !@stemInstances[stemInstance] then @stemInstances[stemInstance] = new Instance()
          stem = @stemInstances[stemInstance]
          stem.targetScale.set(1,1,1)
          stem.targetPosition.setVec3(segment.from)
          stem.position.setVec3(segment.from)
          dir.asSub(segment.to, segment.from)
          stem.targetRotation.copy(Quat.fromDirection(dir))

          for l in [0..3]
            addLeaf(segment.to, dir)
          stemInstance++

        lastSegment = segments[segments.length-1]

        dir.asSub(segment.to, segment.from).normalize().scale(0.15)
        for f in [0...7]
          t = randomFloat(0, 1)
          pos = lastSegment.to.dup().addScaled(dir, t)
          addFruit(pos, dir)

      seed(@randomSeed)
      for i in [0...@genes.branch.intValue]
        basePos = randomVec3(0.5)
        basePos.y = 0
        dir = new Vec3(0, randomFloat(0.5, 1) * @genes.leafLength.value, 0)
        kick = basePos.normalize().scale(0.2)
        makeBranch(basePos, dir, kick, 0)

    animateInstances: (instances) ->
      for instance, instanceIndex in instances
        instance.update()

    update: () ->
      if Time.frameNumber % 3 == 0 then @rebuild()
      @cameraController.update() if @cameraController

      @animateInstances(@stemInstances)
      @animateInstances(@flowerInstances)
      @animateInstances(@leafInstances)

    draw: (projectionCamera) ->
      @update()

      camera = projectionCamera || @camera

      @gl.enable(@gl.DEPTH_TEST)
      @gl.disable(@gl.BLEND)
      @globe.draw(camera)

      @lines.draw(camera)
      @gl.lineWidth(2)
      @stemMesh.drawInstances(camera, @stemInstances)
      @stemMeshEdges.drawInstances(camera, @stemInstances)
      @leafMesh.drawInstances(camera, @leafInstances)
      @flowerMesh.drawInstances(camera, @flowerInstances)