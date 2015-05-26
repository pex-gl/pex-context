define (require) ->
  { Geometry, hem } = require('pex/geom')
  FaceSelector = require('flora/plants/modular/FaceSelector')

  class Modulae
    constructor: (geom) ->
      @hem = hem().fromGeometry(geom)
      @modules = []
      @moduleQueue = []

    apply: (mod) ->
      if mod instanceof FaceSelector
        mod.apply(@hem, null)
        @modules.push(mod)
      else
        for module in @modules
          if module.faces.length > 0
            mod.apply(@hem, module.faces.shift())
            @modules.push(mod)
            break

    add: (mod) ->
      @moduleQueue.push(mod)

    update: () ->
      if @modules.length > 0
        if !@modules[@modules.length-1].done && @modules[@modules.length-1].update
          @modules[@modules.length-1].update()
          return
      if @moduleQueue.length > 0
        @apply(@moduleQueue.shift())

    getGeometry: () ->
      @hem.toFlatGeometry()

    getSelectionGeometry: () ->
      g = new Geometry({vertices:true})
      #@hem.clearSelection()
      for module in @modules
        for face in module.faces
          #face.selected = true
          g.vertices.push(face.getCenter())
      #@hem.toFlatGeometry(null, true)
      g