var loadJSON = require('../sys/io/load-json');
var log = require('debug')('pex/gltf');
var info = require('debug')('pex/gltf/info');
var async = require('async');
var loadBinary = require('../sys/io/load-binary');
var loadText = require('../sys/io/load-text');
var loadImage = require('../sys/loadImage');
var path = require('path');
var forEachKeyValue = require('../util/for-each-key-value');
var VertexArray     = require('../glu/VertexArray');
var Program     = require('../glu/Program');
var Texture2D     = require('../glu/Texture2D');

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

function handleBufferView(gl, json, basePath, bufferViewName, bufferViewInfo, callback) {
  log('handleBufferView', bufferViewName);
  var buffer = json.buffers[bufferViewInfo.buffer];
  bufferViewInfo._typedArray = null;
  if (bufferViewInfo.target == 34963) { //ELEMENT_ARRAY_BUFFER
    //TODO: Slice or not to slice the buffer
    bufferViewInfo.buffer = buffer.arrayBuffer.slice(bufferViewInfo.byteOffset, bufferViewInfo.byteOffset + bufferViewInfo.byteLength);
    info('slice', bufferViewName, bufferViewInfo.byteOffset, bufferViewInfo.byteOffset + bufferViewInfo.byteLength, '=', bufferViewInfo.buffer.byteLength);
    bufferViewInfo._buffer = bufferViewInfo.buffer;
    bufferViewInfo._typedArray = new Uint16Array(bufferViewInfo.buffer);
  }
  if (bufferViewInfo.target == 34962) { //ARRAY_BUFFER
    //TODO: Slice or not to slice the buffer
    bufferViewInfo.buffer = buffer.arrayBuffer.slice(bufferViewInfo.byteOffset, bufferViewInfo.byteOffset + bufferViewInfo.byteLength);
    info('slice', bufferViewName, bufferViewInfo.byteOffset, bufferViewInfo.byteOffset + bufferViewInfo.byteLength, '=', bufferViewInfo.buffer.byteLength);
    //bufferViewInfo.buffer = buffer.arrayBuffer;
    bufferViewInfo._buffer = bufferViewInfo.buffer;
    bufferViewInfo._typedArray = new Float32Array(bufferViewInfo.buffer);
  }
  log('handleBufferView', bufferViewName, WebGLConstants[bufferViewInfo.target], bufferViewInfo.byteOffset, '..', bufferViewInfo.byteLength, '/', buffer.arrayBuffer.byteLength)
  callback(null, bufferViewInfo);
}

function handleAccessor(gl, json, basePath, accessorName, accessorInfo, callback) {
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

function handleMesh(gl, json, basePath, meshName, meshInfo, callback) {
  log('handleMesh', meshInfo.name);
  meshInfo.primitives.forEach(function(primitiveInfo, primitiveIndex) {
    linkPrimitive(json, primitiveIndex, primitiveInfo);
  })
  callback(null, meshInfo);
}

function buildMeshes(gl, json, callback) {
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
    "VEC3": 3,
    "VEC2": 2
  }

  function buildBufferInfo(accessorName) {
    var accessorInfo = json.accessors[accessorName];
    var size = AttributeSizeMap[accessorInfo.type];
    //TODO: any other way to limit attrib count?
    var data = json.bufferViews[accessorInfo.bufferView]._typedArray;//.subarray(0, accessorInfo.count * size);
    var buffer = json.bufferViews[accessorInfo.bufferView]._buffer;
    if (buffer) {
      if (json.bufferViews[accessorInfo.bufferView].target == 34963) {
        data = new Uint16Array(buffer.slice(accessorInfo.byteOffset, accessorInfo.byteOffset + accessorInfo.count * size * 2));
      }
      else {
        data = new Float32Array(buffer.slice(accessorInfo.byteOffset, accessorInfo.byteOffset + accessorInfo.count * size * 4));
      }
      info('subarray', accessorName, accessorInfo.byteOffset, accessorInfo.byteOffset + accessorInfo.count * size * 4);
    }
    else {
      info('subarray', accessorName, accessorInfo.byteOffset, accessorInfo.byteOffset + accessorInfo.count * size * 2);
    }


    var bufferInfo = {
      data: data,
      opts: {
        offset: 0,
        stride: accessorInfo.byteStride,
        size: size
      }
    };
    log(bufferInfo.opts);
    return bufferInfo;
  }

  forEachKeyValue(json.meshes, function(meshName, meshInfo, meshIndex) {
    //if (meshIndex != 2) return; //FIXME: TEMP!
    log('buildMesh', meshName);
    meshInfo.primitives.forEach(function(primitiveInfo, primitiveIndex) {
      log('buildPrimitive', primitiveIndex);

      var va = new VertexArray(gl);

      forEachKeyValue(primitiveInfo.attributes, function(attributeSemantic, accessorName) {
        var attributeInfo = buildBufferInfo(accessorName);
        var attributeName = AttributeNameMap[attributeSemantic];
        log('buildAttribute', attributeName, attributeInfo.opts);
        va.addAttribute(attributeName, attributeInfo.data, attributeInfo.opts);
      });

      var indexBufferInfo = buildBufferInfo(primitiveInfo.indices);
      log('buildIndexBuffer', indexBufferInfo.opts, 'len:', indexBufferInfo.data.length);
      va.addIndexBuffer(indexBufferInfo.data, indexBufferInfo.opts);

      primitiveInfo.vertexArray = va;
    })
  })

  callback(null, json);
}

function handleShader(gl, json, basePath, shaderName, shaderInfo, callback) {
  log('handleShader', shaderName);
  if (shaderInfo.uri) {
    loadText(basePath + '/' + shaderInfo.uri, function(err, srcStr) {
      log('handleShader');
      //precision is already added in Program class
      shaderInfo._src = srcStr.replace('precision highp float;', '');
      callback(err, shaderInfo);
    });
  }
  else {
    throw new Error('gltf/handleShader missing uri in ' + JSON.stringify(shaderInfo));
  }
}

function handleImage(gl, json, basePath, imageName, imageInfo, callback) {
  log('handleImage', imageInfo.uri);
  if (imageInfo.uri) {
    var url = basePath + '/' + imageInfo.uri;
    loadImage(url).then(function(img) {
      imageInfo._img = img;
      callback(null, img);
    }).catch(function(e) {
      console.log(e);
      callback(e, null);
    }).done();
  }
  else {
    throw new Error('gltf/handleImage missing uri in ' + JSON.stringify(imageInfo));
  }
}

function handleTexture(gl, json, basePath, textureName, textureInfo, callback) {
  log('handleTexture', textureInfo.source)
  if (textureInfo.source) {
    var img = json.images[textureInfo.source]._img;
    //textureInfo._texture = new Texture2D(gl, )
    var plask = require('plask');
    textureInfo._texture = new Texture2D(gl, img.width, img.height);
    textureInfo._texture.update(img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    //textureInfo._texture = Texture2D.genNoise(gl, 256, 256);
    callback(null, textureInfo);
  }
  else {
    throw new Error('gltf/handleTexture missing uri in ' + JSON.stringify(textureInfo));
  }
}

function handleProgram(gl, json, basePath, programName, programInfo, callback) {
  log('handleProgram', programName);
  var vertSrc = json.shaders[programInfo.vertexShader]._src;
  var fragSrc = json.shaders[programInfo.fragmentShader]._src;
  //FIXME: hardcoded
  vertSrc = vertSrc.replace(/a_position/g, 'position');
  vertSrc = vertSrc.replace(/a_normal/g, 'normal');
  vertSrc = vertSrc.replace(/a_texcoord0/g, 'texcoord');
  programInfo._program = new Program(gl, vertSrc, fragSrc);
  callback(null, programInfo);
}

function handleNode(gl, json, basePath, nodeName, nodeInfo, callback) {
  log('handleNode', nodeName);
  //FIXME: solve that with Ramda partial
  nodeInfo.children = nodeInfo.children.map(function(childNodeName) {
    return json.nodes[childNodeName];
  })
  callback(null, nodeInfo);
}

function handleAll(typeName, handler, gl, json, basePath, callback) {
  log('handleAll', typeName);
  if (!json[typeName]) {
    log('missing', typeName);
    return callback(null, null);
  }
  async.map(
    Object.keys(json[typeName]),
    function(nodeName, callback) {
      handler(gl, json, basePath, nodeName, json[typeName][nodeName], callback);
    },
    callback
  )
}

function load(gl, file, callback) {
  var basePath = path.dirname(file);
  log('load ', file);
  loadJSON(file, function(err, json) {
    if (err) {
      return callback(err);
    }
    async.series([
      function(callback) { handleAll('buffers'    , handleBuffer    , gl, json, basePath, callback); },
      function(callback) { handleAll('bufferViews', handleBufferView, gl, json, basePath, callback); },
      function(callback) { handleAll('accessors'  , handleAccessor  , gl, json, basePath, callback); },
      function(callback) { handleAll('meshes'     , handleMesh      , gl, json, basePath, callback); },
      function(callback) { handleAll('images'     , handleImage     , gl, json, basePath, callback); },
      function(callback) { handleAll('textures'   , handleTexture   , gl, json, basePath, callback); },
      function(callback) { handleAll('shaders'    , handleShader    , gl, json, basePath, callback); },
      function(callback) { handleAll('programs'   , handleProgram   , gl, json, basePath, callback); },
      function(callback) { handleAll('nodes'      , handleNode      , gl, json, basePath, callback); },
      function(callback) { buildMeshes(gl, json, callback); },
    ], function(err, results) {
      if (err) log('load done errors', err);
      else log('load done');
      callback(err, json);
    })
  })
}

module.exports = load;
