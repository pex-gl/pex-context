define (require) ->
  Waterfall = require('effects/Waterfall')
  RGBDToPosConverter = require('effects/RGBDToPosConverter')
  Normals = require('effects/Normals')
  Polygons = require('effects/Polygons')
  NormalsDistort = require('effects/NormalsDistort',)
  NoiseDistort = require('effects/NoiseDistort')
  Blink = require('effects/Blink')
  RGBDToPosConverter = require('effects/RGBDToPosConverter')

  class EffectsScene
    constructor: (app, @sourcesScene, @sources, @sourceId) ->
      @effects = []

      #@gui.addLabel(' ')
      #@gui.addLabel('Mesh')
      #@gui.addParam('Opacity', @meshes[0].material.uniforms, 'opacity', {min:0, max:1})

      @converter = new RGBDToPosConverter(app, @sources[@sourceId])

      @noiseDistort = new NoiseDistort(app, @sources[@sourceId], @sourcesScene.effectBoundingBox, @converter.particlePositions)
      @effects.push(@noiseDistort)

      @polygons = new Polygons(app, @sources[@sourceId], @sourcesScene.effectBoundingBox, @converter.particlePositions)
      @effects.push(@polygons)

      @normalsDistort = new NormalsDistort(app, @sources[@sourceId], @sourcesScene.effectBoundingBox, @converter.particlePositions)
      @effects.push(@normalsDistort)

      @waterfall = new Waterfall(app, @sources[@sourceId], @sourcesScene.effectBoundingBox, @converter.particlePositions)
      @effects.push(@waterfall)

      @effects.push(@polygons)

      @blink = new Blink(app, @sources[@sourceId], @sourcesScene.effectBoundingBox, @converter.particlePositions)
      @effects.push(@blink)
