var Mesh = require('./Mesh'),
	PrimitiveScheme = require('./PrimitiveScheme'),
	ObjectUtil = require('../util/ObjectUtil'),
	_gl = require('./gl');

function Plane(numH,numV,format){
	var data = PrimitiveScheme.Plane.create(numH,numV);
	Mesh.apply(this,[format]);

	this.setVertices(data.vertices);
	this.setNormals(data.normals);
	this.setColors(data.colors);
	this.setTexcoords(data.texcoords);

	if(data.indices){
		this.setIndices(data.indices);
	}
}

Plane.prototype = Object.create(Mesh.prototype);
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


function Cube(){
	Mesh.apply(this,[new Mesh.Format(),24]);
	var scheme = PrimitiveScheme.Cube;
	this.setVertices(scheme.vertices);
	this.setNormals(scheme.normals);
	this.setTexcoords(scheme.texcoords);
	this.setColors(scheme.colors);

	this.indices = new Uint16Array(scheme.indices);
}

Cube.prototype = Object.create(Mesh.prototype);
Cube.prototype.constructor = Cube;

function Disk(numSegments,radiusX,radiusY){
	var scheme = PrimitiveScheme.Disk.create(numSegments,radiusX,radiusY);
	Mesh.apply(this);
	this.setVertices(scheme.vertices);
	this.setNormals(scheme.normals);
	this.setColors(scheme.colors);
	this.setTexcoords(scheme.texcoords);
}

Disk.prototype = Object.create(Mesh.prototype);
Disk.prototype.constructor = Disk;

var MeshPrimitive = {
	Plane : Plane,
	Cube : Cube,
	Disk : Disk
};

module.exports = MeshPrimitive;