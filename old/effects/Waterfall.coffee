define (require) ->
  GPUParticlePositionUpdateGLSL = require('lib/text!effects/GPUParticlePositionUpdate.glsl')
  GPUParticleVelocityUpdateGLSL = require('lib/text!effects/GPUParticleVelocityUpdate.glsl')
  GPUParticleRender = require('effects/GPUParticleRender')
  RenderTarget = require('effects/RenderTarget')
  { Texture2D, ScreenImage, Context, Mesh, Program } = require('pex/gl')
  { Vec2, Vec3, Geometry, BoundingBox } = require('pex/geom')
  { Platform } = require('pex/sys')
  { MathUtils, Time } = require('pex/utils')
  { Color } = require('pex/color')
  { floor, random, sin, cos } = Math

  class Waterfall
    particleSpeed: 300,
    gravitySpeed: -981
    debugMode: false
    pointSize: 3
    amount: 1
    constructor:  (@app, @source, @boundingBox, @rgbdTexture) ->
      gl = @gl = Context.currentContext.gl

      w = 256
      h = 256
      @particlePositions = Texture2D.create(w, h, { bpp : 32 });
      @particlePositions2 = Texture2D.create(w, h, { bpp : 32 });
      @particleVelocities = Texture2D.create(w, h, { bpp : 32 });
      @particleVelocities2 = Texture2D.create(w, h, { bpp : 32 });

      data = new Float32Array(w*h*4)
      for i in [0..w*h*4-1]
        data[i] = 0

      internalFormat = if Platform.isPlask then 0x8814 else @gl.RGBA
      if Platform.isBrowser
        floatTexExt = @gl.getExtension('OES_texture_float')

      @particlePositions.bind()
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      #gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, gl.FLOAT, data);

      @particlePositions2.bind()
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      #gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, gl.FLOAT, data);

      @particleVelocities.bind()
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, gl.FLOAT, data);

      @particleVelocities2.bind()
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, gl.FLOAT, data);

      @particlePositionsPreview = new ScreenImage(@particlePositions, @app.width-w/2-10, 10, w/2, h/2, @app.width, @app.height)
      @particleVelocitiesPreview = new ScreenImage(@particleVelocities, @app.width-w/2-10, 20 + h/2, h/2, h/2, @app.width, @app.height)

      positionData = new Float32Array(w*h*4)
      for i in [0..w*h*4-1] by 4
        point = MathUtils.randomVec3InBoundingBox(@boundingBox)
        positionData[i+0] = point.x
        positionData[i+1] = point.y
        positionData[i+2] = point.z
        positionData[i+3] = 0

      @particlePositions.bind()
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, gl.FLOAT, positionData);

      velocityData = new Float32Array(w*h*4)
      for i in [0..w*h*4-1] by 4
        velocityData[i+0] = @particleSpeed * (random() - 0.5)
        velocityData[i+1] = 0
        velocityData[i+2] = @particleSpeed * (random() - 0.5)
        velocityData[i+3] = 0

      @particleVelocities.bind()
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, gl.FLOAT, velocityData);

      particleGeometry = new Geometry({vertices:true, texCoords:true, faces:false})
      vertices = particleGeometry.vertices
      texCoords = particleGeometry.texCoords
      for i in [0..w*h-1]
        vertices.push(MathUtils.randomVec3().scale(5))
        texCoords.push(new Vec2(
          (i % w) / (w - 1),
          floor((i / w)) / (h - 1)
        ))
      @gpuParticleRender = new GPUParticleRender({color:Color.Red, pointSize:@pointSize, lightRadius:3.5})
      @particleMesh = new Mesh(particleGeometry, @gpuParticleRender, { primitiveType: @gl.POINTS })

      @gpuParticlePositionUpdateProgram = new Program(GPUParticlePositionUpdateGLSL)
      @gpuParticleVelocityUpdateProgram = new Program(GPUParticleVelocityUpdateGLSL)
      @updateRenderTarget = new RenderTarget(w, h)
      @updateScreenImage = new ScreenImage(@particlePositions, 0, 0, w, h, w, h)

    draw: (camera)->
      @gl.viewport(0, 0, @particlePositions.width, @particlePositions.height)
      @gl.disable(@gl.DEPTH_TEST)
      @gl.disable(@gl.CULL_FACE)
      @gl.disable(@gl.BLEND)

      @updateScreenImage.mesh.material.uniforms.particlePositions = @particlePositions
      @updateScreenImage.mesh.material.uniforms.particleVelocities = @particleVelocities
      @updateScreenImage.mesh.material.uniforms.gravity = @gravitySpeed
      @updateScreenImage.mesh.material.uniforms.deltaTime = Time.delta
      @updateScreenImage.mesh.material.uniforms.bboxMin = @boundingBox.min
      @updateScreenImage.mesh.material.uniforms.bboxMax = @boundingBox.max
      @updateScreenImage.mesh.material.uniforms.amount = @amount
      @updateScreenImage.mesh.material.uniforms.rgbd = @rgbdTexture
      if !@updateScreenImage.mesh.material.uniforms.restartPoint
        @updateScreenImage.mesh.material.uniforms.restartPoint = new Vec3()
      @updateScreenImage.mesh.material.uniforms.restartPoint.x = sin(0.5*Time.seconds)
      @updateScreenImage.mesh.material.uniforms.restartPoint.z = cos(1.5*Time.seconds)

      @updateRenderTarget.bind(@particlePositions2)
      @updateScreenImage.draw(null, @gpuParticlePositionUpdateProgram)
      @updateRenderTarget.unbind()

      @updateRenderTarget.bind(@particleVelocities2)
      @updateScreenImage.draw(null, @gpuParticleVelocityUpdateProgram)
      @updateRenderTarget.unbind()

      @gl.viewport(0, 0, @app.width, @app.height)

      @gl.enable(@gl.DEPTH_TEST)
      @gl.enable(@gl.CULL_FACE)

      [@particlePositions, @particlePositions2] = [@particlePositions2, @particlePositions]
      [@particleVelocities, @particleVelocities2] = [@particleVelocities2, @particleVelocities]

      @gpuParticleRender.uniforms.lightPos.x = 0.5 * sin(Time.seconds)
      @gpuParticleRender.uniforms.lightPos.y = 0.15 * cos(Time.seconds)
      @gpuParticleRender.uniforms.lightPos.z = 0.5 * sin(Time.seconds) * cos(0.5*Time.seconds)
      @gpuParticleRender.uniforms.camPos = camera.getPosition()
      @gpuParticleRender.uniforms.particlePositions = @particlePositions
      @gpuParticleRender.uniforms.particleVelocities = @particleVelocities
      @gpuParticleRender.uniforms.bboxMin = @boundingBox.min
      @gpuParticleRender.uniforms.bboxMax = @boundingBox.max
      @gpuParticleRender.uniforms.rgbd = @source.texture
      @gpuParticleRender.uniforms.debugMode = @debugMode
      @gpuParticleRender.uniforms.pointSize = @pointSize
      @gpuParticleRender.uniforms.opacity = @amount

      @gl.enable(@gl.BLEND)
      #@gl.blendFunc(@gl.SRC_ALPHA, @gl.ONE_MINUS_SRC_ALPHA)
      #@gl.blendFunc(@gl.ONE, @gl.ONE)
      @gl.disable(@gl.BLEND)
      @gl.enable(@gl.DEPTH_TEST)
      #@gl.blendFunc(@gl.SRC_COLOR, @gl.ONE_MINUS_SRC_ALPHA)
      @particleMesh.draw(camera)
      @gl.disable(@gl.BLEND)
      #@gl.disable(@gl.BLEND)

      if @debugMode then @particlePositionsPreview.draw()
      if @debugMode then @particleVelocitiesPreview.draw()