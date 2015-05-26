var glu = require('pex-glu');
var geom = require('pex-geom');
var plask = require('plask');
var Context = glu.Context;
var Texture2D = glu.Texture2D;
var Rect = geom.Rect;

function HTMLCanvasRenderer(width, height, highdpi) {
  this.gl = Context.currentContext;
  this.highdpi = highdpi || 1;
  this.canvas = document.createElement('canvas');
  this.tex = Texture2D.create(width, height);
  this.canvas.width = width;
  this.canvas.height = height;
  this.ctx = this.canvas.getContext('2d');
  this.dirty = true;
}

HTMLCanvasRenderer.prototype.isAnyItemDirty = function (items) {
  var dirty = false;
  items.forEach(function (item) {
    if (item.dirty) {
      item.dirty = false;
      dirty = true;
    }
  });
  return dirty;
};

HTMLCanvasRenderer.prototype.draw = function (items, scale) {
  if (!this.isAnyItemDirty(items)) {
    return;
  }

  var ctx = this.ctx;
  ctx.save();
  ctx.scale(this.highdpi, this.highdpi);
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  ctx.font = '10px Monaco';
  var dy = 10;
  var dx = 10;
  var w = 160;

  var cellSize = 0;
  var numRows = 0;
  var margin = 3;

  for (var i = 0; i < items.length; i++) {
    var e = items[i];

    if (e.px && e.px) {
      dx = e.px / this.highdpi;
      dy = e.py / this.highdpi;
    }

    var eh = 20 * scale;
    if (e.type == 'slider') eh = 20 * scale + 14;
    if (e.type == 'toggle') eh = 20 * scale;
    if (e.type == 'multislider') eh = 18 + e.getValue().length * 20 * scale;
    if (e.type == 'vec2') eh = 20 + 2 * 14 * scale;
    if (e.type == 'vec3') eh = 20 + 3 * 14 * scale;
    if (e.type == 'color') eh = 20 + (e.options.alpha ? 4 : 3) * 14 * scale;
    if (e.type == 'color' && e.options.paletteImage) eh += (w * e.options.paletteImage.height/e.options.paletteImage.width + 2) * scale;
    if (e.type == 'button') eh = 24 * scale;
    if (e.type == 'texture2D') eh = 24 + e.texture.height * w / e.texture.width;
    if (e.type == 'radiolist') eh = 18 + e.items.length * 20 * scale;
    if (e.type == 'texturelist') {
      cellSize = Math.floor((w - 2*margin) / e.itemsPerRow);
      numRows = Math.ceil(e.items.length / e.itemsPerRow);
      eh = 18 + 3 + numRows * cellSize;
    }
    if (e.type == 'spline1D' || e.type == 'spline2D') eh = 24 + w;
    if (e.type == 'header') eh = 26 * scale;
    if (e.type == 'text') eh = 45 * scale;

    if (e.type != 'separator') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.56)';
      ctx.fillRect(dx, dy, w, eh - 2);
    }

    if (e.options && e.options.palette && !e.options.paletteImage) {
      function makePaletteImage(e) {
        var img = new Image();
        img.src = e.options.palette;
        img.onload = function() {
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = w * img.height / img.width;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          e.options.paletteImage = canvas;
          e.options.paletteImage.ctx = ctx;
          e.options.paletteImage.data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          e.dirty = true;
        }
      }
      makePaletteImage(e);
    }

    if (e.type == 'slider') {
      ctx.fillStyle = 'rgba(150, 150, 150, 1)';
      ctx.fillRect(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
      ctx.fillStyle = 'rgba(255, 255, 0, 1)';
      ctx.fillRect(dx + 3, dy + 18, (w - 3 - 3) * e.getNormalizedValue(), eh - 5 - 18);
      e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(items[i].title + ' : ' + e.getStrValue(), dx + 4, dy + 13);
    }
    else if (e.type == 'vec2') {
      var numSliders = 2;
      for (var j = 0; j < numSliders; j++) {
        ctx.fillStyle = 'rgba(150, 150, 150, 1)';
        ctx.fillRect(dx + 3, dy + 18 + j * 14 * scale, w - 6, 14 * scale - 3);
        ctx.fillStyle = 'rgba(255, 255, 0, 1)';
        ctx.fillRect(dx + 3, dy + 18 + j * 14 * scale, (w - 6) * e.getNormalizedValue(j), 14 * scale - 3);
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(items[i].title + ' : ' + e.getStrValue(), dx + 4, dy + 13);
      e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
    }
     else if (e.type == 'vec3') {
      var numSliders = 3;
      for (var j = 0; j < numSliders; j++) {
        ctx.fillStyle = 'rgba(150, 150, 150, 1)';
        ctx.fillRect(dx + 3, dy + 18 + j * 14 * scale, w - 6, 14 * scale - 3);
        ctx.fillStyle = 'rgba(255, 255, 0, 1)';
        ctx.fillRect(dx + 3, dy + 18 + j * 14 * scale, (w - 6) * e.getNormalizedValue(j), 14 * scale - 3);
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(items[i].title + ' : ' + e.getStrValue(), dx + 4, dy + 13);
      e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
    }
    else if (e.type == 'color') {
      var numSliders = e.options.alpha ? 4 : 3;
      for (var j = 0; j < numSliders; j++) {
        ctx.fillStyle = 'rgba(150, 150, 150, 1)';
        ctx.fillRect(dx + 3, dy + 18 + j * 14 * scale, w - 6, 14 * scale - 3);
        ctx.fillStyle = 'rgba(255, 255, 0, 1)';
        ctx.fillRect(dx + 3, dy + 18 + j * 14 * scale, (w - 6) * e.getNormalizedValue(j), 14 * scale - 3);
      }
      ctx.fillStyle = e.contextObject[e.attributeName].getHex();
      ctx.fillRect(dx + w - 12 - 3, dy + 3, 12, 12);
      if (e.options.paletteImage) {
        console.log('e.options.paletteImage')
        ctx.drawImage(e.options.paletteImage, dx + 3, dy + 18 + 14 * numSliders, w - 6, w * e.options.paletteImage.height/e.options.paletteImage.width);
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(items[i].title + ' : ' + e.getStrValue(), dx + 4, dy + 13);
      e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
    }
    else if (e.type == 'button') {
      ctx.fillStyle = e.active ? 'rgba(255, 255, 0, 1)' : 'rgba(150, 150, 150, 1)';
      ctx.fillRect(dx + 3, dy + 3, w - 3 - 3, eh - 5 - 3);
      e.activeArea.set(dx + 3, dy + 3, w - 3 - 3, eh - 5 - 3);
      ctx.fillStyle = e.active ? 'rgba(100, 100, 100, 1)' : 'rgba(255, 255, 255, 1)';
      ctx.fillText(items[i].title, dx + 5, dy + 15);
      if (e.options.color) {
        var c = e.options.color;
        ctx.fillStyle = 'rgba(' + c.x * 255 + ', ' + c.y * 255 + ', ' + c.z * 255 + ', 1)';
        ctx.fillRect(dx + w - 8, dy + 3, 5, eh - 5 - 3);
      }
    }
    else if (e.type == 'toggle') {
      var on = e.contextObject[e.attributeName];
      ctx.fillStyle = on ? 'rgba(255, 255, 0, 1)' : 'rgba(150, 150, 150, 1)';
      ctx.fillRect(dx + 3, dy + 3, eh - 5 - 3, eh - 5 - 3);
      e.activeArea.set(dx + 3, dy + 3, eh - 5 - 3, eh - 5 - 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(items[i].title, dx + eh, dy + 12);
    }
    else if (e.type == 'radiolist') {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(e.title, dx + 4, dy + 13);
      var itemHeight = 20 * scale;
      for (var j = 0; j < e.items.length; j++) {
        var item = e.items[j];
        var on = e.contextObject[e.attributeName] == item.value;
        ctx.fillStyle = on ? 'rgba(255, 255, 0, 1)' : 'rgba(150, 150, 150, 1)';
        ctx.fillRect(dx + 3, 18 + j * itemHeight + dy + 3, itemHeight - 5 - 3, itemHeight - 5 - 3);
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fillText(item.name, dx + 5 + itemHeight - 5, 18 + j * itemHeight + dy + 13);
      }
      e.activeArea.set(dx + 3, 18 + dy + 3, itemHeight - 5, e.items.length * itemHeight - 5);
    }
    else if (e.type == 'texturelist') {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(e.title, dx + 4, dy + 13);
      for (var j = 0; j < e.items.length; j++) {
        var col = j % e.itemsPerRow;
        var row = Math.floor(j / e.itemsPerRow);
        var itemColor = this.controlBgPaint;
        var shrink = 0;
        if (e.items[j].value == e.contextObject[e.attributeName]) {
          ctx.fillStyle = 'none';
          ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
          ctx.lineWidth = '2';
          ctx.strokeRect(dx + 3 + col * cellSize + 1, dy + 18 + row * cellSize + 1, cellSize - 1 - 2, cellSize - 1 - 2)
          ctx.lineWidth = '1';
          shrink = 2;
        }
        if (!e.items[j].activeArea) {
          e.items[j].activeArea = new Rect();
        }
        e.items[j].activeArea.set(dx + 3 + col * cellSize + shrink, dy + 18 + row * cellSize + shrink, cellSize - 1 - 2 * shrink, cellSize - 1 - 2 * shrink);
      }
      e.activeArea.set(dx + 3, 18 + dy + 3, w - 3 - 3, cellSize * numRows - 5);
    }
    else if (e.type == 'texture2D') {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(items[i].title, dx + 5, dy + 15);
      e.activeArea.set(dx + 3, dy + 18, w - 3 - 3, eh - 5 - 18);
    }
    else if (e.type == 'header') {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillRect(dx + 3, dy + 3, w - 3 - 3, eh - 5 - 3);
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillText(items[i].title, dx + 5, dy + 16);
    }
    else if (e.type == 'text') {
      e.activeArea.set(dx + 3, dy + 20, w - 6, eh - 20 - 5);
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(items[i].title, dx + 3, dy + 13);
      ctx.fillStyle = 'rgba(50, 50, 50, 1)';
      ctx.fillRect(dx + 3, dy + 20, e.activeArea.width, e.activeArea.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(e.contextObject[e.attributeName], dx + 3 + 3, dy + 15 + 20);
      if (e.focus) {
        ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
        ctx.strokeRect(e.activeArea.x-0.5, e.activeArea.y-0.5, e.activeArea.width, e.activeArea.height);
      }
    }
    else if (e.type == 'separator') {
      //do nothing
    }
    else {
      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.fillText(items[i].title, dx + 5, dy + 13);
    }
    dy += eh;
  }
  ctx.restore();
  this.updateTexture();
};

HTMLCanvasRenderer.prototype.getTexture = function () {
  return this.tex;
};

HTMLCanvasRenderer.prototype.getImageColor = function(image, x, y) {
  var r = image.data[(x + y * image.width)*4 + 0]/255;
  var g = image.data[(x + y * image.width)*4 + 1]/255;
  var b = image.data[(x + y * image.width)*4 + 2]/255;
  return { r: r, g: g, b: b };
}

HTMLCanvasRenderer.prototype.updateTexture = function () {
  var gl = this.gl;
  this.tex.bind();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
};

module.exports = HTMLCanvasRenderer;
