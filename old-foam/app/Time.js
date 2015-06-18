/**
 * Represents application time.
 * @type {{}}
 */

var Time = {};

/**
 * Indicates whether time updates are currently stopped.
 * @type {boolean}
 * @private
 */

Time.__stopped = false;

/**
 * Timestamp before update loop start.
 * @type {number}
 * @private
 */

Time.__start = -1;

/**
 * Current timestamp update loop.
 * @type {number}
 * @private
 */

Time.__now = -1;

/**
 * Previous timestamp update loop.
 * @type {number}
 * @private
 */

Time.__previous = -1;

/**
 * Timestamp now and previous diff.
 * @type {number}
 * @private
 */

Time.__elapsed = -1;

/**
 * Timestamp diff between two frames.
 * @type {number}
 * @private
 */

Time.__frame = -1;

/**
 * Frame time in seconds.
 * @type {number}
 * @private
 */

Time.__delta = -1;

/**
 * Time elapsed since Time.getStart() in seconds.
 * @type {number}
 * @private
 */

Time.__secondsElapsed = -1;

/**
 * Current fixed update loop set.
 * @type {number}
 * @private
 */

Time.__fixedStep = -1;

/**
 * Resets time properties.
 * @private
 */

Time.__reset = function(){
    this.__start    = 0;
    this.__now      = 0;
    this.__previous = 0;
    this.__elapsed  = 0;
    this.__frame    = 0;
    this.__delta    = 0;

    this.__secondsElapsed = 0;
};

/**
 * Returns the update loops current timestamp.
 * @returns {number}
 */

Time.getNow = function(){
    return this.__now;
};

/**
 * Returns the difference between the update loops current time stamp and Time.getStart().
 * @returns {number}
 */

Time.getElapsed = function(){
    return this.__elapsed;
};

/**
 * Returns the seconds elapsed since update loop start.
 * @returns {number}
 */

Time.getSecondsElapsed = function(){
    return this.__secondsElapsed;
};

/**
 * Returns the timestamp right before the update loop is called.
 * @returns {number}
 */

Time.getStart = function(){
    return this.__start;
};

/**
 * Returns the delta time in milliseconds.
 * @returns {number}
 */

Time.getDelta = function(){
    return this.__delta;
};

/**
 * Returns the fixed time step.
 * @returns {number}
 */

Time.getFixedStep = function(){
    return this.__fixedStep;
};

/**
 * Returns true if Time updates are stopped.
 * @returns {boolean}
 */

Time.isStopped = function(){
    return this.__stopped;
};


/**
 * Returns a loggable string representation of Time.
 * @returns {string}
 */

Time.toString = function(){
    return  'start: ' + this.__start + '\n' +
            'now: ' + this.__now + '\n' +
            'previous: ' + this.__previous + '\n' +
            'elapsed: ' + this.__elapsed + '\n' +
            'frame: ' + this.__frame + '\n' +
            'delta: ' + this.__delta + '\n' +
            'secondsElapsed: ' + this.__secondsElapsed + '\n' +
            'fixedStep: ' + this.__fixedStep + '\n';
};

module.exports = Time;