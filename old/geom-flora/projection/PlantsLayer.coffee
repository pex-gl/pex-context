define (require) ->
  Instance = require('flora/plants/Instance')
  { Mesh } = require('pex/gl')
  { Cube } = require('pex/geom/gen')
  { SolidColor, Diffuse } = require('pex/materials')
  Config = require('flora/game/Config')
  { min } = Math

  class PlantsLayer
    constructor: (@nx, @ny, @landTiles) ->
      @instances = []

      @size = min(1/nx, 1/ny)*0.5

      for landTile in @landTiles
        inst = new Instance()
        inst.position.setVec3(landTile.position)
        inst.targetPosition.setVec3(landTile.position)
        inst.scale.set(@size, @size, @size)
        inst.targetScale.set(@size, @size, @size)

        @instances.push(inst)

      @plantMesh = new Mesh(new Cube(), new Diffuse())

    draw: (camera) ->
      for instance, instanceIndex in @instances
        instance.position.setVec3(@landTiles[instanceIndex].targetPosition)
        instance.position.y += @size
      @plantMesh.drawInstances(camera, @instances)