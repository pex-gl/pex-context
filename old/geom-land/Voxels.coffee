define (require) ->
  { Cube } = require('pex/geom/gen')
  { Mesh, Context } = require('pex/gl')
  { SolidColor, Diffuse } = require('pex/materials')
  { Vec3 } = require('pex/geom')
  { Color } = require('pex/color')
  { min, max, abs } = Math
  { mix,randomFloat } = require('pex/utils/MathUtils')
  Config = require('flora/game/Config')

  class ValueRange
    constructor: (@name) ->

    start: ()->
      @min = null
      @max = null

    add: (v) ->
      if v < @min || @min == null then @min = v
      if v > @max || @max == null then @max = v

    toString: () ->
      return "#{@name} min:#{@min} max:#{@max}"


  class Voxels extends Mesh
    constructor: (nu, nv) ->
      @gl = Context.currentContext.gl
      @size = min(1/nu, 1/nv)#*0.8
      @ratio = nu / nv
      cubeGeom = new Cube(1, 1, 1)
      cubeGeom.computeEdges()
      @fillMaterial = new Diffuse({diffuseColor:Color.Black, wrap:2})
      @edgesMaterial = new SolidColor({color: Config.colors.gold})
      @cubeMeshFill = new Mesh(cubeGeom, @fillMaterial)
      @cubeWireframeMesh = new Mesh(cubeGeom, @edgesMaterial, { useEdges: true })
      @wireframe = 0
      @targetWireframe = 0
      @time = 0
      @height = 0
      @targetHeight = 0
      @levelOffset = 0

      @instances = []
      for z in [0...nv]
        for x in [0...nu]
          u = (x / nu - 0.5) * @ratio
          v = z / nv - 0.5
          @instances.push({
            position: new Vec3(u, 0, v)
            scale: new Vec3(@size,@size,@size)
            uniforms:
              ambientColor: new Color(0, 0, 0, 1)
              diffuseColor: new Color(0, 0, 0, 1)
          })

      @range = new ValueRange('y')

      super(cubeGeom, @edgesMaterial, { useEdges: true })

    setWireframe: (state) ->
      @targetWireframe = if state then 1 else 0

    setHeight: (state) ->
      @targetHeight = state

    update: (surface, dt=0) ->
      @time += dt * (@wireframe*@wireframe)
      @wireframe += (@targetWireframe - @wireframe) * 0.1
      @height += (@targetHeight - @height) * 0.2
      if @targetHeight == 0 && @height < 0.01
        @height = 0
        @levelOffset = randomFloat(-0.01, 0.03)

      @range.start()
      for instance in @instances
        y = 0
        for i in [1..4]
          v = 1/i * surface.eval((instance.position.x+0.5)*i, (instance.position.z+0.5)*i, @time)
          y += v
        y *= 0.4
        y += 0.03
        y += @levelOffset
        height = y * 1/0.25

        steps = [-0.2, 0, 0.25, 0.45, 0.6, 0.7];
        from = 0
        to = 0
        k = -1
        if height < steps[0]
          k = 1
          from = 0
          to = 0
        if height > steps[steps.length-1]
          k = 1
          from = 5
          to = 5

        if k == -1
          for i in [0...steps.length]
            if height < steps[i]
              from = i-1
              to = i
              k = (height - steps[i-1])/(steps[i] - steps[i-1])
              break;

        @range.add(to)
        instance.landType = to
        instance.uniforms.diffuseColor.r = (@wireframe) * mix(Config.colorsByHeight[from].r, Config.colorsByHeight[to].r, k)
        instance.uniforms.diffuseColor.g = (@wireframe) * mix(Config.colorsByHeight[from].g, Config.colorsByHeight[to].g, k)
        instance.uniforms.diffuseColor.b = (@wireframe) * mix(Config.colorsByHeight[from].b, Config.colorsByHeight[to].b, k)
        instance.uniforms.ambientColor.r = (@wireframe) * mix(Config.colorsByHeightSecondary[from].r, Config.colorsByHeightSecondary[to].r, k)
        instance.uniforms.ambientColor.g = (@wireframe) * mix(Config.colorsByHeightSecondary[from].g, Config.colorsByHeightSecondary[to].g, k)
        instance.uniforms.ambientColor.b = (@wireframe) * mix(Config.colorsByHeightSecondary[from].b, Config.colorsByHeightSecondary[to].b, k)

        y *= 0.5
        y *= @height
        if y < -0
          y = -0
        instance.position.y = y/2
        instance.scale.y = @size * (1 + y / @size)

    draw: (camera) ->
      @gl.lineWidth(2)
      @cubeMeshFill.drawInstances(camera, @instances)

      @gl.enable(@gl.BLEND)
      @gl.blendFunc(@gl.SRC_ALPHA, @gl.ONE_MINUS_SRC_ALPHA)
      @edgesMaterial.uniforms.color.a = 1 - @wireframe
      @cubeWireframeMesh.drawInstances(camera, @instances)
      @gl.disable(@gl.BLEND)
