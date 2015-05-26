define (require) ->
  { Vec3, Quat } = require('pex/geom')
  { Cube  } = require 'pex/geom/gen'
  { SolidColor  } = require 'pex/materials'
  { Mesh } = require 'pex/gl'
  { Time } = require 'pex/utils'
  { Color } = require 'pex/color'
  { sin, cos, floor, random, PI } = Math

  UP = new Vec3(0, 1, 0)

  class GeneHelix
    constructor: () ->
      geom = new Cube(1,1,1)
      geom.computeEdges()

      @active = false
      @static = false
      @visible = true
      @localRotation = random() * PI * 2
      @rotation = 0
      @targetRotation = 0

      @aminoacidColor = new Color(0.2, 1.0, 0.8, 1.0)
      @activeMaterial = new SolidColor({color: new Color(1,1,1,1)})
      @inactiveMaterial = new SolidColor({color: Color.Yellow})
      @mesh = new Mesh(geom, @inactiveMaterial, { useEdges: true })
      @aminoacid = new Mesh(geom, new SolidColor({color: @aminoacidColor}))
      @bridge = new Mesh(geom, new SolidColor({color: @aminoacidColor}))


      @targetPosition = new Vec3(0, 0, 0)

      @aminoInstances = []
      nPerHelix = 18
      scale = new Vec3(0.025, 0.025, 0.025)
      @positionRange = 0.25
      for i in [0..nPerHelix-1]
        @aminoInstances.push {
          scale: scale
          position: new Vec3(0,0,0)
        }
        @aminoInstances.push {
          scale: scale
          position: new Vec3(0,0,0)
        }

      @bridgeInstances = []
      bridgeScale = new Vec3(0.5, 0.005, 0.005)
      for i in [0..nPerHelix-1]
        @bridgeInstances.push {
          scale: bridgeScale
          position: new Vec3(0,0,0)
          rotation: new Quat().setAxisAngle(UP, 800*Math.random())
        }

      #gene.mesh.rotation.setAxisAngle(UP, geneIndex * 20 + Time.seconds*50)

    setActive: (state) ->
      @active = state
      if @active
        @mesh.setMaterial(@activeMaterial)

    setStatic: (state) ->
      @static = state

    setVisible: (state) ->
      @visible = state

    draw: (camera) ->
      if !@visible then return
      @rotationSpeed = 0.5
      if !@active then @rotationSpeed = 0

      @rotation += (@targetRotation - @rotation) * 0.1

      @aminoInstances.forEach (inst, instIndex) =>
        t = floor(instIndex/2)/floor(@aminoInstances.length/2)
        anlgeOffset = if instIndex % 2 == 0 then 0 else PI
        inst.position.set(
          @mesh.position.x + @positionRange*cos(@localRotation + anlgeOffset + t*2*PI + Time.seconds*4 * @rotationSpeed),
          @mesh.position.y + t-0.5,
          @mesh.position.z + @positionRange*sin(@localRotation + anlgeOffset + t*2*PI + Time.seconds*4 * @rotationSpeed)
        )
      @bridgeInstances.forEach (inst, instIndex) =>
        t = instIndex/@bridgeInstances.length
        inst.position.set(
          @mesh.position.x,
          @mesh.position.y + t-0.5,
          @mesh.position.z
        )
        inst.rotation.setAxisAngle(new Vec3(0, 1, 0), -@localRotation/PI*180 - 4*Time.seconds/PI*180 * @rotationSpeed - 360*t + 180)
      k = ((@rotation % (2 * PI)) + 2 * PI) % (2 * PI) / (2 * PI)

      if k != 0
        @aminoacidColor.setHSV(k, 0.5, 1)

      @mesh.draw(camera) if !@static
      @mesh.rotation.setAxisAngle(new Vec3(0, 1, 0), 180/PI * @rotation)
      @aminoacid.drawInstances(camera, @aminoInstances)
      @bridge.drawInstances(camera, @bridgeInstances)


