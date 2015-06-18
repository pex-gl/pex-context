var VboMesh = require('./VboMesh'),
	PrimitiveScheme = require('./PrimitiveScheme'),
	ObjectUtil = require('../util/ObjectUtil'),
	_gl = require('./gl');

function Plane(numH,numV,format,usage){
	var scheme = PrimitiveScheme.Plane.create(numH,numV);
	usage = ObjectUtil.isUndefined(usage) ?
			(scheme.indices ? _gl.get().TRIANGLES : _gl.get().TRIANGLE_STRIP) :
			usage;
	VboMesh.apply(this,[usage, format]);

	this.setVertices(scheme.vertices);
	this.setNormals(scheme.normals);
	this.setColors(scheme.colors);
	this.setTexcoords(scheme.texcoords);

	if(scheme.indices){
		this.setIndices(scheme.indices);
	}
}

Plane.prototype = Object.create(VboMesh.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.setSubDivisions = function(numH,numV){
	var data = PrimitiveScheme.Plane.create(numH,numV);
	this.setVertices(data.vertices);
	this.setNormals(data.normals);
	this.setColors(data.colors);
	this.setTexcoords(data.texcoords);

	if(data.indices){
		this.setIndices(data.indices);
	}
};

function Cube(usage){
	var scheme = PrimitiveScheme.Cube;
	VboMesh.apply(this,[usage,new VboMesh.Format(), scheme.vertices.length / 3]);
	this.setVertices(scheme.vertices);
	this.setNormals(scheme.normals);
	this.setTexcoords(scheme.texcoords);
	this.setColors(scheme.colors);
	this.setIndices(scheme.indices);
}

Cube.prototype = Object.create(VboMesh.prototype);
Cube.prototype.constructor = Cube;

function Disk(usage,numSegments,radiusX,radiusY){
	usage = ObjectUtil.isUndefined(usage) ? _gl.get().TRIANGLE_FAN : usage;
	var scheme = PrimitiveScheme.Disk.create(numSegments,radiusX,radiusY);
	VboMesh.apply(this,[usage]);
	this.setVertices(scheme.vertices);
	this.setNormals(scheme.normals);
	this.setColors(scheme.colors);
	this.setTexcoords(scheme.texcoords);
}

Disk.prototype = Object.create(VboMesh.prototype);
Disk.prototype.constructor = Disk;

var VboMeshPrimitive = {
	Plane : Plane,
	Cube : Cube,
	Disk : Disk
};

module.exports = VboMeshPrimitive;
