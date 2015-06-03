var Context      = require('./Context');
var ClearCommand = require('./ClearCommand');
var DrawCommand  = require('./DrawCommand');
var Mat4         = require('../geom/Mat4');

function Stack(context) {
  this._context = context;

  this._projectionMatrix = new Mat4();
  this._viewMatrix = new Mat4();
  this._modelMatrix = new Mat4();
  this._modelMatrixStack = [];

  this._program = null;
  this._vertexArray = null;
  this._renderState = {
    depthTest: {
      enabled: true
    }
  }
  this._uniforms = {
  }
}

Stack.prototype.perspective = function(fov, aspect, near, far) {
  //calling identity() here is some kind of automagic
  this._projectionMatrix.identity().perspective(fov, aspect, near, far);
}

Stack.prototype.lookAt = function(eye, target, up) {
  this._viewMatrix.identity().lookAt(eye, target, up);
}

//the fact that we are using modelMatrix is automagic
Stack.prototype.scale = function(x, y, z) {
  this._modelMatrix.scale(x, y, z);
}

Stack.prototype.push = function() {
  this._modelMatrixStack.push(this._modelMatrix.dup());
}

Stack.prototype.pop = function() {
  if (this._modelMatrixStack.length > 0) {
    this._modelMatrix = this._modelMatrixStack.pop();
  }
}

//the fact that we are using modelMatrix is automagic
Stack.prototype.translate = function(x, y, z) {
  this._modelMatrix.translate(x, y, z);
}

Stack.prototype.clearColor = function(r, g, b, a) {
  this._context.submit(new ClearCommand({ color: [r, g, b, a ] }));
}

Stack.prototype.clearDepth = function() {
  this._context.submit(new ClearCommand({ depth: true }));
}

Stack.prototype.uniform = function(name, value) {
  this._uniforms[name] = value;
}

Stack.prototype.drawVertexArray = function(vertexArray) {
  this._vertexArray = vertexArray;

  //FIXME: GC trashing
  //Also I should check if program us using this uniforms
  //and only on change
  this._uniforms.projectionMatrix = this._projectionMatrix.toArray();
  this._uniforms.viewMatrix = this._viewMatrix.toArray();
  this._uniforms.modelMatrix = this._modelMatrix.toArray();

  //this is tricky, as even passed value objects like arrays could be modified later
  var uniforms = {};
  for(var uniformName in this._uniforms) {
    uniforms[uniformName] = this._uniforms[uniformName];
  }

  this._context.submit(new DrawCommand({
    program: this._program,
    renderState: this._renderState,
    uniforms: uniforms,
    vertexArray: this._vertexArray
  }));
}

Stack.prototype.program = function(program) {
  this._program = program;
}

Stack.prototype.render = function() {
  this._context.render();

  this._program = null;
  this._vertexArray = null;
  this._renderState = {
    depthTest: {
      enabled: true
    }
  }

  this._projectionMatrix.identity();
  this._viewMatrix.identity();
  this._modelMatrix.identity();
}

module.exports = Stack;
