define (require) ->
  { Mesh, Texture2D, Context } = require('pex/gl')
  { Textured } = require('pex/materials')
  { BoundingBox, Vec3, Quat, Mat4 } = require('pex/geom')
  { MathUtils } = require('pex/utils')
  { Diffuse, SolidColor, Textured } = require('pex/materials')
  { Cube, Plane } = require('pex/geom/gen')
  { Color } = require('pex/color')
  ObjReader = require('utils/ObjReader')
  BoundingBoxHelper = require('helpers/BoundingBoxHelper')
  RGBDToPosConverter = require('effects/RGBDToPosConverter')

  #Read this instead
  #http://www.scratchapixel.com/lessons/3d-basic-lessons/lesson-7-intersecting-simple-shapes/ray-box-intersection/
  rayBoxIntersection = (ray, bbox, t0, t1) ->
    tmin = 0
    tmax = 0
    tymin = 0
    tymax = 0
    tzmin = 0
    tzmax = 0
    if ray.direction.x >= 0
      tmin = (bbox.min.x - ray.origin.x) / ray.direction.x
      tmax = (bbox.max.x - ray.origin.x) / ray.direction.x
    else
      tmin = (bbox.max.x - ray.origin.x) / ray.direction.x
      tmax = (bbox.min.x - ray.origin.x) / ray.direction.x
    if ray.direction.y >= 0
      tymin = (bbox.min.y - ray.origin.y) / ray.direction.y
      tymax = (bbox.max.y - ray.origin.y) / ray.direction.y
    else
      tymin = (bbox.max.y - ray.origin.y) / ray.direction.y
      tymax = (bbox.min.y - ray.origin.y) / ray.direction.y
    if ( (tmin > tymax) || (tymin > tmax) )
      return 0;

    if tymin > tmin
      tmin = tymin
    if tymax < tmax
      tmax = tymax
    if ray.direction.z >= 0
      tzmin = (bbox.min.z - ray.origin.z) / ray.direction.z
      tzmax = (bbox.max.z - ray.origin.z) / ray.direction.z
    else
      tzmin = (bbox.max.z - ray.origin.z) / ray.direction.z;
      tzmax = (bbox.min.z - ray.origin.z) / ray.direction.z;
    if (tmin > tzmax) || (tzmin > tmax)
      return 1
    if tzmin > tmin
      tmin = tzmin
    if tzmax < tmax
      tmax = tzmax
    if tmin > 0 && tmax > 0
      return tmin
    return -2
    #return (tmin < t1) && (tmax > t0)

  class PeopleCarousel
    radius: 5000
    drawFloor: true
    texturedParticles: true
    pointSize: 3
    cancelNextMouseMove: false
    constructor: (@window, @sourcesScene) ->
      @gl = Context.currentContext.gl
      @camera = null
      @people = []
      @helpers = []
      @selectedModel = null

      floorMaterial = new Textured({texture:Texture2D.load('assets/images/particleGlow.png')})

      floorGeom = new Plane(12000, 12000, 30, 30, 'x', 'z')
      floorGeom.computeEdges()
      @floor = new Mesh(floorGeom, floorMaterial, { useEdges: true })
      @floor.position = @sourcesScene.modelBaseCenter.dup()

      floorThickGeom = new Plane(12000, 12000, 6, 6, 'x', 'z')
      floorThickGeom.computeEdges()
      @floorThick = new Mesh(floorThickGeom, floorMaterial, { useEdges: true })
      @floorThick.position = @sourcesScene.modelBaseCenter.dup()

      numPeople = 7
      @people = [0..numPeople].map (i) =>
        k = i / numPeople
        position = new Vec3(0, 0, 0)
        position.x += @radius * Math.cos(k * Math.PI * 2)
        position.z += @radius * Math.sin(k * Math.PI * 2)
        center = @sourcesScene.modelCenter
        mc = Mat4.create().translate(center.x, center.y, center.z)
        mr = (new Quat()).setAxisAngle(new Vec3(0,1,0), -360 * k - 90).toMat4()
        mcb = Mat4.create().translate(-center.x, -center.y, -center.z)
        rotation = mc.mul(mr).mul(mcb)
        bboxCenter = position.dup().add(@sourcesScene.modelCenter)
        bbox = BoundingBox.fromPositionSize(bboxCenter, new Vec3(1000, 2000, 1000))
        bboxHelper = new BoundingBoxHelper(bbox, Color.Red)
        @helpers.push(bboxHelper)
        { sourceId: i, position, rotation, bbox, bboxHelper }

      bboxCenter = @sourcesScene.modelCenter.dup()
      @mainBBox = BoundingBox.fromPositionSize(bboxCenter, new Vec3(800, 2000, 800))
      @mainBBoxHelper = new BoundingBoxHelper(@mainBBox, Color.Red)
      @helpers.push(@mainBBoxHelper)
      @people.push({sourceId: -1, bbox: @mainBBox, bboxHelper: @mainBBoxHelper})

      @window.on 'mouseMoved', (e) =>
        return if !@camera || e.handled
        if @cancelNextMouseMove
          @cancelNextMouseMove = false
          return
        closestHitDistance = 999999999
        closestHitPerson = null
        ray = @camera.getWorldRay(e.x, e.y, @window.width, @window.height)
        @selectedModel = null
        for person, i in @people
          hit = rayBoxIntersection(ray, person.bbox, 1, 5000)
          if hit > 1
            if hit < closestHitDistance && (hit > 8000 || person.sourceId == -1)
              closestHitDistance = hit
              closestHitPerson = person
          person.selected = false
          person.bboxHelper.setColor(Color.Red)

        if closestHitPerson
          closestHitPerson.bboxHelper.setColor(Color.Yellow)
          @selectedModel = closestHitPerson
          closestHitPerson.selected = true

      @window.on 'mouseDragged', (e) =>
        @selectedModel = null
        e.handled = true
        e.preventDefault() if e.preventDefault
        @cancelNextMouseMove = true
        if e.handled then return

      @window.on 'leftMouseDown', (e) =>
        if e.handled then return
        @selectedModelClick = @selectedModel

      @window.on 'leftMouseUp', (e) =>
        return if !@camera
        if @selectedModel and (@selectedModel.sourceId != -1) and @selectedModelClick = @selectedModel
          @window.sourceId = @selectedModel.sourceId

    draw: (camera) ->
      @camera = camera
      @gl.disable(@gl.BLEND)
      @gl.enable(@gl.DEPTH_TEST)

      if @drawFloor
        @gl.lineWidth(1)
        @floor.draw(@camera)
        @gl.lineWidth(2)
        @floorThick.draw(@camera)
        @gl.lineWidth(1)

      mesh = @sourcesScene.lowResMesh
      if !mesh then return

      for source, i in @sourcesScene.sources
        person = @people[i]
        if !source then continue

        mesh.source = source
        mesh.updateChannels()
        mesh.material.uniforms.pointSize = @pointSize
        mesh.material.uniforms.texturedParticles = @texturedParticles
        mesh.material.uniforms.texture = source.imageTexture
        mesh.material.uniforms.rotation = person.rotation
        mesh.material.uniforms.highlight = if @selectedModel == person then 2.0 else 0.5
        mesh.position.setVec3(person.position)
        mesh.draw(@camera)

      mesh.position.set(0, 0, 0)
      mesh.rotation.identity()
      mesh.material.uniforms.pointSize = 2

    drawDebug: (camera) ->
      for helper in @helpers
        helper.draw(camera)
