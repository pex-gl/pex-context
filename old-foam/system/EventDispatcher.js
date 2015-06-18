var ObjectUtil = require('../util/ObjectUtil');

/**
 * EventDispatcher base class.
 * @constructor
 */

EventDispatcher = function () {
    this._listeners = {};
};

/**
 * Register an event callback for a certain type.
 * @param {String} type - The event type
 * @param {Function} method - Callback if event is raised
 */

EventDispatcher.prototype.addEventListener = function (type, method) {
    this._listeners[type] = this._listeners[type] || [];
    this._listeners[type].push(method);
};

/**
 * Dispatch an event
 * @param {Event} event - The event
 */

EventDispatcher.prototype.dispatchEvent = function (event) {
    var type = event.type;
    if (!this.hasEventListener(type)){
        return;
    }
    var methods = this._listeners[type];
    var i = -1, l = methods.length;
    while (++i < l) {
        methods[i](event);
    }
};

/**
 * Remove a callback from the dispatcher.
 * @param {String} type = The type
 * @param {Function} [method] - The callback to be removed (if not specified, all callbacks will be removed)
 */

//TODO: Fix this!, function(){}.bind(context) always returns a new function, so comparison for those will always fail

EventDispatcher.prototype.removeEventListener = function (type, method) {
    if (!this.hasEventListener(type)){
        return;
    }

    if(method){
        var methods = this._listeners[type];
        var i = methods.length;
        while (--i > -1) {
            if (methods[i] == method) {
                methods.splice(i, 1);
                if (methods.length == 0){
                    delete this._listeners[type];
                }
                break;
            }
        }
        return;
    }
    delete this._listeners[type];
};

/**
 * Completely remove all listeners.
 */

EventDispatcher.prototype.removeAllEventListeners = function () {
    this._listeners = {};
};

/**
 * Returns true there are listeners for a event type.
 * @param {String} type - The type
 * @returns {Boolean}
 */

EventDispatcher.prototype.hasEventListener = function (type) {
    return this._listeners[type] != undefined && this._listeners[type] != null;
};

/**
 * Returns the number of listerners for a certain event type.
 * @returns {*}
 */

EventDispatcher.prototype.getNumListerners = function(){
    return ObjectUtil.getNumKeys(this._listeners);
}

module.exports = EventDispatcher;