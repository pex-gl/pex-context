define (require) ->
  { Texture2D, Context } = require('pex/gl')
  BFSOctreeIterator = require('BFSOctreeIterator')

  class OctreeTextureEncoder
    @encodeOctreeTexture: (octree, w, h) ->
      w = w || 512
      h = h || 512

      gl = Context.currentContext.gl

      it = new BFSOctreeIterator(octree)
      i = 0
      cells = []
      while(cell = it.next())
        if (cell.children.length > 0)
          cell.index = i++
          cells.push(cell)

      data = new Int8Array(w * h * 4)

      cellsInRow = w / 8
      r = 0
      g = 0
      b = 0
      a = 0

      for cell in cells
        byteOffset = cell.index * 8 * 4
        for child, i in cell.children
          childIndexLinkByteOffset = byteOffset + i * 4
          if child.children.length > 0
            r = (child.index >> 16) & 0xFF
            g = (child.index >> 8) & 0xFF
            b = (child.index >> 0) & 0xFF
            a = 127
          else if child.points.length > 0
            r = child.points[0].color.r * 255
            g = child.points[0].color.g * 255
            b = child.points[0].color.b * 255
            a = 255
          else
            r = 0
            g = 0
            b = 0
            a = 0
          data[childIndexLinkByteOffset + 0] = r
          data[childIndexLinkByteOffset + 1] = g
          data[childIndexLinkByteOffset + 2] = b
          data[childIndexLinkByteOffset + 3] = a

      octreeTexture = Texture2D.create(w, h)
      octreeTexture.bind()

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)

      return octreeTexture
