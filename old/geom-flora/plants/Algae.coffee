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
  { map, seed, randomVec3, randomFloat } = MathUtils
  { cos, sin, PI, sqrt, abs, random, floor, min, max, exp, log } = Math
  Cylinder = require('geom/gen/Cylinder')
  Config = require('flora/game/Config')
  CameraOrbiterTouch = require('utils/CameraOrbiterTouch')
  Gene = require('flora/plants/Gene')
  Instance = require('flora/plants/Instance')
  fx = require('pex/fx')

  lerp = (va, vb, t) ->
    Vec3.create(
      va.x + (vb.x - va.x) * t,
      va.y + (vb.y - va.y) * t,
      va.z + (vb.z - va.z) * t
    )

  class Algae
    constructor: (@app) ->
      @type = 'algae'
      @gl = Context.currentContext.gl
      @camera = new PerspectiveCamera(60, @app.width / @app.height)
      if @app.on then @cameraController = new CameraOrbiterTouch(@app, @camera, 2.5, 45)
      @splittingTime = 0

      @genes = {
        wallThickness: new Gene('wallThickness', 6, 3, 10, { type: 'int' })
        modularity: new Gene('modularity', 1, 1, 6, { type: 'int' })
        hair: new Gene('hair', 0.6, 0.6, 1.5)
        shape: new Gene('shape', 0, -0.6, 0.6)
        splitting: new Gene('splitting', 0, 100, 20)
        organization: new Gene('organization', 0, 0, 1)
        glow: new Gene('glow', 0.3, 0.3, 1)
        radius: new Gene('radius', 0.4, 0.1, 0.9)
      }

      @material = new SolidColor({color:Config.colors.blue});
      @material = new SolidColor({color:Config.colors.blue});
      @materialFill = new SolidColor({color:Color.Black});
      @darkGoldMaterial = new SolidColor({color: Config.secondaryColors.blue});
      #@materialFill = new Diffuse()

      @rebuildGeom()

      @cellInstances = [0...@genes.modularity.max].map () -> new Instance()

      @cloneInstances = [0...16].map () -> new Instance()
      @babyInstances = [0...16].map () -> new Instance()

      #@cookieGeom = new Cube(r, 0.24, r, 2, 1, 2)

      @mesh = new Mesh(@cookieGeom, @material, { useEdges: true })
      @meshFill = new Mesh(@cookieGeom, @materialFill)
      @mesh.rotation = Quat.create().setAxisAngle(new Vec3(1, 0, 0), 90)
      @mesh.scale.set(2,2,2)
      @meshFill.rotation = Quat.create().setAxisAngle(new Vec3(1, 0, 0), 90)
      @meshFill.scale.set(2,2,2)

      @genes.wallThickness.prevValue = @genes.wallThickness.intValue
      @genes.shape.prevValue = @genes.shape.intValue

      @hairGeom = new Cube(1/50, 1/50, 0.5)
      @hairGeom.translate(new Vec3(0, 0, 0.5))
      @hairMesh = new Mesh(@hairGeom, @material)

      @hairInstances = [0...@genes.modularity.max * 8].map () -> new Instance()

      @globeGeom = new HexSphere(6)
      @globeGeom = hem().fromGeometry(@globeGeom).triangulate().toFlatGeometry()
      @globeGeom.computeEdges()
      @globe = new Mesh(@globeGeom, @darkGoldMaterial, { useEdges : true })

    rebuildGeom: (geom) ->
      r = @genes.radius.value
      UP = new Vec3(0, 1, 0)

      wallThickness = @genes.wallThickness.intValue
      numSides = 3
      numSubdivisions = 0
      if wallThickness >=  3 then numSides = 3; numSubdivisions = 1
      if wallThickness >=  4 then numSides = 4; numSubdivisions = 1
      if wallThickness >=  5 then numSides = 4; numSubdivisions = 2
      if wallThickness >=  6 then numSides = 5; numSubdivisions = 2
      if wallThickness >=  7 then numSides = 6; numSubdivisions = 2
      if wallThickness >=  8 then numSides = 7; numSubdivisions = 2
      if wallThickness >=  9 then numSides = 7; numSubdivisions = 3
      if wallThickness >= 10 then numSides = 8; numSubdivisions = 3

      @cookieGeom = new Cylinder(r, r, numSides, 1)

      @facesToExtrude = []
      @cookieHem = hem().fromGeometry(@cookieGeom)
      @cookieHem.faces.forEach((face) => if face.getNormal().dot(UP) == 0 then @facesToExtrude.push(face))

      @cookieHem.vertices.forEach (v) ->
        len = sqrt(v.position.x*v.position.x + v.position.z*v.position.z)
        if len > 0
          v.position.x = v.position.x / len * r
          v.position.z = v.position.z / len * r

      for face in @facesToExtrude
        face.selected = true
        @cookieHem.extrude(r * (0.5 + random() * @genes.shape.value))
        face.selected = false

      if numSubdivisions
        for i in [0...numSubdivisions]
          @cookieHem.subdivide(true)
      @cookieGeom = @cookieHem.toFlatGeometry(geom)

    animateInstances: (instances) ->
      for instance, instanceIndex in instances
        instance.update()

    rebuild: () ->
      wallThickness = @genes.wallThickness.intValue
      numSides = 3
      numSubdivisions = 0
      if wallThickness >=  3 then numSides = 3; numSubdivisions = 1
      if wallThickness >=  4 then numSides = 4; numSubdivisions = 1
      if wallThickness >=  5 then numSides = 4; numSubdivisions = 2
      if wallThickness >=  6 then numSides = 5; numSubdivisions = 2
      if wallThickness >=  7 then numSides = 6; numSubdivisions = 2
      if wallThickness >=  8 then numSides = 7; numSubdivisions = 2
      if wallThickness >=  9 then numSides = 7; numSubdivisions = 3
      if wallThickness >= 10 then numSides = 8; numSubdivisions = 3

      r = @genes.radius.value
      numCells = @genes.modularity.intValue
      hairIndex = 0
      for instance, instanceIndex in @cellInstances
        if instanceIndex < numCells
          instance.targetScale.set(1,1,1)
          instance.targetPosition.set(0, (instanceIndex - numCells/2) * r + r/2, 0)
        else
          instance.targetScale.set(0,0,0)
        for h in [0...8]
            hair = @hairInstances[hairIndex]
            if !hair then continue
            hair.targetPosition.copy(instance.targetPosition)
            hair.position.copy(instance.targetPosition)
            if h < numSides
              hair.targetScale.copy(instance.targetScale)
              hair.targetScale.z *= @genes.hair.value
            else
              hair.targetScale.set(0, 0, 0)
            hair.targetRotation.setAxisAngle(new Vec3(0, 1, 0), (h+0.5)/numSides * 360)
            hair.rotation.setAxisAngle(new Vec3(0, 1, 0), (h+0.5)/numSides * 360)
            hairIndex++
      #@cellInstances[1].targetPosition.set(0,0.2,0)
      #@cellInstances[1].targetScale.set(1,1,1)

      seed(0)
      for cloneInstance, cloneInstanceIndex in @cloneInstances
        cloneInstance.organizedPosition = new Vec3(
          cos(map(cloneInstanceIndex, 0, @cloneInstances.length, 0, PI*2))
          0
          sin(map(cloneInstanceIndex, 0, @cloneInstances.length, 0, PI*2))
        )
        cloneInstance.randomPosition = cloneInstance.organizedPosition.dup().scale(randomFloat(1, 2))
        cloneInstance.randomPosition.y = randomFloat(-1, 1)
        cloneInstance.targetPosition.setVec3(lerp(cloneInstance.randomPosition, cloneInstance.organizedPosition, @genes.organization.value))

        baby = @babyInstances[cloneInstanceIndex]

        @splittingTime += Time.delta
        if @splittingTime > @genes.splitting.value
          @splittingTime = 0

        clonningStage = @splittingTime / (1 + @genes.splitting.value)

        scale = 0.1 + 0.2 * @genes.organization.value
        scale *= (1 - clonningStage)
        cloneInstance.targetScale.set(scale, scale, scale)
        baby.targetScale.set(scale, scale, scale)

        baby.targetPosition.copy(cloneInstance.position)

        cloneInstance.targetPosition.y += scale * clonningStage * 4
        baby.targetPosition.y -= scale * clonningStage * 8

        #cloneInstance.position.copy(cloneInstance.targetPosition)
        #baby.position.copy(baby.targetPosition)

        if @splittingTime == 0
          #cloneInstance.position.copy(cloneInstance.targetPosition)
          baby.position.copy(baby.targetPosition)

        #cloneInstance.scale.copy(cloneInstance.targetScale)
        #baby.scale.copy(baby.targetScale)


    update: () ->
      if @genes.wallThickness.intValue != @genes.wallThickness.prevValue || @genes.shape.value != @genes.shape.prevValue
        @genes.wallThickness.prevValue = @genes.wallThickness.intValue
        @genes.shape.prevValue = @genes.shape.value
        @rebuildGeom(@cookieGeom)

      if @cameraController
        @cameraController.update()
      #if Time.frameNumber % 2 == 0 then 
      @rebuild()

      @animateInstances(@cellInstances)
      @animateInstances(@hairInstances)
      @animateInstances(@cloneInstances)
      @animateInstances(@babyInstances)

    drawScene: () ->
      @gl.enable(@gl.DEPTH_TEST)
      @gl.disable(@gl.BLEND)
      @gl.lineWidth(2)

      @globe.draw(@camera)
      @meshFill.drawInstances(@camera, @cellInstances)
      @mesh.drawInstances(@camera, @cellInstances)

      @meshFill.drawInstances(@camera, @cloneInstances)
      @mesh.drawInstances(@camera, @cloneInstances)

      @meshFill.drawInstances(@camera, @babyInstances)
      @mesh.drawInstances(@camera, @babyInstances)

      @hairMesh.drawInstances(@camera, @hairInstances)

    drawScene2: () ->
      @gl.enable(@gl.DEPTH_TEST)
      @gl.disable(@gl.BLEND)
      @gl.lineWidth(10)
      @meshFill.drawInstances(@camera, @cellInstances)
      @mesh.drawInstances(@camera, @cellInstances)

      @meshFill.drawInstances(@camera, @cloneInstances)
      @mesh.drawInstances(@camera, @cloneInstances)

      @meshFill.drawInstances(@camera, @babyInstances)
      @mesh.drawInstances(@camera, @babyInstances)

      @hairMesh.drawInstances(@camera, @hairInstances)

    draw: (projectionCamera) ->
      @update()

      if projectionCamera
        @gl.enable(@gl.DEPTH_TEST)
        @gl.disable(@gl.BLEND)

        @globe.draw(projectionCamera)
        @gl.lineWidth(2)
        @meshFill.drawInstances(projectionCamera, @cellInstances)
        @mesh.drawInstances(projectionCamera, @cellInstances)

        @meshFill.drawInstances(projectionCamera, @cloneInstances)
        @mesh.drawInstances(projectionCamera, @cloneInstances)

        @meshFill.drawInstances(projectionCamera, @babyInstances)
        @mesh.drawInstances(projectionCamera, @babyInstances)

        @hairMesh.drawInstances(projectionCamera, @hairInstances)
      else
        glowScale = map(@genes.wallThickness.intValue, @genes.wallThickness.min, @genes.wallThickness.max, 1, 0.5)
        glowScale *= @genes.glow.value
        glowScale *= 0.5 + 0.5 * sin(Time.seconds * 4)

        color = fx().render({ drawFunc: this.drawScene.bind(this), depth:true });
        glow = color.render({ drawFunc: this.drawScene2.bind(this), depth:true });
        small = glow.downsample4()
        blurred = small.blur7().blur7()
        glowing = color.add(blurred, { scale : glowScale });
        glowing = glowing.add(blurred, { scale : glowScale });
        glowing.blit({width: @app.width, height: @app.height})

      #
      #ssao = depth.ssao({near:0.1, far:30});
      #fin = color.mult(ssao).mult(ssao).mult(ssao);
