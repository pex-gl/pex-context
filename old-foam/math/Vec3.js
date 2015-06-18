var Vec2 = require('./Vec2'),
    Random = require('./Random');

var RANDOM_DIR_RANGE = [-1,1];

/**
 * 3d Vector
 * @param {Number} [x] - x component
 * @param {Number} [y] - y component
 * @param {Number} [z] - z component
 * @constructor
 */

function Vec3(x,y,z) {
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
    /**
     * z component
     * @type {Number}
     */
    this.z = z || 0;
}

/**
 * Sets the vector from another vector.
 * @param {Vec3} v
 * @returns {Vec3}
 */

Vec3.prototype.set =  function(v){
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
};

/**
 * Set the vector from xyz components.
 * @param x
 * @param y
 * @param z
 * @returns {Vec3}
 */

Vec3.prototype.setf = function(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
};


/**
 * Sets the vector xyz components to the same value.
 * @param x
 * @returns {Vec3}
 */

Vec3.prototype.set1f = function(x){
    this.x = this.y = this.z = x;
    return this;
};

/**
 * Return a copy of the vector.
 * @param {Vec3} [v] - Out vector
 * @returns {Vec3}
 */

Vec3.prototype.copy = function(v){
    return (v || new Vec3()).setf(this.x,this.y,this.z);
};

/**
 * Add a vector.
 * @param {Vec3} v - Another vector
 * @returns {Vec3}
 */

Vec3.prototype.add = function(v){
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
};

/**
 * Add xyz components
 * @param {Number} x - x component
 * @param {Number} y - y component
 * @param {Number} z - z component
 * @returns {Vec3}
 */

Vec3.prototype.addf = function(x,y,z){
    this.x += x;
    this.y += y;
    this.z += z;
    return this;
};
/**
 * Add xyz components
 * @param {Number} x - xyz component
 * @returns {Vec3}
 */

Vec3.prototype.add1f = function(x){
    this.x += x;
    this.y += x;
    this.z += x;
    return this;
};

/**
 * Substract a vector.
 * @param {Number} x - x component
 * @param {Number} y - y component
 * @param {Number} z - z component
 * @returns {Vec3}
 */

Vec3.prototype.sub = function(v){
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
};

/**
 * Sub xyz components
 * @param {Number} x - x component
 * @param {Number} y - y component
 * @param {Number} z - z component
 * @returns {Vec3}
 */


Vec3.prototype.subf = function(x,y,z){
    this.x -= x;
    this.y -= y;
    this.z -= z;
    return this;
};

/**
 * Sub xyz components
 * @param {Number} x - xyz component
 * @returns {Vec3}
 */


Vec3.prototype.sub1f = function(x){
    this.x -= x;
    this.y -= x;
    this.z -= x;
    return this;
};

/**
 * Scale the vector.
 * @param {Number} n - The scalar
 * @returns {Vec3}
 */

Vec3.prototype.scale = function(n){
    this.x *= n;
    this.y *= n;
    this.z *= n;
    return this;
};

/**
 * Return the dot product.
 * @param {Vec3} v - Another vector
 * @returns {Number}
 */

Vec3.prototype.dot =  function (v) {
    return this.x * v.x + this.y * v.y +this.z * v.z;
};

/**
 * Return the cross product.
 * @param {Vec3} v - Another vector
 * @returns {Vec3}
 */

Vec3.prototype.cross =function (v) {
    var x = this.x,
        y = this.y,
        z = this.z;
    var vx = v.x,
        vy = v.y,
        vz = v.z;

    this.x = y * vz - vy * z;
    this.y = z * vx - vz * x;
    this.z = x * vy - vx * y;
    return this;
};

/**
 * Return the cross product.
 * @param {Number} x - x component
 * @param {Number} y - y component
 * @param {Number} z - z component
 * @returns {Vec3}
 */

Vec3.prototype.crossf = function(x,y,z){
    var _x = this.x,
        _y = this.y,
        _z = this.z;

    this.x = _y * z - y * _z;
    this.y = _z * x - z * _x;
    this.z = _x * y - x * _y;
    return this;
};

/**
 * Returns the length of the vector.
 * @returns {Number}
 */

Vec3.prototype.length = function(){
    var x = this.x,
        y = this.y,
        z = this.z;
    return Math.sqrt(x * x + y * y + z * z);
};

/**
 * Returns the length of the vector. (squared)
 * @returns {Number}
 */

Vec3.prototype.lengthSq = function(){
    var x = this.x,
        y = this.y,
        z = this.z;
    return x * x + y * y + z * z;
};

/**
 * Normalize the vector.
 * @returns {Vec3}
 */

Vec3.prototype.normalize = function(){
    var x = this.x,
        y = this.y,
        z = this.z;
    var l = Math.sqrt(x * x + y * y + z * z);

    if(l){
        l = 1.0 / l;
        this.x *= l;
        this.y *= l;
        this.z *= l;
    }
    return this;
};

/**
 * Return the distance to another vector.
 * @param {Vec3} v - Another vector
 * @returns {Number}
 */

Vec3.prototype.distance = function(v){
    var dx = v.x - this.x,
        dy = v.y - this.y,
        dz = v.z - this.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Return the distance to another vector. (squared)
 * @param {Vec3} v - Another vector
 * @returns {Number}
 */

Vec3.prototype.distanceSq = function(v){
    var dx = v.x - this.x,
        dy = v.y - this.y,
        dz = v.z - this.z;
    return dx * dx + dy * dy + dz * dz;
};

/**
 * Return the distance to another vector.
 * @param {Number} x - x component
 * @param {Number} y - y component
 * @param {Number} z - z component
 * @returns {Number}
 */

Vec3.prototype.distancef = function(x,y,z){
    var dx = x - this.x,
        dy = y - this.y,
        dz = z - this.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Return the distance to another vector. (squared)
 * @param {Number} x - x component
 * @param {Number} y - y component
 * @param {Number} z - z component
 * @returns {Number}
 */

Vec3.prototype.distanceSqf = function(x,y,z){
    var dx = x - this.x,
        dy = y - this.y,
        dz = z - this.z;
    return dx * dx + dy * dy + dz * dz;
};

/**
 * Limit the vectors length.
 * @param {Number} n - The limit
 * @return {Vec3}
 */

Vec3.prototype.limit = function(n){
    var x = this.x,
        y = this.y,
        z = this.z;

    var dsq = x * x + y * y + z * z,
        lsq = n * n;


    if(lsq > 0 && dsq > lsq){
        var nd = n / Math.sqrt(dsq);
        this.x *= nd;
        this.y *= nd;
        this.z *= nd;
    }

    return this;
};

/**
 * Invert the vectors components.
 * @returns {Vec3}
 */

Vec3.prototype.invert = function(){
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
    return this;
};

/**
 * Add another vector to a copy of the vector. Return the copy.
 * @param {Vec3} v - Another vector
 * @param {Vec3} [out] - Out vector
 * @returns {Vec3}
 */

Vec3.prototype.added = function(v,out){
    return this.copy(out).add(v);
};

/**
 * Substract  another vector to a copy of the vector. Return the copy.
 * @param {Vec3} v - Another vector
 * @param {Vec3} [out] - Out vector
 * @returns {Vec3}
 */

Vec3.prototype.subbed = function(v,out){
    return this.copy(out).sub(v);
};

/**
 * Return a scaled copy of the vector.
 * @param {Number} n - Another vector
 * @param {Vec3} [out] - Out vector
 * @returns {Vec3}
 */

Vec3.prototype.scaled = function(n,out){
    return this.copy(out).scale(n);
};

/**
 * Return the cross product of a copy of the vector and another vector.
 * @param {Vec3} v - Another vector
 * @param {Vec3} [out] - Out vector
 * @returns {Vec3}
 */

Vec3.prototype.crossed = function(v,out){
    return this.copy(out).cross(v);
};

/**
 * Return the cross product of a copy of the vector and xyz-components.
 * @param {Number} x - x component
 * @param {Number} y - y component
 * @param {Number} z - z component
 * @param {Vec3} [out] - Out vector
 * @returns {Vec3}
 */

Vec3.prototype.crossedf = function(x,y,z,out){
    return this.copy(out).crossf(x,y,z);
}

/**
 * Return a normalized copy of the vector.
 * @param {Vec3} [out] - Out vector
 * @returns {Vec3}
 */

Vec3.prototype.normalized = function(out){
    return this.copy(out).normalize();
};

/**
 * Return a limited copy of the vector
 * @param {Vec3} [out] - Out vector
 * @returns {Vec3}
 */

Vec3.prototype.limited = function(n,out){
    return this.copy(out).limit(n);
};

/**
 * Return an inverted copy of the vector
 * @param {Vec3} [out] - Out vector
 * @returns {Vec3}
 */

Vec3.prototype.inverted = function(out){
    return this.copy(out).invert();
};

/**
 * Linear interpolation to vector.
 * @param {Vec3} [target] - The target
 * @param a
 */

Vec3.prototype.interpolateTo = function(target,a){
    var x = this.x,
        y = this.y,
        z = this.z;

    this.x = x + (target.x - x) * a;
    this.y = y + (target.y - y) * a;
    this.z = z + (target.z - z) * a;
    return this;
};

/**
 * Returns a new vector interpolated to target.
 * @param target
 * @param a
 * @param out
 */

Vec3.prototype.interpolatedTo = function(target,a,out){
    return this.copy(out).interpolateTo(target,a);
};

/**
 * Returns true if both vector components are equal.
 * @param {Vec3} v
 * @returns {boolean}
 */

Vec3.prototype.equals = function(v){
    return this.x == v.x && this.y == v.y && this.z == v.z;
};

/**
 * Returns true if all vector components equal.
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @returns {boolean}
 */

Vec3.prototype.equalsf = function(x,y,z){
    return this.x == x && this.y == y && this.z == z;
};

/**
 * Return a Vec2 representation of the xy-components.
 * @returns {Vec2}
 */

Vec3.prototype.xy = function(){
    return new Vec2(this.x,this.y);
};

/**
 * Return a Vec2 representation of the xz-components.
 * @returns {Vec2}
 */

Vec3.prototype.xz = function(){
    return new Vec2(this.x,this.y);
};

/**
 * Return a Vec2 representation of the yz-components.
 * @returns {Vec2}
 */

Vec3.prototype.yz = function(){
    return new Vec2(this.y,this.x);
};

/**
 * Sets the vector to x=1,y=0,z=0.
 * @returns {Vec3}
 */

Vec3.prototype.toXAxis = function(){
    this.x = 1;
    this.y = this.z = 0;
    return this;
};

/**
 * Sets the vector to x=0,y=1,z=0.
 * @returns {Vec3}
 */

Vec3.prototype.toYAxis = function(){
    this.x = this.z = 0;
    this.y = 1;
    return this;
};

/**
 * Sets the vector to x=0,y=0,z=1.
 * @returns {Vec3}
 */

Vec3.prototype.toZAxis = function(){
    this.x = this.y = 0;
    this.z = 1;
    return this;
};

/**
 * Sets the vector to x=0,y=0,z=0.
 * @returns {Vec3}
 */

Vec3.prototype.toZero = function(){
    this.x = this.y = this.z = 0;
    return this;
};

/**
 * Sets the vector to x=1,y=1,z=1.
 * @returns {Vec3}
 */

Vec3.prototype.toOne = function(){
    this.x = this.y = this.z = 1;
    return this;
};

/**
 * Sets the vector to x=MAX,y=MAX,z=MAX.
 * @returns {Vec3}
 */

Vec3.prototype.toMax = function(){
    this.x = this.y = this.z = Number.MAX_VALUE;
    return this;
};

/**
 * Sets the vector to x=MIN,y=MIN,z=MIN.
 * @returns {Vec3}
 */

Vec3.prototype.toMin = function(){
    this.x = this.y = this.z = -Number.MAX_VALUE;
    return this;
};

/**
 * Sets xyz components to absolute values.
 * @returns {Vec3}
 */

Vec3.prototype.toAbs = function(){
    this.x = Math.abs(this.x);
    this.y = Math.abs(this.y);
    this.z = Math.abs(this.z);
    return this;
};

/**
 * Returns an absolute copy of the vector.
 * @param {Vec3}[out] - Optional out
 * @returns {Vec3}
 */

Vec3.prototype.abs = function(out){
    return (out || new Vec3()).set(this).toAbs();
};

/**
 * Returns a Float32Array representation of the vector
 * @param {Float32Array} [arr] - Out Float32Array
 * @param {Number} [offset=0] - The offset to be written to
 * @returns {Float32Array}
 */

Vec3.prototype.toFloat32Array = function(arr,offset){
    if(!arr && !offset){
        return new Float32Array([this.x,this.y,this.z]);
    }
    offset = offset || 0;
    arr[offset  ] = this.x;
    arr[offset+1] = this.y;
    arr[offset+2] = this.z;
    return arr;
};

/**
 * Returns a new Vector with x=1,y=0,z=0.
 * @returns {Vec3}
 */

Vec3.xAxis = function(){
    return new Vec3(1,0,0);
};

/**
 * Returns a new Vector with x=0,y=1,z=0.
 * @returns {Vec3}
 */

Vec3.yAxis = function(){
    return new Vec3(0,1,0);
};

/**
 * Returns a new Vector with x=0,y=0,z=1.
 * @returns {Vec3}
 */

Vec3.zAxis = function(){
    return new Vec3(0,0,1);
};

/**
 * Returns a new Vector with x=0,y=0,z=0.
 * @returns {Vec3}
 */

Vec3.zero = function(){
    return new Vec3();
};

/**
 * Returns a new Vector with x=1,y=1,z=1.
 * @returns {Vec3}
 */

Vec3.one = function(){
    return new Vec3(1,1,1);
};

/**
 * Returns a new Vector with x=MAX,y=MAX,z=MAX.
 * @returns {Vec3}
 */

Vec3.max = function(){
    return new Vec3(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE);
};

/**
 * Returns a new Vector with x=MIN,y=MIN,z=MIN.
 * @returns {Vec3}
 */
Vec3.min = function(){
    return new Vec3(-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE);
};

/**
 * Sets the vector to random x,y,z components
 * @param {Number}[min=0]
 * @param {Number}[max=1]
 * @returns {Vec3}
 */

Vec3.prototype.random = function(min,max){
    this.setf(Random.randomFloat(),
              Random.randomFloat(),
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
 * Sets the vector to a random position.
 * @param {Number} [min=0]
 * @param {Number} [min=1]
 * @returns {*}
 */
//keep older versions valid for now
Vec3.prototype.randomPosition = Vec3.prototype.random;

/**
 * Sets the vector to a random direction.
 * @returns {Vec3}
 */

Vec3.prototype.randomDirection = function(){
    return this.random(RANDOM_DIR_RANGE[0],RANDOM_DIR_RANGE[1]).normalize();
};

/**
 * Return a random position.
 * @param {Number} [min=0]
 * @param {Number} [max=1]
 * @param {Vec3} [out] - Optional out
 * @returns {Vec3}
 */

Vec3.randomPosition = function(min,max,out){
    return (out || new Vec3()).random(min,max);
};

/**
 * Return a random normalized direction.
 * @param {Vec3} [out] - Optional out
 * @returns {Vec3}
 */

Vec3.randomDirection = function(out){
    return (out || new Vec3()).randomDirection();
};

/**
 * Return a string representation of the vector.
 * @returns {string}
 */

Vec3.prototype.toString = function(){
    return '[' + this.x + ',' + this.y + ',' + this.z + ']';
};

module.exports = Vec3;