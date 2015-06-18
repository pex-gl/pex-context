var ObjectUtil = require('../util/ObjectUtil');

var seed_ = null;

function random(){
    if(ObjectUtil.isUndefined(seed_) || seed_ === null){
        return Math.random();
    }
    // v8
    // http://octane-benchmark.googlecode.com/svn/latest/base.js
    // Robert Jenkins' 32 bit integer hash function.
    seed_ = ((seed_ + 0x7ed55d16) + (seed_ << 12))  & 0xffffffff;
    seed_ = ((seed_ ^ 0xc761c23c) ^ (seed_ >>> 19)) & 0xffffffff;
    seed_ = ((seed_ + 0x165667b1) + (seed_ << 5))   & 0xffffffff;
    seed_ = ((seed_ + 0xd3a2646c) ^ (seed_ << 9))   & 0xffffffff;
    seed_ = ((seed_ + 0xfd7046c5) + (seed_ << 3))   & 0xffffffff;
    seed_ = ((seed_ ^ 0xb55a4f09) ^ (seed_ >>> 16)) & 0xffffffff;
    return (seed_ & 0xfffffff) / 0x10000000;
}

var Random = {
    /**
     * Sets the seed, null if buildin Math.random
     * @param seed
     */
    setSeed : function(seed){
        seed_ = seed;
    },

    /**
     * Returns the current seed
     * @param seed
     * @returns {*}
     */

    getSeed : function(){
        return seed_;
    },

    /**
     * Returns a random float
     */

    random : random,

    /**
     * Generate a random float.
     * @param {Number} [min=0] - min
     * @param {Number} [max=1] - max
     * @returns {Number}
     */
    randomFloat: function () {
        var r;

        switch (arguments.length) {
            case 0:
                r = random();
                break;
            case 1:
                r = random() * arguments[0];
                break;
            case 2:
                r = arguments[0] + (arguments[1] - arguments[0]) * random();
                break;
        }

        return r;
    },

    /**
     * Generate a random Integer
     * @param {Number} [min=0] - min
     * @param {Number} [max=1] - max
     * @returns {Number}
     */

    randomInteger: function () {
        var r;

        switch (arguments.length) {
            case 0:
                r = 0.5 + random();
                break;
            case 1:
                r = 0.5 + random() * arguments[0];
                break;
            case 2:
                r = arguments[0] + ( 1 + arguments[1] - arguments[0]) * random();
                break;
        }

        return Math.floor(r);
    }
};

module.exports = Random;