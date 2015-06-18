var glObject = require('./glObject');

var Math_= require('../math/Math'),
    Vec2 = require('../math/Vec2'),
    Vec3 = require('../math/Vec3'),
    Quat = require('../math/Quat'),
    Matrix44 = require('../math/Matrix44');

var Geom = require('../geom/Geom');

var Mouse      = require('../input/Mouse'),
    MouseEvent = require('../input/MouseEvent');

var ERROR_MSG_NO_CAMERA_SET = 'No Camera set.';

var DEFAULT_SPEED = 0.125;

var DEFAULT_DISTANCE_MIN = 1,
    DEFAULT_DISTANCE_MAX = Number.MAX_VALUE,
    DEFAULT_DISTANCE_STEP = 0.25;

var DEFAULT_PAN_START = Math.PI * 0.25,
    DEFAULT_PAN_RANGE = Math.PI * 0.125,
    DEFAULT_ROTATE_RANGE = Math.PI * 2;

var DEFAULT_AUTO_ROTATION_SPEED = 0.00025,
    DEFAULT_AUTO_PAN_SPEED = 0.000125,
    DEFAULT_AUTO_PAN_ROTATION = DEFAULT_PAN_RANGE;

var AXIS_Y = Vec3.yAxis(),
    AXIS_X = Vec3.xAxis();

// INITIAL - NEEDS CONSTRAINED PAN & ROTATION


/**
 * CameraOrbiter, takes a camera and orbits it around the origin
 * @param {AbstractCamera} camera
 * @constructor
 */

function CameraOrbiter(camera){
    glObject.apply(this);

    this._speed = DEFAULT_SPEED;

    // distance from center to eye
    this._distance = null;
    // distance from target
    this._distanceStep   = DEFAULT_DISTANCE_STEP;
    this._distanceMax    = DEFAULT_DISTANCE_MAX;
    this._distanceMin    = DEFAULT_DISTANCE_MIN;
    // distance to move to
    this._distanceTarget = null;

    // camera to use
    this._camera = null;

    // pan starting from
    this._panStart = DEFAULT_PAN_START;
    // pan start + range = max range
    this._panRange = DEFAULT_PAN_RANGE;
    // normalized mouse x * range = rotation
    this._rotateRange = DEFAULT_ROTATE_RANGE;

    this._posMouseDown  = new Vec2();
    this._posSphereDrag = new Vec3();

    // orientation
    this._orientDown = new Quat();
    this._orientDrag = new Quat();
    this._orientTarget = new Quat();
    this._orientCurr = new Quat();
    // auto orientation rotate - pan, will be merged
    this._orientAutoRotate = new Quat();
    this._orientAutoPan = new Quat();
    this._orientResult = new Quat();

    //local/global rotation delta
    this._localDelta  = new Vec2();
    this._globalDelta = new Vec2();

    //target axis, null if no axis
    //this._axis = null;
    //this._axisForced = false;

    this._autoRotation = 0;
    this._autoRotationSpeed = DEFAULT_AUTO_ROTATION_SPEED;

    this._autoPan = 0;
    this._autoPanRange = DEFAULT_AUTO_PAN_ROTATION;
    this._autoPanSpeed = DEFAULT_AUTO_PAN_SPEED;
    this._autoStopOnDrag = false;

    this._dragging = false;

    var self = this;
    function map(x,y,out){
        x = x * self._rotateRange;
        y = self._panStart + Math_.clamp(y,0,1)  * self._panRange;
        Geom.sphericalToCartesian(x,y,self._distance,out);
    }

    var mouse = Mouse.getInstance();
    mouse.addEventListener(MouseEvent.MOUSE_DOWN,function(e){
        if(!self._camera){
            throw new Error(ERROR_MSG_NO_CAMERA_SET);
        }
        if(!self._interactive){
            return;
        }
        var mouse, mx, my;

        mouse = e.sender;
        mx = 1.0 - mouse.getXNormalized();
        my = mouse.getYNormalized();

        self._posMouseDown.setf(mx, my);

        self._orientDown.set(self._orientCurr);
        self._orientDrag.set(self._orientDown);

        self._localDelta.toZero();
        self._dragging = true;
    });

    mouse.addEventListener(MouseEvent.MOUSE_DRAG,function(e){
        if(!self._camera){
            throw new Error(ERROR_MSG_NO_CAMERA_SET);
        }
        if(!self._interactive){
            return;
        }
        var mouse,mx,my;

        mouse = e.sender;
        mx = 1.0 - mouse.getXNormalized();
        my = mouse.getYNormalized();

        self._localDelta.setf(self._posMouseDown.x - mx, self._posMouseDown.y - my);

        map(self._globalDelta.x + self._localDelta.x,
            self._globalDelta.y + self._localDelta.y,
            self._posSphereDrag);

        self._posSphereDrag.normalize();
        self._orientDrag.setFromDirection(self._posSphereDrag).normalize();
        self._orientTarget.set(self._orientDrag);

        e.sender.setCursorCSS('-webkit-grabbing');
    });

    mouse.addEventListener(MouseEvent.MOUSE_UP,function(e){
        if(!self._camera){
            throw new Error(ERROR_MSG_NO_CAMERA_SET);
        }
        if(!self._interactive){
            return;
        }
        self._globalDelta.add(self._localDelta);
        self._globalDelta.y = Math_.clamp(self._globalDelta.y,0,1);

        self._dragging = false;
        e.sender.setCursorCSS('');
    });

    mouse.addEventListener(MouseEvent.MOUSE_WHEEL,function(e){
        if(!self._interactive){
            return;
        }
        self._distanceTarget += e.sender.getWheelDirection() * -1 * self._distanceStep;
        self._constrainDistanceTarget();
        e.data.preventDefault();
    });

    this._interactive = true;

    //target view matrix temp
    this._matrix = new Matrix44();

    this.setCamera(camera);
}

CameraOrbiter.prototype = Object.create(glObject.prototype);
CameraOrbiter.prototype.constructor = CameraOrbiter;

/**
 * Sets the camera to be used.
 * @param camera
 */

CameraOrbiter.prototype.setCamera = function(camera){
    this._camera = camera;
    this._orientCurr.setFromMatrix44(camera.viewMatrix).copy();

    this._orientTarget.set(this._orientCurr);
    this._distance = this._distanceTarget = camera.getDistance();
};

/**
 * Sets camera movement interpolation speed.
 * @param speed
 */

CameraOrbiter.prototype.setSpeed = function(speed){
    this._speed = speed;
};

/**
 * Sets panning start and range.
 * @param start
 * @param range
 */

CameraOrbiter.prototype.setPan = function(start,range){
    this._panStart = start;
    this._panRange = range;
};

/**
 * Sets rotation range.
 * @param range
 */

CameraOrbiter.prototype.setRotate = function(range){
    this._rotateRange = range;
};

///**
// * Sets a target axis the camera will move to.
// * @param {Vec3} axis
// * @param {Boolean}[force] - If true, the use wont be able to rotate or pan, as
// * long as there is an axis set, auto-rotation is turned of
// */
//
//CameraOrbiter.prototype.setAxis = function(axis,force){
//    this._axis.set(axis).normalize();
//    this._axisForced = force || false;
//};


/**
 * Sets the auto rotation speed.
 * @param speed
 */

CameraOrbiter.prototype.setAutoRotation = function(speed){
    this._autoRotationSpeed = speed;
};

/**
 * Sets the auto pan range and speed.
 * @param range
 * @param [speed]
 */

CameraOrbiter.prototype.setAutoPan = function(range,speed){
    this._autoPanRange = range;
    this._autoPanSpeed = speed === undefined ? this._autoPanSpeed : speed;
};

/**
 * Defines the ondrag behaviour for auto rotation & panning.
 * @param stop
 */

CameraOrbiter.prototype.setStopAutoOnDrag = function(stop){
    this._autoStopOnDrag = stop;
};

/**
 * Sets the max distance from target.
 * @param {Number} max
 */

CameraOrbiter.prototype.setDistanceMax = function(max){
    this._distanceMax = max;
    this._constrainDistanceTarget();
};

/**
 * Sets the max min distance from target.
 * @param {Number} min
 */

CameraOrbiter.prototype.setDistanceMin = function(min){
    this._distanceMin = min;
    this._constrainDistanceTarget();
};

CameraOrbiter.prototype._constrainDistanceTarget = function(){
    this._distanceTarget = Math.max(this._distanceMin,Math.min(this._distanceTarget,this._distanceMax));
};

/**
 * Sets the distance between eye and target.
 * @param {Number} dist
 */

CameraOrbiter.prototype.setDistance = function(dist){
    this._distanceTarget = dist;
};

/**
 * Returns the current distance
 * @returns {Number}
 */

CameraOrbiter.prototype.getDistance = function(){
    return this._distance;
};

/**
 * Returns the maximum distance.
 * @returns {Number}
 */

CameraOrbiter.prototype.getDistanceMin = function(){
    return this._distanceMin;
};

/**
 * Returns the minimum distance.
 * @returns {Number}
 */

CameraOrbiter.prototype.getDistanceMax = function(){
    return this._distanceMax;
};

/**
 * Returns the current distance normalized.
 * @returns {Number}
 */

CameraOrbiter.prototype.getDistanceNormalized = function(min,max){
    min = min === undefined ? 0.0 : min;
    max = max === undefined ? 1.0 : max;
    return Math_.map(this._distance,this._distanceMin,this._distanceMax,min,max);
};

/**
 * Enables interactivity.
 */

CameraOrbiter.prototype.enable = function(){
    this._interactive = true;
};

/**
 * Disables interactivity.
 */

CameraOrbiter.prototype.disable = function(){
    this._interactive = false;
};

/**
 * Apply the camera view matrix transformation.
 */

CameraOrbiter.prototype.apply = function(){
    var camera, viewMatrix;
    var target, curr, result;
    var autoRotate, autoPan;

    camera     = this._camera;
    viewMatrix = this._camera.viewMatrix;

    this._distance += (this._distanceTarget - this._distance) * 0.15;
    camera.setDistance(this._distance);

    this._autoRotation += this._autoRotationSpeed;
    this._autoPan      += this._autoPanSpeed;

    target = this._orientTarget;
    curr   = this._orientCurr;
    result = this._orientResult;

    autoRotate = this._orientAutoRotate;
    autoPan    = this._orientAutoPan;

    if(!(this._autoStopOnDrag && this._dragging)){
        autoRotate.setFromAxisAngle(AXIS_Y,this._autoRotation);
        autoPan.setFromAxisAngle(AXIS_X,(0.5 + Math.sin(this._autoPan * Math.PI) * 0.5) * this._autoPanRange);
    }

    result.set(autoRotate).mult(target).mult(autoPan);
    curr.linearInterpolateTo(result,this._speed);

    viewMatrix.identity();
    viewMatrix.translatef(0,0,-this._distance);
    viewMatrix.mult(curr.toMatrix44(this._matrix).invert());
};

/**
 * Debug draw.
 */

CameraOrbiter.prototype.draw = function(){
    var glTrans, glDraw;
    var prevNum, prevColor;

    glTrans = this._glTrans;
    glDraw  = this._glDraw;
    prevNum   = glDraw.getCircleSegments();
    prevColor = glDraw.getColor();

    glDraw.setCircleSegments(60);
    glTrans.pushMatrix();
        glTrans.scale1f(this._distance);
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
    glTrans.popMatrix();

    glDraw.color(prevColor);
    glDraw.setCircleSegments(prevNum);
};

module.exports = CameraOrbiter;