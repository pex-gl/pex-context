define (require) ->
  { Mesh, Context } = require('pex/gl')
  { Cube } = require('pex/geom/gen')
  { SolidColor } = require('pex/materials')
  { Color } = require('pex/color')

  class BoundingBoxHelper extends Mesh
    constructor: (bbox, color) ->
      color = Color.White if !color

      size = bbox.getSize()
      console.log('hmm', size)
      cube = new Cube(size.x, size.y, size.z)
      cube.computeEdges();

      super(cube, new SolidColor({color:color}), { useEdges:true, primitiveType: Context.currentContext.gl.LINES })

      @position.copy(bbox.getCenter())
