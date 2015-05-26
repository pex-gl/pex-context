define(["Rect"], function(Rect) {
  //based on "Squarified treemaps" by Bruls, Mark; Huizing, Kees; van Wijk, Jarke J. (2000), 
  //http://www.win.tue.nl/~vanwijk/stm.pdf
  function Treemap(width, height) {
    width = width || 1;
    height = height || 1;  
    this.bounds = new Rect(0, 0, width, height);  
  }

  Treemap.prototype.layout = function(data) {
    this.remainingBounds = new Rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
    this.children = [];
    this.rectangles = [];
    for(var i=0; i<data.length; i++) {
      this.children.push({
        value: data[i],
        bounds: new Rect(0, 0, 0, 0)
      });
    }
    //sort in descending order
    this.children.sort(function(a, b) {
      return b.value - a.value;
    });
    //this.squarify(this.children, []);
    this.squarify(data, this.bounds);
    console.log("Done! Num rectangles: " + this.rectangles.length);  
    return this.rectangles;
  }

  Treemap.prototype.squarify = function(data, bounds) {
    if (data.length == 0) return;
    var reminingData = data.slice(0, data.length);
    var row = [];
  
    //horizontal layout
    if (bounds.width > bounds.height) {
  //    console.log("squarify", "H", data);
      var prevMax = 9999999999999;
      var prevRatio = 1;
      var prevRectangles = [];    
      while(reminingData.length > 0) {
        row.push(reminingData.shift());
        var rowRectangles = [];
        var rowValuesSum = 0;
        for(var i=0; i<row.length; i++) {
          rowValuesSum += row[i];
        }
        var dataValuesSum = 0;
        for(var i=0; i<data.length; i++) {
          dataValuesSum += data[i];
        }
        var widthRatio = rowValuesSum / dataValuesSum;
        var s = 0; //row cells size sum  
        for(var i=0; i<row.length; i++) {
          var cw = bounds.width * widthRatio;
          var ch = bounds.height * row[i]/rowValuesSum;
          var r = cw * ch; //cellSize
          s += r; 
        }    
        var s2 = s * s;
        var w2 = bounds.height * bounds.height; 
        var max = 0;
        var shiftY = 0;
        for(var i=0; i<row.length; i++) {
          var cw = bounds.width * widthRatio;
          var ch = bounds.height * row[i]/rowValuesSum;        
          var r = cw * ch; //cellSize
          var localMax = Math.max(w2*r/s2, s2/(w2*r));
          max = Math.max(max, localMax);
          rowRectangles.push(new Rect(bounds.x, bounds.y + shiftY, cw, ch));        
          shiftY += ch; 
        }
        if (prevMax < max) {
          //roll back
          reminingData.unshift(row.pop());
          rowRectangles = prevRectangles;
          widthRatio = prevRatio;
          break;
        }      
        prevRectangles = rowRectangles.concat([]);
        prevMax = max;
        prevRatio = widthRatio;
      }
      this.rectangles = this.rectangles.concat(rowRectangles);
      if (reminingData.length > 0) {
        var reminingBounds = new Rect(
          bounds.x + bounds.width * widthRatio,
          bounds.y,
          bounds.width - bounds.width * widthRatio,
          bounds.height
        );
        this.squarify(reminingData, reminingBounds);
      }
    }
    else {
  //    console.log("squarify", "V", data);    
      var prevMax = 9999999999999;
      var prevRectangles = 0;
      var prevRatio = 1;
      while(reminingData.length > 0) {
        row.push(reminingData.shift());
        var rowRectangles = [];
        var rowValuesSum = 0;
        for(var i=0; i<row.length; i++) {
          rowValuesSum += row[i];
        }
        var dataValuesSum = 0;
        for(var i=0; i<data.length; i++) {
          dataValuesSum += data[i];
        }
        var heightRatio = rowValuesSum / dataValuesSum;
        var s = 0; //row cells size sum  
        for(var i=0; i<row.length; i++) {
          var cw = bounds.width * row[i]/rowValuesSum;
          var ch = bounds.height * heightRatio;        
          var r = cw * ch; //cellSize
          s += r; 
        }    
        var s2 = s * s;
        var w2 = bounds.width * bounds.width;   
        var max = 0;
        var shiftX = 0;
        for(var i=0; i<row.length; i++) {
          var cw = bounds.width * row[i]/rowValuesSum;
          var ch = bounds.height * heightRatio;        
          var r = cw * ch; //cellSize        
          var localMax = Math.max(w2*r/s2, s2/(w2*r));
          max = Math.max(max, localMax);
          rowRectangles.push(new Rect(bounds.x + shiftX, bounds.y, cw, ch));        
          shiftX += cw;         
        }
        if (prevMax < max) {
          //roll back
          reminingData.unshift(row.pop());
          rowRectangles = prevRectangles;
          heightRatio = prevRatio;
          break;
        }      
        prevMax = max;
        prevRectangles = rowRectangles.concat([]);     
        prevRatio = heightRatio; 
      }  
      this.rectangles = this.rectangles.concat(rowRectangles);    
      if (reminingData.length > 0) {
        var reminingBounds = new Rect(
          bounds.x,
          bounds.y + bounds.height * heightRatio,
          bounds.width,
          bounds.height - bounds.height * heightRatio
        );
        this.squarify(reminingData, reminingBounds);
      }      
    }
  }
    
  return Treemap;
});