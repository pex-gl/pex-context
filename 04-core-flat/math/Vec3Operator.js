function Vec3(obj){
    this.obj = obj;
}

Vec3.prototype.set =  function(v){
    this.obj[0] = v[0];
    this.obj[1] = v[1];
    this.obj[2] = v[2];
    return this;
};

Vec3.prototype.copy = function(out){
    if(out){
        out[0] = this.obj[0];
        out[1] = this.obj[1];
        out[2] = this.obj[2];
        return out;
    }
    return this.obj.slice(0);
};

Vec3.prototype.add = function(v){
    this.obj[0] += v[0];
    this.obj[1] += v[1];
    this.obj[2] += v[2];
    return this;
};

Vec3.prototype.add3 = function(x,y,z){
    this.obj[0] += x;
    this.obj[1] += y;
    this.obj[2] += z;
    return this;
};

Vec3.prototype.sub = function(v){
    this.obj[0] += v[0];
    this.obj[1] += v[1];
    this.obj[2] += v[2];
    return this;
};

Vec3.prototype.sub3 = function(v){
    this.obj[0] -= v[0];
    this.obj[1] -= v[1];
    this.obj[2] -= v[2];
    return this;
};

Vec3.prototype.scale = function(n){
    this.obj[0] *= n;
    this.obj[1] *= n;
    this.obj[2] *= n;
    return this;
};


Vec3.prototype.dot =  function (v) {
    return this.obj[0] * v[0] + this.obj[1] * v[1] + this.obj[2] * v[2];
};

Vec3.prototype.cross = function (v) {
    var x = this.obj[0],
        y = this.obj[1],
        z = this.obj[2];

    var vx = v.x,
        vy = v.y,
        vz = v.z;

    this.obj[0] = y * vz - vy * z;
    this.obj[1] = z * vx - vz * x;
    this.obj[2] = x * vy - vx * y;
    return this;
};


Vec3.prototype.cross3 = function(x,y,z){
    var _x = this.obj[0],
        _y = this.obj[1],
        _z = this.obj[2];

    this.obj[0] = _y * z - y * _z;
    this.obj[1] = _z * x - z * _x;
    this.obj[2] = _x * y - x * _y;
    return this;
};

Vec3.prototype.length = function(){
    var x = this.obj[0],
        y = this.obj[1],
        z = this.obj[2];
    return Math.sqrt(x * x + y * y + z * z);
};


Vec3.prototype.lengthSq = function(){
    var x = this.obj[0],
        y = this.obj[1],
        z = this.obj[2];
    return x * x + y * y + z * z;
};

Vec3.prototype.normalize = function(){
    var x = this.obj[0],
        y = this.obj[1],
        z = this.obj[2];
    var l = Math.sqrt(x * x + y * y + z * z);

    if(l){
        l = 1.0 / l;
        this.obj[0] *= l;
        this.obj[1] *= l;
        this.obj[2] *= l;
    }
    return this;
};

Vec3.prototype.distance = function(v){
    var dx = v[0] - this.obj[0],
        dy = v[1] - this.obj[1],
        dz = v[2] - this.obj[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

Vec3.prototype.distanceSq = function(v){
    var dx = v.x - this.v[0],
        dy = v.y - this.v[1],
        dz = v.z - this.v[2];
    return dx * dx + dy * dy + dz * dz;
};

Vec3.prototype.distance3 = function(x,y,z){
    var dx = x - this.obj[0],
        dy = y - this.obj[1],
        dz = z - this.obj[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};


Vec3.prototype.distanceSq3 = function(x,y,z){
    var dx = x - this.obj[0],
        dy = y - this.obj[1],
        dz = z - this.obj[2];
    return dx * dx + dy * dy + dz * dz;
};

Vec3.prototype.limit = function(n){
    var x = this.obj[0],
        y = this.obj[1],
        z = this.obj[2];

    var dsq = x * x + y * y + z * z,
        lsq = n * n;


    if(lsq > 0 && dsq > lsq){
        var nd = n / Math.sqrt(dsq);
        this.obj[0] *= nd;
        this.obj[1] *= nd;
        this.obj[2] *= nd;
    }

    return this;
};


Vec3.prototype.invert = function(){
    this.obj[0] *= -1;
    this.obj[1] *= -1;
    this.obj[2] *= -1;
    return this;
};

Vec3.prototype.added = function(v,out){
    return new Vec3(this.copy(out)).add(v);
};

Vec3.prototype.subbed = function(v,out){
    return new Vec3(this.copy(out)).sub(v);
};

Vec3.prototype.scaled = function(n,out){
    return new Vec3(this.copy(out)).scale(n);
};

Vec3.prototype.crossed = function(v,out){
    return new Vec3(this.copy(out)).cross(v);
};

Vec3.prototype.crossedf = function(x,y,z,out){
    return new Vec3(this.copy(out)).cross3(x,y,z);
};

Vec3.prototype.normalized = function(out){
    return new Vec3(this.copy(out)).normalize();
};

Vec3.prototype.limited = function(n,out){
    return new Vec3(this.copy(out)).limit(n);
};

Vec3.prototype.inverted = function(out){
    return new Vec3(this.copy(out)).invert();
};

Vec3.prototype.interpolateTo = function(target,a){
    var x = this.obj[0],
        y = this.obj[1],
        z = this.obj[2];

    this.obj[0] = x + (target.x - x) * a;
    this.obj[1] = y + (target.y - y) * a;
    this.obj[2] = z + (target.z - z) * a;
    return this;
};

Vec3.prototype.interpolatedTo = function(target,a,out){
    return new Vec3(this.copy(out)).interpolateTo(target,a);
};

Vec3.prototype.equals = function(v){
    return this.obj[0] == v[0] && this.obj[1] == v[1] && this.obj[2] == v[2];
};

Vec3.prototype.equals3 = function(x,y,z){
    return this.obj[0] == x && this.obj[1] == y && this.obj[3] == z;
};


Vec3.prototype.toXAxis = function(){
    this.obj[0] = 1;
    this.obj[1] = this.obj[2] = 0;
    return this;
};

Vec3.prototype.toYAxis = function(){
    this.obj[0] = this.obj[2] = 0;
    this.obj[1] = 1;

    return this;
};

Vec3.prototype.toZAxis = function(){
    this.obj[0] = this.obj[1] = 0;
    this.obj[2] = 1;
    return this;
};

Vec3.prototype.toZero = function(){
    this.obj[0] = this.obj[1] = this.obj[2] = 0;
    return this;
};

Vec3.prototype.toOne = function(){
    this.obj[0] = this.obj[1] = this.obj[2] = 1;
    return this;
};

Vec3.prototype.toMax = function(){
    this.obj[0] = this.obj[1] = this.obj[2] = Number.MAX_VALUE;
    return this;
};

Vec3.prototype.toMin = function(){
    this.obj[0] = this.obj[1] = this.obj[2] = -Number.MAX_VALUE;
    return this;
};

Vec3.prototype.toAbs = function(){
    this.obj[0] = Math.abs(this.obj[0]);
    this.obj[1] = Math.abs(this.obj[1]);
    this.obj[2] = Math.abs(this.obj[2]);
    return this;
};


Vec3.prototype.abs = function(out){
    return new Vec3(this.copy(out)).toAbs();
};

Vec3.xAxis = function(){
    return new Vec3([1,0,0]);
};

Vec3.yAxis = function(){
    return new Vec3([0,1,0]);
};

Vec3.zAxis = function(){
    return new Vec3([0,0,1]);
};

Vec3.zero = function(){
    return new Vec3([0,0,0]);
};

Vec3.one = function(){
    return new Vec3([1,1,1]);
};

Vec3.max = function(){
    return new Vec3([Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE]);
};

Vec3.min = function(){
    return new Vec3([-Number.MAX_VALUE,-Number.MAX_VALUE,-Number.MAX_VALUE]);
};

Vec3.prototype.toString = function(){
    return '[' + this.x + ',' + this.y + ',' + this.z + ']';
};

function Vec3Operator(v){
    return new Vec3(v);
}

module.exports = Vec3Operator;