var log             = require('debug')('pex/gltf');
var info            = require('debug')('pex/gltf/info');
var async           = require('async');
var loadJSON        = require('../sys/io/loadJson');
var loadBinary      = require('../sys/io/loadBinary');
var loadText        = require('../sys/io/loadText');
var loadImage       = require('../sys/io/loadImage');
var path            = require('path');
var Platform        = require('../sys/Platform');

var WebGLConstants = {
  34963: 'ELEMENT_ARRAY_BUFFER',  //0x8893
  34962: 'ARRAY_BUFFER',          //0x8892
   5123: 'UNSIGNED_SHORT',        //0x1403
   5126: 'FLOAT',                 //0x1406
      4: 'TRIANGLES',             //0x0004
  35678: 'SAMPLER_2D',            //0x8B5E
  35664: 'FLOAT_VEC2',            //0x8B50
  35665: 'FLOAT_VEC3',            //0x8B51
  35666: 'FLOAT_VEC4',            //0x8B52
  35676: 'FLOAT_MAT4',            //0x8B5C
   5126: 'FLOAT'                  //0x1406
}

function forEachKeyValue(obj, cb) {
  var index = 0;
  Object.keys(obj).forEach(function(key) {
    cb(key, obj[key], index++);
  })
}


function handleBuffer(gl, json, basePath, bufferName, bufferInfo, callback) {
  log('handleBuffer', bufferName, bufferInfo.uri);
  if (bufferInfo.uri) {
    loadBinary(basePath + '/' + bufferInfo.uri, function(err, data) {
      bufferInfo.arrayBuffer = data;
      log('data', data);
      callback(err, data);
    });
  }
  else {
    throw new Error('gltf/handleBuffer missing uri in ' + JSON.stringify(bufferInfo));
  }
}

function handleBufferView(ctx, json, basePath, bufferViewName, bufferViewInfo, callback) {
  log('handleBufferView', bufferViewName);
  var buffer = json.buffers[bufferViewInfo.buffer];
  bufferViewInfo._typedArray = null;
  if (bufferViewInfo.target == 34963) { //ELEMENT_ARRAY_BUFFER
    //TODO: Slice or not to slice the buffer
    bufferViewInfo.buffer = buffer.arrayBuffer.slice(bufferViewInfo.byteOffset, bufferViewInfo.byteOffset + bufferViewInfo.byteLength);
    info('slice', bufferViewName, bufferViewInfo.byteOffset, bufferViewInfo.byteOffset + bufferViewInfo.byteLength, '=', bufferViewInfo.buffer.byteLength);
    bufferViewInfo._buffer = bufferViewInfo.buffer;
    bufferViewInfo._typedArray = new Uint16Array(bufferViewInfo.buffer);
    bufferViewInfo._glBuffer = ctx.createBuffer(ctx.ELEMENT_ARRAY_BUFFER, bufferViewInfo._typedArray, ctx.STATIC_DRAW);
  }
  if (bufferViewInfo.target == 34962) { //ARRAY_BUFFER
    //TODO: Slice or not to slice the buffer
    bufferViewInfo.buffer = buffer.arrayBuffer.slice(bufferViewInfo.byteOffset, bufferViewInfo.byteOffset + bufferViewInfo.byteLength);
    info('slice', bufferViewName, bufferViewInfo.byteOffset, bufferViewInfo.byteOffset + bufferViewInfo.byteLength, '=', bufferViewInfo.buffer.byteLength);
    //bufferViewInfo.buffer = buffer.arrayBuffer;
    bufferViewInfo._buffer = bufferViewInfo.buffer;
    bufferViewInfo._typedArray = new Float32Array(bufferViewInfo.buffer);
    bufferViewInfo._glBuffer = ctx.createBuffer(ctx.ARRAY_BUFFER, bufferViewInfo._typedArray, ctx.STATIC_DRAW);
  }
  log('handleBufferView', bufferViewName, WebGLConstants[bufferViewInfo.target], bufferViewInfo.byteOffset, '..', bufferViewInfo.byteLength, '/', buffer.arrayBuffer.byteLength)
  callback(null, bufferViewInfo);
}

function handleAccessor(ctx, json, basePath, accessorName, accessorInfo, callback) {
  log('handleAccessor', accessorName);
  callback(null, accessorInfo);
}

function linkPrimitive(json, primitiveName, primitiveInfo) {
  log('handlePrimitive', primitiveName)
  primitiveInfo.indices.accessor = json.accessors[primitiveInfo.indices];
  Object.keys(primitiveInfo.attributes).forEach(function(attribute) {
    primitiveInfo.attributes[attribute].accessor = json.accessors[primitiveInfo.attributes[attribute]];
  })
}

function handleMesh(ctx, json, basePath, meshName, meshInfo, callback) {
  log('handleMesh', meshInfo.name);

  meshInfo.primitives.forEach(function(primitiveInfo, primitiveIndex) {
    linkPrimitive(json, primitiveIndex, primitiveInfo);
  })
  callback(null, meshInfo);
}

function buildMeshes(ctx, json, callback) {
  log('buildMeshes');
  //FIXME: hardcoded attribute semantic mapping
  var AttributeNameMap = {
    "NORMAL": "normal",
    "POSITION": "position",
    "TEXCOORD_0": "texcoord"
  }

  log('buildMesh AttributeNameMap');

  var AttributeSizeMap = {
    "SCALAR": 1,
    "VEC2": 2,
    "VEC3": 3,
    "VEC4": 4,
    };

  function buildBufferInfo(accessorName) {
    var accessorInfo = json.accessors[accessorName];
    var size = AttributeSizeMap[accessorInfo.type];
    //TODO: any other way to limit attrib count?
    var bufferView = json.bufferViews[accessorInfo.bufferView];
    //var data = json.bufferViews[accessorInfo.bufferView]._typedArray;//.subarray(0, accessorInfo.count * size);
    var buffer = json.bufferViews[accessorInfo.bufferView]._buffer;
//
    var isIndexBuffer = (json.bufferViews[accessorInfo.bufferView].target == 34963);
    if (buffer) {
      if (isIndexBuffer) {
          console.log('indexBuffer count ' + accessorInfo.count, bufferView._glBuffer.getLength());
    //    data = new Uint16Array(buffer.slice(accessorInfo.byteOffset, accessorInfo.byteOffset + accessorInfo.count * size * 2));
      }
      else {
    //    data = new Float32Array(buffer.slice(accessorInfo.byteOffset, accessorInfo.byteOffset + accessorInfo.count * size * 4));
      }
    //  info('subarray', accessorName, accessorInfo.byteOffset, accessorInfo.byteOffset + accessorInfo.count * size * 4);
    }
    //else {
    //  info('subarray', accessorName, accessorInfo.byteOffset, accessorInfo.byteOffset + accessorInfo.count * size * 2);
    //}
    //
    //accessorInfo.byteOffset, accessorInfo.byteOffset + accessorInfo.count * size * 2

    var bufferInfo = {
      glBuffer: bufferView._glBuffer,
      offset: accessorInfo.byteOffset,
      stride: accessorInfo.byteStride,
      count: accessorInfo.count,
      size: size
    };
    log('bufferInfo', bufferInfo);
    return bufferInfo;
  }

  forEachKeyValue(json.meshes, function(meshName, meshInfo, meshIndex) {
    //if (meshIndex != 2) return; //FIXME: TEMP!
    log('buildMesh', meshName);
    meshInfo.primitives.forEach(function(primitiveInfo, primitiveIndex) {
      log('buildPrimitive', primitiveIndex);

      //var va = new VertexArray(ctx);
      //
      var attributes = []
      var indexBuffer = null;

      forEachKeyValue(primitiveInfo.attributes, function(attributeSemantic, accessorName) {
        var attributeInfo = buildBufferInfo(accessorName);
        var attributeName = AttributeNameMap[attributeSemantic];
        //var buffer = ctx.createBuffer(ctx.ARRAY_BUFFER, attributeInfo.data, ctx.STATIC_DRAW);
        var location = -1; //TODO: find location
        switch(attributeSemantic) {
            case 'POSITION': location = ctx.ATTRIB_POSITION; break;
            case 'NORMAL': location = ctx.ATTRIB_NORMAL; break;
            case 'TEXCOORD_0': location = ctx.ATTRIB_TEX_COORD_0; break;
            default: console.log('WARN: GLTF: Unknown attribute semantic:' + attributeSemantic);
        }
        if (!attributeInfo.size) {
            console.log('WARN: GLTF: Attribute size is missing for :' + accessorName, attributeInfo);
        }
        attributes.push({
            buffer: attributeInfo.glBuffer,
            location: location,
            size: attributeInfo.size,
            offset: attributeInfo.offset,
            stride: attributeInfo.stride
        })
      });

      var indexBufferInfo = buildBufferInfo(primitiveInfo.indices);
      //log('buildIndexBuffer', indexBufferInfo, 'len:', indexBufferInfo.data.length);
      //indexBuffer = ctx.createBuffer(ctx.ELEMENT_ARRAY_BUFFER, indexBufferInfo.data, ctx.STATIC_DRAW);

      var va = ctx.createVertexArray(attributes, indexBufferInfo.glBuffer);

      primitiveInfo._vertexArray = va;
      primitiveInfo._indexBufferOffset = indexBufferInfo.offset;
      primitiveInfo._indexBufferCount = indexBufferInfo.count;
    })
  })

  callback(null, json);
}

function handleShader(gl, json, basePath, shaderName, shaderInfo, callback) {
  if (shaderInfo.uri) {
    loadText(basePath + '/' + shaderInfo.uri, function(err, srcStr) {
      //precision is already added in Program class
      if (Platform.isPlask) {
          shaderInfo._src = srcStr.replace('precision highp float;', '');
      }
      else {
          shaderInfo._src = srcStr;
      }
      callback(err, shaderInfo);
    });
  }
  else {
    throw new Error('gltf/handleShader missing uri in ' + JSON.stringify(shaderInfo));
  }
}

function handleImage(ctx, json, basePath, imageName, imageInfo, callback) {
  log('handleImage', imageInfo.uri);
  if (imageInfo.uri) {
    var url = basePath + '/' + imageInfo.uri;
    loadImage(url, function(err, img) {
      imageInfo._img = img;
      callback(err, img);
    })
  }
  else {
    throw new Error('gltf/handleImage missing uri in ' + JSON.stringify(imageInfo));
  }
}

function handleTexture(ctx, json, basePath, textureName, textureInfo, callback) {
  log('handleTexture', textureInfo.source)
  if (textureInfo.source) {
    var img = json.images[textureInfo.source]._img;
    textureInfo._texture = ctx.createTexture2D(img, img.width, img.height, { repeat: true });
    callback(null, textureInfo);
  }
  else {
    throw new Error('gltf/handleTexture missing uri in ' + JSON.stringify(textureInfo));
  }
}

function handleProgram(ctx, json, basePath, programName, programInfo, callback) {
  log('handleProgram', programName);
  var vertSrc = json.shaders[programInfo.vertexShader]._src;
  var fragSrc = json.shaders[programInfo.fragmentShader]._src;
  //FIXME: hardcoded attribute names
  vertSrc = vertSrc.replace(/a_position/g, 'aPosition');
  vertSrc = vertSrc.replace(/a_normal/g, 'aNormal');
  vertSrc = vertSrc.replace(/a_texcoord0/g, 'aTexCoord0');
  programInfo._program = ctx.createProgram(vertSrc, fragSrc);
  callback(null, programInfo);
}

function handleNode(ctx, json, basePath, nodeName, nodeInfo, callback) {
  log('handleNode', nodeName);
  //FIXME: solve that with Ramda partial
  nodeInfo.children = nodeInfo.children.map(function(childNodeName) {
    json.nodes[childNodeName].parent = nodeInfo;
    return json.nodes[childNodeName];
  })
  callback(null, nodeInfo);
}

function handleScene(ctx, json, basePath, sceneName, sceneInfo, callback) {
  log('handleScene', sceneName);
  //FIXME: solve that with Ramda partial
  sceneInfo.nodes = sceneInfo.nodes.map(function(childNodeName) {
    return json.nodes[childNodeName];
  })
  callback(null, sceneInfo);
}

function handleAll(typeName, handler, ctx, json, basePath, callback) {
  log('handleAll', typeName);
  if (!json[typeName]) {
    log('missing', typeName);
    return callback(null, null);
  }
  async.map(
    Object.keys(json[typeName]),
    function(nodeName, callback) {
      handler(ctx, json, basePath, nodeName, json[typeName][nodeName], callback);
    },
    callback
  )
}

function load(ctx, file, callback) {
  var basePath = path.dirname(file);
  log('load ', file);
  loadJSON(file, function(err, json) {
    if (err) {
      return callback(err);
    }
    async.series([
      function(callback) { handleAll('buffers'    , handleBuffer    , ctx, json, basePath, callback); },
      function(callback) { handleAll('bufferViews', handleBufferView, ctx, json, basePath, callback); },
      function(callback) { handleAll('accessors'  , handleAccessor  , ctx, json, basePath, callback); },
      function(callback) { handleAll('meshes'     , handleMesh      , ctx, json, basePath, callback); },
      function(callback) { handleAll('images'     , handleImage     , ctx, json, basePath, callback); },
      function(callback) { handleAll('textures'   , handleTexture   , ctx, json, basePath, callback); },
      function(callback) { handleAll('shaders'    , handleShader    , ctx, json, basePath, callback); },
      function(callback) { handleAll('programs'   , handleProgram   , ctx, json, basePath, callback); },
      function(callback) { handleAll('nodes'      , handleNode      , ctx, json, basePath, callback); },
      function(callback) { handleAll('scenes'     , handleScene     , ctx, json, basePath, callback); },
      function(callback) { buildMeshes(ctx, json, callback); },
    ], function(err, results) {
      if (err) log('load done errors', err);
      else log('load done');
      callback(err, json);
    })
  })
}

module.exports = load;
