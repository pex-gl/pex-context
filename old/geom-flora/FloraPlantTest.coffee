define (require) ->
  pex = require('pex')
  { Window, Platform } = pex.sys
  { Rect } = pex.geom
  { PlantType, Config } = require('flora/game')
  { GenesPanel, KnobsPanel } = require('flora/game/ui')
  { Fruit, Cactus, Herb, Algae, Grass, Flower } = require('flora/plants')
  GrassInstanced = require('flora/plants/GrassInstanced')
  GUI = require('pex/gui/GUI')

  Window.create
    settings:
      fullscreen: Platform.isEjecta
      width: 1536/2.5
      height: 2048/2.5
    init: () ->

      @initUI()

    initUI: () ->
      plantIndex = 0

      @gui = new GUI(this, 5, 5, if Platform.isEjecta then 2 else 1)

      @cactus = new Cactus(this)


    draw: () ->
      @gl.clearColor(0,0,0,1)
      @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
      @gl.disable(@gl.DEPTH_TEST)

      @cactus.draw()
      @gui.draw()