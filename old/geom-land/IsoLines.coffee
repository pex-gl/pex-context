define (require) ->
  { Plane : PlaneGeom } = require('pex/geom/gen')
  { Mesh } = require('pex/gl')
  { SolidColor } = require('pex/materials')
  { Color } = require('pex/color')
  ShowIsoLines = require('materials/ShowIsoLines')

  class IsoLines extends Mesh
    constructor: (nu, nv) ->
      planeGeom = new PlaneGeom(1, 1, nu/2, nv/2, 'x', 'z')
      #planeGeom.computeEdges()
      super(planeGeom, new ShowIsoLines({color:new Color(1,1,1,0.5)}))

    update: (surface, t=0) ->
      @geometry.vertices.forEach (v) ->
        v.y = surface.eval(v.x, v.z, t)
      @geometry.vertices.dirty = true