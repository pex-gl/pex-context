//-----------------------------------------------------------------------------

var Crayon = function() {};

//-----------------------------------------------------------------------------

function SkCanvasCrayon(canvas) {
  this.plask = require('plask');
  this.canvas = canvas;
  this.styles = {};
  this.styles['default'] = this.createStyle();
  this.currentStyle = this.styles['default'];
}

SkCanvasCrayon.createCanvas = function(w, h) {
  var plask = require('plask');
  return plask.SkCanvas.create(w, h);
}

SkCanvasCrayon.prototype.createStyle = function() {
  var style = new this.plask.SkPaint();
  style.setAntiAlias(true);
  return style;
};

SkCanvasCrayon.prototype.style = function(styleName) {
  if (!this.styles[styleName]) {
    this.styles[styleName] = this.createStyle();
  }
  this.currentStyle = this.styles[styleName];
  return this;
};

SkCanvasCrayon.prototype.fill = function(enabledColor) {
  var on = (enabledColor !== undefined) ? enabledColor : true;
  if (on) {
    this.currentStyle.setFill();
    this.currentStyle.setColor(enabledColor[0], enabledColor[1], enabledColor[2], enabledColor[3]);
  }
  else this.currentStyle.setStroke();
  return this;
};

SkCanvasCrayon.prototype.stroke = function(enabledColor) {
  var on = (enabledColor !== undefined) ? enabledColor : true;
  if (on) {
    this.currentStyle.setStroke();
    this.currentStyle.setColor(enabledColor[0], enabledColor[1], enabledColor[2], enabledColor[3]);
  }
  else this.currentStyle.setFill();
  return this;
};

SkCanvasCrayon.prototype.font = function(fontFamily, fontSize, fontWeight) {
  this.currentStyle.setFontFamily(fontFamily);
  this.currentStyle.setTextSize(fontSize);
  this.currentStyle.fontSize = fontSize;
  return this;
};

SkCanvasCrayon.prototype.rect = function(x, y, w, h) {
  this.canvas.drawRect(this.currentStyle, x, y, x + w, y + h);
  return this;
};

SkCanvasCrayon.prototype.roundRect = function(x, y, w, h, r) {
  this.canvas.drawRoundRect(this.currentStyle, x, y, x + w, y + h, r, r);
  return this;
};

SkCanvasCrayon.prototype.circle = function(x, y, r) {
  this.canvas.drawCircle(this.currentStyle, x, y, r);
  return this;
};

SkCanvasCrayon.prototype.circle = function(x, y, r) {
  this.canvas.drawCircle(this.currentStyle, x, y, r);
  return this;
};

//TODO: SkCanvasCrayon.drawEllipse

SkCanvasCrayon.prototype.text = function(str, x, y) {
  this.canvas.drawText(this.currentStyle, str, x, y);
  return this;
}

SkCanvasCrayon.prototype.line = function(x1, y1, x2, y2) {
  this.canvas.drawLine(this.currentStyle, x1, y1, x2, y2);
  return this;
};

SkCanvasCrayon.prototype.beginPath = function() {
  if (!this.currentPath) this.currentPath = new this.plask.SkPath();
  this.currentPath.reset();
  return this;
};

SkCanvasCrayon.prototype.moveTo = function(x, y) {
  this.currentPath.moveTo(x, y);
  return this;
};

SkCanvasCrayon.prototype.lineTo = function(x, y) {
  this.currentPath.lineTo(x, y);
  return this;
};

SkCanvasCrayon.prototype.endPath = function() {
  if (!this.currentPath) throw 'No current path';
  this.currentPath.close();
  this.canvas.drawPath(this.currentStyle, this.currentPath);
  return this;
};

SkCanvasCrayon.prototype.clear = function(transparent) {
  this.canvas.clear(0, 0, 0, transparent ? 0 : 255);
  return this;
};

SkCanvasCrayon.prototype.translate = function(x, y) {
  this.canvas.translate(x, y);
  return this;
}

SkCanvasCrayon.prototype.scale = function(x, y) {
  this.canvas.scale(x, y);
  return this;
}

SkCanvasCrayon.prototype.rotate = function(a) {
  this.canvas.rotate(a);
  return this;
}

SkCanvasCrayon.prototype.save = function() {
  this.canvas.save();
  return this;
}

SkCanvasCrayon.prototype.restore = function() {
  this.canvas.restore();
  return this;
}

if (typeof document === 'undefined') {
  module.exports = SkCanvasCrayon;
}

//-----------------------------------------------------------------------------

function HTMLCanvasCrayon(canvas) {
  this.canvas = canvas;
  this.context = canvas.getContext('2d');
  this.styles = {};
  this.styles['default'] = this.createStyle();
  this.currentStyle = this.styles['default'];
  this.transformStack = [];
  this.savedTransformStacks = [];
  this.translateX = 0;
  this.translateY = 0;
}

HTMLCanvasCrayon.createCanvas = function(w, h) {
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

HTMLCanvasCrayon.prototype.createStyle = function() {
  var style = {
    stroke: false,
    strokeWidth: 1,
    fill: "#000000",
    fontFamily: "Arial",
    fontSize: 12,
    fontWeight: "normal",
    textLeading: 0 //the same as fontSize
  };
  return style;
};

HTMLCanvasCrayon.prototype.style = function(styleName) {
  if (!this.styles[styleName]) {
    this.styles[styleName] = this.createStyle();
  }
  this.currentStyle = this.styles[styleName];
  return this;
};

HTMLCanvasCrayon.prototype.fill = function(enabledColor) {
  if (enabledColor) {
    this.currentStyle.fill = 'rgba(' + enabledColor[0] + ',' + enabledColor[1] + ',' + enabledColor[2] + ',' + enabledColor[3]/255 + ')'
  }
  else {
    this.currentStyle.fill = 'transparent';
  }
  return this;
};

HTMLCanvasCrayon.prototype.stroke = function(enabledColor, width) {
  if (enabledColor) {
    this.currentStyle.stroke = 'rgba(' + enabledColor[0] + ',' + enabledColor[1] + ',' + enabledColor[2] + ',' + enabledColor[3]/255 + ')'
  }
  else {
    this.currentStyle.stroke = 'transparent';
  }
  this.currentStyle.strokeWidth = width || 1;
  return this;
};

//fontSize in px
HTMLCanvasCrayon.prototype.font = function(fontFamily, fontSize, fontWeight) {
  this.currentStyle.fontFamily = fontFamily;
  this.currentStyle.fontSize = Math.floor(fontSize);
  this.currentStyle.fontWeight = fontWeight || this.currentStyle.fontWeight;
  return this;
};

HTMLCanvasCrayon.prototype.paragraph = function(textAlign, textLeading, paragraphWidth, autoTranslate) {
  this.currentStyle.textAlign = textAlign;
  this.currentStyle.textLeading = textLeading;
  this.currentStyle.paragraphWidth = paragraphWidth;
  this.currentStyle.autoTranslate = autoTranslate ? true : false;
  return this;
};

HTMLCanvasCrayon.prototype.beforeDraw = function() {
  this.context.save();

  if (this.currentStyle.clipFunc) {
    this.currentStyle.clipFunc(this.context);
  }

  if (this.currentStyle.fill) {
    this.context.fillStyle = this.currentStyle.fill;
  }

  if (this.currentStyle.stroke) {
    this.context.strokeStyle = this.currentStyle.stroke;
    this.context.lineWidth = this.currentStyle.strokeWidth;
  }

  if (this.currentStyle.fontFamily && this.currentStyle.fontSize) {
    this.context.font = this.currentStyle.fontWeight + " " + this.currentStyle.fontSize + "px" + " " + this.currentStyle.fontFamily;
  }

  this.transformStack.forEach(function(transform) {
    transform();
  });
};

HTMLCanvasCrayon.prototype.afterDraw = function() {
  this.context.restore();
};

HTMLCanvasCrayon.prototype.rect = function(x, y, w, h) {
  this.beforeDraw();

  if (this.currentStyle.fill) {
    this.context.fillRect(x, y, w, h);
  }
  if (this.currentStyle.stroke) {
    this.context.strokeRect(x, y, w, h);
  }

  this.afterDraw();
  return this;
};


HTMLCanvasCrayon.prototype.roundRect = function(x, y, w, h, r) {
  this.beforeDraw();

  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.context.beginPath();
  this.context.moveTo(x+r, y);
  this.context.arcTo(x+w, y,   x+w, y+h, r);
  this.context.arcTo(x+w, y+h, x,   y+h, r);
  this.context.arcTo(x,   y+h, x,   y,   r);
  this.context.arcTo(x,   y,   x+w, y,   r);
  this.context.closePath();

  if (this.currentStyle.fill) {
    this.context.fill();
  }
  if (this.currentStyle.stroke) {
    this.context.stroke();
  }

  this.afterDraw();
  return this;
};

HTMLCanvasCrayon.prototype.circle = function(x, y, r) {
  this.beforeDraw();

  this.context.beginPath();
  this.context.arc(x, y, r, 0, 2 * Math.PI, false);
  this.context.closePath();
  if (this.currentStyle.fill) {
    this.context.fill();
  }
  if (this.currentStyle.stroke) {
    this.context.stroke();
  }
  this.afterDraw();
  return this;
};


HTMLCanvasCrayon.prototype.ellipse = function(x, y, w, h) {
  this.beforeDraw();

  //Based on http://stackoverflow.com/a/2173084
  var kappa = .5522848;
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

  this.context.beginPath();
  this.context.moveTo(x, ym);
  this.context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  this.context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  this.context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  this.context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  this.context.closePath();
  if (this.currentStyle.fill) {
    this.context.fill();
  }
  if (this.currentStyle.stroke) {
    this.context.stroke();
  }
  this.afterDraw();
  return this;
};

HTMLCanvasCrayon.prototype.line = function(x1, y1, x2, y2) {
  this.beforeDraw();

  this.context.beginPath();
  this.context.moveTo(x1, y1);
  this.context.lineTo(x2, y2);
  this.context.closePath();

  if (this.currentStyle.fill) {
    this.context.fill();
  }
  if (this.currentStyle.stroke) {
    this.context.stroke();
  }

  this.afterDraw();
  return this;
};

HTMLCanvasCrayon.prototype.text = function(str, x, y) {
  this.beforeDraw();
  if (x === undefined) x = 0;
  if (y === undefined) y = 0;

  if (this.currentStyle.paragraphWidth && str.length > 0) {
    str = this.breakLines(str, this.currentStyle.paragraphWidth);
  }

  var offsetY = 0;

  if (Object.prototype.toString.call(str) === '[object Array]') {
    var dy = y;
    if (this.currentStyle.fill) {
      str.forEach(function(line) {
        this.context.fillText(line, x, dy);
        dy += this.currentStyle.fontSize * (1.0 + this.currentStyle.textLeading);
      }.bind(this));
      offsetY = dy;
    }
    if (this.currentStyle.stroke) {
      str.forEach(function(line) {
        this.context.strokeText(line, x, dy);
        dy += this.currentStyle.fontSize * (1.0 + this.currentStyle.textLeading);
      }.bind(this));
      offsetY = dy - y;
    }
  }
  else if (str.length > 0) {
    offsetY += this.currentStyle.fontSize * (1.0 + this.currentStyle.textLeading);
    if (this.currentStyle.fill) {
      this.context.fillText(str, x, y);
    }
    if (this.currentStyle.stroke) {
      this.context.strokeText(str, x, y);
    }
  }

  if (this.currentStyle.autoTranslate) {
    this.translate(x, offsetY);
  }

  this.afterDraw();
  return this;
};

HTMLCanvasCrayon.prototype.clear = function(color) {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.reset();
  return this;
};

HTMLCanvasCrayon.prototype.translate = function(x, y) {
  var context = this.context;
  this.translateX += x;
  this.translateY += y;
  var f = function() {
    context.translate(x, y);
  };
  f.x = x;
  f.y = y;
  this.transformStack.push(f);
  return this;
};

HTMLCanvasCrayon.prototype.rotate = function(deg) {
  var context = this.context;
  var rad = deg / 180 * Math.PI;
  this.transformStack.push(function() {
    context.rotate(rad);
  });
  return this;
};

HTMLCanvasCrayon.prototype.scale = function(x, y) {
  var context = this.context;
  this.transformStack.push(function() {
    context.scale(x, y);
  });
  return this;
};

HTMLCanvasCrayon.prototype.save = function() {
  var savedStack = this.transformStack.map(function(t) { return t; });
  this.savedTransformStacks.push(savedStack);
  return this;
};

HTMLCanvasCrayon.prototype.restore = function() {
  if (this.savedTransformStacks.length > 0) {
    this.transformStack = this.savedTransformStacks.pop();
    this.translateX = 0;
    this.translateY = 0;
    this.transformStack.forEach(function(f) {
      this.translateX += f.x;
      this.translateY += f.y;
    }.bind(this))
  }
  return this;
};

HTMLCanvasCrayon.prototype.reset = function() {
  this.transformStack = [];
  return this;
};

HTMLCanvasCrayon.prototype.measureText = function(str) {
  if (Object.prototype.toString.call(str) === '[object Array]') {
    return this.measureTextLines(str);
  }

  var metrics = this.getFontMetrics(this.currentStyle.fontFamily, this.currentStyle.fontSize);
  var oldFont = this.context.font;
  this.context.font = this.currentStyle.fontSize + "px " + this.currentStyle.fontFamily;
  var width = this.context.measureText(str).width;
  this.context.font = oldFont;
  return {
    x : 0,
    y : -metrics.ascent,
    width : width,
    height : metrics.bboxHeight
  };
};

HTMLCanvasCrayon.prototype.measureTextLines = function(str) {
  var oldFont = this.context.font;
  this.context.font = this.currentStyle.fontSize + "px " + this.currentStyle.fontFamily;
  var metrics = this.getFontMetrics(this.currentStyle.fontFamily, this.currentStyle.fontSize);

  var lines = str;

  var maxWidth = 0;
  lines.forEach(function(line) {
    var lineWidth = this.context.measureText(line).width;
    maxWidth = Math.max(maxWidth, lineWidth);
  }.bind(this));

  var height = lines.length * this.currentStyle.fontSize + (lines.length - 1) * this.currentStyle.fontSize * this.currentStyle.textLeading + metrics.descent;

  this.context.font = oldFont;
  return {
    x : 0,
    y : -metrics.ascent,
    width : maxWidth,
    height : height
  };
};

HTMLCanvasCrayon.prototype.breakLines = function(str, maxWidth) {
  var words = str.split(" ");
  var lines = [];
  var currentLine = "";
  while(words.length > 0) {
    var word = words.shift();
    var newLine = currentLine;
    if (newLine.length > 0) newLine += " ";
    newLine += word;
    var measurements = this.measureText(newLine);
    if (measurements.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = word;
    }
    else {
      currentLine = newLine;
    }
  }
  lines.push(currentLine);
  return lines;
};

HTMLCanvasCrayon.prototype.clip = function(clipFunc) {
  this.currentStyle.clipFunc = clipFunc;
};

HTMLCanvasCrayon.prototype.clipRect = function(x, y, w, h) {
  this.clip(function(context) {
    context.beginPath();
    context.rect(x, y, w, h);
    context.clip();
  });
};

//Based on code from http://mudcu.be/journal/2011/01/html5-typographic-metrics/ by Michael Deal
HTMLCanvasCrayon.prototype.getFontMetrics = function(fontFamily, fontSize) {
  var container;
  var control;
  var image;

  var direction = ""; // ltr, or rtl
  var whois = "jiraffe!|";
  var bboxHeight = 0; // size of text bounding-height
  var bboxWidth = 0; // size of text bounding-width
  var ascent = 0;
  var descent = 0;
  var emHeight = 0; // size of em-height (via measuring offsetTop of element below line-height=0)
  var enHeight = 0; // size of en-height

  direction = window.getComputedStyle(document.body, "")["direction"];

  // setting up html used for measuring text-metrics
  container = document.createElement("div");
  container.style.fontFamily = fontFamily;
  container.style.fontSize = fontSize + "px";
  container.style.position = "absolute";
  container.style.left = 0;
  container.style.top = 0;
  //document.body.insertBefore(container, document.body.childNodes[0]);
  document.body.appendChild(container);

  control = document.createElement("span");
  image = document.createElement("img");
  image.width = fontSize;
  image.height = 1;

  var canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  var c = canvas.getContext("2d");
  c.fillStyle = "#FF0000";
  c.fillRect(0, 0, 100, 100);
  image.src = canvas.toDataURL();

  control.appendChild(document.createTextNode(whois));
  control.appendChild(image);
  container.appendChild(control);

  // getting css equivalent of ctx.measureText()
  image.style.display = "none";
  control.style.display = "inline";
  bboxHeight = control.offsetHeight;
  bboxWidth = control.offsetWidth;

  // making sure super-wide text doesn't wrap
  image.style.display = "inline";
  var forceWidth = bboxWidth + image.offsetWidth;

  // capturing the "top" and "bottom" baseline
  control.style.cssText = "margin: " + fontSize + "px 0; display: block; width: " + forceWidth + "px";
  var TopBaseline = image.offsetTop - fontSize + 1;
  var HeightCSS = control.offsetHeight;
  var BottomBaseline = TopBaseline - HeightCSS;

  // capturing the "middle" baseline
  control.style.cssText = "line-height: 0; display: block; width: " + forceWidth + "px";
  var MiddleBaseline = image.offsetTop + 1;

  // calculate "em" and "en" height
  emHeight = (MiddleBaseline - 0.5) * 2;
  enHeight = emHeight / 2;

  // calculating the ascent and descent
  descent = -BottomBaseline;
  ascent = TopBaseline;

  document.body.removeChild(container);

  return {
    bboxHeight : bboxHeight,
    descent : descent,
    ascent : ascent,
    emHeight : emHeight,
    enHeight : enHeight,
    xHeight : emHeight
  };
};

if (typeof document !== 'undefined') {
  module.exports = HTMLCanvasCrayon;
}

