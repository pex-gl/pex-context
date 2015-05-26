define (require) ->
  { Mesh, Context } = require('pex/gl')
  { LineBuilder } = require('pex/geom/gen')
  { ShowColors } = require('pex/materials')
  { Color } = require('pex/color')
  { Vec3 } = require('pex/geom')

  class AxisHelper extends Mesh
    constructor: (@origin, @size) ->
      @origin = new Vec3(0, 0, 0) if !@origin
      @size = 1 if !@size

      lineBuilder = new LineBuilder()
      lineBuilder.addLine(@origin, new Vec3(@origin.x + @size, @origin.y, @origin.z), Color.Red)
      lineBuilder.addLine(@origin, new Vec3(@origin.x, @origin.y + @size, @origin.z), Color.Green)
      lineBuilder.addLine(@origin, new Vec3(@origin.x, @origin.y, @origin.z + @size), Color.Blue)

      super(lineBuilder, new ShowColors(), { useEdges:true, primitiveType: Context.currentContext.gl.LINES })
