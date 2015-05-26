pex = pex || require('./lib/pex')

{ Platform } = pex.sys
{ Mesh } = pex.gl
{ PerspectiveCamera, Arcball } = pex.scene
{ GUI } = pex.gui
{ Vec2, Vec3, Vec4, Mat4, Rect, Geometry, Edge, BoundingBox, Octree } = pex.geom
{ Cube } = pex.geom.gen
{ SolidColor, Test, ShowColors } = pex.materials
{ Color } = pex.color
{ min, max, floor, sin, cos, random } = Math
{ IO } = pex.sys
{ Texture2D, ScreenImage, Program } = pex.gl
{ Time, MathUtils } = pex.utils

pex.require ['lib/text!./GPUParticlePositionUpdate.glsl', 'lib/text!./GPUParticleVelocityUpdate.glsl', 'GPUParticleRender', 'RenderTarget'], (GPUParticlePositionUpdateGLSL, GPUParticleVelocityUpdateGLSL, GPUParticleRender, RenderTarget) ->
  pex.sys.Window.create
    settings:
      fullscreen: Platform.isBrowser
    init: () ->
      @camera = new PerspectiveCamera(60, @width/@height, 0.3, 30)
      @arcball = new Arcball(this, @camera, 6)
      @arcball.target = new Vec3(0, 1, 0)
      @arcball.updateCamera()

      gl = @gl
      Time.verbose = true
   
      @on 'keyDown', (e) =>
        switch e.str
          when ' ' then console.log()

      w = 256*2
      h = 256*2
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
        console.log('OES_texture_float', floatTexExt)

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

      @particlePositionsPreview = new ScreenImage(@particlePositions, 0, 0, w/2, h/2, @width, @height)
      @particleVelocitiesPreview = new ScreenImage(@particleVelocities, 0, h/2, h/2, h/2, @width, @height)

      positionData = new Float32Array(w*h*4)
      for i in [0..w*h*4-1] by 4
        positionData[i+0] = 0.1 * random()
        positionData[i+1] = 0.8 + random()
        positionData[i+2] = 0.1 * random()

      @particlePositions.bind()
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, gl.FLOAT, positionData);

      velocityData = new Float32Array(w*h*4)
      for i in [0..w*h*4-1] by 4
        velocityData[i+0] = 0.05 * (random() - 0.5)
        velocityData[i+1] = 0
        velocityData[i+2] = 0.05 * (random() - 0.5)

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
      @gpuParticleRender = new GPUParticleRender({color:Color.Red, pointSize:3, lightRadius:3.5})
      @particleMesh = new Mesh(particleGeometry, @gpuParticleRender, { primitiveType: @gl.POINTS })

      @gpuParticlePositionUpdateProgram = new Program(GPUParticlePositionUpdateGLSL)
      @gpuParticleVelocityUpdateProgram = new Program(GPUParticleVelocityUpdateGLSL)
      @updateRenderTarget = new RenderTarget(w, h)
      @updateScreenImage = new ScreenImage(@particlePositions, 0, 0, w, h, w, h)

    draw: ()->
      @gl.clearColor(0.0, 0.0, 0.0, 1.0)
      @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)

      @gl.viewport(0, 0, @particlePositions.width, @particlePositions.height)
      @gl.disable(@gl.DEPTH_TEST)
      @gl.disable(@gl.CULL_FACE)

      @updateScreenImage.mesh.material.uniforms.particlePositions = @particlePositions
      @updateScreenImage.mesh.material.uniforms.particleVelocities = @particleVelocities
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

      @gl.viewport(0, 0, @width, @height)

      @gl.enable(@gl.DEPTH_TEST)
      @gl.enable(@gl.CULL_FACE)

      [@particlePositions, @particlePositions2] = [@particlePositions2, @particlePositions]
      [@particleVelocities, @particleVelocities2] = [@particleVelocities2, @particleVelocities]

      @gpuParticleRender.uniforms.lightPos.x = 0.5 * sin(Time.seconds)
      @gpuParticleRender.uniforms.lightPos.y = 0.15 * cos(Time.seconds)
      @gpuParticleRender.uniforms.lightPos.z = 0.5 * sin(Time.seconds) * cos(0.5*Time.seconds)
      @gpuParticleRender.uniforms.camPos = @camera.getPosition()
      @gpuParticleRender.uniforms.particlePositions = @particlePositions
      @gpuParticleRender.uniforms.particleVelocities = @particleVelocities

      @particleMesh.draw(@camera)

      @particleMesh.rotation.setAxisAngle(new Vec3(0, 1, 0), Time.seconds * 10)

      @particlePositionsPreview.draw()
      @particleVelocitiesPreview.draw()
