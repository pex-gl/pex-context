var lo = require('lodash');

function Snippet(code, phase) {
  this.code = code;
  this.phase = phase;

  this.attributes = [];
  this.uniforms   = [];
  this.varyings   = [];
  this.parameters = [];

  this.parseCode(code);
}

Snippet.types = {
  'float':       'f',
  'vec2':        'v2',
  'vec3':        'v3',
  'vec4':        'v4',
  'mat3':        'm3',
  'mat4':        'm4',
  'sampler2D':   't',
  'samplerCube': 't'//,
};

Snippet.defaults = {
  'float':       0,
  'vec2':        { x: 0, y: 0 },
  'vec3':        { x: 0, y: 0, z:0 },
  'vec4':        { x: 0, y: 0, z:0, w: 1 },
  'mat4':        [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  'sampler2D':   0,
  'samplerCube': 0//,
};

Snippet.prototype.parseCode = function(code) {
  function findAll(re, string) {
    if (!re.global) throw "Can't findAll non-global regexp";
    var match, all = [];
    while (match = re.exec(string)) {
      all.push(match);
    };
    return all;
  }

  //Remove all comments and normalize newlines
  code = code.replace(/\r\n?/g, '\n').replace(/\/\/[^\n]*\n/g, '\n').replace(/\/\*(.|\n)*?\*\//g, '\n');

  var attributes = findAll(/(?:^|;)\s*attribute\s+(([A-Za-z0-9]+)\s+([A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?)(?:$|(?=;))/g, code);
  var uniforms = findAll(/(?:^|;)\s*uniform\s+(([A-Za-z0-9]+)\s+([A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?)(?:$|(?=;))/g, code);
  var varyings = findAll(/(?:^|;)\s*varying\s+(([A-Za-z0-9]+)\s+([[A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?)(?:$|(?=;))/g, code);
  var signature = findAll(/void\s+(main[A-Za-z0-9_]*)\s*\(([^\)]*)\)\s*{/g, code);

  //console.log(attributes)
  var matches = {
    parseAttribute: attributes,
    parseUniform:   uniforms,
    parseVarying:   varyings//,
  };
  var body = code;
  lo.each(matches, function(set, key) {
    lo.each(set, function(item) {
      this[key](item);
      body = body.replace(item[0], '');
    }.bind(this));
  }.bind(this));
  body = body.replace(/^\s*;/, '');

  // Process function signature.
  try {
    this.parseSignature(signature[0]);
  }
  catch (e) {
    console.log('Shader failed', e);
    console.log(code);
  }
  this.body = body;
}

Snippet.prototype.arguments = function() {
  return {
    uniforms: this.uniforms,
    varyings: this.varyings,
    attributes: this.attributes,
    parameters: this.parameters//,
  };
};

Snippet.prototype.type = function(type, array) {
  type = (Snippet.types[type] || 'f') + (array ? 'v' : '');
  type = type == 'fv' ? 'fv1' : type;
  return type;
};

Snippet.prototype.parseAttribute = function(match) {
  var signature = match[1],
      type = match[2],
      name = match[3],
      array = match[4];

  this.attributes.push({
    kind: 'attribute',
    name: name,
    type: this.type(type, array),
    signature: signature//,
  });
};

Snippet.prototype.parseUniform = function(match) {
  var signature = match[1],
      type = match[2],
      name = match[3],
      array = match[4];

  this.uniforms.push({
    kind: 'uniform',
    name: name,
    type: this.type(type, array),
    value: Snippet.defaults[type] || 0,
    signature: signature//,
  });
};

Snippet.prototype.parseVarying = function(match) {
  var signature = match[1],
      type = match[2],
      name = match[3],
      array = match[4];

  this.varyings.push({
    kind: 'varying',
    name: name,
    type: this.type(type, array),
    signature: signature//,
  });
};

Snippet.prototype.parseSignature = function(match) {
  this.name = match[1];

  // Ignore empty signature
  var signature = match[2].replace(/^\s*$/g, '');
  if (signature.length == 0) {
    this.signature = [];
    return;
  }

  // Parse out arguments.
  var arguments = this.signature = signature.split(',');
  lo.each(arguments, function(definition) {
    var match = /((?:(in|out|inout)\s+)?([A-Za-z0-9]+)\s+([A-Za-z0-9_]+)\s*(?:\[([^\]]+)\])?)(?:$|(?=;))/.exec(definition);

    var signature = match[1],
        inout = match[2],
        type = match[3],
        name = match[4],
        array = match[5];

    var inouts = {
      'in': 'in',
      'out': 'out',
      'inout': 'inout'//,
    };

    this.parameters.push({
      inout: inouts[inout || 'in'],
      name: name,
      glslType: type,
      type: this.type(type, array),
      hint: name.replace(/(In|Out)$/, ''),
      signature: signature//,
    });
  }.bind(this));
};

Snippet.prototype.getInputs = function() {
  return this.parameters.filter(function(param) {
    return param.inout == 'in' || param.inout == 'inout';
  });
};

Snippet.prototype.getOutputs = function() {
  return this.parameters.filter(function(param) {
    return param.inout == 'out' || param.inout == 'inout';
  });
};

Snippet.prototype.getExternals = function() {
  return []
    .concat(this.attributes)
    .concat(this.uniforms)
    .concat(this.varyings);
};

module.exports = Snippet;