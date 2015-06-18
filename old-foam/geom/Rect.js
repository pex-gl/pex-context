var Vec2 = require('../math/Vec2'),
    Vec3 = require('../math/Vec3');

var glTrans = require('../gl/glTrans'),
    glDraw,_glDraw = require('../gl/glDraw');

/**
 * Rectangle representation
 * @constructor
 */

function Rect() {
    this.min = new Vec2();
    this.max = new Vec2();

    switch (arguments.length){
        case 1:
            this.setSize(arguments[0]);
            break;
        case 2:
            this.setSizef(arguments[0],arguments[1]);
            break;
        case 4:
            this.setf(arguments[0],arguments[1],arguments[2],arguments[3]);
            break;
    }

    glDraw = glDraw || _glDraw.get();
}

/**
 * Constructs new Rectangle from a set of points
 * @param {Array} points - Vec2 array
 * @param {Rect} [rect] - out rec
 * @returns {*}
 */

Rect.fromPoints = function(points,rect){
    return (rect || new Rect()).setFromPoints(points);
};

/**
 * Returns a copy of the rectangle.
 * @param {Rect} [rect] - Optional out rectangle
 * @returns {Rect}
 */

Rect.prototype.copy = function(rect){
    return (rect || new Rect()).set(this);
};

/**
 * Sets rectangle from rectangle
 * @param rect
 * @returns {Rect}
 */

Rect.prototype.set = function(rect){
    this.min.set(rect.min);
    this.max.set(rect.max);
    return this;
};

/**
 * Sets min max point
 * @param {Number} x0 - minX
 * @param {Number} y0 - minY
 * @param {Number} x1 - maxX
 * @param {Number} y1 - maxY
 * @returns {Rect}
 */

Rect.prototype.setf = function(x0,y0,x1,y1){
    this.min.setf(x0,y0);
    this.max.setf(x1,y1);
    return this;
};

/**
 * Sets  from a set of points
 * @param {Array} points - Vec2 array
 * @returns {Rect}
 */

Rect.prototype.setFromPoints = function(points){
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
    return this;
};

/**
 * Sets origin
 * @param {Vec2} v - The point
 * @returns {Rect}
 */

Rect.prototype.setPosition = function(v){
    var width = this.getWidth(),
        height = this.getHeight();
    this.min.set(v);
    this.max.set(this.min).addf(width,height);
    return this;
};

/**
 * Sets origin
 * @param {Number} x - origin x
 * @param {Number} y - origin y
 * @returns {Rect}
 */

Rect.prototype.setPositionf = function(x,y){
    var width = this.getWidth(),
        height = this.getHeight();
    this.min.setf(x,y);
    this.max.set(this.min).addf(width,height);
    return this;
};

/**
 * Returns true if the point is within the rectangle
 * @param {Number} x - point x
 * @param {Number} y - point y
 * @returns {boolean}
 */

Rect.prototype.isPointInsidef = function(x,y){
    var min = this.min, max = this.max;
    return x >= min.x && x <= max.x &&
           y >= min.y && y <= max.y;
};

/**
 * Returns true if the point is within the rectangle
 * @param {Vec2} v - the point
 * @returns {boolean}
 */

Rect.prototype.isPointInside = function(v){
    return this.isPointInsidef(v.x, v.y);
};

/**
 * Returns true if the rectangle is within the rectangle
 * @param {Number} minX
 * @param {Number} minY
 * @param {Number} maxX
 * @param {Number} maxY
 * @returns {boolean}
 */

Rect.prototype.isRectInsidef = function (minX,minY,maxX,maxY) {
    return this.isPointInsidef(minX,minY) && this.isPointInsidef(maxX,maxY);
};

/**
 * Returns true if the rectangle is within the rectangle
 * @param {Rect} rect
 * @returns {boolean}
 */

Rect.prototype.isRectInside = function(rect){
    return this.isRectInsidef(rect.min.x,rect.min.y,rect.max.x,rect.max.y);
};

/**
 * Expands the bounds to include a given rectangle.
 * @param {Rect} rect
 * @returns {Rect}
 */

Rect.prototype.include = function(rect){
    var min = this.min,
        max = this.max,
        rmin = rect.min,
        rmax = rect.max;

    if(min.x > rmin.x) {
        min.x = rmin.x;
    }
    if(max.x < rmax.x) {
        max.x = rmax.x;
    }
    if(min.y > rmin.y) {
        min.y = rmin.y;
    }
    if(max.y < rmax.y) {
        max.y = rmax.y;
    }
    return this;
};

/**
 * Expands the bounds to include a given point
 * @param {Vec2} point
 * @returns {Rect}
 */

Rect.prototype.includePoint = function(point){
    var min = this.min,
        max = this.max;

    var x = point.x,
        y = point.y;

    if(min.x > x) {
        min.x = x;
    }
    if(max.x < x) {
        max.x = x;
    }
    if(min.y > y) {
        min.y = y;
    }
    if(max.y < y) {
        max.y = y;
    }

    return this;
};

/**
 * Expands the bounds to include a given set of points
 * @param {Array} points - Vec2 array
 * @returns {Rect}
 */

Rect.prototype.includePoints = function(points){
    var min = this.min,
        max = this.max;

    var p,x,y;
    var i = -1, l = points.length;

    while(++i < l){
        p = points[i];
        x = p.x;
        y = p.y;

        if(min.x > x) {
            min.x = x;
        }
        if(max.x < x) {
            max.x = x;
        }
        if(min.y > y) {
            min.y = y;
        }
        if(max.y < y) {
            max.y = y;
        }
    }

    return this;
};

/**
 * Scales the rectangle
 * @param {Number} n - scale
 * @returns {Rect}
 */

Rect.prototype.scale = function(n){
    this.min.scale(n);
    this.max.scale(n);
    return this;
};

/**
 * Returns true if min and max points are zero
 * @returns {boolean}
 */

Rect.prototype.isZero = function(){
    return this.min.x == 0 && this.min.y == 0 &&
           this.max.x == 0 && this.max.y == 0;
};

/**
 * Returns the origin
 * @param {Vec2} [v] - optional out
 * @returns {Vec2}
 */

Rect.prototype.getPosition = function(v){
    return (v || new Vec2()).set(this.min);
};

/**
 * Sets the width and height of the rectangle
 * @param {Vec2} v - width height
 * @returns {Rect}
 */

Rect.prototype.setSize = function(v){
    this.max.set(this.min).add(v);
    return this;
};

/**
 * Sets the width and height of the rectangle
 * @param {Number} width
 * @param {Number} height
 * @returns {Rect}
 */

Rect.prototype.setSizef = function(width,height){
    this.max.set(this.min).addf(width,height);
    return this;
};

/**
 * Sets the width of the rectangle
 * @param {Number} width
 * @returns {Rect}
 */

Rect.prototype.setWidth = function(width){
    this.max.x = this.min.x + width;
    return this;
};

/**
 * Sets the height of the rectangle
 * @param {Number} height
 * @returns {Rect}
 */

Rect.prototype.setHeight = function(height){
    this.max.y = this.min.y + height;
    return this;
};

/**
 * Returns the current width
 * @returns {Number}
 */

Rect.prototype.getWidth = function(){
    return this.max.x - this.min.x;
};

/**
 * Returns the current height
 * @returns {Number}
 */

Rect.prototype.getHeight = function(){
    return this.max.y - this.min.y;
};

/**
 * Returns the size
 * @param {Vec2} [v] - optional out
 * @returns {Vec2}
 */

Rect.prototype.getSize = function(v){
    return (v || new Vec2()).setf(this.getWidth(),this.getHeight());
};

/**
 * Returns the center
 * @param {Vec2} [v] - optional out
 * @returns {Vec2}
 */

Rect.prototype.getCenter = function(v){
    return (v || new Vec2()).setf((this.min.x + this.max.x) * 0.5,(this.min.y + this.max.y) * 0.5);
};

/**
 * Returns the top left
 * @param {Vec2} [v] - optional out
 * @returns {Vec2}
 */

Rect.prototype.getTL = function(v){
    return this.min.copy(v);
};

/**
 * Returns the top right
 * @param {Vec2} [v] - optional out
 * @returns {Vec2}
 */


Rect.prototype.getTR = function(v){
    return (v || new Vec2()).setf(this.max.x, this.min.y);
};

/**
 * Returns the bottom left
 * @param {Vec2} [v] - optional out
 * @returns {Vec2}
 */


Rect.prototype.getBL = function(v){
    return (v || new Vec2).setf(this.min.x, this.max.y);
};

/**
 * Returns the bottom right
 * @param {Vec2} [v] - optional out
 * @returns {Vec2}
 */


Rect.prototype.getBR = function(v){
    return this.max.copy(v);
};

/**
 * Returns the current width / height ratio
 * @returns {number}
 */

Rect.prototype.getAspectRatio = function(){
    return this.getWidth() / this.getHeight();
};


Rect.prototype.equals = function(rect){
    return this.min.equals(rect.min) && this.max.equals(rect.max);
};

/**
 * Returns true of min and max are zero
 * @returns {*}
 */

Rect.prototype.isZero = function(){
    return this.min.isZero() && this.max.isZero();
};

/**
 * Debug draw
 */

Rect.prototype.draw = function(){
    glTrans.pushMatrix();
    glTrans.translate3f(this.min.x,this.min.y,0);
    glDraw.drawRectStroked(this.getWidth(),this.getHeight());
    glTrans.popMatrix();
};


module.exports = Rect;