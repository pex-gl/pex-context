var cube = new Cube();

Geometry = {
  vertices: [[x,y,z]],
  normals:[[x,y,z]],
  faces: [[v0, v1, v2]]
}


GeometryPrimitive like Cube, Sphere, Torus, Plane
Geometry

Mesh = Geometry -> TypedArray -> VBO(TypedArray) -> VAO

Array of Arrays -> Flat TypedArray -> VBO.bufferData
Array -> Flat TypedArray -> VBO.bufferData[3n-th]
Flat TypedArray -> VBO.bufferData


positionNormalTA.set(positions);
positionNormalTA.set(normals, 100);


geometry.vertices[0][0] += 0.1;
//geometry.vertices.dirty = true; //NO NO
mesh.invalidate('vertices');

var geometry = new Geometry(
  vertices: []
});

var vertices = geometry.getAttribute('vertices');
vertices[0][0] += 0.1;
geometry.markDirtyAttribute('vertices')


//mesh update
positionNormalTA = positionNormalVBO.getData();
for(var i=0; i<positions.length; i++) {
  positionNormalTA[i] = positions[i];
}
for(var i=0; i<normals.length; i++) {
  positionNormalTA[i + offset] = normals[i];
}
positionNormalVBO.bufferData()

VAO = collection of VBO

```javascript
var cube = new Geometry({
  vertices: [[0,0,0], [0,1,0]],
  normals: [[0,1,0], [0,1,0]],
  faces: [[0,1,2], [0, 2, 3]]
});


//
verticesTA = new Float32Array(flatten(cube.vertices))
normalsTA = new Float32Array(flatten(cube.normals))
facesTA = new Uint16Array(flatten(cube.faces))

var verticesVBO = ctx.createVBO(ctx.ARRAY_BUFFER, verticesTA, ctx.DYNAMIC_DRAW)
var normalsVBO = ctx.createVBO(ctx.ARRAY_BUFFER, normalsTA, ctx.DYNAMIC_DRAW)
var indicesVBO = ctx.createVBO(ctx.ARRAY_BUFFER, indicesTA, ctx.STATIC_DRAW)

var mesh = new Mesh(cube, {
  vertices: { location: ctx.POSITION, size: 3, buffer: 0 },
  normals: { location: ctx.NORMAL, size: 3, buffer: 0 }
  faces: { location: ctx.INDEX, size: 1, buffer: 1 }
})

var mesh = new Mesh();




var mesh = new Mesh(cube);

var mesh = new Mesh(cube, [
    (0, 'vertices', ctx.POSITION, 3, ctx.FLOAT, 0, 12),
    (0, 'normals', ctx.NORMAL, 3, ctx.FLOAT, 0, 12),
  ],
  indicesVBO
)

var mesh = new Mesh([
    (0, cube.vertices, ctx.POSITION, 3, ctx.FLOAT, 0, 12),
    (0, cube.normals, ctx.NORMAL, 3, ctx.FLOAT, 0, 12),
  ],
  indicesVBO
)

//

var vao = new VAO([
    new VAO.Attribute(verticesVBO, ctx.POSITION, 3, ctx.FLOAT, 0, 12),
    new VAO.Attribute(normalsVBO, ctx.NORMAL, 3, ctx.FLOAT, 0, 12),
  ],
  indicesVBO
)

var cube = createCube();
var fsq = createRect2D();

var vertexVBO = c.createVBO(ctx.ARRAY_BUFFER, new Float32Array(cube.positions), ctx.DYNAMIC_DRAW));
var normalVBO = c.createVBO(ctx.ARRAY_BUFFER, new Float32Array(cube.normals), ctx.DYNAMIC_DRAW));
var indicesVBO = c.createVBO(ctx.ELEMENT_BUFFER, new Uint16Array(cube.faces), ctx.STATIC);

var vao = c.createVAO([
    c.createAttribute(vertexVBO, ctx.POSITION, 3, ctx.FLOAT, 0, 12, 1),
    c.createAttribute(normalVBO, ctx.NORMAL, 3, ctx.FLOAT, 0, 12, 1),
  ],
  c.createVBO(ctx.ELEMENT_BUFFER, new Uint16Array(cube.faces), ctx.STATIC)
)

var vao = c.createVao([
    { buffer: vertexVo, location: ctx.POSITION, size: 3, type: ctx.FLOAT, offset: 0, stride: 12, divisor: 0),
    { buffer: vormalVbo, location: ctx.NORMAL, size: 3, type: ctx.FLOAT, offset: 0, stride: 12, divisor: 0),
    { buffer: vertexVBO, location: ctx.POSITION),
  ],
  indicesVBO
)

var vao = c.createVAO([
    { buffer: vertexVBO, location: ctx.POSITION, size: 3, type: ctx.FLOAT, offset: 0, stride: 12, divisor: 0),
    { buffer: vormalVBO, location: ctx.NORMAL, size: 3, type: ctx.FLOAT, offset: 0, stride: 12, divisor: 0),
    { buffer: vertexVBO, location: ctx.POSITION),
  ],
  indicesVBO
)

var vao = c.createVAO([
    c.createVAOAttribute(vertexVBO, ctx.POSITION),
    c.createVAOAttribute(normalVBO, ctx.NORMAL),
    c.createVAOAttribute(colorVBO, ctx.COLOR, 4)
  ],
  c.createVBO(ctx.ELEMENT_BUFFER, new Uint16Array(cube.faces), ctx.STATIC)
)

var vao = c.createVAO([
    c.createVAOAttribute(vertexVBO, ctx.POSITION),
    c.createVAOAttribute(normalVBO, ctx.NORMAL),
    c.createVAOAttribute(colorVBO, ctx.COLOR, 4)
  ],
  null
)

var pgl = require('pex-gl');
var trzy = require('pex-trzy');
var Context = require('pex-gl').Context;

var glu = require('pex-glu');
var Context = glu.Context;

var Context = require('pex-glu').Context;

var Context = require('pex-glu/Context');

var ctx = Context.get(); //this ugly
var ctx = Context.getCurrent(); //this looks like low level API but it's wrong
var ctx = Window.getCurrent().getContext(); //user level util

var vao = c.createVAO({
  attributes: [
    c.createAttrib(vertexVBO, ctx.POSITION),
    c.createAttrib(normalVBO, ctx.NORMAL),
    c.createAttrib(colorVBO, ctx.COLOR, 4)
  ],
  indices: c.createVBO(ctx.ELEMENT_BUFFER, new Uint16Array(cube.faces), ctx.STATIC),
  primitiveType: c.TRIANGLES
)

ctx.bind(vao);
ctx.draw(ctx.TRIANGLES, 16);


var geometry = { vertices: [], normals: [], faces: [0, 1, 2] };

var geometry = new Geometry({ vertices: [], normals: [], faces: [0, 1, 2]});

geometry.computeNormals();

geometry2 = geometry.subdivide()

geometry2 = geometry.extrude()

var geometry = new Geometry();
geometry.addAttribute('position', []);
geometry.addAttribute('normal', []);
geometry.addIndices([]);

geometry.getAttribute('position');
//geometry.positions// WRONG

```
