
var WorkerConsole = {
    ObjectUtil : {
        getFunctionBody : function(func){
            return (func).toString().match(/function[^{]+\{([\s\S]*)\}$/)[1];
        },

        __toString : function(obj){
            return Object.prototype.toString.call(obj);
        },

        isArray : function(obj){
            return this.__toString(obj) == '[object Array]';
        },

        isObject : function(obj){
            return obj === Object(obj)
        },

        isFunction : function(obj){
            return this.__toString(obj) == '[object Function]';
        },

        isString : function(obj){
            return this.__toString(obj) == '[object String]';
        },

        isFloat32Array : function(obj){
            return this.__toString(obj) == '[object Float32Array]'
        },

        isFloat64Array : function(obj){
            return this.__toString(obj) == '[object Float64Array]'
        },

        isUint8Array : function(obj){
            return this.__toString(obj) == '[object Uint8Array]';
        },

        isUint16Array : function(obj){
            return this.__toString(obj) == '[object Uint16Array]'
        },

        isUint32Array : function(obj){
            return this.__toString(obj) == '[object Uint32Array]'
        },

        isTypedArray : function(obj){
            return this.isUint8Array(obj) ||
                this.isUint16Array(obj) ||
                this.isUint32Array(obj) ||
                this.isFloat32Array(obj) ||
                this.isFloat32Array(obj);
        },

        toString : function(obj){
            return this.isFunction(obj) ? this.getFunctionString(obj) :
                this.isArray(obj) ? this.getArrayString(obj) :
                    this.isString(obj) ? this.getString(obj) :
                        this.isTypedArray(obj) ? this.getTypedArrayString(obj) :
                            this.isObject(obj) ? this.getObjectString(obj) :
                                obj;
        },

        getTypedArrayString : function(obj){
            if(!this.isFloat32Array(obj)){
                throw new TypeError('Object must be of type Float32Array');
            }

            if(obj.byteLength == 0)return '[]';
            var out = '[';

            for(var p in obj){
                out += obj[p] + ',';
            }

            return out.substr(0,out.lastIndexOf(',')) + ']';

        },

        getString : function(obj){
            return '"' + obj + '"';
        },

        getArrayString : function(obj){
            if(!this.isArray(obj)){
                throw new TypeError('Object must be of type array.');
            }
            var out = '[';
            if(obj.length == 0){
                return out + ']';
            }

            var i = -1;
            while(++i < obj.length){
                out += this.toString(obj[i]) + ',';
            }

            return out.substr(0,out.lastIndexOf(',')) + ']';
        },

        getObjectString : function(obj){
            if(!this.isObject(obj)){
                throw new TypeError('Object must be of type object.')
            }
            var out = '{';
            if(Object.keys(obj).length == 0){
                return out + '}';
            }

            for(var p in obj){
                out += p + ':' + this.toString(obj[p]) +',';
            }

            return out.substr(0,out.lastIndexOf(',')) + '}';
        },

        //
        //  Parses func to string,
        //  must satisfy (if 'class'):
        //
        //  function ClassB(){
        //      ClassB.apply(this,arguments);ClassB.call...
        //  }
        //
        //  ClassB.prototype = Object.create(ClassA.prototype)
        //
        //  ClassB.prototype.method = function(){};
        //
        //  ClassB.STATIC = 1;
        //  ClassB.STATIC_OBJ = {};
        //  ClassB.STATIC_ARR = [];
        //

        getFunctionString : function(obj){
            if(!this.isFunction(obj)){
                throw new TypeError('Object must be of type function.');
            }

            var out = '';

            var name        = obj.name,
                constructor = obj.toString(),
                inherited   = 1 + constructor.indexOf('.call(this') || 1 + constructor.indexOf('.apply(this');

            out += constructor;

            if(inherited){
                out += '\n\n';
                inherited -= 2;

                var baseClass = '';
                var char = '',
                    i = 0;
                while(char != ' '){
                    baseClass = char + baseClass;
                    char = constructor.substr(inherited-i,1);
                    ++i;
                }
                out += name + '.prototype = Object.create(' + baseClass + '.prototype);';
            }

            for(var p in obj){
                out += '\n\n' + name + '.' + p + ' = ' + this.toString(obj[p]) + ';';
            }

            var prototype = obj.prototype;
            for(var p in prototype){
                if(prototype.hasOwnProperty(p)){
                    out +=  '\n\n' + name + '.prototype.' + p +  ' = ' + this.toString(prototype[p]) + ';';

                }
            }

            return out;
        }},

    __formatTypedArray : function(type,data,detailed){
        var length = data.length;
        var out = type +'['+length+']' + (length > 0 ? '\n' : '');

        if(detailed){
            var step   = Math.min(length,100),
                step_i = 0;

            var i = -1;
            while(++i < length){
                if(i % step == 0){
                    out+='[' + (step_i ) + '...' + Math.min(length,step_i + step - 1) + ']\n';
                    step_i += step;
                }
                out += '  ' + i + ' : ' + data[i] + '\n';
            }
        }

        return out.substr(0,out.lastIndexOf('\n'));
    },

    format : function(data, detailed){
        var ObjectUtil = this.ObjectUtil;
        detailed = (typeof detailed === 'undefined') ? false : detailed;
        return ObjectUtil.isFunction(data) ? ObjectUtil.getFunctionString(data) :
            ObjectUtil.isArray(data) ? ObjectUtil.getArrayString(data) :
                ObjectUtil.isString(data) ? ObjectUtil.getString(data) :
                    ObjectUtil.isUint8Array(data) ? this.__formatTypedArray('Uint8Array',data,detailed) :
                        ObjectUtil.isUint16Array(data) ? this.__formatTypedArray('Uint16Array',data,detailed) :
                            ObjectUtil.isUint32Array(data) ? this.__formatTypedArray('Uint32Array',data,detailed) :
                                ObjectUtil.isFloat32Array(data) ? this.__formatTypedArray('Float32Array',data,detailed) :
                                    ObjectUtil.isFloat64Array(data) ? this.__formatTypedArray('Float64Array',data,detailed) :
                                        ObjectUtil.isObject(data) ? ObjectUtil.getObjectString(data) :
                                            data;
    },

    __MSG_LOG : 'worker_console_log',

    /**
     * A console for webworkers
     */

    console : {
        format:function(data,detailed){
            return WorkerConsole.format(data,detailed);
        },
        log:function(data,detailed){
            self.postMessage({msg:WorkerConsole.__MSG_LOG,data:this.format(data,detailed)});
        }
    },

    /**
     * Setup console listener for worker.
     * @param {Worker} worker - The worker
     */

    addListener : function(worker){
        worker.addEventListener('message',function(e){
            var dataObj = e.data;
            if(dataObj.msg && dataObj.msg == WorkerConsole.__MSG_LOG){
                console.log(dataObj.data);
            }
        })
    }
};

module.exports = WorkerConsole;