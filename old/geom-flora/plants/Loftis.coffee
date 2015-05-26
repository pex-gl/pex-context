define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals, ShowColors } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage, Context } = pex.gl
  { hem, Vec3, Geometry, Edge, Mat4, Spline3D, Quat } = pex.geom
  { Cube, Octahedron, Sphere, Dodecahedron, Icosahedron, LineBuilder } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils } = pex.utils
  { map, randomFloat, randomInt, seed } = MathUtils
  { cos, sin, PI, sqrt, abs, random, floor, min, max, exp, log } = Math
  { Scene } = pex.scene
  { GUI } = pex.gui
  Spline1D = require('geom/Spline1D')
  Loft = require('geom/Loft')
  settings = require('utils/Settings')


  mix = (a, b, t) ->
    a + t * (b - a)

  Window.create
    settings:
      fullscreen: Platform.isBrowser
      width: 2560
      height: 1380
    init: () ->
      Time.verbose = true

      @gui = new GUI(this)
      settings().init(@gui)

      @gl = Context.currentContext.gl
      @camera = new PerspectiveCamera(60, @width / @height)
      @arcball = new Arcball(this, @camera, 7.5)

      @material = new ShowNormals()

    makeScene: () ->
      numSteps = settings().getInt('numSteps', 20, 10, 500)
      numSegments = settings().getInt('numSegments', 8, 4, 32)
      wireframe = settings().getBool('wireframe', true)
      numLeafs = settings().getInt('numLeafs', 3, 1, 30)
      numLayers = settings().getInt('numLayers', 3, 1, 10)
      maxBending = settings().getFloat('maxBending', 0.5, 0, 10)
      height = settings().getFloat('height', 1, 0, 5)
      thickness = settings().getFloat('thickness', 0.5, 0, 3)

      ru = new Spline1D([0..numSteps-1].map (i) ->
        t = i/numSteps
        if i == 0 then 0
        else if i >= numSteps-1 then 0
        else 0.05 + t * t * (0.35 + 0.3 * sin(t*PI*6))
      )
      rv = new Spline1D([0..numSteps-1].map (i) ->
        if i == 0 then 0
        else if i >= numSteps-1 then 0
        else (0.15 + 0.05 * sin(i/numSteps*PI*6))/2
      )

      r = new Spline1D([0..numSteps-1].map (i) ->
        t = i/numSteps
        0.15 * (1 - t)
      )

      @scene = new Scene()

      UP = new Vec3(0, 1, 0)

      seed(0)
      numPoints = 10
      for layer in [0...numLayers]
        for i in [0...numLeafs]
          bending = 1/numPoints/2 * randomFloat(maxBending, 1)
          d = 0
          rotation = Quat.create().setAxisAngle(UP, 360 * 0.2 * i/numLeafs + 90 * layer/numLayers)
          plantPoints = randomInt(numPoints/2, numPoints)
          points = for j in [0...plantPoints]
            d += bending * j
            x = d
            y = height * j * 0.5 - d + layer * 0.6 - height + 0.5
            z = 0
            p = new Vec3(x, y, z)

          path = new Spline3D(points)
          loft = new Loft(path, { numSteps : numSteps, numSegments: numSegments, caps: false, r: r, ru2 : ru, rv2: rv })
          loft.rotate(rotation)
          loft = hem().fromGeometry(loft).toFlatGeometry()
          mesh = new Mesh(loft, @material, { useEdges: wireframe })
          mesh.position.y = -2
          mesh.position.x = randomFloat(-1, 1)
          mesh.position.z = randomFloat(-1, 1)
          @scene.add(mesh)

    makeDebugScene: () ->

      makeTorus = (p, q) ->
        (t) ->
          a = 2 * PI * t
          r = cos(q*a) + 2
          x = r * cos(p*a)
          y = r * sin(p*a)
          z = -sin(q*a)
          return new Vec3(x,y,z)

      p = settings().getInt('p', 3, 1, 5)
      q = settings().getInt('q', 1, -5, 5)

      torus = makeTorus(p, q)

      splines = []
      all = settings().getBool('all', false)
      if all
        splines.push(new Spline3D([
          new Vec3(-2, 0, 0)
          new Vec3(-1, 0, 0)
          new Vec3( 1, 0, 0)
          new Vec3( 2, 0, 0)
        ]));
        splines.push(new Spline3D([
          new Vec3(0, -2, 0)
          new Vec3(0, -1, 0)
          new Vec3(0,  1, 0)
          new Vec3(0,  2, 0)
        ]));
        splines.push(new Spline3D([
          new Vec3(0, 0, -2)
          new Vec3(0, 0, -1)
          new Vec3(0, 0,  1)
          new Vec3(0, 0,  2)
        ]));
      splines.push(new Spline3D([
        new Vec3(-2,  1, 0)
        new Vec3(-1,  0, 0)
        new Vec3( 1,  1, 2)
        new Vec3( 2, -1, 3)
      ]));
      if all
        splines.push(new Spline3D([0..100].map((i) -> torus(i/100)), true))
        splines.push(new Spline3D([
          new Vec3(-2, 2, 0)
          new Vec3(-2,-2, 0)
          new Vec3( 0, 0, 0)
          new Vec3( 2,-2, 0)
          new Vec3( 3, 0, 0)
          new Vec3( 2, 2, 0)
        ], true));
        splines.push(new Spline3D([
          new Vec3( 1, -2, 2)
          new Vec3( 0, -2,-2)
          new Vec3( 0,  2,-2)
          new Vec3(-1,  2, 2)
        ]));


      @scene = new Scene()

      numSteps = settings().getInt('numSteps', 100, 10, 500)
      spin = settings().getFloat('spin', -1.82, -10, 10)
      wireframe = settings().getBool('wireframe', true)

      ru = new Spline1([0..numSteps-1].map (i) ->
        if i == 0 then 0
        else if i >= numSteps-1 then 0
        else 0.4 + 0.35 * sin(i/numSteps*PI*4)
      )
      rv = new Spline1([0..numSteps-1].map (i) ->
        if i == 0 then 0
        else if i > numSteps-5 then 0
        else (0.15 + 0.05 * sin(i/numSteps*PI*6))/2
      )

      for spline, splineIndex in splines
        lineBuilder = new LineBuilder()
        loft = new Loft(spline, { numSteps: numSteps, closed: spline.loop, spin: spin, ru: ru, rv:rv });
        loft = hem().fromGeometry(loft).toFlatGeometry()
        mesh = new Mesh(loft, new ShowNormals(), { useEdges: wireframe });
        #debugLines = new Mesh(loft.toDebugLines(), new ShowColors(), { primitiveType: @gl.LINES })
        #debugPoints = new Mesh(loft.toDebugPoints(), new ShowColors(), { primitiveType: @gl.LINES })
        mesh.position.x = ( splineIndex - splines.length/2 + 0.5) * 5
        #debugLines.position.x = ( splineIndex - splines.length/2 + 0.5) * 5
        #debugPoints.position.x = ( splineIndex - splines.length/2 + 0.5) * 5
        @scene.add(mesh)
        #@scene.add(debugLines)
        #@scene.add(debugPoints)

    draw: () ->
      @gl.clearColor(0.2, 0.26, 0.3, 1.0)
      @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
      @gl.enable(@gl.DEPTH_TEST)

      if settings().isDirty() || !@scene then @makeScene()

      @scene.draw(@camera)
      @gui.draw()
