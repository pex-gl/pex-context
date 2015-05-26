define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage } = pex.gl
  { hem, Vec3, Geometry } = pex.geom
  { Cube, Octahedron, Sphere, Dodecahedron, Icosahedron } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils } = pex.utils
  { cos, sin, PI, sqrt, abs, random } = Math

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

      initScene: () ->
        @scene = new Scene()

      initGeometry: () ->
        @cellGeom = new Cube()
        @cellGeom.computeEdges()
        @cellGeom.computeSmoothNormals()
        @cellGeom.vertices.forEach (v) ->
          v.original = v.dup()

        @cellHem = hem().fromGeometry(@cellGeom)
        @cellGeom = @cellHem.toFlatGeometry()
        @cellGeom.computeEdges()

        @cellWireframe = new Mesh(@cellGeom, new SolidColor({color: new Color(0.2, 0.3, 0.5, 1.0)}), { useEdges: true } )
        @cellWireframeFill = new Mesh(@cellGeom, new SolidColor({color: new Color(0,0,0,0.55), color2: new Color(0.7, 0.3, 0.5, 1.0)}))
        @scene.add(@cellWireframeFill)
        @scene.add(@cellWireframe)

      initCameras: () ->
        @camera = new PerspectiveCamera(60, @width/@height)
        @arcball = new Arcball(this, @camera, 2)

      draw: () ->
        @gl.enable(@gl.CULL_FACE)
        @gl.clearColor(0, 0, 0, 1)
        @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
        @gl.enable(@gl.DEPTH_TEST)
        @gl.lineWidth(1)

        @cellHem.faces

        @cellHem.toFlatGeometry(@cellGeom)
        @cellGeom.vertices.dirty = true;

        @scene.draw(@camera)