var MAX_CAPACITY = 100;

var StackTypes = {
    VAO : 'stackTypeVao',
    VBO : 'stackTypeVbo',
    PROGRAM : 'stackTypeProgram'
};

function ContextStack(){
    this._stack = {};
    for(var type in StackTypes){
        this._stack[StackTypes[type]] = [];
    }
}

ContextStack.prototype.push = function(type,obj){
    var stack = this._stack[type];
    if(stack.length >= MAX_CAPACITY){
        stack.shift();
    }
    stack.push(obj);
};

ContextStack.prototype.getFront = function(type){
    return this._stack[type][this._stack[type].length - 1];
};

ContextStack.prototype.pop = function(type){
    return this._stack[type].pop();
};

ContextStack.prototype.getStack = function(type){
    return this._stack[type];
};

ContextStack.StackTypes = StackTypes;

module.exports = ContextStack;