pex = pex || require('./lib/pex')

{ Platform } = pex.sys
{ Mesh } = pex.gl
{ PerspectiveCamera, Arcball } = pex.scene
{ GUI } = pex.gui
{ Vec2, Vec3, Vec4, Mat4, Rect, Geometry, Edge, Octree, BoundingBox } = pex.geom
{ Cube, LineBuilder } = pex.geom.gen
{ SolidColor, Test, ShowColors } = pex.materials
{ SkCanvas } = pex.sys.Node.plask
{ Color } = pex.color
{ min, max, random, floor } = Math

rgb2hsl = ( r, g, b ) ->
  h = 0.0
  s = 0.0
  l = 0.0
  cMin = min( r, min( g, b ) )
  cMax = max( r, max( g, b ) )

  l = ( cMax + cMin ) / 2.0
  if cMax > cMin
    cDelta = cMax - cMin
    s = if l < 0.05 then cDelta / ( cMax + cMin ) else cDelta / ( 2.0 - ( cMax + cMin ) )
    #hue
    if r == cMax
      h = ( g - b ) / cDelta
    else if g == cMax
      h = 2.0 + ( b - r ) / cDelta
    else
      h = 4.0 + ( r - g ) / cDelta

    if h < 0.0
      h += 6.0;
    h = h / 6.0;
  new Vec3( h, s, l )

pex.require [], () ->
  pex.sys.Window.create
    init: () ->
      canvas = SkCanvas.createFromImage('assets/save.00411.png')

      cube = new Cube(1)
      #cube.computeEdges()
      #@cube = new Mesh(cube, new SolidColor(), {useEdges:true})
      @cube = new Mesh(cube, new SolidColor())

      @pointsGeometry = new Geometry({vertices:true, colors: true, edges:true})
      vertices = @pointsGeometry.vertices
      colors = @pointsGeometry.colors
      edges = @pointsGeometry.edges

      minDepth = 500
      maxDepth = 2000
      fov = 1270.34

      xyd2xyz = (x, y, d) ->
        v = new Vec3(
          (x - 320) * d / fov
          -(y - 240) * d / fov
          -d + 1000
        )
        v

      hsl2depth = (hsl) ->
        depth = hsl.x
        depth * ( maxDepth - minDepth ) + minDepth

      for x in [0..canvas.width-1] by 2
        for y in [0..canvas.height/2-1] by 2
          di = 4 * (x + (y + canvas.height/2) * canvas.width)
          ci = 4 * (x + y * canvas.width)
          hsl = rgb2hsl(canvas[di+2]/255, canvas[di+1]/255, canvas[di+0]/255)
          depth = hsl2depth(hsl)
          v = xyd2xyz(x, y, depth)
          if hsl.y > 0.005
            v.color = new Color(canvas[ci+2]/255, canvas[ci+1]/255, canvas[ci+0]/255, 1)
            vertices.push(v)
            colors.push(v.color)
            #colors.push(new Color(hsl.x, 0*hsl.y, hsl.z, 1))

      @mesh = new Mesh(@pointsGeometry, new ShowColors({pointSize:2}), { primitiveType: @gl.POINTS})

      bbox = BoundingBox.fromPoints(vertices)
      bboxSize = bbox.getSize()
      maxDist = Math.max(bboxSize.x, bboxSize.y, bboxSize.z);
      @camera = new PerspectiveCamera(60, @width/@height, maxDist/10, 2 * maxDist)
      @arcball = new Arcball(this, @camera, bbox.max.z + maxDist/5)

      #Octree.MaxLevel = 10

      octreeSize = new Vec3(maxDist, maxDist, maxDist)
      octree = new Octree(bbox.getCenter().clone().sub(octreeSize.dup().scale(0.5)), octreeSize)
      octree.add(v) for v in vertices

      lineBuilder = new LineBuilder();
      @drawCell(octree.root, lineBuilder)
      @octreeMesh = new Mesh(lineBuilder, new SolidColor({color: new Color(0.0, 0.0, 0.3, 1)}), { useEdges: true })

      @cubes = []
      for cell in @getAllCellsAtLevel(octree.root, 6)
        avgColor = new Color(0, 0, 0, 1)
        for p in cell.points
          avgColor.r += p.color.r
          avgColor.g += p.color.g
          avgColor.b += p.color.b
        avgColor.r /= cell.points.length
        avgColor.g /= cell.points.length
        avgColor.b /= cell.points.length
        cubeInstance = {
          position: cell.position.add(cell.size.clone().scale(0.5))
          scale: cell.size.x
          #color: new Color(Math.random(), Math.random(), Math.random(), 1.0)
          color: avgColor
        }
        @cubes.push(cubeInstance)

      for i in [0..Octree.MaxLevel]
      	console.log("Octree level " + i, @getAllCellsAtLevel(octree.root, i).length)

    drawCell: (cell, lineBuilder) ->
      x = cell.position.x;
      y = cell.position.y;
      z = cell.position.z;
      w = cell.size.x;
      h = cell.size.y;
      d = cell.size.z;

      lineBuilder.addLine(new Vec3(x, y, z), new Vec3(x + w, y, z));
      lineBuilder.addLine(new Vec3(x + w, y, z), new Vec3(x + w, y, z + d));
      lineBuilder.addLine(new Vec3(x + w, y, z + d), new Vec3(x, y, z + d));
      lineBuilder.addLine(new Vec3(x, y, z + d), new Vec3(x, y, z));

      lineBuilder.addLine(new Vec3(x, y, z), new Vec3(x, y + w, z));
      lineBuilder.addLine(new Vec3(x + w, y, z), new Vec3(x + w, y + w, z));
      lineBuilder.addLine(new Vec3(x + w, y, z + d), new Vec3(x + w, y + w, z + d));
      lineBuilder.addLine(new Vec3(x, y, z + d), new Vec3(x, y + w, z + d));

      lineBuilder.addLine(new Vec3(x, y + w, z), new Vec3(x + w, y + w, z));
      lineBuilder.addLine(new Vec3(x + w, y + w, z), new Vec3(x + w, y + w, z + d));
      lineBuilder.addLine(new Vec3(x + w, y + w, z + d), new Vec3(x, y + w, z + d));
      lineBuilder.addLine(new Vec3(x, y + w, z + d), new Vec3(x, y + w, z));

      @drawCell(child, lineBuilder) for child in cell.children

    getAllCellsAtLevel: (cell, level, result) ->
      result = result || [];
      if cell.level == level
        if cell.points.length > 0
          result.push(cell)
        return result
      else
        for child in cell.children
          @getAllCellsAtLevel(child, level, result)
        return result

    draw: () ->
      @gl.clearColor(0, 0, 0, 1)
      @gl.enable(@gl.DEPTH_TEST)
      @gl.lineWidth(2)
      @gl.clear(@gl.COLOR_BUFFER_BIT | @gl.DEPTH_BUFFER_BIT)
      @mesh.draw(@camera)

      for cubeInstance in @cubes
        @cube.position = cubeInstance.position
        @cube.scale.x = @cube.scale.y = @cube.scale.z = cubeInstance.scale
        @cube.material.uniforms.color = cubeInstance.color
        @cube.draw(@camera)

      @gl.enable(@gl.BLEND)
      @gl.blendFunc(@gl.SRC_ALPHA, @gl.ONE)
      #@octreeMesh.draw(@camera)
      @gl.disable(@gl.BLEND)
      #@cube.draw(@camera)

