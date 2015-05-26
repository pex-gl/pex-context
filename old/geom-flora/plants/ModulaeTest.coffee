define (require) ->
  pex = require('pex')
  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage, RenderTarget } = pex.gl
  { hem, Vec3, BoundingBox, Geometry } = pex.geom
  { Cube, Octahedron, Sphere, Icosahedron } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils, MovieRecorder } = pex.utils
  { cos, sin, PI, sqrt, random, floor } = Math
  { randomElement } = MathUtils
  { Modulae, SingleFaceSelector, ExtrudeSegment, Split2, AllFacesSelector } = require('flora/plants/modular')
  HEDuplicate = require('geom/hem/HEDuplicate')

  Window.create
    settings:
      fullscreen: Platform.isBrowser
    init: () ->
      @step = 0
      @initUI()
      @initGeometry()
      @initScene()
      @initCameras()
      @animate = true
      @subdivide = true

    initUI: () ->
      @rt = new RenderTarget(1024*2, 1024, { depth : true })
      @screenImage = new ScreenImage(@rt.getColorAttachement(0),0,0,@width, @height,@width,@height)
      @on 'mouseDragged', (e) =>
        @step = 0
      @on 'keyDown', (e) =>
        if e.str == 'a' then @animate = !@animate
        if e.str == '\t' then @subdivide = !@subdivide
        if e.str == 'r'
          if @movieRecorder.recording then @movieRecorder.stop() else @movieRecorder.start()


    initGeometry: () ->
      console.log('initGeometry')
      if @object == 1
        @object = 2
      else @object = 1

      extrusionSpeed = 0.5
      branchRadius = 0.2
      if @object == 1
        @mod = new Modulae(new Cube(0.15, 0.15, 0.15, 1, 1, 1))
        @mod.add(new SingleFaceSelector(new Vec3(0, 1, 0)))
        @mod.add(new ExtrudeSegment(0.2, branchRadius*0.5, branchRadius*0.5, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius*0.5, branchRadius*1.5, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius*1.5, branchRadius*1.5, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius*1.5, branchRadius*2.5, extrusionSpeed))
        @mod.add(new Split2(0.2, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.5, branchRadius*0.5, branchRadius*0.5, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.5, branchRadius*0.5, branchRadius*0.5, extrusionSpeed))
        @mod.add(new Split2(0.2, extrusionSpeed))
        @mod.add(new Split2(0.2, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.5, branchRadius*0.5, branchRadius*0.15, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.5, branchRadius*0.5, branchRadius*0.15, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.5, branchRadius*0.5, branchRadius*0.15, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.5, branchRadius*0.5, branchRadius*0.15, extrusionSpeed))
        @mod.add(new ExtrudeSegment(-0.15, branchRadius*0.75, branchRadius*0.05, extrusionSpeed))
        @mod.add(new ExtrudeSegment(-0.15, branchRadius*0.75, branchRadius*0.05, extrusionSpeed))
        @mod.add(new ExtrudeSegment(-0.15, branchRadius*0.75, branchRadius*0.05, extrusionSpeed))
        @mod.add(new ExtrudeSegment(-0.15, branchRadius*0.75, branchRadius*0.05, extrusionSpeed))
        ###
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        ###
      if @object == 2
        @mod = new Modulae(new Octahedron(0.15, 0.15, 0.15, 1, 1, 1))
        @mod.add(new AllFacesSelector())
        @mod.add(new ExtrudeSegment(0.4, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.4, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.4, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.4, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.4, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.4, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.4, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.4, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.2, branchRadius, extrusionSpeed))
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new Split2())
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
        @mod.add(new ExtrudeSegment(0.3, branchRadius, extrusionSpeed))
      #@mod.hem.subdivide()

    initScene: () ->
      @mesh = new Mesh(@mod.hem.toFlatGeometry(), new SolidColor({color: new Color(0,0,0,0)}))
      @wireframe = new Mesh(@mod.hem.toEdgesGeometry(), new SolidColor({color: Color.White}), { useEdges: true } )
      @selection = new Mesh(@mod.getSelectionGeometry(), new SolidColor({color: Color.Yellow, pointSize:10}), { primitiveType: @gl.POINTS })
      @cellCores = new Mesh(new Geometry({vertices:@mod.hem.faces.map((f) -> f.edge.vert.position)}), new SolidColor({color: new Color(0,1,1,1), pointSize:4}), { primitiveType: @gl.POINTS })
      @hightlightsMesh = new Mesh(@mod.hem.toFlatGeometry(), new SolidColor({color: new Color(0.2, 0.7, 0.0, 1.0)}))

      @scene = new Scene()
      @scene.add(@selection)
      @scene.add(@mesh)
      @scene.add(@wireframe)
      @scene.add(@cellCores)
      #@scene.add(@hightlightsMesh)

      #setInterval((() => @initGeometry()), 10*1000)

    initCameras: () ->
      @camera = new PerspectiveCamera(60, @width/@height)
      @arcball = new Arcball(this, @camera, 2)
      @movieRecorder = new MovieRecorder('frames')
      #@movieRecorder.start()

    draw: () ->
      @movieRecorder.update()
      #@rt.bind()
      #@gl.viewport(0, 0, @rt.width, @rt.height);
      @gl.clearColor(0, 0, 0, 1)
      @gl.lineWidth(2)
      @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
      @gl.enable(@gl.DEPTH_TEST)

      if @animate
        @mod.update()
        smooth = @mod.hem.dup()
        if @subdivide then smooth.subdivide()
        @mesh.geometry = smooth.toFlatGeometry()
        @hightlightsMesh.geometry = smooth.toFlatGeometry()
        @hightlightsMesh.geometry.faces = @hightlightsMesh.geometry.faces.filter((f, fi)-> fi % 9 == 0)
        @wireframe.geometry = smooth.toEdgesGeometry(0.005, 0.001)
        @selection.geometry = @mod.getSelectionGeometry()
        @cellCores.geometry = new Geometry({vertices:smooth.faces.map((f) -> f.getCenter())})

        @selection.enabled = @selection.geometry.vertices.length > 0

        bbox = BoundingBox.fromPoints(@mesh.geometry.vertices)
        @hightlightsMesh.position.y = @mesh.position.y = @selection.position.y = @wireframe.position.y = @cellCores.position.y = -bbox.getCenter().y

      for drawable in @scene.drawables
        @hightlightsMesh.rotation.setAxisAngle(new Vec3(0, 1, 0), Time.seconds*30)
        drawable.rotation.setAxisAngle(new Vec3(0, 1, 0), Time.seconds*30)
      @scene.draw(@camera)
      @gl.clear(@gl.DEPTH_BUFFER_BIT)
      @gl.enable(@gl.CULL_FACE);
      #@hightlightsMesh.draw(@camera)
      #@rt.unbind()
      #@gl.clearColor(0.1, 0.1, 0.1, 1)
      #@gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
      #@gl.viewport(0, 0, @width, @height);
      #@screenImage.image.bind()
      #@gl.generateMipmap(@gl.TEXTURE_2D);
      #@gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MIN_FILTER, @gl.LINEAR_MIPMAP_LINEAR);
      #@screenImage.draw()
      @movieRecorder.capture()
