var plask  = require('plask');

var Resource = require('./Resource');
var Screen   = require('./Screen');
var Id       = require('./Id');
var pgl      = require('../gl/pgl');

var current = null;

function Window(){
    this._id = Id.get();
    //whatever this will be
}

Window.prototype.init = function(){};
Window.prototype.draw = function(){};

Window.prototype.getSize = function(out){
    out = out || new Array(2);
    out[0] = this.width;
    out[1] = this.height;
    return out;
};

Window.prototype.getWidth = function(){
    return this.width;
};

Window.prototype.getHeight = function(){
    return this.height;
};

Window.prototype.getAspectRatio = function(){
    return this.getWidth() / this.getHeight();
};

Window.prototype.getSize = function(out){
    out = out || new Array(2);
    out[0] = this.getWidth();
    out[1] = this.getHeight();
    return out;
};

Window.prototype.getBounds = function(out){
    out = out || new Array(4);
    out[0] = out[1] = 0;
    out[2] = this.getWidth();
    out[3] = this.getHeight();
    return out;
};

Window.prototype.getId = function(){
    return this._id;
};

Window.prototype.getContext = function(){
    return this.context;
};

Window.create = function(obj, resources, callbackError, callbackProcess, strict){
    Resource.load(resources, function(resources){
            var window = new Window();
            for (var p in obj) {
                window[p] = obj[p];
            }

            Screen._windows[window.getId()] = window;
            current = window;

            if (obj.settings.type == '3d') {
                //sure...
                var init = window.init;
                window.init = function() {
                    this.framerate(60);

                    this._gl = this.gl;
                    delete this.gl;

                    pgl.init(this);
                    init(resources);
                };

                var draw = window.draw;
                window.draw = function () {
                    current = window;
                    pgl.reset(this);
                    //this is were plask simplewindow should be unrolled
                    draw.call(this);
                };

            } else {
                //other context
            }

            plask.simpleWindow(window);
        }, callbackError, callbackProcess, strict
    );
};

Window.getCurrent = function(){
    return current;
};

Window.getCurrentWindowContext = function(){
    return this.getCurrent().getContext();
};

module.exports = Window;
