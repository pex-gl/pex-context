define (require) ->
  { Vec2, Vec3, Mat4 } = require('pex/geom')

  EPSYLON = 0.01

  class Plane
    constructor: (@point=new Vec3(0,0,0), @normal=new Vec3(0,1,0)) ->

    #http://en.wikipedia.org/wiki/Line-plane_intersection
    intersectSegment: (line) ->
      plDotN = Vec3.create().asSub(@point, line.a).dot(@normal)
      lDotN = line.direction.dot(@normal)
      if (Math.abs(lDotN) < 0.001)
        return null
      d = plDotN/lDotN
      hitPoint = Vec3.create().copy(line.direction).scale(d).add(line.a)
      hitPoint.ratio = d / line.a.dup().sub(line.b).length()
      hitPoint

    isPointAbove: (p) ->
      pp = Vec3.create().asSub(p, @point).normalize()
      return pp.dot(@normal) > 0

    getBaseVectors: () ->
      invLength = 0
      N = @normal.dup().normalize()
      U = new Vec3()
      if Math.abs(N.x) > Math.abs(N.y)
        U.x = N.z
        U.y = 0
        U.z = -N.x
      else
        U.x = 0
        U.y = N.z
        U.z = -N.y
      U.normalize()

      V = Vec3.create().asCross(N, U)

      return {
        up: U
        right: V
        front : @normal
      }

    vec3ToVec2: (v) ->
      baseVectors = @getBaseVectors()
      #m = Mat3.fromVectorBase(baseVectors.up, baseVectors.right, @normal)
      d = v.subbed(@point)
      #result = m.mulVec3(d);
      v2 = new Vec2(baseVectors.right.dot(d), baseVectors.up.dot(d))

      m = Mat3.fromVectorBase(baseVectors.right, baseVectors.up, baseVectors.front)
      v2m = m.mulVec3(d);

      m4 = new Mat4();
      m4.set4x4r(
        baseVectors.right.x, baseVectors.right.y, baseVectors.right.z, 0,
        baseVectors.up.x, baseVectors.up.y, baseVectors.up.z, 0,
        baseVectors.front.x, baseVectors.front.y, baseVectors.front.z, 0,
        0, 0, 0, 1
      );
      v4m = m4.mulVec3(d)

      return v2

    vec2ToVec3: (v) ->
      baseVectors = @getBaseVectors();
      result = baseVectors.right.dup().scale(v.x).add(baseVectors.up.dup().scale(v.y))
      result.add(@point)
      return result

    projectPoint: (a) ->
      pa = Vec3.create().asSub(a, @point)
      paDotN = pa.dot(@normal)
      a.dup().sub(@normal.dup().scale(paDotN))

    distance: (a) ->
      projectedA = @projectPoint(a)
      return projectedA.distance(a)

    contains: (a) ->
      return @distance(a) < EPSYLON
