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

function handleBuffer(bufferInfo, basePath, callback) {
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

function handleBuffers(json, basePath, callback) {
  log('handleBuffers', Object.keys(json.buffers));

  var bufferNames = Object.keys(json.buffers);
  async.map(
    bufferNames,
    function(name, callback) {
      handleBuffer(json.buffers[name], basePath, callback);
    },
    function(err, buffers) {
      if (err) {
        log(err);
      }
      else {
        log('handleBuffers done', buffers.length);
      }
      callback(err, buffers);
    }
  )
}

function handleBufferView(json, bufferViewName, bufferViewInfo) {
  var buffer = json.buffers[bufferViewInfo.buffer];
  bufferViewInfo._typedArray = null;
  if (bufferViewInfo.target == 34963) { //ELEMENT_ARRAY_BUFFER
    //TODO: Slice or not to slice the buffer
    bufferViewInfo.buffer = buffer.arrayBuffer.slice(bufferViewInfo.byteOffset, bufferViewInfo.byteOffset + bufferViewInfo.byteLength);
    info('slice', bufferViewName, bufferViewInfo.byteOffset, bufferViewInfo.byteOffset + bufferViewInfo.byteLength, '=', bufferViewInfo.buffer.byteLength);
    //bufferViewInfo.buffer = buffer.arrayBuffer;
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
}

function handleBufferViews(json, callback) {
  log('handleBufferViews', Object.keys(json.bufferViews));
  Object.keys(json.bufferViews).forEach(function(bufferViewName) {
    var bufferViewInfo = json.bufferViews[bufferViewName];
    log('handleBufferView', bufferViewName);
    handleBufferView(json, bufferViewName, bufferViewInfo);
  })

  callback(null, null);
}

function handleAccessor(json, accessorName, accessorInfo) {
  log('handleAccessor', accessorName);

}

function handleAccessors(json, callback) {
  log('handleAccessors', Object.keys(json.accessors));
  Object.keys(json.accessors).forEach(function(accessorName) {
    handleAccessor(json, accessorName, json.accessors[accessorName]);
  })
  callback(null, null);
}

function handlePrimitive(json, primitiveInfo) {
  log('handlePrimitive', primitiveInfo.indices)
  primitiveInfo.indices.accessor = json.accessors[primitiveInfo.indices];
  Object.keys(primitiveInfo.attributes).forEach(function(attribute) {
    primitiveInfo.attributes[attribute].accessor = json.accessors[primitiveInfo.attributes[attribute]];
  })
  return primitiveInfo;
}

function handleMesh(json, meshInfo) {
  log('handleMesh', meshInfo.name);
  meshInfo.primitives.forEach(function(primitiveInfo) {
    handlePrimitive(json, primitiveInfo);
  })
  return meshInfo;
}

function handleMeshes(json, callback) {
  log('handleMeshes', Object.keys(json.meshes));
  var meshes = [];
  Object.keys(json.meshes).forEach(function(meshName) {
    var meshInfo = json.meshes[meshName];
    var mesh = handleMesh(json, meshInfo);
    meshes.push(mesh);
  })

  callback(null, meshes);
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
      data = new Float32Array(buffer.slice(accessorInfo.byteOffset, accessorInfo.byteOffset + accessorInfo.count * size * 4));
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

  callback(null, null);
}

function handleShader(shaderInfo, basePath, callback) {
  if (shaderInfo.uri) {
    loadText(basePath + '/' + shaderInfo.uri, function(err, srcStr) {
      log('handleShader');
      //precision is already added in Program class
      shaderInfo._src = srcStr.replace('precision highp float;', '');
      callback(err, null);
    });
  }
  else {
    throw new Error('gltf/handleShader missing uri in ' + JSON.stringify(shaderInfo));
  }
}

function handleShaders(gl, json, basePath, callback) {
  log('handleShaders', Object.keys(json.shaders));

  var shaderNames = Object.keys(json.shaders);
  async.map(
    shaderNames,
    function(name, callback) {
      handleShader(json.shaders[name], basePath, callback);
    },
    function(err, shaders) {
      if (err) {
        log(err);
      }
      else {
        log('handleShaders done', shaders.length);
      }
      callback(err, shaders);
    }
  )
}

function handleImage(imageInfo, basePath, callback) {
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

function handleImages(json, basePath, callback) {
  log('handleImages', Object.keys(json.images));

  var imageNames = Object.keys(json.images);
  async.map(
    imageNames,
    function(name, callback) {
      handleImage(json.images[name], basePath, callback);
    },
    function(err, images) {
      if (err) {
        log(err);
      }
      else {
        log('handleImages done', images.length);
      }
      callback(err, images);
    }
  )
}

function handleTexture(gl, json, textureInfo, callback) {
  log('handleTexture', textureInfo.source)
  if (textureInfo.source) {
    var img = json.images[textureInfo.source]._img;
    console.log('img', img.width, img.height)
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
    callback(null, null); //TODO: what to return here?
  }
  else {
    throw new Error('gltf/handleTexture missing uri in ' + JSON.stringify(textureInfo));
  }
}

function handleTextures(gl, json, callback) {
  log('handleTextures', Object.keys(json.textures));

  var textureNames = Object.keys(json.textures);
  async.map(
    textureNames,
    function(name, callback) {
      handleTexture(gl, json, json.textures[name], callback);
    },
    function(err, textures) {
      if (err) {
        log(err);
      }
      else {
        log('handleTextures done', textures.length);
      }
      callback(err, textures);
    }
  )
}

function handleProgram(gl, json, programInfo, callback) {
  var vertSrc = json.shaders[programInfo.vertexShader]._src;
  var fragSrc = json.shaders[programInfo.fragmentShader]._src;
  //FIXME: hardcoded
  vertSrc = vertSrc.replace(/a_position/g, 'position');
  vertSrc = vertSrc.replace(/a_normal/g, 'normal');
  vertSrc = vertSrc.replace(/a_texcoord0/g, 'texcoord');
  programInfo._program = new Program(gl, vertSrc, fragSrc);
  callback(null, programInfo._program);
}

function handlePrograms(gl, json, callback) {
  log('handlePrograms', Object.keys(json.programs));

  var shaderNames = Object.keys(json.programs);
  async.map(
    shaderNames,
    function(name, callback) {
      handleProgram(gl, json, json.programs[name], callback);
    },
    function(err, programs) {
      if (err) {
        log(err);
      }
      else {
        log('handlePrograms done', programs.length);
      }
      callback(err, programs);
    }
  )
}

function handleNode(gl, json, nodeName, nodeInfo, callback) {
  log('handleNode', nodeName);
  //FIXME: solve that with Ramda partial
  nodeInfo.children = nodeInfo.children.map(function(childNodeName) {
    return json.nodes[childNodeName];
  })
  callback(null, nodeInfo);
}

function handleAll(typeName, handler, gl, json, basePath, callback) {
  log('handleAll', typeName);
  async.map(
    Object.keys(json[typeName]),
    function(nodeName, callback) {
      handler(gl, json, nodeName, json[typeName][nodeName], callback);
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
      function(callback) { handleBuffers(json, basePath, callback); },
      function(callback) { handleBufferViews(json, callback); },
      function(callback) { handleAccessors(json, callback); },
      function(callback) { handleMeshes(json, callback); },
      function(callback) { handleImages(json, basePath, callback); },
      function(callback) { handleTextures(gl, json, callback); },
      function(callback) { handleShaders(gl, json, basePath, callback); },
      function(callback) { handlePrograms(gl, json, callback); },
      function(callback) { buildMeshes(gl, json, callback); },
      function(callback) { handleAll('nodes', handleNode, gl, json, basePath, callback); }
    ], function(err, results) {
      if (err) log('load done errors', err);
      else log('load done');
      callback(err, json);
    })
  })
}

module.exports = load;
