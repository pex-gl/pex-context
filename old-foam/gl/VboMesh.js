var ObjectUtil = require('../util/ObjectUtil');

var _gl = require('./gl');

var Mesh = require('./Mesh'),
	Vbo  = require('./Vbo');
var Program = require('./Program');

var Vec3 = require('../math/Vec3'),
	Vec2 = require('../math/Vec2');

function VboMesh(usage,format,size){
	var obj = this._obj = new Mesh(format || new VboMesh.Format(),size);//prevent super.prototype.call, slow...

	var gl = this._gl = obj._gl;
	this._glDraw  	  = obj._glDraw;
	this._glTrans 	  = obj._glTrans;

	this._usage = ObjectUtil.isUndefined(usage) ? gl.TRIANGLES : usage;

	this._vbo = new Vbo(gl.ARRAY_BUFFER);
	this._ibo = null;

	this._vboUsage = this.getFormat().vboUsage;
	this._iboUsage = this.getFormat().iboUsage;

	this._verticesDirty  = true;
	this._normalsDirty   = true;
	this._colorsDirty    = true;
	this._texcoordsDirty = true;
	this._indicesDirty   = false;

	this._offsetVertices = 0;
	this._offsetColors   = 0;
	this._offsetNormals  = 0;
	this._offsetTexcoords= 0;
}

VboMesh.Format = function(){
	Mesh.Format.apply(this);
	var gl = _gl.get();
	this.vboUsage = gl.DYNAMIC_DRAW;
	this.iboUsage = gl.STATIC_DRAW;
};

VboMesh.Format.prototype = Object.create(Mesh.Format);
VboMesh.Format.prototype.constructor = VboMesh.Format;

/**
 * Sets the meshs draw mode, gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.TRIANGLES
 * @param usage
 * @returns {VboMesh}
 */

VboMesh.prototype.setUsage = function(usage){
	this._usage = usage;
	return this;
};

/**
 * Rebuffers the vertex data.
 * @returns {VboMesh}
 */

VboMesh.prototype.updateVertexBuffer = function(){
	this._verticesDirty = true;
	return this;
};

/**
 * Rebuffers the normal data.
 * @returns {VboMesh}
 */

VboMesh.prototype.updateNormalBuffer = function(){
	this._normalsDirty = true;
	return this;
};

/**
 * Rebuffers the color data.
 * @returns {VboMesh}
 */

VboMesh.prototype.updateColorBuffer = function(){
	this._colorsDirty = true;
	return this;
};

/**
 * Rebuffers the texcoord data.
 * @returns {VboMesh}
 */

VboMesh.prototype.updateTexcoordBuffer = function(){
	this._texcoordsDirty = true;
	return this;
};

/**
 * Rebuffers the index data.
 * @returns {VboMesh}
 */

VboMesh.prototype.updateIndexBuffer = function(){
	this._indicesDirty = true;
	return this;
};

/**
 * Draws the mesh.
 * @param {Number} [length] - Optional vertices or indices length to be drawn.
 * @returns {VboMesh}
 */

VboMesh.prototype.draw = function(length){
	this._glDraw.drawVboMesh(this,length); //friend class glDraw
	return this;
};

VboMesh.prototype._updateVboSize = function(){
	var obj = this._obj,
		len = obj.vertices.byteLength + obj.normals.byteLength + obj.colors.byteLength + obj.texcoords.byteLength,
		vbo = this._vbo;

	if(len <= vbo.getSize()){
		return;
	}

	var gl = this._gl;
	var prevVbo = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
	var vboDiffers = !vbo.equalsGLObject(prevVbo);
	if(vboDiffers){
		vbo.bind();
	}

	vbo.bufferData(len,this._vboUsage);
	this._verticesDirty =
		this._normalsDirty =
			this._colorsDirty =
				this._texcoordsDirty = true;

	if(vboDiffers){
		gl.bindBuffer(gl.ARRAY_BUFFER,prevVbo);
	}
};

VboMesh.prototype._updateIboSize = function(){
	var gl  = this._gl;
	var obj = this._obj,
		len = obj.indices.byteLength,
		ibo = this._ibo = this._ibo || new Vbo(gl.ELEMENT_ARRAY_BUFFER);

	if(len <= ibo.getSize()){
		return;
	}

	var prevIbo = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
	var iboDiffers = !ibo.equalsGLObject(prevIbo);
	if(iboDiffers){
		ibo.bind();
	}

	ibo.bufferData(len,this._iboUsage);
	this._indicesDirty = true;

	if(iboDiffers){
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,prevIbo);
	}
};

/**
 * Appends mesh data to the mesh.
 * @param meshOrVboMesh
 * @returns {VboMesh}
 */

VboMesh.prototype.appendMesh = function(meshOrVboMesh){
	this._obj.appendMesh(meshOrVboMesh._obj || meshOrVboMesh);
	this._updateVboSize();
	this._updateIboSize();
	return this;
};

/**
 * Sets the mesh transformation.
 * @param matrix
 * @returns {VboMesh}
 */

VboMesh.prototype.transform = function(matrix){
	this._obj.transform(matrix);
	return this;
};

/**
 * Resets all transformations.
 * @returns {VboMesh}
 */

VboMesh.prototype.clearTransform = function(){
	this._obj.clearTransform()
	return this;
};

/**
 * Translates the mesh.
 * @param vec
 * @returns {VboMesh}
 */

VboMesh.prototype.translate = function(vec){
	this._obj.translate(vec);
	return this;
};

/**
 * Translates the mesh.
 * @param x
 * @param y
 * @param z
 * @returns {VboMesh}
 */

VboMesh.prototype.translate3f = function(x,y,z){
	this._obj.translate3f(x,y,z);
	return this;
};

/**
 * Scales the mesh.
 * @param vec
 * @returns {VboMesh}
 */

VboMesh.prototype.scale = function(vec){
	this._obj.scale(vec);
	return this;
};

/**
 * Scales the mesh.
 * @param x
 * @param y
 * @param z
 * @returns {VboMesh}
 */

VboMesh.prototype.scale3f = function(x,y,z){
	this._obj.scale3f(x,y,z);
	return this;
};

/**
 * Scales the mesh.
 * @param x
 * @returns {VboMesh}
 */

VboMesh.prototype.scale1f = function(x){
	this._obj.scale1f(x);
	return this;
};

/**
 * Rotates the mesh.
 * @param vec
 * @returns {VboMesh}
 */

VboMesh.prototype.rotate = function(vec){
	this._obj.rotate(vec);
	return this;
};

/**
 * Rotates the mesh.
 * @param x
 * @param y
 * @param z
 * @returns {VboMesh}
 */

VboMesh.prototype.rotate3f = function(x,y,z){
	this._obj.rotate3f(x,y,z);
	return this;
};

/**
 * Rotates the mesh around an axis.
 * @param angle
 * @param vec
 * @returns {VboMesh}
 */

VboMesh.prototype.rotateAxis = function(angle,vec){
	this._obj.rotateAxis(angle,vec);
	return this;
};

/**
 * Rotates the mesh around an axis.
 * @param angle
 * @param x
 * @param y
 * @param z
 * @returns {VboMesh}
 */

VboMesh.prototype.rotateAxis3f = function(angle,x,y,z){
	this._obj.rotateAxis3f(angle,x,y,z);
	return this;
};

/**
 * Reserves data sizes for vertices, normals, colors, normals & indices.
 * @param size
 * @returns {VboMesh}
 */

VboMesh.prototype.reserveSize = function(size){
	var obj = this._obj;
	obj.reserveSize(size);

	this._updateVboSize();
	this._updateIboSize();
	return this;
};

/**
 * Sets the vertex data.
 * @param vertices
 * @returns {VboMesh}
 */

VboMesh.prototype.setVertices = function(vertices){
	this._obj.setVertices(vertices);
	this._updateVboSize();
	return this;
};

/**
 * Appends vertex data.
 * @param {Float32Array} vertices
 * @returns {VboMesh}
 */

VboMesh.prototype.appendVertices = function(vertices){
	this._obj.appendVertices(vertices);
	this._updateVboSize();
	return this;
};

/**
 * Modifies vertex data at index.
 * @param index
 * @param vec
 * @returns {VboMesh}
 */

VboMesh.prototype.setVertex = function(index,vec){
	this._obj.setVertex(index,vec);
	this._verticesDirty = true;
	return this;
};

/**
 * Modifies vertex data at index.
 * @param index
 * @param vec
 * @returns {VboMesh}
 */

VboMesh.prototype.setVertex3 = function(index,vec){
	this._obj.setVertex3(index,vec);
	this._verticesDirty = true;
	return this;
};

/**
 * Modifies vertex data at index.
 * @param index
 * @param x
 * @param y
 * @param z
 * @returns {VboMesh}
 */

VboMesh.prototype.setVertex3f = function(index,x,y,z){
	this._obj.setVertex3f(index,x,y,z);
	this._verticesDirty = true;
	return this;
};

/**
 * Modifies vertex data at index.
 * @param index
 * @param vec
 * @returns {VboMesh}
 */

VboMesh.prototype.setVertex2 = function(index,vec){
	this._obj.setVertex2(index,vec);
	this._verticesDirty = true;
	return this;
};

/**
 * Modifies vertex data at index.
 * @param index
 * @param x
 * @param y
 * @returns {VboMesh}
 */

VboMesh.prototype.setVertex2f = function(index,x,y){
	this._obj.setVertex2f(index,x,y);
	this._verticesDirty = true;
	return this;
};

/**
 * Returns the vertex data length.
 * @returns {number}
 */

VboMesh.prototype.getVerticesLength = function(){
    return this._obj.getVerticesLength();
};

/**
 * Modifies normal data at index.
 * @param normals
 * @returns {VboMesh}
 */

VboMesh.prototype.setNormals = function(normals){
	this._obj.setNormals(normals);
	this._updateVboSize();
	return this;
};

/**
 * Appends normal data.
 * @param {Float32Array} normals
 * @returns {VboMesh}
 */

VboMesh.prototype.appendNormals = function(normals){
	this._obj.appendNormals(normals);
	this._updateVboSize();
	return this;
};

/**
 * Modifies normal data at index.
 * @param index
 * @param normal
 * @returns {VboMesh}
 */

VboMesh.prototype.setNormal = function(index,normal){
	this._obj.setNormal(index,normal);
	this._normalsDirty = true;
	return this;
};

/**
 * Modifies normal data at index.
 * @param index
 * @param x
 * @param y
 * @param z
 * @returns {VboMesh}
 */

VboMesh.prototype.setNormal3f = function(index,x,y,z){
	this._obj.setNormal3f(index,x,y,z);
	this._normalsDirty = true;
	return this;
};

/**
 * Returns the color data length.
 * @returns {number}
 */

VboMesh.prototype.getNormalsLength = function(){
    return this._obj.getNormalsLength();
};

/**
 * Modifies color data at index.
 * @param colors
 * @returns {VboMesh}
 */

VboMesh.prototype.setColors = function(colors){
	this._obj.setColors(colors);
	this._updateVboSize();
	return this;
};

/**
 * Appends color data.
 * @param {Float32Array} colors
 * @returns {VboMesh}
 */

VboMesh.prototype.appendColors = function(colors){
	this._obj.appendColors(colors);
	this._updateVboSize();
	return this;
};

/**
 * Modifies color data at index.
 * @param index
 * @param r
 * @param g
 * @param b
 * @param a
 * @returns {VboMesh}
 */

VboMesh.prototype.setColor4f = function(index,r,g,b,a){
	this._obj.setColor4f(index,r,g,b,a);
	this._colorsDirty = true;
	return this;
};

/**
 * Modifies color data at index.
 * @param index
 * @param r
 * @param g
 * @param b
 * @returns {VboMesh}
 */

VboMesh.prototype.setColor3f = function(index,r,g,b){
	this._obj.setColor3f(index,r,g,b);
	this._colorsDirty = true;
	return this;
};

/**
 * Modifies color data at index.
 * @param index
 * @param k
 * @param a
 * @returns {VboMesh}
 */

VboMesh.prototype.setColor2f = function(index,k,a){
	this._obj.setColor2f(index,k,a);
	this._colorsDirty = true;
	return this;
};

/**
 * Modifies color data at index.
 * @param index
 * @param k
 * @returns {VboMesh}
 */

VboMesh.prototype.setColor1f = function(index,k){
	this._obj.setColor1f(index,k);
	this._colorsDirty = true;
	return this;
};

/**
 * Returns the color data length.
 * @returns {number}
 */

VboMesh.prototype.getColorsLength = function(){
    return this._obj.getColorsLength();
};

/**
 * Modifies texcoord data at index.
 * @param texcoords
 * @returns {VboMesh}
 */

VboMesh.prototype.setTexcoords = function(texcoords){
	this._obj.setTexcoords(texcoords);
	this._updateVboSize();
	return this;
};

/**
 * Appends texcoord data.
 * @param {Float32Array} texcoords
 * @returns {VboMesh}
 */

VboMesh.prototype.appendTexcoords = function(texcoords){
	this._obj.appendTexcoords(texcoords);
	this._updateVboSize();
	return this;
};

/**
 * Returns the texcoord data length.
 * @returns {number}
 */

VboMesh.prototype.getTexcoordsLength = function(){
    return this._obj.getTexcoordsLength();
};

/**
 * Sets indices data.
 * @param indices
 * @returns {VboMesh}
 */

VboMesh.prototype.setIndices = function(indices){
	this._obj.indices = this._obj.getFormat().indexFormat == this._gl.UNSIGNED_INT ?
						ObjectUtil.safeUint32Array(indices) :
						ObjectUtil.safeUint16Array(indices);
	this._updateIboSize();
	return this;
};

/**
 * Appends index data.
 * @param {Uint16Array || Uint32Array} indices
 * @returns {VboMesh}
 */

VboMesh.prototype.appendIndices = function(indices){
	this._obj.appendIndices(indices);
	this._updateIboSize();
	return this;
};

/**
 * Allocates an amount of index data.
 * @param size
 * @returns {VboMesh}
 */

VboMesh.prototype.reserveIndices = function(size){
	this._obj.reserveIndices(size);
	this._updateIboSize();
	return this;
};

/**
 * Returns the index data length.
 * @returns {number}
 */

VboMesh.prototype.getIndicesLength = function(){
    return this._obj.getIndicesLength();
};

/**
 * Clears mesh data.
 * @returns {VboMesh}
 */

VboMesh.prototype.clear = function(){
	this._obj.clear();
	this._verticesDirty = this._colorsDirty = this._normalsDirty = this._texcoordsDirty = this._indicesDirty = true;
	return this;
};

/**
 * Returns a bounding box.
 * @returns {AABB}
 */

VboMesh.prototype.getBoundingBox = function(){
	return this._obj.getBoundingBox();
};

/**
 * Recalculate normals according to vertex data.
 * @returns {VboMesh}
 */

VboMesh.prototype.calculateNormals = function(){
	this._obj.calculateNormals();
	this._normalsDirty = true;
	return this;
};

/**
 * Returns true if any of the mesh data needs to be rebuffered.
 * @returns {boolean|*}
 */

VboMesh.prototype.isDirty = function(){
	return this._verticesDirty || this._normalsDirty || this._colorsDirty || this._texcoordsDirty || this._indicesDirty;
};

/**
 * Returns the mesh format.
 * @returns {Mesh.Format}
 */

VboMesh.prototype.getFormat = function(){
	return this._obj.getFormat();
};

/**
 * Returns true if the mesh has vertex data.
 * @returns {boolean}
 */

VboMesh.prototype.hasVertices = function(){
	return this._obj.hasVertices();
};

/**
 * Returns true if the mesh has color data.
 * @returns {boolean}
 */

VboMesh.prototype.hasColors = function(){
	return this._obj.hasColors();
};

/**
 * Returns true if the mesh has texcoord data.
 * @returns {boolean}
 */

VboMesh.prototype.hasTexcoords = function(){
	return this._obj.hasTexcoords();
};

/**
 * Returns true if the mesh has face index data.
 * @returns {boolean}
 */

VboMesh.prototype.hasIndices = function(){
	return this._obj.hasIndices();
};

/**
 * Returns the mesh vertex data.
 * @returns {Float32Array}
 */

VboMesh.prototype.getVertices = function(){
	return this._obj.vertices;
};

/**
 * Returns the mesh normal data.
 * @returns {Float32Array}
 */

VboMesh.prototype.getNormals = function(){
	return this._obj.normals;
};

/**
 * Returns the mesh color data.
 * @returns {Float32Array}
 */

VboMesh.prototype.getColors = function(){
	return this._obj.colors;
};

/**
 * Returns the mesh texcoord data.
 * @returns {Float32Array}
 */

VboMesh.prototype.getTexcoords = function(){
	return this._obj.texcoords;
};

/**
 * Disposes the associated vertex and index buffer objects.
 */

VboMesh.prototype.dispose = function(){
	this._vbo.dispose();
	if(this._ibo){
		this._ibo.dispose();
	}
	this._obj = null;
};

/**
 * Returns the meshs unique id.
 * @returns {Number}
 */

VboMesh.prototype.getId = function(){
	return this._obj.getId();
};

module.exports = VboMesh;