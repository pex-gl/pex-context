var ObjectUtil = require('./ObjectUtil');

var ArrayUtil = {
    /**
     * Creates an array of elements of a certain length,
     * if only length is passed an array of undefined is created.
     *
     * var array = createArray(10,0,1,2,3);
     * [0,1,2,3,0,1,2,3,0,1,2,3,...]
     *
     * @param {Number} length - The length
     * @param ... objs
     * @returns {Array}
     */
    createArray: function (length) {
        var args = Array.prototype.slice.call(arguments, 1);

        var argsLen = args.length;
        var arr = [];
        if (argsLen == 0) {
            arr.length = length;
            return arr;
        }
        length = length * argsLen;
        var i = 0;
        while (arr.length != length) {
            arr.push(args[(i++) % argsLen])
        }
        return arr;
    },

    /**
     * Creates an array with obj instances of a certain length.
     * @param {Number} length - The length
     * @param {Class} classObj - The class
     * @returns {Array}
     */

    createObjArray : function(length,classObj){
        var arr = new Array(length);
        var i = -1;while(++i < length){
            arr[i] = new classObj();
        }
        return arr;
    },

    /**
     * Creates an array of obj instances of a certain length.
     * Instances are created via factory method.
     * @param {Number} length - The length
     * @param {Function} factMethod - The factory method
     * @returns {Array}
     */

    createFactObjArray : function(length,factMethod){
        var arr = new Array(length);
        var i = -1;while(++i < length){
            arr[i] = factMethod();
        }
        return arr;
    },

    /**
     * Appends an array to another array.
     * @param {Array} a - The array
     * @param {Array} b - The array to be appended
     * @returns {*}
     */

    appendArray: function (a, b) {
        a.push.apply(a, b);
        return a;
    },

    /**
     * Transforms an object to an array.
     * @param {Object} a - The object
     * @returns {Array}
     */

    toArray: function (a) {
        return Array.prototype.slice.call(a);
    },

    /*
    setArrayObj : function (arr, index) {
        var args = Array.prototype.slice.call(arguments, 2);
        var argsLen = args.length;
        if(argsLen == 0){
            return;
        }

        index *= argsLen;
        var i = -1;
        while(++i < argsLen){
            arr[index + i] = args[i];
        }
    },

    setArrayObj2: function (arr, index, obj2) {
        index *= 2;
        arr[index    ] = obj2[0];
        arr[index + 1] = obj2[1];
    },

    setArrayObj3: function (arr, index, obj3) {
        index *= 3;
        arr[index  ] = obj3[0];
        arr[index + 1] = obj3[1];
        arr[index + 2] = obj3[2];
    },

    setArrayObj4: function (arr, index, obj4) {
        index *= 4;
        arr[index    ] = obj4[0];
        arr[index + 1] = obj4[1];
        arr[index + 2] = obj4[2];
        arr[index + 3] = obj4[3];
    },

    fillArrayObj4 : function(arr, index, obj4){
        if(index >= arr.length){
            return arr;
        }
        var i = 0;
        var len = arr.length;
        while(index < len){
            arr[index++] = obj4[i++%4];
        }
        return arr;
    },

    forEachObj2 : function(arr,func,offset,length){
        var i = !offset ? 0 : offset,
            l = ObjectUtil.isUndefined(length) ? arr.length : length < offset ? offset : length;
        while(i < l){
            func(arr,i);
            i += 2;
        }
    },

    forEachObj3 : function(arr,func,offset,length){
        var i = !offset ? 0 : offset,
            l = ObjectUtil.isUndefined(length) ? arr.length : length < offset ? offset : length;
        while(i < l){
            func(arr,i);
            i += 3;
        }
    },

    forEachObj4 : function(arr,func,offset,length){
        var i = !offset ? 0 : offset,
            l = ObjectUtil.isUndefined(length) ? arr.length : length < offset ? offset : length;
        while(i < l){
            func(arr,i);
            i += 4;
        }
    },
    */

    /**
     * Returns true if the content of two arrays are equal.
     * @param {Array} a - One array
     * @param {Array} b - Another array
     * @returns {Boolean}
     */
    equalContent: function (a, b) {
        if (!a || !b || (!a && !b)) {
            return false;
        } else if (a.length != b.length) {
            return false
        } else {
            var i = -1, l = a.length;
            while (++i < l) {
                if (a[i] != b[i])return false;
            }
        }
        return true;
    },

    /**
     * Transforms an array of vec3s to a flat Float32Array.
     * @param vec3Array
     * @returns {Float32Array}
     */
    toFloat32Array : function(vec3Array){
        var array = new Float32Array(vec3Array.length * 3);
        var i = -1, l = vec3Array.length;
        var i3, point;
        while(++i < l){
            i3 = i * 3;
            point = vec3Array[i];
            array[i3  ] = point.x;
            array[i3+1] = point.y;
            array[i3+2] = point.z;
        }
        return array;
    },

    /**
     * Returns an untyped copy ot the array.
     * @param typedArray
     * @returns {Array.<T>}
     */
    toUntypedArray : function(typedArray){
        return Array.prototype.slice.call(typedArray);
    },

    /**
     * Appends the second array to the first, resturns the result.
     * @param typedArray0
     * @param typedArray1
     * @returns {Array.<T>}
     */

    typedArraysAppended : function(typedArray0,typedArray1){
        var arr = new typedArray0.constructor(typedArray0.length + typedArray1.length);
            arr.set(typedArray0);
            arr.set(typedArray1,typedArray0.length);
        return arr;
    }
};


module.exports = ArrayUtil;