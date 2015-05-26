var plask = require("plask");

plask.simpleWindow({
  settings : {
    width: 1280,
    height: 720,
    type: '2d'
  },
  init: function() {
    var w = this.width;
    var h = this.height;

    this.points = [
      [w * 0.3, h*0.3],
      [w * 0.7, h*0.3],
      [w * 0.7, h*0.7],
      [w * 0.3, h*0.7]
    ];

    this.edges = [
      [0, 1, "A"],
      [1, 2, "B"],
      [2, 3, "A"],
      [3, 0, "B"]
    ];
    
    this.markers = [];

    this.rules = [
      ["A", "B[-A][+A]B"],
      ["B", "A"]
    ];

    this.iterate();
  },
  iterate: function() {
    var points = this.points;
    var edges = this.edges;
    var rules = this.rules;
    var newEdges = [];
    var isLetter = new RegExp("[a-zA-Z]");
    
    function countProducionEdges(production) {
      var newEdgesCount = 0;
      for(var k=0; k<production.length; k++) {
        if (production[k].match(isLetter)) {
          newEdgesCount++;
        }
        else if (production[k] == "[") {
          k += 3; //skip "-A]"
        }        
        else {
          throw "Unknown token at " + k + " in " + production;
        }
      }
      return newEdgesCount;
    }
    
    function vadd(a, b) {
      return [a[0] + b[0], a[1] + b[1]];
    }
    
    function vsub(a, b) {
      return [a[0] - b[0], a[1] - b[1]];
    }
    
    function vmulf(a, f) {
      return [a[0] * f, a[1] * f];
    }

    var newMarkers = [];
    
    for(var i=0; i<edges.length; i++) {
      var edge = edges[i];
      var ea = points[edge[0]];
      var eb = points[edge[1]];
      var eab = vsub(eb, ea);
      for(var j=0; j<rules.length; j++) {
        var rule = rules[j];
        if (rule[0] == edge[2]) { //rule matches edge
          var production = rule[1];
          var numNewLocalEdges = countProducionEdges(production);
          var localEdges = [];          
          for(var k=0; k<production.length; k++) {
            var token = production[k];
            if (token.match(isLetter)) {
              var letter = token;
              //add new edge
              var a = vadd(ea, vmulf(eab, localEdges.length * 1/numNewLocalEdges));
              var b = vadd(ea, vmulf(eab, (localEdges.length + 1) * 1/numNewLocalEdges));
              var ia = points.push(a) - 1;
              var ib = points.push(b) - 1;
              localEdges.push([ia, ib, letter]);
              newEdges.push([ia, ib, letter]);
            }
            else if (token == "[") {
              var sign = (production[k+1] == "+") ? 1 : -1;
              var letter = production[k+2];
              var middle = vadd(ea, vmulf(eab, 0.5));
              var marker = [
                middle,
                vadd(middle, vmulf([-eab[1], eab[0]], sign*0.2)),
                letter
              ];
              newMarkers.push(marker);
              k += 3; //skip "-A]"
            }        
            else {
              throw "Unknown token at " + k + " in " + production;
            }                      
          }
          console.log(localEdges);
        }
      }
    }

    this.edges = newEdges;
    this.markers = newMarkers;
  },
  draw: function() {
    var canvas = this.canvas;
    var paint = this.paint;
    var points = this.points;
    var edges = this.edges;
    var markers = this.markers;

    canvas.clear(255, 255, 255, 255);

    function drawPoint(p) {
      paint.setFill();
      paint.setColor(255, 0, 0, 255);
      canvas.drawCircle(paint, p[0], p[1], 5);
    }

    function drawEdge(e) {
      paint.setStroke();
      paint.setFill(255, 0, 0, 255);
      var a = points[e[0]];
      var b = points[e[1]];
      var label = e[2];
      canvas.drawLine(paint, a[0], a[1], b[0], b[1])
      paint.setFill();
      canvas.drawText(paint, label, (a[0] + b[0])/2 + 5, (a[1] + b[1])/2 - 5);
    }
    
    function drawMarker(m) {
      paint.setStroke();
      paint.setFill(255, 0, 0, 255);
      var a = m[0];
      var b = m[1];
      var label = m[2];
      canvas.drawLine(paint, a[0], a[1], b[0], b[1])
      paint.setFill();
      canvas.drawText(paint, label, (a[0] + b[0])/2 + 5, (a[1] + b[1])/2 - 5);
    }

    points.forEach(drawPoint);
    edges.forEach(drawEdge);
    markers.forEach(drawMarker);
  }
});