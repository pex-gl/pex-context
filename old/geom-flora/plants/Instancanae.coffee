define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals, ShowColors } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage, Context } = pex.gl
  { hem, Vec3, Geometry, Edge, Mat4, Spline3D, Quat } = pex.geom
  { Cube, Octahedron, Sphere, Dodecahedron, Icosahedron, LineBuilder } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils, ObjWriter } = pex.utils
  { map, randomFloat, seed } = MathUtils
  { cos, sin, PI, sqrt, abs, random, floor, min, max, exp, log } = Math
  Cylinder = require('geom/gen/Cylinder')

  mix = (a, b, t) ->
    a + t * (b - a)

  Quat.fromDirection = (direction, debug) ->
    q = new Quat()

    dir = MathUtils.getTempVec3('dir');
    dir.copy(direction).normalize();

    up = MathUtils.getTempVec3('up');

    up.set(0, 1, 0);

    right = MathUtils.getTempVec3('right');
    right.asCross(up, dir);

    #if debug then console.log('right', right)

    if right.length() == 0
      up.set(1, 0, 0)
      right.asCross(up, dir);

    up.asCross(dir, right);
    right.normalize();
    up.normalize();

    if debug then console.log('dir', dir)
    if debug then console.log('up', up)
    if debug then console.log('right', right)

    m = MathUtils.getTempMat4('m');
    m.set4x4r(
      right.x, right.y, right.z, 0,
      up.x, up.y, up.z, 0,
      dir.x, dir.y, dir.z, 0,
      0, 0, 0, 1
    );

    #Step 3. Build a quaternion from the matrix
    q = MathUtils.getTempQuat('q');
    if 1.0 + m.a11 + m.a22 + m.a33 < 0.001
      if debug then console.log('singularity')
      dir = direction.dup()
      dir.z *= -1
      dir.normalize()
      up.set(0, 1, 0);
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
      q.w = Math.sqrt(1.0 + m.a11 + m.a22 + m.a33) / 2.0;
      dfWScale = q.w * 4.0;
      q.x = ((m.a23 - m.a32) / dfWScale);
      q.y = ((m.a31 - m.a13) / dfWScale);
      q.z = ((m.a12 - m.a21) / dfWScale);
      if debug then console.log('dir', dir)
      if debug then console.log('up', up)
      if debug then console.log('right', right)

      q2 = MathUtils.getTempQuat('q2')
      q2.setAxisAngle(new Vec3(0,1,0), 180)
      q2.mul(q)
      return q2
    q.w = Math.sqrt(1.0 + m.a11 + m.a22 + m.a33) / 2.0;
    dfWScale = q.w * 4.0;
    q.x = ((m.a23 - m.a32) / dfWScale);
    q.y = ((m.a31 - m.a13) / dfWScale);
    q.z = ((m.a12 - m.a21) / dfWScale);
    q.dup()

  Window.create
    settings:
      fullscreen: Platform.isBrowser
      width: 2560/2
      height: 1380/2
    init: () ->
      Time.verbose = true

      #Check this out for dynamic meshes
      #console.log(@gl.STATIC_DRAW)
      #console.log(@gl.DYNAMIC_DRAW)
      #console.log(@gl.STREAM_DRAW)

      @on 'keyDown', (e) =>
        if e.str == 'S'
          @needsSave = true
        if e.str == 'g'
          @gui.enabled = !@gui.enabled

      @gl = Context.currentContext.gl
      @camera = new PerspectiveCamera(60, @width / @height)
      @arcball = new Arcball(this, @camera, 3.5)

      @material = new ShowColors();

      UP = new Vec3(0, 1, 0)

      @featherGeom = new Cube(0.15, 0.05, 0.5)
      @featherGeom = hem().fromGeometry(@featherGeom)
        .subdivide(true)
        .subdivide(true)
        .toFlatGeometry()
      @featherGeom.translate(new Vec3(0, 0, 0.25))
      featherColors = @featherGeom.vertices.map (v) ->
        k = abs(v.z*5)
        k /= 4
        r = mix(0.1, 0.6, k) #0.0, 1.0
        g = mix(0.3, 0.8, k) #0.1, 0.2
        b = mix(0.4, 0.2, k)
        new Color(r, g, b, 1)
      @featherGeom.addAttrib('colors', 'color', featherColors)
      @featherMesh = new Mesh(@featherGeom, @material)

      @body = new Cylinder(0.24, 2)
      @body = hem().fromGeometry(@body)
        .selectRandomFaces(0.5)
        .extrude(0.1)
        .subdivide(true)
        .subdivide(true)
        #.subdivide(true)
        #.subdivide(true)
        .toFlatGeometry()
        #.toSmoothGeometry()
      bodyColors = @body.vertices.map (v) ->
        k = abs(v.y/2)
        k = k + abs(v.z)
        k = 1 - k*1.5
        k = 0
        r = mix(0.1, 1.0, k) #0.0, 1.0
        g = mix(0.3, 0.2, k) #0.1, 0.2
        b = mix(0.4, 0.2, k)
        new Color(r, g, b, 1)
      @body.addAttrib('colors', 'color', bodyColors)
      @body.computeSmoothNormals()
      @mesh = new Mesh(@body, @material)

      @anchorPoints = @body.vertices.filter (v) -> abs(v.dot(UP)) <= 0.90
      @anchorPoints.sort (a, b) ->
        if (a.x > b.x) then return 1
        if (a.y > b.y) then return 1
        if (a.z > b.z) then return 1
        if (a.x == b.x && a.y == b.y && a.z == b.z) then return 0
        return -1

      console.log('before', @anchorPoints.length)

      i = 0
      while i < @anchorPoints.length - 1
        if @anchorPoints[i].distance(@anchorPoints[i+1]) < 0.0001
          @anchorPoints.splice(i, 1)
        else
          i++

      console.log('after', @anchorPoints.length)

      @anchorPointsGeom = new Geometry({vertices:@anchorPoints, faces:null})
      @anchorPointsMesh = new Mesh(@anchorPointsGeom, new SolidColor({ color: Color.Yellow, pointSize: 4 }), { primitiveType: @gl.POINTS})

    save: () ->
      @needsSave = false
      bakedGeom = @bakeInstances(@featherMesh.geometry, @instances)
      #bakedGeom2 = @bakeInstances(@mesh.geometry, @instances2)
      baked = Geometry.merge(bakedGeom, @mesh.geometry)
      ObjWriter.save(baked, 'Instancanae_' + Date.now() + '.obj')

    bakeInstances: (baseGeom, instances) ->
      empty = new Geometry({vertices:[], faces:[], normals:[]})
      geom = empty
      for instance, i in instances
        console.log(i, '/', instances.length)
        copy = Geometry.merge(empty, baseGeom)
        for v in copy.vertices
          v.x *= instance.scale.x
          v.y *= instance.scale.y
          v.z *= instance.scale.z
        copy.rotate(instance.rotation)
        copy.translate(instance.position)
        geom = Geometry.merge(geom, copy)
      geom

    draw: () ->
      @gl.clearColor(0.2, 0.26, 0.3, 1.0)
      @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
      @gl.enable(@gl.DEPTH_TEST)

      seed(0)

      normals = @body.normals
      @instances = @anchorPoints.map (p, pi) ->
        s = 0.5
        s2 = 0.5 + randomFloat() * 0.5
        dir = new Vec3(p.x, 0.5, p.z)
        speed = 3
        dir.y += 0.2 * sin(Time.seconds * speed + p.y * 2)
        dir.x += 0.2 * sin(Time.seconds * speed + p.y * 2)
        instance =
          position: p
          scale : new Vec3(s, s, s2)
          rotation: Quat.fromDirection(dir)

      if @needsSave then @save()

      @mesh.draw(@camera)
      @featherMesh.drawInstances(@camera, @instances)

