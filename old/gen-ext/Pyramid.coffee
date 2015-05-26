define (require) ->
  Vec3 = require('pex/geom/Vec3')
  Face3 = require('pex/geom/Face3')
  Edge = require('pex/geom/Edge')
  Geometry = require('pex/geom/Geometry')

  class Pyramid extends Geometry
    constructor: (baseSizeX=1,baseSizeZ=1,height=1) ->

      vertices = [
        new Vec3(-baseSizeX/2, 0, -baseSizeZ/2),   #far left
        new Vec3(-baseSizeX/2, 0,  baseSizeZ/2),   #near left
        new Vec3( baseSizeX/2, 0,  baseSizeZ/2),   #near right
        new Vec3( baseSizeX/2, 0, -baseSizeZ/2)    #far right
        new Vec3(0, height, 0)                     #top
      ];

      faces = [
        new Face3(0, 2, 1),
        new Face3(3, 2, 0),
        new Face3(0, 1, 4),
        new Face3(1, 2, 4),
        new Face3(2, 3, 4),
        new Face3(3, 0, 4)
      ]

      edges = [
        new Edge(0, 1),
        new Edge(1, 2),
        new Edge(2, 3),
        new Edge(3, 0),
        new Edge(0, 4),
        new Edge(1, 4),
        new Edge(2, 4),
        new Edge(3, 4)
      ]

      super({vertices:vertices, faces:faces, edges:edges})