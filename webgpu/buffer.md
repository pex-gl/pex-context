# webgpu/buffer.js

Buffer management for vertex, index, and uniform data.

## API

### Vertex Buffer
```javascript
const buffer = ctx.vertexBuffer(data);
// or
const buffer = ctx.vertexBuffer({ data: [...] });
```

### Index Buffer
```javascript
const buffer = ctx.indexBuffer(data);
// or
const buffer = ctx.indexBuffer({ data: [...] });
```

### Uniform Buffer
```javascript
const buffer = ctx.uniformBuffer({ size: 64 });
```

## Properties

| Property | Description |
|----------|-------------|
| `buffer.gpuBuffer` | GPUBuffer instance |
| `buffer.type` | 'vertex', 'index', or 'uniform' |
| `buffer.byteLength` | Buffer size in bytes |
| `buffer.format` | 'uint16' or 'uint32' (for index buffers) |
| `buffer.count` | Number of indices (for index buffers) |

## Data Handling

- Arrays are automatically flattened if nested (e.g., `[[0,1,2], [3,4,5]]` → `[0,1,2,3,4,5]`)
- Vertex data is converted to `Float32Array`
- Index data is converted to `Uint16Array` (or `Uint32Array` for >65535 vertices)
