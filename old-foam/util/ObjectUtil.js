var ObjectUtil = {
    /**
     * Returns true if an object is undefined.
     * @param {Object} obj - The object
     * @returns {Boolean}
     */
    isUndefined: function (obj) {
        return typeof obj === 'undefined';
    },

    /**
     * Returns true if an object is a Float32Array.
     * @param {Object} obj - The object
     * @returns {Boolean}
     */

    isFloat32Array: function (obj) {
        return obj instanceof  Float32Array;
    },

    /**
     * Ensures that an array is of type Float32Array.
     * @param {Array|Float32Array} arr - The array
     * @returns {Float32Array}
     */

    safeFloat32Array: function (arr) {
        return arr instanceof Float32Array ? arr : new Float32Array(arr);
    },

    /**
     * Ensures that an array is of type Uint16Array.
     * @param arr
     * @returns {Uint16Array}
     */

    safeUint16Array: function (arr) {
        return arr instanceof Uint16Array ? arr : new Uint16Array(arr);
    },

    /**
     * Ensures that an array is of type Uint32Array.
     * @param arr
     * @returns {Uint32Array}
     */

    safeUint32Array : function(arr){
        return arr instanceof Uint32Array ? arr : new Uint32Array(arr);
    },

    /**
     * Returns a copy of a Float32Array. (mainly cosmetic)
     * @param {Float32Array} arr - The array
     * @returns {Float32Array}
     */

    copyFloat32Array: function (arr) {
        return new Float32Array(arr);
    },

    /**
     * Returns a copy of an array.
     * @param {Array} arr - The array
     * @param {Array} [out] - Out array
     * @returns {Array}
     */

    copyArray: function (arr,out) {
        var i = -1, l = arr.length;
        out = out || [];
        out.length = l;
        while (++i < l) {
            out[i] = arr[i];
        }
        return out;
    },

    /**
     * Moves the content of one array to another.
     * @param {Array} a - To array
     * @param {Array} b - Fform array
     */

    setArray: function (a, b) {
        var i = -1, l = a.length;
        while (++i < l) {
            a[i] = b[i];
        }
    },

    /**
     * Shifts the indices within an index array by a certain offset.
     * @param {Array} arr - The array
     * @param {Nummber} offset - The offset to be shifted
     * @param {Array} [len] - The number of elements to be shifted
     */

    shiftIndexArray: function (arr, offset, len) {
        var i = -1, l = len || arr.length;
        while (++i < l) {
            arr[i] += offset;
        }
    },

    __toString: function (obj) {
        return Object.prototype.toString.call(obj);
    },

    /**
     * Returns true if oject is array.
     * @param {Object} obj - The object
     * @returns {Boolean}
     */

    isArray: function (obj) {
        return this.__toString(obj) == '[object Array]';
    },

    /**
     * Returns true if object is object.
     * @param {Object} obj - The object
     * @returns {Boolean}
     */

    isObject: function (obj) {
        return obj === Object(obj)
    },

    /**
     * Returns true if object is function.
     * @param {Object} obj - The object
     * @returns {Boolean}
     */

    isFunction: function (obj) {
        return this.__toString(obj) == '[object Function]';
    },

    /**
     * Returns true if object is string..
     * @param {Object} obj - The object
     * @returns {Boolean}
     */

    isString: function (obj) {
        return this.__toString(obj) == '[object String]';
    },


    isNumber : function(obj){
        return this.__toString(obj) == '[object Number]';
    },

    /**
     * Returns true if object is Float64Array.
     * @param {Object} obj - The object
     * @returns {Boolean}
     */

    isFloat64Array: function (obj) {
        return this.__toString(obj) == '[object Float64Array]'
    },

    /**
     * Returns true if object is Uint8Array.
     * @param {Object} obj - The object
     * @returns {Boolean}
     */

    isUint8Array: function (obj) {
        return this.__toString(obj) == '[object Uint8Array]';
    },

    /**
     * Returns true if object is Uint16Array.
     * @param {Object} obj - The object
     * @returns {Boolean}
     */

    isUint16Array: function (obj) {
        return this.__toString(obj) == '[object Uint16Array]'
    },

    /**
     * Returns true if object is Uint16Array.
     * @param {Object} obj - The object
     * @returns {Boolean}
     */

    isUint32Array: function (obj) {
        return this.__toString(obj) == '[object Uint32Array]'
    },

    /**
     * Returns true if object is a typed array.
     * @param {Object} obj - The object
     * @returns {Boolean}
     */

    isTypedArray: function (obj) {
        return this.isUint8Array(obj) ||
            this.isUint16Array(obj) ||
            this.isUint32Array(obj) ||
            this.isFloat32Array(obj) ||
            this.isFloat32Array(obj);
    },

    /**
     * Returns an object keys.
     * @param {Object} obj - The object
     * @returns {Array}
     */

    getKeys : function(obj){
        if(Object.keys){
            return Object.keys(obj);
        }
        var keys = [];
        for(key in obj){
            if(obj.hasOwnProperty(key)){
                keys.push(key);
            }
        }
        return keys;
    },


    setVec3Array : function(float32Array, index, vec3){
        index = index * 3;
        float32Array[index  ] = vec3.x;
        float32Array[index+1] = vec3.y;
        float32Array[index+2] = vec3.z;
    }
};

module.exports = ObjectUtil;
