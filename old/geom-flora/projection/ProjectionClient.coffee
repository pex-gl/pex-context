define (require) ->
  Config = require('flora/game/Config')

  class ProjectionClient
    constructor: () ->
      @socket = null
      @connected = false
      @mode = ''

    init: () ->
      if typeof(ReconnectingWebSocket) != 'undefined'
        wsAddress = "ws://#{Config.server.host}:#{Config.server.port}"
        console.log('wsAddress', wsAddress)
        console.log('ProjectionClient.init', wsAddress)
        @socket = new ReconnectingWebSocket(wsAddress);
        @socket.onopen = () =>
          console.log('ProjectionClient.onopen', 'connected')
          @connected = true
        @socket.onclose = () =>
          console.log('ProjectionClient.onclose', 'disconnected')
          @mode = null
          @connected = false
        @socket.onmessage = (msg) => @onMessage(JSON.parse(msg.data))
      else
        console.log('ProjectionClient.init', 'no web socket found')

    onMessage: (msg) ->
      if msg.type == 'time'
        @mode = msg.mode
        #console.log(@mode)
      if msg.type == 'ping'
        #console.log(msg)
        if @onPing then @onPing(msg.plant)
      if msg.type == 'genotype'
        #console.log(msg)
        if @onGenotype then @onGenotype(msg.plant, msg.genotype)