define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage } = pex.gl
  { hem, Vec3, Geometry, hem, Quat } = pex.geom
  { Cube, Octahedron, Sphere } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils, ObjWriter } = pex.utils
  { cos, sin, PI, sqrt, abs, random, atan2, floor } = Math
  { map } = MathUtils
  fem = require('geom/fem')
  Cylinder = require('geom/gen/Cylinder')
  HEDuplicate = require('geom/hem/HEDuplicate')

  quatFromDirection = (direction) ->
    dir = MathUtils.getTempVec3('dir');
    dir.copy(direction).normalize();

    up = MathUtils.getTempVec3('up');
    up.set(0, 1, 0);

    right = MathUtils.getTempVec3('right');
    right.asCross(up, dir);
    up.asCross(dir, right);
    right.normalize();
    up.normalize();

    m = MathUtils.getTempMat4('m');
    m.set4x4r(
      right.x, right.y, right.z, 0,
      up.x, up.y, up.z, 0,
      dir.x, dir.y, dir.z, 0,
      0, 0, 0, 1
    );

    #Step 3. Build a quaternion from the matrix
    q = MathUtils.getTempQuat('q');
    q.w = Math.sqrt(1.0 + m.a11 + m.a22 + m.a33) / 2.0;
    dfWScale = q.w * 4.0;
    q.x = ((m.a23 - m.a32) / dfWScale);
    q.y = ((m.a31 - m.a13) / dfWScale);
    q.z = ((m.a12 - m.a21) / dfWScale);

    return q;

  Window.create
    settings:
      fullscreen: Platform.isBrowser
    init: () ->
      @step = 0
      @initGeometry()
      @initCameras()

    initGeometry: () ->
      @cactusMaterial = new ShowNormals();

      geom = hem().fromGeometry(new Cube(0.5, 0.5, 0.1))
      #geom.vertices[0].sharp = true
      #geom.vertices[6].sharp = true

      geom.vertices[0].position.scale(0.25)
      #geom.vertices[4].position.scale(2.50)
      geom.vertices[4].sharp = true
      geom.vertices[2].position.scale(0.25)
      geom.vertices[5].position.scale(0.50)

      geom.subdivide()
      #geom.subdivide()#.subdivide().subdivide()
      geom.triangulate()
      geomFlat = geom.toFlatGeometry()
      geomWire = geom.toEdgesGeometry(0.001, 0.0001)

      #geomFlat.translate(new Vec3(0, 0.5, 0))
      #geomWire.translate(new Vec3(0, 0.5, 0))

      up = new Vec3(0, 1, 0)
      right = new Vec3(0, 0, 1)
      shiftY = -1.5#-1.6

      numLayers = 10
      perLayer = 10
      numSteps = numLayers * perLayer

      @instances = [0..numSteps-1].map (i) ->
        layer = floor(i / perLayer)
        inLayer = i % perLayer
        angle = inLayer/(perLayer-1) * 360 - 30
        deg2rad = PI/180
        q = new Quat().setAxisAngle(up, angle)
        #q2 = new Quat().setAxisAngle(right, 70)
        #q.mul(q2)
        shiftY += 0.113
        r = map(layer, 0, numLayers, 0.25, 0.1)
        scale = map(layer, 0, numLayers, 1, 0.1)
        pos = new Vec3(r*cos(angle * deg2rad), -0.5 + 0.8*layer/numLayers, r*sin(angle * deg2rad))
        q = quatFromDirection(pos).dup()
        instance =
          position: new Vec3(pos.x, shiftY, pos.z)
          scale: new Vec3(scale, scale, scale)
          rotation: q

      bakedGeom = @bakeInstances(geomFlat, @instances)
      bakedWireGeom = @bakeInstances(geomWire, @instances)

      @cactusMesh = new Mesh(bakedGeom, @cactusMaterial)
      @cactusWireframe = new Mesh(bakedWireGeom, new SolidColor({color: new Color(1,1,1,1)}), { useEdges: true } )

      #ObjWriter.save(bakedGeom, 'Cactus02.obj')

    bakeInstances: (baseGeom, instances) ->
      empty = new Geometry({vertices:[], faces:[], normals:[]})
      geom = empty
      for instance in instances
        copy = Geometry.merge(empty, baseGeom)
        copy.scale(instance.scale.x)
        copy.rotate(instance.rotation)
        copy.translate(instance.position)
        geom = Geometry.merge(geom, copy)
      geom

    initCameras: () ->
      @camera = new PerspectiveCamera(60, @width/@height)
      @arcball = new Arcball(this, @camera, 2)

    draw: () ->
      @gl.enable(@gl.CULL_FACE)
      @gl.clearColor(0, 0, 0, 1)
      @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
      @gl.enable(@gl.DEPTH_TEST)
      @gl.lineWidth(0.15)

      @cactusMesh.draw(@camera)
      @cactusWireframe.draw(@camera)
      #@cactusMesh.drawInstances(@camera, @instances)
      #@cactusWireframe.drawInstances(@camera, @instances)