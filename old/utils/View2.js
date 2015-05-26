var glu = require('pex-glu');
var merge = require('merge');

function remap(value, oldMin, oldMax, newMin, newMax) {
  return newMin + (value - oldMin) / (oldMax - oldMin) * (newMax - newMin);
}

function View(window, rect) {
  this.window = window;
  this.rect = rect;
  this.width = rect.width;
  this.height = rect.height;
  this.visible = true;
}

View.prototype.on = function(event, callback) {
  var self = this;
  if (event == 'leftMouseDown' || event == 'leftMouseUp' || event == 'mouseDragged' || event == 'scrollWheel') {
    this.window.on(event, function(e) {
      if (!self.visible) return;
      var ev = merge({}, e);
      if (event == 'leftMouseDown' || event == 'scrollWheel') {
        if (!self.rect.contains({ x: e.x, y: self.window.height - e.y })) {
          return;
        }
      }
      ev.x -= self.rect.x;
      ev.y = remap(self.window.height - e.y, self.rect.y, self.rect.y + self.rect.height, self.rect.height,  0);
      callback(ev);
      e.handled = ev.handled;
    });
  }
  else {
    this.window.on(event, callback);
  }
}

module.exports = View;