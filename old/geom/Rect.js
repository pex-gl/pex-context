//2D Rect (x, y, width, height) or (min, max)
//## Example use
//      var rect = new Rect(new Vec2(-1, -1), new Vec2(1, 1));
//      var point = new Vec2(0.2, 0.9);
//      rect.contains(point); //=> true

//## Reference

var geom = require('pex-geom');
var Vec2 = geom.Vec2;


//## Properties

//### .x - *{ Number }*
//### .y - *{ Number }*
//### .width - *{ Number }*
//### .height - *{ Number }*
//### .min - *{ Vec2 }*
//### .max - *{ Vec2 }*

//### Rect ( min, max )
//`min` - bottom left corner *{ Vec3 }* = ( Infinity, Infinity)  
//`max` - top right corner *{ Vec3 }* = ( -Infinity, -Infinity)  
//
//alternative version of the constructor  
//### Rect ( x, y, width, height )  
//`x` - *{ Number }*  
//`y` - *{ Number }*  
//`width` - *{ Number }*  
//`height` - *{ Number }*  
function Rect(min, max) {
  if (arguments.length == 0) {
    this.min = new Vec2( Infinity, Infinity);
    this.max = new Vec2(-Infinity, -Infinity);
  }
  else if (arguments.length == 2) {
    this.min = min;
    this.max = max;
  }
  else if (arguments.length == 4) {
    var x = arguments[0];
    var y = arguments[1];
    var w = arguments[2];
    var h = arguments[3];

    this.min = new Vec2(x, y);
    this.max = new Vec2(x + w, y + h);
  }

  Object.defineProperty(this, 'x', {
    set: function(x) {
      var w = this.max.x - this.min.x;
      this.min.x = x;
      this.max.x = x + w;
    },
    get: function() {
      return this.min.x;
    }
  });

  Object.defineProperty(this, 'y', {
    set: function(y) {
      var h = this.max.y - this.min.y;
      this.min.y = y;
      this.max.y = y + h;
    },
    get: function() {
      return this.min.y;
    }
  });

  Object.defineProperty(this, 'width', {
    set: function(w) {
      this.max.x = this.min.x + w;
    },
    get: function() {
      return this.max.x - this.min.x;
    }
  });

  Object.defineProperty(this, 'height', {
    set: function(h) {
      this.max.y = this.min.y + h;
    },
    get: function() {
      return this.max.y - this.min.y;
    }
  });
}

//### set(x, y, width, height)
//`x` - *{ Number }*  
//`y` - *{ Number }*  
//`width` - *{ Number }*  
//`height` - *{ Number }*  
Rect.prototype.set = function(x, y, width, height) {
  this.min.x = x;
  this.min.y = y;
  this.max.x = x + width;
  this.max.y = y + height;
};

//### contains(p)
//Returns true if point is inside rectangle, false otherwise  
//`p` - *{ Vec2 }*
Rect.prototype.contains = function(point) {
  return point.x >= this.min.x && point.x <= this.max.x && point.y >= this.min.y && point.y <= this.max.y;
};

//### getCenter(out)
//Returns center of the rectangle  
//`out` - optional vector to save the center to *{ Vec2 }*
Rect.prototype.getCenter = function(out) {
  out = out || new Vec2();
  out.asAdd(this.min, this.max).scale(1/2);
  return out;
}

//### getSize(out)
//Returns size {width, height} of the rectangle  
//`out` - optional vector to save the size to *{ Vec2 }*
Rect.prototype.getSize = function(out) {
  out = out || new Vec2();
  out.asSub(this.max, this.min);
  return out;
}


//### fromPoints(points)
//Creates bounding rectangle from a list of points  
//`points` - *{ Array of Vec2 }*
Rect.fromPoints = function(points) {
  var rect = new Rect();
  var min = rect.min;
  var max = rect.max;
  for(var i=0; i<points.length; i++) {
    var p = points[i];
    min.x = Math.min(min.x, p.x);
    min.y = Math.min(min.y, p.y);
    max.x = Math.max(max.x, p.x);
    max.y = Math.max(max.y, p.y);
  }
  return rect;
}

module.exports = Rect;