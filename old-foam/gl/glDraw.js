var Window_ = require('../app/Window');
var ObjectUtil       = require('../util/ObjectUtil'),
    ArrayUtil        = require('../util/ArrayUtil'),
    ElementArrayUtil = require('../util/ElementArrayUtil'),
    PrimitiveScheme = require('./PrimitiveScheme'),
    Vec2     = require('../math/Vec2'),
    Vec3     = require('../math/Vec3'),
    Quat     = require('../math/Quat'),
    Matrix44 = require('../math/Matrix44'),
    gl_   = require('./gl'),
    glTrans = require('./glTrans'),
    Program = require('./Program'),
    Color = require('../util/Color');

var DrawMode = {
    TRIANGLES : 0,
    LINES : 1,
    POINTS : 2,
    COLORED : 3
};

var VEC2_ONE = Vec2.one();
var VEC3_ZERO = Vec3.zero();
var TEMP_VEC2_0 = new Vec2();

/*--------------------------------------------------------------------------------------------*/
//  Constructor
/*--------------------------------------------------------------------------------------------*/

function glDraw_Internal(){
    var gl = this._gl = gl_.get();

    /*--------------------------------------------------------------------------------------------*/
    //  program & attrib / uniform ref
    /*--------------------------------------------------------------------------------------------*/

    this._color = Color.white();

    this._program = null;
    this._programIdLast = null;

    this._attribLocationVertexPos = null;
    this._attribLocationVertexColor = null;
    this._attribLocationVertexNormal = null;
    this._attribLocationTexcoord = null;

    this._uniformLocationProjectionMatrix = null;
    this._uniformLocationViewMatrix = null;
    this._uniformLocationModelViewMatrix = null;
    this._uniformLocationNormalMatrix = null;

    /*--------------------------------------------------------------------------------------------*/
    //  temps
    /*--------------------------------------------------------------------------------------------*/

    this._matrixTemp0 = new Matrix44();
    this._matrixTemp1 = new Matrix44();
    this._matrixTemp2 = new Matrix44();
    this._matrixF32   = new Float32Array(16);
    this._vec3Temp0 = new Vec3();
    this._vec3Temp1 = new Vec3();
    this._vec3Temp2 = new Vec3();
    this._vec3Temp3 = new Vec3();
    this._vec3Temp4 = new Vec3();
    this._vec3Temp5 = new Vec3();
    this._up = Vec3.yAxis();


    var buffer, data, num;

    /*--------------------------------------------------------------------------------------------*/
    //  Pivot
    /*--------------------------------------------------------------------------------------------*/

    this._pivotAxisLength = null;
    this._pivotHeadLength = null;
    this._pivotHeadRadius = null;

    //  vertices

    buffer = this._pivotVertexBuffer = gl.createBuffer();

    data = [    //  axes
        0,0,0,
        1,0,0,
        0,0,0,
        0,1,0,
        0,0,0,
        0,0,1
    ];

    var numHeadVertices = 16;   //  number of vertices per head

    ArrayUtil.appendArray(data, ArrayUtil.createArray(numHeadVertices,0,0,0));
    ArrayUtil.appendArray(data, ArrayUtil.createArray(numHeadVertices,0,0,0));
    ArrayUtil.appendArray(data, ArrayUtil.createArray(numHeadVertices,0,0,0));

    data = this._bufferPivotVertex = new Float32Array(data);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);

    this._updatePivotGeom(1.0,0.125,0.075);

    //  colors

    this._pivotColorBuffer = gl.createBuffer();

    data = [    //  axes
        1,0,0,1,
        1,0,0,1,
        0,1,0,1,
        0,1,0,1,
        0,0,1,1,
        0,0,1,1
    ];

    ArrayUtil.appendArray(data, ArrayUtil.createArray(numHeadVertices, 1,0,0,1));
    ArrayUtil.appendArray(data, ArrayUtil.createArray(numHeadVertices, 0,1,0,1));
    ArrayUtil.appendArray(data, ArrayUtil.createArray(numHeadVertices, 0,0,1,1));

    gl.bindBuffer(gl.ARRAY_BUFFER, this._pivotColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    //  indices

    data = [];
    ArrayUtil.appendArray(data,ElementArrayUtil.genTriangleFan( 6, 6 + 16));
    ArrayUtil.appendArray(data,ElementArrayUtil.genTriangleFan(22,22 + 16));
    ArrayUtil.appendArray(data,ElementArrayUtil.genTriangleFan(38,38 + 16));
    data = new Uint16Array(data);

    buffer = this._bufferPivotIndex = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

    this._pivotIndexBufferLength = data.length;


    /*--------------------------------------------------------------------------------------------*/
    //  grid
    /*--------------------------------------------------------------------------------------------*/

    this._gridVbo = gl.createBuffer();
    this._gridIbo = gl.createBuffer();

    this._gridSubdivs   = null;
    this._gridVertices  = null;
    this._gridColors    = null;
    this._gridColorLast = Color.white();

    this._gridVboOffsetColors = null;
    this._gridIboLength = null;


    /*--------------------------------------------------------------------------------------------*/
    //  cube
    /*--------------------------------------------------------------------------------------------*/

    //  vertices

    buffer = this._cubeVertexBuffer = gl.createBuffer();

    var len = this._cubeVertexBufferNormalOffset = 24 /*vertices*/ * 3 * 4 /*bytes*/;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, len * 2 + 24 * 2 * 4, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0,   new Float32Array(PrimitiveScheme.Cube.vertices));
    gl.bufferSubData(gl.ARRAY_BUFFER, len, new Float32Array(PrimitiveScheme.Cube.normals));

    len = this._cubeVertexBufferNormalTexcoord = len * 2;

    //for now
    gl.bufferSubData(gl.ARRAY_BUFFER, len, new Float32Array(PrimitiveScheme.Cube.texcoords));

    //  colors
    buffer = this._cubeColorBuffer = gl.createBuffer();
    data   = this._cubeColorBufferData = new Float32Array(24 * 4);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);

    //  colors colored

    buffer = this._cubeColorBufferColored = gl.createBuffer();
    data   = new Float32Array(PrimitiveScheme.Cube.colors);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    //  indices

    var indicesTriangles = new Uint16Array(PrimitiveScheme.Cube.indices);

    var indicesLines = new Uint16Array([
        0,1,    1,2,   2,3,    3,0,
        4,5,    5,6,   6,7,    7,4,
        8,9,    9,10,  10,11, 11,8,
        12,13, 13,14,  14,15, 15,12
    ]);

    var indicesPoints = new Uint16Array([
        0,1,2,3,4,5,6,7
    ]);


    this._cubeIndexBufferOffsetTriangles = 0;
    this._cubeIndexBufferOffsetLines = indicesTriangles.byteLength;
    this._cubeIndexBufferOffsetPoints = this._cubeIndexBufferOffsetLines + indicesLines.byteLength;
    this._cubeIndicesTrianglesLength = indicesTriangles.length;
    this._cubeIndicesLinesLength = indicesLines.length;
    this._cubeIndicesPointsLength = indicesPoints.length;

    buffer = this._cubeIndexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesTriangles.byteLength + indicesLines.byteLength + indicesPoints.byteLength, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, this._cubeIndexBufferOffsetTriangles, indicesTriangles );
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, this._cubeIndexBufferOffsetLines, indicesLines);
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, this._cubeIndexBufferOffsetPoints, indicesPoints);

    /*--------------------------------------------------------------------------------------------*/
    //  Plane
    /*--------------------------------------------------------------------------------------------*/

    buffer = this._rectBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, (4 * 3 * 3 + 4 * 2) * 4, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([
        0,0,0,
        1,0,0,
        0,1,0,
        1,1,0
    ]));
    gl.bufferSubData(gl.ARRAY_BUFFER, 48, new Float32Array([
        0,0,0,
        1,0,0,
        1,1,0,
        0,1,0
    ]));
    gl.bufferSubData(gl.ARRAY_BUFFER, 96, new Float32Array([
        1,0,0,
        1,0,0,
        1,0,0,
        1,0,0
    ]));
    gl.bufferSubData(gl.ARRAY_BUFFER, 144, new Float32Array([
        0,0,1,0,0,1,1,1
    ]));

    this._rectBufferOffsetLines = 48;
    this._rectBufferOffsetNormals = 96;
    this._rectBufferOffsetTexcoords = 144;

    buffer = this._rectColorBuffer = gl.createBuffer();
    data   = this._rectColorBufferData = new Float32Array([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);

    /*--------------------------------------------------------------------------------------------*/
    //  Circle
    /*--------------------------------------------------------------------------------------------*/

    this._circleBuffer = gl.createBuffer();
    this._circleVertices = null;
    this._circleNormals = null;
    this._circleColors = null;
    this._circleTexcoords = null;

    this._circleNumSegments = 16;
    this._circleNumSegmentsLast = null;
    this._circleBufferOffsetVertices  = 0;
    this._circleBufferOffsetNormals   = null;
    this._circleBufferOffsetColors    = null;
    this._circleBufferOffsetTexcoords = null;
    this._circleColorLast = Color.white();

    this._circlesModelVertices = null;
    this._circlesModelNormals = null;
    this._circlesModelColors = null;
    this._circlesModelTexcoords = null;
    this._circlesModelIndices = [];
    this._circlesModelNumSegments = 16;
    this._circlesModelNumSegmentsLast = null;
    this._circlesModelColorLast = Color.white();

    this._circlesBuffer = gl.createBuffer();
    this._circlesVertices = null;
    this._circlesNormals = null;
    this._circlesColors = null;
    this._circlesTexcoords = null;
    this._circlesBufferIndices = gl.createBuffer();
    this._circlesIndices = null;


    this._circlesTransform = new Matrix44();

    this._circlesBufferOffsetVertices = 0;
    this._circlesBufferOffsetNormals = null;
    this._circlesBufferOffsetColors = null;
    this._circlesBufferOffsetTexcoords = null;

    this._circlesNumLast = null;

    /*--------------------------------------------------------------------------------------------*/
    //  Line
    /*--------------------------------------------------------------------------------------------*/

    buffer = this._bufferLine = gl.createBuffer();
    this._bufferLineVertex = new Float32Array(6);
    this._bufferLineColor = new Float32Array(8);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,this._bufferLineVertex.byteLength + this._bufferLineColor.byteLength, gl.DYNAMIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER,0,this._bufferLineVertex);
    gl.bufferSubData(gl.ARRAY_BUFFER,this._bufferLineVertex.byteLength,this._bufferLineColor);

    /*--------------------------------------------------------------------------------------------*/
    //  Lines / Line strip
    /*--------------------------------------------------------------------------------------------*/

    this._bufferLineStrip = gl.createBuffer();
    this._bufferLineStripVertex = new Float32Array(0);
    this._bufferLineStripColor = new Float32Array(0);
    this._lineStripColor = new Color();

    this._bufferLines = gl.createBuffer();
    this._bufferLinesVertex = new Float32Array(0);
    this._bufferLinesColor = new Float32Array(0);
    this._linesColor = new Color();

    this._linesArrTemp = [];

    /*--------------------------------------------------------------------------------------------*/
    //  Point
    /*--------------------------------------------------------------------------------------------*/

    this._pointSize = 2;
    this._pointSizeLast = null;

    this._bufferPoint = gl.createBuffer();
    this._bufferPointVertex = new Float32Array(3);
    this._bufferPointColor  = new Float32Array(4);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._bufferPoint);
    gl.bufferData(gl.ARRAY_BUFFER, (3 + 4) * 4, gl.DYNAMIC_DRAW);

    this._pointColor = new Color();

    /*--------------------------------------------------------------------------------------------*/
    //  Points
    /*--------------------------------------------------------------------------------------------*/

    this._bufferPoints = gl.createBuffer();
    this._bufferPointsVertex = new Float32Array(0);
    this._bufferPointsColor = new Float32Array(0);
    this._pointsColor = new Color();
    this._pointsArrTemp = [];

    /*--------------------------------------------------------------------------------------------*/
    //  Vector
    /*--------------------------------------------------------------------------------------------*/

    this._vectorAxisLength = null;
    this._vectorHeadLength = null;
    this._vectorHeadRadius = null;
    this._vectorHeadVertex = new Float32Array(numHeadVertices * 3);

    this._bufferVectorVertex = gl.createBuffer();
    this._bufferVectorVertexData = new Float32Array(6 + this._vectorHeadVertex.length);

    buffer = this._bufferVectorColor = gl.createBuffer();
    this._bufferVectorColorData = new Float32Array(ArrayUtil.createArray(numHeadVertices + 2,1,1,1,1));
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,this._bufferVectorColorData,gl.STATIC_DRAW);

    buffer = this._bufferVectorIndex = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,buffer);
    data = ElementArrayUtil.genTriangleFan(2,2+16);
    this._bufferVectorIndexDataLength = data.length;
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(data),gl.STATIC_DRAW);

    /*--------------------------------------------------------------------------------------------*/
    //  Mesh
    /*--------------------------------------------------------------------------------------------*/

    this._bufferMesh               = gl.createBuffer();
    this._bufferMeshIndices        = gl.createBuffer();
    this._bufferMeshLength         = 0;
    this._bufferMeshIndicesLength  = 0;

    /*--------------------------------------------------------------------------------------------*/
    //  VboMesh
    /*--------------------------------------------------------------------------------------------*/


    /*--------------------------------------------------------------------------------------------*/
    //  Quaternion
    /*--------------------------------------------------------------------------------------------*/

    this._quatAxisLength = null;
    this._quatHeadLength = null;
    this._quatHeadRadius = null;
    this._quatHeadVertex = new Float32Array(numHeadVertices * 3);

    buffer = this._bufferQuatColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(ArrayUtil.createArray(numHeadVertices + 2,1,1,1,1)),gl.STATIC_DRAW);

    /*--------------------------------------------------------------------------------------------*/
    //  Init
    /*--------------------------------------------------------------------------------------------*/


    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

/*--------------------------------------------------------------------------------------------*/
//  Quaternion
/*--------------------------------------------------------------------------------------------*/

/**
 * Draws a Quaternion.
 * @param q
 * @param {Number} [length]
 * @param {Vec3} [offset]
 * @param {Vec3} [axis]
 */

glDraw_Internal.prototype.drawQuat = function(q,length,offset,axis){
    length = length === undefined ? 0.35 : length;
    var prevColor = this.getColor();

    glTrans.pushMatrix();
        if(offset){
            glTrans.translate(offset);
        }
        glTrans.pushMatrix();
            glTrans.rotateQuat(q);
            this.colorf(1,1,1);
            this.drawCubeStroked(0.05);
            this.drawPivot(length,0.125,0.025);
        glTrans.popMatrix();
        if(axis){
            length *= 1.25;
            var len = 1.0 / Math.sqrt(x * x + y * y + z * z);
            x *= len;y *= len;z *= len;
            this.drawVectorf(0,0,0,x*length,y*length,z*length,0.0635,0.0375);
        }
    glTrans.popMatrix();
    this.color(prevColor);
};


/*--------------------------------------------------------------------------------------------*/
//  Vector
/*--------------------------------------------------------------------------------------------*/

/**
 * Draw a vector from to.
 * @param {Vec3} v0 - Point from
 * @param {Vec3} v1 - Point to
 */

glDraw_Internal.prototype.drawVector = function(v0,v1){
    if(!v1){
        this.drawVectorf(0,0,0,v0.x,v0.y,v0.z);
        return;
    }

    this.drawVectorf(v0.x,v0.y,v0.z,v1.x,v1.y,v1.z);
};

/**
 * Draw a vector from to.
 * @param {Number} x0 - Point from x
 * @param {Number} y0 - Point from y
 * @param {Number} z0 - Point from z
 * @param {Number} x1 - Point to x
 * @param {Number} y1 - Point to y
 * @param {Number} z1 - Point to z
 * @param {Number} [headLength=0.125] - The arrow´s head length
 * @param {Number} [headRadius=0.075] - The arrow´s head radius
 */

glDraw_Internal.prototype.drawVectorf = function(x0,y0,z0,x1,y1,z1, headLength, headRadius){
    if(x0 == x1 && y0 == y1 && z0 == z1){
        return;
    }

    if(ObjectUtil.isUndefined(x1) &&
       ObjectUtil.isUndefined(y1) &&
       ObjectUtil.isUndefined(z1)){
        x1 = x0;
        y1 = y0;
        z1 = z0;
        x0 = y0 = z0 = 0;
    }

    headLength = ObjectUtil.isUndefined(headLength) ? 0.125 : headLength;
    headRadius = ObjectUtil.isUndefined(headRadius) ? 0.075 : headRadius;


    this._updateProgramLocations();

    var gl = this._gl;
    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;

    if(attribLocationVertexPos == -1){
        return;
    }

    if(attribLocationVertexNormal != -1){
        gl.disableVertexAttribArray(attribLocationVertexNormal);
    }
    if(attribLocationTexcoord != -1){
        gl.disableVertexAttribArray(attribLocationTexcoord);
    }

    var prevABuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING),
        prevEBuffer = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
    var abuffer = this._bufferVectorVertex,
        ebuffer = this._bufferVectorIndex;

    if(abuffer != prevABuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER,abuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ebuffer);
    }

    var start = this._vec3Temp0.setf(x0,y0,z0),
        end   = this._vec3Temp1.setf(x1,y1,z1);
    var axis  = end.subbed(start,this._vec3Temp2),
        axisLen = axis.length();

    var vertices = this._bufferVectorVertexData,
        headVertices = this._vectorHeadVertex;

    var i,l;

    if(this._vectorAxisLength != axisLen ||
       this._vectorHeadLength != headLength ||
       this._vectorHeadRadius != headRadius ||
       vertices[0] != x0 ||
       vertices[1] != y0 ||
       vertices[2] != z0 ||
       vertices[3] != x1 ||
       vertices[4] != y1 ||
       vertices[5] != z1){

        vertices[0] = x0;
        vertices[1] = y0;
        vertices[2] = z0;
        vertices[3] = x1;
        vertices[4] = y1;
        vertices[5] = z1;

        if(this._vectorHeadLength != headLength ||
            this._vectorHeadRadius != headRadius) {
            this._genHead(headLength, headRadius, headVertices, 0);
            this._vectorHeadLength = headLength;
            this._vectorHeadRadius = headRadius;
        }

        vertices.set(headVertices,6);
        axis.normalize();

        var left = this._up.crossed(axis, this._vec3Temp3).normalize(),
            up   = axis.crossed(left, this._vec3Temp4).normalize();

        if(start.x == end.x && start.z == end.z){
            if(start.y > end.y){
                left.setf(0,0,1);
                up.setf(1,0,0);
                axis.setf(0,-1,0);
            } else {
                left.setf(1,0,0);
                up.setf(0,0,1);
                axis.setf(0,1,0);
            }
        }

        var axisScaled = axis.scaled(axisLen - headLength,this._vec3Temp5);
        end.set(start).add(axisScaled);

        var matrix = this._matrixTemp0;
            matrix.identity();
            matrix.setTranslationf(end.x,end.y,end.z);
            matrix.setRotationFromOnB(left,up,axis);
        var m = matrix.m;
        var x, y, z;

        i = 6;
        l = vertices.length;
        while(i < l){
            x = vertices[i    ];
            y = vertices[i + 1];
            z = vertices[i + 2];

            vertices[i    ] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12];
            vertices[i + 1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13];
            vertices[i + 2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14];

            i += 3;
        }

        gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);

        this._vectorAxisLength = axisLen;

    }

    gl.vertexAttribPointer(attribLocationVertexPos,3,gl.FLOAT,false,0,0);

    if(attribLocationVertexColor != -1){
        abuffer = this._bufferVectorColor;
        gl.bindBuffer(gl.ARRAY_BUFFER,abuffer);

        var color = this._color,
            r = color.r, g = color.g, b = color.b, a = color.a;
        var colorData = this._bufferVectorColorData;

        if(colorData[0] != r || colorData[1] != g || colorData[2] != b || colorData[3] != a){
            i = 0;
            l = colorData.length;
            while(i < l){
                colorData[i++] = r;
                colorData[i++] = g;
                colorData[i++] = b;
                colorData[i++] = a;
            }
            gl.bufferData(gl.ARRAY_BUFFER,colorData,gl.DYNAMIC_DRAW);
        }

        gl.vertexAttribPointer(attribLocationVertexColor,4,gl.FLOAT,false,0,0);
    }

    this._applyMatrixUniforms();

    gl.drawArrays(gl.LINES,0,2);
    gl.drawElements(gl.TRIANGLE_FAN,this._bufferVectorIndexDataLength,gl.UNSIGNED_SHORT,0);

    if(attribLocationVertexNormal != -1){
        gl.enableVertexAttribArray(attribLocationVertexNormal);
    }

    if(attribLocationTexcoord != -1){
        gl.enableVertexAttribArray(attribLocationTexcoord);
    }

    if(abuffer != prevABuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER, prevABuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, prevEBuffer);
    }
};

/*--------------------------------------------------------------------------------------------*/
//  Points
/*--------------------------------------------------------------------------------------------*/

/**
 * Draws a single point.
 * @param {Vec3} [v]
 */

glDraw_Internal.prototype.drawPoint = function(v){
    v = v || VEC3_ZERO;
    this.drawPointf(v.x, v.y, v.z);
}

/**
 * Draws a single point.
 * @param {Number} [x]
 * @param {Number} [y]
 * @param {Number} [z]
 */

glDraw_Internal.prototype.drawPointf = function(x,y,z){
    x = x || 0;
    y = y || 0;
    z = z || 0;

    this._updateProgramLocations();

    var gl = this._gl;
    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;

    if(attribLocationVertexPos == -1){
        return;
    }

    if(attribLocationVertexNormal != -1){
        gl.disableVertexAttribArray(attribLocationVertexNormal);
    }
    if(attribLocationTexcoord != -1){
        gl.disableVertexAttribArray(attribLocationTexcoord);
    }

    var prevABuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    var buffer = this._bufferPoint;

    if(buffer != prevABuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    }

    var bufferVertex = this._bufferPointVertex,
        bufferColor  = this._bufferPointColor;

    if(bufferVertex[0] != x || bufferVertex[1] != y || bufferVertex[2] != z){
        bufferVertex[0] = x;
        bufferVertex[1] = y;
        bufferVertex[2] = z;
        gl.bufferSubData(gl.ARRAY_BUFFER,0,bufferVertex);
    }
    gl.vertexAttribPointer(attribLocationVertexPos,3,gl.FLOAT,false,0,0);

    var color = this._color;
    if(!color.equalsf(bufferColor[0],bufferColor[1],bufferColor[2],bufferColor[3])){
        bufferColor[0] = color.r;
        bufferColor[1] = color.g;
        bufferColor[2] = color.b;
        bufferColor[3] = color.a;
        gl.bufferSubData(gl.ARRAY_BUFFER,12,bufferColor);
    }

    if(attribLocationVertexColor != -1){
        gl.vertexAttribPointer(attribLocationVertexColor,3,gl.FLOAT,false,0,12);
    }

    this._applyMatrixUniforms();
    gl.drawArrays(gl.POINTS,0,1);

    if(attribLocationVertexNormal != -1){
        gl.enableVertexAttribArray(attribLocationVertexNormal);
    }
    if(attribLocationTexcoord != -1){
        gl.enableVertexAttribArray(attribLocationTexcoord);
    }
    if(buffer != prevABuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER, prevABuffer);
    }
};

/**
 * Draw a set of points.
 * @param {Vec3[]} points - The line´s points or args
 */

glDraw_Internal.prototype.drawPoints = function(points){
    var args = arguments.length == 1 ? arguments[0] : arguments,
        arr  = this._pointsArrTemp;
    var l = args.length;
    arr.length = l * 3;

    var i = -1 , i3, vec3;

    while (++i < l) {
        vec3 = args[i];
        i3   = i * 3;

        arr[i3  ] = vec3.x;
        arr[i3+1] = vec3.y;
        arr[i3+2] = vec3.z;
    }

    this.drawPointsf(arr);
};

/**
 * Draw a set of points.
 * @param {Number[]} points - The line´s points
 */

glDraw_Internal.prototype.drawPointsf = function(points){
    this._updateProgramLocations();

    var gl = this._gl;
    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;

    if(attribLocationVertexPos == -1){
        return;
    }

    if(attribLocationVertexNormal != -1){
        gl.disableVertexAttribArray(attribLocationVertexNormal);
    }
    if(attribLocationTexcoord != -1){
        gl.disableVertexAttribArray(attribLocationTexcoord);
    }

    var prevABuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    var buffer = this._bufferPoints;


    if(buffer != prevABuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    }

    var prevLength = this._bufferPointsVertex.length;

    if(prevLength >= points.length){
        this._bufferPointsVertex.set(points);

    } else {
        this._bufferPointsVertex = new Float32Array(points);
        this._bufferPointsColor  = new Float32Array(points.length / 3 * 4);
    }

    var vertices = this._bufferPointsVertex;
    var colors  = this._bufferPointsColor;

    gl.bufferData(gl.ARRAY_BUFFER, vertices.byteLength + colors.byteLength, gl.STREAM_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);

    gl.vertexAttribPointer(attribLocationVertexPos,3,gl.FLOAT,false,0,0);

    var color = this._color,
        pointsColor = this._pointsColor;

    if(attribLocationVertexColor != -1){
        if(prevLength != vertices.length ||
           !pointsColor.equals(color)){
            var i = 0;
            while(i < colors.length){
                colors[i  ] = color.r;
                colors[i+1] = color.g;
                colors[i+2] = color.b;
                colors[i+3] = color.a;

                i+=4;
            }
            pointsColor.set(color);
        }

        gl.bufferSubData(gl.ARRAY_BUFFER, vertices.byteLength, colors);
        gl.vertexAttribPointer(attribLocationVertexColor,4,gl.FLOAT,false,0,vertices.byteLength);
    }

    this._applyMatrixUniforms();

    gl.drawArrays(gl.POINTS,0,points.length / 3);

    if(attribLocationVertexNormal != -1){
        gl.enableVertexAttribArray(attribLocationVertexNormal);
    }

    if(attribLocationTexcoord != -1){
        gl.enableVertexAttribArray(attribLocationTexcoord);
    }

    if(buffer != prevABuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER, prevABuffer);
    }
};

/*--------------------------------------------------------------------------------------------*/
//  Line strip
/*--------------------------------------------------------------------------------------------*/

/**
 * Draw a continous line through a set of points.
 * @param {Vec3[]} points - The line´s points or args
 */

glDraw_Internal.prototype.drawLines = function(){
    var args = arguments.length == 1 ? arguments[0] : arguments,
        arr  = this._linesArrTemp;
    var l = args.length;
    arr.length = l * 3;

    var i = -1 , i3, vec3;

    while (++i < l) {
        vec3 = args[i];
        i3   = i * 3;

        arr[i3  ] = vec3.x;
        arr[i3+1] = vec3.y;
        arr[i3+2] = vec3.z;
    }

    this.drawLinesf(arr);
};

/**
 * Draw a continous line through a set of points.
 * @param {Array} lines - An array of arrays of line points.
 */

glDraw_Internal.prototype.drawLinesf = function(lines){
    this._updateProgramLocations();

    var gl = this._gl;
    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;

    if(attribLocationVertexPos == -1){
        return;
    }

    if(attribLocationVertexNormal != -1){
        gl.disableVertexAttribArray(attribLocationVertexNormal);
    }
    if(attribLocationTexcoord != -1){
        gl.disableVertexAttribArray(attribLocationTexcoord);
    }

    var prevABuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    var buffer = this._bufferLines;


    if(buffer != prevABuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    }

    if(this._bufferLinesVertex.length >= lines.length){
        this._bufferLinesVertex.set(lines);

    } else {
        this._bufferLinesVertex = new Float32Array(lines);
        this._bufferLinesColor  = new Float32Array(lines.length / 3 * 4);
    }

    var vertices = this._bufferLinesVertex;
    var colors  = this._bufferLinesColor;

    gl.bufferData(gl.ARRAY_BUFFER, vertices.byteLength + colors.byteLength, gl.STREAM_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);

    gl.vertexAttribPointer(attribLocationVertexPos,3,gl.FLOAT,false,0,0);

    var color = this._color,
        lineColor = this._linesColor;

    if(attribLocationVertexColor != -1){
        if(!lineColor.equals(color)){
            var i = 0;
            while(i < colors.length){
                colors[i  ] = color.r;
                colors[i+1] = color.g;
                colors[i+2] = color.b;
                colors[i+3] = color.a;

                i+=4;
            }
            lineColor.set(color);
        }

        gl.bufferSubData(gl.ARRAY_BUFFER, vertices.byteLength, colors);
        gl.vertexAttribPointer(attribLocationVertexColor,4,gl.FLOAT,false,0,vertices.byteLength);
    }

    this._applyMatrixUniforms();

    gl.drawArrays(gl.LINES,0,lines.length / 3);

    if(attribLocationVertexNormal != -1){
        gl.enableVertexAttribArray(attribLocationVertexNormal);
    }

    if(attribLocationTexcoord != -1){
        gl.enableVertexAttribArray(attribLocationTexcoord);
    }

    if(buffer != prevABuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER, prevABuffer);
    }
};

/**
 * Draw a set of lines.
 * @param {Array} lineStrip - An array of arrays of line points
 */

glDraw_Internal.prototype.drawLineStripf = function(lineStrip){
    this._updateProgramLocations();

    var gl;
    var attribLocationVertexPos, attribLocationVertexNormal,
        attribLocationVertexColor, attribLocationTexcoord;

    gl = this._gl;
    attribLocationVertexPos    = this._attribLocationVertexPos;
    attribLocationVertexNormal = this._attribLocationVertexNormal;
    attribLocationVertexColor  = this._attribLocationVertexColor;
    attribLocationTexcoord     = this._attribLocationTexcoord;

    if(attribLocationVertexPos == -1){
        return;
    }

    if(attribLocationVertexNormal != -1){
        gl.disableVertexAttribArray(attribLocationVertexNormal);
    }
    if(attribLocationTexcoord != -1){
        gl.disableVertexAttribArray(attribLocationTexcoord);
    }

    var prevABuffer, buffer;
    var vertex, color, color4f, lineStripColor;

    prevABuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    buffer      = this._bufferLineStrip;

    if(buffer != prevABuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    }

    if(this._bufferLineStripVertex.length >= lineStrip.length){
        this._bufferLineStripVertex.set(lineStrip);
    } else {
        this._bufferLineStripVertex = new Float32Array(lineStrip);
        this._bufferLineStripColor  = new Float32Array(lineStrip.length / 3 * 4);
    }

    vertex = this._bufferLineStripVertex;
    color  = this._bufferLineStripColor;

    gl.bufferData(gl.ARRAY_BUFFER, vertex.byteLength + color.byteLength, gl.STREAM_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._bufferLineStripVertex);

    gl.vertexAttribPointer(attribLocationVertexPos,3,gl.FLOAT,false,0,0);

    color4f        = this._color,
    lineStripColor = this._lineStripColor;

    if(attribLocationVertexColor != -1){

        if(!color4f.equals(lineStripColor)){

            for(var i = 0, len = color.length; i <  len; i+=4){
                color[i  ] = color4f.r;
                color[i+1] = color4f.g;
                color[i+2] = color4f.b;
                color[i+3] = color4f.a;
            }

            gl.bufferSubData(gl.ARRAY_BUFFER, vertex.byteLength, color);

            lineStripColor[0] = color4f.r;
            lineStripColor[1] = color4f.g;
            lineStripColor[2] = color4f.b;
            lineStripColor[3] = color4f.a;
        }
        gl.vertexAttribPointer(attribLocationVertexColor,4,gl.FLOAT,false,0,vertex.byteLength);
    }

    this._applyMatrixUniforms();

    gl.drawArrays(gl.LINE_STRIP,0,lineStrip.length / 3);

    if(attribLocationVertexNormal != -1){
        gl.enableVertexAttribArray(attribLocationVertexNormal);
    }

    if(attribLocationTexcoord != -1){
        gl.enableVertexAttribArray(attribLocationTexcoord);
    }

    if(buffer != prevABuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER, prevABuffer);
    }
};

/**
 * Draws a part of a line.
 * @param {Number[]} points
 * @param {Number} offset
 * @param {Number} [length]
 */

glDraw_Internal.prototype.drawLinePartf = function(points, offset, length){
    length = length === undefined ? (points.length / 3) : length;
    var arr = this._linesArrTemp;

    arr.length = length * 3;
    for(var i = 0, len = arr.length; i < len; i+=3){
        arr[i    ] = points[offset + i    ];
        arr[i + 1] = points[offset + i + 1];
        arr[i + 2] = points[offset + i + 2];
    }

    this.drawLineStripf(arr);
}

/**
 * Draws a part of a line.
 * @param {Vec3[]} points
 * @param {Number} offset
 * @param {Number} [length]
 */

glDraw_Internal.prototype.drawLinePart = function(points,offset,length){
    length = length === undefined ? points.length : length;
    var arr = this._linesArrTemp;

    arr.length = length * 3;
    for(var i = 0, j = 0, len = arr.length, point; i < len; i+=3, ++j){
        point    = points[j];
        arr[i  ] = point.x;
        arr[i+1] = point.y;
        arr[i+2] = point.z;
    }

    this.drawLineStripf(arr);
}

/*--------------------------------------------------------------------------------------------*/
//  Lines
/*--------------------------------------------------------------------------------------------*/

/**
 * Draw a line between two points.
 * @param {Number} x0 - Point from x
 * @param {Number} y0 - Point from y
 * @param {Number} z0 - Point from z
 * @param {Number} x1 - Point to x
 * @param {Number} y1 - Point to y
 * @param {Number} z1 - Point to z
 */

glDraw_Internal.prototype.drawLinef = function(x0,y0,z0,x1,y1,z1){
    this._updateProgramLocations();

    var gl = this._gl;
    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;

    if(attribLocationVertexPos == -1){
        return;
    }

    if(attribLocationVertexNormal != -1){
        gl.disableVertexAttribArray(attribLocationVertexNormal);
    }

    if(attribLocationTexcoord != -1){
        gl.disableVertexAttribArray(attribLocationTexcoord);
    }

    var prevABuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    var buffer = this._bufferLine;

    if(buffer != prevABuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    }

    var color  = this._color,
        colors = this._bufferLineColor;

    if(attribLocationVertexColor != -1){
        if(colors[0] != color.r ||
           colors[1] != color.g ||
           colors[2] != color.b ||
           colors[3] != color.a){

            colors[0] = colors[4] = color.r;
            colors[1] = colors[5] = color.g;
            colors[2] = colors[6] = color.b;
            colors[3] = colors[7] = color.a;

            gl.bufferSubData(gl.ARRAY_BUFFER, 24, colors);
        }
        gl.vertexAttribPointer(attribLocationVertexColor,4,gl.FLOAT,false,0,24);
    }

    var vertex = this._bufferLineVertex;

    if(vertex[0] != x0 ||
       vertex[1] != y0 ||
       vertex[2] != z0 ||
       vertex[3] != x1 ||
       vertex[4] != y1 ||
       vertex[5] != z1){

        vertex[0] = x0;
        vertex[1] = y0;
        vertex[2] = z0;

        vertex[3] = x1;
        vertex[4] = y1;
        vertex[5] = z1;

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertex);
    }


    gl.vertexAttribPointer(attribLocationVertexPos,3,gl.FLOAT,false,0,0);

    this._applyMatrixUniforms();

    gl.drawArrays(gl.LINES,0,2);

    if(attribLocationVertexNormal != -1){
        gl.enableVertexAttribArray(attribLocationVertexNormal);
    }

    if(attribLocationTexcoord != -1){
        gl.enableVertexAttribArray(attribLocationTexcoord);
    }

    if(buffer != prevABuffer){
        gl.bindBuffer(gl.ARRAY_BUFFER, prevABuffer);
    }
};

/**
 * Draw a line between two points.
 * @param {Vec3} v0 - Point from
 * @param {Vec3} v1 - Point to
 */

glDraw_Internal.prototype.drawLine = function(v0,v1){
    this.drawLinef(v0.x,v0.y,v0.z,v1.x,v1.y,v1.z);
};

/*--------------------------------------------------------------------------------------------*/
//  Plane
/*--------------------------------------------------------------------------------------------*/

glDraw_Internal.prototype._drawRect_Internal = function(width,height,drawMode){
    width  = ObjectUtil.isUndefined(width) ? 1 : width;
    height = ObjectUtil.isUndefined(height) ? 1 : height;

    this._updateProgramLocations();

    var gl = this._gl;
    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;

    if(attribLocationVertexPos == -1){
        return;
    }

    var prevVbo = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    var prevIbo = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);

    var color4f = this._color,
        color   = this._rectColorBufferData;

    gl.bindBuffer(gl.ARRAY_BUFFER, this._rectBuffer);

    gl.vertexAttribPointer(attribLocationVertexPos,3,gl.FLOAT,false,0,
        drawMode == DrawMode.LINES ? this._rectBufferOffsetLines : 0);


    if(drawMode == DrawMode.TRIANGLES){
        if(attribLocationVertexNormal != -1){
            gl.vertexAttribPointer(attribLocationVertexNormal,3,gl.FLOAT,false,0,this._rectBufferOffsetNormals);
        }
        if(attribLocationTexcoord != -1){
            gl.vertexAttribPointer(attribLocationTexcoord,2,gl.FLOAT,false,0,this._rectBufferOffsetTexcoords);
        }
    } else {
        if(attribLocationVertexNormal != -1){
            gl.disableVertexAttribArray(attribLocationVertexNormal);
        }
        if(attribLocationTexcoord != -1){
            gl.disableVertexAttribArray(attribLocationTexcoord);
        }
    }

    if(attribLocationVertexColor != -1){
        gl.bindBuffer(gl.ARRAY_BUFFER, this._rectColorBuffer);
        if( color[0] != color4f[0] ||
            color[1] != color4f[1] ||
            color[2] != color4f[2] ||
            color[3] != color4f[3]){

            color[0] = color[4] = color[ 8] = color[12] = color4f.r;
            color[1] = color[5] = color[ 9] = color[13] = color4f.g;
            color[2] = color[6] = color[10] = color[14] = color4f.b;
            color[3] = color[7] = color[11] = color[15] = color4f.a;

            gl.bufferSubData(gl.ARRAY_BUFFER, 0, color);
        }
        gl.vertexAttribPointer(attribLocationVertexColor,4,gl.FLOAT,false,0,0);
    }

    glTrans.pushMatrix();
    glTrans.scale3f(width,height,1.0);

    this._applyMatrixUniforms();

    gl.drawArrays(drawMode == DrawMode.TRIANGLES ? gl.TRIANGLE_STRIP :
                  drawMode == DrawMode.LINES ? gl.LINE_LOOP : gl.POINTS,0,4);

    glTrans.popMatrix();

    if(drawMode != DrawMode.TRIANGLES){
        if(attribLocationVertexNormal != -1){
            gl.enableVertexAttribArray(attribLocationVertexNormal);
        }
        if(attribLocationTexcoord != -1){
            gl.enableVertexAttribArray(attribLocationTexcoord);
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER,prevVbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,prevIbo);
};

/**
 * Draw a solid rectangle.
 * @param {Number} width - Rectangle´s width
 * @param {Number} height - Rectangle´s height
 */

glDraw_Internal.prototype.drawRect = function(width,height){
    this._drawRect_Internal(width,height,DrawMode.TRIANGLES);
};

/**
 * Draw the points of a rectangle.
 * @param {Number} width - Rectangle´s width
 * @param {Number} height - Rectangle´s height
 */

glDraw_Internal.prototype.drawRectPoints = function(width,height){
    this._drawRect_Internal(width,height,DrawMode.POINTS);
};

/**
 * Draw a stroked rectangle.
 * @param {Number} width - Rectangle´s width
 * @param {Number} height - Rectangle´s height
 */

glDraw_Internal.prototype.drawRectStroked = function(width,height){
    this._drawRect_Internal(width,height,DrawMode.LINES);
};


/*--------------------------------------------------------------------------------------------*/
//  Circle
/*--------------------------------------------------------------------------------------------*/

/**
 * Generate the geometry of a circle.
 * @param {Float32Array} vertices
 * @param {Float32Array} normals
 * @param {Float32Array} colors
 * @param {Float32Array} texcoords
 * @param {Number} numSegments
 * @param {Color} color
 * @private
 */

glDraw_Internal.prototype._genCircleGeom = function(vertices,normals,colors,texcoords,
                                                    numSegments,color){
    var step = Math.PI * 2 / numSegments;
    var r = color.r, g = color.g, b = color.b, a = color.a;
    var i,j;
    i = -1;
    while(++i < numSegments){
        j = i * 3;
        vertices[j  ] = Math.cos(step * i);
        vertices[j+1] = Math.sin(step * i);
        vertices[j+2] = 0;

        normals[j ] = 1.0;
        normals[j+1] = normals[j+2] = 0.0;

        j = i * 4;
        colors[j  ] = r;
        colors[j+1] = g;
        colors[j+2] = b;
        colors[j+3] = a;

        j = i * 2;
        texcoords[j  ] = 0.5 + vertices[j  ];
        texcoords[j+1] = 0.5 + vertices[j+1];
    }
}

/**
 * Update the geometry of a circle.
 * @param {Float32Array} vertices
 * @param {Float32Array} texcoords
 * @param {Number} numSegments
 * @param {Number} [offsetVertices=0]
 * @param {Number} [offsetTexcoords=0]
 * @private
 */

glDraw_Internal.prototype._updateCircleGeom = function(vertices,texcoords,numSegments,
                                                       offsetVertices,offsetTexcoords){
    offsetVertices  = offsetVertices || 0;
    offsetTexcoords = offsetTexcoords || 0;
    var step = Math.PI * 2 / numSegments;
    var i = -1,j;
    while(++i < numSegments){
        j = offsetVertices + i * 3;
        vertices[j  ] = Math.cos(step * i);
        vertices[j+1] = Math.sin(step * i);
        vertices[j+2] = 0;

        j = offsetTexcoords + i * 2;
        texcoords[j  ] = 0.5 + vertices[j  ];
        texcoords[j+1] = 0.5 + vertices[j+1];
    }
};

/**
 * Update the color data of a circle.
 * @param colors
 * @param numSegments
 * @param color
 * @param offset
 * @private
 */

glDraw_Internal.prototype._updateCircleColor = function(colors, numSegments, color, offset){
    offset = offset || 0;
    var r = color.r, g = color.g, b = color.b, a = color.a;
    var i = -1,j;
    while(++i < numSegments){
        j = i * 4;
        colors[j  ] = r;
        colors[j+1] = g;
        colors[j+2] = b;
        colors[j+3] = a;
    }
};

/**
 * Draw a circle.
 * @param radius
 * @param drawMode
 * @private
 */

glDraw_Internal.prototype._drawCircle_Internal = function(radius, drawMode){
    var gl = this._gl;

    if(drawMode != gl.TRIANGLE_FAN &&
        drawMode != gl.LINE_LOOP){
        return;
    }

    this._updateProgramLocations();

    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;

    if(attribLocationVertexPos == -1){
        return;
    }

    var prevBuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING),
        buffer     = this._circleBuffer;

    if(prevBuffer != buffer){
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    }

    var numSegments = this._circleNumSegments,
        color4f     = this._color,
        color       = this._circleColorLast;

    var offsetVertices  = this._circleBufferOffsetVertices,
        offsetColors    = this._circleBufferOffsetColors,
        offsetNormals   = this._circleBufferOffsetNormals,
        offsetTexcoords = this._circleBufferOffsetTexcoords;

    var vertices  = this._circleVertices,
        normals   = this._circleNormals,
        colors    = this._circleColors,
        texcoords = this._circleTexcoords;

    if(numSegments > this._circleNumSegmentsLast){
        // reinit
        var lenVertices  = numSegments * 3,
            lenNormals   = numSegments * 3,
            lenColors    = numSegments * 4,
            lenTexcoords = numSegments * 2;

        vertices  = this._circleVertices = new Float32Array(lenVertices);
        normals   = this._circleNormals  = new Float32Array(lenNormals);
        colors    = this._circleColors   = new Float32Array(lenColors);
        texcoords = this._circleTexcoords = new Float32Array(lenTexcoords);

        offsetNormals   = this._circleBufferOffsetNormals   = offsetVertices + vertices.byteLength;
        offsetColors    = this._circleBufferOffsetColors    = offsetNormals + normals.byteLength;
        offsetTexcoords = this._circleBufferOffsetTexcoords = offsetColors + colors.byteLength;

        this._genCircleGeom(vertices,normals,colors,texcoords,numSegments,color4f);

        gl.bufferData(gl.ARRAY_BUFFER, vertices.byteLength + normals.byteLength + colors.byteLength + texcoords.byteLength, gl.DYNAMIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, offsetVertices, vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, offsetNormals, normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, offsetColors, colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, offsetTexcoords, texcoords);

        color.set(color4f);
    } else {
        //reassign

        if(numSegments != this._circleNumSegmentsLast){
            this._updateCircleGeom(vertices,texcoords,numSegments);

            gl.bufferSubData(gl.ARRAY_BUFFER, offsetVertices, vertices);
            gl.bufferSubData(gl.ARRAY_BUFFER, offsetTexcoords, texcoords);
        }

        if(!color.equals(color4f)){
            this._updateCircleColor(colors,numSegments,color4f);
            gl.bufferSubData(gl.ARRAY_BUFFER, offsetColors, colors);
            color.set(color4f);
        }
    }

    gl.vertexAttribPointer(attribLocationVertexPos,3,gl.FLOAT,false,0,offsetVertices);

    if(drawMode == gl.TRIANGLE_FAN){
        if(attribLocationVertexNormal != -1){
            gl.vertexAttribPointer(attribLocationVertexNormal, 3, gl.FLOAT, false, 0, offsetNormals);
        }
        if(attribLocationTexcoord != -1){
            gl.vertexAttribPointer(attribLocationTexcoord, 2, gl.FLOAT, false, 0, offsetTexcoords);
        }
    }

    if(drawMode == gl.LINE_LOOP){
        if(attribLocationVertexNormal != -1){
            gl.disableVertexAttribArray(attribLocationVertexNormal);
        }
        if(attribLocationTexcoord != -1){
            gl.disableVertexAttribArray(attribLocationTexcoord);
        }
    }

    if(attribLocationVertexColor != -1){
        gl.vertexAttribPointer(attribLocationVertexColor, 4, gl.FLOAT, false, 0, offsetColors);
    }

    glTrans.pushMatrix();
    glTrans.scale1f(radius);

    this._applyMatrixUniforms();

    gl.drawArrays(drawMode, 0, numSegments);

    glTrans.popMatrix();

    if(drawMode == gl.LINE_LOOP){
        if(attribLocationVertexNormal != -1){
            gl.enableVertexAttribArray(attribLocationVertexNormal);
        }
        if(attribLocationTexcoord != -1){
            gl.enableVertexAttribArray(attribLocationTexcoord);
        }
    }

    if(prevBuffer != buffer){
        gl.bindBuffer(gl.ARRAY_BUFFER, prevBuffer);
    }

    this._circleNumSegmentsLast = numSegments;
};

/**
 * Draw a solid circle.
 * @param {Number} [radius=1.0] - The circle´s radius
 */

glDraw_Internal.prototype.drawCircle = function(radius){
    this._drawCircle_Internal(ObjectUtil.isUndefined(radius) ? 1.0 : radius,this._gl.TRIANGLE_FAN);
};

/**
 * Draw a stroked circle
 * @param {Number} [radius=1.0] - The circle´s radius
 */

glDraw_Internal.prototype.drawCircleStroked = function(radius){
    this._drawCircle_Internal(ObjectUtil.isUndefined(radius) ? 1.0 : radius, this._gl.LINE_LOOP);
}

glDraw_Internal.prototype._drawCircles_Internal = function(positions, radii, drawMode){
    var gl = this._gl;
    var numCircles = positions.length;

    if(drawMode != gl.TRIANGLE_FAN &&
       drawMode != gl.LINE_LOOP ||
       numCircles == 0){
        return;
    }

    var uniformRadius = !ObjectUtil.isArray(radii);
    if(!uniformRadius && radii.length != numCircles){
        console.log('Warning: Radii length doesn´t match number of circles.');
        return;
    }

    this._updateProgramLocations();

    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;

    if(attribLocationVertexPos == -1){
        return;
    }

    var prevVbo = gl.getParameter(gl.ARRAY_BUFFER_BINDING),
        vbo     = this._circlesBuffer;

    var prevIbo = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING),
        ibo     = this._circlesBufferIndices;

    if(prevVbo != vbo){
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    }

    if(prevIbo != ibo){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    }

    var numSegments = this._circlesModelNumSegments,
        color4f     = this._color,
        color       = this._circlesModelColorLast;

    var vertices  = this._circlesModelVertices,
        normals   = this._circlesModelNormals,
        colors    = this._circlesModelColors,
        texcoords = this._circlesModelTexcoords,
        indices   = this._circlesModelIndices;

    var offsetVertices  = this._circlesBufferOffsetVertices,
        offsetNormals   = this._circlesBufferOffsetNormals,
        offsetColors    = this._circlesBufferOffsetColors,
        offsetTexcoords = this._circlesBufferOffsetTexcoords;


    if(numSegments > this._circlesModelNumSegmentsLast){
        //reinit model
        var lenVertices  = numSegments * 3,
            lenNormals   = numSegments * 3,
            lenColors    = numSegments * 4,
            lenTexcoords = numSegments * 2;

        vertices  = this._circlesModelVertices  = new Float32Array(lenVertices);
        normals   = this._circlesModelNormals   = new Float32Array(lenNormals);
        colors    = this._circlesModelColors    = new Float32Array(lenColors);
        texcoords = this._circlesModelTexcoords = new Float32Array(lenTexcoords);

        offsetNormals   = this._circlesBufferOffsetNormals   = offsetVertices + vertices.byteLength;
        offsetColors    = this._circlesBufferOffsetColors    = offsetNormals + normals.byteLength;
        offsetTexcoords = this._circlesBufferOffsetTexcoords = offsetColors + colors.byteLength;

        this._genCircleGeom(vertices,normals,colors,texcoords,numSegments,color4f);

        ElementArrayUtil.genTriangleFan(0,numSegments,indices);

        this._circlesModelNumSegmentsLast = numSegments;
        color.set(color4f);
    } else {
        //reassign model
        if(numSegments != this._circlesModelNumSegmentsLast){
            this._updateCircleGeom(vertices,texcoords,numSegments);
        }
        if(!color.equals(color4f)){
            this._updateCircleColor(colors,numSegments,color4f);
            color.set(color4f);
        }
    }

    var i, j, k, m, n, o;

    var offsetCirclesVertices  = this._circlesBufferOffsetVertices,
        offsetCirclesColors    = this._circlesBufferOffsetColors,
        offsetCirclesNormals   = this._circlesBufferOffsetNormals,
        offsetCirclesTexcoords = this._circlesBufferOffsetTexcoords;

    var circlesVertices  = this._circlesVertices,
        circlesNormals   = this._circlesNormals,
        circlesColors    = this._circlesColors,
        circlesTexcoords = this._circlesTexcoords,
        circlesIndices   = this._circlesIndices;

    var position, radius;
    var x, y, z;

    var numElements = numCircles * numSegments;

    if(numCircles > this._circlesNumLast || numSegments > this._circlesModelNumSegmentsLast){
        //reinit buffer
        var lenCirclesVertices  = numElements * 3,
            lenCirclesNormals   = numElements * 3,
            lenCirclesColors    = numElements * 4,
            lenCirclesTexcoords = numElements * 2;

        circlesVertices  = this._circlesVertices = new Float32Array(lenCirclesVertices);
        circlesNormals   = this._circlesNormals  = new Float32Array(lenCirclesNormals);
        circlesColors    = this._circlesColors   = new Float32Array(lenCirclesColors);
        circlesTexcoords = this._circlesTexcoords = new Float32Array(lenCirclesTexcoords);

        offsetCirclesNormals   = this._circlesBufferOffsetNormals   = offsetCirclesVertices + circlesVertices.byteLength;
        offsetCirclesColors    = this._circlesBufferOffsetColors    = offsetCirclesNormals + circlesNormals.byteLength;
        offsetCirclesTexcoords = this._circlesBufferOffsetTexcoords = offsetCirclesColors + circlesColors.byteLength;

        if(!uniformRadius){
            // circle model: translate by positions and scale by radii
            i = -1;
            while(++i < numCircles){
                j = i * numSegments;
                k = -1;

                position = positions[i];
                radius   = radii[i];

                x = position.x;
                y = position.y;
                z = position.z;

                while(++k < numSegments){
                    m = j + k;
                    n = m * 3;
                    o = k * 3;
                    circlesVertices[n  ] = x + vertices[o  ] * radius;
                    circlesVertices[n+1] = y + vertices[o+1] * radius;
                    circlesVertices[n+2] = z + vertices[o+2] * radius;

                    circlesNormals[n  ] = normals[o  ];
                    circlesNormals[n+1] = normals[o+1];
                    circlesNormals[n+2] = normals[o+2];

                    n = m * 4;
                    circlesColors[n  ] = colors[o  ];
                    circlesColors[n+1] = colors[o+1];
                    circlesColors[n+2] = colors[o+2];
                    circlesColors[n+3] = colors[o+3];

                    n = m * 2;
                    circlesTexcoords[n  ] = texcoords[o  ];
                    circlesTexcoords[n+1] = texcoords[o+1];
                }
            }
        } else {
            // circle model: translate by positions and scale by uniform radius
            radius = radii;

            i = -1;
            while(++i < numCircles){
                j = i * numSegments;
                k = -1;

                position = positions[i];

                x = position.x;
                y = position.y;
                z = position.z;

                while(++k < numSegments){
                    m = j + k;
                    n = m * 3;
                    o = k * 3;
                    circlesVertices[n  ] = x + vertices[o  ] * radius;
                    circlesVertices[n+1] = y + vertices[o+1] * radius;
                    circlesVertices[n+2] = z + vertices[o+2] * radius;

                    circlesNormals[n  ] = normals[o  ];
                    circlesNormals[n+1] = normals[o+1];
                    circlesNormals[n+2] = normals[o+2];

                    n = m * 4;
                    circlesColors[n  ] = colors[o  ];
                    circlesColors[n+1] = colors[o+1];
                    circlesColors[n+2] = colors[o+2];
                    circlesColors[n+3] = colors[o+3];

                    n = m * 2;
                    circlesTexcoords[n  ] = texcoords[o  ];
                    circlesTexcoords[n+1] = texcoords[o+1];
                }
            }
        }

        var lenBuffer = circlesVertices.byteLength + circlesNormals.byteLength + circlesColors.byteLength + circlesTexcoords.byteLength;

        gl.bufferData(gl.ARRAY_BUFFER,lenBuffer, gl.DYNAMIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, offsetCirclesVertices, circlesVertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, offsetCirclesNormals, circlesNormals);
        gl.bufferSubData(gl.ARRAY_BUFFER, offsetCirclesColors, circlesColors);
        gl.bufferSubData(gl.ARRAY_BUFFER, offsetCirclesTexcoords, circlesTexcoords);

        var numIndices = indices.length;
        circlesIndices = this._circlesIndices = new Uint16Array(numIndices * numCircles);

        // gen indices
        i = -1;
        while(++i < numCircles){
            j = i * numIndices;
            k = i * numSegments;
            o = -1;
            while(++o < numIndices){
                circlesIndices[j + o] = indices[o] + k;
            }
        }

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, circlesIndices, gl.DYNAMIC_DRAW);

        this._circlesNumLast = numCircles;
        color.set(color4f);
    } else {
        //reassign buffer

        if(!uniformRadius){
            i = -1;
            while(++i < numCircles){
                j = i * numSegments;
                k = -1;

                position = positions[i];
                radius   = radii[i];

                x = position.x;
                y = position.y;
                z = position.z;

                while(++k < numSegments){
                    m = j + k;
                    n = m * 3;
                    o = k * 3;

                    circlesVertices[n  ] = x + vertices[o  ] * radius;
                    circlesVertices[n+1] = y + vertices[o+1] * radius;
                    circlesVertices[n+2] = z + vertices[o+2] * radius;
                }
            }
        } else {
            radius = radii;

            i = -1;
            while(++i < numCircles){
                j = i * numSegments;
                k = -1;

                position = positions[i];

                x = position.x;
                y = position.y;
                z = position.z;

                while(++k < numSegments){
                    m = j + k;
                    n = m * 3;
                    o = k * 3;
                    circlesVertices[n  ] = x + vertices[o  ] * radius;
                    circlesVertices[n+1] = y + vertices[o+1] * radius;
                    circlesVertices[n+2] = z + vertices[o+2] * radius;
                }
            }
        }

        gl.bufferSubData(gl.ARRAY_BUFFER, offsetCirclesVertices, circlesVertices);

        if(!color.equals(color4f)){
            i = -1;
            while(++i < numCircles){
                j = i * numSegments;
                k = -1;
                while(++k < numSegments){
                    m = j + k;
                    n = m * 4;
                    o = k * 4;

                    circlesColors[n  ] = colors[o  ];
                    circlesColors[n+1] = colors[o+1];
                    circlesColors[n+2] = colors[o+2];
                    circlesColors[n+3] = colors[o+3];
                }
            }
            gl.bufferSubData(gl.ARRAY_BUFFER, offsetCirclesColors, circlesColors);
            color.set(color4f);
        }
    }

    gl.vertexAttribPointer(attribLocationVertexPos, 3, gl.FLOAT, false, 0, offsetCirclesVertices);

    if(drawMode == gl.TRIANGLE_FAN){
        if(attribLocationVertexNormal != -1){
            gl.vertexAttribPointer(attribLocationVertexNormal, 3, gl.FLOAT, false, 0, offsetCirclesNormals);
        }
        if(attribLocationTexcoord != -1){
            gl.vertexAttribPointer(attribLocationTexcoord, 2, gl.FLOAT, false, 0, offsetCirclesTexcoords);
        }
    }

    /*
    if(drawMode == gl.LINE_LOOP){
        if(attribLocationVertexNormal != -1){
            gl.disableVertexAttribArray(attribLocationVertexNormal);
        }
        if(attribLocationTexcoord != -1){
            gl.disableVertexAttribArray(attribLocationTexcoord);
        }
    }*/

    if(attribLocationVertexColor != -1){
        gl.vertexAttribPointer(attribLocationVertexColor, 4, gl.FLOAT, false, 0, offsetCirclesColors);
    }

    this._applyMatrixUniforms();

    gl.drawElements(gl.TRIANGLES,indices.length * numCircles,gl.UNSIGNED_SHORT,0);

    if(drawMode == gl.LINE_LOOP){
        if(attribLocationVertexNormal != -1){
            gl.enableVertexAttribArray(attribLocationVertexNormal);
        }
        if(attribLocationTexcoord != -1){
            gl.enableVertexAttribArray(attribLocationTexcoord);
        }
    }

    if(prevVbo != vbo){
        gl.bindBuffer(gl.ARRAY_BUFFER, prevVbo);
    }

    if(prevIbo != ibo){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, prevIbo);
    }

}

/**
 * Draw a set of circles.
 * @param {Vec3[]} positions
 * @param {Number[]|Number} radii
 */

glDraw_Internal.prototype.drawCircles = function(positions, radii){
    this._drawCircles_Internal(positions,radii,this._gl.TRIANGLE_FAN);
}

/**
 * Draw a set of stroked circles.
 * @param {Vec3[]} positions
 * @param |Number[]|Number} radii
 */

/*
glDraw_Internal.prototype.drawCirclesStroked = function(positions,radii){
}
*/

/**
 * Set the number of segments used for drawing a circle and circles in a circle set.
 * @param {Number} numSegments - The number of segments
 */

glDraw_Internal.prototype.setCircleSegments = function(numSegments){
    this._circleNumSegments = this._circlesModelNumSegments = numSegments;
};

/**
 * Returns the current circle segments num.
 * @returns {Number}
 */

glDraw_Internal.prototype.getCircleSegments = function(){
    return this._circleNumSegments;
};


/*--------------------------------------------------------------------------------------------*/
//  Cube
/*--------------------------------------------------------------------------------------------*/

glDraw_Internal.prototype._updateCubeGeom = function(){
    var color = this._color,
        colorCube = this._cubeColorBufferData;

    if( colorCube[0] == color.r &&
        colorCube[1] == color.g &&
        colorCube[2] == color.b &&
        colorCube[3] == color.a){
        return;
    }

    var i = -1,j;
    while(++i < 6){
        j = i * 4 * 4;
        colorCube[j   ] = colorCube[j+ 4] = colorCube[j+ 8] = colorCube[j+12] = color.r;
        colorCube[j+ 1] = colorCube[j+ 5] = colorCube[j+ 9] = colorCube[j+13] = color.g;
        colorCube[j+ 2] = colorCube[j+ 6] = colorCube[j+10] = colorCube[j+14] = color.b;
        colorCube[j+ 3] = colorCube[j+ 7] = colorCube[j+11] = colorCube[j+15] = color.a;
    }

    var gl = this._gl;
    gl.bufferSubData(gl.ARRAY_BUFFER,0,colorCube);
};

glDraw_Internal.prototype._drawCube_Internal = function(size,drawMode){
    size = ObjectUtil.isUndefined(size) ? 1.0 : size < 0 ? 0 : size;

    this._updateProgramLocations();

    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;


    if(attribLocationVertexPos == -1){
        return;
    }

    var gl = this._gl;
    var prevABuffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    var prevEBuffer = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);


    gl.bindBuffer(gl.ARRAY_BUFFER, this._cubeVertexBuffer);
    gl.vertexAttribPointer(attribLocationVertexPos , 3, gl.FLOAT, false, 0, 0);


    /*
    if((drawMode == DrawMode.TRIANGLES || drawMode == DrawMode.COLORED) &&
       attribLocationVertexNormal != -1){
        gl.vertexAttribPointer(attribLocationVertexNormal , 3, gl.FLOAT, false, 0, this._cubeVertexBufferNormalOffset);
    }*/


    if(attribLocationVertexNormal != -1){
        if(drawMode == DrawMode.TRIANGLES || drawMode == DrawMode.COLORED){
            gl.vertexAttribPointer(attribLocationVertexNormal , 3, gl.FLOAT, false, 0, this._cubeVertexBufferNormalOffset);
        } else {
            gl.disableVertexAttribArray(attribLocationVertexNormal);
        }
    }

    if(attribLocationTexcoord != -1){
        if(drawMode == DrawMode.TRIANGLES){
            gl.vertexAttribPointer(attribLocationTexcoord, 2, gl.FLOAT, false, 0, this._cubeVertexBufferNormalTexcoord);
        } else {
            gl.disableVertexAttribArray(attribLocationTexcoord);
        }
    }


    if(attribLocationVertexColor != -1){
        if(drawMode != DrawMode.COLORED){
            gl.bindBuffer(gl.ARRAY_BUFFER, this._cubeColorBuffer);
            this._updateCubeGeom();
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._cubeColorBufferColored);
        }
        gl.vertexAttribPointer(attribLocationVertexColor, 4, gl.FLOAT, false, 0, 0);
    }

    glTrans.pushMatrix();
    if(size != 1){
        glTrans.scale3f(size,size,size);
    }

    this._applyMatrixUniforms();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this._cubeIndexBuffer);
    switch(drawMode){
        case DrawMode.TRIANGLES:
            gl.drawElements(gl.TRIANGLES,this._cubeIndicesTrianglesLength,gl.UNSIGNED_SHORT,0);
            break;
        case DrawMode.LINES:
            gl.drawElements(gl.LINES,this._cubeIndicesLinesLength,gl.UNSIGNED_SHORT,this._cubeIndexBufferOffsetLines);
            break;
        case DrawMode.POINTS:
            gl.drawElements(gl.POINTS,this._cubeIndicesPointsLength,gl.UNSIGNED_SHORT,this._cubeIndexBufferOffsetPoints);
            break;
        case DrawMode.COLORED:
            gl.drawElements(gl.TRIANGLES,this._cubeIndicesTrianglesLength,gl.UNSIGNED_SHORT,0);
            break;
    }

    glTrans.popMatrix();

    gl.bindBuffer(gl.ARRAY_BUFFER,prevABuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,prevEBuffer);


    if(attribLocationTexcoord != -1 && drawMode != DrawMode.TRIANGLES){
        gl.enableVertexAttribArray(attribLocationTexcoord);
    }

    if(attribLocationVertexNormal != -1 && drawMode != DrawMode.TRIANGLES && drawMode != DrawMode.COLORED){
        gl.enableVertexAttribArray(attribLocationVertexNormal);
    }
};

/**
 * Draw a solid cube.
 * @param {Number} [size=1.0] - The cube´s size
 */

glDraw_Internal.prototype.drawCube = function(size){
    this._drawCube_Internal(size, DrawMode.TRIANGLES);
};

/**
 * Draw the points of a cube.
 * @param {Number} [size=1.0] - The cube´s size
 */

glDraw_Internal.prototype.drawCubePoints = function(size){
    this._drawCube_Internal(size, DrawMode.POINTS);
};

/**
 * Draw a stroked cube.
 * @param {Number} [size=1.0] - The cube´s size
 */

glDraw_Internal.prototype.drawCubeStroked = function(size){
    this._drawCube_Internal(size, DrawMode.LINES);
};

/**
 * Draw a colored cube.
 * @param {Number} [size=1.0] - The cube´s size
 */

glDraw_Internal.prototype.drawCubeColored = function(size){
    this._drawCube_Internal(size, DrawMode.COLORED);
};


/*--------------------------------------------------------------------------------------------*/
//  Grid
/*--------------------------------------------------------------------------------------------*/

glDraw_Internal.prototype._updateGridData = function(subdivs,color){
    var gl = this._gl;
    var colors;

    if(this._gridSubdivs == subdivs){
        if(!color.equals(this._gridColorLast)){
            colors = this._gridColors;
            colors.set(ArrayUtil.createArray(colors.length / 4, color.r, color.g, color.b, color.a));
            gl.bufferSubData(gl.ARRAY_BUFFER, this._gridVertices.byteLength, colors);
            this._gridColorLast.set(color);
        }
        return;
    }

    var subdivs1 = subdivs + 1,
        num      = subdivs1 * subdivs1;

    var i, j, k;

    var vertices = this._gridVertices = new Float32Array(num * 3);
        colors   = this._gridColors   = new Float32Array(ArrayUtil.createArray(num,color.r,color.g,color.b,color.a));

    var step = 1.0 / (subdivs1 - 1);

    i = -1;
    while(++i < subdivs1){
        j = -1;
        while(++j < subdivs1){
            k = (i * subdivs1 + j) * 3;
            vertices[k  ] = -0.5 + step * j;
            vertices[k+1] = 0;
            vertices[k+2] = -0.5 + step * i;
        }
    }

    var indices = [];

    i = -1;
    while(++i < subdivs1){
        j = -1;
        while(++j < subdivs1){
            if(j < subdivs){
                k = i * subdivs1 + j;
                indices.push(k);
                indices.push(k+1);
            }
            if(i < subdivs){
                k = i * subdivs1 + j;
                indices.push(k);
                indices.push(k+subdivs1);
            }
        }
    }

    indices = new Uint16Array(indices);

    gl.bufferData(gl.ARRAY_BUFFER, vertices.byteLength + colors.byteLength, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
    gl.bufferSubData(gl.ARRAY_BUFFER, vertices.byteLength, colors);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

    this._gridColorLast.set(color);

    this._gridVboOffsetColors = vertices.byteLength;
    this._gridSubdivs = subdivs;

    this._gridIboLength = indices.length;
};


glDraw_Internal.prototype._drawGrid_Internal = function(size, subdivs,mode){
    size    = ObjectUtil.isUndefined(size)    ? VEC2_ONE : (size.x < 0 || size.y < 0) ? VEC2_ONE : size;
    subdivs = ObjectUtil.isUndefined(subdivs) ? 1.0 : (subdivs < 0) ? 0 : subdivs;

    var gl = this._gl;
    this._updateProgramLocations();

    var attribLocationVertexPos   = this._attribLocationVertexPos,
        attribLocationVertexNormal= this._attribLocationVertexNormal,
        attribLocationVertexColor = this._attribLocationVertexColor,
        attribLocationTexcoord    = this._attribLocationTexcoord;

    if(attribLocationVertexPos == -1){
        return;
    }
    if(attribLocationVertexNormal != -1){
        gl.disableVertexAttribArray(attribLocationVertexNormal);
    }
    if(attribLocationTexcoord != -1){
        gl.disableVertexAttribArray(attribLocationTexcoord);
    }

    var prevVbo = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
    var prevIbo = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
    var vbo = this._gridVbo;
    var ibo = this._gridIbo;

    glTrans.pushMatrix();
    glTrans.scale3f(size.x,1.0,size.y);

    if(prevVbo != vbo){
        gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    }
    if(prevVbo != ibo){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
    }
    this._updateGridData(subdivs,this._color);

    gl.vertexAttribPointer(this._attribLocationVertexPos , 3, gl.FLOAT, false, 0, 0);
    if(attribLocationVertexColor != -1){
        gl.vertexAttribPointer(this._attribLocationVertexColor, 4, gl.FLOAT, false, 0, this._gridVboOffsetColors);
    }

    this._applyMatrixUniforms();

    if(mode == gl.LINES){
        gl.drawElements(gl.LINES,this._gridIboLength,gl.UNSIGNED_SHORT,0);
    } else {
        gl.drawArrays(gl.POINTS,0,this._gridVertices.length / 3);
    }

    glTrans.popMatrix();

    if(attribLocationVertexNormal != -1){
        gl.enableVertexAttribArray(attribLocationVertexNormal);
    }

    if(attribLocationTexcoord != -1){
        gl.enableVertexAttribArray(attribLocationTexcoord);
    }

    if(vbo != prevVbo){
        gl.bindBuffer(gl.ARRAY_BUFFER,prevVbo);
    }
    if(ibo != prevIbo){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, prevIbo);
    }
}

/**
 * Draw a line grid on the xy-plane.
 * @param {Vec2} [size=Vec2.one()] - The grids´s size
 * @param {Number} [subdivs=1] - The number of subdivisions
 */

glDraw_Internal.prototype.drawGrid = function(size, subdivs){
    this._drawGrid_Internal(size,subdivs,this._gl.LINES);
};

/**
 * Draw a point grid on the xy-plane.
 * @param {Vec2} [size=Vec2.one()] - The grids´s size
 * @param {Number} [subdivs=1] - The number of subdivisions
 */

glDraw_Internal.prototype.drawGridPoints = function(size, subdivs){
    this._drawGrid_Internal(size,subdivs,this._gl.POINTS);
}




/*--------------------------------------------------------------------------------------------*/
// Orientation
/*--------------------------------------------------------------------------------------------*/

glDraw_Internal.prototype._updatePivotGeom = function(axisLength, headLength, headRadius){
    if(this._pivotAxisLength == axisLength &&
        this._pivotHeadLength == headLength &&
        this._pivotHeadRadius == headRadius){
        return;
    }

    var axis_head_length = axisLength - headLength;

    var gl       = this._gl;
    var vertices = this._bufferPivotVertex;

    var i,l;

    vertices[3]  = axisLength;
    vertices[10] = axisLength;
    vertices[17] = axisLength;

    var numVertices = 48;

    var offsetHeadX = 18;
    var offsetHeadY = offsetHeadX + numVertices;
    var offsetHeadZ = offsetHeadY + numVertices;

    this._genHead(headLength,headRadius,vertices,offsetHeadX);
    this._genHead(headLength,headRadius,vertices,offsetHeadY);
    this._genHead(headLength,headRadius,vertices,offsetHeadZ);

    var pi_2 = Math.PI * 0.5;

    var matrix0 = this._matrixTemp0;
    var matrix1 = this._matrixTemp1;
    var matrix2 = this._matrixTemp2;

    //  x

    matrix0.identity();
    matrix1.identity();
    matrix2.identity();

    var transX = Matrix44.fromRotation(0,-pi_2,0,matrix0).multiplied(
                 Matrix44.fromTranslation(axis_head_length,0,0,matrix1),
                 matrix2);

    i = offsetHeadX;
    l = i + numVertices;
    while(i < l){
        transX.multVec3AI(vertices,i);
        i += 3;
    }

    //  y

    matrix0.identity();
    matrix1.identity();
    matrix2.identity();

    var transY = Matrix44.fromRotation( pi_2, 0, 0, matrix0).multiplied(
                 Matrix44.fromTranslation(0,axis_head_length,0, matrix1),
                 matrix2);

    i = offsetHeadY;
    l = i + numVertices;
    while(i < l){
        transY.multVec3AI(vertices,i);
        i += 3;
    }

    //  z

    matrix0.identity();

    var transZ = Matrix44.fromTranslation(0,0,axis_head_length,matrix0);

    i = offsetHeadZ;
    l = i + numVertices;
    while(i < l){
        transZ.multVec3AI(vertices,i);
        i += 3;
    }

    //  push

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);

    this._pivotAxisLength = axisLength;
    this._pivotHeadLength = headLength;
    this._pivotHeadRadius = headRadius;
};

/**
 * Draw a pivot.
 * @param {Number} [axisLength=1.0] - The length of the xyz-axes
 * @param {Number} [headLength=0.125] - The length of the xyz-axes head
 * @param {Number} [headRadius=0.075] - The radius of the xyz-axes head
 */

glDraw_Internal.prototype.drawPivot = function(axisLength, headLength, headRadius){
    axisLength = ObjectUtil.isUndefined(axisLength) ? 1.0   : axisLength;
    headLength = ObjectUtil.isUndefined(headLength) ? 0.125 : headLength;
    headRadius = ObjectUtil.isUndefined(headRadius) ? 0.075 : headRadius;

    var gl = this._gl;
    this._updateProgramLocations();

    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;

    if(attribLocationVertexPos == -1){
        return;
    }
    if(attribLocationVertexNormal != -1){
        gl.disableVertexAttribArray(attribLocationVertexNormal);
    }
    if(attribLocationTexcoord != -1){
        gl.disableVertexAttribArray(attribLocationTexcoord);
    }

    var prevVbo = gl.getParameter(gl.ARRAY_BUFFER_BINDING),
        prevIbo = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
    var vbo = this._pivotVertexBuffer,
        ibo = this._bufferPivotIndex;

    if(prevVbo != vbo){
        gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    }
    if(prevVbo != ibo){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
    }

    this._updatePivotGeom(axisLength,headLength,headRadius);

    gl.vertexAttribPointer(this._attribLocationVertexPos , 3, gl.FLOAT, false, 0, 0);

    if(attribLocationVertexColor != -1){
        gl.bindBuffer(gl.ARRAY_BUFFER,this._pivotColorBuffer);
        gl.vertexAttribPointer(this._attribLocationVertexColor, 4, gl.FLOAT, false, 0,0);
    }

    this._applyMatrixUniforms();

    gl.drawArrays(gl.LINES,0,6);
    gl.drawElements(gl.TRIANGLES,this._pivotIndexBufferLength,gl.UNSIGNED_SHORT,0);

    if(vbo != prevVbo){
        gl.bindBuffer(gl.ARRAY_BUFFER,prevVbo);
    }
    if(ibo != prevIbo){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, prevIbo);
    }

    if(attribLocationVertexNormal != -1){
        gl.enableVertexAttribArray(attribLocationVertexNormal);
    }
    if(attribLocationTexcoord != -1){
        gl.enableVertexAttribArray(attribLocationTexcoord);
    }
};

/**
 * Draws an orhonormal basis.
 * @param {OnB} onb
 */

glDraw_Internal.prototype.drawOnB = function(onb){
    glTrans.pushMatrix();
        glTrans.multMatrix(this._matrixTemp0.identity().setRotationFromOnB(onb.u,onb.v,onb.w));
        this.drawPivot(0.125,0.05,0.025);
    glTrans.popMatrix();
}

/*--------------------------------------------------------------------------------------------*/
//  Mesh
/*--------------------------------------------------------------------------------------------*/

/**
 *
 * @param mesh
 * @param length
 */

glDraw_Internal.prototype.drawMesh = function(mesh, length, usage){
    var gl = this._gl;
    this._updateProgramLocations();

    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;

    var format = mesh.getFormat();

    if(attribLocationVertexPos == -1 || format.vertexSize == 0 || mesh.vertices.length == 0){
        return;
    }

    usage = usage || gl.TRIANGLES;

    var attribNormalValid   = attribLocationVertexNormal != -1,
        attribColorValid    = attribLocationVertexColor  != -1,
        attribTexcoordValid = attribLocationTexcoord     != -1;

    var vertices  = mesh.vertices,
        colors    = mesh.colors,
        normals   = mesh.normals,
        texcoords = mesh.texcoords,
        indices   = mesh.indices;

    var verticesLen = vertices.byteLength,
        colorsLen   = colors.byteLength * attribColorValid,
        normalsLen  = normals.byteLength * attribNormalValid,
        texcoordLen = texcoords.byteLength * attribTexcoordValid,
        indicesLen  = indices.byteLength;

    var bufferLen = verticesLen + colorsLen + normalsLen + texcoordLen;

    var prevVbo = gl.getParameter(gl.ARRAY_BUFFER_BINDING),
        prevIbo = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);

    var bufferMesh = this._bufferMesh,
        bufferMeshIndices = this._bufferMeshIndices;

    if(prevVbo != bufferMesh){
        gl.bindBuffer(gl.ARRAY_BUFFER,bufferMesh);
        this._bufferMeshIndicesLength = 0;
    }

    var offsetVertices  = 0,
        offsetNormals   = offsetVertices + verticesLen,
        offsetColors    = offsetNormals + normalsLen,
        offsetTexcoords = offsetColors + colorsLen;

    if(bufferLen > this._bufferMeshLength){
        gl.bufferData(gl.ARRAY_BUFFER, bufferLen, gl.DYNAMIC_DRAW);
        this._bufferMeshLength = bufferLen;
    }

    gl.bufferSubData(gl.ARRAY_BUFFER, offsetVertices, vertices);
    gl.vertexAttribPointer(attribLocationVertexPos,3,gl.FLOAT,false,0,offsetVertices);

    if(attribColorValid){
        if(colorsLen == 0){
            gl.disableVertexAttribArray(attribLocationVertexColor);
        } else {
            gl.bufferSubData(gl.ARRAY_BUFFER, offsetColors, colors);
            gl.vertexAttribPointer(attribLocationVertexColor,4,gl.FLOAT,false,0,offsetColors);
        }
    }

    if(attribNormalValid){
        if(normalsLen == 0){
            gl.disableVertexAttribArray(attribLocationVertexNormal);
        } else {
            gl.bufferSubData(gl.ARRAY_BUFFER, offsetNormals, normals);
            gl.vertexAttribPointer(attribLocationVertexNormal, 3, gl.FLOAT, false, 0, offsetNormals);
        }
    }

    if(attribTexcoordValid){
        if(texcoordLen == 0){
            gl.disableVertexAttribArray(attribLocationTexcoord);
        } else {
            gl.bufferSubData(gl.ARRAY_BUFFER, offsetTexcoords, texcoords);
            gl.vertexAttribPointer(attribLocationTexcoord, 2, gl.FLOAT, false, 0, offsetTexcoords );
        }
    }

    this._applyMatrixUniforms(true);

    if(mesh.hasIndices()){
        if(prevIbo != bufferMeshIndices){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,bufferMeshIndices);
            if(indicesLen > this._bufferMeshIndicesLength) {
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesLen, gl.DYNAMIC_DRAW);
                this._bufferMeshIndicesLength  = indicesLen;
            }
            gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, mesh.indices);
        }
        gl.drawElements(usage,(length || mesh.indices.length),mesh.format.indexFormat,0);
    } else {
        gl.drawArrays(usage,0,length || (vertices.length / 3));
    }

    if(bufferMesh != prevVbo){
        gl.bindBuffer(gl.ARRAY_BUFFER,prevVbo);
    }
    if(mesh.hasIndices()){
        if(bufferMeshIndices != prevIbo){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, prevIbo);
        }
    }

    if(attribColorValid && colorsLen == 0){
        gl.enableVertexAttribArray(attribLocationVertexColor);
    }
    if(attribNormalValid && normalsLen == 0){
        gl.enableVertexAttribArray(attribLocationVertexNormal);
    }
    if(attribTexcoordValid && texcoordLen == 0){
        gl.enableVertexAttribArray(attribLocationTexcoord);
    }
};

/*--------------------------------------------------------------------------------------------*/
//  VboMesh
/*--------------------------------------------------------------------------------------------*/

glDraw_Internal.prototype.drawVboMesh = function(mesh,length){
    var gl = this._gl;
    this._updateProgramLocations();

    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;

    var attribNormalValid   = attribLocationVertexNormal != -1,
        attribColorValid    = attribLocationVertexColor  != -1,
        attribTexcoordValid = attribLocationTexcoord     != -1;

    var vbo = mesh._vbo,
        ibo = mesh._ibo,
        obj = mesh._obj;

    var format = obj.getFormat();

    var prevVbo = gl.getParameter(gl.ARRAY_BUFFER_BINDING),
        prevIbo = null;

    var vboDiffers = !vbo.equalsGLObject(prevVbo),
        iboDiffers = false;

    if(ibo){
        prevIbo = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
        iboDiffers = !ibo.equalsGLObject(prevIbo);
    }

    if(vboDiffers){
        vbo.bind();
    }
    if(iboDiffers){
        ibo.bind();
    }

    var vertices = obj.vertices,
        normals  = obj.normals,
        colors   = obj.colors,
        texcoords= obj.texcoords;

    var verticesLen = vertices.byteLength,
        normalsLen  = normals.byteLength,
        colorsLen   = colors.byteLength,
        texcoordsLen= texcoords.byteLength;

    if(mesh.isDirty()){
        mesh._offsetNormals   = mesh._offsetVertices + verticesLen;
        mesh._offsetColors    = mesh._offsetNormals + normalsLen;
        mesh._offsetTexcoords = mesh._offsetColors + colorsLen;
    }

    var offsetVertices = mesh._offsetVertices,
        offsetNormals  = mesh._offsetNormals,
        offsetColors   = mesh._offsetColors,
        offsetTexcoords= mesh._offsetTexcoords;

    if(mesh._verticesDirty){
        vbo.bufferSubData(offsetVertices,vertices);
        mesh._verticesDirty = false;
    }

    gl.vertexAttribPointer(attribLocationVertexPos,format.vertexSize,gl.FLOAT,false,0,offsetVertices);

    if(attribNormalValid){
        if(normalsLen == 0){
            gl.disableVertexAttribArray(attribLocationVertexNormal);
        } else {
            if(mesh._normalsDirty){
                vbo.bufferSubData(offsetNormals,normals);
                mesh._normalsDirty = false;
            }
            gl.vertexAttribPointer(attribLocationVertexNormal,format.normalSize,gl.FLOAT,false,0,offsetNormals);
        }
    }

    if(attribColorValid){
        if(colorsLen == 0){
            gl.disableVertexAttribArray(attribLocationVertexColor);
        } else {
            if(mesh._colorsDirty){
                vbo.bufferSubData(offsetColors,colors);
                mesh._colorsDirty = false;
            }
            gl.vertexAttribPointer(attribLocationVertexColor,format.colorSize,gl.FLOAT,false,0,offsetColors);
        }
    }

    if(attribTexcoordValid){
        if(texcoordsLen == 0){
            gl.disableVertexAttribArray(attribLocationTexcoord);
        } else {
            if(mesh._texcoordsDirty){
                vbo.bufferSubData(offsetTexcoords,texcoords);
                mesh._texcoordsDirty = false;
            }
            gl.vertexAttribPointer(attribLocationTexcoord,format.texcoordSize,gl.FLOAT,false,0,offsetTexcoords);
        }
    }


    if(obj._transform){
        glTrans.pushMatrix();
        glTrans.multMatrix(obj._transform);
    }

    this._applyMatrixUniforms(true);

    if(obj._transform){
        glTrans.popMatrix();
    }

    if(ibo){
        var indices = obj.indices;

        if(mesh._indicesDirty){
            ibo.bufferSubData(0,indices);
            mesh._indicesDirty = false;
        }
        gl.drawElements(mesh._usage,length || indices.length,format.indexFormat,0);
    } else {
        gl.drawArrays(mesh._usage,0,length || (vertices.length / format.vertexSize));
    }

    if(attribNormalValid && normalsLen == 0){
        gl.enableVertexAttribArray(attribLocationVertexNormal);
    }

    if(attribColorValid && colorsLen == 0){
        gl.enableVertexAttribArray(attribLocationVertexColor);
    }

    if(attribTexcoordValid && texcoordsLen == 0){
        gl.enableVertexAttribArray(attribLocationTexcoord);
    }
    if(vboDiffers){
        gl.bindBuffer(gl.ARRAY_BUFFER, prevVbo);
    }
    if(iboDiffers){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, prevIbo);
    }
}

glDraw_Internal.prototype.drawVboMeshes = function(vboMeshes){
    var gl = this._gl;
    this._updateProgramLocations();

    var attribLocationVertexPos    = this._attribLocationVertexPos,
        attribLocationVertexNormal = this._attribLocationVertexNormal,
        attribLocationVertexColor  = this._attribLocationVertexColor,
        attribLocationTexcoord     = this._attribLocationTexcoord;

    if(attribLocationVertexPos == -1 || vboMeshes.length == 0){
        return;
    }

    var attribNormalValid   = attribLocationVertexNormal != -1,
        attribColorValid    = attribLocationVertexColor  != -1,
        attribTexcoordValid = attribLocationTexcoord     != -1;

    var prevVbo = gl.getParameter(gl.ARRAY_BUFFER_BINDING),
        prevIbo = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);

    var uniformLocationModelViewMatrix = this._uniformLocationModelViewMatrix,
        globalTransform = new Float32Array(glTrans.getModelViewMatrixF32()),
        prevHadLocalTransform = false;

    gl.uniformMatrix4fv(this._uniformLocationProjectionMatrix, false, glTrans.getProjectionMatrixF32());
    gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, globalTransform);

    var mesh, meshVbo, meshIbo, meshObj, meshFormat;

    var vertices,colors,normals,texcoords,indices;
    var verticesLen,colorsLen,normalsLen,texcoordsLen,indicesLen;
    var offsetVertices,offsetNormals,offsetColors,offsetTexcoords;
    var attribNormalEnabled,attribColorEnabled,attribTexcoordEnabled;

    var i = -1, l = vboMeshes.length;

    if(attribNormalValid && attribColorValid && attribTexcoordValid){
        attribNormalEnabled = attribColorEnabled = attribTexcoordEnabled = true;
        while(++i < l){
            mesh = vboMeshes[i];

            meshVbo    = mesh._vbo;
            meshIbo    = mesh._ibo;
            meshObj    = mesh._obj;
            meshFormat = meshObj.getFormat();

            vertices  = meshObj.vertices;
            normals   = meshObj.normals;
            colors    = meshObj.colors;
            texcoords = meshObj.texcoords;

            verticesLen  = vertices.byteLength;
            normalsLen   = normals.byteLength;
            colorsLen    = colors.byteLength;
            texcoordsLen = texcoords.byteLength;

            if(verticesLen == 0){
                continue;
            }


            meshVbo.bind();
            if(meshIbo){
                meshIbo.bind();
            }

            if(mesh.isDirty()){
                mesh._offsetNormals   = mesh._offsetVertices + verticesLen;
                mesh._offsetColors    = mesh._offsetNormals + normalsLen;
                mesh._offsetTexcoords = mesh._offsetColors + colorsLen;
            }

            offsetVertices = mesh._offsetVertices;
            offsetNormals  = mesh._offsetNormals;
            offsetColors   = mesh._offsetColors;
            offsetTexcoords= mesh._offsetTexcoords;

            if(mesh._verticesDirty){
                meshVbo.bufferSubData(offsetVertices,vertices);
                mesh._verticesDirty = false;
            }

            gl.vertexAttribPointer(attribLocationVertexPos,meshFormat.vertexSize,gl.FLOAT,false,0,offsetVertices);

            if(normalsLen == 0){
                gl.disableVertexAttribArray(attribLocationVertexNormal);
            } else {
                if(!attribNormalEnabled){
                    gl.enableVertexAttribArray(attribLocationVertexNormal);
                }
                if(mesh._normalsDirty){
                    meshVbo.bufferSubData(offsetNormals,normals);
                    mesh._normalsDirty = false;
                }
                gl.vertexAttribPointer(attribLocationVertexNormal,meshFormat.normalSize,gl.FLOAT,false,0,offsetNormals);
            }

            if(colorsLen == 0){
                gl.disableVertexAttribArray(attribLocationVertexNormal);
            } else {
                if(!attribColorEnabled){
                    gl.enableVertexAttribArray(attribLocationVertexColor);
                }
                if(mesh._colorsDirty){
                    meshVbo.bufferSubData(offsetColors,colors);
                    mesh._colorsDirty = false;
                }
                gl.vertexAttribPointer(attribLocationVertexColor,meshFormat.colorSize,gl.FLOAT,false,0,offsetColors);
            }

            if(texcoordsLen == 0){
                gl.disableVertexAttribArray(attribLocationTexcoord);
            } else {
                if(!attribTexcoordEnabled){
                    gl.enableVertexAttribArray(attribLocationTexcoord);
                }
                if(mesh._texcoordsDirty){
                    meshVbo.bufferSubData(offsetTexcoords,texcoords);
                    mesh._texcoordsDirty = false;
                }
                gl.vertexAttribPointer(attribLocationTexcoord,meshFormat.texcoordSize,gl.FLOAT,false,0,offsetTexcoords);
            }

            if(meshObj._transform){
                glTrans.pushMatrix();
                glTrans.multMatrix(meshObj._transform);
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, glTrans.getModelViewMatrixF32());
                prevHadLocalTransform = true;
            } else if(prevHadLocalTransform) {
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, globalTransform);
                prevHadLocalTransform = false;
            }


            if(meshIbo){
                indices = meshObj.indices;
                if(mesh._indicesDirty){
                    meshIbo.bufferSubData(0,indices);
                    mesh._indicesDirty = false;
                }
                gl.drawElements(mesh._usage,indices.length,meshFormat.indexFormat,0);
            } else {
                gl.drawArrays(mesh._usage,0,(vertices.length / meshFormat.vertexSize));
            }

            if(meshObj._transform){
                glTrans.popMatrix();
            }

            attribNormalEnabled   = normalsLen != 0;
            attribColorEnabled    = colorsLen  != 0;
            attribTexcoordEnabled = texcoordsLen != 0;
        }

        if(!attribNormalEnabled){
            gl.enableVertexAttribArray(attribLocationVertexNormal);
        }
        if(!attribColorEnabled){
            gl.enableVertexAttribArray(attribLocationVertexColor);
        }
        if(!attribTexcoordEnabled){
            gl.enableVertexAttribArray(attribLocationTexcoord);
        }

    } else if(attribNormalValid && attribColorValid){
        attribNormalEnabled = attribColorEnabled = true;

        while(++i < l){
            mesh = vboMeshes[i];

            meshVbo    = mesh._vbo;
            meshIbo    = mesh._ibo;
            meshObj    = mesh._obj;
            meshFormat = meshObj.getFormat();

            vertices  = meshObj.vertices;
            normals   = meshObj.normals;
            colors    = meshObj.colors;
            texcoords = meshObj.texcoords;

            verticesLen  = vertices.byteLength;
            normalsLen   = normals.byteLength;
            colorsLen    = colors.byteLength;
            texcoordsLen = texcoords.byteLength;

            if(verticesLen == 0){
                continue;
            }

            meshVbo.bind();
            if(meshIbo){
                meshIbo.bind();
            }

            if(mesh.isDirty()){
                mesh._offsetNormals   = mesh._offsetVertices + verticesLen;
                mesh._offsetColors    = mesh._offsetNormals + normalsLen;
                mesh._offsetTexcoords = mesh._offsetColors + colorsLen;
            }

            offsetVertices = mesh._offsetVertices;
            offsetNormals  = mesh._offsetNormals;
            offsetColors   = mesh._offsetColors;

            if(mesh._verticesDirty){
                meshVbo.bufferSubData(offsetVertices,vertices);
                mesh._verticesDirty = false;
            }

            gl.vertexAttribPointer(attribLocationVertexPos,meshFormat.vertexSize,gl.FLOAT,false,0,offsetVertices);

            if(normalsLen == 0){
                gl.disableVertexAttribArray(attribLocationVertexNormal);
            } else {
                if(!attribNormalEnabled){
                    gl.enableVertexAttribArray(attribLocationVertexNormal);
                }
                if(mesh._normalsDirty){
                    meshVbo.bufferSubData(offsetNormals,normals);
                    mesh._normalsDirty = false;
                }
                gl.vertexAttribPointer(attribLocationVertexNormal,meshFormat.normalSize,gl.FLOAT,false,0,offsetNormals);
            }

            if(colorsLen == 0){
                gl.disableVertexAttribArray(attribLocationVertexNormal);
            } else {
                if(!attribColorEnabled){
                    gl.enableVertexAttribArray(attribLocationVertexColor);
                }
                if(mesh._colorsDirty){
                    meshVbo.bufferSubData(offsetColors,colors);
                    mesh._colorsDirty = false;
                }
                gl.vertexAttribPointer(attribLocationVertexColor,meshFormat.colorSize,gl.FLOAT,false,0,offsetColors);
            }

            if(meshObj._transform){
                glTrans.pushMatrix();
                glTrans.multMatrix(meshObj._transform);
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, glTrans.getModelViewMatrixF32());
                prevHadLocalTransform = true;
            } else if(prevHadLocalTransform) {
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, globalTransform);
                prevHadLocalTransform = false;
            }


            if(meshIbo){
                indices = meshObj.indices;
                if(mesh._indicesDirty){
                    meshIbo.bufferSubData(0,indices);
                    mesh._indicesDirty = false;
                }
                gl.drawElements(mesh._usage,indices.length,meshFormat.indexFormat,0);
            } else {
                gl.drawArrays(mesh._usage,0,(vertices.length / meshFormat.vertexSize));
            }

            if(meshObj._transform){
                glTrans.popMatrix();
            }

            attribNormalEnabled   = normalsLen != 0;
            attribColorEnabled    = colorsLen  != 0;
        }

        if(!attribNormalEnabled){
            gl.enableVertexAttribArray(attribLocationVertexNormal);
        }
        if(!attribColorEnabled){
            gl.enableVertexAttribArray(attribLocationVertexColor);
        }

    } else if(attribColorValid && attribTexcoordValid){
        attribColorEnabled = attribTexcoordEnabled = true;

        while(++i < l){
            mesh = vboMeshes[i];

            meshVbo    = mesh._vbo;
            meshIbo    = mesh._ibo;
            meshObj    = mesh._obj;
            meshFormat = meshObj.getFormat();

            vertices  = meshObj.vertices;
            normals   = meshObj.normals;
            colors    = meshObj.colors;
            texcoords = meshObj.texcoords;

            verticesLen  = vertices.byteLength;
            normalsLen   = normals.byteLength;
            colorsLen    = colors.byteLength;
            texcoordsLen = texcoords.byteLength;

            if(verticesLen == 0){
                continue;
            }

            meshVbo.bind();
            if(meshIbo){
                meshIbo.bind();
            }

            if(mesh.isDirty()){
                mesh._offsetNormals   = mesh._offsetVertices + verticesLen;
                mesh._offsetColors    = mesh._offsetNormals + normalsLen;
                mesh._offsetTexcoords = mesh._offsetColors + colorsLen;
            }

            offsetVertices = mesh._offsetVertices;
            offsetColors   = mesh._offsetColors;
            offsetTexcoords= mesh._offsetTexcoords;

            if(mesh._verticesDirty){
                meshVbo.bufferSubData(offsetVertices,vertices);
                mesh._verticesDirty = false;
            }

            gl.vertexAttribPointer(attribLocationVertexPos,meshFormat.vertexSize,gl.FLOAT,false,0,offsetVertices);

            if(colorsLen == 0){
                gl.disableVertexAttribArray(attribLocationVertexNormal);
            } else {
                if(!attribColorEnabled){
                    gl.enableVertexAttribArray(attribLocationVertexColor);
                }
                if(mesh._colorsDirty){
                    meshVbo.bufferSubData(offsetColors,colors);
                    mesh._colorsDirty = false;
                }
                gl.vertexAttribPointer(attribLocationVertexColor,meshFormat.colorSize,gl.FLOAT,false,0,offsetColors);
            }

            if(texcoordsLen == 0){
                gl.disableVertexAttribArray(attribLocationTexcoord);
            } else {
                if(!attribTexcoordEnabled){
                    gl.enableVertexAttribArray(attribLocationTexcoord);
                }
                if(mesh._texcoordsDirty){
                    meshVbo.bufferSubData(offsetTexcoords,texcoords);
                    mesh._texcoordsDirty = false;
                }
                gl.vertexAttribPointer(attribLocationTexcoord,meshFormat.texcoordSize,gl.FLOAT,false,0,offsetTexcoords);
            }

            if(meshObj._transform){
                glTrans.pushMatrix();
                glTrans.multMatrix(meshObj._transform);
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, glTrans.getModelViewMatrixF32());
                prevHadLocalTransform = true;
            } else if(prevHadLocalTransform) {
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, globalTransform);
                prevHadLocalTransform = false;
            }

            if(meshIbo){
                indices = meshObj.indices;
                if(mesh._indicesDirty){
                    meshIbo.bufferSubData(0,indices);
                    mesh._indicesDirty = false;
                }
                gl.drawElements(mesh._usage,indices.length,meshFormat.indexFormat,0);
            } else {
                gl.drawArrays(mesh._usage,0,(vertices.length / meshFormat.vertexSize));
            }

            if(meshObj._transform){
                glTrans.popMatrix();
            }

            attribNormalEnabled   = normalsLen != 0;
            attribTexcoordEnabled = texcoordsLen != 0;
        }
        if(!attribNormalEnabled){
            gl.enableVertexAttribArray(attribLocationVertexNormal);
        }
        if(!attribTexcoordEnabled){
            gl.enableVertexAttribArray(attribLocationTexcoord);
        }

    } else if(attribTexcoordValid && attribNormalValid){
        attribTexcoordEnabled = attribNormalValid = true;

        while(++i < l){
            mesh = vboMeshes[i];

            meshVbo    = mesh._vbo;
            meshIbo    = mesh._ibo;
            meshObj    = mesh._obj;
            meshFormat = meshObj.getFormat();

            vertices  = meshObj.vertices;
            normals   = meshObj.normals;
            colors    = meshObj.colors;
            texcoords = meshObj.texcoords;

            verticesLen  = vertices.byteLength;
            normalsLen   = normals.byteLength;
            colorsLen    = colors.byteLength;
            texcoordsLen = texcoords.byteLength;

            if(verticesLen == 0){
                continue;
            }

            meshVbo.bind();
            if(meshIbo){
                meshIbo.bind();
            }

            if(mesh.isDirty()){
                mesh._offsetNormals   = mesh._offsetVertices + verticesLen;
                mesh._offsetColors    = mesh._offsetNormals + normalsLen;
                mesh._offsetTexcoords = mesh._offsetColors + colorsLen;
            }

            offsetVertices = mesh._offsetVertices;
            offsetNormals  = mesh._offsetNormals;
            offsetTexcoords= mesh._offsetTexcoords;

            if(mesh._verticesDirty){
                meshVbo.bufferSubData(offsetVertices,vertices);
                mesh._verticesDirty = false;
            }

            gl.vertexAttribPointer(attribLocationVertexPos,meshFormat.vertexSize,gl.FLOAT,false,0,offsetVertices);

            if(texcoordsLen == 0){
                gl.disableVertexAttribArray(attribLocationTexcoord);
            } else {
                if(!attribTexcoordEnabled){
                    gl.enableVertexAttribArray(attribLocationTexcoord);
                }
                if(mesh._texcoordsDirty){
                    meshVbo.bufferSubData(offsetTexcoords,texcoords);
                    mesh._texcoordsDirty = false;
                }
                gl.vertexAttribPointer(attribLocationTexcoord,meshFormat.texcoordSize,gl.FLOAT,false,0,offsetTexcoords);
            }

            if(normalsLen == 0){
                gl.disableVertexAttribArray(attribLocationVertexNormal);
            } else {
                if(!attribNormalEnabled){
                    gl.enableVertexAttribArray(attribLocationVertexNormal);
                }
                if(mesh._normalsDirty){
                    meshVbo.bufferSubData(offsetNormals,normals);
                    mesh._normalsDirty = false;
                }
                gl.vertexAttribPointer(attribLocationVertexNormal,meshFormat.normalSize,gl.FLOAT,false,0,offsetNormals);
            }

            if(meshObj._transform){
                glTrans.pushMatrix();
                glTrans.multMatrix(meshObj._transform);
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, glTrans.getModelViewMatrixF32());
                prevHadLocalTransform = true;
            } else if(prevHadLocalTransform) {
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, globalTransform);
                prevHadLocalTransform = false;
            }

            if(meshIbo){
                indices = meshObj.indices;
                if(mesh._indicesDirty){
                    meshIbo.bufferSubData(0,indices);
                    mesh._indicesDirty = false;
                }
                gl.drawElements(mesh._usage,indices.length,meshFormat.indexFormat,0);
            } else {
                gl.drawArrays(mesh._usage,0,(vertices.length / meshFormat.vertexSize));
            }

            if(meshObj._transform){
                glTrans.popMatrix();
            }

            attribTexcoordEnabled = texcoordsLen != 0;
            attribNormalEnabled   = normalsLen != 0;
        }
        if(!attribTexcoordEnabled){
            gl.enableVertexAttribArray(attribLocationTexcoord);
        }
        if(!attribNormalValid){
            gl.enableVertexAttribArray(attribLocationVertexNormal);
        }

    } else if(attribNormalValid){
        attribNormalEnabled = true;

        while(++i < l){
            mesh = vboMeshes[i];

            meshVbo    = mesh._vbo;
            meshIbo    = mesh._ibo;
            meshObj    = mesh._obj;
            meshFormat = meshObj.getFormat();

            vertices  = meshObj.vertices;
            normals   = meshObj.normals;
            colors    = meshObj.colors;
            texcoords = meshObj.texcoords;

            verticesLen  = vertices.byteLength;
            normalsLen   = normals.byteLength;
            colorsLen    = colors.byteLength;
            texcoordsLen = texcoords.byteLength;

            if(verticesLen == 0){
                continue;
            }

            meshVbo.bind();
            if(meshIbo){
                meshIbo.bind();
            }

            if(mesh.isDirty()){
                mesh._offsetNormals   = mesh._offsetVertices + verticesLen;
                mesh._offsetColors    = mesh._offsetNormals + normalsLen;
                mesh._offsetTexcoords = mesh._offsetColors + colorsLen;
            }

            offsetVertices = mesh._offsetVertices;
            offsetNormals  = mesh._offsetNormals;

            if(mesh._verticesDirty){
                meshVbo.bufferSubData(offsetVertices,vertices);
                mesh._verticesDirty = false;
            }

            gl.vertexAttribPointer(attribLocationVertexPos,meshFormat.vertexSize,gl.FLOAT,false,0,offsetVertices);

            if(normalsLen == 0){
                gl.disableVertexAttribArray(attribLocationVertexNormal);
            } else {
                if(!attribNormalEnabled){
                    gl.enableVertexAttribArray(attribLocationVertexNormal);
                }
                if(mesh._normalsDirty){
                    meshVbo.bufferSubData(offsetNormals,normals);
                    mesh._normalsDirty = false;
                }
                gl.vertexAttribPointer(attribLocationVertexNormal,meshFormat.normalSize,gl.FLOAT,false,0,offsetNormals);
            }

            if(meshObj._transform){
                glTrans.pushMatrix();
                glTrans.multMatrix(meshObj._transform);
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, glTrans.getModelViewMatrixF32());
                prevHadLocalTransform = true;
            } else if(prevHadLocalTransform) {
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, globalTransform);
                prevHadLocalTransform = false;
            }

            if(meshIbo){
                indices = meshObj.indices;
                if(mesh._indicesDirty){
                    meshIbo.bufferSubData(0,indices);
                    mesh._indicesDirty = false;
                }
                gl.drawElements(mesh._usage,indices.length,meshFormat.indexFormat,0);
            } else {
                gl.drawArrays(mesh._usage,0,(vertices.length / meshFormat.vertexSize));
            }

            if(meshObj._transform){
                glTrans.popMatrix();
            }

            attribNormalEnabled   = normalsLen != 0;
        }

    } else if(attribColorValid){
        attribColorEnabled = true;

        while(++i < l){
            mesh = vboMeshes[i];

            meshVbo    = mesh._vbo;
            meshIbo    = mesh._ibo;
            meshObj    = mesh._obj;
            meshFormat = meshObj.getFormat();

            vertices  = meshObj.vertices;
            normals   = meshObj.normals;
            colors    = meshObj.colors;
            texcoords = meshObj.texcoords;

            verticesLen  = vertices.byteLength;
            normalsLen   = normals.byteLength;
            colorsLen    = colors.byteLength;
            texcoordsLen = texcoords.byteLength;

            if(verticesLen == 0){
                continue;
            }

            meshVbo.bind();
            if(meshIbo){
                meshIbo.bind();
            }

            if(mesh.isDirty()){
                mesh._offsetNormals   = mesh._offsetVertices + verticesLen;
                mesh._offsetColors    = mesh._offsetNormals + normalsLen;
                mesh._offsetTexcoords = mesh._offsetColors + colorsLen;
            }

            offsetVertices = mesh._offsetVertices;
            offsetColors   = mesh._offsetColors;

            if(mesh._verticesDirty){
                meshVbo.bufferSubData(offsetVertices,vertices);
                mesh._verticesDirty = false;
            }

            gl.vertexAttribPointer(attribLocationVertexPos,meshFormat.vertexSize,gl.FLOAT,false,0,offsetVertices);

            if(colorsLen == 0){
                gl.disableVertexAttribArray(attribLocationVertexNormal);
            } else {
                if(!attribColorEnabled){
                    gl.enableVertexAttribArray(attribLocationVertexColor);
                }
                if(mesh._colorsDirty){
                    meshVbo.bufferSubData(offsetColors,colors);
                    mesh._colorsDirty = false;
                }
                gl.vertexAttribPointer(attribLocationVertexColor,meshFormat.colorSize,gl.FLOAT,false,0,offsetColors);
            }

            if(meshObj._transform){
                glTrans.pushMatrix();
                glTrans.multMatrix(meshObj._transform);
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, glTrans.getModelViewMatrixF32());
                prevHadLocalTransform = true;
            } else if(prevHadLocalTransform) {
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, globalTransform);
                prevHadLocalTransform = false;
            }

            if(meshIbo){
                indices = meshObj.indices;
                if(mesh._indicesDirty){
                    meshIbo.bufferSubData(0,indices);
                    mesh._indicesDirty = false;
                }
                gl.drawElements(mesh._usage,indices.length,meshFormat.indexFormat,0);
            } else {
                gl.drawArrays(mesh._usage,0,(vertices.length / meshFormat.vertexSize));
            }

            if(meshObj._transform){
                glTrans.popMatrix();
            }

            attribColorEnabled = colorsLen != 0;
        }
        if(!attribColorEnabled){
            gl.enableVertexAttribArray(attribLocationVertexColor);
        }
    } else if(attribTexcoordValid){
        attribTexcoordEnabled = true;

        while(++i < l){
            mesh = vboMeshes[i];

            meshVbo    = mesh._vbo;
            meshIbo    = mesh._ibo;
            meshObj    = mesh._obj;
            meshFormat = meshObj.getFormat();

            vertices  = meshObj.vertices;
            normals   = meshObj.normals;
            colors    = meshObj.colors;
            texcoords = meshObj.texcoords;

            verticesLen  = vertices.byteLength;
            normalsLen   = normals.byteLength;
            colorsLen    = colors.byteLength;
            texcoordsLen = texcoords.byteLength;

            if(verticesLen == 0){
                continue;
            }

            meshVbo.bind();
            if(meshIbo){
                meshIbo.bind();
            }

            if(mesh.isDirty()){
                mesh._offsetNormals   = mesh._offsetVertices + verticesLen;
                mesh._offsetColors    = mesh._offsetNormals + normalsLen;
                mesh._offsetTexcoords = mesh._offsetColors + colorsLen;
            }

            offsetVertices = mesh._offsetVertices;
            offsetTexcoords= mesh._offsetTexcoords;

            if(mesh._verticesDirty){
                meshVbo.bufferSubData(offsetVertices,vertices);
                mesh._verticesDirty = false;
            }

            gl.vertexAttribPointer(attribLocationVertexPos,meshFormat.vertexSize,gl.FLOAT,false,0,offsetVertices);

            if(texcoordsLen == 0){
                gl.disableVertexAttribArray(attribLocationTexcoord);
            } else {
                if(!attribTexcoordEnabled){
                    gl.enableVertexAttribArray(attribLocationTexcoord);
                }
                if(mesh._texcoordsDirty){
                    meshVbo.bufferSubData(offsetTexcoords,texcoords);
                    mesh._texcoordsDirty = false;
                }
                gl.vertexAttribPointer(attribLocationTexcoord,meshFormat.texcoordSize,gl.FLOAT,false,0,offsetTexcoords);
            }

            if(meshObj._transform){
                glTrans.pushMatrix();
                glTrans.multMatrix(meshObj._transform);
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, glTrans.getModelViewMatrixF32());
                prevHadLocalTransform = true;
            } else if(prevHadLocalTransform) {
                gl.uniformMatrix4fv(uniformLocationModelViewMatrix , false, globalTransform);
                prevHadLocalTransform = false;
            }

            if(meshIbo){
                indices = meshObj.indices;
                if(mesh._indicesDirty){
                    meshIbo.bufferSubData(0,indices);
                    mesh._indicesDirty = false;
                }
                gl.drawElements(mesh._usage,indices.length,meshFormat.indexFormat,0);
            } else {
                gl.drawArrays(mesh._usage,0,(vertices.length / meshFormat.vertexSize));
            }

            if(meshObj._transform){
                glTrans.popMatrix();
            }

            attribTexcoordEnabled = texcoordsLen != 0;
        }
        if(!attribTexcoordEnabled){
            gl.enableVertexAttribArray(attribLocationTexcoord);
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER,prevVbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,prevIbo);
}


glDraw_Internal.prototype.enableLighting = function(){
    this._gl.uniform1f(Program.getCurrent()[Program.UNIFORM_USE_LIGHTING],1.0);
};

glDraw_Internal.prototype.disableLighting = function(){
    this._gl.uniform1f(Program.getCurrent()[Program.UNIFORM_USE_LIGHTING],0.0);
}

/*--------------------------------------------------------------------------------------------*/
//  Helper
/*--------------------------------------------------------------------------------------------*/

glDraw_Internal.prototype._genHead = function(length, radius, arr, offset){
    offset = offset || 0;

    var numSteps = 15;
    var step = (Math.PI * 2) / (numSteps - 1);
    var angle;

    arr[offset++] = 0;
    arr[offset++] = 0;
    arr[offset++] = length;

    numSteps *= 3;
    numSteps  = offset + numSteps;
    var i = offset;
    var j = 0;
    while(i < numSteps){
        angle = step * j++;

        arr[i  ] = Math.cos(angle) * radius;
        arr[i+1] = Math.sin(angle) * radius;
        arr[i+2] = 0;

        i += 3;
    }
};

glDraw_Internal.prototype._genTube = function(length, radius, arr, offset){
    offset = offset || 0;

    var numSteps = 15;
    var step = (Math.PI * 2) / (numSteps - 1);
    var angle;

    numSteps  = offset + numSteps;
    var i = offset;
    var j = 0;
    while(i < numSteps){
        angle = step * j++;

        arr[i  ] = arr[i+3] = Math.cos(angle) * radius;
        arr[i+1] = arr[i+4] = Math.sin(angle) * radius;
        arr[i+2] = 0;
        arr[i+5] = length;

        i += 6;
    }
};

glDraw_Internal.prototype._updateProgramLocations = function(){
    var gl = this._gl;

    if(this._programIdLast == Program.getCurrent().getId()){
        return;
    }
    var program = this._program = Program.getCurrent(),
        programGl = program.getObjGL();

    this._attribLocationVertexPos    = program.getAttribLocation(Program.ATTRIB_VERTEX_POSITION);
    this._attribLocationVertexColor  = program.getAttribLocation(Program.ATTRIB_VERTEX_COLOR);
    this._attribLocationVertexNormal = program.getAttribLocation(Program.ATTRIB_VERTEX_NORMAL);
    this._attribLocationTexcoord     = program.getAttribLocation(Program.ATTRIB_TEXCOORD);

    this._uniformLocationProjectionMatrix = program.getUniformLocation(Program.UNIFORM_PROJECTION_MATRIX);
    this._uniformLocationViewMatrix       = program.getUniformLocation(Program.UNIFORM_VIEW_MATRIX);
    this._uniformLocationModelViewMatrix  = program.getUniformLocation(Program.UNIFORM_MODELVIEW_MATRIX);
    this._uniformLocationNormalMatrix     = program.getUniformLocation(Program.UNIFORM_NORMAL_MATRIX);


    this._programIdLast = program.getId();
};

glDraw_Internal.prototype._applyMatrixUniforms = function(applyNormalMatrix){
    var gl = this._gl;

    gl.uniformMatrix4fv(this._uniformLocationModelViewMatrix , false, glTrans.getModelViewMatrixF32());
    gl.uniformMatrix4fv(this._uniformLocationProjectionMatrix, false, glTrans.getProjectionMatrixF32());

    if(this._uniformLocationNormalMatrix != -1 && applyNormalMatrix){
        gl.uniformMatrix3fv(this._uniformLocationNormalMatrix, false, glTrans.getNormalMatrixF32());
    }
    if(this._uniformLocationViewMatrix != -1){
        gl.uniformMatrix4fv(this._uniformLocationViewMatrix, false, glTrans.getViewMatrixF32());
    }
}

/**
 * Set the color used by all glDraw draw methods.
 * @param {Number} [r]
 * @param {Number} [g]
 * @param {Number} [b]
 * @param {Number} [a]
 */

glDraw_Internal.prototype.colorf = function(r,g,b,a){
    var r_,g_,b_,a_;
    r_ = g_ = b_ = 0.0;
    a_ = 1.0;
    switch(arguments.length){
        case 1:
            r_ = g_ = b_ = arguments[0];
            break;
        case 2:
            r_ = g_ = b_ = arguments[0];
            a_ = arguments[1];
            break;
        case 3:
            r_ = arguments[0];
            g_ = arguments[1];
            b_ = arguments[2];
            break;
        case 4:
            r_ = arguments[0];
            g_ = arguments[1];
            b_ = arguments[2];
            a_ = arguments[3];
            break;
    }
    this._color.setf(r_,g_,b_,a_);
};

/**
 * Set the color used by all glDraw draw methods.
 * @param {Color} color - color
 */

glDraw_Internal.prototype.color = function(color){
    this._color.set(color);
};

/**
 * Set the color´s alpha used by all glDraw draw methods.
 * @param alpha - alpha
 */

glDraw_Internal.prototype.alpha = function(alpha){
    this._color.a = alpha;
};

/**
 * Get the current color used by all glDraw draw methods.
 * @param {Color} [color] - Color to be set
 * @returns {Color}
 */

glDraw_Internal.prototype.getColor = function(color){
    return (color || new Color()).set(this._color);
};

/**
 * Draws a screen aligned rectangle.
 * @param {Number} [width=100]
 * @param {Number} [height=100]
 * @param {Boolean} [topleft] - origin top left
 */

glDraw_Internal.prototype.drawScreenRectf = function(width,height,topleft){
    width  = width  === undefined ? 100 : width;
    height = height === undefined ? width : height;

    glTrans.pushMatrices();
        glTrans.setWindowMatrices(width,height,topleft);
        this.drawRect(width,height);
    glTrans.popMatrices();
};

/**
 * Draws a screen aligned rectangle.
 * @param {Vec2} [size]
 * @param {Boolean} [topleft]
 */

glDraw_Internal.prototype.drawScreenRect = function(size,topleft){
    this.drawScreenRectf(size.x,size.y,topleft);
}

/**
 * Draws a screen-aligned rectangle with the apps current window dimensions.
 * @param {Boolean} [topleft] - origin top left
 */

glDraw_Internal.prototype.drawWindowRect = function(topleft){
    this.drawScreenRect(Window_.get().getSize(TEMP_VEC2_0),topleft);
}

var glDraw = {
    _obj: null
};

glDraw.init = function(){
    this._obj = new glDraw_Internal();
};

/**
 * Get an instance of glDraw.
 * @returns {glDraw}
 */

glDraw.get = function(){
    return this._obj;
};

glDraw.dispose = function(){
    var obj, gl;

    obj = this._obj;
    gl  = obj._gl;

    gl.deleteBuffer(obj._pivotVertexBuffer);
    gl.deleteBuffer(obj._pivotColorBuffer);
    gl.deleteBuffer(obj._bufferPivotIndex);
    gl.deleteBuffer(obj._gridVbo);
    gl.deleteBuffer(obj._gridIbo);
    gl.deleteBuffer(obj._cubeVertexBuffer);
    gl.deleteBuffer(obj._cubeColorBuffer);
    gl.deleteBuffer(obj._cubeColorBufferColored);
    gl.deleteBuffer(obj._cubeIndexBuffer);
    gl.deleteBuffer(obj._rectBuffer);
    gl.deleteBuffer(obj._rectColorBuffer);
    gl.deleteBuffer(obj._circleBuffer);
    gl.deleteBuffer(obj._circlesBuffer);
    gl.deleteBuffer(obj._circlesBufferIndices);
    gl.deleteBuffer(obj._bufferLine);
    gl.deleteBuffer(obj._bufferLineStrip);
    gl.deleteBuffer(obj._bufferLines);
    gl.deleteBuffer(obj._bufferPoint);
    gl.deleteBuffer(obj._bufferPoints);
    gl.deleteBuffer(obj._bufferVectorVertex);
    gl.deleteBuffer(obj._bufferVectorColor);
    gl.deleteBuffer(obj._bufferVectorIndex);
    gl.deleteBuffer(obj._bufferMesh);
    gl.deleteBuffer(obj._bufferMeshIndices);
    gl.deleteBuffer(obj._bufferQuatColor);

    this._obj = null;
};

module.exports = glDraw;