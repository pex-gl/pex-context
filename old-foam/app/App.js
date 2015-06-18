var Error_          = require('../system/common/Error'),
    ObjectUtil      = require('../util/ObjectUtil'),
    EventDispatcher = require('../system/EventDispatcher'),
    Event           = require('../system/Event'),
    System          = require('../system/System'),
    Time            = require('./Time'),
    TimeEvent       = require('./TimeEvent'),
    Resource        = require('../system/Resource'),
    Vec2            = require('../math/Vec2'),
    Rect            = require('../geom/Rect'),
    Mouse           = require('../input/Mouse'),
    MouseEvent      = require('../input/MouseEvent'),
    Keyboard        = require('../input/Keyboard'),
    KeyEvent        = require('../input/KeyEvent'),
    Window_         = require('./Window'),
    WindowEvent     = require('./WindowEvent'),
    gl              = require('../gl/gl'),
    glDraw          = require('../gl/glDraw'),
    glTrans         = require('../gl/glTrans'),
    glExtensions    = require('../gl/glExtensions');

var DEFAULT_WINDOW_WIDTH = 800,
    DEFAULT_WINDOW_HEIGHT = 600;
var DEFAULT_FPS = 60.0,
    DEFAULT_FIXED_TIMESTEP = 50.0;

var KEY_PRESS_THRESHOLD = 100;
var MAX_FRAME_SKIP = 200;

/**
 * Base class for all Foam applications.
 * @param {HTMLCanvasElement} [canvas] - Target canvas
 * @param {Object} [resources] - Resources object
 * @returns {App}
 * @constructor
 */

function App(canvas,resources) {
    if (App.__instance) {
        throw new Error(Error_.CLASS_IS_SINGLETON);
    }

    if(!window.WebGLRenderingContext){
        this.onWebGLContextNotAvailable();
        return this;
    }

    EventDispatcher.apply(this);


    //
    //  Context & Window
    //

    this.__window = Window_.init();
    this.__window._bounds      = new Rect();
    this.__window._aspectRatio = 0;
    this.__window._scale       = 1.0;
    this.__window._fullscreen  = false;

    //
    //  input
    //
    this.__mouseTimer = null;
    this.__mouse = new Mouse();
    this.__keyboard = new Keyboard();

    //
    //  time
    //
    this.__targetFPS = -1;
    this.__numFramesElapsed = 0;

    this.__tick = null;
    this.__tickLoop = true;
    this.__tickRequestId = null;
    this.__tickAccumulator = 0;

    Time.__reset();
    Time.__fixedStep = DEFAULT_FIXED_TIMESTEP;

    this.setFPS(DEFAULT_FPS);

    //
    //  canvas & context
    //

    var externalCanvas, options;

    externalCanvas = !!canvas;
    options        = {alpha:true,preserveDrawingBuffer:true};

    canvas = this.__canvas = (!externalCanvas) ? document.createElement('canvas') : canvas;
    canvas.setAttribute('tabindex','0');
    canvas.focus();

    var _gl = canvas.getContext('webkit-3d',options) ||
              canvas.getContext("webgl",options) ||
              canvas.getContext("experimental-webgl",options);

    if(!_gl){
        this.onWebGLContextNotAvailable();
        return this;
    }

    if(externalCanvas){
        this.setWindowSize(canvas.width, canvas.height);
    } else {
        this.setWindowSize(DEFAULT_WINDOW_WIDTH, DEFAULT_WINDOW_HEIGHT);
        document.body.appendChild(canvas);
    }

    _gl.activeTexture(_gl.TEXTURE0);
    gl.set(_gl);
    glDraw.init();

    /**
     * Reference to WebGLRenderingContext
     * @type {CanvasRenderingContext2D}
     * @protected
     */
    this._gl = _gl;

    /**
     * Reference to glDraw.
     * @type {glDraw}
     * @protected
     */
    this._glDraw = glDraw.get();

    /**
     * Reference to glTrans
     * @type {glTrans}
     * @protected
     */

    this._glTrans = glTrans;

    for(var ext in glExtensions){
        glExtensions[ext] = _gl.getExtension(ext);
    }

    window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame;

    window.performance =
        window.performance && window.performance.now ?
        window.performance : {
            offset :
                window.performance && window.performance.timing && window.performance.timing.navigationStart ?
                window.performance.timing.navigationStart :
                Date.now(),
            now    : function(){
                return Date.now() - this.offset;
            }
        };

    App.__instance = this;

    var mouse, keyboard;
    var self;

    mouse    = this.__mouse;
    keyboard = this.__keyboard;

    self = this;

    mouse.setCursorCSS = function(property){
        self.__canvas.style.cursor = property;
    };

    window.addEventListener('resize', function(){
        if(self.__window.hasEventListener(WindowEvent.RESIZE)){
            self.__window.dispatchEvent(new Event(self.__window,WindowEvent.RESIZE));
        }
        if(self.hasEventListener(WindowEvent.RESIZE)){
            self.dispatchEvent(new Event(self,WindowEvent.RESIZE));
        }
        self.onWindowResize();
    });


    function onMouseStopped(){
        mouse._positionLast.x = mouse._position.x;
        mouse._positionLast.y = mouse._position.y;
        mouse._positionLastNormalized.x = mouse._positionNormalized.x;
        mouse._positionLastNormalized.y = mouse._positionNormalized.y;
        mouse._move = false;

        if(mouse.hasEventListener(MouseEvent.MOUSE_STOP)){
            mouse.dispatchEvent(new Event(mouse,MouseEvent.MOUSE_STOP));
        }
    }

    canvas.addEventListener('mousemove',function(e){
        mouse._move = true;
        mouse._positionLast.x = mouse._position.x;
        mouse._positionLast.y = mouse._position.y;
        mouse._position.x = e.offsetX || e.clientX;
        mouse._position.y = e.offsetY || e.clientY;
        mouse._positionLastNormalized.x = mouse._positionNormalized.x;
        mouse._positionLastNormalized.y = mouse._positionNormalized.y;
        mouse._positionNormalized.x = mouse._position.x / self.__window.getWidth();
        mouse._positionNormalized.y = mouse._position.y / self.__window.getHeight();

        if(mouse._down){
            if(mouse.hasEventListener(MouseEvent.MOUSE_DRAG)){
                mouse.dispatchEvent(new Event(mouse,MouseEvent.MOUSE_DRAG));
            }
        }

        clearTimeout(self.__mouseTimer);
        self.__mouseTimer = setTimeout(onMouseStopped,100);

        if(mouse.hasEventListener(MouseEvent.MOUSE_MOVE)){
            mouse.dispatchEvent(new Event(mouse,MouseEvent.MOUSE_MOVE));
        }
    });

    canvas.addEventListener('mousedown',function(event){
        mouse._downLast = mouse._down;
        mouse._down = true;
        mouse._button = event.which;

        if(mouse._down && !mouse._downLast){
            if(mouse.hasEventListener(MouseEvent.MOUSE_PRESSED)){
                mouse.dispatchEvent(new Event(mouse,MouseEvent.MOUSE_PRESSED));
            }
        }

        if(mouse.hasEventListener(MouseEvent.MOUSE_DOWN)){
            mouse.dispatchEvent(new Event(mouse,MouseEvent.MOUSE_DOWN));
        }
    });

    canvas.addEventListener('mouseup',function(event){
        mouse._down = false;
        mouse._button = event.which;
        if(mouse.hasEventListener(MouseEvent.MOUSE_UP)){
            mouse.dispatchEvent(new Event(mouse,MouseEvent.MOUSE_UP));
        }
    });
    
    canvas.addEventListener('mousewheel', function (event) {
        mouse._wheelDirection = event.detail < 0 ? 1 : (event.wheelDelta > 0) ? 1 : -1;
        if(mouse.hasEventListener(MouseEvent.MOUSE_WHEEL)){
            mouse.dispatchEvent(new Event(mouse,MouseEvent.MOUSE_WHEEL,event));
        }
    });

    canvas.addEventListener('mouseout',function(){
        mouse._leave = true;
        if(mouse.hasEventListener(MouseEvent.MOUSE_OUT)){
            mouse.dispatchEvent(new Event(mouse,MouseEvent.MOUSE_OUT));
        }
    });

    canvas.addEventListener('mouseenter',function(){
        mouse._enter = true;
        if(mouse.hasEventListener(MouseEvent.MOUSE_ENTER)){
            mouse.dispatchEvent(new Event(mouse,MouseEvent.MOUSE_ENTER));
        }
    });

    canvas.addEventListener('keypress',function(e){
        keyboard._up   = false;
        keyboard._down = true;
        keyboard._altKey = e.altKey;
        keyboard._ctrlKey = e.ctrlKey;
        keyboard._shiftKey = e.shiftKey;

        keyboard._keyCodePrev = keyboard._keyCode;
        keyboard._keyCode = e.keyCode ? e.keyCode : e.which;

        keyboard._keyStrPrev = keyboard._keyStr;
        keyboard._keyStr = String.fromCharCode(keyboard._keyCode);

        keyboard._timestampLast = keyboard._timestamp;
        keyboard._timestamp = e.timeStamp;

        if(keyboard._timestamp - keyboard._timestampLast < KEY_PRESS_THRESHOLD) {
            if(keyboard.hasEventListener(KeyEvent.KEY_PRESS)) {
                keyboard.dispatchEvent(new Event(keyboard, KeyEvent.KEY_PRESS));
            }
            return;
        }

        if(keyboard.hasEventListener(KeyEvent.KEY_DOWN)){
            keyboard.dispatchEvent(new Event(keyboard,KeyEvent.KEY_DOWN));
        }
    });

    canvas.addEventListener('keyup',function(e){
        keyboard._down = false;
        keyboard._up   = true;
        keyboard._altKey = keyboard._ctrKey = keyboard._shiftKey = false;

        if(keyboard.hasEventListener(KeyEvent.KEY_DOWN)){
            keyboard.dispatchEvent(new Event(keyboard,KeyEvent.KEY_UP));
        }
    });

    function onFullscreenStateChange(){
        self.__fullscreen = !!(window.fullScreen || document.webkitIsFullScreen);
        self.onFullscreenChange();
    }

    document.addEventListener('webkitfullscreenchange',onFullscreenStateChange);
    document.addEventListener('mozfullscreenchange',   onFullscreenStateChange);
    document.addEventListener('fullscreenchange',      onFullscreenStateChange);

    //
    //
    //

    this.setup(resources);

    Time.__start = performance.now();

    if(this.__tickLoop){
        var numFixedTicks, fixedStep, stepDuration;

        numFixedTicks = 0;
        fixedStep     = Time.__fixedStep;
        stepDuration  = 1000 / fixedStep;
        fixedStep     = 1.0 / fixedStep;

        this.__tick = this.__hasFixedUpdate ?
            function(timestamp){
                timestamp = timestamp || Time.__start;

                Time.__now            = timestamp;
                Time.__elapsed        = Math.max(0,timestamp - Time.__start);
                Time.__secondsElapsed = Time.__elapsed * 0.001;

                Time.__frame = timestamp - Time.__previous;
                Time.__delta = Time.__frame * 0.001;

                self.__tickAccumulator += Time.__delta;

                numFixedTicks = 0;
                while(self.__tickAccumulator >= fixedStep){
                    self.fixedUpdate(fixedStep);
                    self.__tickAccumulator -= fixedStep;
                    numFixedTicks++;
                    if(numFixedTicks >= MAX_FRAME_SKIP){
                        self.__tickAccumulator = 0;
                        break;
                    }
                }

                self.update(Time.__delta,self.__tickAccumulator / stepDuration);

                mouse._downLast = mouse._down;
                mouse._enter = false;
                mouse._leave = false;

                Time.__previous = timestamp;
                self.__framenum++;

                self.__tickRequestId = requestAnimationFrame(self.__tick);
            } :
            function(timestamp){
                timestamp = timestamp || Time.__start;

                Time.__now            = timestamp;
                Time.__elapsed        = Math.max(0,timestamp - Time.__start);
                Time.__secondsElapsed = Time.__elapsed * 0.001;

                Time.__frame = timestamp - Time.__previous;
                Time.__delta = Time.__frame * 0.001;

                self.update(Time.__delta);

                mouse._downLast = mouse._down;
                mouse._enter = false;
                mouse._leave = false;

                Time.__previous = timestamp;
                self.__framenum++;

                self.__tickRequestId = requestAnimationFrame(self.__tick);
            };
        this.__tick();

    } else {
        this.fixedUpdate(0,0);
        this.update(0);
    }
}

App.prototype = Object.create(EventDispatcher.prototype);
App.prototype.constructor = App;

/**
 * Get an instance of the current program.
 * @returns {App}
 */
App.getInstance = function () {
    return App.__instance;
};

/**
 * Setup
 * @virtual
 */
App.prototype.setup = function () {
    throw new Error(Error_.APP_NO_SETUP);
};

/**
 * Update
 * @param dt
 * @virtual
 */
App.prototype.update = function (offset) {
    throw new Error(Error_.APP_NO_UPDATE);
};

/**
 * Fixed update
 * @param step
 */

App.prototype.fixedUpdate = function(step){};

/**
 * Stops the update loop.
 * @returns {number} - timestamp of stop call
 */

App.prototype.stopUpdate = function(){
    if(!this.__tickLoop || !this.__tickRequestId){
        return;
    }
    window.cancelAnimationFrame(this.__tickRequestId);
    this.__tickRequestId = null;
    Time.__stopped = true;
    this.dispatchEvent(new Event(this,TimeEvent.STOP,{timestamp:performance.now()}));
};

/**
 * Restarts the update loop.
 */

App.prototype.restartUpdate = function(){
    if(!this.__tickLoop || this.__tickRequestId){
        return;
    }
    this.__numFramesElapsed = 0;
    Time.__reset();
    Time.__start = Time.__previous = performance.now();
    Time.__stopped = false;
    this.__tickAccumulator = 0;
    this.__tick();
    this.dispatchEvent(new Event(this,TimeEvent.RESTART));
};

/**
 * Callback if webgl is not available.
 * @virtual
 */
App.prototype.onWebGLContextNotAvailable = function(){
    console.log('FOAM: WebGLContext not available.');
};

/**
 * Returns the underlying canvas
 * @returns {HTMLCanvasElement}
 */

App.prototype.getCanvas = function(){
    return this.__canvas;
};

/*--------------------------------------------------------------------------------------------*/
//  window
/*--------------------------------------------------------------------------------------------*/

/**
 * Set the window size.
 * @param {Number} width - The width
 * @param {Number} height - The height
 * @param {Number} [scale] - The ratio of pixels per window pixel (default: 1:1)
 */

App.prototype.setWindowSize = function (width, height, scale) {
    var window_,windowScale, windowBounds;

    window_     = this.__window;
    windowScale = window_._scale = scale || window_.getScale();

    width  *= windowScale;
    height *= windowScale;

    if (width  == window_.getWidth() && height == window_.getHeight()){
        return;
    }

    windowBounds = window_._bounds;
    windowBounds.setSizef(width,height);

    window_._aspectRatio = windowBounds.getAspectRatio();
    this._updateCanvasSize();
};

App.prototype._updateCanvasSize = function(){
    var window_,windowWidth, windowHeight, windowScale;

    window_      = this.__window;
    windowWidth  = window_.getWidth();
    windowHeight = window_.getHeight();
    windowScale  = window_.getScale();

    var canvas = this.__canvas;
        canvas.style.width  = windowWidth / windowScale + 'px';
        canvas.style.height = windowHeight / windowScale + 'px';
        canvas.width  = windowWidth;
        canvas.height = windowHeight;
};

/**
 * Return the current window's bounds.
 * @param {Rect} [out] - Out rect
 * @returns {Rect}
 */

App.prototype.getWindowBounds = function(out){
    return this.__window.getBounds(out);
};

/**
 * Return the window´s current size.
 * @param {Vec2} [out] - Out size
 * @returns {Vec2}
 */

App.prototype.getWindowSize = function (out) {
    return this.__window.getSize(out);
};

/**
 * Return the window´s current width.
 * @returns {Number}
 */

App.prototype.getWindowWidth = function () {
    return this.__window.getWidth();
};

/**
 * Return the window´s current height.
 * @returns {Number}
 */

App.prototype.getWindowHeight = function () {
    return this.__window.getHeight();
};

/**
 * Return the current window aspect ratio.
 * @returns {number}
 */

App.prototype.getWindowAspectRatio = function () {
    return this.__window.getAspectRatio();
};

/**
 * Return the current window scale.
 * @returns {number}
 */

App.prototype.getWindowScale = function(){
    return this.__window.getScale();
};

/**
 * Callback on window resize.
 */

App.prototype.onWindowResize = function () {};


/*--------------------------------------------------------------------------------------------*/
//  framerate / time
/*--------------------------------------------------------------------------------------------*/

/**
 * Set the target framerate.
 * @param {Number} fps - The framerate
 */

App.prototype.setFPS = function (fps) {
    this.__targetFPS = fps;
};

/**
 * Return the current target framerate
 * @returns {Number}
 */

App.prototype.getFPS = function () {
    return this.__targetFPS;
};

/**
 * Sets
 * @param step
 */

App.prototype.setFixedStep = function(step){
    Time.__fixedStep = step;
};

/**
 * Return the number of frames elapsed since the program started.
 * @returns {Number}
 */

App.prototype.getFramesElapsed = function () {
    return this.__framenum;
};

/**
 * Returns the time elapsed since application start in milliseconds.
 * @returns {number}
 */

App.prototype.getTimeElapsed = function(){
    return Time.__elapsed;
};

/**
 * Return the number of seconds elapsed since the program started.
 * @returns {Number}
 */

App.prototype.getSecondsElapsed = function () {
    return Time.__secondsElapsed;
};

/**
 * Returns the current time in milliseconds.
 * @returns {number}
 */

App.prototype.getTimeNow = function () {
    return Time.__now;
};

/**
 * Returns the applications start time in milliseconds.
 * @returns {number}
 */

App.prototype.getTimeStart = function () {
    return Time.__start;
};

/**
 * Returns the delta time in milliseconds.
 * @returns {number}
 */

App.prototype.getTimeDelta = function () {
    return Time.__delta;
};

/**
 * Set if the program should continously call update.
 * @param {Boolean} loop
 */

App.prototype.loop = function(loop){
    this.__tickLoop = loop;
};

/**
 * Sets the application to fullscreen mode.
 * @param {Boolean}[canvasOnly] - If true only the apps underlying canvas will switch to fullscreen, else the body element will be used.
 */

App.prototype.enterFullscreen = function(canvasOnly){
    var window_ = this.__window;
    if(window_.isFullscreen()){
        return;
    }
    var element = canvasOnly ? this.__canvas : document.body;
    (element.requestFullscreen ||
     element.mozRequestFullScreen ||
     element.webkitRequestFullscreen ||
     element.msRequestFullscreen).call(element);
    window_._fullscreen = true;
};

/**
 * Exits fullscreen mode.
 */

App.prototype.exitFullscreen = function(){
    var window_ = this.__window;
    if(!window_.isFullscreen()){
        return;
    }
    (document.exitFullscreen ||
     document.mozCancelFullScreen ||
     document.webkitExitFullscreen).call(document);
    window_._fullscreen = false;
};

/**
 * Toggle fullscreen mode.
 */

App.prototype.toggleFullscreen = function(){
    if(this.__window.isFullscreen()){
        this.exitFullscreen();
    } else {
        this.enterFullscreen();
    }
};

/**
 * Returns true if the application is in fullscreen mode.
 * @returns {boolean}
 */

App.prototype.isFullscreen = function(){
    return this.__fullscreen;
};

/**
 * Callback on fullscreen state change.
 */

App.prototype.onFullscreenChange = function(){};

/*--------------------------------------------------------------------------------------------*/
//  lazy init
/*--------------------------------------------------------------------------------------------*/

/**
 * @param obj
 * @param [resource]
 * @param [canvas]
 * @returns {FoamApp}
 * @private
 */

App._newObj = function(obj,resource,canvas){
    function FoamApp(){
        App.call(this,canvas,resource);
    }

    FoamApp.prototype = Object.create(App.prototype);
    FoamApp.prototype.__hasFixedUpdate = !!obj.fixedUpdate;

    for( var p in obj ){
        if(obj.hasOwnProperty(p)){
            FoamApp.prototype[p] = obj[p];
        }
    }
    return new FoamApp();
};

/**
 * Factory method. Inititates a program. Called on window load.
 * @param {Object} obj - A program object {setup,update}
 */

App.newOnLoad = function(obj){
    window.addEventListener('load',function(){
        App._newObj(obj);
    });
};

/**
 * Factory method. Initiates a program providing loaded resources.
 * @param {Object|Object[]} resource - The resource / resource-bundle {path, type} to be loaded
 * @param {Object} obj - A program object {setup,update}
 * @param {Function} [callbackError] - Callback if an error occured
 * @param {Function) [callbackProcess] - Callback on load
 * @param {bool} [strict=true] - Abort if at least one resource could not be loaded
 */

App.newOnResource = function(resource, obj, callbackError, callbackProcess, strict){
    Resource.load(resource,function(resource){
        App._newObj(obj,resource);
    }, callbackError, callbackProcess, strict);
};

/**
 * Factory method. Initiates a program providing loaded resources. Called on window load.
 * @param {Object|Object[]} resource - The resource / resource-bundle {path, type} to be loaded
 * @param {Object} obj - A program object {setup,update}
 * @param {Function} [callbackError] - Callback if an error occured
 * @param {Function) [callbackProcess] - Callback on load
 * @param {Boolean} [strict=true] - Abort if at least one resource could not be loaded
 */

App.newOnLoadWithResource = function(resource, obj, callbackError, callbackProcess, strict){
    window.addEventListener('load',function(){
        Resource.load(resource, function(resource){
            App._newObj(obj,resource);
        }, callbackError, callbackProcess, strict);
    });
};

/**
 * Factory method. Initiates a program.
 * @param {Object|Object[]} resource - The resource / resource-bundle {path, type} to be loaded
 * @param {Object} obj - A program object {setup,update}
 * @param {HTMLCanvasElement} [canvas] - Target canvas
 */

App.new = function(resource, obj, canvas){
    return App._newObj(obj,resource,canvas);
};


var Program = require('../gl/Program'),
    Vbo     = require('../gl/Vbo');

App.dispose = function(){
    Window_.dispose();
    Mouse.dispose();
    Keyboard.dispose();

    Program.dispose();
    glDraw.dispose();
    Vbo.dispose();
    gl.dispose();

    App.__instance.removeAllEventListeners();
    App.__instance = null;
};

module.exports = App;
