var plask = require('plask');
var pad = require('pad');

var W = 128;
var H = 128;

var neighbors = [
  -W-1, -W, -W+1,
    -1,  0,   +1,
  +W-1, +W, +W+1
];

var weights = [
  0.05,  0.2, 0.05,
  0.2 , -1.0, 0.2 ,
  0.05,  0.2, 0.05
];

var frame = 0;

var initalImage = plask.SkCanvas.createFromImage('assets/pex.png');
initalImage.length = initalImage.width * initalImage.height * 4;
var initialPixels = Array.prototype.slice.call(initalImage).filter(function(p, i) { return i % 4 == 0 });

plask.simpleWindow({
  settings: {
    width: 256,
    height: 256,
    type: '2d'
  },
  init: function() {
    this.cells = [];
    this.prevCells = [];

    this.cellCanvas = plask.SkCanvas.create(W, H);
    for(var i=0; i<W * H; i++) {
      var v = 1.0-initialPixels[i]/255;
      this.cells.push([v, 1-v]);
      this.prevCells.push([v, 1-v])
    }
    var center = W/2 * H + W/2;
    //for(var i=0; i<200; i++) {
    //  center = Math.floor(Math.random() * W * H);
    //  this.cells[center][0] = 0;
    //  this.cells[center][1] = 1;
    //  this.prevCells[center][0] = 0;
    //  this.prevCells[center][1] = 1;
    //}

    //for(var i=0; i<W*H; i++) {
    //  var on = (i % 100 >= 10);
    //  on = Math.random() > 0.05;
    //  this.prevCells[i][0] = this.cells[i][0] = on ? 1 : 0;
    //  this.prevCells[i][1] = this.cells[i][1] = on ? 0 : 1;
    //}

    this.framerate(30);

    this.on('mouseDragged', function(e) {
      var x = Math.floor(e.x * W/this.width);
      var y = Math.floor(e.y * H/this.height);
      var cell = this.cells[y * W + x];
      if (cell) {
        cell[0] = 0;
        cell[1] = 1;
      }
    }.bind(this));
  },
  simulate: function() {
    //swap cell buffers
    var tmp = this.cells;
    this.cells = this.prevCells;
    this.prevCells = tmp;

    var cells = this.cells;
    var prevCells = this.prevCells;

    var deltaTime = 1;
    var DA = 1.0;
    var DB = 0.5;
    //var f = 0.055;
    //var k = 0.062;
    var f = 0.0460;
    var k = 0.0610;

    for(var y=0; y<H; y++) {
      for(var x=0; x<W; x++) {
        var i = y * W + x;
        var cell = cells[i];
        var A = prevCells[i][0];
        var B = prevCells[i][1];
        var sA = 0;
        var sB = 0;
        for(var n=0; n<neighbors.length; n++) {
          var di = neighbors[n];
          var w = weights[n];
          var neighborCell = prevCells[i + di];
          if (neighborCell) {
            sA += w * neighborCell[0];
            sB += w * neighborCell[1];
          }
        }
        cell[0] = A + (DA*sA - A*B*B + f * (1 - A)) * deltaTime;
        cell[1] = B + (DB*sB + A*B*B - (f + k)*B) * deltaTime;
      }
    }

    var center = W/2 * H + W/2;
  },
  updateCanvas: function(canvas, paint) {
    canvas.drawColor(67, 41, 86, 255);
    paint.setFill();
    paint.setColor(94, 181, 117, 255);

    var points = [];
    for(var y=0; y<H; y++) {
      for(var x=0; x<W; x++) {
        var i = y * W + x;
        var a = Math.floor(this.cells[i][0] * 255);
        var b = Math.floor(this.cells[i][1] * 255);
        //canvas[i*4+0] = b;//b
        //canvas[i*4+1] = b;//g
        //canvas[i*4+2] = b;//r
        //canvas[i*4+0] = 86 + (117 - 86) * this.cells[i][1] * 3;//b
        //canvas[i*4+1] = 41 + (181 - 41) * this.cells[i][1] * 3;//g
        //canvas[i*4+2] = 67 + (94  - 67) * this.cells[i][1] * 3;//r
        canvas[i*4+0] = 0 + (255 - 0) * this.cells[i][1];//b
        canvas[i*4+1] = 0 + (255 - 0) * this.cells[i][1];//g
        canvas[i*4+2] = 0 + (255 - 0) * this.cells[i][1];//r
      }
    }
    //canvas.drawPoints(paint, paint.kPointsPointMode, points);
  },
  draw: function() {
    var numIter = (frame == 0) ? 1 : 10;
    for(var i=0; i<numIter; i++) {
      this.simulate();
    }
    this.updateCanvas(this.cellCanvas, this.paint);
    var frameName = pad(5, ''+frame, '0');
    //this.cellCanvas.writeImage('png', 'frames/' + frameName + '.png');
    frame++;
    //console.log(frame)
    this.canvas.drawCanvas(this.paint, this.cellCanvas, 0, 0, 256, 256);
  }
})