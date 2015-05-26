define (require) ->
  Instance = require('flora/plants/Instance')
  { Mesh } = require('pex/gl')
  { hem } = require('pex/geom')
  { Cube } = require('pex/geom/gen')
  { SolidColor, Diffuse } = require('pex/materials')
  Config = require('flora/game/Config')
  { min, floor, random } = Math
  { randomElement, randomChance, randomInt, randomFloat, seed } = require('pex/utils/MathUtils')
  { Timeline, anim } = require('lib/timeline')
  { Time } = require('pex/utils')
  { Color } = require('pex/color')
  PlantType = require('flora/game/PlantType')

  APPEAR_TIME = 1
  DISAPPEAR_DELAY_TIME = 1
  DISAPPEAR_TIME = 2

  class FloraLayer
    constructor: (@nx, @ny, @landTiles, @sim) ->
      @instances = []

      @size = min(1/nx, 1/ny)*0.5
      @simulating = false

      for landTile in @landTiles
        inst = new Instance()
        inst.position.setVec3(landTile.position)
        inst.targetPosition.setVec3(landTile.position)
        inst.scale.set(0, 0, 0)
        inst.targetScale.set(@size, @size, @size)
        inst.plantType = null
        inst.generation = 0
        inst.uniforms = {
          diffuseColor: Color.Black
        }
        @instances.push(inst)

      #inst = new Instance()
      #inst.scale.set(0.25,0.25,0.25)

      plantGeom = new Cube()
      plantGeom = hem().fromGeometry(plantGeom)
      plantGeom.faces[4].getAllVertices().forEach (v) ->
        v.position.x *= 0.5
        v.position.y = 1.5
        v.position.z *= 0.5
      plantGeom = plantGeom.toFlatGeometry()

      @plantMesh = new Mesh(plantGeom, new Diffuse())

    startSimulation: () ->
      if @simulating then return
      @simulating = true

      console.log('FloraLayer.startSimulation', @sim.landscape.wireframe)

      for inst, instIndex in @instances
        landTile = @landTiles[instIndex]
        landType = landTile.landType
        inst.plantType = null
        inst.generation = 0

      @randomSpread()

      setTimeout(@randomSpread.bind(this), 3000)
      setTimeout(@randomSpread.bind(this), 10000)

    randomSpread: () ->
      numX = Config.simulation.numTilesX
      numY = Config.simulation.numTilesY
      seed(Date.now())
      for plantType in Config.plantTypes
        for i in [0...10]
          x = randomInt(3, numX-3)
          y = randomInt(3, numY-3)
          tile = @landTiles[ x + y * numX ]
          chance = Config.simulation.fittnes[plantType][tile.landType]
          if chance > 0
            @putPlant(x, y, plantType, 1)
            break

    findWinner: () ->
      return Config.plantTypes[floor(random() * 6)]


    stopSimulation: () ->
      if !@simulating then return
      @simulating = false
      winner = @findWinner()
      Timeline.getGlobalInstance().clear()
      for inst in @instances
        if inst.plantType == winner
          anim(inst.scale).to(DISAPPEAR_DELAY_TIME, {x:0, y:0, z:0}, DISAPPEAR_TIME)
        else
          anim(inst.scale).to(Math.random()*DISAPPEAR_DELAY_TIME/2, {x:0, y:0, z:0}, DISAPPEAR_TIME/2)
        inst.plantType = null
        inst.generation = 0

    putPlant: (x, y, plantType, generation) ->
      numX = Config.simulation.numTilesX
      numY = Config.simulation.numTilesY

      inst = @instances[ x + y * numX]
      inst.plantType = plantType
      inst.uniforms.diffuseColor = Config.colorsByPlantType[plantType]
      inst.new = true
      inst.generation = generation
      s = @size * randomFloat(0.2, 1.5) * (1 - generation / 100)
      anim(inst.scale).to(APPEAR_TIME, {x:s, y:s, z:s}, 1)

    maybePutPlant: (x, y, plantType, generation) ->
      numX = Config.simulation.numTilesX
      numY = Config.simulation.numTilesY
      inst = @instances[ x + y * numX]
      landTile = @landTiles[ x + y * numX]
      landType = landTile.landType

      chance = (1.0 + Config.simulation.fittnes[plantType][landType]) / generation

      if inst.generation == 0 && inst.plantType == null && randomChance(chance)
        @putPlant(x, y, plantType, generation)

    round: 0
    updateSimulation: () ->
      numX = Config.simulation.numTilesX
      numY = Config.simulation.numTilesY
      for y in [0...numY]
        for x in [0...numX]
          inst = @instances[ x + y * numX]
          if inst.plantType != null && !inst.new
            if x < numX - 1 then @maybePutPlant(x+1, y, inst.plantType, inst.generation+1)
            if x > 0 then @maybePutPlant(x-1, y, inst.plantType, inst.generation+1)
            if y < numY - 1 then @maybePutPlant(x, y+1, inst.plantType, inst.generation+1)
            if y > 0 then @maybePutPlant(x, y-1, inst.plantType, inst.generation+1)

    updateBars: () ->
      values = [0.5, 0.2, 0.1, 0.5, 0.4, 0.7]
      count = [0, 0, 0, 0, 0, 0]
      typeMap = ['fruit', 'algae', 'flower', 'herb', 'grass', 'cactus']
      for instance in @instances
        i = typeMap.indexOf(instance.plantType)
        if i != -1
          count[i]++

      totalNumTiles = Config.simulation.numTilesX * Config.simulation.numTilesY
      values = count.map (v) -> min(1, 3 * v/totalNumTiles)
      @applyCss(values)

    applyCss: (values) ->
      bars = document.querySelectorAll("#bars li")
      for i in [0...6]
        w = floor(values[i] * 100)
        m = 66 + 100 - w
        bars[i].style.width = w + 'px';
        bars[i].style.marginRight = m + 'px';

    draw: (camera) ->
      @updateBars()

      Timeline.getGlobalInstance().update(Time.delta);

      if Time.frameNumber % 60 == 0 then @updateSimulation()

      for instance, instanceIndex in @instances
        console
        instance.position.setVec3(@landTiles[instanceIndex].position)
        instance.position.y += @size/2 + @landTiles[instanceIndex].scale.y/2
        if instance.plantType
          instance.uniforms.diffuseColor = Config.colorsByPlantType[instance.plantType].clone()
          instance.uniforms.diffuseColor.r -= instance.position.y * 2
          instance.uniforms.diffuseColor.g -= instance.position.y * 2
          instance.uniforms.diffuseColor.b -= instance.position.y * 2
        instance.new = false
      @plantMesh.drawInstances(camera, @instances)