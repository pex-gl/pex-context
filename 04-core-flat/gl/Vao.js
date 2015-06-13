var Window = require('../sys/Window');
var Id     = require('../sys/Id');
var Vbo    = require('./Vbo');

var curr = {};
var prev = {};

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
    this._gl = Window.getCurrentContext();
    this._buffers    = {};
    this._bufferCurr = {};
    this._bufferPrev = {};

    var gl = this._gl;
    var targets = [gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER];

    for(var i = 0, target; i < targets.length; ++i){
        target = targets[i];
        this._buffers[target]    = [];
        this._bufferCurr[target] = null;
        this._bufferPrev[target] = null;
    }

    this._vertexAttribArrays   = {};
    this._vertexAttribPointers = {};
    this._vertexAttribDivisors = {};

    this._id = Id.get();
}

Vao.prototype.copy = function(){
    var gl  = this._gl;
    var out = new Vao();

    var buffers    = this._buffers;
    var bufferCurr = this._bufferCurr;

    var outBuffers    = out._buffers;
    var outBufferCurr = out._bufferCurr;

    var targets = [gl.ARRAY_BUFFER, gl.ELEMENT_ARRAY_BUFFER];

    for(var i = 0, target; i < targets.length; ++i){
        target = targets[i];
        outBuffers[target]    = buffers[target].slice(0);
        outBufferCurr[target] = bufferCurr[target];
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

Vao.prototype.bindBuffer = function(vbo){
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

    this._bufferPrev[target] = this._bufferCurr[target];
    this._bufferCurr[target] = vbo;
};

Vao.prototype.bindBufferAtIndex = function(vbo,index){
    var target  = vbo.getTarget();
    var buffers = this._buffers[target];
    var bufferAtIndex = buffers[index];
    if(bufferAtIndex === undefined){
        throw new RangeError('Buffer index out of range.');
    }
    if(this._bufferCurr[target] == bufferAtIndex){
        this._bufferCurr[target] = vbo;
    }
    if(this._bufferPrev[target] == bufferAtIndex){
        this._bufferPrev[target] = vbo;
    }
    buffers[index] = vbo;
};

Vao.prototype.unbindBuffer = function(vbo) {
    var target  = vbo.getTarget();
    var buffers = this._buffers[target];
    var index = buffers.indexOf(vbo);
    if (index == -1) {
        throw new Error('Buffer not bound.');
    }
    this._bufferCurr[target] = this._bufferPrev[target];
    this._bufferCurr[target].bind();
};

Vao.prototype.removeBuffer = function(vbo){
    var target  = vbo.getTarget();
    var buffers = this._buffers[target];
    var index = buffers.indexOf(vbo);
    if (index == -1) {
        throw new Error('Buffer not bound.');
    }
    buffers.splice(index, 1);
    if(target != gl.ARRAY_BUFFER){
        return;
    }
    delete this._vertexAttribArrays[index];
    delete this._vertexAttribPointers[index];
};

Vao.prototype.setActiveElementArrayBuffer = function(indexOrBuffer){
    var target = this._gl.ELEMENT_ARRAY_BUFFER;
    var buffers = this._buffers[target];
    if(indexOrBuffer instanceof Vbo){
        if(buffers.indexOf(indexOrBuffer) == -1){
            throw new Error('Buffer previously not bound.');
        }
        this._bufferCurr[target] = indexOrBuffer;
    } else if(typeof indexOrBuffer === 'number' ){
        var buffer = buffers[indexOrBuffer];
        if(buffer === undefined){
            throw new RangeError('Buffer index out of bounds.');
        }
        this._bufferCurr[target] = buffer;
    }
};

Vao.prototype.hasBuffer = function(vbo){
    return this._buffers[vbo.getTarget()].indexOf(vbo) != -1;
};

Vao.prototype.getCurrentBuffer = function(target){
    return this._bufferCurr[target];
};

function safeResolve(attrib,index,type_ctor){
    attrib[index] = attrib[index] === undefined ? new type_ctor() : attrib[index];
    return attrib[index];
}

Vao.prototype.enableVertexAttribArray = function(index){
    var target = this._gl.ARRAY_BUFFER;
    var bufferIndex = this._buffers[target].indexOf(this._bufferCurr[target]);
    var vertexAttribArrays = this._vertexAttribArrays[bufferIndex];
    var array = safeResolve(vertexAttribArrays,index,VertexAttribArray);
    array.enabled = true;
};

Vao.prototype.disableVertexAttribArray = function(index){
    var target = this._gl.ARRAY_BUFFER;
    var bufferIndex = this._buffers[target].indexOf(this._bufferCurr[target]);
    var vertexAttribArrays = this._vertexAttribArrays[bufferIndex];
    var array = safeResolve(vertexAttribArrays,index,VertexAttribArray);
    array.enabled = false;
};

Vao.prototype.vertexAttribPointer = function(index,size,type,normalized,stride,offset){
    var target = this._gl.ARRAY_BUFFER;
    var bufferIndex = this._buffers[target].indexOf(this._bufferCurr[target]);
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
    var vertexAttribDivisors = this._vertexAttribDivisors[this._arrayBuffers.indexOf(this._arrayBufferCurr)];
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

Vao.prototype.bind = function(){
    var gl = this._gl

    prev[gl] = curr[gl];
    var vaoDiffers = curr[gl] == prev[gl];

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
        buffer.bind();

        bufferArrays   = vertexAttribArrays[i];
        bufferPointers = vertexAttribPointers[i];
        bufferDivisors = vertexAttribDivisors[i];

        for(var index in bufferArrays){
            array    = bufferArrays[index];
            indexNum = +index;

            if(!array.enabled && (array.prevEnabled || vaoDiffers)){
                gl.disableVertexAttribArray(indexNum);
                array.enabled = array.prevEnabled = false;
                continue;
            }
            if(!array.prevEnabled || vaoDiffers){
                gl.enableVertexAttribArray(indexNum);
                array.prevEnabled = true;
            }

            pointer = bufferPointers[index];
            if(pointer === undefined){
                throw new Error('No VertexAttribPointer set.');
            }
            if(pointer.isDirty){
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
            if(divisor === undefined || !divisor.isDirty){
                continue;
            }
            gl.vertexAttribDivisor(
                indexNum,
                divisor.divisor
            )
        }
    }

    var elementArrayBuffer = this._bufferCurr[gl.ELEMENT_ARRAY_BUFFER];
    if(elementArrayBuffer !== null){
        elementArrayBuffer.bind();
    }

    curr[gl] = this;
};

Vao.prototype.unbind = function(){
    var gl = this._gl;
    var prevVao = prev[gl];

    curr[gl] = prevVao;
    if(prevVao == this || !prevVao){
        return;
    }

    prevVao.bind();
};

Vao.getCurrent = function(gl){
    return curr[gl];
};

module.exports = Vao;