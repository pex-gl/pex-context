var sys = require('pex-sys');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');
var gen = require('pex-gen');
var triangulate = require('triangulate-contours');
var opentype = require('opentype.js');
var parse = require('parse-svg-path')
var contours = require('svg-path-contours')
var simplify = require('simplify-path');

var Cube = gen.Cube;
var Mesh = glu.Mesh;
var ShowNormals = materials.ShowNormals;
var PerspectiveCamera = glu.PerspectiveCamera;
var Arcball = glu.Arcball;
var Color = color.Color;
var Platform = sys.Platform;

sys.Window.create({
  settings: {
    width: 1280,
    height: 720,
    highdpi: 2,
    type: '2d',
    fullscreen: Platform.isBrowser ? true : false
  },
  init: function() {
    opentype.load('fonts/OpenSans-Regular.ttf', function (err, font) {
      if (err) {
        console.log('Could not load font: ' + err);
      } else {
        var path = font.getPath('Hello, World!', 0, 150, 172);
        var pathCommands = path.commands.map(function(c) {
          if (c.x1) return [ c.type, c.x1, c.y1, c.x, c.y ];
          else return [ c.type, c.x, c.y ];
        })
        //console.log(pathCommands)
        //console.log(path);
        var lines = contours(pathCommands);
        var threshold = 1;
        //console.log(lines)
        //lines = lines.map(function(path) {
        //  return simplify(path, threshold)
        //})

        var shape = triangulate(lines);
        console.log(shape)
//
        shape.cells.forEach(function(cell) {
          canvas.drawLine(paint, shape.positions[cell[0]][0], shape.positions[cell[0]][1], shape.positions[cell[1]][0], shape.positions[cell[1]][1]);
          canvas.drawLine(paint, shape.positions[cell[1]][0], shape.positions[cell[1]][1], shape.positions[cell[2]][0], shape.positions[cell[2]][1]);
          canvas.drawLine(paint, shape.positions[cell[2]][0], shape.positions[cell[2]][1], shape.positions[cell[0]][0], shape.positions[cell[0]][1]);
        })
      }
    });

    //var results = triangulate(contours2);
    //console.log(results);


    //var path = "m10,10C45.812,24.024,45.673,24,45.529,24H31.625c0.482-3.325,6.464-2.758,8.913-3.155z";

    //var result = contours(parse(path))
    //console.log(parse(path));

    var canvas = this.canvas;
    var paint = this.paint;
    canvas.drawColor(50, 50, 60, 255);
    paint.setStroke();
    paint.setColor(255, 2550, 0, 255);

    canvas.save();
    canvas.translate(50, 50);
    paint.setAntiAlias();

    

    //canvas.restore();

  },
  draw: function() {
  }
});
