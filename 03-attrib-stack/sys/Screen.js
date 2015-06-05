var plask    = require('plask');
var Platform = {isBrowser : false};

var Screen = {};

Screen._size    = [0,0];
Screen._windows = {};

Screen.getSize = function(out){
    var size = this._size;
    if(Platform.isBrowser){
        size[0] = window.innerWidth;
        size[1] = window.innerHeight;
    } else {
        var screenInfo = plask.Window.screensInfo()[0];
        size[0] = screenInfo.width;
        size[1] = screenInfo.height;
    }
    out = out || new Array(2);
    out[0] = size[0];
    out[1] = size[1];
    return out;
};

Screen.getWindows = function(){
    return this._windows;
};

Screen.getWindow = function(id){
    return this._windows[id];
};

module.exports = Screen;