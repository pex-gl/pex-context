var EventDispatcher = require('../system/EventDispatcher');

var instance = null;

function Window_(){
    EventDispatcher.call(this);

    this._bounds = null;
    this._scale  = -1;
    this._aspectRatio = -1;
    this._fullscreen = false;
}

Window_.prototype = Object.create(EventDispatcher.prototype);
Window_.prototype.constructor = Window_;

/**
 * Returns the current app window width.
 * @returns {number}
 */

Window_.prototype.getWidth = function () {
    return this._bounds.getWidth();
};

/**
 * Returns the current app window height.
 * @returns {number}
 */

Window_.prototype.getHeight = function () {
    return this._bounds.getHeight();
};

/**
 * Returns the current app window size.
 * @param {Vec2} [out] - Optional out
 * @returns {Vec2}
 */

Window_.prototype.getSize = function(out) {
    return this._bounds.getSize(out);
};

/**
 * Returns the current app window aspect ratio.
 * @returns {number}
 */

Window_.prototype.getAspectRatio = function(){
    return this._aspectRatio;
};

/**
 * Returns the current app window scale.
 * @returns {number}
 */

Window_.prototype.getScale = function(){
    return this._scale;
};

/**
 * Returns the current app window bounds.
 * @param {Rect} [out] - Optional out
 * @returns {Rect}
 */

Window_.prototype.getBounds = function(out){
    return this._bounds.copy(out);
};

/**
 * Returns true if the app is in fullscreen mode.
 * @returns {boolean}
 */

Window_.prototype.isFullscreen = function(){
    return this._fullscreen;
};

Window_.init = function(){
    instance = instance || new Window_();
    return instance;
};

/**
 * Returns a reference to the apps window.
 * @returns {Window_}
 */

Window_.get = function() {
    return instance;
};

Window_.dispose = function() {
    instance.removeAllEventListeners();
    instance = null;
};

module.exports = Window_;