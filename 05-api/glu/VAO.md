# Vertex layout and attributes

## Cinder VBO Layouts

https://github.com/cinder/Cinder/blob/glNext/samples/_opengl/ParticleSphereCPU/src/ParticleSphereCPUApp.cpp#L83

```c++
gl::Vbo mParticleVbo = gl::Vbo::create( GL_ARRAY_BUFFER, mParticles, GL_STREAM_DRAW );

geom::BufferLayout particleLayout;
particleLayout.append( geom::Attrib::POSITION, 3, sizeof( Particle ), offsetof( Particle, pos ) );
particleLayout.append( geom::Attrib::COLOR, 4, sizeof( Particle ), offsetof( Particle, color ) );

auto mesh = gl::VboMesh::create( mParticles.size(), GL_POINTS, { { particleLayout, mParticleVbo } } );

//So in a way:
//VboMesh::create({ layout1, layout2 })
//VboMesh::create({ { layout1, buffer1}, {layout2, buffer2} })
```

## Cinder VBO Layouts 2

```c++
auto layoutDynamic = gl::VboMesh::Layout().usage( GL_DYNAMIC_DRAW ).attrib( geom::POSITION, 3 );
auto layoutStatic = gl::VboMesh::Layout().usage( GL_STATIC_DRAW ).attrib( geom::COLOR, 4 ).attrib( geom::TEX_COORD_0, 2 );
std::vector<gl::VboMesh::Layout> bufferLayout = { layoutDynamic, layoutStatic };

auto vboMesh = gl::VboMesh::create( positions.size(), GL_POINTS, bufferLayout );

vboMesh->bufferAttrib( geom::POSITION, positions );
vboMesh->bufferAttrib( geom::COLOR, colors );
vboMesh->bufferAttrib( geom::TEX_COORD_0, texCoords );
```

## Cinder attributes

https://github.com/cinder/Cinder/blob/glNext/include/cinder/GeomIo.h
```
POSITION, COLOR, TEX_COORD_0, TEX_COORD_1, ... NORMAL, TANGENT, BITANGENT,....
```

## BGFX

https://github.com/bkaradzic/bgfx/blob/466c76071ac212b104a2a5e906e9882813b5d455/examples/05-instancing/instancing.cpp#L9

```c++
struct PosColorVertex
{
	float m_x;
	float m_y;
	float m_z;
	uint32_t m_abgr;

	static void init()
	{
		ms_decl
			.begin()
			.add(bgfx::Attrib::Position, 3, bgfx::AttribType::Float)
			.add(bgfx::Attrib::Color0,   4, bgfx::AttribType::Uint8, true)
			.end();
	};

	static bgfx::VertexDecl ms_decl;
};

mem = bgfx::makeRef(s_cubeVertices, sizeof(s_cubeVertices) );
bgfx::VertexBufferHandle vbh = bgfx::createVertexBuffer(mem, PosColorVertex::ms_decl);

...

bgfx::setVertexBuffer(vbh);
bgfx::setIndexBuffer(ibh);
```

## Cesium

https://github.com/AnalyticalGraphicsInc/cesium/blob/68df3e9aa0728f26b363cd64d85e20b91fc5eb2e/Source/Renderer/Context.js#L1155

```javascript
var buffer = context.createVertexBuffer(24, BufferUsage.STATIC_DRAW);
var attributes = [
    {
        vertexBuffer           : buffer,
        componentsPerAttribute : 3,
        componentDatatype      : ComponentDatatype.FLOAT,
        offsetInBytes          : 0,
        strideInBytes          : 24
    },
    {
        vertexBuffer           : buffer,
        componentsPerAttribute : 3,
        componentDatatype      : ComponentDatatype.FLOAT,
        normalize              : true,
        offsetInBytes          : 12,
        strideInBytes          : 24
    }
];
var va = context.createVertexArray(attributes);
```

Cesium is also binding attribute locations [in the shader](https://github.com/AnalyticalGraphicsInc/cesium/blob/68df3e9aa0728f26b363cd64d85e20b91fc5eb2e/Source/Renderer/ShaderProgram.js#L129)
```javascript
gl.bindAttribLocation(program, attributeLocations[attribute], attribute);
```

## Cesium VAO from Geometry

[Geometry](https://github.com/AnalyticalGraphicsInc/cesium/blob/68df3e9aa0728f26b363cd64d85e20b91fc5eb2e/Source/Core/Geometry.js) ([Docs](https://cesiumjs.org/Cesium/Build/Documentation/Geometry.html))
```javascript
var positions = new Float64Array([
  0.0, 0.0, 0.0,
  7500000.0, 0.0, 0.0,
  0.0, 7500000.0, 0.0
]);

var geometry = new Cesium.Geometry({
  attributes : {
    position : new Cesium.GeometryAttribute({
      componentDatatype : Cesium.ComponentDatatype.DOUBLE,
      componentsPerAttribute : 3,
      values : positions
    })
  },
  indices : new Uint16Array([0, 1, 1, 2, 2, 0]),
  primitiveType : Cesium.PrimitiveType.LINES,
  boundingSphere : Cesium.BoundingSphere.fromVertices(positions)
});
```

There are reserved attribute names with well-known semantics:

- **position** - 3D vertex position. 64-bit floating-point (for precision). 3 components per attribute. See VertexFormat#position.
- **normal** - Normal (normalized), commonly used for lighting. 32-bit floating-point. 3 components per attribute. See VertexFormat#normal.
- **st** - 2D texture coordinate. 32-bit floating-point. 2 components per attribute. See VertexFormat#st.
- **binormal** - Binormal (normalized), used for tangent-space effects like bump mapping. 32-bit floating-point. 3 components per attribute. See VertexFormat#binormal.
- **tangent** - Tangent (normalized), used for tangent-space effects like bump mapping. 32-bit floating-point. 3 components per attribute. See VertexFormat#tangent.

[Vertex Formats](https://github.com/AnalyticalGraphicsInc/cesium/blob/68df3e9aa0728f26b363cd64d85e20b91fc5eb2e/Source/Core/VertexFormat.js)

[Geometry Creation](https://github.com/AnalyticalGraphicsInc/cesium/blob/68df3e9aa0728f26b363cd64d85e20b91fc5eb2e/Source/Core/EllipsoidGeometry.js#L66)
```javascript
var ellipsoid = new Cesium.EllipsoidGeometry({
  vertexFormat : Cesium.VertexFormat.POSITION_ONLY,
  radii : new Cesium.Cartesian3(1000000.0, 500000.0, 500000.0)
});
var geometry = Cesium.EllipsoidGeometry.createGeometry(ellipsoid);
```

[Example Primitive](https://github.com/AnalyticalGraphicsInc/cesium/blob/68df3e9aa0728f26b363cd64d85e20b91fc5eb2e/Source/Scene/Primitive.js)
```javascript

scene.primitives.add(new Cesium.Primitive({
geometryInstances : new Cesium.GeometryInstance({
    geometry : Cesium.EllipsoidGeometry.createGeometry(new Cesium.EllipsoidGeometry({
      radii : new Cesium.Cartesian3(500000.0, 500000.0, 1000000.0),
      vertexFormat : Cesium.VertexFormat.POSITION_AND_NORMAL
    })),
    modelMatrix : Cesium.Matrix4.multiplyByTranslation(Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(-95.59777, 40.03883)), new Cesium.Cartesian3(0.0, 0.0, 500000.0), new Cesium.Matrix4()),
    id : 'ellipsoid',
    attributes : {
      color : Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.AQUA)
    }
}),
appearance : new Cesium.PerInstanceColorAppearance()
```

## ThreeJS BufferGeometry

https://github.com/mrdoob/three.js/blob/5c7e0df9b100ba40cdcaaf530196290e16c34858/examples/webgl_buffergeometry_drawcalls.html#L128

```javascript
particles = new THREE.BufferGeometry();
particlePositions = new Float32Array( maxParticleCount * 3 );
particles.addAttribute( 'position', new THREE.DynamicBufferAttribute( particlePositions, 3 ) );
particles.drawcalls.push( {
	start: 0,
	count: particleCount,
	index: 0
} );
```

THREE.js creates and updates buffers [on the fly](https://github.com/mrdoob/three.js/blob/5c7e0df9b100ba40cdcaaf530196290e16c34858/src/renderers/WebGLRenderer.js#L3913)

```javascript
if ( attribute.buffer === undefined ) {
	attribute.buffer = _gl.createBuffer();
	_gl.bindBuffer( bufferType, attribute.buffer );
	_gl.bufferData( bufferType, attribute.array, ( attribute instanceof THREE.DynamicBufferAttribute ) ? _gl.DYNAMIC_DRAW : _gl.STATIC_DRAW );
	attribute.needsUpdate = false;
}
```
