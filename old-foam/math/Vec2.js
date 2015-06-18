var Vec3 = require('./Vec3'),
    Random = require('./Random');

var RANDOM_DIR_RANGE = [-1,1];

/**
 * 2d Vector
 * @param {Number} [x] - x component
 * @param {Number} [y] - y component
 * @constructor
 */

function Vec2(x,y){
    /**
     * x component
     * @type {Number}
     */
    this.x = x || 0;
    /**
     * y component
     * @type {Number}
     */
    this.y = y || 0;
}

/**
 * Sets the vector from another vector.
 * @param {Vec2} v
 * @returns {Vec2}
 */

Vec2.prototype.set = function(v){
    this.x = v.x;
    this.y = v.y;
    return this;
};

/**
 * Sets the vector from xy components.
 * @param x
 * @param y
 * @returns {Vec2}
 */

Vec2.prototype.setf = function(x,y){
    this.x = x;
    this.y = y;
    return this;
};

/**
 * Sets the vector xyz components to the same value.
 * @param x
 * @returns {Vec2}
 */

Vec2.prototype.set1f = function(x) {
    this.x = this.y = x;
    return this;
};

/**
 * Return a copy of the vector.
 * @param {Vec2} [v] - Out vector
 * @returns {Vec2}
 */

Vec2.prototype.copy = function(v){
    return (v || new Vec2()).setf(this.x,this.y);
};

/**
 * Adds a vector.
 * @param {Vec2} v - Another vector
 * @returns {Vec2}
 */

Vec2.prototype.add = function(v){
    this.x += v.x;
    this.y += v.y;
    return this;
};

/**
 * Adds xyz components.
 * @param {Number} x - x component
 * @param {Number} y - y component
 * @returns {Vec2}
 */

Vec2.prototype.addf = function(x,y){
    this.x += x;
    this.y += y;
    return this;
};

/**
 * Add xy components
 * @param {Number} x - xy component
 * @returns {Vec2}
 */

Vec2.prototype.add1f = function(x){
    this.x += x;
    this.z += x;
    return this;
};

/**
 * Substracts a vector.
 * @param {Number} x - x component
 * @param {Number} y - y component
 * @returns {Vec2}
 */

Vec2.prototype.sub = function(v){
    this.x -= v.x;
    this.y -= v.y;
    return this;
};

/**
 * Subs xy components
 * @param {Number} x - x component
 * @param {Number} y - y component
 * @returns {Vec2}
 */

Vec2.prototype.subf = function(x,y){
    this.x -= x;
    this.y -= y;
    return this;
};

/**
 * Sub xy components
 * @param {Number} x - xy component
 * @returns {Vec2}
 */


Vec2.prototype.sub1f = function(x){
    this.x -= x;
    this.y -= x;
    return this;
};

/**
 * Scales the vector.
 * @param {Number} n - The scalar
 * @returns {Vec2}
 */

Vec2.prototype.scale = function(n){
    this.x *= n;
    this.y *= n;
    return this;
};

/**
 * Returns the dot product.
 * @param {Vec2} v - Another vector
 * @returns {Number}
 */

Vec2.prototype.dot =  function (v) {
    return this.x * v.x + this.y * v.y;
};

/**
 * Returns the cross product.
 * @param {Vec2} v
 * @returns {number}
 */

Vec2.prototype.cross = function(v){
    return this.x * v.y - this.y * v.x;
};

/**
 * Returns the cross product.
 * @param x
 * @param y
 * @returns {number}
 */

Vec2.prototype.crossf = function(x,y){
    return this.x * y - this.y * x;
};

/**
 * Returns the length of the vector.
 * @returns {number}
 */

Vec2.prototype.length = function(){
    var x = this.x,
        y = this.y;
    return Math.sqrt(x * x + y * y);
};

/**
 * Returns the length of the vector. (squared)
 * @returns {number}
 */

Vec2.prototype.lengthSq = function(){
    var x = this.x,
        y = this.y;
    return x * x + y * y;
};

/**
 * Normalizes the vector.
 * @returns {Vec2}
 */

Vec2.prototype.normalize = function(){
    var x = this.x,
        y = this.y;
    var l = Math.sqrt(x * x + y * y);

    if(l){
        l = 1.0 / l;
        this.x *= l;
        this.y *= l;
    }
    return this;
};

/**
 * Returns the distance to another vector.
 * @param {Vec2} v - Another vector
 * @returns {Number}
 */

Vec2.prototype.distance = function(v){
    var dx = v.x - this.x,
        dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Returns the distance to another vector. (squared)
 * @param {Vec2} v - Another vector
 * @returns {Number}
 */

Vec2.prototype.distanceSq = function(v){
    var dx = v.x - this.x,
        dy = v.y - this.y;
    return dx * dx + dy * dy;
};

/**
 * Returns the distance to another vector.
 * @param {Number} x
 * @param {Number} y
 * @returns {Number}
 */

Vec2.prototype.distancef = function(x,y){
    var dx = x - this.x,
        dy = y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Returns the distance to another vector. (squared)
 * @param {Number} x
 * @param {Number} y
 * @returns {Number}
 */

Vec2.prototype.distanceSq = function(x,y){
    var dx = x - this.x,
        dy = y - this.y;
    return dx * dx + dy * dy;
};

/**
 * Inverts the vector.
 * @returns {Vec2}
 */

Vec2.prototype.invert = function(){
    this.x *= -1;
    this.y *= -1;
    return this;
};

/**
 * Limits the vector length.
 * @param n
 */

Vec2.prototype.limit = function(n){
    var x = this.x,
        y = this.y;

    var dsq = x * x + y * y,
        lsq = n * n;

    if(lsq > 0 && dsq > lsq){
        var nd = n / Math.sqrt(dsq);
        this.x *= nd;
        this.y *= nd;
    }
};

Vec2.prototype.mult = function(v){
    this.x *= v.x;
    this.y *= v.y;
    return this;
};

Vec2.prototype.multf = function(x,y){
    this.x *= x;
    this.y *= y;
    return this;
};




/**
 * Add another vector to a copy of the vector. Return the copy.
 * @param {Vec2} v - Another vector
 * @param {Vec2} [out] - Out vector
 * @returns {Vec2}
 */

Vec2.prototype.added = function(v,out){
    return (out || new Vec2()).set(this).add(v);
};

/**
 * Substract  another vector to a copy of the vector. Return the copy.
 * @param {Vec2} v - Another vector
 * @param {Vec2} [out] - Out vector
 * @returns {Vec2}
 */

Vec2.prototype.subbed = function(v,out){
    return (out || new Vec2()).set(this).sub(v);
};

/**
 * Return a scaled copy of the vector.
 * @param {Number} n - Another vector
 * @param {Vec2} [out] - Out vector
 * @returns {Vec2}
 */

Vec2.prototype.scaled = function(n,out){
    return (out || new Vec2()).set(this).scale(n);
};

/**
 * Return a normalized copy of the vector.
 * @param {Vec2} [out] - Out vector
 * @returns {Vec2}
 */

Vec2.prototype.normalized = function(out){
    return (out || new Vec2()).set(this).normalize();
};

/**
 * Return a limited copy of the vector
 * @param {Vec2} [out] - Out vector
 * @returns {Vec2}
 */

Vec2.prototype.limited = function(n,out){
    return (out || new Vec2()).set(this).limit(n);
};

/**
 * Return an inverted copy of the vector
 * @param {Vec2} [out] - Out vector
 * @returns {Vec2}
 */

Vec2.prototype.inverted = function(out){
    return (out || new Vec2()).set(this).invert();
};

/**
 * Linear interpolation to vector.
 * @param {Vec2} [target] - The target
 * @param a
 */

Vec2.prototype.interpolateTo = function(target,a){
    var x = this.x, y = this.y;

    this.x = x + (target.x - x) * a;
    this.y = y + (target.y - y) * a;
    return this;
};

/**
 * Returns a new vector interpolated to target.
 * @param target
 * @param a
 * @param out
 */

Vec2.prototype.interpolatedTo = function(target,a,out){
    return this.copy(out).interpolateTo(target,a);
};

Vec2.prototype.lerp = Vec2.prototype.interpolateTo;

Vec2.prototype.slerp = function(target,t){
    var x, y, tx, ty, omega, sinOmega,
        _1_t, sinOmega_1_t, sinOmega_t, d;

    x  = this.x;
    y  = this.y;
    tx = target.x;
    ty = target.y;

    omega    = Math.acos(x * tx + y * ty);
    sinOmega = Math.sin(omega);

    _1_t = 1.0 - t;
    sinOmega_1_t = Math.sin(omega * _1_t) / sinOmega;
    sinOmega_t   = Math.sin(omega * t) / sinOmega;

    x = x * sinOmega_1_t + tx * sinOmega_t;
    y = y * sinOmega_1_t + ty * sinOmega_t;

    d = 1.0 / Math.sqrt(x * x + y * y);

    this.x = x * d;
    this.y = y * d;
    return this;
};

Vec2.prototype.lerped = Vec2.prototype.interpolatedTo;

Vec2.prototype.slerped = function(target,t,out){
    return this.copy(out).slerp(target,t);
};

/**
 * Returns true if both vector components are equal.
 * @param {Vec2} v
 * @returns {boolean}
 */

Vec2.prototype.equals = function(v){
    return this.x == v.x && this.y == v.y;
};

/**
 * Returns true if all vector components equal.
 * @param {Number} x
 * @param {Number} y
 * @returns {boolean}
 */

Vec2.prototype.equalsf = function(x,y){
    return this.x == x && this.y == y;
};

/**
 * Sets the vector to x=0,y=0.
 * @returns {Vec2}
 */

Vec2.prototype.toZero = function(){
    this.x = this.y = 0;
    return this;
};

/**
 * Returns true if x and z are 0.
 * @returns {boolean}
 */

Vec2.prototype.isZero = function(){
    return !this.x && !this.y;
};

/**
 * Sets the vector to x=0,y=0.
 * @returns {Vec2}
 */

Vec2.prototype.toZero = function(){
    this.x = this.y = 0;
    return this;
};

/**
 * Sets the vector to x=1,y=1.
 * @returns {Vec2}
 */

Vec2.prototype.toOne = function(){
    this.x = this.y = 1;
    return this;
};

/**
 * Sets the vector to x=MAX,y=MAX.
 * @returns {Vec2}
 */

Vec2.prototype.toMax = function(){
    this.x = this.y = Number.MAX_VALUE;
    return this;
};

/**
 * Sets the vector to x=-MAX,y=-MAX.
 * @returns {Vec2}
 */

Vec2.prototype.toMin = function(){
    this.x = this.y =-Number.MAX_VALUE;
    return this;
};

/**
 * Sets xy components to absolute values.
 * @returns {Vec2}
 */

Vec2.prototype.toAbs = function(){
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
    return this;
};

/**
 * Returns an absolute copy of the vector.
 * @param {Vec2}[out] - Optional out
 * @returns {Vec2}
 */

Vec2.prototype.abs = function(out){
    return (out || new Vec2()).set(this).toAbs();
};

/**
 * Returns a Float32Array representation of the vector
 * @param {Float32Array} [arr] - Out Float32Array
 * @param {Number} [offset=0] - The offset to be written to
 * @returns {Float32Array}
 */

Vec2.prototype.toFloat32Array = function(arr,offset){
    if(!arr && !offset){
        return new Float32Array([this.x,this.y]);
    }
    offset = offset || 0;
    arr[offset  ] = this.x;
    arr[offset+1] = this.y;
    return arr;
};

/**
 * Returns a new Vector with x=1,y=0.
 * @returns {Vec2}
 */

Vec2.xAxis = function(){
    return new Vec2(1,0);
};

/**
 * Returns a new Vector with x=0,y=1.
 * @returns {Vec2}
 */

Vec2.yAxis = function(){
    return new Vec2(0,1);
};

/**
 * Returns a new Vector with x=0,y=0.
 * @returns {Vec2}
 */

Vec2.zero = function(){
    return new Vec2();
};

/**
 * Returns a new Vector with x=1,y=1.
 * @returns {Vec2}
 */

Vec2.one = function(){
    return new Vec2(1,1);
};

/**
 * Returns a new Vector with x=MAX,y=MAX.
 * @returns {Vec2}
 */

Vec2.max = function(){
    return new Vec2(Number.MAX_VALUE,Number.MAX_VALUE);
};

/**
 * Returns a new Vector with x=-MAX,y=-MAX.
 * @returns {Vec2}
 */

Vec2.min = function(){
    return new Vec2(-Number.MAX_VALUE,-Number.MAX_VALUE);
};

/**
 * Sets the vector to random x,y components
 * @param {Number}[min=0]
 * @param {Number}[max=1]
 * @returns {Vec2}
 */

Vec2.prototype.random = function(min,max){
    this.setf(Random.randomFloat(),
              Random.randomFloat());

    switch (arguments.length){
        case 0:
            return this;
            break;
        case 1:
            max = arguments[0];
            min = 0;
            break;
        case 2:
            min = arguments[0];
            max = arguments[1];
            break;
    }
    return this.scale(max - min).add1f(min);
};

/**
 * Returns the direction to another vector.
 * @param v
 * @param {Vec2}[out] - Optional out
 * @returns {null||Vec2}
 */

Vec2.prototype.direction = function(v,out){
    if(v == this){
        return null;
    }
    return v.subbed(this,out).normalize();
};

/**
 * Sets the vector to a random position.
 * @param {Number} [min=0]
 * @param {Number} [min=1]
 * @returns {Vec2}
 */
//keep older versions valid for now
Vec2.prototype.randomPosition = Vec2.prototype.random;

/**
 * Sets the vector to a random direction.
 * @returns {Vec2}
 */

Vec2.prototype.randomDirection = function(){
    return this.random(RANDOM_DIR_RANGE[0],RANDOM_DIR_RANGE[1]).normalize();
};

/**
 * Return a string representation of the vector.
 * @returns {string}
 */

Vec2.prototype.toString = function(){
    return '[' + this.x + ',' + this.y + ']';
};

module.exports = Vec2;