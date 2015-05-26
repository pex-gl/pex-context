var Snippet = require('./Snippet');
var Utils = require('./Utils');

function Graph(searchPaths) {
  this.searchPaths = searchPaths || ['assets', 'shaders', __dirname + '/../shaders'];
  this.snippets = [];
  this.cache = {
    frag: {},
    vert: {}
  };
}

Graph.prototype.snippet = function(fragmentSource) {
  if (!this.cache.frag[fragmentSource]) {
    var frag = new Snippet(Utils.getShaderSource(fragmentSource, this.searchPaths), 'frag');
    this.snippets.push(frag);
    this.cache.frag[fragmentSource] = frag;
  }
  return this;
};

Graph.prototype.material = function(vertexSource, fragmentSource) {
  if (!this.cache.vert[vertexSource]) {
    var vert = new Snippet(Utils.getShaderSource(vertexSource, this.searchPaths), 'vert');
    this.snippets.push(vert);
    this.cache.vert[vertexSource] = vert;
  }
  if (!this.cache.frag[fragmentSource]) {
    var frag = new Snippet(Utils.getShaderSource(fragmentSource, this.searchPaths), 'frag');
    this.snippets.push(frag);
    this.cache.frag[fragmentSource] = frag;
  }
  return this;
};

Graph.prototype.compile = function() {
  var context = {
    'vert': { externals: [], outputs: [], parameters: [], calls: []},
    'frag': { externals: [], outputs: [], parameters: [], calls: []}
  };

  function findExternal(phase, external) {
    var externals = context[phase].externals;
    var result = externals.filter(function(e) {
      if (e.name == external.name) {
        if (e.type != external.type) {
          throw 'Uncompatibile externals. ' + e.type + ' ' + e.name + ' AND ' + external.type + ' ' + external.name;
        }
        return true;
      }
      else {
        return false;
      }
    });
    return result[result.length-1];
  }

  function addExternal(phase, external) {
    var existingExternal = findExternal(phase, external);
    if (!existingExternal) {
      context[phase].externals.push(external);
    }
  }

  function findOutput(phase, output) {
    var outputs = context[phase].outputs;
    var result = outputs.filter(function(o) {
      return o.hint == output.hint && o.type == output.type;
    });
    return result[result.length-1];
  }

  function addOutput(phase, output) {
    context[phase].outputs.push(output);
  }

  function addCall(phase, snippet) {
    var calls = context[phase].calls;
    var name = snippet.name + '_' + calls.length;
    var signature = snippet.signature;
    var body = snippet.body.replace(/\s*void\s+([A-Za-z0-9_]+)\s*\([^\)]*\)/g, ['void', name + '(', signature.join(', '), ')'].join(' '));
    body = body.replace(/\}void/g,'}\nvoid'); //fix code layout for cases where main is preceded with another function
    calls.push({ snippet: snippet, body: body, name: name });
  }

  this.snippets.forEach(function(snippet) {
    var phase = snippet.phase;
    var externals = snippet.getExternals();
    externals.forEach(function(external) {
      addExternal(phase, external);
    });

    var inputs = snippet.getInputs();
    var outputs = snippet.getOutputs();

    inputs.forEach(function(input) {
      var existingOutput = findOutput(phase, input);
      if (existingOutput) {
        input.connection = existingOutput;
      }
      else {
        console.log('Shippet', snippet.body);
        throw new Error('Looking for input ' + input.hint + ' <- FAILED');
      }
    });

    outputs.forEach(function(output) {
      var existingOutput = findOutput(phase, output);
      if (!existingOutput) {
        output.priority = 0;
      }
      else {
        output.priority = existingOutput.priority + 1;
      }
      addOutput(phase, output);
    });

    addCall(phase, snippet);
  });

  var vertexCode = [];;
  context.vert.externals.forEach(function(external) {
    vertexCode.push(external.kind + ' ' + external.signature + ';');
  });
  context.vert.calls.forEach(function(call) {
    vertexCode.push(call.body);
  });
  vertexCode.push('void main() {');
  context.vert.outputs.forEach(function(output) {
    vertexCode.push('  ' + output.glslType + ' ' + output.hint + '_' + output.priority + ';');
  });
  context.vert.calls.forEach(function(call) {
    var callLine = [];
    callLine.push('  ');
    callLine.push(call.name);
    callLine.push('(');
    var params = call.snippet.parameters.map(function(parameter, parameterIndex) {
      if (parameter.inout == 'in') {
        return parameter.connection.hint + '_' + parameter.connection.priority;
      }
      else if (parameter.inout == 'out') {
        return parameter.hint + '_' + parameter.priority;
      }
    });
    callLine.push(params.join(', '));
    callLine.push(');');
    vertexCode.push(callLine.join(''));
  });
  vertexCode.push('}');

  var fragmentCode = [];
  context.frag.externals.forEach(function(external) {
    fragmentCode.push(external.kind + ' ' + external.signature + ';' );
  });
  context.frag.calls.forEach(function(call) {
    fragmentCode.push(call.body);
  });
  fragmentCode.push('void main() {');
  context.frag.outputs.forEach(function(output) {
    fragmentCode.push('  ' + output.glslType + ' ' + output.hint + '_' + output.priority + ';');
  });
  context.frag.calls.forEach(function(call) {
    var callLine = [];
    callLine.push('  ');
    callLine.push(call.name);
    callLine.push('(');
    var params = call.snippet.parameters.map(function(parameter, parameterIndex) {
      if (parameter.inout == 'in' || parameter.inout == 'inout') {
        var input = parameter.connection;
        while (input.connection) {
          input = input.connection;
        }
        return input.hint + '_' + input.priority;
      }
      else if (parameter.inout == 'out') {
        return parameter.hint + '_' + parameter.priority;
      }
    });
    callLine.push(params.join(', '));
    callLine.push(');');
    fragmentCode.push(callLine.join(''));
  });
  fragmentCode.push('}');

  var shader = {
    vertexShader: vertexCode.join('\n'),
    fragmentShader: fragmentCode.join('\n')
  }

  //console.log('VERT');
  //console.log(shader.vertexShader);

  //console.log('FRAG');
  //console.log(shader.fragmentShader);

  return shader;
}

module.exports = Graph;