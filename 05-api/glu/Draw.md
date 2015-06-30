    # Context.draw

## BGFX

No VAO.

Seems like there can be only one VertexBuffer, one IndexBuffer and one InstancedDataBuffer at the same time. That simplifies things as you have drawArrays, drawElements + Instanced depending on what's currently set.

Instancing Example
https://github.com/bkaradzic/bgfx/blob/master/examples/05-instancing/instancing.cpp

```c++
//interesting layout is part of VBO
bgfx::VertexBufferHandle vbh = bgfx::createVertexBuffer(mem, PosColorVertex::ms_decl);

bgfx::setProgram(program);

// Set vertex and index buffer.
bgfx::setVertexBuffer(vbh);
bgfx::setIndexBuffer(ibh);

// Set instance data buffer.
bgfx::setInstanceDataBuffer(idb);

// Set render states.
bgfx::setState(BGFX_STATE_DEFAULT);

// Submit primitive for rendering to view 0.
bgfx::submit(0);
```

The submit AKA draw doesn't take any offsets as they part of VBO, IBO setters.

```c++
void setVertexBuffer(
    const TransientVertexBuffer* _tvb,
    uint32_t _startVertex,
    uint32_t _numVertices
)

void setIndexBuffer(
    const TransientIndexBuffer* _tib,
    uint32_t _firstIndex,
    uint32_t _numIndices
)
```

This also unifies the api. I find jumping position of `count` parameter very confusing (i know that this is how OpenGL is)

```javascript
Context.prototype.drawElements = function(mode, count, offset)
Context.prototype.drawArrays = function(mode, first, count)
```

## Cesium

Cesium does what we had done so far: checking if VertexArray has indexBuffer

https://github.com/AnalyticalGraphicsInc/cesium/blob/969cdc35c2d81dfe7a6c1ae12be1c005e7a30def/Source/Renderer/Context.js#L1840
```javascript
va._bind();
var indexBuffer = va.indexBuffer;

if (defined(indexBuffer)) {
    offset = offset * indexBuffer.bytesPerIndex; // offset in vertices to offset in bytes
    count = defaultValue(count, indexBuffer.numberOfIndices);
    context._gl.drawElements(primitiveType, count, indexBuffer.indexDatatype, offset);
} else {
    count = defaultValue(count, va.numberOfVertices);
    context._gl.drawArrays(primitiveType, offset, count);
}
```

## Turbulenz

No VAO.

https://github.com/turbulenz/turbulenz_engine/blob/74deeb1f1f8d609f6ccf8e1673cc440482fb95b9/tslib/webgl/graphicsdevice.ts

Has index or not draw with unified api

```javascript
setStream(vertexBuffer: VertexBuffer,
              semantics: Semantics,
              offset?: number)
setIndexBuffer(indexBuffer: IndexBuffer)
drawIndexed(primitive: number, numIndices: number, first?: number)
draw(primitive: number, numVertices: number, first?: number)
```

[Drawing](https://github.com/turbulenz/turbulenz_engine/blob/74deeb1f1f8d609f6ccf8e1673cc440482fb95b9/tslib/drawprimitives.ts#L257)
```javascript
gd.setTechnique(technique);
gd.setTechniqueParameters(techniqueParameters);
gd.setStream(vertexBuffer, semantics);
gd.draw(primitive, numVertices);
```

setStream causes attributes to be [bound](https://github.com/turbulenz/turbulenz_engine/blob/74deeb1f1f8d609f6ccf8e1673cc440482fb95b9/tslib/webgl/graphicsdevice.ts#L5986) for that buffer
```javascript
//in GraphicsDevice / Context
this.attributeMask |=
            (<WebGLVertexBuffer>vertexBuffer).bindAttributes(numAttributes,
                                                             attributes,
                                                             offset);
//in VertexBuffer
bindAttributes(numAttributes, attributes, offset) {
    for (var n = 0; n < numAttributes; n += 1) {
        ....
    }

    //returns mask of enabled attributes
}

//the attributes are enabled back in Context per pass
mask = (pass.semanticsMask & attributeMask);
/* tslint:enable:no-bitwise */
if (mask !== this.clientStateMask)
{
    this.enableClientState(mask);
}
```

[Drawing Indexed](https://github.com/turbulenz/turbulenz_engine/blob/74deeb1f1f8d609f6ccf8e1673cc440482fb95b9/tslib/fontmanager.ts#L535)
```javascript
sharedVertexBuffer.setData(vertices, 0, numVertices);
gd.setStream(sharedVertexBuffer, fm.semantics);
gd.setIndexBuffer(sharedIndexBuffer);
gd.drawIndexed(fm.primitive, numIndices, 0);
```

[Updating buffer](https://github.com/turbulenz/turbulenz_engine/blob/74deeb1f1f8d609f6ccf8e1673cc440482fb95b9/tslib/webgl/graphicsdevice.ts#L3367)

```javascript
gd.bindVertexBuffer(this.glBuffer);
gl.bufferSubData(gl.ARRAY_BUFFER, (offset * strideInBytes), bufferData);
//no unbind
```

Interesting mapped buffer writer iterator

```javascript
var writer = vertexBuffer.map(offset, count);
if (writer)
{
    for (var n = 0; n < count; n += 1)
    {
        // This VertexBuffer has 3 attributes
        writer(0, 1, 2, // first attribute has 3 components
               0, 1, 2, // second attribute has also 3 components
               0, 1);   // third attribute has only 2
    }

    vertexBuffer.unmap(writer);
}
```

## GLTF

Also has one buffer per VertexMesh
