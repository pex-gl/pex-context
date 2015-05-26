var Platform = require('./Platform');
var BrowserWindow = require('./BrowserWindow');
var Time = require('./Time');
var Log = require('./Log');
var merge = require('merge');
var plask = require('plask');

var DefaultSettings = {
  'width': 1280,
  'height': 720,
  'type': '3d',
  'vsync': true,
  'multisample': true,
  'fullscreen': false,
  'center': true,
  'highdpi': 1,
  'stencil': false,
  'premultipliedAlpha': true,
  'preserveDrawingBuffer': false,
  'screen': 0
};

var screens;

if (Platform.isPlask) {
  screens = plask.Window.screensInfo();
}
else if (Platform.isBrowser) {
  screens = [ { width: window.innerWidth, height: window.innerHeight, highdpi: window.devicePixelRatio } ];
}
else {
  screens = [];
}

var Window = {
  currentWindow: null,
  getScreens: function() {
    return screens;
  },
  getScreenWidth: function(id) {
    id = (typeof(id) === 'undefined') ? 0 : id;
    return screens[id].width;
  },
  getScreenHeight: function(id) {
    id = (typeof(id) === 'undefined') ? 0 : id;
    return screens[id].height;
  },
  getScreenDPI: function(id) {
    id = (typeof(id) === 'undefined') ? 0 : id;
    return screens[id].highdpi;
  },
  create: function(obj) {
    obj.settings = obj.settings || {};
    obj.settings = merge(DefaultSettings, obj.settings);

    if (obj.settings.fullscreen) {

      if (obj.settings.screen !== undefined) {
        var screen = screens[obj.settings.screen];
        if (screen) {
          obj.settings.position = { x: 0, y: screen.height };
          obj.settings.width = screen.width * obj.settings.highdpi;
          obj.settings.height = screen.height * obj.settings.highdpi;
        }
      }
    }

    obj.__init = obj.init;
    obj.init = function() {
      Window.currentWindow = this;
      obj.framerate(60);
      if (obj.__init) {
        obj.__init();
      }
    }

    obj.__draw = obj.draw;
    obj.draw = function() {
      Window.currentWindow = this;
      //FIXME: this will cause Time update n times, where n is number of Window instances opened
      Time.update();
      if (obj.__draw) {
        obj.__draw();
      }
    }

    if (Platform.isPlask) {
      plask.simpleWindow(obj);
    }
    else if (Platform.isBrowser || Platform.isEjecta) {
      BrowserWindow.simpleWindow(obj);
    }
  }
};

module.exports = Window;
