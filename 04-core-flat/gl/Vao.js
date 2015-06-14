var Window = require('../sys/Window');
var Id     = require('../sys/Id');
var Stack  = require('./Stack');

var stack  = {};
var active = {};

function copyAttriProperties(from,to){
    for(var entry in from){
        to[entry] = from[entry];
    }
}

function VertexAttribArray(){
    this.enabled = false;
    this.prevEnabled = null;
}

VertexAttribArray.prototype.copy = function(){
    var out = new VertexAttribArray();
    copyAttriProperties(this,out);
    return out;
};

function VertexAttribPointer(){
    this.size = -1;
    this.type = null;
    this.normalized = false;
    this.stride = 0;
    this.offset = 0;
    this.isDirty = true;
}

VertexAttribPointer.prototype.copy = function(){
    var out = new VertexAttribPointer();
    copyAttriProperties(this,out);
    return out;
};

function VertexAttribDivisor(){
    this.divisor = -1;
    this.isDirty = true;
}

VertexAttribDivisor.prototype.copy = function(){
    var out = new VertexAttribDivisor();
    copyAttriProperties(this,out);
    return out;
};

function Vao(){
    var gl = this._gl = Window.getCurrentContext();
    var glid = gl.id;
    stack[glid]  = stack[glid] === undefined ? new Stack() : stack[glid];
    active[glid] = active[glid] === undefined ? null : active[glid];

    this._buffers = {};
    this._bufferStack = {};

    var targets = [gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER];

    for(var i = 0, target; i < targets.length; ++i){
        target = targets[i];
        this._buffers[target]     = [];
        this._bufferStack[target] = new Stack();
    }

    this._vertexAttribArrays   = {};
    this._vertexAttribPointers = {};
    this._vertexAttribDivisors = {};

    this._id = Id.get();
}

Vao.prototype.copy = function(){
    var gl  = this._gl;
    var out = new Vao();

    var buffers     = this._buffers;
    var bufferStack = this._bufferStack;

    var outBuffers     = out._buffers;
    var outBufferStack = out._bufferStack;

    var targets = [gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER];

    for(var i = 0, target; i < targets.length; ++i){
        target = targets[i];
        outBuffers[target] = buffers[target].slice(0);
        outBufferStack[target] = bufferStack[target].copy();
    }

    var arrays   = this._vertexAttribArrays;
    var pointers = this._vertexAttribPointers;
    var divisors = this._vertexAttribDivisors;

    var outArrays   = out._vertexAttribArrays;
    var outPointers = out._vertexAttribPointers;
    var outDivisors = out._vertexAttribDivisors;

    for(var bufferIndex in arrays){
        outArrays[bufferIndex] = {};
        for(var array in arrays[bufferIndex]){
            outArrays[bufferIndex][array] = arrays[bufferIndex][array].copy();
            outArrays[bufferIndex][array].prevEnabled = false;
        }
    }
    for(var bufferIndex in pointers){
        outPointers[bufferIndex] = {};
        for(var pointer in pointers[bufferIndex]){
            outPointers[bufferIndex][pointer] = pointers[bufferIndex][pointer].copy();
            outPointers[bufferIndex][pointer].isDirty = true;
        }
    }
    for(var buffer in divisors){
        outDivisors[buffer] = {};
        for(var divisor in divisors[buffer]){
            outDivisors[buffer][divisor] = divisors[buffer][divisor].copy();
            outDivisors[buffer][divisor].isDirty = true;
        }
    }

    return out;
};

Vao.prototype._bindBuffer = function(vbo){
    var gl = this._gl;
    var target = vbo.getTarget();
    var buffers = this._buffers[target];

    if(buffers.indexOf(vbo) == -1){
        buffers.push(vbo);
        if(target == gl.ARRAY_BUFFER){
            var index = buffers.length - 1;
            this._vertexAttribArrays[index]   = {};
            this._vertexAttribPointers[index] = {};
            this._vertexAttribDivisors[index] = {};
        }
    }

    this._bufferStack[target].push(vbo);
};

Vao.prototype._unbindBuffer = function(vbo) {
    var target  = vbo.getTarget();
    var buffers = this._buffers[target];
    var index = buffers.indexOf(vbo);
    if (index == -1) {
        throw new Error('Buffer not bound.');
    }
    var stack_ = this._bufferStack[target];
    if(stack_.isEmpty()){
        throw new Error('No buffer associated with vao.');
    }

    if(stack_.peek() != this){
        throw new Error('Buffer previously not bound.');
    }

    stack_.pop();
};

function safeResolve(attrib,index,type_ctor){
    attrib[index] = attrib[index] === undefined ? new type_ctor() : attrib[index];
    return attrib[index];
}

Vao.prototype.enableVertexAttribArray = function(index){
    if(stack[this._gl.id].isEmpty() || stack[this._gl.id].peek() != this){
        throw new Error('Vao not bound.');
    }

    var target = this._gl.ARRAY_BUFFER;
    var bufferIndex = this._buffers[target].indexOf(this._bufferStack[target].peek());
    if(bufferIndex == -1){
        throw new Error('No gl.ARRAY_BUFFER target bound.');
    }

    var vertexAttribArrays = this._vertexAttribArrays[bufferIndex];
    var array = safeResolve(vertexAttribArrays,index,VertexAttribArray);
    array.enabled = true;
};

Vao.prototype.disableVertexAttribArray = function(index){
    if(stack[this._gl.id].isEmpty() || stack[this._gl.id].peek() != this){
        throw new Error('Vao not bound.');
    }

    var target = this._gl.ARRAY_BUFFER;
    var bufferIndex = this._buffers[target].indexOf(this._bufferStack[target].peek());
    if(bufferIndex == -1){
        throw new Error('No gl.ARRAY_BUFFER target bound.');
    }

    var vertexAttribArrays = this._vertexAttribArrays[bufferIndex];
    var array = safeResolve(vertexAttribArrays,index,VertexAttribArray);
    array.enabled = false;
};

Vao.prototype.vertexAttribPointer = function(index,size,type,normalized,stride,offset){
    if(stack[this._gl.id].isEmpty() || stack[this._gl.id].peek() != this){
        throw new Error('Vao not bound.');
    }

    var target = this._gl.ARRAY_BUFFER;
    var bufferIndex = this._buffers[target].indexOf(this._bufferStack[target].peek());
    if(bufferIndex == -1){
        throw new Error('No gl.ARRAY_BUFFER target bound.');
    }

    var vertexAttribPointers = this._vertexAttribPointers[bufferIndex];
    var pointer = safeResolve(vertexAttribPointers,index,VertexAttribPointer);
    pointer.size = size;
    pointer.type = type;
    pointer.normalized = normalized;
    pointer.stride = stride;
    pointer.offset = offset;
    pointer.isDirty = true;
};

Vao.prototype.vertexAttribDivisor = function(index,divisor){
    if(stack[this._gl.id].isEmpty() || stack[this._gl.id].peek() != this){
        throw new Error('Vao not bound.');
    }

    var vertexAttribDivisors = this._vertexAttribDivisors[this._bufferStack[target].peek()];
    var divisor_ = safeResolve(vertexAttribDivisors,index,VertexAttribDivisor);
    divisor_.divisor = divisor;
    divisor_.isDirty = true;
};

Vao.prototype.getVertexAttribArrays = function(buffer){
    if(buffer === undefined){
        return this._vertexAttribArrays;
    }

    var target = buffer.getTarget();
    if(target != this._gl.ARRAY_BUFFER){
        throw new Error('Buffer target must be gl.ARRAY_BUFFER.');
    }

    var bufferIndex = this._buffers[target].indexOf(buffer);
    if(bufferIndex == -1){
        throw new Error('Buffer previously not bound.');
    }

    return this._vertexAttribArrays[buffer];
};

Vao.prototype.getVertexAttribPointers = function(buffer){
    if(buffer == undefined){
        return this._vertexAttribPointers;
    }

    var target = buffer.getTarget();
    if(target != this._gl.ARRAY_BUFFER){
        throw new Error('Buffer target must be gl.ARRAY_BUFFER.');
    }

    var bufferIndex = this._buffers[target].indexOf(buffer);
    if(bufferIndex == -1){
        throw new Error('Buffer previously not bound.');
    }

    return this._vertexAttribPointers[bufferIndex];
};

Vao.prototype.getVertexAttribDivisors = function(buffer){
    if(buffer == undefined){
        return this._vertexAttribDivisors;
    }

    var target = buffer.getTarget();
    if(target != this._gl.ARRAY_BUFFER){
        throw new Error('Buffer target must be gl.ARRAY_BUFFER.');
    }

    var bufferIndex = this._buffers[target].indexOf(buffer);
    if(bufferIndex == -1){
        throw new Error('Buffer previously not bound.');
    }

    return this._vertexAttribDivisors[bufferIndex];
};

Vao.prototype.apply = function(){
    var gl = this._gl;
    var glid = gl.id;

    var vaoActiveDiffers = active[glid] != this;

    var buffers;
    var vertexAttribArrays = this._vertexAttribArrays;
    var vertexAttribPointers = this._vertexAttribPointers;
    var vertexAttribDivisors = this._vertexAttribDivisors;

    var buffer;
    var bufferArrays, bufferPointers, bufferDivisors;
    var array, pointer, divisor;
    var indexNum;

    buffers = this._buffers[gl.ARRAY_BUFFER];

    for(var i = 0, l = buffers.length; i < l; ++i){
        buffer = buffers[i];
        buffer._bindInternal();

        bufferArrays   = vertexAttribArrays[i];
        bufferPointers = vertexAttribPointers[i];
        bufferDivisors = vertexAttribDivisors[i];

        for(var index in bufferArrays){
            array    = bufferArrays[index];
            pointer  = bufferPointers[index];
            indexNum = +index;

            if(!array.enabled && (array.prevEnabled || vaoActiveDiffers)){
                gl.disableVertexAttribArray(indexNum);
                array.enabled = array.prevEnabled = false;
                continue;
            }
            if(!array.prevEnabled || vaoActiveDiffers){
                gl.enableVertexAttribArray(indexNum);
                array.prevEnabled = true;
            }

            if(pointer === undefined){
                throw new Error('No VertexAttribPointer set.');
            }

            if(pointer.isDirty || vaoActiveDiffers){
                gl.vertexAttribPointer(
                    indexNum,
                    pointer.size,
                    pointer.type,
                    pointer.normalized,
                    pointer.stride,
                    pointer.offset
                );
                pointer.isDirty = false;
            }

            divisor = bufferDivisors[index];
            if(divisor === undefined || !divisor.isDirty || !vaoActiveDiffers){
                continue;
            }
            gl.vertexAttribDivisor(
                indexNum,
                divisor.divisor
            )
        }
    }

    var elementArrayBufferStack = this._bufferStack[gl.ELEMENT_ARRAY_BUFFER];
    if(!elementArrayBufferStack.isEmpty()){
        elementArrayBufferStack.peek()._bindInternal();
    }

    active[glid] = this;
};

Vao.prototype.bind = function(){
    stack[this._gl.id].push(this);
};

Vao.prototype.unbind = function(){
    var stack_ = stack[this._gl.id];
    if(stack_.isEmpty() || stack_.peek() != this){
        throw new Error('Vao previously not bound.');
    }
    stack_.pop();
};

Vao.prototype.getParameter = function(cap){
    var gl = this._gl;
    switch(cap){
        case gl.ELEMENT_ARRAY_BUFFER_BINDING:
            var stack_ = this._bufferStack[gl.ELEMENT_ARRAY_BUFFER];
            return stack_.isEmpty() ? undefined : stack_.peek();
            break;
        case gl.ARRAY_BUFFER_BINDING:
            var stack_ = this._bufferStack[gl.ARRAY_BUFFER];
            return stack_.isEmpty() ? undefined : stack_.peek();
            break;
        default:
            throw Error('fds');
    }
};

Vao.prototype.getId = function(){
    return this._id;
};

Vao.__getStack = function(){
    return stack;
};

module.exports = Vao;