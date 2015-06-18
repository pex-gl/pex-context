var glObject = require('./glObject');
var ObjectUtil = require('../util/ObjectUtil');

var App         = require('../app/App'),
    Window_     = require('../app/Window'),
    WindowEvent = require('../app/WindowEvent');
var Mouse       = require('../input/Mouse'),
    MouseEvent  = require('../input/MouseEvent');

var Vec2     = require('../math/Vec2'),
    Vec3     = require('../math/Vec3'),
    Quat     = require('../math/Quat'),
    Matrix44 = require('../math/Matrix44'),
    Rect     = require('../geom/Rect'),
    Math_    = require('../math/Math');

var glu = require('./glu');

var DEFAULT_RADIUS_SCALE = 2.25,
    DEFAULT_SPEED = 0.095,
    DEFAULT_DISTANCE_STEP = 0.25;

//https://www.talisman.org/~erlkonig/misc/shoemake92-arcball.pdf

/**
 * Arcball
 * @param {CameraAbstract} camera - The camera view matrix to be used
 * @param {Rect} [bounds] - Optional restricted window bounds, default: window bounds
 * @constructor
 */

function Arcball(camera,bounds){
    glObject.apply(this);

    camera = this._camera = camera;

    this._center =
    this._radius =
    this._radiusScale =
    this._speed = null;

    bounds = this._bounds = bounds ? bounds.copy() : null;


    var window_, mouse, self;
    var tempVec2_0, tempVec2_1;

    this.setRadiusScale(DEFAULT_RADIUS_SCALE);
    this.setSpeed(DEFAULT_SPEED);

    this._distanceStep = DEFAULT_DISTANCE_STEP;
    this._distance = this._distanceTarget = camera.getDistance();
    this._distanceMax = Number.MAX_VALUE;
    this._distanceMin = -Number.MAX_VALUE;

    this._posDown    = new Vec2();
    this._posDownPtr = new Vec3();
    this._posDragPtr = new Vec3();

    //TODO:Check
    this._orientCurr   = Quat.fromMatrix44(camera.viewMatrix.inverted());
    this._orientDown   = new Quat();
    this._orientDrag   = new Quat();
    this._orientTarget = this._orientCurr.copy();

    this._matrix = new Matrix44();

    this._interactive = true;
    this._constrainAxis = null;

    window_ = Window_.get();
    mouse   = Mouse.getInstance();
    self    = this;

    this._center = bounds ? new Vec2(bounds.getWidth() * 0.5, bounds.getHeight() * 0.5) : window_.getSize().scale(0.5);
    this._updateRadius();

    tempVec2_0 = new Vec2();
    tempVec2_1 = new Vec2();

    window_.addEventListener(WindowEvent.RESIZE, function (data) {
        if(self._bounds){
            return;
        }
        self._center = data.sender.getSize().scale(0.5);
        self._updateRadius();
    });

    function mapPos(pos){
        var bounds = self._bounds,
            height = bounds.getHeight(),
            min    = bounds.min,
            max    = bounds.max;

        pos.x = Math_.clamp(pos.x,min.x,max.x) - min.x;
        pos.y = height - Math_.clamp(pos.y,min.y,max.y) + min.y;
    }


    mouse.addEventListener(MouseEvent.MOUSE_DOWN,function(e){
        if(!self._interactive){
            return;
        }
        var pos = e.sender.getPosition();
        var windowHeight = window_.getHeight(),
            bounds       = self._bounds;

        self._posDown.set(pos);

        if(bounds){
            if(!bounds.isPointInside(pos)){
                return;
            }
            mapPos(pos);
        } else {
            pos.y = windowHeight - pos.y;
        }

        self._posDownPtr = self._mapSphere(tempVec2_0.set(pos));
        self._orientDown.set(self._orientCurr);
        self._orientDrag.identity();

        e.sender.setCursorCSS('');
    });

    mouse.addEventListener(MouseEvent.MOUSE_DRAG,function(e){
        if(!self._interactive){
            return;
        }
        var pos = e.sender.getPosition();
        var windowHeight = window_.getHeight(),
            bounds       = self._bounds;

        if(bounds){
            if(!bounds.isPointInside(self._posDown)){
                return;
            }
            mapPos(pos);
        } else {
            pos.y = windowHeight - pos.y;
        }

        self._posDragPtr = self._mapSphere(tempVec2_1.set(pos));
        self._orientDrag.setVec3(self._posDownPtr.dot(self._posDragPtr),self._posDownPtr.crossed(self._posDragPtr));
        self._orientTarget = self._orientDrag.multiplied(self._orientDown);

        e.sender.setCursorCSS('-webkit-grabbing');
    });

    mouse.addEventListener(MouseEvent.MOUSE_UP,function(e){
        e.sender.setCursorCSS('');
    });

    mouse.addEventListener(MouseEvent.MOUSE_WHEEL,function(e){
        if(!self._interactive){
            return;
        }
        self._distanceTarget += e.sender.getWheelDirection() * -1 * self._distanceStep;
        self._distanceTarget  = Math.max(self._distanceMin,Math.min(self._distanceTarget,self._distanceMax));
        e.data.preventDefault();
    });
}

Arcball.prototype = Object.create(glObject.prototype);
Arcball.prototype.constructor = Arcball;



/**
 * Restricts and maps arcball rotation to a certain area
 * @param {Rect} bounds - The area
 */

Arcball.prototype.setBounds = function(bounds){
    bounds ? this.setBoundsf(bounds.min.x,bounds.min.y,bounds.max.x,bounds.max.y) : this.setBoundsf();
};

/**
 * Restricts and maps arcball rotation to a certain area
 * @param {Number} [minX]
 * @param {Number} [maxX]
 * @param {Number} [minY]
 * @param {Number} [maxY]
 */

Arcball.prototype.setBoundsf = function(minX,minY,maxX,maxY){
    if(ObjectUtil.isUndefined(minX) || ObjectUtil.isUndefined(maxX) ||
       ObjectUtil.isUndefined(minY) || ObjectUtil.isUndefined(maxY)){
        this._bounds = null;
        this._center = App.getInstance().getWindowSize().scale(0.5);
    } else {
        this._bounds = new Rect(minX,minY,maxX,maxY);
        this._center = new Vec2(this._bounds.getWidth() * 0.5, this._bounds.getHeight() * 0.5);

    }
    this._updateRadius();

};

/**
 * Applies the arcball rotation to the camera.
 */

Arcball.prototype.apply = function(){
    this._distance += (this._distanceTarget - this._distance) * this._speed;

    var viewMatrix = this._camera.viewMatrix.identity();
        viewMatrix.translatef(0,0,-this._distance);

    viewMatrix.mult(
        this._orientCurr.interpolateTo(this._orientTarget,this._speed)
            .toMatrix44(this._matrix));
};

/**
 * Draws the arcballs rotation gizmo.
 */

Arcball.prototype.debugDraw = function(){
    var glTrans = this._glTrans,
        glDraw  = this._glDraw;
    var prevNum   = glDraw.getCircleSegments(),
        prevColor = glDraw.getColor();

    glDraw.setCircleSegments(60);

    glTrans.pushMatrix();
    glDraw.colorf(0,0,1);
    glDraw.drawCircleStroked();
    glDraw.colorf(0,1,0);
    glTrans.rotate3f(Math.PI * 0.5,0,0);
    glDraw.drawCircleStroked();
    glTrans.rotate3f(0,Math.PI * 0.5,0);
    glDraw.colorf(1,0,0);
    glDraw.drawCircleStroked();
    glTrans.popMatrix();

    glTrans.pushMatrix();
    glTrans.popMatrix();

    glTrans.pushMatrix();
    glTrans.popMatrix();

    glDraw.color(prevColor);
    glDraw.setCircleSegments(prevNum);
};

/**
 * Sets the arcball radius scale
 * @param {number} s
 */

Arcball.prototype.setRadiusScale = function(s){
    this._radiusScale = 1.0 / (ObjectUtil.isUndefined(s) ? DEFAULT_RADIUS_SCALE : s);
    this._updateRadius();
};

/**
 * Sets the arcball view matrix to be used.
 * @param {CameraAbstract} camera
 */

Arcball.prototype.setCamera = function(camera){
    this._camera = camera;
};

/**
 * Sets the rotation speed.
 * @param {Number} s
 */

Arcball.prototype.setSpeed = function(s){
    this._speed = ObjectUtil.isUndefined(s) ? this._speed : s;
};

/**
 * Constrains rotation to a specified axis.
 * @param {Vec3} axis
 */

Arcball.prototype.setConstrainAxis = function(axis){
    this._constrainAxis = axis.normalized();
};

/**
 * Sets the max distance from target.
 * @param {Number} max
 */

Arcball.prototype.setDistanceMax = function(max){
    this._distanceMax = max;
};

/**
 * Sets the max min distance from target.
 * @param {Number} min
 */

Arcball.prototype.setDistanceMin = function(min){
    this._distanceMin = min;
};

/**
 * Sets the distance between eye and target.
 * @param {Number} dist
 */

Arcball.prototype.setDistance = function(dist){
    this._distanceTarget = dist;
};

/**
 * Returns the current distance
 * @returns {Number}
 */

Arcball.prototype.getDistance = function(){
    return this._distance;
};

/**
 * Sets a target camera eye.
 * @param {Vec3} target
 */

Arcball.prototype.setEye = function(target){
    //Fix this
    glu.lookAt(this._matrix,target.x,target.y,target.z,0,0,0,0,this._camera.getU(),0);
    this._matrix.toQuat(this._orientTarget);
};

/**
 * Enables interactivity.
 */

Arcball.prototype.enable = function(){
    this._interactive = true;
};

/**
 * Disables interactivity.
 */

Arcball.prototype.disable = function(){
    this._interactive = false;
};


Arcball.prototype._mapSphere = function(pos){

    var dir = this._distance < 0 ? -1 : 1;
    pos.sub(this._center).scale(1.0 / this._radius);

    pos = new Vec3(pos.x,pos.y * dir,0);
    var len = pos.lengthSq();
    if(len > 1.0){
        pos.normalize();
    } else {
        pos.z = Math.sqrt(1 - len);
    }
    var axis = this._constrainAxis;
    if(axis){
        var proj = pos.subbed(axis.scaled(pos.dot(axis))),
            norm = proj.length();
        if(norm > 0){
            pos = proj.scaled(1.0 / norm * (proj.z < 0 ? -1 : 1));
        } else if(axis.z == 1.0){
            pos.setf(1,0,0);
        } else {
            pos.setf(-axis.y,axis.y,0);
        }
    }
    return pos;
};

Arcball.prototype._updateRadius = function(){
    var width, height;
    if(this._bounds){
        width  = this._bounds.getWidth();
        height = this._bounds.getHeight();
    } else {
        var window_ = Window_.get();
        width  = window_.getWidth();
        height = window_.getHeight();
    }

    this._radius = Math.min(width, height) * this._radiusScale;
};

module.exports = Arcball;