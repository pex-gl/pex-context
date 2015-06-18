var PrimitiveScheme = {};

PrimitiveScheme.Disk = {
	create : function(numSegments,radiusX,radiusY){
		numSegments = numSegments === undefined ? 20 : numSegments;
		radiusX = radiusX === undefined ? 1.0 : radiusX;
		radiusY = radiusY === undefined ? 1.0 : radiusY;

		numSegments += 1;
		var vertices  = [],
			normals   = [],
			colors    = [],
			texcoords = [];

		var norm = Math.max(radiusX,radiusY);
		var radiusXNorm = radiusX / norm,
			radiusYNorm = radiusY / norm;

		vertices.push(0,0,0);
		normals.push(0,1,0);
		colors.push(0,1,0,1);
		texcoords.push(0.5,0.5);

		var i = -1;
		var step = Math.PI * 2 / (numSegments-1),j;
		var x,y;
		while(++i < numSegments){
			j = i * step;
			x = Math.cos(j) * radiusXNorm;
			y = Math.sin(j) * radiusYNorm;
			vertices.push(x * norm ,0,y * norm);
			normals.push(0,1,0);
			colors.push(0,1,0,1);
			texcoords.push(0.5 + x * 0.5,0.5 + y * 0.5);
		}

		return {
			vertices : vertices,
			normals : normals,
			colors : colors,
			texcoords : texcoords
		};
	}
};


PrimitiveScheme.Plane = {
	create : function(numH,numV){
		var numH_1 = numH - 1,
			numV_1 = numV - 1;
		var _numH_1 = 1.0 / numH_1,
			_numV_1 = 1.0 / numV_1;
		var num = numH * numV;

		var vertices  = [],
			normals   = [],
			colors    = [],
			texcoords = [],
			indices   = null;

		var i, j;
		var x, y, z;
		i = -1;
		while(++i < numV){
			j = -1;
			x = i * _numV_1;
			while(++j < numH){
				y = 0.0;
				z = j * _numH_1;

				vertices.push(x,y,z);
				normals.push(0,1,0);
				colors.push(1,1,1,1);
				texcoords.push(x,z);
			}
		}

		if(num > 4){
			indices = [];
			var a, b, c, d;
			i = -1;
			while(++i < numV_1){
				j = -1;
				while(++j < numH_1){
					a = i * numH + j;
					b = a + 1;
					c = (i + 1) * numH + j;
					d = c + 1;

					indices.push(c,b,a,c,d,b);
				}
			}
		}

		return {
			vertices  : vertices,
			normals   : normals,
			colors    : colors,
			texcoords : texcoords,
			indices   : indices
		};
	}
};

PrimitiveScheme.Cube = {
	vertices : [
		-0.5, -0.5,  0.5, 0.5, -0.5,  0.5, 0.5,  0.5,  0.5, -0.5,  0.5,  0.5, //front
		-0.5, -0.5, -0.5, -0.5,  0.5, -0.5, 0.5,  0.5, -0.5, 0.5, -0.5, -0.5, //back
		-0.5,  0.5, -0.5, -0.5,  0.5,  0.5, 0.5,  0.5,  0.5, 0.5,  0.5, -0.5, //top
		-0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5,  0.5, -0.5, -0.5,  0.5, //bottom
		0.5, -0.5, -0.5, 0.5,  0.5, -0.5, 0.5,  0.5,  0.5, 0.5, -0.5,  0.5,   //right
		-0.5, -0.5, -0.5, -0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5,  0.5, -0.5 //left
	],

	normals : [
		0.0,  0.0,  1.0, 0.0,  0.0,  1.0, 0.0,  0.0,  1.0, 0.0,  0.0,  1.0,
		0.0,  0.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.0, -1.0, 0.0,  0.0, -1.0,
		0.0,  1.0,  0.0, 0.0,  1.0,  0.0, 0.0,  1.0,  0.0, 0.0,  1.0,  0.0,
		0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0, 0.0, -1.0,  0.0,
		1.0,  0.0,  0.0, 1.0,  0.0,  0.0, 1.0,  0.0,  0.0, 1.0,  0.0,  0.0,
		-1.0,  0.0,  0.0, -1.0,  0.0,  0.0, -1.0,  0.0,  0.0, -1.0,  0.0,  0.0
	],

	colors : [
		0, 0.5, 0, 1,  0, 0.5, 0, 1,  0, 0.5, 0, 1,  0, 0.5, 0, 1,
		0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
		0.5, 0, 0, 1, 0.5, 0, 0, 1, 0.5, 0, 0, 1, 0.5, 0, 0, 1,
		0, 0, 0.5, 1,0, 0, 0.5, 1,0, 0, 0.5, 1, 0, 0, 0.5, 1,
		0, 0, 1, 1,0, 0, 1, 1,0, 0, 1, 1,0, 0, 1, 1,
		1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1
	],

	texcoords : [
		0.0,  0.0, 1.0,  0.0, 1.0,  1.0, 0.0,  1.0,
		0.0,  0.0, 1.0,  0.0, 1.0,  1.0, 0.0,  1.0,
		0.0,  0.0, 1.0,  0.0, 1.0,  1.0, 0.0,  1.0,
		0.0,  0.0, 1.0,  0.0, 1.0,  1.0, 0.0,  1.0,
		0.0,  0.0, 1.0,  0.0, 1.0,  1.0,  0.0,  1.0,
		0.0,  0.0, 1.0,  0.0, 1.0,  1.0, 0.0,  1.0
	],

	indices : [
		0,  1,  2,      0,  2,  3,
		4,  5,  6,      4,  6,  7,
		8,  9,  10,     8,  10, 11,
		12, 13, 14,     12, 14, 15,
		16, 17, 18,     16, 18, 19,
		20, 21, 22,     20, 22, 23
	]
};


module.exports = PrimitiveScheme;