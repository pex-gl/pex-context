define (require) ->
  HEMesh = require('pex/geom/hem/HEMesh')
  { Vec3 } = require('pex/geom')
  Line3D = require('geom/Line3D')
  HEFace = require('pex/geom/hem/HEFace')

  EPSYLON = 0.0001

  HEMesh.prototype.clip = (plane) ->
    debug = false
    remove = true
    #console.log('CLIPPING')
    numFaces = @faces.length
    @faces.forEach (face, faceIndex) =>
      #console.log(faceIndex, 'face')
      debug = false
      #if faceIndex >= numFaces then return
      #if faceIndex >= 4 then return
      #if faceIndex == 3 then debug = true
      hits = []
      #console.log('face', faceIndex + '/' + @faces.length)
      face.edgePairLoop (e, ne) =>
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
          newEdge = @splitEdge(splitEdge0, hits[0].ratio)
          splitEdge0 = splitEdge0.next
          # if debug then console.log(splitEdge0.vert.position, splitEdge0.next.vert.position)
        else if hits[0].ratio > 1 - EPSYLON
          if debug then console.log('should move 1')
          splitEdge0 = splitEdge0.next
        if (hits[1].ratio > 0 + EPSYLON) && (hits[1].ratio < 1 - EPSYLON)
          if debug then console.log('split 2', hits[1].ratio)
          @splitEdge(splitEdge1, hits[1].ratio)
          #if debug then console.log(splitEdge0.vert.position, splitEdge0.next.vert.position)
          splitEdge1 = splitEdge1.next
        else if hits[1].ratio > 1 - EPSYLON
          if debug then console.log('should move 2')
          splitEdge1 = splitEdge1.next

        @splitFace(splitEdge0, splitEdge1)
    facesToRemove = []

    @fixDuplicatedVertices();
    #@fixDuplicatedEdges();
    #@fixVertexEdges();
    #@fixEdgePairs();
    #@check();

    @edges.forEach (e) => e.onThePlane = false

    @faces.map (face, faceIndex) =>
      c = face.getCenter()
      center = face.getCenter()
      above = face.above = plane.isPointAbove(center)
      facesToRemove.push(face) if above

    if debug then console.log('facesToRemove.length', facesToRemove.length)

    newFaceEdges = []

    facesToRemove.forEach (face) =>
      face.edgePairLoop (e) =>
        if plane.contains(e.vert.position) && plane.contains(e.next.vert.position)# && e.vert.position.distance(e.next.vert.position) > EPSYLON
          e.onThePlane = true
          newFaceEdges.push(e)

    @vertices.forEach (v, vi) => v.index = vi

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
    @faces.push(newFace)

    facesToRemove.forEach (face) =>
      @faces.splice(@faces.indexOf(face), 1)
      face.edgePairLoop (e) =>
        if !e.onThePlane
          ei = @edges.indexOf(e)
          if ei != -1
            @edges.splice(ei, 1)

    newFaceEdgesSorted.forEach (e, ei) =>
      ne = newFaceEdgesSorted[(ei+1) % newFaceEdgesSorted.length]
      e.next = ne
      e.face = newFace