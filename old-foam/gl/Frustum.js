var Vec3 = require('../math/Vec3');
var AABB = require('../geom/AABB');
var Plane = require('../geom/Plane');
var glDraw, _glDraw = require('./glDraw');


function Frustum(){
    this._vec3Temp = new Vec3();
    this._frustumCamera = new Array(6);
    var frustumTemp = this._frustumTemp = new Array(6);
    var planes = this._planes = new Array(6);

    var i = -1, l = 6;
    while(++i < l){
        planes[i] = new Plane();
        frustumTemp[i] = new Vec3();
    }

    this._eye = new Vec3();

    var near = this._near = new Array(4),
        far  = this._far = new Array(4);

    i = -1; l = 4;
    while(++i < l){
        near[i] = new Vec3();
        far[i] = new Vec3();
    }

    glDraw = glDraw || _glDraw.get();
}

Frustum.prototype.draw = function(){
    var n = this._near,
        n0 = n[0],
        n1 = n[1],
        n2 = n[2],
        n3 = n[3];
    var f = this._far,
        f0 = f[0],
        f1 = f[1],
        f2 = f[2],
        f3 = f[3];

    var prevColor = glDraw.getColor();

    glDraw.colorf(0,1,0,1);
    glDraw.drawLines(n0,n1,n1,n2,n2,n3,n3,n0,
                     n0,f0,n1,f1,n2,f2,n3,f3,
                     f0,f1,f1,f2,f2,f3,f3,f0);
    glDraw.color(prevColor);
};

Frustum.prototype.getNearPlane = function(){
    return this._near;
};

Frustum.prototype.getFarPlane =function(){
    return this._far;
};

Frustum.prototype.containsPoint = function(point){
    return this.containsPoint3f(point.x,point.y,point.z);
};

Frustum.prototype.containsPoint3f = function(x,y,z){
    var planes = this._planes;
    var i = -1;
    while(++i < 6){
        if(planes[i].distanceSigned3f(x,y,z) < 0){
            return false;
        }
    }
    return true;
};

//test n / p point

Frustum.prototype.containsAABB = function(aabb){
    var planes = this._planes;
    var center = aabb.center;
    var x, y, z;
    var count = 0;

    x = center.x;
    y = center.y;
    z = center.z;

    //  first check center
    var i = -1;
    while(++i < 6){
        if(planes[i].distanceSigned3f(x,y,z) < 0){
            break;
        }
        count++;
    }
    if(count == 6){
       return true;
    }

    var plane;
    var pointTemp = this._vec3Temp;
    var near,far;

    //  check nearest / farthest
    i = -1;
    while(++i < 6){
        plane = planes[i];
        near = plane.distanceSigned(aabb.getPPoint(plane.normal,pointTemp)) > 0;
        far  = plane.distanceSigned(aabb.getNPoint(plane.normal,pointTemp)) > 0;

        if(!near && !far){
            return false;
        }
    }
    return true;
};

module.exports = Frustum;