var Math_           = require('../math/Math'),
    Vec2            = require('../math/Vec2'),
    glTrans         = require('../gl/glTrans'),
    glDraw, _glDraw = require('../gl/glDraw');

/**
 * Representation of an axis aligned bounding rect.
 * @constructor
 */

function AABR() {
    /**
     * The minimal point.
     * @type {Vec2}
     */
    var min  = this.min = Vec2.max(),
        /**
         * The maximal point
         * @type {Vec2}
         */
        max  = this.max = Vec2.min();

    /**
     * The center of the box.
     * @type {Vec3}
     */
    this.center = new Vec2();
    /**
     * The size of the box. (max - min)
     * @type {Vec2}
     */
    this.size = new Vec2();

    /**
     * The 8 defining points of the box.
     * @type {Array}
     */
    this.points = new Array(4);

    switch (arguments.length){
        case 1 :
            if(arguments[0] instanceof AABR){
                this.set(arguments[0]);
            } else if(arguments[0] instanceof Vec2) {
                max.set(arguments[0]);
            }
            break;
        case 2 :
            if(arguments[0] instanceof Vec2 &&
                arguments[1] instanceof Vec2){
                min.set(arguments[0]);
                max.set(arguments[1]);
            }
            break;
    }

    var points = this.points;
    var i = -1,
        l = points.length;
    while(++i < l){
        points[i] = new Vec2();
    }
    this._update();

    glDraw = glDraw || _glDraw.get();
}
/**
 * Sets box from another box
 * @param {AABR} AABR - Another box
 * @returns {AABR}
 */

AABR.prototype.set = function(AABR){
    this.min.set(AABR.min);
    this.max.set(AABR.max);
    this.size.set(AABR.size);
    return this;
};

/**
 * Returns the range from min.x to max.x
 * @returns {Number}
 */

AABR.prototype.getXRange = function(){
    return Math.abs(this.min.x) + this.max.x;
};

/**
 * Returns the range from min.y to max.y
 * @returns {Number}
 */

AABR.prototype.getYRange = function(){
    return Math.abs(this.min.y) + this.max.y;
};

/**
 * Returns the xy range
 * @param {Vec2}[out] - Optional out
 * @returns {Vec2}
 */

AABR.prototype.getXYRange = function(out){
    return (out || new Vec3()).setf(this.getXRange(),this.getYRange());
};

/**
 * Returns the normalized range from min.x to max.x
 * @returns {number}
 */

AABR.prototype.getXRangeNormalized = function(){
    var range = this.getXRange();
    return range / Math.max(range,this.getYRange());
};

/**
 * Returns the normalized range from min.y to max.y
 * @returns {number}
 */


AABR.prototype.getYRangeNormalized = function(){
    var range = this.getYRange();
    return range / Math.max(range,this.getXRange());
};

/**
 * Returns the xyz normalized range
 * @param {Vec2}[out] - Optional out
 * @returns {Vec2}
 */

AABR.prototype.getXYRangeNormalized = function(out){
    var x = this.getXRange(),
        y = this.getYRange(),
        max = Math.max(x,y);

    x /= max;
    y /= max;

    return (out || new Vec2()).setf(x,y);
};


AABR.prototype.normalizePointsf = function(points,scale){
    scale = scale === undefined ? 1.0 : scale;

    var min = this.min,
        max = this.max;
    var minx = min.x, miny = min.y,
        maxx = max.x, maxy = max.y;

    var xnorm = this.getXRangeNormalized() * scale,
        ynorm = this.getYRangeNormalized() * scale;

    var i = 0, l = points.length;
    while(i < l){
        points[i] = Math_.map(points[i++],minx,maxx,0.0,xnorm);
        points[i] = Math_.map(points[i++],miny,maxy,0.0,ynorm);
    }

    return points;
};

AABR.prototype.normalizePoints = function(points,scale){
    scale = scale === undefined ? 1.0 : scale;

    var min = this.min,
        max = this.max;
    var minx = min.x, miny = min.y,
        maxx = max.x, maxy = max.y;

    var xnorm = this.getXRangeNormalized() * scale,
        ynorm = this.getYRangeNormalized() * scale;
    var point;

    var i = 0, l = points.length;
    while(i < l){
        point = points[i++];
        point.x = Math_.map(point.x,minx,maxx,0.0,xnorm);
        point.y = Math_.map(point.y,miny,maxy,0.0,ynorm);
    }

    return points;
};

/**
 * Adjusts the box size to include another rect.
 * @param {AABR} aabr - Another box
 * @returns {AABR}
 */

AABR.prototype.include = function(aabr){
    var min = this.min,
        max = this.max,
        amin = aabr.min,
        amax = aabr.max;

    min.x = Math.min(min.x,amin.x);
    min.y = Math.min(min.y,amin.y);
    max.x = Math.max(max.x,amax.x);
    max.y = Math.max(max.y,amax.y);

    this._update();
    return this;
};

AABR.prototype._update = function(){
    var min  = this.min,
        max  = this.max,
        size = this.size.set(max).sub(min);

    var points = this.points;

    var p0 = points[0],
        p1 = points[1],
        p2 = points[2],
        p3 = points[3];

    p0.x = p2.x = min.x;
    p1.x = p3.x = max.x;
    p0.y = p1.y = min.y;
    p2.y = p3.y = max.y;

    this.center.setf(min.x + size.x * 0.5,min.y + size.y * 0.5);
};

/**
 * Returns an axis aligned bounding rect from a set of points.
 * @param {Vec2[]} points - N points
 * @returns {AABR}
 */

AABR.prototype.setFromPoints = function(points){
    var min = this.min.toMax(),
        max = this.max.toMin();
    var i = -1, l = points.length;
    var point;
    var px,py;

    while(++i < l){
        point = points[i];
        px = point.x;
        py = point.y;

        min.x = Math.min(min.x,px);
        max.x = Math.max(max.x,px);
        min.y = Math.min(min.y,py);
        max.y = Math.max(max.y,py);
    }

    this._update();
    return this;
};

AABR.prototype.draw = function(center){
    glTrans.pushMatrix();
    glTrans.translate3f(this.center.x,this.center.y,0);
    if(center){
        glDraw.drawPivot();
    }
    glTrans.scale3f(this.size.x,this.size.y,1.0);
    glDraw.drawCubeStroked();
    glTrans.popMatrix();
};

AABR.fromPoints = function(points,aabr){
    return (aabr || new AABR()).setFromPoints(points);
};

AABR.fromPointsf = function(points,aabr){
    return (aabr || new AABR()).setFromPointsf(points);
};

module.exports = AABR;