var merge = require('merge');
var geom = require('pex-geom')
var Context = require('./Context');
var RenderableGeometry = require('./RenderableGeometry');

var Vec3 = geom.Vec3
var Quat = geom.Quat
var Mat4 = geom.Mat4
var BoundingBox = geom.BoundingBox;

function Mesh(geometry, material, options) {
  this.gl = Context.currentContext;
  this.geometry = merge(geometry, RenderableGeometry);
  this.material = material;
  options = options || {};
  this.primitiveType = options.primitiveType;
  if (this.primitiveType == null) {
    this.primitiveType = this.gl.TRIANGLES;
  }
  if (options.lines) {
    this.primitiveType = this.gl.LINES;
  }
  if (options.triangles) {
    this.primitiveType = this.gl.TRIANGLES;
  }
  if (options.points) {
    this.primitiveType = this.gl.POINTS;
  }

  this.position = Vec3.create(0, 0, 0);
  this.rotation = Quat.create();
  this.scale = Vec3.create(1, 1, 1);
  this.projectionMatrix = Mat4.create();
  this.viewMatrix = Mat4.create();
  this.invViewMatrix = Mat4.create();
  this.modelWorldMatrix = Mat4.create();
  this.modelViewMatrix = Mat4.create();
  this.rotationMatrix = Mat4.create();
  this.normalMatrix = Mat4.create();
}

Mesh.extensions = {};

Mesh.prototype.draw = function(camera) {
  if (this.geometry.isDirty()) {
    this.geometry.compile();
  }
  if (camera) {
    this.updateMatrices(camera);
    this.updateMatricesUniforms(this.material);
  }

  this.material.use();

  var numInstances = this.bindAttribs();
  if (numInstances > 0) {
    var drawElementsInstanced;
    if (this.gl.drawElementsInstanced) {
      drawElementsInstanced = this.gl.drawElementsInstanced.bind(this.gl);
    }
    if (!drawElementsInstanced) {
      if (!Mesh.extensions.instancedArrays) {
        Mesh.extensions.instancedArrays = this.gl.getExtension("ANGLE_instanced_arrays");
        if (!Mesh.extensions.instancedArrays) {
          throw new Error('Mesh has instanced geometry but ANGLE_instanced_arrays is not available');
        }
      }
      drawElementsInstanced = Mesh.extensions.instancedArrays.drawElementsInstancedANGLE.bind(Mesh.extensions.instancedArrays);
    }
    if (this.geometry.faces && this.geometry.faces.length > 0 && this.primitiveType !== this.gl.LINES && this.primitiveType !== this.gl.POINTS) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.faces.buffer.handle);
      drawElementsInstanced(this.primitiveType, this.geometry.faces.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0, numInstances);
    }
    else if (this.geometry.edges && this.geometry.edges.length > 0 && this.primitiveType === this.gl.LINES) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.edges.buffer.handle);
      drawElementsInstanced(this.primitiveType, this.geometry.edges.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0, numInstances);
    }
  }
  else {
    if (this.geometry.faces && this.geometry.faces.length > 0 && this.primitiveType !== this.gl.LINES && this.primitiveType !== this.gl.POINTS) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.faces.buffer.handle);
      this.gl.drawElements(this.primitiveType, this.geometry.faces.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
    }
    else if (this.geometry.edges && this.geometry.edges.length > 0 && this.primitiveType === this.gl.LINES) {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.edges.buffer.handle);
      this.gl.drawElements(this.primitiveType, this.geometry.edges.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
    }
    else if (this.geometry.vertices) {
      var num = this.geometry.vertices.length;
      this.gl.drawArrays(this.primitiveType, 0, num);
    }
  }
  this.unbindAttribs();
};

Mesh.prototype.drawInstances = function(camera, instances) {
  if (this.geometry.isDirty()) {
    this.geometry.compile();
  }
  if (camera) {
    this.updateMatrices(camera);
    this.updateMatricesUniforms(this.material);
  }
  this.material.use();
  this.bindAttribs();
  if (this.geometry.faces && this.geometry.faces.length > 0 && this.primitiveType !== this.gl.LINES && this.primitiveType !== this.gl.POINTS) {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.faces.buffer.handle);
    for (var i = 0; i < instances.length; i++) {
      var instance = instances[i];
      if (camera) {
        this.updateMatrices(camera, instance);
        this.updateMatricesUniforms(this.material);
        this.updateUniforms(this.material, instance);
        this.material.use();
      }
      this.gl.drawElements(this.primitiveType, this.geometry.faces.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
    }
  }
  else if (this.geometry.edges && this.geometry.edges.length > 0 && this.primitiveType === this.gl.LINES) {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.edges.buffer.handle);
    for (var i = 0; i < instances.length; i++) {
      var instance = instances[i];
      if (camera) {
        this.updateMatrices(camera, instance);
        this.updateMatricesUniforms(this.material);
        this.updateUniforms(this.material, instance);
        this.material.use();
      }
      this.gl.drawElements(this.primitiveType, this.geometry.edges.buffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
    }
  }
  else if (this.geometry.vertices) {
    var num = this.geometry.vertices.length;
    for (var i = 0; i < instances.length; i++) {
      var instance = instances[i];
      if (camera) {
        this.updateMatrices(camera, instance);
        this.updateMatricesUniforms(this.material);
        this.updateUniforms(this.material, instance);
        this.material.use();
      }
      this.gl.drawArrays(this.primitiveType, 0, num);
    }
  }
  return this.unbindAttribs();
};

Mesh.prototype.bindAttribs = function() {
  var numInstances = 0;
  var program = this.material.program;
  for (name in this.geometry.attribs) {
    var attrib = this.geometry.attribs[name];
    attrib.location = this.gl.getAttribLocation(program.handle, attrib.name);
    if (attrib.location >= 0) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer.handle);
      this.gl.vertexAttribPointer(attrib.location, attrib.buffer.elementSize, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(attrib.location);

      if (attrib.instanced) {
        this.vertexAttribDivisor(attrib.location, 1);
        numInstances = attrib.length;
      }
    }
  }
  return numInstances;
}

Mesh.prototype.unbindAttribs = function() {
  for (name in this.geometry.attribs) {
    var attrib = this.geometry.attribs[name];
    if (attrib.location >= 0) {
      if (attrib.instanced) {
        this.vertexAttribDivisor(attrib.location, 0);
      }
      this.gl.disableVertexAttribArray(attrib.location);
    }
  }
};

Mesh.prototype.vertexAttribDivisor = function(location, divisor) {
  if (this.gl.vertexAttribDivisor) {
    this.gl.vertexAttribDivisor(location, divisor);
  }
  else {
    if (!Mesh.extensions.instancedArrays) {
      Mesh.extensions.instancedArrays = this.gl.getExtension("ANGLE_instanced_arrays");
      if (!Mesh.extensions.instancedArrays) {
        throw new Error('Mesh has instanced geometry but ANGLE_instanced_arrays is not available');
      }
    }
    Mesh.extensions.instancedArrays.vertexAttribDivisorANGLE(location, divisor);
  }
}

Mesh.prototype.resetAttribLocations = function() {
  for (name in this.geometry.attribs) {
    var attrib = this.geometry.attribs[name];
    attrib.location = -1;
  }
};

Mesh.prototype.updateMatrices = function(camera, instance) {
  var position = instance && instance.position ? instance.position : this.position;
  var rotation = instance && instance.rotation ? instance.rotation : this.rotation;
  var scale = instance && instance.scale ? instance.scale : this.scale;
  rotation.toMat4(this.rotationMatrix);
  this.modelWorldMatrix.identity().translate(position.x, position.y, position.z).mul(this.rotationMatrix).scale(scale.x, scale.y, scale.z);
  if (camera) {
    this.projectionMatrix.copy(camera.getProjectionMatrix());
    this.viewMatrix.copy(camera.getViewMatrix());
    this.invViewMatrix.copy(camera.getViewMatrix().dup().invert());
    this.modelViewMatrix.copy(camera.getViewMatrix()).mul(this.modelWorldMatrix);
    return this.normalMatrix.copy(this.modelViewMatrix).invert().transpose();
  }
};

Mesh.prototype.updateUniforms = function(material, instance) {
  for (uniformName in instance.uniforms) {
    var uniformValue = instance.uniforms[uniformName];
    material.uniforms[uniformName] = uniformValue;
  }
};

Mesh.prototype.updateMatricesUniforms = function(material) {
  var materialUniforms, programUniforms;
  programUniforms = this.material.program.uniforms;
  materialUniforms = this.material.uniforms;
  if (programUniforms.projectionMatrix) {
    materialUniforms.projectionMatrix = this.projectionMatrix;
  }
  if (programUniforms.viewMatrix) {
    materialUniforms.viewMatrix = this.viewMatrix;
  }
  if (programUniforms.invViewMatrix) {
    materialUniforms.invViewMatrix = this.invViewMatrix;
  }
  if (programUniforms.modelWorldMatrix) {
    materialUniforms.modelWorldMatrix = this.modelWorldMatrix;
  }
  if (programUniforms.modelViewMatrix) {
    materialUniforms.modelViewMatrix = this.modelViewMatrix;
  }
  if (programUniforms.normalMatrix) {
    return materialUniforms.normalMatrix = this.normalMatrix;
  }
};

Mesh.prototype.getMaterial = function() {
  return this.material;
};

Mesh.prototype.setMaterial = function(material) {
  this.material = material;
  return this.resetAttribLocations();
};

Mesh.prototype.getProgram = function() {
  return this.material.program;
};

Mesh.prototype.setProgram = function(program) {
  this.material.program = program;
  return this.resetAttribLocations();
};

Mesh.prototype.dispose = function() {
  return this.geometry.dispose();
};

Mesh.prototype.getBoundingBox = function() {
  if (!this.boundingBox) {
    this.updateBoundingBox();
  }
  return this.boundingBox;
};

Mesh.prototype.updateBoundingBox = function() {
  this.updateMatrices();
  return this.boundingBox = BoundingBox.fromPoints(this.geometry.vertices.map((function(_this) {
    return function(v) {
      return v.dup().transformMat4(_this.modelWorldMatrix);
    };
  })(this)));
};

module.exports = Mesh;
