var sys = require('pex-sys');
var geom = require('pex-geom');
var color = require('pex-color');

var Platform = sys.Platform;
var Vec3 = geom.Vec3;
var Octree = geom.Octree;
var Color = color.Color;

Color.fromBytes = function(r, g, b, a) {
  return new Color(r/255, g/255, b/255, a/255);
}

function Pixels() {

}

Pixels.fromImage = function(src, cb) {
  if (Platform.isPlask) {
    var SkCanvas = require('plask').SkCanvas;
    var img = SkCanvas.createFromImage(src);
    var w = img.width;
    var h = img.height;
    var n = w * h;
    var pixels = [];
    for(var i=0; i<n; i++) {
      var b = img[i*4+0];
      var g = img[i*4+1];
      var r = img[i*4+2];
      var a = img[i*4+3];
      var p = new Vec3(r, g, b);
      pixels.push(p);
    }
    cb(null, pixels);
  }
  else if (Platform.isBrowser) {
    var img = new Image();
    img.onload = function() {
      var c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);

      var pixels = [];

      var imgData = ctx.getImageData(0, 0, c.width, c.height);
      for(var y = 0; y < imgData.height; y++) {
        for(var x = 0; x < imgData.width; x++) {
          var i = (x + y * imgData.width) * 4;
          var p = new Vec3(imgData.data[i], imgData.data[i+1], imgData.data[i+2]);
          pixels.push(p);
        }
      }
      cb(null, pixels);
    }
    img.src = src;
  }
}

function Palette() {

}

Palette.fromImage = function(src, cb) {
  Pixels.fromImage(src, function(err, pixels) {
    console.log(pixels)
    var octree = new Octree(new Vec3(0, 0, 0), new Vec3(255, 255, 255));
    for(var i=0; i<pixels.length; i++) {
      octree.add(pixels[i]);
    }

    var colors = [];
    var level = 1;
    var cells = getAllCellsAtLevel(octree.root, level);
    for(var i=0; i<cells.length; i++) {
      var c = getAveragePoint(cells[i]);
      colors.push({
        color: Color.fromBytes(c.x, c.y, c.z, 255),
        numPoints: cells[i].points.length
      });
    }
    colors.sort(function(a, b) {
      return b.numPoints - a.numPoints;
    });
    cb(null, colors);
  })
}

function getAllCellsAtLevel(cell, level, result) {
  result = result || [];
  if (cell.level == level) {
    if (cell.points.length > 0)
      result.push(cell);
    return result;
  }
  else {
    for(var i=0; i<cell.children.length; i++) {
      getAllCellsAtLevel(cell.children[i], level, result);
    }
    return result;
  }
}

function getAveragePoint(cell) {
  var result = new Vec3(0, 0, 0);
  for(var i=0; i<cell.points.length; i++) {
    result.add(cell.points[i]);
  }
  result.scale(1/cell.points.length);
  return result;
}

Palette.fromImage('assets/img3b.jpg', function(err, colors) {
  console.log(colors);

  if (Platform.isPlask) {
    sys.Window.create({
      settings: {
        type: '2d'
      },
      init: function() {
        var canvas = this.canvas;
        var paint = this.paint;
        paint.setFill();
        for(var i=0; i<colors.length; i++) {
          paint.setColor(Math.floor(colors[i].color.r * 255), Math.floor(colors[i].color.g * 255), Math.floor(colors[i].color.b * 255), 255);
          canvas.drawRect(paint, i * 50, 0, (i + 1) * 50, 50);
        }
      }
    })
  }
  else if (Platform.isBrowser) {
    window.Palette = Palette;
    //for(var i=0; i<colors.length; i++) {
    //  var div = document.createElement('div');
    //  div.style.width = '50px';
    //  div.style.height = '50px';
    //  div.style.background = colors[i].color.getHex();
    //  div.style.float = 'left';
    //  document.body.appendChild(div);
    //}
  }
})