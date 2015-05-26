define (require) ->
  pex = require('pex')

  { Window, Platform } = pex.sys
  { PerspectiveCamera, Arcball, Scene } = pex.scene
  { SolidColor, Diffuse, ShowDepth, ShowNormals, PackDepth } = pex.materials
  { Mesh, Texture2D, RenderTarget, Viewport, ScreenImage } = pex.gl
  { hem, Vec3, Geometry, hem, Quat, Spline3D } = pex.geom
  { Cube, Octahedron, Sphere, LineBuilder } = pex.geom.gen
  { Color } = pex.color
  { Time, MathUtils, ObjWriter } = pex.utils
  { min, max, cos, sin, PI, sqrt, abs, random, atan2, floor } = Math
  { GUI } = pex.gui
  settings = require('utils/Settings')
  { randomFloat, seed } = MathUtils
  fx = pex.fx

  ###
  Data Matching:
    - shortest list
    - longest list (repeat last)
    - cross reference (multiply)

  Components vs Parameters
    - do vs store

  Curve types:
    - line
    - polyline
    - circle
    - ellipse
    - arc
    - nurbs curve
    - poly curve
  ###

  Vec3.prototype.asInterpolated = (a, b, t) ->
    this.x = a.x + (b.x - a.x) * t
    this.y = a.y + (b.y - a.y) * t
    this.z = a.z + (b.z - a.z) * t
    this

  Spline3D.prototype.pointAt = (t) ->
    @getPointAt(t)

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
    q

  tmpRot = Quat.fromDirection(new Vec3(0.0, 0.0, -1.25)).dup()

  console.log("####")
  console.log('rot', Quat.fromDirection(new Vec3(0.0,0.8,-1), true))

  gh = {}

  gh.type = (o) ->
    Object.prototype.toString.call(o)

  gh.isList =  (o) ->
    gh.type(o) == '[object Array]'

  gh.isTree = (o) ->
    gh.isList(o[0])

  gh.isValue = (o) ->
    !gh.isList(o) && !gh.isTree(o)

  gh.isNumber = (o) ->
    gh.type(o) == '[object Number]'

  gh.list = (o) ->
    if gh.isList(o) then o
    else [o]

  gh.listPaths = (o) ->
    if gh.isValue(o) then return [[0]]
    if gh.isList(o) and !gh.isTree(o) then return [[0]]
    paths = []
    stack = [ 0 ]
    listBranches = (root) ->
      if gh.isValue(root)
        paths.push(stack)
        return
      root.forEach (branch, branchIndex) ->
        stack.push(branchIndex)
        if gh.isTree(branch)
          listBranches(branch, branchIndex)
        else
          paths.push( stack.map (v) -> v )
        stack.pop();

    listBranches(o)
    paths

  gh.listList = (o) ->
    if gh.isList(o[0]) then o
    else [o]

  gh.xvec = (x) ->
    gh.dataMatching x, (x) ->
      new Vec3(x, 0, 0)

  gh.yvec = (y) ->
    gh.dataMatching y, (y) ->
      new Vec3(0, y, 0)

  gh.zvec = (z) ->
    gh.dataMatching z, (z) ->
      new Vec3(0, 0, z)

  gh.interval = (t0, t1) ->
    intervale = {
      t0: t0
      t1: t1
      min: min(t0, t1)
      max: max(t0, t1)
      range: max(t0, t1) - min(t0, t1)
    }

  gh.line = (from, to) ->
    line =
      closed: false
      from: from
      to: to
      pointAt: (t) ->
        Vec3.create().asInterpolated(@from, @to, t)

  gh.polyline = (points) ->
    polyline =
      closed: false
      points: points
      pointAt: (t) ->
        #TODO reparametrize curve
        @points[floor(t * (@points.length-1))]
      clone: () ->
        pointsCopy = @points.map (p) -> p.dup()
        polyline = gh.polyline(pointsCopy)
        polyline.closed = polyline.closed
        polyline

  gh.spline = (points) ->
    new Spline3D(points)
    #clone: () -> #TODO implement spline.clone

  gh.maxLen = (values, valueTypes) ->
    lengths = values.map (value, valueIndex) ->
      if gh.isList(value)
        if (valueTypes[valueIndex] == 'LIST') then 1
        else value.length
      else 1
    lengths.reduce (a, b) -> Math.max(a, b)

  #supports points, lists of points, and trees of points
  gh.offsetRandom = (point, r) ->
    gh.dataMatching point, r, (point, r) ->
      np = point.dup()
      np.x += 2 * (MathUtils.randomFloat() - 0.5) * r
      np.y += 2 * (MathUtils.randomFloat() - 0.5) * r
      np.z += 2 * (MathUtils.randomFloat() - 0.5) * r
      np

  gh.point = (x, y, z) ->
    new Vec3(x, y, z)

  gh.vector = gh.point

  gh.circle = (center = gh.point(0,0,0), r = 1) ->
    circle =
      center: center
      r: r
      closed: true
      pointAt: (t) ->
        new Vec3(
          r * cos(t * PI * 2)
          0
          r * sin(t * PI * 2)
        )
      clone: () -> #TODO implement circle.clone

  gh.makeLine = (from, to) ->
    gh.dataMatching from, to, (from, to) ->
      gh.line(from, to)

  gh.makePolyline = (points) ->
    gh.dataMatching {LIST:points}, (points) ->
      gh.polyline (points)

  gh.makeSpline = (points) ->
    gh.dataMatching {LIST:points}, (points) ->
      gh.spline (points)

  gh.splitPolylineSegments = (polyline) ->
    gh.dataMatching polyline, (polyline) ->
      segments = for i in [0...polyline.points.length-1]
        gh.line(polyline.points[i], polyline.points[i+1])
      segments

  # end is inclusive
  gh.series = (start, end) ->
    [start..end]

  gh.bakePoints = (pointListSet...) ->
    lineBuilder = new LineBuilder()
    s = 0.1
    for point in pointListSet
      gh.dataMatching point, (point) ->
        lineBuilder.addLine(point.dup().add(new Vec3(-s, 0, 0)), point.dup().add(new Vec3(s, 0, 0)))
        lineBuilder.addLine(point.dup().add(new Vec3( 0,-s, 0)), point.dup().add(new Vec3(0, s, 0)))
        lineBuilder.addLine(point.dup().add(new Vec3( 0, 0,-s)), point.dup().add(new Vec3(0, 0, s)))
    lineBuilder

  gh.bakeLines = (lineListSet...) ->
    lineBuilder = new LineBuilder()
    for line in lineListSet
      gh.dataMatching line, (line) ->
        lineBuilder.addLine(line.from, line.to)
    lineBuilder

  gh.getBranch = (tree, path) ->
    keys = path.map (p) -> p
    keys.shift()
    while keys.length > 0
      key = keys.shift()
      tree = tree[key]
    tree

  # {0} + {0} -> {0}
  # {0} + {0,0} -> {0,0}
  # {0,0} + {0,0} -> {0,0}
  # {0,0},{0,1},{0,2} + {0,0,0} ->
  gh.dataMatching = (inputInfos..., f) ->
    inputs = inputInfos.map (input) -> if input.LIST then input.LIST else input
    inputTypes = inputInfos.map (input) -> if input.LIST then 'LIST' else 'VALUE'
    inputTrees = inputs.filter (input) -> gh.isTree(input)
    if inputTrees.length == 0
      currentInputs = inputs
      #wrap mode list matching
      maxLength = gh.maxLen(currentInputs, inputTypes)
      result = for i in [0...maxLength]
        inputValues = currentInputs.map (input, inputIndex) ->
          if gh.isList(input) then input[i % input.length]
          else input
        f.apply(null, inputValues)
      result
    else if inputTrees.length == 1
      paths = gh.listPaths(inputTrees[0])
      pathResults = paths.map (path) ->
        #get list from a branch if it's a tree or list or value as it is
        currentInputs = inputs.map (input) ->
          if gh.isTree(input) then gh.getBranch(input, path)
          else if gh.isList(input) then input
          else input
        #wrap mode list matching
        maxLength = gh.maxLen(currentInputs, inputTypes)
        result = for i in [0...maxLength]
          inputValues = currentInputs.map (input, inputIndex) ->
            if gh.isList(input)
              if inputTypes[inputIndex] == 'LIST' then input
              else input[i % input.length]
            else input
          f.apply(null, inputValues)
        result
      pathResults
    else 'throw unupported data to match'

  gh.random = (n=1, domain = gh.interval(0,1), seed) ->
    domain.min + domain.range * random() for i in [0...n]

  gh.randomPoint = (n=1, domain = gh.interval(-1,1), seed, normalize = true) ->
    x = gh.random(n, domain, seed)
    y = gh.random(n, domain, seed)
    z = gh.random(n, domain, seed)
    gh.makePoint(x, y, z)

  gh.makePoint = (x, y, z) ->
    gh.dataMatching x, y, z, (x, y, z) ->
      new Vec3(x, y, z)

  gh.normalize = (point) ->
    gh.dataMatching point, (point) ->
      point.dup().normalize()

  #supports points, lists of points
  gh.move = (point, offset = gh.point(0,0,0)) ->
    gh.dataMatching point, offset, (point, offset) ->
      point.dup().add(offset)

  gh.add = gh.move

  #TODO: multiple curves support? merge output points?
  #TODO: if i divide circle the last and first point are the same?
  #is line a curve? what if I want to subdivide them again?
  gh.divide = (curve, n) ->
    n = n + 1 #we need n+1 points to get n segments
    gh.dataMatching curve, n, (curve, n) ->
      numSegments = if curve.closed then n else max(1, n-1)
      points = []
      for i in [0...n]
        points.push(curve.pointAt(i/numSegments))
      points

  gh.divideToTangents = (curve, n) ->
    n = n + 1 #we need n+1 points to get n segments
    gh.dataMatching curve, n, (curve, n) ->
      numSegments = if curve.closed then n else max(1, n-1)
      points = []
      for i in [0...n]
        p = curve.pointAt(i/numSegments)
        if i/numSegments > 0.99999
          np = curve.pointAt(i/numSegments - 0.5/numSegments)
          points.push(p.sub(np).normalize())
        else
          np = curve.pointAt(i/numSegments + 0.5/numSegments)
          points.push(np.sub(p).normalize())
      points

  gh.flatten = (tree) ->
    result = []
    for path in gh.listPaths(tree)
      branch = gh.getBranch(tree, path)
      result = result.concat(branch)
    result

  gh.replace = (tree, value) ->
    gh.dataMatching tree, value, (tree, value) ->
      value

  gh.rotate = (point, axis, angle) ->
    gh.dataMatching point, axis, angle, (point, axis, angle) ->
      if point.points
        pointCopy = point.clone()
        for p in pointCopy.points
          p.transformQuat(Quat.create().setAxisAngle(axis, angle))
        pointCopy
      else if point.from && point.to #line
        line = point
        gh.line(
          line.from.dup().transformQuat(Quat.create().setAxisAngle(axis, angle))
          line.to.dup().transformQuat(Quat.create().setAxisAngle(axis, angle))
        )
      else
        point.dup().transformQuat(Quat.create().setAxisAngle(axis, angle))

  gh.mul = (a, b) ->
    gh.dataMatching a, b, (a, b) ->
      a * b

  #gh.valueToIndex = (value) ->
  #  gh.dataMatching value, (value) ->

  Window.create
    settings:
      fullscreen: Platform.isBrowser
      width: 1280*2
      height: 720*2
    init: () ->
      @material = new SolidColor({color:Color.Red, pointSize:20})

      @gui = new GUI(this, 0, 0, if Platform.isEjecta then 2 else 1 )
      settings().init(@gui)
      @gui.enabled = true

      @camera = new PerspectiveCamera(60, @width/@height, 3, 15)
      @arcball = new Arcball(this, @camera, 10)

      @intances = []

      geom = hem().fromGeometry(new Cube(2,0.25,1))
      geom.splitFaceAtPoint(geom.faces[0], geom.faces[0].getCenter())
      geom.vertices[geom.vertices.length-1].selected = true
      geom.pull(2)
      #geom = hem().fromGeometry(new Cube())
      #geom = hem().fromGeometry(new Octahedron())
      geom.subdivide().subdivide()

      geomFlat = geom.toFlatGeometry()
      geomFlat.computeEdges()

      @mesh = new Mesh(geomFlat, new SolidColor({color:Color.Red}), { useEdges: true})
      @meshFill = new Mesh(geomFlat, new SolidColor({color:Color.Black}))

      @showDepthMaterial = new PackDepth({near:@camera.getNear(), far:@camera.getFar()})
      @diffuseMaterial = new Diffuse({wrap:1})

      @meshFill.setMaterial(@diffuseMaterial)

      @on 'keyDown', (e) =>
        if e.str == 'S'
          @needsSave = true
        if e.str == 'g'
          @gui.enabled = !@gui.enabled

    draw: () ->
      MathUtils.seed(0)

      @gl.clearColor(0,0,0,1)
      @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
      @gl.enable(@gl.DEPTH_TEST)
      @gl.lineWidth(5)

      if @animate
        @shift = Time.frameNumber % 50
        @gui.items[0].dirty = true

      trunkHeight = settings().getFloat('trunkHeight', 3, 1, 5)

      root = gh.makePoint(0, -trunkHeight/2, 0)
      top = gh.move(
        root,
        gh.yvec(trunkHeight)
      )

      branchDivisions = settings().getInt('branchDivisions', 5, 1, 10)
      numBranches = settings().getInt('numBranches', 8, 3, 20)
      branchRadius = settings().getFloat('branchesRadius', 2, 1, 5)
      branchHeight = settings().getFloat('branchHeight', 0.8, 0, 5)
      brancCurve = settings().getFloat('brancCurve', 0.25, 0.0, 0.5)

      p1 = gh.move(
        d = gh.divide(
          gh.circle(new Vec3(0, 0, 0), settings().getFloat('branchesRadius', 2, 1, 5))
          numBranches
        ),
        gh.yvec(settings().getFloat('branchHeight', 2.5, 0, 5))
      )

      lines = gh.makeLine(top, p1)

      angles = gh.mul(360/numBranches, gh.series(0, numBranches))
      points = [[gh.point(0, 0, 0), gh.point(branchRadius*(1-brancCurve), branchHeight*(0.5-brancCurve), 0), gh.point(branchRadius*1, branchHeight*1, 0)]]
      petalPath = gh.makePolyline(gh.divide(gh.makeSpline(points), 10))
      petalPath = gh.rotate(petalPath, gh.vector(0,1,0), angles)
      petalPoints = gh.divide(petalPath, branchDivisions);
      petalPath = gh.splitPolylineSegments(gh.makePolyline(petalPoints))

      #petalPath = lines


      p2 = gh.divide(lines, branchDivisions)
      p3 = gh.offsetRandom(p2, settings().getFloat('curl', 0, 0, 0.4))
      branchSpline = gh.makeSpline(p3)
      branchSpline = gh.makeSpline(petalPoints)
      p4 = gh.divide(branchSpline, branchDivisions)
      t4 = gh.divideToTangents(branchSpline, branchDivisions)

      indices = gh.series(1, branchDivisions+1)

      ti4 = gh.replace(t4, indices)

      #console.log(t4)

      #@draw = () ->

      branches = gh.splitPolylineSegments(gh.makePolyline(p4))

      lines = branches

      trunkPoints = gh.offsetRandom(
        gh.divide(
          gh.makeLine(root, top),
          branchDivisions
        ),
        settings().getFloat('curl', 0, 0, 0.2)/2
      )

      trunk = gh.splitPolylineSegments(
        gh.makePolyline(
          gh.divide(
            gh.makeSpline(
              trunkPoints
            )
          30)
        )
      )

      instanceScaleX = settings().getFloat('instanceScaleX', 0.2, 0.01, 1)
      instanceScaleY = settings().getFloat('instanceScaleY', 0.2, 0.01, 1)
      instanceScaleZ = settings().getFloat('instanceScaleZ', 0.4, 0.01, 1)
      instancePositions = gh.flatten(p4)
      instanceTangents = gh.flatten(t4)
      instanceTangents2 = gh.flatten(gh.normalize(gh.add(t4, gh.point(0, settings().getFloat('petal',0.8,0,2)))))
      instanceScales = gh.flatten(ti4)
      seed(0)
      instanceColors = instanceScales.map (s) ->
        k = 1.0 - s/(branchDivisions + 1)
        k *= settings().getFloat('colorScale', 1)
        k = (k + settings().getFloat('colorShift', 0)) % 1
        c = new Color()
        c.setHSV(k, 0.8, 0.8)
        c.a = 1
        c

      scale = new Vec3(instanceScaleX, instanceScaleY, instanceScaleZ)

      @instances = instancePositions.map (pos, i) -> { position: pos, scale: scale.dup().scale(instanceScales[i]), rotation: Quat.fromDirection(instanceTangents[i%instanceTangents.length]).dup() }
      @instancesC = instancePositions.map (pos, i) -> { position: pos, scale: scale.dup().scale(instanceScales[i]), rotation: Quat.fromDirection(instanceTangents[i%instanceTangents.length]).dup(), uniforms: { diffuseColor: instanceColors[i], color: instanceColors[i] } }
      @instances2 = instancePositions.map (pos, i) -> { position: pos, scale: scale.dup().scale(instanceScales[i]).scale(0.6), rotation: Quat.fromDirection(instanceTangents2[i%instanceTangents.length]).dup() }
      @instances2C = instancePositions.map (pos, i) -> { position: pos, scale: scale.dup().scale(instanceScales[i]).scale(0.6), rotation: Quat.fromDirection(instanceTangents2[i%instanceTangents.length]).dup(), uniforms: { diffuseColor: instanceColors[i], color: instanceColors[i] } }

      @pointsGeometry = gh.bakePoints(petalPoints)
      @linesGeometry = gh.bakeLines(petalPath, trunk)

      if @points
        @points.geometry = @pointsGeometry
        @lines.geometry = @linesGeometry
      else
        @points = new Mesh(@pointsGeometry, @material, { primitiveType: @gl.LINES })
        @lines = new Mesh(@linesGeometry, @material, { primitiveType: @gl.LINES })

      base = fx().render({drawFunc: @drawStage.bind(this), depth:true })
      #depth = base.render({drawFunc: @drawDepth.bind(this), depth:true, near:@camera.getNear(), far:@camera.getFar() })
      #color = depth.render({drawFunc: @drawStage.bind(this), depth:true })
      #color = base.render({drawFunc: @drawStageLines.bind(this), depth:true })
      #blurred = color.downsample4().blur7().blur7()
      ##color.blit()
      #glowing = base.add(blurred)
      #glowing.blit()
      #base.blit()
      #ssao = depth.ssao({near:@camera.getNear(), far:@camera.getFar()});
      #depth.blit()
      #ssao.blit()
      #var color = fx().render({ drawFunc: this.drawColor.bind(this), depth:true });
      #var depth = color.render({ drawFunc: this.drawDepth.bind(this), depth:true, near:0.1, far:3});
      #var small = color.downsample4().downsample4();
      #var blurred = small.threshold().blur7().blur7();
      #var glowing = color.mult(blurred);
      #var ssao =
      #shaded = color.mult(ssao)
      base.blit()
      #ssao.blit()
      #color.blit()


      if @gui.enabled then @gui.draw()

      if @needsSave then @save()

    drawStage: () ->
      @drawStageLine(2)

    drawDepth: () ->
      @meshFill.setMaterial(@showDepthMaterial)
      @drawStageLine(2)
      @meshFill.setMaterial(@diffuseMaterial)

    drawStageLines: () ->
      @drawStageLine(20)

    drawStageLine: (lineWidth) ->

      @gl.lineWidth(2)
      if @points and settings().getBool('showPoints', true) then @points.draw(@camera)
      @gl.lineWidth(1)
      if @lines then @lines.draw(@camera)

      @gl.lineWidth(lineWidth)
      if settings().getBool('showInstances', true)
        @meshFill.drawInstances(@camera, @instances)
        #@mesh.drawInstances(@camera, @instancesC)
      if settings().getBool('showPetals', true)
        @meshFill.drawInstances(@camera, @instances2)
        #@mesh.drawInstances(@camera, @instances2C)

    save: () ->
      @needsSave = false
      bakedGeom = @bakeInstances(@mesh.geometry, @instances)
      bakedGeom2 = @bakeInstances(@mesh.geometry, @instances2)
      baked = Geometry.merge(bakedGeom, bakedGeom2)
      ObjWriter.save(baked, 'Flower_' + Date.now() + '.obj')

    bakeInstances: (baseGeom, instances) ->
      empty = new Geometry({vertices:[], faces:[], normals:[]})
      geom = empty
      for instance in instances
        copy = Geometry.merge(empty, baseGeom)
        for v in copy.vertices
          v.x *= instance.scale.x
          v.y *= instance.scale.y
          v.z *= instance.scale.z
        copy.rotate(instance.rotation)
        copy.translate(instance.position)
        geom = Geometry.merge(geom, copy)
      geom