function unpack(src, out, elemSize) {
    for(var i=0, len=src.length; i<len; i++) {
        for(var j=0; j<elemSize; j++) {
            out[i * elemSize + j] = src[i][j];
        }
    }
}

function Mesh01ArraysAuto(ctx, geometry) {
    this._ctx = ctx;

    var attributes = [];

    var knowAttributes = {
        positions : ctx.ATTRIB_POSITION,
        vertices : ctx.ATTRIB_POSITION, //alt name
        colors : ctx.ATTRIB_COLOR,
        texCoord0s : ctx.ATTRIB_TEX_COORD_0,
        texCoord1s : ctx.ATTRIB_TEX_COORD_1,
        texCoord2s : ctx.ATTRIB_TEX_COORD_2,
        texCoord3s : ctx.ATTRIB_TEX_COORD_3,
        uvs : ctx.ATTRIB_TEX_COORD_0,  //alt name
        uvs0 : ctx.ATTRIB_TEX_COORD_0, //alt name
        uvs1 : ctx.ATTRIB_TEX_COORD_1, //alt name
        uvs2 : ctx.ATTRIB_TEX_COORD_2, //alt name
        uvs3 : ctx.ATTRIB_TEX_COORD_3, //alt name
        normals : ctx.ATTRIB_NORMAL,
        tangents : ctx.ATTRIB_TANGENT,
        bitangents : ctx.ATTRIB_BITANGENT,
        boneIndexs : ctx.ATTRIB_BONE_INDEX,
        boneWeights : ctx.ATTRIB_BONE_WEIGHT,
        custom0s : ctx.ATTRIB_CUSTOM_0,
        custom1s : ctx.ATTRIB_CUSTOM_1,
        custom2s : ctx.ATTRIB_CUSTOM_2,
        custom3s : ctx.ATTRIB_CUSTOM_3,
        custom4s : ctx.ATTRIB_CUSTOM_4
    }

    var attributesDesc = [];
    var attributes = this._attributes = [];
    var attributesMap = this._attributesMap = {};

    var vertexCount = 0;

    //add attributes
    Object.keys(geometry).forEach(function(attribName) {
        var location = knowAttributes[attribName];
        if (location === undefined) return;

        var data = geometry[attribName];
        var size = data[0].length;

        var dataArray = new Float32Array(data.length * size);
        unpack(data, dataArray, size);

        var buffer = ctx.createBuffer(ctx.ARRAY_BUFFER, dataArray, ctx.STATIC_DRAW);

        var attributeDesc = {
            buffer: buffer,
            location : location,
            size: size
        }

        var attribute = {
            name: attribName,
            data: data,
            dataArray: dataArray,
            buffer: buffer,
            location : location,
            size: size
        }

        attributesDesc.push(attributeDesc);
        attributes.push(attribute);

        attributesMap[location] = attribute;

        if (location == ctx.POSITION) {
            vertexCount = data.length;
        }
    })

    var indicesData = null;
    if (geometry.faces) indicesData = geometry.faces;
    if (geometry.edges) indicesData = geometry.edges;
    if (geometry.cells) indicesData = geometry.cells;
    if (geometry.indices) indicesData = geometry.indices;


    var primiviteType = ctx.TRIANGLES;
    var indicesCount = 0;

    if (indicesData) {
        var indicesDataSize = indicesData[0].length || 1;
        var indicesDataArray = new Uint16Array(indicesData.length * indicesDataSize);
        unpack(indicesData, indicesDataArray, indicesDataSize)
        var indicesBuffer  = ctx.createBuffer(ctx.ELEMENT_ARRAY_BUFFER, indicesDataArray, ctx.STATIC_DRAW);

        if (indicesDataSize == 1) primiviteType = ctx.POINTS;
        if (indicesDataSize == 2) primiviteType = ctx.LINES;
        if (indicesDataSize == 3) primiviteType = ctx.TRIANGLES;

        var indices = this._indices = {
            data: indicesData,
            dataArray: indicesDataArray,
            buffer: indicesBuffer
        };

        indicesCount = indicesData.length * indicesDataSize;
    }
    else {
        this._indices = null;
    }

    this._primiviteType = primiviteType;
    this._count = indicesCount || vertexCount;
    this._offset = 0;
    this._vao = ctx.createVertexArray(attributesDesc, this._indices ? this._indices.buffer : null);
}

Mesh01ArraysAuto.prototype.draw = function() {
    this._ctx.bindVertexArray(this._vao);
    this._ctx.drawElements(this._primiviteType, this._count, this._offset);
}

Mesh01ArraysAuto.prototype.getAttribute = function(location) {
    return this._attributesMap[location];
}

Mesh01ArraysAuto.prototype.updateAttribute = function(location, data) {
    var attrib = this._attributesMap[location];
}


module.exports = Mesh01ArraysAuto;
