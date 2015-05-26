define (require) ->
  GeomExtensions = require('geom/Extensions')
  { Vec2, Vec3, Spline3D } = require('pex/geom')
  Plane = require('geom/Plane')
  { LineBuilder } = require('pex/geom/gen')
  { PI, sin, cos, min, max, abs } = Math

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

  gh.polyline = (points, closed=false) ->
    polyline =
      closed: closed
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

  gh.plane = (point, normal) ->
    new Plane(point, normal)

  #center = plane or point
  gh.circle = (center, r = 1) ->
    plane = null
    if !isNaN(center.x) && !isNaN(center.y) && !isNaN(center.z) && center.length
      plane = new Plane(center)
    else if center.point && center.normal
      plane = center
    else throw 'gh.circle center needs to be Point or Plane'
    circle =
      plane: plane
      r: r
      closed: true
      pointAt: (t) ->
        plane.vec2ToVec3(
          new Vec2(
            r * cos(t * PI * 2)
            r * sin(t * PI * 2)
          )
        )
      clone: () -> #TODO implement circle.clone

  gh.makeLine = (from, to) ->
    gh.dataMatching from, to, (from, to) ->
      gh.line(from, to)

  gh.makePolyline = (points, closed = false) ->
    gh.dataMatching {LIST:points}, (points) -> gh.polyline(points, closed)

  gh.makeSpline = (points) ->
    gh.dataMatching {LIST:points}, (points) ->
      gh.spline (points)

  gh.splitPolylineSegments = (polyline) ->
    gh.dataMatching polyline, (polyline) ->
      segments = for i in [0...polyline.points.length-1]
        gh.line(polyline.points[i], polyline.points[i+1])
      if polyline.closed
        segments.push(gh.line(polyline.points[polyline.points.length-1], polyline.points[0]))
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
    if !curve.closed then n = n + 1 #we need n+1 points to get n segments
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

  gh
