var glu = require('pex-glu');
var geom = require('pex-geom');
var sys = require('pex-sys');
var color = require('pex-color');
var Platform = sys.Platform;
var GUIControl = require('./GUIControl');
var SkiaRenderer = require('./SkiaRenderer');
var HTMLCanvasRenderer = require('./HTMLCanvasRenderer');
var Context = glu.Context;
var ScreenImage = glu.ScreenImage;
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Rect = geom.Rect;
var Spline1D = geom.Spline1D;
var Spline2D = geom.Spline2D;
var IO = sys.IO;
var Color = color.Color;

var VK_BACKSPACE = Platform.isPlask ? 51 : 8;

//`window` - parent window
//`x` - gui x position
//`y` - gui y position
//`scale` - slider scale, usefull for touch
//do not mistake that for highdpi as his is handled automatically based on window.settings.highdpi
function GUI(window, x, y, scale) {
  this.gl = Context.currentContext;
  this.window = window;
  this.x = x === undefined ? 0 : x;
  this.y = y === undefined ? 0 : y;
  this.mousePos = Vec2.create();
  this.scale = scale || 1;
  this.highdpi = window.settings.highdpi || 1;
  if (Platform.isPlask) {
    this.renderer = new SkiaRenderer(window.width, window.height, this.highdpi);
  }
  else if (Platform.isBrowser) {
    this.renderer = new HTMLCanvasRenderer(window.width, window.height, this.highdpi);
  }
  this.screenBounds = new Rect(this.x, this.y, window.width, window.height);
  this.screenImage = this.gl ? new ScreenImage(this.renderer.getTexture(), this.x, this.y, window.width, window.height, window.width, window.height) : null;
  this.items = [];
  this.bindEventListeners(window);
  this.enabled = true;
}

GUI.prototype.bindEventListeners = function (window) {
  var self = this;
  window.on('leftMouseDown', function (e) {
    self.onMouseDown(e);
  });
  window.on('mouseDragged', function (e) {
    self.onMouseDrag(e);
  });
  window.on('leftMouseUp', function (e) {
    self.onMouseUp(e);
  });
  window.on('keyDown', function (e) {
    self.onKeyDown(e);
  });
};

GUI.prototype.onMouseDown = function (e) {
  if (!this.enabled) return;

  this.items.forEach(function(item) {
    if (item.type == 'text') {
      if (item.focus) {
        item.focus = false;
        item.dirty = true;
      }
    }
  })

  this.activeControl = null;
  this.mousePos.set(e.x / this.highdpi - this.x, e.y / this.highdpi - this.y);
  for (var i = 0; i < this.items.length; i++) {
    if (this.items[i].activeArea.contains(this.mousePos)) {
      this.activeControl = this.items[i];
      this.activeControl.active = true;
      this.activeControl.dirty = true;
      if (this.activeControl.type == 'button') {
        this.activeControl.contextObject[this.activeControl.methodName]();
      }
      else if (this.activeControl.type == 'toggle') {
        this.activeControl.contextObject[this.activeControl.attributeName] = !this.activeControl.contextObject[this.activeControl.attributeName];
        if (this.activeControl.onchange) {
          this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
        }
      }
      else if (this.activeControl.type == 'radiolist') {
        var hitY = this.mousePos.y - this.activeControl.activeArea.y;
        var hitItemIndex = Math.floor(this.activeControl.items.length * hitY / this.activeControl.activeArea.height);
        if (hitItemIndex < 0)
          continue;
        if (hitItemIndex >= this.activeControl.items.length)
          continue;
        this.activeControl.contextObject[this.activeControl.attributeName] = this.activeControl.items[hitItemIndex].value;
        if (this.activeControl.onchange) {
          this.activeControl.onchange(this.activeControl.items[hitItemIndex].value);
        }
      }
      else if (this.activeControl.type == 'texturelist') {
        var clickedItem = null;
        this.activeControl.items.forEach(function(item) {
          if (item.activeArea.contains(this.mousePos)) {
            clickedItem = item;
          }
        }.bind(this))

        if (!clickedItem)
          continue;

        this.activeControl.contextObject[this.activeControl.attributeName] = clickedItem.value;
        if (this.activeControl.onchange) {
          this.activeControl.onchange(clickedItem.value);
        }
      }
      else if (this.activeControl.type == 'color') {
        var aa = this.activeControl.activeArea;
        var numSliders = this.activeControl.options.alpha ? 4 : 3;
        var slidersHeight = aa.height;
        if (this.activeControl.options.palette) {
          var iw = this.activeControl.options.paletteImage.width;
          var ih = this.activeControl.options.paletteImage.height;
          var y = e.y / this.highdpi - aa.y;
          slidersHeight = aa.height - aa.width * ih / iw;
          var imageDisplayHeight = aa.width * ih / iw;
          var imageStartY = aa.height - imageDisplayHeight;

          if (y > imageStartY) {
            var u = (e.x /this.highdpi - aa.x) / aa.width;
            var v = (y - imageStartY) / imageDisplayHeight;
            var x = Math.floor(iw * u);
            var y = Math.floor(ih * v);
            var color = this.renderer.getImageColor(this.activeControl.options.paletteImage, x, y);
            this.activeControl.dirty = true;
            this.activeControl.contextObject[this.activeControl.attributeName].r = color.r;
            this.activeControl.contextObject[this.activeControl.attributeName].g = color.g;
            this.activeControl.contextObject[this.activeControl.attributeName].b = color.b;
            if (this.activeControl.onchange) {
              this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
            }
            continue;
          }
        }
      }
      else if (this.activeControl.type == 'text') {
        this.activeControl.focus = true;
      }
      e.handled = true;
      this.onMouseDrag(e);
      break;
    }
  }
};

GUI.prototype.onMouseDrag = function (e) {
  if (!this.enabled) return;

  if (this.activeControl) {
    var aa = this.activeControl.activeArea;
    if (this.activeControl.type == 'slider') {
      var val = (e.x / this.highdpi - aa.x) / aa.width;
      val = Math.max(0, Math.min(val, 1));
      this.activeControl.setNormalizedValue(val);
      if (this.activeControl.onchange) {
        this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
      }
      this.activeControl.dirty = true;
    }
    else if (this.activeControl.type == 'multislider') {
      var val = (e.x / this.highdpi - aa.x) / aa.width;
      val = Math.max(0, Math.min(val, 1));
      var idx = Math.floor(this.activeControl.getValue().length * (e.y / this.highdpi - aa.y) / aa.height);
      if (!isNaN(this.activeControl.clickedSlider)) {
        idx = this.activeControl.clickedSlider;
      }
      else {
        this.activeControl.clickedSlider = idx;
      }
      this.activeControl.setNormalizedValue(val, idx);
      if (this.activeControl.onchange) {
        this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
      }
      this.activeControl.dirty = true;
    }
    else if (this.activeControl.type == 'vec2') {
      var numSliders = 2;
      var val = (e.x / this.highdpi - aa.x) / aa.width;
      val = Math.max(0, Math.min(val, 1));
      var idx = Math.floor(numSliders * (e.y / this.highdpi - aa.y) / aa.height);
      if (!isNaN(this.activeControl.clickedSlider)) {
        idx = this.activeControl.clickedSlider;
      }
      else {
        this.activeControl.clickedSlider = idx;
      }
      this.activeControl.setNormalizedValue(val, idx);
      if (this.activeControl.onchange) {
        this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
      }
      this.activeControl.dirty = true;
    }
    else if (this.activeControl.type == 'vec3') {
      var numSliders = 3;
      var val = (e.x / this.highdpi - aa.x) / aa.width;
      val = Math.max(0, Math.min(val, 1));
      var idx = Math.floor(numSliders * (e.y / this.highdpi - aa.y) / aa.height);
      if (!isNaN(this.activeControl.clickedSlider)) {
        idx = this.activeControl.clickedSlider;
      }
      else {
        this.activeControl.clickedSlider = idx;
      }
      this.activeControl.setNormalizedValue(val, idx);
      if (this.activeControl.onchange) {
        this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
      }
      this.activeControl.dirty = true;
    }
    else if (this.activeControl.type == 'color') {
      var numSliders = this.activeControl.options.alpha ? 4 : 3;
      var slidersHeight = aa.height;
      if (this.activeControl.options.palette) {
        var iw = this.activeControl.options.paletteImage.width;
        var ih = this.activeControl.options.paletteImage.height;
        var y = e.y / this.highdpi - aa.y;
        slidersHeight = aa.height - aa.width * ih / iw;
        var imageDisplayHeight = aa.width * ih / iw;
        var imageStartY = aa.height - imageDisplayHeight;
        if (y > imageStartY && isNaN(this.activeControl.clickedSlider)) {
            var u = (e.x /this.highdpi - aa.x) / aa.width;
            var v = (y - imageStartY) / imageDisplayHeight;
            var x = Math.floor(iw * u);
            var y = Math.floor(ih * v);
            var color = this.renderer.getImageColor(this.activeControl.options.paletteImage, x, y);
            this.activeControl.dirty = true;
            this.activeControl.contextObject[this.activeControl.attributeName].r = color.r;
            this.activeControl.contextObject[this.activeControl.attributeName].g = color.g;
            this.activeControl.contextObject[this.activeControl.attributeName].b = color.b;
            if (this.activeControl.onchange) {
              this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
            }
            e.handled = true;
            return;
          }
      }

      var val = (e.x / this.highdpi - aa.x) / aa.width;
      val = Math.max(0, Math.min(val, 1));
      var idx = Math.floor(numSliders * (e.y / this.highdpi - aa.y) / slidersHeight);
      if (!isNaN(this.activeControl.clickedSlider)) {
        idx = this.activeControl.clickedSlider;
      }
      else {
        this.activeControl.clickedSlider = idx;
      }
      this.activeControl.setNormalizedValue(val, idx);
      if (this.activeControl.onchange) {
        this.activeControl.onchange(this.activeControl.contextObject[this.activeControl.attributeName]);
      }
      this.activeControl.dirty = true;
    }
    e.handled = true;
  }
};

GUI.prototype.onMouseUp = function (e) {
  if (!this.enabled) return;

  if (this.activeControl) {
    this.activeControl.active = false;
    this.activeControl.dirty = true;
    this.activeControl.clickedSlider = undefined;
    this.activeControl = null;
  }
};

GUI.prototype.onKeyDown = function (e) {
  if (e.handled) return;
  var focusedItem = this.items.filter(function(item) { return item.type == 'text' && item.focus})[0];
  if (focusedItem) {
    e.handled = true;
    var c = e.str.charCodeAt(0);
    if (c >= 32 && c <= 126) {
      focusedItem.contextObject[focusedItem.attributeName] += e.str;
      focusedItem.dirty = true;
      if (focusedItem.onchange) {
        focusedItem.onchange(focusedItem.contextObject[focusedItem.attributeName]);
      }
    }
    else {
      switch(e.keyCode) {
        case VK_BACKSPACE:
          var str = focusedItem.contextObject[focusedItem.attributeName];
          focusedItem.contextObject[focusedItem.attributeName] = str.substr(0, Math.max(0, str.length-1));
          focusedItem.dirty = true;
          if (focusedItem.onchange) {
            focusedItem.onchange(focusedItem.contextObject[focusedItem.attributeName]);
          }
          break;
      }
    }
    e.handled = true;
  }
}

GUI.prototype.addHeader = function (title) {
  var ctrl = new GUIControl({
    type: 'header',
    title: title,
    dirty: true,
    activeArea: new Rect(0, 0, 0, 0),
    setTitle: function (title) {
      this.title = title;
      this.dirty = true;
    }
  });
  this.items.push(ctrl);
  return ctrl;
};

GUI.prototype.addSeparator = function (title) {
  var ctrl = new GUIControl({
    type: 'separator',
    dirty: true,
    activeArea: new Rect(0, 0, 0, 0)
  });
  this.items.push(ctrl);
  return ctrl;
};

GUI.prototype.addLabel = function (title) {
  var ctrl = new GUIControl({
    type: 'label',
    title: title,
    dirty: true,
    activeArea: new Rect(0, 0, 0, 0),
    setTitle: function (title) {
      this.title = title;
      this.dirty = true;
    }
  });
  this.items.push(ctrl);
  return ctrl;
};

GUI.prototype.addParam = function (title, contextObject, attributeName, options, onchange) {
  options = options || {};
  if (typeof(options.min) == 'undefined') options.min = 0;
  if (typeof(options.max) == 'undefined') options.max = 1;
  if (contextObject[attributeName] === false || contextObject[attributeName] === true) {
    var ctrl = new GUIControl({
      type: 'toggle',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: new Rect(0, 0, 0, 0),
      options: options,
      onchange: onchange,
      dirty: true
    });
    this.items.push(ctrl);
    return ctrl;
  }
  else if (!isNaN(contextObject[attributeName])) {
    var ctrl = new GUIControl({
      type: 'slider',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: new Rect(0, 0, 0, 0),
      options: options,
      onchange: onchange,
      dirty: true
    });
    this.items.push(ctrl);
    return ctrl;
  }
  else if (contextObject[attributeName] instanceof Array) {
    var ctrl = new GUIControl({
      type: 'multislider',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: new Rect(0, 0, 0, 0),
      options: options,
      onchange: onchange,
      dirty: true
    });
    this.items.push(ctrl);
    return ctrl;
  }
  else if (contextObject[attributeName] instanceof Vec2) {
    var ctrl = new GUIControl({
      type: 'vec2',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: new Rect(0, 0, 0, 0),
      options: options,
      onchange: onchange,
      dirty: true
    });
    this.items.push(ctrl);
    return ctrl;
  }
  else if (contextObject[attributeName] instanceof Vec3) {
    var ctrl = new GUIControl({
      type: 'vec3',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: new Rect(0, 0, 0, 0),
      options: options,
      onchange: onchange,
      dirty: true
    });
    this.items.push(ctrl);
    return ctrl;
  }
  else if (typeof contextObject[attributeName] == 'string') {
    var ctrl = new GUIControl({
      type: 'text',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: new Rect(0, 0, 0, 0),
      options: options,
      onchange: onchange,
      dirty: true
    });
    this.items.push(ctrl);
    return ctrl;
  }
  else if (contextObject[attributeName] instanceof Color) {
    var ctrl = new GUIControl({
      type: 'color',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: new Rect(0, 0, 0, 0),
      options: options,
      onchange: onchange,
      dirty: true
    });
    this.items.push(ctrl);
    return ctrl;
  }
  else if (contextObject[attributeName] instanceof Spline1D) {
    var ctrl = new GUIControl({
      type: 'spline1D',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: new Rect(0, 0, 0, 0),
      options: options,
      onchange: onchange,
      dirty: true
    });
    this.items.push(ctrl);
    return ctrl;
  }
  else if (contextObject[attributeName] instanceof Spline2D) {
    var ctrl = new GUIControl({
      type: 'spline2D',
      title: title,
      contextObject: contextObject,
      attributeName: attributeName,
      activeArea: new Rect(0, 0, 0, 0),
      options: options,
      onchange: onchange,
      dirty: true
    });
    this.items.push(ctrl);
    return ctrl;
  }
};

GUI.prototype.addButton = function (title, contextObject, methodName, options) {
  var ctrl = new GUIControl({
    type: 'button',
    title: title,
    contextObject: contextObject,
    methodName: methodName,
    activeArea: new Rect(0, 0, 0, 0),
    dirty: true,
    options: options || {}
  });
  this.items.push(ctrl);
  return ctrl;
};

GUI.prototype.addRadioList = function (title, contextObject, attributeName, items, onchange) {
  var ctrl = new GUIControl({
    type: 'radiolist',
    title: title,
    contextObject: contextObject,
    attributeName: attributeName,
    activeArea: new Rect(0, 0, 0, 0),
    items: items,
    onchange: onchange,
    dirty: true
  });
  this.items.push(ctrl);
  return ctrl;
};

GUI.prototype.addTextureList = function (title, contextObject, attributeName, items, itemsPerRow, onchange) {
  var ctrl = new GUIControl({
    type: 'texturelist',
    title: title,
    contextObject: contextObject,
    attributeName: attributeName,
    activeArea: new Rect(0, 0, 0, 0),
    items: items,
    itemsPerRow: itemsPerRow || 4,
    onchange: onchange,
    dirty: true
  });
  this.items.push(ctrl);
  return ctrl;
};

GUI.prototype.addTexture2D = function (title, texture) {
  var ctrl = new GUIControl({
    type: 'texture2D',
    title: title,
    texture: texture,
    activeArea: new Rect(0, 0, 0, 0),
    dirty: true
  });
  this.items.push(ctrl);
  return ctrl;
};

GUI.prototype.dispose = function () {
};

GUI.prototype.draw = function () {
  if (!this.enabled) {
    return;
  }

  if (this.items.length === 0) {
    return;
  }
  this.renderer.draw(this.items, this.scale);

  if (this.gl) {
    glu.enableDepthReadAndWrite(false, false);

    var gl = Context.currentContext;
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.screenImage.draw();
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    this.drawTextures();
  }
  else if (this.window.canvas && this.window.paint) {
    var guiCanvas = this.renderer.getCanvas();
    var guiPaint = this.renderer.getCanvasPaint();
    this.window.canvas.drawCanvas(this.guiPaint, guiCanvas, 0, 0, guiCanvas.width, guiCanvas.height);
  }
};

GUI.prototype.drawTextures = function () {
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    var scale = this.scale * this.highdpi;
    if (item.type == 'texture2D') {
      var bounds = new Rect(item.activeArea.x * scale, item.activeArea.y * scale, item.activeArea.width * scale, item.activeArea.height * scale);
      this.screenImage.setBounds(bounds);
      this.screenImage.setImage(item.texture);
      this.screenImage.draw();
    }
    if (item.type == 'texturelist') {
      item.items.forEach(function(textureItem) {
        var bounds = new Rect(textureItem.activeArea.x * scale, textureItem.activeArea.y * scale, textureItem.activeArea.width * scale, textureItem.activeArea.height * scale);
        this.screenImage.setBounds(bounds);
        this.screenImage.setImage(textureItem.texture);
        this.screenImage.draw();
      }.bind(this));
    }
  }
  this.screenImage.setBounds(this.screenBounds);
  this.screenImage.setImage(this.renderer.getTexture());
};

GUI.prototype.serialize = function () {
  var data = {};
  this.items.forEach(function (item, i) {
    data[item.title] = item.getSerializedValue();
  });
  return data;
};

GUI.prototype.deserialize = function (data) {
  this.items.forEach(function (item, i) {
    if (data[item.title] !== undefined) {
      item.setSerializedValue(data[item.title]);
      item.dirty = true;
    }
  });
};

GUI.prototype.save = function (path) {
  var data = this.serialize();
  IO.saveTextFile(path, JSON.stringify(data));
};

GUI.prototype.load = function (path, callback) {
  var self = this;
  IO.loadTextFile(path, function (dataStr) {
    var data = JSON.parse(dataStr);
    self.deserialize(data);
    if (callback) {
      callback();
    }
  });
};

GUI.prototype.setEnabled = function(state) {
  this.enabled = state;
}

GUI.prototype.isEnabled = function() {
  return this.enabled;
}

GUI.prototype.toggleEnabled = function() {
  return this.enabled = !this.enabled;
}

module.exports = GUI;
