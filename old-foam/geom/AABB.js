var Math_           = require('../math/Math'),
    Vec2            = require('../math/Vec2'),
    Vec3            = require('../math/Vec3'),
    glTrans         = require('../gl/glTrans'),
    glDraw, _glDraw = require('../gl/glDraw');

/**
 * Representation of an axis aligned bounding box,
 * @constructor
 */

function AABB() {
    /**
     * The minimal point.
     * @type {Vec3}
     */
    var min  = this.min = Vec3.max(),
    /**
     * The maximal point
     * @type {Vec3}
    */
        max  = this.max = Vec3.min();

    /**
     * The center of the box.
     * @type {Vec3}
     */
    this.center = new Vec3();
    /**
     * The size of the box. (max - min)
     * @type {Vec3}
     */
    this.size = new Vec3();

    /**
     * The 8 defining points of the box.
     * @type {Array}
     */
    this.points = new Array(8);

    switch (arguments.length){
        case 1 :
            if(arguments[0] instanceof AABB){
                this.set(arguments[0]);
            } else if(arguments[0] instanceof Vec3) {
                max.set(arguments[0]);
            }
            break;
        case 2 :
            if(arguments[0] instanceof Vec3 &&
               arguments[1] instanceof Vec3){
                min.set(arguments[0]);
                max.set(arguments[1]);
            }
            break;
    }

    var points = this.points;
    var i = -1,
        l = points.length;
    while(++i < l){
        points[i] = new Vec3();
    }
    this._update();

    glDraw = glDraw || _glDraw.get();
}

/**
 * Sets box from another box
 * @param {AABB} aabb - Another box
 * @returns {AABB}
 */

AABB.prototype.set = function(aabb){
    return this.setMinMax(aabb.min,aabb.max);
};

/**
 * Sets the box from min max values
 * @param {Number} minx
 * @param {Number} miny
 * @param {Number} minz
 * @param {Number} maxx
 * @param {Number} maxy
 * @param {Number} maxz
 * @returns {AABB}
 */

AABB.prototype.setMinMaxf = function(minx,miny,minz,maxx,maxy,maxz){
    this.min.setf(minx,miny,minz);
    this.max.setf(maxx,maxy,maxz);
    this._update();
    return this;
};

/**
 * Sets the box from min max values.
 * @param {Vec3} [min = 0]
 * @param {Vec3} max
 * @returns {AABB}
 */

AABB.prototype.setMinMax = function(min,max){
    return this.setMinMaxf(min.x,min.y,min.z,max.x,max.y,max.z);
};

/**
 * Sets the box from min max values.
 * @param {Number[]} fv
 * @returns {AABB}
 */

AABB.prototype.setMinMaxfv = function(fv){
    return this.setMinMaxf(fv[0],fv[1],fv[2],fv[3],fv[4],fv[5]);
};

/**
 * Resets the AABB to its initial state.
 * @returns {AABB}
 */

AABB.prototype.reset = function(){
    this.min.toMax();
    this.max.toMin();
    this.center.toZero();
    this.size.toZero();

    var points = this.points;
    for(var i = 0; i < points.length; ++i){
        points[i].toZero();
    }
    return this;
};

/**
 * Returns the range from min.x to max.x
 * @returns {Number}
 */

AABB.prototype.getXRange = function(){
    return Math.abs(this.min.x) + this.max.x;
};

/**
 * Returns the range from min.y to max.y
 * @returns {Number}
 */

AABB.prototype.getYRange = function(){
    return Math.abs(this.min.y) + this.max.y;
};

/**
 * Returns the range from min.z to max.z
 * @returns {Number}
 */

AABB.prototype.getZRange = function(){
    return Math.abs(this.min.z) + this.max.z;
};

/**
 * Returns the xyz range
 * @param {Vec3}[out] - Optional out
 * @returns {Vec3}
 */

AABB.prototype.getXYZRange = function(out){
    return (out || new Vec3()).setf(this.getXRange(),this.getYRange(),this.getZRange());
};

/**
 * Returns the normalized range from min.x to max.x
 * @returns {number}
 */

AABB.prototype.getXRangeNormalized = function(){
    var range = this.getXRange();
    return range / Math.max(range,this.getYRange(),this.getZRange())
};

/**
 * Returns the normalized range from min.y to max.y
 * @returns {number}
 */


AABB.prototype.getYRangeNormalized = function(){
    var range = this.getYRange();
    return range / Math.max(range,this.getXRange(),this.getZRange());
};

/**
 * Returns the normalized range from min.z to max.z
 * @returns {number}
 */

AABB.prototype.getZRangeNormalized = function(){
    var range = this.getZRange();
    return range / Math.max(range,this.getXRange(),this.getYRange());
};

/**
 * Returns the xyz normalized range
 * @param {Vec3}[out] - Optional out
 * @returns {Vec3}
 */

AABB.prototype.getXYZRangeNormalized = function(out){
    var x = this.getXRange(),
        y = this.getYRange(),
        z = this.getZRange(),
        max = Math.max(x,y,z);

    x /= max;
    y /= max;
    z /= max;

    return (out || new Vec3()).setf(x,y,z);
};

/**
 * Returns the minimum value of min xyz.
 * @returns {number}
 */

AABB.prototype.getMinMin = function(){
    var min = this.min;
    return Math.min(min.x,min.y,min.z);
};

/**
 * Returns the maximum value of max xyz.
 * @returns {number}
 */

AABB.prototype.getMaxMax = function(){
    var max = this.min;
    return Math.max(max.x,max.y,max.z);
};

/**
 * Normalizes a set of points from the bounding boxs min max values.
 * @param {Number[]}points
 * @param {Number}[scale]
 * @param {Boolean}[relative]
 * @returns {Number[]}
 */

AABB.prototype.normalizePointsf = function(points,scale,relative){
    scale    = scale === undefined ? 1.0 : scale;
    relative = relative || false;

    var min, max;
    var minx, miny, minz, maxx, maxy, maxz;

    min  = this.min;
    max  = this.max;
    minx = min.x; miny = min.y; minz = min.z;
    maxx = max.x; maxy = max.y; maxz = max.z;

    if(relative){
        var maxmax;
        var minxr, minyr, minzr, maxxr, maxyr, maxzr;

        maxmax = Math.max(Math.max(Math.abs(minx),maxx),
                          Math.max(Math.abs(miny),maxy),
                          Math.max(Math.abs(minz),maxz));

        minxr = minx / maxmax;
        minyr = miny / maxmax;
        minzr = minz / maxmax;

        maxxr = maxx / maxmax;
        maxyr = maxy / maxmax;
        maxzr = maxz / maxmax;

        for(var i = 0, l = points.length; i < l; i+=3){
            points[i]   = Math_.map(points[i  ],minx,maxx,minxr,maxxr);
            points[i+1] = Math_.map(points[i+1],miny,maxy,minyr,maxyr);
            points[i+2] = Math_.map(points[i+2],minz,maxz,minzr,maxzr);
        }
    } else {
        var xnorm, ynorm, znorm;

        xnorm = this.getXRangeNormalized() * scale;
        ynorm = this.getYRangeNormalized() * scale;
        znorm = this.getZRangeNormalized() * scale;

        for(var i = 0, l = points.length; i < l; i+=3){
            points[i]   = Math_.map(points[i  ],minx,maxx,0.0,xnorm);
            points[i+1] = Math_.map(points[i+1],miny,maxy,0.0,ynorm);
            points[i+2] = Math_.map(points[i+2],minz,maxz,0.0,znorm);
        }
    }

    return points;
};

/**
 * Normalizes a set of points from the bounding boxs min max values.
 * @param {Vec3[]} points
 * @param {Number}[scale]
 * @param {Boolearn} [relative]
 * @returns {Vec3[]}
 */

AABB.prototype.normalizePoints = function(points,scale, relative){
    scale = scale === undefined ? 1.0 : scale;

    var min, max;
    var minx, miny, minz, maxx, maxy, maxz;

    min = this.min;
    max = this.max;
    minx = min.x; miny = min.y; minz = min.z;
    maxx = max.x; maxy = max.y; maxz = max.z;

    if(relative){
        var maxmax;
        var minxr, minyr, minzr, maxxr, maxyr, maxzr;

        maxmax = Math.max(Math.max(Math.abs(minx),maxx),
                 Math.max(Math.abs(miny),maxy),
                 Math.max(Math.abs(minz),maxz));

        minxr = minx / maxmax;
        minyr = miny / maxmax;
        minzr = minz / maxmax;

        maxxr = maxx / maxmax;
        maxyr = maxy / maxmax;
        maxzr = maxz / maxmax;

        for(var i = 0, l = points.length, point; i < l; ++i){
            point = points[i];
            point.x = Math_.map(points[i  ],minx,maxx,minxr,maxxr);
            point.y = Math_.map(points[i+1],miny,maxy,minyr,maxyr);
            point.z = Math_.map(points[i+2],minz,maxz,minzr,maxzr);
        }
    } else {
        var xnorm, ynorm, znorm;

        xnorm = this.getXRangeNormalized() * scale;
        ynorm = this.getYRangeNormalized() * scale;
        znorm = this.getZRangeNormalized() * scale;

        for(var i = 0, l = points.length, point; i < l; ++i){
            point = points[i];
            point.x = Math_.map(point.x,minx,maxx,0.0,xnorm);
            point.y = Math_.map(point.y,miny,maxy,0.0,ynorm);
            point.z = Math_.map(point.z,minz,maxz,0.0,znorm);
        }
    }
    
    return points;
};

/**
 * Normalizes the bounding box.
 * @returns {AABB}
 */

AABB.prototype.normalize = function(){
    var min,max;
    var max_;

    min = this.min;
    max = this.max;

    max_ = 1.0 / Math.max(this.getMaxMax(),Math.abs(this.getMinMin()));

    min.x *= max_;
    min.y *= max_;
    min.z *= max_;

    max.x *= max_;
    max.y *= max_;
    max.z *= max_;

    this._update();

    return this;
};

/**
 * Adjusts the box size to include another box.
 * @param {AABB} aabb - Another box
 * @returns {AABB}
 */

AABB.prototype.include = function(aabb){
    var min = this.min,
        max = this.max,
        amin = aabb.min,
        amax = aabb.max;

    min.x = Math.min(min.x,amin.x);
    min.y = Math.min(min.y,amin.y);
    min.z = Math.min(min.z,amin.z);
    max.x = Math.max(max.x,amax.x);
    max.y = Math.max(max.y,amax.y);
    max.z = Math.max(max.z,amax.z);

    this._update();
    return this;
};

/**
 * Adjusts the box size to include a point.
 * @param {Vec3} v
 * @returns {AABB}
 */

AABB.prototype.includePoint = function(v) {
    return this.includePointf(v.x, v.y, v.z);
};

/**
 * Adjusts the box size to include a point.
 * @param x
 * @param y
 * @param z
 * @returns {AABB}
 */

AABB.prototype.includePointf = function(x,y,z){
    var min = this.min,
        max = this.max;

    min.x = Math.min(min.x,x);
    min.y = Math.min(min.y,y);
    min.z = Math.min(min.z,z);
    max.x = Math.max(max.x,x);
    max.y = Math.max(max.y,y);
    max.z = Math.max(max.z,z);

    this._update();
    return this;
};

AABB.prototype._update = function(){
    var min  = this.min,
        max  = this.max,
        size = this.size.set(max).sub(min);
    var sizeX = size.x,
        sizeZ = size.z;

    var points = this.points;

    var p0 = points[0],
        p1 = points[1],
        p2 = points[2],
        p3 = points[3],
        p4 = points[4],
        p5 = points[5],
        p6 = points[6],
        p7 = points[7];


    p0.x = p1.x = p2.x = p3.x = max.x;
    p0.y = p1.y = p2.y = p3.y = max.y;
    p0.z = p1.z = p2.z = p3.z = max.z;

    p0.x -= sizeX; p0.z -= sizeZ;
    p1.z -= sizeZ;
    p2.x -= sizeX;

    p4.x = p5.x = p6.x = p7.x = min.x;
    p4.y = p5.y = p6.y = p7.y = min.y;
    p4.z = p5.z = p6.z = p7.z = min.z;

    p4.x += sizeX;
    p5.z += sizeZ;
    p6.x += sizeX; p6.z += sizeZ;

    var center = this.center;
    center.x = min.x + sizeX  * 0.5;
    center.y = min.y + size.y * 0.5;
    center.z = min.z + sizeZ  * 0.5;
};

/**
 * Returns an axis aligned bounding box from a set of points.
 * @param {Vec3[]} points - N points
 * @returns {AABB}
 */

AABB.prototype.setFromPoints = function(points){
    var min = this.min.toMax(),
        max = this.max.toMin();
    var i = -1, l = points.length;
    var point;
    var px,py,pz;

    while(++i < l){
        point = points[i];
        px = point.x;
        py = point.y;
        pz = point.z;

        min.x = Math.min(min.x,px);
        max.x = Math.max(max.x,px);
        min.y = Math.min(min.y,py);
        max.y = Math.max(max.y,py);
        min.z = Math.min(min.z,pz);
        max.z = Math.max(max.z,pz);
    }

    this._update();
    return this;
};

/**
 * Returns an axis aligned bounding box from a set of points.
 * @param {Number[]} points - N points
 * @returns {AABB}
 */

AABB.prototype.setFromPointsf = function(points){
    var min = this.min.toMax(),
        max = this.max.toMin();
    var i = 0, l = points.length;
    var px,py,pz;

    while(i < l){
        px = points[i  ];
        py = points[i+1];
        pz = points[i+2];

        min.x = Math.min(min.x,px);
        max.x = Math.max(max.x,px);
        min.y = Math.min(min.y,py);
        max.y = Math.max(max.y,py);
        min.z = Math.min(min.z,pz);
        max.z = Math.max(max.z,pz);

        i+=3;
    }

    this._update();
    return this;
};

/**
 * Returns a the negative far point.
 * @param normal
 * @param point
 * @returns {Vec3}
 */

//http://cgvr.cs.uni-bremen.de/teaching/cg2_08/folien/05_culling_1up_2.pdf
// http://jesper.kalliope.org/blog/library/vfcullbox.pdf
AABB.prototype.getNPoint = function(normal,point){
    point = point || new Vec3();
    var min = this.min,
        max = this.max;

    point.x = normal.x >= 0 ? max.x : min.x;
    point.y = normal.y >= 0 ? max.y : min.y;
    point.z = normal.z >= 0 ? max.z : min.z;

    return point;
};

/**
 * Returns a the positive far point.
 * @param normal
 * @param point
 * @returns {Vec3}
 */

AABB.prototype.getPPoint = function(normal,point){
    point = point || new Vec3();
    var min = this.min,
        max = this.max;

    point.x = normal.x >= 0 ? min.x : max.x;
    point.y = normal.y >= 0 ? min.y : max.y;
    point.z = normal.z >= 0 ? min.z : max.z;

    return point;
};

/**
 * Draws the box.
 * @param {Boolean} [center] - If true, the center will be displayed.
 */

AABB.prototype.draw = function(center){
    glTrans.pushMatrix();
    glTrans.translate(this.center);
    if(center){
        glDraw.drawPivot();
    }
    glTrans.scale(this.size);
    glDraw.drawCubeStroked();
    glTrans.popMatrix();
};

/**
 * Returns a new AABB from a set of points.
 * @param {Vec3[]}points
 * @param {AABB}[out] - Optional out
 * @returns {AABB}
 */

AABB.fromPoints = function(points,out){
    return (out || new AABB()).setFromPoints(points);
};

/**
 * Returns a new AABB from a set of points.
 * @param {Number[]} points
 * @param {AABB}[out] - Optional out
 * @returns {AABB}
 */

AABB.fromPointsf = function(points,out){
    return (out || new AABB()).setFromPointsf(points);
};

/**
 * Returns a new AABB from min max values.
 * @param {Vec3} min
 * @param {Vec3} max
 * @param {AABB} [out] - Optional out
 * @returns {AABB}
 */

AABB.fromMinMax = function(min,max,out){
    return (out || new AABB()).setMinMax(min,max);
};

/**
 * Returns a new AABB from min max values.
 * @param {Number} minx
 * @param {Number} miny
 * @param {Number} minz
 * @param {Number} maxx
 * @param {Number} maxy
 * @param {Number} maxz
 * @param {AABB} [out] - Optional out
 * @returns {AABB}
 */

AABB.fromMinMaxf = function(minx,miny,minz,maxx,maxy,maxz,out){
    return (out || new AABB()).setMinMaxf(minx,miny,minz,maxx,maxy,maxz);
};

/**
 * Returns a new AABB from min max values.
 * @param {Number[]} fv
 * @param {AABB} [out] - Optional out
 * @returns {AABB}
 */

AABB.fromMinMaxfv = function(fv,out){
    return (out || new AABB()).setMinMaxfv(fv);
};



module.exports = AABB;