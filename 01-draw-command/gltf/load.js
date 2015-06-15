var loadJSON = require('../sys/io/load-json');
var log = require('debug')('pex/gltf');
var async = require('async');
var loadBinary = require('../sys/io/load-binary');
var path = require('path');

var WebGLConstants = {
  34963: 'ELEMENT_ARRAY_BUFFER',  //0x8893
  34962: 'ARRAY_BUFFER',          //0x8892
   5123: 'UNSIGNED_SHORT',        //0x1403
   5126: 'FLOAT',                 //0x1406
      4: 'TRIANGLES'              //0x0004
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
  bufferViewInfo.typedArray = null;
  if (bufferViewInfo.target == 34963) { //ELEMENT_ARRAY_BUFFER
    bufferViewInfo.typedArray = new Uint16Array(buffer.arrayBuffer.slice(bufferViewInfo.byteOffset, bufferViewInfo.byteOffset + bufferViewInfo.byteLength));
  }
  if (bufferViewInfo.target == 34962) { //ARRAY_BUFFER
    bufferViewInfo.typedArray = new Float32Array(buffer.arrayBuffer.slice(bufferViewInfo.byteOffset, bufferViewInfo.byteOffset + bufferViewInfo.byteLength));
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
      function(callback) { handleMeshes(json, callback); }
    ], function(err, results) {
      if (err) log('results errors', err);
      else log('results', results);
      callback(err, json);
    })
  })
}

module.exports = load;
