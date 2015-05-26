define (require) ->
  Mesh = require('pex/gl/Mesh')
  Context = require('pex/gl/Context')
  LineBuilder = require('pex/geom/gen/LineBuilder')
  Color = require('pex/color/Color')
  SolidColor = require('pex/materials/SolidColor')

  class PathHelper extends Mesh
    constructor: (path, color) ->
      color = color || Color.White

      geom = new LineBuilder()

      for i in [0..path.points.length-2]
        point = path.points[i]
        nextPoint = path.points[i+1]
        geom.addLine(point, nextPoint)

      super(geom, new SolidColor({color:color}), { useEdges:true, primitiveType: Context.currentContext.gl.LINES })