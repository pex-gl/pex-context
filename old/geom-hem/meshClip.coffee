pex = pex || require('./lib/pex')

{ Vec3, hem, Plane } = pex.geom
{ LineBuilder, Cube } = pex.geom.gen
{ Color } = pex.color
{ Mesh, Texture2D } = pex.gl
{ ShowColors, SolidColor, Diffuse } = pex.materials
{ PerspectiveCamera, Arcball } = pex.scene
{ MathUtils } = pex.utils
PlaneGeom = pex.geom.gen.Plane

EPSYLON = 0.00001

lerp = (va, vb, t) =>
  Vec3.create(
    va.x + (vb.x - va.x) * t,
    va.y + (vb.y - va.y) * t,
    va.z + (vb.z - va.z) * t
  )

pex.require ['Plane', 'Line3d', 'pex/geom/hem/HEFace', 'GeomUtils'], (Plane, Line3D, HEFace, GeomUtils) ->
  pex.sys.Window.create
    settings:
      width: 1280
      height: 720
      type: '3d'
    debugMode: false
    meshMode: true
    explode: false
    init: () ->
      geom = new Cube(2,2,2)
      geom.computeEdges()

      lineBuilder = new LineBuilder()

      MathUtils.seed(0)

      minDist = 0.5

      @on 'keyDown', (e) =>
        console.log(e.str, @debugMode)
        if e.str == 'd' then @debugMode = !@debugMode
        if e.str == 'm' then @meshMode = !@meshMode

      @on 'leftMouseDown', (e) =>
        @explode = true

      @on 'leftMouseUp', (e) =>
        @explode = false

      points = []
      [0..50].forEach () ->
        p = MathUtils.randomVec3()
        p.x *= 8
        p.y *= 8
        p.z *= 8
        farEnough = true
        points.forEach (anotherPoint) ->
          #if p.distance(anotherPoint) < minDist
          #  farEnough = false
        if farEnough then points.push(p)

      console.log(points.length)

      meshes = points.map (center) =>
        if center.length() > 1.75 then return null
        #if center.y > 0 then return null
        hemesh = hem().fromGeometry(geom)
        hemesh.vertices.forEach (v) -> v.position.add(center)
        planes = points.map (point) ->
          centerToPoint = Vec3.create().asSub(point, center)
          new Plane(center.dup().add(centerToPoint.dup().scale(0.5)), centerToPoint.normalize())

        planes.forEach (plane, planeIndex) =>
          @clipMesh(hemesh, plane, true)

        #hemesh.check()
        hemesh

      console.log(meshes.length)

      meshes = meshes.filter (mesh) -> mesh != null
      #meshes = meshes.slice(0, 1)
      console.log('meshes.length', meshes.length)

      meshes.forEach (hemesh) ->
        hemesh.faces.map (face, faceIndex) ->
          c = face.getCenter()
          d = 0.05
          center = face.getCenter()
          faceColor = if face.above then Color.Red else Color.Yellow
          face.edgePairLoop (e, ne) ->
            v = e.vert.position.dup().scale(1-d).add(c.dup().scale(d))
            nv = ne.vert.position.dup().scale(1-d).add(c.dup().scale(d))
            lineBuilder.addLine(v, nv, if e.onThePlane then Color.Green else faceColor)
            rv = e.vert.position.dup()
            rv.x += e.vert.index * 0.001
            lineBuilder.addCross(v, 0.03, Color.Orange)

      boronMaterial = new Diffuse({
        wrap: 1,
        ambientColor: new Color(0.25, 0.25, 0.3, 1)
        diffuseColor: new Color(0.75, 0.75, 0.7, 1)
      })

      @meshes = meshes.map (hemesh) =>
        hemesh.faces.forEach (face) ->
          if face.getAllVertices().length > 3
            hemesh.splitFaceAtPoint(face, face.getCenter())
        mesh = new Mesh(hemesh.toFlatGeometry(), boronMaterial)
        mesh.position = MathUtils.randomVec3().scale(10)
        meshCenter = Vec3.create(0,0,0)
        hemesh.vertices.forEach (v) -> meshCenter.add(v.position)
        meshCenter.scale(1/hemesh.vertices.length*0.01)
        mesh.position = meshCenter
        mesh.targetPosition = meshCenter.dup().scale(100)
        mesh.originalPosition = meshCenter.dup()
        mesh

      @linesMesh = new Mesh(lineBuilder, new ShowColors(), { useEdges: true })

      @camera = new PerspectiveCamera(60, @width/@height, 0.1, 100)
      @arcball = new Arcball(this, @camera, 5)

      #m = new SolidColor({color:Color.Red})
      #@planeMeshes = [planes[planes.length-1]].map (plane, planeIndex) ->
      #  planeGeom = new PlaneGeom(2, 2)
      #  planeMesh = new Mesh(planeGeom, new SolidColor({color:Color.Pink}), {useEdges:true})
      #  planeMesh.position = plane.point
      #  planeMesh.rotation = GeomUtils.quatFromDirection(plane.normal)
      #  return planeMesh

    clipMesh: (hemesh, plane, remove, debug) ->
      #console.log('CLIPPING')
      numFaces = hemesh.faces.length
      hemesh.faces.forEach (face, faceIndex) ->
        #console.log(faceIndex, 'face')
        debug = false
        #if faceIndex >= numFaces then return
        #if faceIndex >= 4 then return
        #if faceIndex == 3 then debug = true
        hits = []
        #console.log('face', faceIndex + '/' + hemesh.faces.length)
        face.edgePairLoop (e, ne) ->
          edgeLine = new Line3D(e.vert.position, ne.vert.position)
          #console.log('line', e.vert.position.toString(), ne.vert.position.toString())
          p = plane.intersectSegment(edgeLine)
          if debug then console.log(' ', p.toString(), p.ratio) if p
          if p and p.ratio >= -EPSYLON && p.ratio <= 1 + EPSYLON
            found = false
            hits.forEach (hit) -> if hit.point.equals(p) then found = true
            if !found then hits.push({edge:e, point:p, ratio: p.ratio})
        if debug then console.log(' ', hits.length, 'hits', hits.map (v) -> [v.point.toString(), v.ratio])
        #if hits.length > 2
        #  if hits[0].point.equals(hits[1].point) || hits[0].point.equals(hits[2].point)
        #    hits.splice(0, 1)
        #    console.log(' ', hits.length, 'hits', hits.map (v) -> v.point.toString())

        if hits.length == 2
          #console.log(' split')
          splitEdge0 = hits[0].edge
          splitEdge1 = hits[1].edge
          if debug then console.log('split between', splitEdge0.vert.position.toString(), splitEdge1.vert.position.toString())
          if (hits[0].ratio > 0 + EPSYLON) && (hits[0].ratio < 1 - EPSYLON)
            if debug then console.log('split 1', hits[0].ratio)
            newEdge = hemesh.splitEdge(splitEdge0, hits[0].ratio)
            splitEdge0 = splitEdge0.next
            # if debug then console.log(splitEdge0.vert.position, splitEdge0.next.vert.position)
          else if hits[0].ratio > 1 - EPSYLON
            if debug then console.log('should move 1')
            splitEdge0 = splitEdge0.next
          if (hits[1].ratio > 0 + EPSYLON) && (hits[1].ratio < 1 - EPSYLON)
            if debug then console.log('split 2', hits[1].ratio)
            hemesh.splitEdge(splitEdge1, hits[1].ratio)
            #if debug then console.log(splitEdge0.vert.position, splitEdge0.next.vert.position)
            splitEdge1 = splitEdge1.next
          else if hits[1].ratio > 1 - EPSYLON
            if debug then console.log('should move 2')
            splitEdge1 = splitEdge1.next

          hemesh.splitFace(splitEdge0, splitEdge1)
      facesToRemove = []

      hemesh.fixDuplicatedVertices();
      #hemesh.fixDuplicatedEdges();
      #hemesh.fixVertexEdges();
      #hemesh.fixEdgePairs();
      #hemesh.check();

      hemesh.edges.forEach (e) -> e.onThePlane = false

      hemesh.faces.map (face, faceIndex) ->
        c = face.getCenter()
        center = face.getCenter()
        above = face.above = plane.isPointAbove(center)
        facesToRemove.push(face) if above

      if debug then console.log('facesToRemove.length', facesToRemove.length)

      newFaceEdges = []

      facesToRemove.forEach (face) ->
        face.edgePairLoop (e) ->
          if plane.contains(e.vert.position) && plane.contains(e.next.vert.position)# && e.vert.position.distance(e.next.vert.position) > EPSYLON
            e.onThePlane = true
            newFaceEdges.push(e)

      hemesh.vertices.forEach (v, vi) -> v.index = vi

      if debug then console.log('newFaceEdges.length', newFaceEdges.length)
      if debug then console.log(newFaceEdges.map (e) -> [e.vert.index, e.next.vert.index])

      if newFaceEdges.length == 0 then return

      newFaceEdgesSorted = []
      newFaceEdgesSorted.push(newFaceEdges.shift())
      guard = 0
      while newFaceEdges.length > 0 && ++guard < 1000
        endVert = newFaceEdgesSorted[newFaceEdgesSorted.length-1].next.vert
        for edge, edgeIndex in newFaceEdges
          if endVert == edge.vert
            newFaceEdgesSorted.push(edge)
            newFaceEdges.splice(edgeIndex, 1)
            break

      if debug then console.log(newFaceEdgesSorted.map (e) -> [e.vert.index, e.next.vert.index])

      return if !remove

      newFace = new HEFace(newFaceEdgesSorted[0])
      hemesh.faces.push(newFace)

      facesToRemove.forEach (face) ->
        hemesh.faces.splice(hemesh.faces.indexOf(face), 1)
        face.edgePairLoop (e) ->
          if !e.onThePlane
            ei = hemesh.edges.indexOf(e)
            if ei != -1
              hemesh.edges.splice(ei, 1)

      newFaceEdgesSorted.forEach (e, ei) ->
        ne = newFaceEdgesSorted[(ei+1) % newFaceEdgesSorted.length]
        e.next = ne
        e.face = newFace

    draw: () ->
      @gl.clearColor(0,0,0,1);
      @gl.clear(@gl.DEPTH_BUFFER_BIT | @gl.COLOR_BUFFER_BIT);
      @gl.enable(@gl.DEPTH_TEST);
      @linesMesh.draw(@camera) if @debugMode
      if @meshMode then @meshes.forEach (mesh) =>
        if @explode
          mesh.position = lerp(mesh.position, mesh.targetPosition, 0.2)
          #mesh.position.add(mesh.targetPosition.dup.sub*mesh.originalPosition, 0.01)
        else
          mesh.position = lerp(mesh.position, mesh.originalPosition, 0.5)
        mesh.draw(@camera)

