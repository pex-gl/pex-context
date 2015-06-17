var Window = require('../sys/Window');

//temp circular dependency fix
var obj = {
    Program : null,
    Vao : null,
    Vbo : null
};

var PEX_VERTEX_ARRAY_BINDING = 1 << 2;
var PEX_ARRAY_BUFFER_BINDING = 1 << 4;
var PEX_ELEMENT_ARRAY_BUFFER_BINDING = 1 << 8;
var PEX_PROGRAM_BINDING = 1 << 16;

function getParameter(cap,context){
    context = context === undefined ? Window.getCurrentContext() : context;
    var contextId = context.id;
    var stack;
    switch(cap){
        case PEX_PROGRAM_BINDING:
            stack = obj.Program.__getStack()[contextId];
            return stack === undefined ? undefined : stack.peek();
        case PEX_ARRAY_BUFFER_BINDING:
            stack = obj.Vbo.__getStack()[contextId];
            return stack === undefined ? undefined : stack[context.ARRAY_BUFFER].peek();
        case PEX_ELEMENT_ARRAY_BUFFER_BINDING:
            stack = obj.Vbo.__getStack()[contextId];
            return stack === undefined ? undefined : stack[context.ELEMENT_ARRAY_BUFFER].peek();
        case PEX_VERTEX_ARRAY_BINDING:
            stack = obj.Vao.__getStack()[contextId];
            return stack === undefined ? undefined : stack.peek();
        default:
            throw new Error('Invalid state parameter.');
    }
}

var State = {
    PEX_VERTEX_ARRAY_BINDING : PEX_VERTEX_ARRAY_BINDING,
    PEX_ARRAY_BUFFER_BINDING : PEX_ARRAY_BUFFER_BINDING,
    PEX_ELEMENT_ARRAY_BUFFER_BINDING : PEX_ELEMENT_ARRAY_BUFFER_BINDING,
    PEX_PROGRAM_BINDING : PEX_PROGRAM_BINDING,
    getParameter : getParameter,
    _obj : obj
};

module.exports = State;