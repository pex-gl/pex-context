define (require) ->
  pex = require('pex')
  { Window, Platform } = pex.sys
  { Rect, Vec3 } = pex.geom
  { PlantType, Config } = require('flora/game')
  { Time } = require('pex/utils')
  { GenesPanel, KnobsPanel, PlantsPanel, ConnectionStatus, TextLabel, GameInfo } = require('flora/game/ui')
  { Texture2D } = require('pex/gl')
  plantsClasses = require('flora/plants')
  storage = require('utils/Storage')
  Utils = require('utils/Utils')
  Client = require('flora/game/Client')
  Gene = require('flora/plants/Gene')
  GeometryRecorder = require('utils/GeometryRecorder')

  GENERATING = 'generating'
  GAME = 'game'
  SIMULATION_1 = 'simulation_round1'
  SIMULATION_2 = 'simulation_round2'
  SIMULATION_3 = 'simulation_round3'
  RESULTS = 'results'
  RESULTS_WINNER = 'results_winner'
  FEEDBACK = 'feedback'

  Window.create
    settings:
      fullscreen: Platform.isEjecta
      width: 1536/2.5
      height: 2048/2.5
    init: () ->
      @needSave = false

      @selectedPlantType = storage.getItem('selectedPlant')
      #@selectedPlantType = null
      @initUI()

    initUI: () ->
      @plants = []

      @client = new Client()
      @client.init()

      @connectionStatus = new ConnectionStatus(this)
      @connectionStatus.onTrippleClick = () =>
        @selectedPlantType = null
        @plantsPanel.enabled = true
        @plantsPanel.closing = false

      @gameInfo = new GameInfo(this);

      @timeLabel = new TextLabel(this, new Vec3(this.width/2, this.width/7, 0), "00:30", this.width/20, 0.6)

      @genesPanel = new GenesPanel(this)
      @genesPanel.enabled = false

      @knobsPanel = new KnobsPanel(this)
      @knobsPanel.enabled = false
      @knobsPanel.onChange = @onKnobChange.bind(this)

      for plantType, plantInfo of Config.plants
        plant = new plantsClasses[plantInfo.className](this)
        plant.type = plantType
        plant.iconTexture = Texture2D.load(plantInfo.icon)
        plant.iconBgTexture = Texture2D.load(plantInfo.iconBg)
        for geneName, gene of plant.genes
          if plantInfo.genes[geneName]
            gene.iconTexture = Texture2D.load(plantInfo.genes[geneName])
            gene.enabled = true
          else
            gene.enabled = false
        @plants.push(plant)

      @plantsPanel = new PlantsPanel(this)
      @plantsPanel.onChange = @onPlantsPanelChange.bind(this)

      if @selectedPlantType
        @plantsPanel.enabled = false
        @setSelectedPlantType(@selectedPlantType)

      @on 'leftMouseDown', @onMouseDown.bind(this)

      @on 'keyDown', (e) ->
        if e.str == 'S'
          @needSave = true

      @geometryRecorder = new GeometryRecorder('models')

    reset: () ->
      selectedPlant = @getSelectedPlant()
      if !selectedPlant then return
      availableGenes = []
      for geneName, gene of selectedPlant.genes
        if gene.enabled
          availableGenes.push(gene)
      #availableGenes = Utils.shuffle(availableGenes)
      selectedPlant.activeGenes = availableGenes.slice(0, 3)
      @genesPanel.enabled = true
      @knobsPanel.enabled = true
      @knobsPanel.reinitialize()

    getSelectedPlant: () ->
      for plant in @plants
        if plant.type == @selectedPlantType
          return plant
      return null

    setSelectedPlantType: (plantType) ->
      console.log('FloraGame.setSelectedPlantType', plantType)
      @selectedPlantType = plantType
      storage.setItem('selectedPlant', plantType)
      @reset()

    onPlantsPanelChange: (plantType) ->
      console.log('FloraGame.onPlantsPanelChange', plantType)
      @setSelectedPlantType(plantType)

    onKnobChange: (index, value) ->
      plant = @getSelectedPlant()
      if !plant then return
      gene = plant.activeGenes[index]
      if !gene
        console.log('FloraGame.onKnobChange', index, 'no active gene with that index')
        return

      plantGene = plant.genes[gene.name]
      if !plantGene
        console.log('FloraGame.onKnobChange', gene.name, 'plant doesn\'t have that gene')
        return

      plantGene.normalizedValue = value

    onMouseDown: () ->
      if @selectedPlantType then @client.sendPing(@selectedPlantType)

    update: () ->
      if Time.frameNumber % 30 == 0
        genotype = {}
        plant = @getSelectedPlant()
        for geneName, gene of plant.genes
          genotype[geneName] = gene.normalizedValue
        @client.sendGenotype(@selectedPlantType, genotype)

    draw: () ->
      try
        @gl.clearColor(0,0,0,1)
        @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
        @gl.disable(@gl.DEPTH_TEST)

        if @plantsPanel.enabled
          @plantsPanel.draw()
        else
          @update()
          if @needSave
            @geometryRecorder.start()
          @getSelectedPlant().draw()
          if @needSave
            @needSave = false
            @geometryRecorder.stop()
          @knobsPanel.draw()
          @genesPanel.draw()
          @gameInfo.draw()

        @connectionStatus.draw()

        if @client.mode == GAME
          @timeLabel.setTime(0, @client.duration - @client.time)
        else
          @timeLabel.setText('   ')
        @timeLabel.draw()
      catch e
        if !@errors then @errors = {}
        if @errors[e] then return
        @errors[e] = e
        console.log(e.stack)
