var StringUtil = {
    /**
     * Returns the body of a fucntion as a string.
     * @param {Function} func - The function
     * @returns {String}
     */

    getFunctionBody: function (func) {
        return (func).toString().match(/function[^{]+\{([\s\S]*)\}$/)[1];
    },

    /**
     * Returns a string representation of an object.
     * @param {Object} obj - The object
     * @returns {String}
     */

    toString: function (obj) {
        return this.isFunction(obj) ? this.getFunctionString(obj) :
            this.isArray(obj) ? this.getArrayString(obj) :
                this.isString(obj) ? this.getString(obj) :
                    this.isTypedArray(obj) ? this.getTypedArrayString(obj) :
                        this.isObject(obj) ? this.getObjectString(obj) :
                            obj;
    },

    /**
     * Returns a string representation of a typed array.
     * @param {Object} obj - The object
     * @returns {String}
     */

    getTypedArrayString: function (obj) {
        if (!this.isFloat32Array(obj)) {
            throw new TypeError('Object must be of type Float32Array');
        }

        if (obj.byteLength == 0)return '[]';
        var out = '[';

        for (var p in obj) {
            out += obj[p] + ',';
        }

        return out.substr(0, out.lastIndexOf(',')) + ']';
    },

    getString: function (obj) {
        return '"' + obj + '"';
    },

    /**
     * Returns a string representation of an array.
     * @param {Object} obj - The object
     * @returns {String}
     */

    getArrayString: function (obj) {
        if (!this.isArray(obj)) {
            throw new TypeError('Object must be of type array.');
        }
        var out = '[';
        if (obj.length == 0) {
            return out + ']';
        }

        var i = -1;
        while (++i < obj.length) {
            out += this.toString(obj[i]) + ',';
        }

        return out.substr(0, out.lastIndexOf(',')) + ']';
    },

    /**
     * Returns a a string representation of an object.
     * @param {Object} obj - The object
     * @returns {String}
     */

    getObjectString: function (obj) {
        if (!this.isObject(obj)) {
            throw new TypeError('Object must be of type object.')
        }
        var out = '{';
        if (Object.keys(obj).length == 0) {
            return out + '}';
        }

        for (var p in obj) {
            out += p + ':' + this.toString(obj[p]) + ',';
        }

        return out.substr(0, out.lastIndexOf(',')) + '}';
    },


    /**
     * Returns a string representation of a function or class.
     * @param {Function} obj - The function or class
     * @returns {string}
     *
     * If class:
     *
     * function ClassB(){
     *      ClassB.apply(this,arguments);ClassB.call...
     *  }
     *
     *  ClassB.prototype = Object.create(ClassA.prototype)
     *
     *  ClassB.prototype.method = function(){};
     *
     *  ClassB.STATIC = 1;
     *  ClassB.STATIC_OBJ = {};
     *  ClassB.STATIC_ARR = [];
     *
     */

    getFunctionString: function (obj) {
        if (!this.isFunction(obj)) {
            throw new TypeError('Object must be of type function.');
        }

        var out = '';

        var name = obj.name,
            constructor = obj.toString(),
            inherited = 1 + constructor.indexOf('.call(this') || 1 + constructor.indexOf('.apply(this');

        out += constructor;

        if (inherited) {
            out += '\n\n';
            inherited -= 2;

            var baseClass = '';
            var char = '',
                i = 0;
            while (char != ' ') {
                baseClass = char + baseClass;
                char = constructor.substr(inherited - i, 1);
                ++i;
            }
            out += name + '.prototype = Object.create(' + baseClass + '.prototype);';
        }

        for (var p in obj) {
            out += '\n\n' + name + '.' + p + ' = ' + this.toString(obj[p]) + ';';
        }

        var prototype = obj.prototype;
        for (var p in prototype) {
            if (prototype.hasOwnProperty(p)) {
                out += '\n\n' + name + '.prototype.' + p + ' = ' + this.toString(prototype[p]) + ';';

            }
        }

        return out;
    }
};

module.exports = StringUtil;