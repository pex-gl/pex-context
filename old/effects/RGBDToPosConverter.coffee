define (require) ->
  RGBDToPosGLSL = require('lib/text!effects/RGBDToPos.glsl')
  RGBDUtilsGLSL = require('lib/text!materials/RGBDUtils.inc.glsl')
  RenderTarget = require('effects/RenderTarget')
  { Texture2D, ScreenImage, Context, Program } = require('pex/gl')
  { Platform } = require('pex/sys')
  { Vec2, Vec4 } = require('pex/geom')

  class RGBDToPosCoverter
    debugMode: false
    constructor: (@app, @source, @boundingBox) ->
      gl = @gl = Context.currentContext.gl

      @rgbdToPosProgram = new Program(RGBDUtilsGLSL + '\n' + RGBDToPosGLSL)

      #@particlePositions = Texture2D.create(@source.texture.width, @source.texture.height, { bpp : 32 });
      #@particlePositions = Texture2D.create(@source.textureSize.x, @source.textureSize.y, { bpp : 32 });
      @particlePositions = Texture2D.create(@source.textureSize.x, @source.textureSize.y, { bpp : 32 });

      data = new Float32Array(@source.textureSize.x* @source.textureSize.y*4)
      for i in [0..@particlePositions.width*@particlePositions.height*4-1]
        data[i] = 0

      internalFormat = if Platform.isPlask then 0x8814 else @gl.RGBA
      if Platform.isBrowser
        floatTexExt = @gl.getExtension('OES_texture_float')

      @particlePositions.bind()
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, @particlePositions.width, @particlePositions.height, 0, gl.RGBA, gl.FLOAT, data);

      @renderTarget = new RenderTarget(@particlePositions.width, @particlePositions.height)
      @fullScreenRect = new ScreenImage(@source.texture, 0, 0, @particlePositions.width, @particlePositions.height, @particlePositions.width, @particlePositions.height)
      @previewImage = new ScreenImage(@particlePositions, @app.width - 10 - @particlePositions.width/4, 10, @particlePositions.width/4, @particlePositions.height/4, @app.width, @app.height)

      @uniforms = uniforms = {
        bboxMin: @source.boundingBox.min
        bboxMax: @source.boundingBox.max
        texture: @source.texture
        textureSize: @source.textureSize
        inputPositionRect: new Vec4(0, 0, source.depthRect.width, source.depthRect.height)
        depthRect: new Vec4(source.depthRect.x, source.depthRect.y, source.depthRect.width, source.depthRect.height)
        colorRect: new Vec4(source.colorRect.x, source.colorRect.y, source.colorRect.width, source.colorRect.height)
      }

    updateUniforms: () ->

      if @source.channels
        for channel, i in @source.channels
          @uniforms['channelMatrix['+i+']'] = channel.matrix
          @uniforms['channelOffset['+i+']'] = channel.offset
          @uniforms['channelDepthRange['+i+']'] = new Vec2(channel.depthRange.min, channel.depthRange.max)
          @uniforms['channelEnabled['+i+']'] = channel.enabled
          @uniforms['channelColor['+i+']'] = channel.color
          @uniforms['channelFov['+i+']'] = channel.fov
      else
        @uniforms['channelMatrix[0]'] = (new Mat4()).identity()
        @uniforms['channelOffset[0]'] = new Vec2(0, 0)
        @uniforms['channelDepthRange[0]'] = new Vec2(source.depthRange.min, source.depthRange.max)
        @uniforms['channelEnabled[0]'] = true
        @uniforms['channelFov[0]'] = source.fov

      for unifornName, uniformValue  of @uniforms
        @fullScreenRect.mesh.material.uniforms[unifornName] = uniformValue

    draw: () ->
      @gl.viewport(0, 0, @particlePositions.width, @particlePositions.height)

      @updateUniforms()

      @renderTarget.bind(@particlePositions)
      @gl.disable(@gl.DEPTH_TEST)
      @gl.clearColor(0, 0, 0, 1)
      @gl.clear(@gl.COLOR_BUFFER_BIT)
      @fullScreenRect.draw(@source.texture, @rgbdToPosProgram)
      @renderTarget.unbind()

      @gl.viewport(0, 0, @app.width, @app.height)

      @particlePositions.bind()
      if @debugMode then @previewImage.draw()
