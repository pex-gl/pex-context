define (require) ->
  { Geometry, Vec2, Vec3, Vec4, Mat4 } = require('pex/geom')
  { Context, Mesh, Texture2D } = require('pex/gl')
  RGBDTExtured = require('materials/RGBDTextured')
  { Cube } = require('pex/geom/gen')

  class RGBDMesh extends Mesh
    constructor: (source, step) ->
      @geom = new Geometry({vertices:true, faces:false})
      vertices = @geom.vertices
      @source = source

      w = source.depthRect.width - 1
      h = source.depthRect.height - 1
      step = step || 1
      numChannels = if source.channels then source.channels.length else 1

      for x in [0..w-1] by step
        for y in [0..h-1] by step
          for z in [0..numChannels-1]
            v = new Vec3(x, y, z)
            vertices.push(v)

      uniforms = {
        rotation: new Mat4()
        pointSize: 6
        bboxMin: source.boundingBox.min
        bboxMax: source.boundingBox.max
        texture: source.texture
        textureSize: source.textureSize
        particleTexture: Texture2D.load('assets/images/particleGlow.png')
        inputPositionRect: new Vec4(0, 0, w, h)
        depthRect: new Vec4(source.depthRect.x, source.depthRect.y, source.depthRect.width, source.depthRect.height)
        colorRect: new Vec4(source.colorRect.x, source.colorRect.y, source.colorRect.width, source.colorRect.height)
      }

      super(@geom, new RGBDTExtured(uniforms), { primitiveType: Context.currentContext.gl })
      @updateChannels()

    updateChannels: () ->
      @material.uniforms.texture = @source.texture
      @material.uniforms.groundLevel = @source.groundLevel
      if @source.channels
        for channel, i in @source.channels
          @material.uniforms['channelMatrix['+i+']'] = channel.matrix
          @material.uniforms['channelOffset['+i+']'] = channel.offset
          @material.uniforms['channelDepthRange['+i+']'] = new Vec2(channel.depthRange.min, channel.depthRange.max)
          @material.uniforms['channelEnabled['+i+']'] = channel.enabled
          @material.uniforms['channelColor['+i+']'] = channel.color
          @material.uniforms['channelFov['+i+']'] = channel.fov
      else
        @material.uniforms['channelMatrix[0]'] = (new Mat4()).identity()
        @material.uniforms['channelOffset[0]'] = new Vec2(0, 0)
        @material.uniforms['channelDepthRange[0]'] = new Vec2(source.depthRange.min, source.depthRange.max)
        @material.uniforms['channelEnabled[0]'] = true
        @material.uniforms['channelFov[0]'] = source.fov

