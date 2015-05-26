//Color utility class

//## Example use
//     var Color = require('pex-color').Color;
//
//     var red = new Color(1.0, 0.0, 0.0, 1.0);
//     var green = Color.fromHSL(0.2, 1.0, 0.0, 0.5);

//## Reference

//Dependencies imports
var lerp = require('lerp');

//### Color(r, g, b, a)  
//RGBA color constructor  
//`r` - red component *{ Number 0..1 }* = 0  
//`g` - green component *{ Number 0..1 }* = 0  
//`b` - blue component *{ Number 0..1 }* = 0  
//`a` - alpha component *{ Number 0..1 }* = 1
function Color(r, g, b, a) {
  this.r = (r !== undefined) ? r : 0;
  this.g = (g !== undefined) ? g : 0;
  this.b = (b !== undefined) ? b : 0;
  this.a = (a !== undefined) ? a : 1;
}

//### create(r, g, b, a)  
//RGBA color constructor function  
//`r` - red component *{ Number 0..1 }* = 0  
//`g` - green component *{ Number 0..1 }* = 0  
//`b` - blue component *{ Number 0..1 }* = 0  
//`a` - alpha opacity *{ Number 0..1 }* = 1
Color.create = function(r, g, b, a) {
  return new Color(r, g, b, a);
};

//### fromRGB(r, g, b, a)  
//Alias for create(r, g, b, a)
Color.fromRGB = Color.create;

//### fromArray(a)  
//Creates new color from array of 4 values [r, g, b, a]  
//`a` - array of rgba values *{ Array of Numbers 0..1 }* = [0, 0, 0, 1]
Color.fromArray = function(a) {
 return new Color(a[0], a[1], a[2], a[3]);
};

//### fromByteArray(a)  
//Creates new color from array of 4 byte values [r, g, b, a]  
//`a` - array of rgba values *{ Array of Numbers/Int 0..255 }* = [0, 0, 0, 255]
Color.fromByteArray = function(a) {
 return new Color(a[0]/255, a[1]/255, a[2]/255, (a.length == 4) ? a[3]/255 : 255);
};

//### fromHSV(h, s, v, a)
//Creates new color from hue, saturation and value  
//`h` - hue *{ Number 0..1 }* = 0  
//`s` - saturation *{ Number 0..1 }* = 0  
//`v` - value *{ Number 0..1 }* = 0  
//`a` - alpha opacity *{ Number 0..1 }* = 1
Color.fromHSV = function(h, s, v, a) {
  var c = new Color();
  c.setHSV(h, s, v, a);
  return c;
};

//### fromHSL(h, s, l, a)
//Creates new color from hue, saturation and lightness  
//`h` - hue *{ Number 0..1 }* = 0  
//`s` - saturation *{ Number 0..1 }* = 0  
//`l` - lightness *{ Number 0..1 }* = 0  
//`a` - alpha opacity *{ Number 0..1 }* = 1
Color.fromHSL = function(h, s, l, a) {
  var c = new Color();
  c.setHSL(h, s, l, a);
  return c;
};

//### fromHex(hex)  
//Creates new color from html hex value e.g. #FF0000  
//`hex` - html hex color string (with or without #) *{ String }*
Color.fromHex = function(hex) {
  var c = new Color();
  c.setHex(hex);
  return c;
};

//### fromXYZ(x, y, z)  
//Creates new color from XYZ representation  
//x - *{ Number 0..1 }*  
//y - *{ Number 0..1 }*  
//z - *{ Number 0..1 }*  
Color.fromXYZ = function(x, y, z) {
  var c = new Color();
  c.setXYZ(x, y, z);
  return c;
};

//### fromLab(l, a, b)  
//Creates new color from Lab representation  
//l - *{ Number 0..100 }*  
//a - *{ Number -128..127 }*  
//b - *{ Number -128..127 }*  
Color.fromLab = function(l, a, b) {
  var c = new Color();
  c.setLab(l, a, b);
  return c;
};

//### set(r, g, b, a)  
//`r` - red component *{ Number 0..1 }* = 0  
//`g` - green component *{ Number 0..1 }* = 0  
//`b` - blue component *{ Number 0..1 }* = 0  
//`a` - alpha opacity *{ Number 0..1 }* = 1
Color.prototype.set = function(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = (a !== undefined) ? a : 1;

  return this;
};

//### setHSV(h, s, l, a)  
//Sets rgb color values from a hue, saturation, value and alpha  
//`h` - hue *{ Number 0..1 }* = 0  
//`s` - saturation *{ Number 0..1 }* = 0  
//`v` - value *{ Number 0..1 }* = 0  
//`a` - alpha opacity *{ Number 0..1 }* = 1  
Color.prototype.setHSV = function(h, s, v, a) {
  a = a || 1;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: this.r = v; this.g = t; this.b = p; break;
    case 1: this.r = q; this.g = v; this.b = p; break;
    case 2: this.r = p; this.g = v; this.b = t; break;
    case 3: this.r = p; this.g = q; this.b = v; break;
    case 4: this.r = t; this.g = p; this.b = v; break;
    case 5: this.r = v; this.g = p; this.b = q; break;
  }

  this.a = a;
  return this;
};

//### getHSV()  
//Returns hue, saturation, value and alpha of color as  
//*{ Object h:0.1, s:0..1, v:0..1, a:0..1 }*  
Color.prototype.getHSV = function() {
  var r = this.r;
  var g = this.g;
  var b = this.b;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h;
  var v = max;
  var d = max - min;
  var s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0; // achromatic
  }
  else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h, s: s, v: v, a: this.a };
};

//### setHSL(h, s, l, a)  
//Sets rgb color values from a hue, saturation, lightness and alpha  
//`h` - hue *{ Number 0..1 }* = 0  
//`s` - saturation *{ Number 0..1 }* = 0  
//`l` - lightness *{ Number 0..1 }* = 0  
//`a` - alpha opacity *{ Number 0..1 }* = 1  
//Based on [https://gist.github.com/mjijackson/5311256](https://gist.github.com/mjijackson/5311256)
Color.prototype.setHSL = function(h, s, l, a) {
  a = a || 1;

  function hue2rgb(p, q, t) {
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1/6) { return p + (q - p) * 6 * t; }
    if (t < 1/2) { return q; }
    if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
    return p;
  }

  if (s === 0) {
    this.r = this.g = this.b = l; // achromatic
  }
  else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    this.r = hue2rgb(p, q, h + 1/3);
    this.g = hue2rgb(p, q, h);
    this.b = hue2rgb(p, q, h - 1/3);
    this.a = a;
  }

  return this;
};

//### getHSL()  
//Returns hue, saturation, lightness and alpha of color as  
//*{ Object h:0.1, s:0..1, l:0..1, a:0..1 }*  
//Based on [https://gist.github.com/mjijackson/5311256](https://gist.github.com/mjijackson/5311256)
Color.prototype.getHSL = function() {
  var r = this.r;
  var g = this.g;
  var b = this.b;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var l = (max + min) / 2;
  var h;
  var s;

  if (max === min) {
    h = s = 0; // achromatic
  }
  else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return { h: h, s: s, l: l, a: this.a };
};

//### setHex(hex)  
//Sets rgb color values from a html hex value e.g. #FF0000  
//`hex` - html hex color string (with or without #) *{ String }*
Color.prototype.setHex = function(hex) {
  hex = hex.replace(/^#/, "");
  var num = parseInt(hex, 16);

  var color = [ num >> 16, num >> 8 & 255, num & 255 ].map(function(val) {
    return val / 255;
  });

  this.r = color[0];
  this.g = color[1];
  this.b = color[2];

  return this;
};

//### getHex()  
//Returns html hex representation of this color *{ String }*
Color.prototype.getHex = function() {
  var color = [ this.r, this.g, this.b ].map(function(val) {
    return Math.floor(val * 255);
  });

  return "#" + ((color[2] | color[1] << 8 | color[0] << 16) | 1 << 24)
    .toString(16)
    .slice(1)
    .toUpperCase();
};


//### setXYZ(x, y, z)  
//Sets rgb color values from XYZ
//x - *{ Number 0..1 }*  
//y - *{ Number 0..1 }*  
//z - *{ Number 0..1 }*  
Color.prototype.setXYZ = function(x, y, z) {
  var rgb = {
    r: x *  3.2406 + y * -1.5372 + z * -0.4986,
    g: x * -0.9689 + y *  1.8758 + z *  0.0415,
    b: x *  0.0557 + y * -0.2040 + z *  1.0570
  };

  [ "r", "g", "b" ].forEach(function(key) {
    rgb[key] /= 100;

    if (rgb[key] < 0) {
      rgb[key] = 0;
    }

    if (rgb[key] > 0.0031308) {
      rgb[key] = 1.055 * Math.pow(rgb[key], (1 / 2.4)) - 0.055;
    }
    else {
      rgb[key] *= 12.92;
    }
  });

  this.r = rgb.r;
  this.g = rgb.g;
  this.b = rgb.b;
  this.a = 1.0;

  return this;
};

//### getXYZ()  
//Returns xyz representation of this color as  
//*{ Object x:0..1, y:0..1, z:0..1 }*  
Color.prototype.getXYZ = function() {
  var rgb = this.clone();

  [ "r", "g", "b" ].forEach(function(key) {
    if (rgb[key] > 0.04045) {
      rgb[key] = Math.pow(((rgb[key] + 0.055) / 1.055), 2.4);
    } else {
      rgb[key] /= 12.92;
    }

    rgb[key] = rgb[key] * 100;
  });

  return {
    x: rgb.r * 0.4124 + rgb.g * 0.3576 + rgb.b * 0.1805,
    y: rgb.r * 0.2126 + rgb.g * 0.7152 + rgb.b * 0.0722,
    z: rgb.r * 0.0193 + rgb.g * 0.1192 + rgb.b * 0.9505
  };
};

//### setLab(l, a, b)  
//Sets rgb color values from Lab  
//l - *{ Number 0..100 }*  
//a - *{ Number -128..127 }*  
//b - *{ Number -128..127 }*  
Color.prototype.setLab = function(l, a, b) {
  var y = (l + 16) / 116;
  var x = a / 500 + y;
  var z = y - b / 200;

  var xyz = { x: x, y: y, z: z };
  var pow;

  [ "x", "y", "z" ].forEach(function(key) {
    pow = Math.pow(xyz[key], 3);

    if (pow > 0.008856) {
      xyz[key] = pow;
    }
    else {
      xyz[key] = (xyz[key] - 16 / 116) / 7.787;
    }
  });

  var color = Color.fromXYZ(xyz.x, xyz.y, xyz.z);

  this.r = color.r;
  this.g = color.g;
  this.b = color.b;
  this.a = color.a;

  return this;
};

//### getLab()  
//Returns Lab representation of this color as  
//*{ Object l: 0..100, a: -128..127, b: -128..127 }*  
Color.prototype.getLab = function() {
  var white = { x: 95.047, y: 100.000, z: 108.883 };
  var xyz = this.getXYZ();

  [ "x", "y", "z" ].forEach(function(key) {
    xyz[key] /= white[key];

    if (xyz[key] > 0.008856) {
      xyz[key] = Math.pow(xyz[key], 1 / 3);
    }
    else {
      xyz[key] = (7.787 * xyz[key]) + (16 / 116);
    }
  });

  return {
    l: 116 * xyz.y - 16,
    a: 500 * (xyz.x - xyz.y),
    b: 200 * (xyz.y - xyz.z)
  };
};

//### copy()  
//Copies rgba values from another color into this instance  
//`c` - another color to copy values from *{ Color }*
Color.prototype.copy = function(c) {
  this.r = c.r;
  this.g = c.g;
  this.b = c.b;
  this.a = c.a;

  return this;
};

//### clone()  
//Returns a copy of this color *{ Color }*
Color.prototype.clone = function() {
  return new Color(this.r, this.g, this.b, this.a);
};

//### hash()  
//Returns one (naive) hash number representation of this color *{ Number }*
Color.prototype.hash = function() {
  return 1 * this.r + 12 * this.g + 123 * this.b + 1234 * this.a;
};

//### distance(color)  
//Returns distance (CIE76) between this and given color using Lab representation *{ Number }*  
//Based on [http://en.wikipedia.org/wiki/Color_difference](http://en.wikipedia.org/wiki/Color_difference)
Color.prototype.distance = function(color) {
  var lab1 = this.getLab();
  var lab2 = color.getLab();

  var dl = lab2.l - lab1.l;
  var da = lab2.a - lab1.a;
  var db = lab2.b - lab1.b;

  return Math.sqrt(dl * dl, da * da, db * db);
};

//### lerp(startColor, endColor, t, mode)  
//Creates new color from linearly interpolated two colors  
//`startColor` - *{ Color }*  
//`endColor` - *{ Color } *  
//`t` - interpolation ratio *{ Number 0..1 }*  
//`mode` - interpolation mode : 'rgb', 'hsv', 'hsl' *{ String }* = 'rgb'  
Color.lerp = function(startColor, endColor, t, mode) {
  mode = mode || 'rgb';

  if (mode === 'rgb') {
    return Color.fromRGB(
      lerp(startColor.r, endColor.r, t),
      lerp(startColor.g, endColor.g, t),
      lerp(startColor.b, endColor.b, t),
      lerp(startColor.a, endColor.a, t)
    );
  }
  else if (mode === 'hsv') {
    var startHSV = startColor.getHSV();
    var endHSV = endColor.getHSV();
    return Color.fromHSV(
      lerp(startHSV.h, endHSV.h, t),
      lerp(startHSV.s, endHSV.s, t),
      lerp(startHSV.v, endHSV.v, t),
      lerp(startHSV.a, endHSV.a, t)
    );
  }
  else if (mode === 'hsl') {
    var startHSL = startColor.getHSL();
    var endHSL = endColor.getHSL();
    return Color.fromHSL(
      lerp(startHSL.h, endHSL.h, t),
      lerp(startHSL.s, endHSL.s, t),
      lerp(startHSL.l, endHSL.l, t),
      lerp(startHSL.a, endHSL.a, t)
    );
  }
  else {
    return startColor;
  }
};

//## Predefined colors ready to use

Color.Transparent = new Color(0, 0, 0, 0);
Color.None = new Color(0, 0, 0, 0);
Color.Black = new Color(0, 0, 0, 1);
Color.White = new Color(1, 1, 1, 1);
Color.DarkGrey = new Color(0.25, 0.25, 0.25, 1);
Color.Grey = new Color(0.5, 0.5, 0.5, 1);
Color.LightGrey = new Color(0.75, 0.75, 0.75, 1);
Color.Red = new Color(1, 0, 0, 1);
Color.Green = new Color(0, 1, 0, 1);
Color.Blue = new Color(0, 0, 1, 1);
Color.Yellow = new Color(1, 1, 0, 1);
Color.Pink = new Color(1, 0, 1, 1);
Color.Cyan = new Color(0, 1, 1, 1);
Color.Orange = new Color(1, 0.5, 0, 1);

module.exports = Color;
