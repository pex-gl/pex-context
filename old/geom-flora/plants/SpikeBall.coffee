define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage } = pex.gl
  { hem, Vec3, Geometry } = pex.geom
  { Cube, Octahedron, Sphere, Dodecahedron, Icosahedron } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils, MovieRecorder, ObjReader } = pex.utils
  { cos, sin, PI, sqrt, abs, random } = Math

  orange    = new Color(243/255, 134/255,  48/255, 1)
  blue      = new Color( 54/255, 149/255, 191/255, 1)
  pink      = new Color(233/255,  78/255, 119/255, 1)
  green     = new Color(182/255, 206/255,  81/255, 1)
  yellow    = new Color(247/255, 215/255, 114/255, 1)
  skyblue   = new Color( 84/255, 202/255, 221/255, 1)

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
        @on 'keyDown', (e) =>
          if e.str == 'r'
            if @movieRecorder.recording then @movieRecorder.stop() else @movieRecorder.start()

      initScene: () ->
        @scene = new Scene()

      initGeometry: () ->
        @cactusMaterial = new ShowNormals();

        ObjReader.load('models/flower.obj', (geom) =>
          geom.vertices.forEach (v) -> v.scale(0.25)
          cylinderR = 0.05
          #@cactusGeom = geom#new Sphere(0.5)
          @cactusGeom = new Geometry({vertices:true,edges:true})#new Sphere(0.51);
          geom.vertices.forEach (v) => @cactusGeom.vertices.push(v.dup().scale(1.0001))
          geom.faces.forEach (f) => @cactusGeom.faces.push(f)
          #@cactusGeom = new Cylinder(cylinderR, 1, 24, 16, false);
          #@cactusGeom.computeEdges()
          #@cactusGeom.computeSmoothNormals()
          #@cactusGeom.vertices.forEach (v) ->
          #  v.original = v.dup()

          @cactusGeom2 = new Sphere(0.5)
          #@cactusGeom2 = new Cylinder(cylinderR, 1, 24, 16, false);
          @cactusGeom2.computeEdges()
          @cactusGeom2.computeSmoothNormals()
          @cactusGeom2.vertices.forEach (v) ->
            v.original = v.dup()

          @cactusGeom.faces = @cactusGeom.faces.filter (f, fi) -> fi % 27 == 0
          @cactusGeom2.faces = @cactusGeom2.faces.filter (f, fi) -> (fi+10) % 27 == 0

          @cactusWireGeom = geom#new Sphere(0.5);
          #@cactusWireGeom = new Cylinder(cylinderR, 1, 24, 16, false);
          @cactusWireGeom.computeEdges()
          @cactusWireGeom.computeSmoothNormals()
          #@cactusWireGeom.vertices.forEach (v) ->
          #  v.original = v.dup()

          @cactusWireHighlightsGeom = new Geometry({vertices:true,edges:true})#new Sphere(0.51);
          geom.vertices.forEach (v) => @cactusWireHighlightsGeom.vertices.push(v.dup().scale(1.0001))
          geom.edges.forEach (e) => @cactusWireHighlightsGeom.edges.push(e)
          #@cactusWireHighlightsGeom = new Cylinder(cylinderR+0.01, 1, 24, 16, false);
          #@cactusWireHighlightsGeom.computeEdges()
          #@cactusWireHighlightsGeom.computeSmoothNormals()
          #@cactusWireHighlightsGeom.vertices.forEach (v) ->
          #  v.original = v.dup()

          @cactusWireHighlightsGeom.edges = @cactusWireHighlightsGeom.edges.filter (e, ei) -> ei % 15 == 0

          @cactusMesh = new Mesh(@cactusGeom, new SolidColor({color: pink, color2: new Color(0.2, 0.6, 0.7, 1.0)}))
          @cactusMesh2 = new Mesh(@cactusGeom2, new SolidColor({color: green, color2: new Color(0.2, 0.8, 0.7, 1.0)}))
          @cactusWireframe = new Mesh(@cactusWireGeom, new SolidColor({color: blue, color2: new Color(0.2, 0.3, 0.5, 1.0)}), { useEdges: true } )
          @cactusWireframeFill = new Mesh(@cactusWireGeom, new SolidColor({color: new Color(0,0,0,0.95), color2: new Color(0.7, 0.3, 0.5, 1.0)}))
          @cactusWireframeHighlights = new Mesh(@cactusWireHighlightsGeom, new SolidColor({color2: new Color(0.7, 0.3, 0.5, 1.0)}), { useEdges: true })
          @cactusWireframePoints = new Mesh(@cactusWireHighlightsGeom, new SolidColor({pointSize: 3, color2: new Color(0.7, 0.7, 0.5, 1.0)}), { primitiveType: @gl.POINTS })
          @scene.add(@cactusMesh)
          @scene.add(@cactusMesh2)
          @scene.add(@cactusWireframeFill)
          @scene.add(@cactusWireframe)
        )

      initCameras: () ->
        @camera = new PerspectiveCamera(60, @width/@height)
        @arcball = new Arcball(this, @camera, 1.5)
        @movieRecorder = new MovieRecorder('frames')

      draw: () ->
        @movieRecorder.update()
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

        @cactusGeom2.vertices.forEach (v, vi) =>
          r = R
          v.x = v.original.x + r * @cactusGeom2.normals[vi].x * sin(v.original.x*20 + v.original.y*20 + Time.seconds)
          v.y = v.original.y + r * @cactusGeom2.normals[vi].y * sin(v.original.z*20 + v.original.y*20 + Time.seconds)
          v.z = v.original.z + r * @cactusGeom2.normals[vi].z * cos(v.original.z*20 + v.original.z*20 + Time.seconds)
          #r = MathUtils.map(v.original.y, -0.5, 0.5, -0.5, 0.2)

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

        @cactusGeom.vertices.dirty = true
        @cactusGeom2.vertices.dirty = true
        @cactusWireGeom.vertices.dirty = true
        @cactusWireHighlightsGeom.vertices.dirty = true
        ###

        @gl.enable(@gl.CULL_FACE)
        @gl.clearColor(0, 0, 0, 1)
        @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
        @gl.enable(@gl.DEPTH_TEST)
        @gl.lineWidth(2)

        if !@cactusMesh then return

        #@scene.draw(@camera)
        @cactusMesh.draw(@camera)
        #@cactusMesh2.draw(@camera)
        #@cactusWireGeom.vertices.dirty = true
        #@cactusWireGeom.vertices.dirty = true
        @cactusWireframe.draw(@camera)
        #@gl.disable(@gl.DEPTH_TEST)
        @cactusWireframeHighlights.draw(@camera)
        @gl.enable(@gl.DEPTH_TEST)
        @cactusWireframePoints.draw(@camera)
        @gl.enable(@gl.BLEND)
        @gl.blendFunc(@gl.ONE, @gl.ONE_MINUS_SRC_ALPHA)
        @gl.depthMask(0)
        @cactusWireframeFill.draw(@camera)
        @gl.depthMask(1)
        @gl.disable(@gl.BLEND)
        @movieRecorder.capture()