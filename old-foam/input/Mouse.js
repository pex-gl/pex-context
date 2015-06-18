var _Error = require('../system/common/Error'),
    EventDispatcher = require('../system/EventDispatcher'),
    Event = require('../system/Event'),
    Vec2 = require('../math/Vec2');

/**
 * Representation of mouse input.
 * @constructor
 */

function Mouse() {
    if (Mouse.__instance){
        throw new Error(_Error.CLASS_IS_SINGLETON);
    }

    EventDispatcher.call(this);

    this._position = new Vec2();
    this._positionLast = new Vec2();
    this._positionNormalized = new Vec2();
    this._positionLastNormalized = new Vec2();
    this._down = this._downLast = false;
    this._button = null;
    this._up = false;
    this._move = this._moveLast = false;
    this._leave = this._enter = false;
    this._wheelDelta = 0;
    this._wheelDirection = 0;

    Mouse.__instance = this;
}

Mouse.prototype = Object.create(EventDispatcher.prototype);

/**
 * Return current mouse position.
 * @param {Vec2} [v] - Out position
 * @returns {Vec2}
 */

Mouse.prototype.getPosition = function (v) {
    return (v || new Vec2()).set(this._position);
};

/**
 * Return previous mouse position.
 * @param {Vec2} [v] - Out position
 * @returns {Vec2}
 */

Mouse.prototype.getPositionLast = function (v) {
    return (v || new Vec2()).set(this._positionLast);
};

/**
 * Return current mouse position x.
 * @returns {Number}
 */

Mouse.prototype.getX = function () {
    return this._position.x;
};

/**
 * Return current mouse position y.
 * @returns {Number}
 */

Mouse.prototype.getY = function () {
    return this._position.y;
};

/**
 * Return previous mouse position x.
 * @returns {Number}
 */

Mouse.prototype.getXLast = function () {
    return this._positionLast.x;
};

/**
 * Return previous mouse position y.
 * @returns {Number}
 */

Mouse.prototype.getYLast = function () {
    return this._positionLast.y;
};

/**
 * Return current mouse position normaliized.
 * @param {Vec2} [v] - Out position
 * @returns {Vec2}
 */

Mouse.prototype.getPositionNormalized = function(v){
    return (v || new Vec2()).set(this._positionNormalized);
}

/**
 * Return previous mouse position normaliized.
 * @param {Vec2} [v] - Out position
 * @returns {Vec2}
 */


Mouse.prototype.getPositionLastNormalized = function (v) {
    return (v || new Vec2()).set(this._positionLastNormalized);
};

/**
 * Return current mouse position x normalized.
 * @returns {Number}
 */

Mouse.prototype.getXNormalized = function () {
    return this._positionNormalized.x;
};

/**
 * Return current mouse position y normalized.
 * @returns {Number}
 */

Mouse.prototype.getYNormalized = function () {
    return this._positionNormalized.y;
};

/**
 * Return previous mouse position x normalized.
 * @returns {Number}
 */


Mouse.prototype.getXLastNormalized = function () {
    return this._positionLastNormalized.x;
};

/**
 * Return previous mouse position x normalized.
 * @returns {Number}
 */

Mouse.prototype.getYLastNormalized = function () {
    return this._positionLastNormalized.y;
};

/**
 * Return mouse wheel delta.
 * @returns {Number}
 */

Mouse.prototype.getWheelDelta = function () {
    return this._wheelDelta;
};

/**
 * Returns mouse wheel direction -1,1.
 * @returns {*}
 */

Mouse.prototype.getWheelDirection = function(){
    return this._wheelDirection;
}

/**
 * Returns true if the mouse is down.
 * @returns {Boolean}
 */

Mouse.prototype.isDown = function(){
    return this._down;
};

/**
 * Returns true if the mouse is pressed (hold).
 * @returns {Boolean}
 */

Mouse.prototype.isPressed = function(){
    return this._down && !this._downLast;
}

/**
 * Returns true if the mouse is dragged.
 * @returns {Boolean}
 */

Mouse.prototype.isDragged = function(){
    return this._down && this._move;
};

/**
 * Returns true if the mouse did move.
 * @returns {Boolean}
 */

Mouse.prototype.didMove = function(){
    return this._move;
};

/**
 * Returns true if the mouse did enter the window (canvas).
 * @returns {Boolean}
 */

Mouse.prototype.didEnter = function(){
    return this._enter;
};

/**
 * Returns true if the mouse did leave the window (canvas).
 * @returns {Boolean}
 */

Mouse.prototype.didLeave = function(){
    return this._leave;
};


Mouse.prototype.isLeft = function(){
    return this._button == 1;
};

Mouse.prototype.isRight = function(){
    return this._button = 2;
};

Mouse.prototype.isMiddle = function(){
    return this._button = 3;
};

/**
 * Sets the cursor css display property used when over hovering the canvas.
 * (See App.js for implementation)
 * @param {String} property
 */

Mouse.prototype.setCursorCSS = function(property){};


/**
 * Return the singleton.
 * @returns {Mouse|*}
 */

Mouse.__instance = null;
Mouse.getInstance = function () {
    return Mouse.__instance;
};

Mouse.dispose = function(){
    Mouse.__instance.removeAllEventListeners();
    Mouse.__instance = null;
};

module.exports = Mouse;