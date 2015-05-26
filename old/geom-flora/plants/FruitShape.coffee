define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage } = pex.gl
  { hem, Vec3, Geometry, Edge, Mat4, Spline3D } = pex.geom
  { Cube, Octahedron, Sphere, Dodecahedron, Icosahedron, LineBuilder } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils } = pex.utils
  { map } = MathUtils
  { cos, sin, PI, sqrt, abs, random, floor, min, max, exp, log } = Math
  { GUI } = pex.gui

  pex.require ['geom/gen/Cylinder', 'lib/PerlinNoise'], (Cylinder, PerlinNoise) ->
    Window.create
      settings:
        fullscreen: Platform.isBrowser
      init: () ->
        @step = 0
        @initUI()
        @initScene()
        @initGeometry()
        @initCameras()

      initUI: () ->
        @on 'mouseDragged', (e) =>
          @step = 0

      initScene: () ->
        @scene = new Scene()

      initGeometry: () ->
        @cactusMaterial = new ShowNormals();

        cylinderR = 0.05
        #@cactusGeom = new Sphere(0.5)
        @cactusGeom = new Cylinder(cylinderR, 1, 24, 16, false);
        @cactusGeom.computeEdges()
        @cactusGeom.computeSmoothNormals()
        @cactusGeom.vertices.forEach (v) ->
          v.original = v.dup()

        @cactusGeom.faces = @cactusGeom.faces.filter (f, fi) -> fi % 19 == 0

        #@cactusWireGeom = new Sphere(0.5);
        @cactusWireGeom = new Cylinder(cylinderR, 1, 24, 16, false);
        @cactusWireGeom.computeEdges()
        @cactusWireGeom.computeSmoothNormals()
        @cactusWireGeom.vertices.forEach (v) ->
          v.original = v.dup()

        #@cactusWireHighlightsGeom = new Sphere(0.51);
        @cactusWireHighlightsGeom = new Cylinder(cylinderR+0.01, 1, 24, 16, false);
        @cactusWireHighlightsGeom.computeEdges()
        @cactusWireHighlightsGeom.computeSmoothNormals()
        @cactusWireHighlightsGeom.vertices.forEach (v) ->
          v.original = v.dup()

        @cactusWireHighlightsGeom.edges = @cactusWireHighlightsGeom.edges.filter (e, ei) -> ei % 15 == 0

        evalPos = (pos, r, theta, phi) ->
          pos.x = r * sin(theta) * sin(phi);
          pos.y = r * cos(theta);
          pos.z = r * sin(theta) * cos(phi);

        @numSides = 72
        @numSegments = 50
        @r = 0.25

        @cactusWireGeom = new Geometry({vertices:true, edges:true})
        for side in [0..@numSides-1]
          vertexCount = @cactusWireGeom.vertices.length
          for segment in [0..@numSegments-1]
            @cactusWireGeom.vertices.push(new Vec3(
              @r * cos(2 * PI * side/@numSides)
              map(segment, 0, @numSegments-1, -@r, @r)
              @r * sin(2 * PI * side/@numSides)
            ))
            if segment < @numSegments-1
              @cactusWireGeom.edges.push(new Edge(vertexCount+segment, vertexCount+segment+1))

        @numSides = 32
        @numSegments = 20

        #@cactusMesh = new Mesh(@cactusGeom, new SolidColor({color: new Color(0.2, 0.6, 0.7, 1.0)}))
        #@cactusWireframe = new Mesh(@cactusWireGeom, new SolidColor({color: new Color(0.2, 0.3, 0.5, 1.0)}), { useEdges: true } )
        #@cactusWireframe = new Mesh(@cactusWireGeom, new SolidColor({color: new Color(0.2, 0.3, 0.5, 1.0), pointSize:3}), { primitiveType: @gl.POINTS } )
        @cactusWireframe = new Mesh(@cactusWireGeom, new SolidColor({color: new Color(0.2, 0.3, 0.5, 1.0), pointSize:3}), { useEdges: true } )
        #@cactusWireframeFill = new Mesh(@cactusWireGeom, new SolidColor({color: new Color(0,0,0,0.55), color2: new Color(0.7, 0.3, 0.5, 1.0)}))
        #@cactusWireframeHighlights = new Mesh(@cactusWireHighlightsGeom, new SolidColor({color: new Color(0.7, 0.3, 0.5, 1.0)}), { useEdges: true })
        @cactusWireframePoints = new Mesh(@cactusWireGeom, new SolidColor({pointSize: 2, color: new Color(0.7, 0.7, 0.5, 1.0)}), { primitiveType: @gl.POINTS })
        #@scene.add(@cactusMesh)
        #@scene.add(@cactusWireframeFill)
        @scene.add(@cactusWireframe)

        @appleCurve = 1
        @gui = new GUI(this)
        @gui.addLabel('params')
        @gui.addParam('appleCurve', this, 'appleCurve', { min:1, max:2})
        @gui.addParam('r', this, 'r', { min:0.1, max:0.5})
        @gui.addParam('numSides', this, 'numSides', {min:3, max:72, step:1})
        @gui.addParam('numSegments', this, 'numSegments', {min:10, max:50, step:1})

      initCameras: () ->
        @camera = new PerspectiveCamera(60, @width/@height)
        @arcball = new Arcball(this, @camera, 1)

      draw: () ->
        R = 0.052
        ###
        @cactusGeom.vertices.forEach (v, vi) =>
          r = R
          v.x = v.original.x + r * @cactusGeom.normals[vi].x * sin(v.original.x*20 + v.original.y*20 + Time.seconds)
          v.y = v.original.y + r * @cactusGeom.normals[vi].y * sin(v.original.z*20 + v.original.y*20 + Time.seconds)
          v.z = v.original.z + r * @cactusGeom.normals[vi].z * cos(v.original.z*20 + v.original.z*20 + Time.seconds)
          #r = MathUtils.map(v.original.y, -0.5, 0.5, -0.5, 0.2)
          #v.x += v.original.x + r * @cactusGeom.normals[vi].x
          #v.y += v.original.y + r * @cactusGeom.normals[vi].y
          #v.z += v.original.z + r * @cactusGeom.normals[vi].z

        @cactusWireGeom.vertices.forEach (v, vi) =>
          r = R
          #r += MathUtils.map(v.original.y, -0.5, 0.5, 1, 1)
          v.x = v.original.x + r * @cactusWireGeom.normals[vi].x * sin(v.original.x*20 + v.original.y*20 + Time.seconds)
          v.y = v.original.y + r * @cactusWireGeom.normals[vi].y * sin(v.original.z*20 + v.original.y*20 + Time.seconds)
          v.z = v.original.z + r * @cactusWireGeom.normals[vi].z * cos(v.original.z*20 + v.original.z*20 + Time.seconds)
          #r = MathUtils.map(v.original.y, -0.5, 0.5, -0.5, 0.2)
          #v.x += v.original.x + r * @cactusGeom.normals[vi].x
          #v.y += v.original.y + r * @cactusGeom.normals[vi].y
          #v.z += v.original.z + r * @cactusGeom.normals[vi].z

        @cactusWireHighlightsGeom.vertices.forEach (v, vi) =>
          r = R
          #r += MathUtils.map(v.original.y, -0.5, 0.5, 1, 1)
          v.x = v.original.x + r * @cactusWireGeom.normals[vi].x * sin(v.original.x*20 + v.original.y*20 + Time.seconds)
          v.y = v.original.y + r * @cactusWireGeom.normals[vi].y * sin(v.original.z*20 + v.original.y*20 + Time.seconds)
          v.z = v.original.z + r * @cactusWireGeom.normals[vi].z * cos(v.original.z*20 + v.original.z*20 + Time.seconds)
        ###
        #@cactusGeom.vertices.dirty = true
        #@cactusWireGeom.vertices.dirty = true
        #@cactusWireHighlightsGeom.vertices.dirty = true

        self = this

        smin = (a, b, k) ->
          a = -a
          b = -b
          res = exp( -k*a ) + exp( -k*b )
          -log(res)/k

        evalAppleRadius = (r, t, c) ->
          c = c || 1
          r = r * (0.5 + 0.5 * (2-c))
          r * (c-cos(a))

        evalApple = (t, a) ->
          [
            evalAppleRadius(self.r, a, self.appleCurve) * sin(a)
            evalAppleRadius(self.r, a, self.appleCurve) * cos(a) + self.r/2
          ]

        makeSpline = (points) ->
          points3d = points.map (p) -> new Vec3(p[0], p[1], 0)
          spline = new Spline3D(points3d)

        if !@pearShape then @pearShape = makeSpline([[0,0], [0.1,0.25], [0.25,0.25], [0.35,0.5], [0.65,1], [1,0]])
        evalPear = (t, a) ->
          p = self.pearShape.getPointAt(t)
          [self.r * p.y, 2*self.r*(p.x - 0.5)]

        m = new Mat4()
        for side in [0..@numSides-1]
          vertexCount = side * @numSegments
          m.identity()
          m.rotate(map(side, 0, @numSides, 0, 2*PI), 0, 1, 0)
          evalShape = evalApple
          evalShape = evalPear
          for segment in [0..@numSegments-1]
            t = segment / (@numSegments-1)
            a = t * PI
            @cactusWireGeom.vertices[vertexCount+segment] = new Vec3() if !@cactusWireGeom.vertices[vertexCount+segment]
            @cactusWireGeom.vertices[vertexCount+segment].set(
              evalShape(t, a)[0]
              evalShape(t, a)[1]
              0
            )
            @cactusWireGeom.vertices[vertexCount+segment].transformMat4(m)
        @cactusWireGeom.vertices.length = floor(@numSides) * floor(@numSegments)
        @cactusWireGeom.vertices.dirty = true;

        @gl.enable(@gl.CULL_FACE)
        @gl.clearColor(0, 0, 0, 1)
        @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
        @gl.enable(@gl.DEPTH_TEST)
        @gl.lineWidth(1)

        #@scene.draw(@camera)
        #@cactusMesh.draw(@camera)
        #@cactusWireGeom.vertices.dirty = true
        #@cactusWireGeom.vertices.dirty = true
        @cactusWireframe.draw(@camera)
        #@cactusWireframeHighlights.draw(@camera)
        @cactusWireframePoints.draw(@camera)
        #@gl.enable(@gl.BLEND)
        #@gl.blendFunc(@gl.ONE, @gl.ONE_MINUS_SRC_ALPHA)
        #@gl.depthMask(0)
        #@cactusWireframeFill.draw(@camera)
        #@gl.depthMask(1)
        #@gl.disable(@gl.BLEND)

        @gui.draw()