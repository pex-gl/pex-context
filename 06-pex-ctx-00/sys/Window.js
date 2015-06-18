var plask     = require('plask');
var Context3d = require('../p3d/Context');

var current = null;

function Window(){
    this._ctx = null;
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

Window.prototype.getContext = function(){
    return this._ctx;
};

Window.create = function(obj){
    var window = new Window();
    for (var p in obj) {
        window[p] = obj[p];
    }

    current = window;

    if (obj.settings.type == '3d') {
        //sure...
        var init = window.init;
        window.init = function() {
            this.framerate(60);
            this._ctx = new Context3d(this.gl);
            delete this.gl;
            init.call(this);
        };
        var draw = window.draw;
        window.draw = function () {
            current = window;
            //this is were plask simplewindow should be unrolled
            draw.call(this);
        };
    }
    else {
        //other context
    }
    plask.simpleWindow(window);
};

Window.getCurrent = function(){
    return current;
};

module.exports = Window;
