pex = pex || require('./lib/pex')

{ Platform } = pex.sys
{ Mesh } = pex.gl
{ PerspectiveCamera, Arcball } = pex.scene
{ GUI } = pex.gui
{ Vec2, Vec3, Vec4, Mat4, Rect, Geometry, Edge, BoundingBox, Octree } = pex.geom
{ Cube } = pex.geom.gen
{ SolidColor, Test, ShowColors } = pex.materials
{ Color } = pex.color
{ min, max, floor } = Math
{ IO } = pex.sys
{ Texture2D, ScreenImage } = pex.gl
{ Time, MathUtils } = pex.utils

pex.require ['AxisHelper', 'BoundingBoxHelper', 'OctreeHelper', 'OctreeTracer', 'OctreeTextureEncoder'], (AxisHelper, BoundingBoxHelper, OctreeHelper, OctreeTracer, OctreeTextureEncoder) ->
  pex.sys.Window.create
    init: () ->
      @camera = new PerspectiveCamera(60, @width/@height, 0.3, 6)
      @arcball = new Arcball(this, @camera, 3)

      @bounds = new BoundingBox(new Vec3(-1, -1, -1), new Vec3(1, 1, 1));

      @octree = new Octree(@bounds.min, @bounds.getSize())

      MathUtils.seed(34732)
      for i in [0..31]
        p = new Vec3(MathUtils.randomFloat(-1, 1), MathUtils.randomFloat(-1, 1), MathUtils.randomFloat(-1, 1))
        p.color = new Color(0.1 + Math.random(), 0.1 + Math.random(), 0.1 + Math.random(), 1.0)
        @octree.add(p)

      @octreeTexture = OctreeTextureEncoder.encodeOctreeTexture(@octree, 64, 64)
      @octreeTexturePreview = new ScreenImage(@octreeTexture, 0, 0, @octreeTexture.width*4, @octreeTexture.height*4, @width, @height)

      @meshes = []
      @meshes.push(new AxisHelper(new Vec3(0, 0, 0,), 5))
      @meshes.push(new BoundingBoxHelper(@bounds))
      @meshes.push(new OctreeHelper(@octree, { level:2, wireframe:true }))
      @meshes.push(new OctreeHelper(@octree, { level:2, wireframe:false }))
      @meshes.push(new OctreeTracer(@octree))

      mesh.enabled = true for mesh in @meshes

      @on 'keyDown', (e) =>
        switch e.str
          when 'a' then @meshes[0].enabled = !@meshes[0].enabled
          when 'b' then @meshes[1].enabled = !@meshes[1].enabled
          when 'w' then @meshes[2].enabled = !@meshes[2].enabled
          when 'o' then @meshes[3].enabled = !@meshes[3].enabled
          when 't' then @meshes[4].enabled = !@meshes[4].enabled

      @meshes[0].enabled = true
      @meshes[1].enabled = true
      @meshes[2].enabled = false
      @meshes[3].enabled = false
      @meshes[4].enabled = true

    draw: ()->
      @gl.clearColor(0.25, 0.25, 0.25, 1.0)
      @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
      @gl.enable(@gl.DEPTH_TEST)
      @gl.enable(@gl.CULL_FACE)
      @gl.cullFace(@gl.BACK)
      (mesh.draw(@camera) if mesh.enabled) for mesh in @meshes

      @octreeTexturePreview.draw()