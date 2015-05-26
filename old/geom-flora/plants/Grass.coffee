define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals, ShowColors } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage, Context } = pex.gl
  { hem, Vec2, Vec3, Geometry, Edge, Mat4, Spline3D, Face3 } = pex.geom
  { Cube, Octahedron, Sphere, Dodecahedron, Icosahedron, LineBuilder, Plane } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils } = pex.utils
  { map, seed, randomVec3, randomFloat } = MathUtils

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

  class Grass
    constructor: (@app) ->
      @type = 'grass'
      @gl = Context.currentContext.gl
      @camera = new PerspectiveCamera(60, @app.width / @app.height, 0.5, 5)
      if @app.on then @arcball = new Arcball(@app, @camera, 2.5)

      UP = new Vec3(0, 1, 0)

      @solidMaterial = new SolidColor({color: Color.Black });
      @linesMaterial = new SolidColor({color: new Color(0.2, 0.3, 0.5, 1.0) });
      @dotsMaterial = new SolidColor({ color: Config.colors.gold, pointSize: 3});
      @highlightsMaterial = new SolidColor({ color: Config.colors.yellow });
      @darkGoldMaterial = new SolidColor({color: Config.secondaryColors.yellow});

      @geom = new Cube(0.5, 0.02, 0.15, 3, 3, 3)
      @geom = hem().fromGeometry(@geom)
        .selectFacesBy((face) -> face.getNormal().dot(UP) == 1)
      @geom.subdivideFaceCenter().pull(1)
      @geom = @geom.toFlatGeometry()
      @geom = new Cube(0.01)
      @mesh = new Mesh(@geom, @linesMaterial, { useEdges: true })

      @lineBuilder = new LineBuilder()
      @linesMesh = new Mesh(@lineBuilder, new ShowColors(), { primitiveType: @gl.LINES })

      @genes = {
        height: new Gene('height', 1, 0.2, 2, { enabled: false})
        numLeaves: new Gene('numLeaves', 3, 0, 20, { type: 'int' })
        spread: new Gene('spread', 0.4, 0.1, 1, { enabled: false})
        distribution: new Gene('distribution', 0.2, 0, 1, { enabled: true})
        gravity: new Gene('gravity', -0.3, -0, -2, { enabled: false})
        numLeafSegments: new Gene('numLeafSegments', 5, 3, 10, { enabled: false})
        initialGrowthSpeed: new Gene('initialGrowthSpeed', 1, 0.5, 5, { enabled: false})
        numFlowers: new Gene('numFlowers', 5, 0, 20, { enabled: false})
        scale: new Gene('scale', 2.5, 0.9, 2.5, { enabled: true})
        bulb: new Gene('bulb', 0.1, 0.0, 1, { enabled: true})
        leafHoles: new Gene('leafHoles', 0.0, 0.0, 1, { enabled: true})
        shape: new Gene('shape', 0.0, 0.0, 1, { enabled: true})
      }

      @globeGeom = new HexSphere(6)
      @globeGeom = hem().fromGeometry(@globeGeom).triangulate().toFlatGeometry()
      @globeGeom.computeEdges()
      @globe = new Mesh(@globeGeom, @darkGoldMaterial, { useEdges : true })

      @scene = new Scene()
      @hightlightsScene = new Scene()
      @buildGUI()
      @rebuild()

    buildGUI: () ->
      if !@app.gui then return
      for geneName, gene of @genes
        if gene.options.enabled then @app.gui.addParam(gene.name, gene, "normalizedValue", null, () => @dirty = true)

    rebuild: () ->
      @dirty = false

      seed(Time.seconds)

      @lineBuilder.reset()
      #@scene.drawables.length = 0

      start = new Vec3(0, 0, 0)
      spread = @genes.spread.value
      numLeaves = @genes.numLeaves.value
      height = @genes.height.value
      gravity = @genes.gravity.value
      numLeafSegments = @genes.numLeafSegments.value
      initialGrowthSpeed = @genes.initialGrowthSpeed.value
      numFlowers = @genes.numFlowers.value
      distribution = @genes.distribution.value
      scale = @genes.scale.value
      numStems = 3
      distributionRadius = 2

      leafShapeFuncU = new Spline1D([0.1/5, 0.2/5, 0.01/5])
      leafShapeFuncV = new Spline1D([0.1/5, 0.1/10, 0])
      circle = gh.circle(gh.point(0, height, 0), spread)
      circlePoints = shuffle(gh.flatten(gh.divide(circle, @genes.numLeaves.max)))

      if !@startPositions
        @startPositions = [0...@genes.numLeaves.max].map () -> new AnimatedVec3(
          new Vec3(
            randomFloat(-distributionRadius/2,distributionRadius/2)
            0
            randomFloat(-distributionRadius/2,distributionRadius/2)
          )
        )

      for startPosition, startPositionIndex in @startPositions
        startPosition.target.copy(startPosition.initialValue).scale(distribution)
        startPosition.target.copy(startPosition.initialValue).scale(distribution)
        startPosition.update()
        @lineBuilder.addCross(circlePoints[startPositionIndex], 0.05, Color.Red)


      for startPosition, startPositionIndex in @startPositions
        if startPositionIndex < numLeaves
          #startPosition.leafStemSpline = null
          #@scene.remove(startPosition.linesMesh)
          #startPosition.linesMesh = null
          if !startPosition.leafStemSpline
            #make spline
            tip = circlePoints[startPositionIndex].dup()#.add(startPosition.value)
            agent = new Agent(new Vec3(0,0,0))
            agent.velocity = tip.dup().normalize().scale(height)
            agent.velocity.y -= random() * 0.5
            agent.forces.push(new Vec3(0, gravity, 0))
            agent.updateSteps(numLeafSegments, 1/numLeafSegments)
            steps = gh.flatten(gh.splitPolylineSegments(gh.polyline(agent.points)))
            startPosition.leafStemSpline = new Spline3D(agent.points)
            startPosition.leafStemSplineSteps = steps
            initialNormal = circlePoints[startPositionIndex].dup().normalize()
            right = Vec3.create().asCross(initialNormal, new Vec3(initialNormal.x, 0, initialNormal.z).normalize())
            startPosition.initialNormal = Vec3.create().asCross(initialNormal, right)
            startPosition.scale = new AnimatedFloat(0, randomFloat(0, 0.5))
          if !startPosition.linesMesh
            leaf = new Loft(startPosition.leafStemSpline, { numSteps: 10, ru : leafShapeFuncU, rv: leafShapeFuncV, initialNormal: startPosition.initialNormal })
            leafHightlights = new Geometry({
              vertices: true
              faces: true
            })
            leaf.vertices.map (v) -> leafHightlights.vertices.push(v.dup())
            leaf.faces.filter((f, fi) -> fi % 19 == 0).map (f, fi) -> leafHightlights.faces.push(new Face3(f.a, f.b, f.c))
            startPosition.linesMesh = new Mesh(leaf, @linesMaterial, { primitiveType: @gl.LINES })
            startPosition.hightlightsMesh = new Mesh(leafHightlights, @highlightsMaterial)
            @scene.add(startPosition.linesMesh)
            #@scene.add(startPosition.hightlightsMesh)
            @hightlightsScene.add(startPosition.hightlightsMesh)
          startPosition.linesMesh.position = startPosition.value.dup().add(new Vec3(0, -0.5, 0))
          startPosition.hightlightsMesh.position = startPosition.value.dup().add(new Vec3(0, -0.5, 0))
          startPosition.scale.target = scale
          startPosition.scale.update()
          startPosition.linesMesh.scale.set(startPosition.scale.value, startPosition.scale.value, startPosition.scale.value)
          startPosition.hightlightsMesh.scale.set(startPosition.scale.value, startPosition.scale.value, startPosition.scale.value)
          for step in startPosition.leafStemSplineSteps
            @lineBuilder.addLine(step.from.dup().add(startPosition.value), step.to.dup().add(startPosition.value))
            @lineBuilder.addCross(step.to.dup().add(startPosition.value), 0.05, Color.Red)
        else
          startPosition.leafStemSpline = null
          if startPosition.linesMesh
            startPosition.scale.target = 0
            startPosition.scale.update()
            startPosition.linesMesh.scale.set(startPosition.scale.value, startPosition.scale.value, startPosition.scale.value)
            if startPosition.scale.value < 0.01
              @scene.remove(startPosition.linesMesh)
              startPosition.linesMesh = null

    update: () ->
      #if @dirty then
      @rebuild()

    draw: (perspectiveCamera) ->
      camera = perspectiveCamera || @camera
      @update()

      @gl.depthRange(0.001, 1.0)
      @gl.enable(@gl.DEPTH_TEST)
      @gl.enable(@gl.CULL_FACE)
      @gl.cullFace(@gl.FRONT)
      #@mesh.draw(@camera)
      #@linesMesh.draw(@camera)
      #@scene.draw(@camera)
      for d in @scene.drawables
        d.setMaterial(@solidMaterial)
        d.primitiveType = @gl.TRIANGLES
        d.draw(@camera)
        d.setMaterial(@linesMaterial)
        @gl.lineWidth(2)
        d.primitiveType = @gl.LINES
        d.draw(@camera)
        d.setMaterial(@dotsMaterial)
        d.primitiveType = @gl.POINTS
        #d.draw(@camera)

      @gl.depthRange(0.0, 0.998)
      for d in @hightlightsScene.drawables
        d.draw(@camera)

      @gl.disable(@gl.CULL_FACE)

      @globe.draw(camera)