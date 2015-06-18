var Vec3 = require('../math/Vec3'),
    glTrans = require('../gl/glTrans'),
    glDraw,_glDraw = require('../gl/glDraw');

function Plane(point,normal){
    this.point = point || Vec3.zero();
    this.normal = normal || Vec3.yAxis();
    this._update();

    glDraw = glDraw || _glDraw.get();
}

Plane.prototype.set = function(origin,normal){
    this.point = origin;
    this.normal = normal;
    return this;
};

Plane.prototype.setFromPoints = function(v0,v1,v2){
    var point = this.point,
        normal = this.normal;

    var _1_3 = 1.0 / 3.0;

    point.x = (v0.x + v1.x + v2.x) * _1_3;
    point.y = (v0.y + v1.y + v2.y) * _1_3;
    point.z = (v0.z + v1.z + v2.z) * _1_3;

    var e0x = v1.x - v0.x,
        e0y = v1.y - v0.y,
        e0z = v1.z - v0.z,
        e1x = v2.x - v0.x,
        e1y = v2.y - v0.y,
        e1z = v2.z - v0.z;

    normal.x = e0y * e1z - e1y * e0z;
    normal.y = e0z * e1x - e1z * e0x;
    normal.z = e0x * e1y - e1x * e0y;

    this._update();

    return this;
};

Plane.prototype.setNormal = function(normal){
    this.normal.set(normal);
    this._update();
};

Plane.prototype.setNormal3f = function(x,y,z){
    this.normal.setf(x,y,z);
    this._update();
};

Plane.prototype._update = function(){
    var normal = this.normal;
    var nx = normal.x,
        ny = normal.y,
        nz = normal.z;

    var length = nx * nx + ny * ny + nz * nz;

    if(length){
        length = 1.0 / Math.sqrt(length);
        normal.x *= length;
        normal.y *= length;
        normal.z *= length;
    } else {
        throw new Error('Plane: Normal cant be zero length.');
    }

    this.dist = -normal.dot(this.point);
};


Plane.prototype.distanceSigned = function(point){
    var normal = this.normal;
    return normal.x * point.x + normal.y * point.y + normal.z * point.z + this.dist;
};

Plane.prototype.distanceSigned3f = function(x,y,z){
    var normal = this.normal;
    return normal.x * x + normal.y * y+ normal.z * z + this.dist;
};

Plane.prototype.copy = function(plane){
    return (plane || new Plane()).set(this.origin,this.normal);
};

Plane.prototype.draw = function(){
    glTrans.pushMatrix();
    glTrans.translate(this.point);
    glDraw.drawVector(this.normal);
    glTrans.popMatrix();

};

Plane.fromPoints = function(v0,v1,v2){
    return new Plane().setFromPoints(v0,v1,v2);
};



module.exports = Plane;