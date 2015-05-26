define (require) ->
  { Mesh, Context } = require('pex/gl')
  { Cube } = require('pex/geom/gen')
  { SolidColor, Diffuse } = require('pex/materials')
  { Color } = require('pex/color')

  class OctreeHelper extends Mesh
    constructor: (octree, options) ->
      level = options.level
      wireframe = options.wireframe
      if !level? then level = 1

      @cells = octree.getAllCellsAtLevel(level)

      cube = new Cube()

      if wireframe
        cube.computeEdges()
        options = { useEdges:true, primitiveType: Context.currentContext.gl.LINES }
      else
        options = {}

      super(cube, new Diffuse(), options)

      #@position.copy(bbox.getCenter())

    draw: (camera) ->
      for cell in @cells
        @position.x = cell.position.x + cell.size.x/2
        @position.y = cell.position.y + cell.size.y/2
        @position.z = cell.position.z + cell.size.z/2
        @scale.x = cell.size.x
        @scale.y = cell.size.y
        @scale.z = cell.size.z
        @material.uniforms.diffuseColor = cell.points[0].color if cell.points.length > 0 && cell.points[0].color
        super(camera)
