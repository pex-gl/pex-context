//TODO: make video with this music "I-F - I Do Because I Couldn't Care Less" http://www.youtube.com/watch?v=WYKjolWTGcI&feature=autoplay&list=PL2ED24356F2C0B0BD&index=14&playnext=2

var url = require('url');
var fs = require('fs');
var plask = require('plask');
var http = require('http');
var events = require('events');
var util = require('util');
require('./js/date');
require('./js/time');

//pregl and pex are not compatibile with node.js module export syntax
//so i just 'extract' them in the global namespace
eval(fs.readFileSync('js/pregl.js', 'utf8'));
eval(fs.readFileSync('js/pex.js', 'utf8'));
eval(fs.readFileSync('js/delaunay.js', 'utf8'));

//global gl for pregl and pex compatibility
var gl;

var offline = true;
var cacheScanningPoints = true;
var framesPerIteration = 5;
var minFramesPerIteration = 5;
var maxFramesPerInteration = 20;
var landscapeMorphSpeed = 0.5;
var minLandscapeMorphSpeed = 0.15;
var maxLandscapeMorphSpeed = 0.4;
var landscapeScale = 0.005;//0.05;

var shapeNames = ["graffiti","media","sustainable","urban","yourspace","culture","social","gloria","orange","arena"];
var shapeColors = [[147,149,152],[255+0*30,255+0*26,255+0*27],[0,141,72],[237,28,36],[166,206,57],[236,0,140],[0,147,239],[255,242,0],[247,148,30],[146,39,143]];

//--------------------------------------------------------------------

function makePlane(gl) {
 var buffer = gl.createBuffer();
 var data = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);
 gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
 gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
 return {buffer: buffer, num: data.length / 2, data: data};
}

function CaptionRenderer(gl) {
 this.enabled = 0;

 var canvas = new plask.SkCanvas(300, 310);
 var paint = new plask.SkPaint();
 paint.setStyle(paint.kFillStyle);
 paint.setFlags(paint.kAntiAliasFlag);
 paint.setTextSize(16);
 paint.setFontFamily('Andale Mono');
 paint.setStrokeWidth(0);  // Scale invariant.
 paint.setColor(255, 0, 255, 255);

 var mprogram = new PreGL.WebGL.MagicProgram(
   gl, PreGL.WebGL.createProgramFromShaderSources(
     gl,
     fs.readFileSync(path.join(script_dir, 'caption.vshader'), 'utf8'),
     fs.readFileSync(path.join(script_dir, 'caption.fshader'), 'utf8')));

 var plane = makePlane(gl);

 var tex = gl.createTexture();
 gl.activeTexture(gl.TEXTURE1);
 gl.bindTexture(gl.TEXTURE_2D, tex);
 //gl.texImage2DSkCanvas(gl.TEXTURE_2D, 0, caption_canvas);
 // By default the mag filter is already LINEAR.
 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 // By detault the min filter is NEAREST_MIPMAP_NEAREST, we want it linear.
 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
 // Wrapping is important since we're working on theta and phi which has
 // a jump from PI or 2PI to 0 at the seams.
 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

 this.render = function(sw) {
   mprogram.useProgram();
   mprogram.set_u_tex(1);
   mprogram.set_u_scale(new plask.Vec2(canvas.width / sw.width,
                                       canvas.height / sw.height));

   canvas.drawColor(0, 0, 0, 128, paint.kSrcMode);  // Copy not blend.
   var y = 0;
   for (var i = 0, il = sw.parameters.length; i < il; ++i) {
     y += 20;
     var p = sw.parameters[i];
     var cur = i === sw.cur_parameter;
     canvas.drawText(paint, (cur ? 'x ' : '  ') +
                            p.name + ': ' + p.get().toFixed(3),
                     20, y);
   }

   gl.activeTexture(gl.TEXTURE1);
   gl.bindTexture(gl.TEXTURE_2D, tex);
   gl.texImage2DSkCanvasNoFlip(gl.TEXTURE_2D, 0, canvas);

   gl.bindBuffer(gl.ARRAY_BUFFER, plane.buffer);
   gl.vertexAttribPointer(mprogram.location_a_xy,
                          2,
                          gl.FLOAT,
                          false, 0, 0);
   gl.enableVertexAttribArray(mprogram.location_a_xyz);
   gl.disable(gl.DEPTH_TEST);
   gl.enable(gl.BLEND);
   //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
   //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
   gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0, plane.num);
   gl.disable(gl.BLEND);
   gl.enable(gl.DEPTH_TEST);
 };
}

//--------------------------------------------------------------------

function loadImage(downloadfile, handler) {
  var host;
  var urlParams;
  try {
    urlParams = url.parse(downloadfile);
  }
  catch(e) {
    console.log(e);
    handler(null);
    return;
  }
  var host = urlParams.hostname;
  var filename = urlParams.pathname.split("/").pop()

  var theurl = http.createClient(80, host);
  var requestUrl = downloadfile;

  var path = 'cache/thumbs/' + filename;

  try {
    var fileInfo = fs.statSync(path);
    handler(path);
    return;
  }
  catch (e) {

  }

  console.log("Downloading file: " + filename);
  var request = theurl.request('GET', requestUrl, {"host": host});
  request.end();

  var dlprogress = 0;

  request.addListener('response', function (response) {
      response.setEncoding('binary')
      //sys.puts("File size: " + response.headers['content-length'] + " bytes.")
      var body = '';
      response.addListener('data', function (chunk) {
          dlprogress += chunk.length;
          body += chunk;
      });
      response.addListener("end", function() {
          fs.writeFileSync(path, body, 'binary');
          handler(path);
      });
  });
}

//--------------------------------------------------------------------

function loadTextFromUrl(url, handler, format, cache) {
  //console.log("loadTextFromUrl " + url);
  format = format || 'txt';
  cache = (cache === undefined) ? true : cache;

  //change it to regexp
  if (url.indexOf("http://") == 0) {
    url = url.substr(7);
  }
  var slashIndex = url.indexOf("/");
  var host = url.substr(0, slashIndex);
  var file = url.substr(slashIndex);

  var path = 'cache/txt/' + file.replace(/\//g, "_").replace(/\?/g, "_").replace(/\&/g, "_");
  //console.log("loadTextFromUrl cache path : " + path + " cache? " + cache);
  if (cache) {
    try {
      var fileInfo = fs.statSync(path);
      var data = fs.readFileSync(path, 'utf-8');
      //console.log("loadTextFromUrl loading from cache");
      if (format == 'txt') {
        handler(data);
      }
      else if (format == 'json') {
        handler(JSON.parse(data));
      }
      return;
    }
    catch (e) {
      //console.log(e);
    }
  }

  try {
    if (offline) {
      //console.log("OFFLINE - skipping request");
      return;
    }
    var local = http.createClient(80, host);
    //console.log("Getting " + url);
    var request = local.request('GET', file, {'host': host});
    request.on('response', function (response) {
        try {
          var data = "";
          response.on('data', function(chunk){
              data += chunk;
              }).on('end', function(){
                fs.writeFileSync(path, data, 'utf-8');
                if (format == 'txt') {
                  handler(data);
                }
                else if (format == 'json') {
                  //try {
                    var json = JSON.parse(data);
                    handler(json);
                  //}
                  //catch(e) {
                    //console.log(e);
                    //console.log(data);
                  //}
                }
              });
        }
        catch(e) {
              console.log("Connection error");
        }
    });
    request.end();
  }
  catch(e) {
    console.log("Connection error");
  }
}

function loadJSONFromUrl(url, handler, cache) {
  loadTextFromUrl(url, handler, 'json', cache);
}

//--------------------------------------------------------------------

function TwitterDataSource() {
    this.serverApiUrl = "SERVER";
    this.firstUpdate();
}

//&only_new=1
TwitterDataSource.prototype.firstUpdate = function() {
  var self = this;
  loadJSONFromUrl(this.serverApiUrl + "", function(json) {
    self.tweets = json;
    console.log("Tweets " + self.tweets.length);
  }, false);
}

//--------------------------------------------------------------------

function BluetoothDataSource2010() {
  events.EventEmitter.call(this);
  this.serverApiUrl = "";
  this.firstScanDate = Date.parse("2010-06-28 20:00:00");
  this.lastScanDate = Date.parse("2010-07-05 02:00:00")
  this.currScanDate = this.firstScanDate;
  this.currScanPointIndex = 0;
  this.currScanValues = [];
  this.dateUrlParamFormat = "yyyy-MM-dd%20hh:mm:ss";
  this.datePrintFormat = "yyyy-MM-dd hh:mm:ss";
  this.this.scansData = [];
  this.displayedScanDataIndex = -1;
}

util.inherits(BluetoothDataSource2010, events.EventEmitter);

BluetoothDataSource2010.prototype.update = function() {

}

BluetoothDataSource2010.prototype.loadClusters = function() {
  this.loadScanningPoints();
}

BluetoothDataSource2010.prototype.loadScanningPoints = function() {
  var self = this;
  loadJSONFromUrl(this.serverApiUrl + "&option=scanningPoints", function(json) {
    var data = json.array0;
    var minGeoPos = {x:9999, y:9999};
    var maxGeoPos = {x:-9999, y:-9999};
    self.scanningPoints = data
    //id, name, posLat, posLon, desc
    for(var i=0; i<data.length; i++) {
      if (data[i].posLon == 0 || data[i].posLat == 0) {
        continue;
      }
      if (data[i].posLon < minGeoPos.x) minGeoPos.x = data[i].posLon;
      if (data[i].posLon > maxGeoPos.x) maxGeoPos.x = data[i].posLon;
      if (data[i].posLat < minGeoPos.y) minGeoPos.y = data[i].posLat;
      if (data[i].posLat > maxGeoPos.y) maxGeoPos.y = data[i].posLat;
    }
    var s = 50;
    for(var i=0; i<data.length; i++) {
      if (data[i].posLon == 0 || data[i].posLat == 0) {
        data[i].x = 0.5 + (Math.random() - 0.5) * 0.1;
        data[i].y = 0.5 + (Math.random() - 0.5) * 0.1;
      }
      else {
        data[i].x = (data[i].posLon -  minGeoPos.x)/(maxGeoPos.x - minGeoPos.x);
        data[i].y = (1.0 -(data[i].posLat -  minGeoPos.y)/(maxGeoPos.y - minGeoPos.y));
      }
      data[i].r = 0;
      data[i].targetR = 5;
      data[i].color = self.clusters ? self.clusters[data[i].cluster_id - 1].color : [0,0,0,0];
    }
    console.log("BluetoothDataSource.scanningPointsComplete");
    self.emit("scanningPointsComplete", self.scanningPoints);
    self.loadNextScan();
  }, cacheScanningPoints);
}

BluetoothDataSource2010.prototype.loadNextScan = function() {
  if (this.currScanDate.compareTo(this.lastScanDate) >= 0) {
    console.log("end!");
    return;
  }

  var self = this;

  if (this.currScanPointIndex < this.scanningPoints.length) {
    var scanner = this.scanningPoints[this.currScanPointIndex];
    var dateParam = this.currScanDate.toString(this.dateUrlParamFormat);
    var url = this.serverApiUrl + "&option=devicesInScanningPoint&time=" + dateParam + "&window=00:30:00&scanner_id=" + scanner.id;
    loadJSONFromUrl(url, function(data) {
      self.currScanValues.push(data.number);
      self.currScanPointIndex++;
      self.loadNextScan();
    }, cacheScanningPoints);
  }
  else {
    //console.log("BluetoothDataSource.loadNextScan " + this.currScanDate.toString(this.datePrintFormat) + " - done");
    this.currScanPointIndex = 0;
    this.currScanDate = this.currScanDate.add(1).hours();
    this.this.scansData.push({
      date: new Date(this.currScanDate),
      values: this.currScanValues
    });
    this.currScanValues = [];
    setTimeout(function() {
      self.loadNextScan();
    }, 1);
  }
}

BluetoothDataSource2010.prototype.getLastData = function() {

}

//--------------------------------------------------------------------

function BluetoothDataSource2011() {
  events.EventEmitter.call(this);
  this.serverApiUrl = "http://130.225.69.126/~arek/ros/scans11.php";
  this.firstScanDate = Date.parse("2011-06-28 10:00:00"); //06-28
  this.lastScanDate = Date.parse("2011-07-04 02:00:00")
  this.currScanDate = this.firstScanDate;
  this.currScanPointIndex = 0;
  this.currScanValues = [];
  this.dateUrlParamFormat = "yyyy-MM-dd%20HH:mm:ss";
  this.datePrintFormat = "yyyy-MM-dd HH:mm:ss";
  this.scansData = [];
  this.displayedScanDataIndex = -1;
}

util.inherits(BluetoothDataSource2011, events.EventEmitter);

var shapeNames = ["graffiti",   "media",                      "sustainable","urban",    "yourspace","culture",   "social",   "gloria",   "orange",   "arena"];
var shapeColors = [[147,149,152],[255+0*30,255+0*26,255+0*27],[0,141,72],   [237,28,36],[166,206,57],[236,0,140],[0,147,239],[255,242,0],[247,148,30],[146,39,143]];

var clusterColors = [
  [50,100,255],    //pavilion 1
  [125,125,125],//culture 2
  [125,125,125],//volunteers area 3
  [247,148,30], //orange 4
  [255,255,255],//gloria 5
  [50,146,30],  //arena 6
  [255,255,30], //odeon 7
  [255,50,30],  //cosmopol 8
  [125,125,125] //social 9
];

var clusterTextColors = [
  [255,255,255],    //pavilion
  [255,255,255],//culture
  [255,255,255],//volunteers area
  [255,255,255], //orange
  [0,0,0],//gloria
  [255,255,255],  //arena
  [0,0,0], //odeon
  [255,255,255],  //cosmopol
  [255,255,255] //social
];

var clusterNames = [
  "Pavilion",
  "Culture Zone",
  "Volunteers Area",
  "Orange",
  "Gloria",
  "Arena",
  "Odeon",
  "Cosmopol",
  "Social Zone"
];

var clusterCaptionPoints = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
];

var clusterCenterPosition = [
  {x:0, y:0, z:0},
  {x:0, y:0, z:0},
  {x:0, y:0, z:0},
  {x:0, y:0, z:0},
  {x:0, y:0, z:0},
  {x:0, y:0, z:0},
  {x:0, y:0, z:0},
  {x:0, y:0, z:0},
  {x:0, y:0, z:0}
];

var clusterCaptionWidth = [
  65,
  100,
  125,
  60,
  55,
  50,
  55,
  75,
  85
];

var clusterCaptionPointsList = [
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  []
];



BluetoothDataSource2011.prototype.loadClusters = function() {
  var self = this;
  loadJSONFromUrl(this.serverApiUrl + "?option=clusters", function(json) {
    var data = json.array0;
    self.clusters = data;
    for(var i in data) {
      //data[i].color = [Math.random(), Math.random(), Math.random()];
      data[i].color = [clusterColors[i][0]/255, clusterColors[i][1]/255, clusterColors[i][2]/255, 1];
    }
  }, cacheScanningPoints);
  this.loadScanningPoints();
}


BluetoothDataSource2011.prototype.loadScanningPoints = function() {
  var self = this;
  loadJSONFromUrl(this.serverApiUrl + "?option=places", function(json) {
    var data = json.array0;
    var minGeoPos = {x:9999, y:9999};
    var maxGeoPos = {x:-9999, y:-9999};
    self.scanningPoints = data
    //id, name, posLat, posLon, desc
    for(var i=0; i<data.length; i++) {
      if (data[i].posLon == 0 || data[i].posLat == 0) {
        continue;
      }
      if (data[i].posLon < minGeoPos.x) minGeoPos.x = data[i].posLon;
      if (data[i].posLon > maxGeoPos.x) maxGeoPos.x = data[i].posLon;
      if (data[i].posLat < minGeoPos.y) minGeoPos.y = data[i].posLat;
      if (data[i].posLat > maxGeoPos.y) maxGeoPos.y = data[i].posLat;
    }
    var s = 50;
    for(var i=0; i<data.length; i++) {
      if (data[i].posLon == 0 || data[i].posLat == 0) {
        data[i].x = 0.5 + (Math.random() - 0.5) * 0.1;
        data[i].y = 0.5 + (Math.random() - 0.5) * 0.1;
      }
      else {
        data[i].x = (data[i].posLon -  minGeoPos.x)/(maxGeoPos.x - minGeoPos.x);
        data[i].y = (1.0 -(data[i].posLat -  minGeoPos.y)/(maxGeoPos.y - minGeoPos.y));
      }
      data[i].r = 0;
      data[i].targetR = 5;
      data[i].color = self.clusters ? self.clusters[data[i].cluster_id - 1].color : [1,1,1];
      if (clusterCaptionPoints[data[i].cluster_id - 1] == 0) {
        clusterCaptionPoints[data[i].cluster_id - 1] = i;
      }
      clusterCaptionPointsList[data[i].cluster_id - 1].push(i);
    }
    console.log("BluetoothDataSource.scanningPointsComplete");
    //console.log(self.scanningPoints);
    self.emit("scanningPointsComplete", self.scanningPoints);
    self.loadNextScan();
  }, cacheScanningPoints);
}

BluetoothDataSource2011.prototype.loadNextScan = function() {
  if (this.currScanDate.compareTo(this.lastScanDate) >= 0) {
    console.log("end!");
    return;
  }

  var self = this;
  var now = new Date();
  if (this.currScanDate.compareTo(now) > 0) {
    console.log("Waiting for " + this.currScanDate.toString(this.datePrintFormat));
    setTimeout(function() {
      self.loadNextScan();
    }, 60*1000);
    return;
  }

  var dateParam = this.currScanDate.toString(this.dateUrlParamFormat);
  var url = this.serverApiUrl + "?option=devicesInAllScanningPlaces&time=" + dateParam + "&window=00:07:30";
  loadJSONFromUrl(url, function(data) {

    var scanValues = [];

    //console.log("BluetoothDataSource.loadNextScan " + self.currScanDate.toString(self.datePrintFormat) + " - done");

    for(var j in data) {
      scanValues.push(data[j]);
    }

    self.scansData.push({
      date: new Date(self.currScanDate),
      values: scanValues
    });
    self.currScanDate = self.currScanDate.add(15).minutes();
    setTimeout(function() {
      self.loadNextScan();
    }, 1);
  }, cacheScanningPoints);
}

//--------------------------------------------------------------------

function Landscape(scanningPoints) {
  this.scanningPoints = scanningPoints;

  var additionalPoints = 50;
  //additional points
  for(var i=0; i<additionalPoints; i++) {
    this.scanningPoints.push({
      x: Math.random() * 1.5 - 0.25,
      y: Math.random() * 1.5 - 0.25,
    });
  }

  this.triangles = Triangulate(scanningPoints);
  this.points = [];
  this.normals = [];
  this.colors = [];
  this.targetPoins = [];
  var indices = [];
  var lineIndices = [];
  var idx = 0;
  var y = 0;
  var sx = 1.0;
  for(var i in this.triangles) {
    this.points.push((this.triangles[i].v0.x-0.5) * sx);
    this.points.push(y);
    this.points.push(this.triangles[i].v0.y-0.5);

    this.points.push((this.triangles[i].v1.x-0.5) * sx);
    this.points.push(y);
    this.points.push(this.triangles[i].v1.y-0.5);

    this.points.push((this.triangles[i].v2.x-0.5) * sx);
    this.points.push(y);
    this.points.push(this.triangles[i].v2.y-0.5);

    this.colors.push(this.triangles[i].v0.color ? this.triangles[i].v0.color[0] : 0);
    this.colors.push(this.triangles[i].v0.color ? this.triangles[i].v0.color[1] : 0);
    this.colors.push(this.triangles[i].v0.color ? this.triangles[i].v0.color[2] : 0);
    this.colors.push(this.triangles[i].v1.color ? this.triangles[i].v1.color[0] : 0);
    this.colors.push(this.triangles[i].v1.color ? this.triangles[i].v1.color[1] : 0);
    this.colors.push(this.triangles[i].v1.color ? this.triangles[i].v1.color[2] : 0);
    this.colors.push(this.triangles[i].v2.color ? this.triangles[i].v2.color[0] : 0);
    this.colors.push(this.triangles[i].v2.color ? this.triangles[i].v2.color[1] : 0);
    this.colors.push(this.triangles[i].v2.color ? this.triangles[i].v2.color[2] : 0);

    indices.push(idx+0);
    indices.push(idx+1);
    indices.push(idx+2);

    lineIndices.push(idx+0);
    lineIndices.push(idx+1);
    lineIndices.push(idx+1);
    lineIndices.push(idx+2);
    lineIndices.push(idx+2);
    lineIndices.push(idx+0);

    idx += 3;
  }

  for(var i in this.points) {
    this.targetPoins.push(this.points[i]);
    this.normals.push(this.points[i]);
  }

  this.mesh = new Pex.Mesh();
  this.mesh.position.y = -0.1;
  this.mesh.addAttrib("position", this.points);
  this.mesh.addAttrib("normal", this.normals);
  this.mesh.addAttrib("color", this.colors);
  this.mesh.setIndices(indices);

  this.lineMesh = new Pex.Mesh();
  this.lineMesh.position.y = -0.1;
  this.lineMesh.addAttrib("position", this.points);
  this.lineMesh.setIndices(lineIndices);
}

Landscape.prototype.getScanningPointPos = function(idx) {
  var p = this.scanningPoints[idx];
  var j = 0;
  var k = 0;
  for(var i in this.triangles) {
    if (this.triangles[i].v0 == p) {
      k = j;
    }
    if (this.triangles[i].v1 == p) {
      k = j + 3;
    }
    if (this.triangles[i].v2 == p) {
      k = j + 6;
    }
    j += 9;
  }

  return new PreGL.Vec3(
    this.points[k + 0] + this.mesh.position.x,
    this.points[k + 1] + this.mesh.position.y,
    this.points[k + 2] + this.mesh.position.z
  );
}

Landscape.prototype.setTarget = function(scanValues) {
  var j = 0;
  var scale = landscapeScale;
  for(var i in this.triangles) {
    var i0 = this.scanningPoints.indexOf(this.triangles[i].v0);
    var i1 = this.scanningPoints.indexOf(this.triangles[i].v1);
    var i2 = this.scanningPoints.indexOf(this.triangles[i].v2);
    if (i0 < scanValues.length) {
      //this.targetPoins[j + 1] = Math.log(Math.max(scanValues[i0], 1)) * scale;
      this.targetPoins[j + 1] = scanValues[i0] * scale;
    }
    if (i1 < scanValues.length) {
      //this.targetPoins[j + 4] = Math.log(Math.max(scanValues[i1], 1)) * scale;
      this.targetPoins[j + 4] = scanValues[i1] * scale;
    }
    if (i2 < scanValues.length) {
      //this.targetPoins[j + 7] = Math.log(Math.max(scanValues[i2], 1)) * scale;
      this.targetPoins[j + 7] = scanValues[i2] * scale;
    }
    j += 9;
  }
}

Landscape.prototype.update = function() {
  for(var i in this.points) {
    this.points[i] = this.points[i] + (this.targetPoins[i] - this.points[i]) * landscapeMorphSpeed;
  }
  this.mesh.updateAttrib("position", this.points);
  this.lineMesh.updateAttrib("position", this.points);

  for(var j=0; j<this.points.length; j+=3) {
    var a = new PreGL.Vec3(this.points[(j+0)*3+0], this.points[(j+0)*3+1], this.points[(j+0)*3+2]);
    var b = new PreGL.Vec3(this.points[(j+1)*3+0], this.points[(j+1)*3+1], this.points[(j+1)*3+2]);
    var c = new PreGL.Vec3(this.points[(j+2)*3+0], this.points[(j+2)*3+1], this.points[(j+2)*3+2]);
    var ab = b.subbed(a);
    var ac = c.subbed(a);
    var n = new PreGL.Vec3(0, 0, 0);
    n.cross2(ab, ac);
    n.normalize();
    for(var k=0; k<3; k++) {
      this.normals[(j+k)*3+0] = n.x;
      this.normals[(j+k)*3+1] = n.y;
      this.normals[(j+k)*3+2] = n.z;
    }
  }

  this.mesh.updateAttrib("normal", this.normals);
}

Landscape.prototype.draw = function(shader, lineShader, camera) {
  this.update();

   shader.bind();
   shader.set("color", [1, 0.45, 0, 1]);
   this.mesh.draw(shader, camera);

   lineShader.bind();
   var c = 0.3;
   lineShader.set("color", [c, c, c, c]);
   this.lineMesh.draw(lineShader, camera, gl.LINES);
}

//--------------------------------------------------------------------

function CameraOrbiter(perspectiveCamera) {
  this.camera = perspectiveCamera;
  this.distance = perspectiveCamera.target.subbed(perspectiveCamera.position).length();
  this.position = new PreGL.Vec3(0, 0, 0);
  this.setPosition(this.position);
}

CameraOrbiter.prototype.getPosition = function() {
  return this.position;
}

CameraOrbiter.prototype.setPosition = function(pos) {
  this.position = pos;
  var theta = this.position.y / 180 * Math.PI;
  var phi = this.position.x / 180 * Math.PI;
  this.camera.position.x = this.distance * Math.sin(theta) * Math.sin(phi);
  this.camera.position.y = this.distance * Math.cos(theta);
  this.camera.position.z = this.distance * Math.sin(theta) * Math.cos(phi);
  this.camera.updateMatrices();
}

//--------------------------------------------------------------------

function MeshCrawler(meshGraph) {
  this.graph = meshGraph;
  this.mesh = new Pex.Mesh();
  this.pointIndices = [];
  this.stepTime = 0;
  this.stepLength = 0.3;
  this.randomMode = false;
  var positions = [];
  var index = 0;//Math.floor(Math.random() * meshGraph.length);
  var prevIndex = -1;
  var prevPrevIndex = -1;
  for(var i=0; i<3; i++) {
    this.pointIndices.push(index);
    positions.push(meshGraph[index].pos.x);
    positions.push(meshGraph[index].pos.y);
    positions.push(meshGraph[index].pos.z);
    prevPrevIndex = prevIndex;
    prevIndex = index;
    index = meshGraph[index].neighbours[0];
    if (prevPrevIndex == index) {
      index = meshGraph[prevIndex].neighbours[1];
    }
  }
  this.mesh.addAttrib("position", positions, 3);
  this.mesh.setIndices([0,1,1,2]);
}

MeshCrawler.prototype.update = function(points, deltaTime) {
  this.stepTime += deltaTime;
  if (this.stepTime > this.stepLength) {
    this.stepTime = 0;
    var index = this.pointIndices[2];
    var prevPrevIndex = this.pointIndices[1];
    var prevIndex = this.pointIndices[0];
    var newIndex = prevPrevIndex;
    while(newIndex == prevPrevIndex) {
      var n = Math.floor(Math.random() * this.graph[index].neighbours.length);
      newIndex = this.graph[index].neighbours[n];
    }
    if (this.randomMode) {
      newIndex = Math.floor(Math.random() * points.length/3);
    }
    this.pointIndices.shift();
    this.pointIndices.push(newIndex);
  }
  var positions = [];
  var i0 = this.pointIndices[0] * 3;
  var i1 = this.pointIndices[1] * 3;
  var i2 = this.pointIndices[2] * 3;
  //var k01 = (this.stepTime < this.stepLength/2) ? this.stepTime/(this.stepLength/2): 1;
  //var k12 = (this.stepTime < this.stepLength/2) ? 0 : (this.stepTime - this.stepLength/2)/(this.stepLength/2);
  var k = this.stepTime/this.stepLength;
  positions.push(points[i0  ] + (points[i1  ] - points[i0  ]) * k);
  positions.push(points[i0+1] + (points[i1+1] - points[i0+1]) * k);
  positions.push(points[i0+2] + (points[i1+2] - points[i0+2]) * k);
  positions.push(points[i1  ]);
  positions.push(points[i1+1]);
  positions.push(points[i1+2]);
  positions.push(points[i1  ] + (points[i2  ] - points[i1  ]) * k);
  positions.push(points[i1+1] + (points[i2+1] - points[i1+1]) * k);
  positions.push(points[i1+2] + (points[i2+2] - points[i1+2]) * k);

  this.mesh.updateAttrib("position", positions);
}

//--------------------------------------------------------------------

function BgSphere() {
  if (!BgSphere.pointerMesh) {
    var mesh = Pex.Mesh.buildSphere(1.5);
    BgSphere.pointerMesh = mesh;
  }
  if (!BgSphere.pointerShader) {
    BgSphere.pointerShader = new Pex.Shader(
      fs.readFileSync('shaders/basic.vert', 'utf8'),
      fs.readFileSync('shaders/solidColor.frag', 'utf8')
    )
  }
}

BgSphere.prototype.draw = function(camera) {
  BgSphere.pointerShader.bind();
  BgSphere.pointerShader.set("color", [0.51, 0.51, 0.51, 1]);
  //BgSphere.pointerMesh.rotation.y = 1;
  //BgSphere.pointerMesh.rotation.w -= 10;
  BgSphere.pointerMesh.draw(BgSphere.pointerShader, camera, gl.LINES);
}

//--------------------------------------------------------------------

function Label(str, landscape, pointIndex, point) {
  this.str = str;
  this.landscape = landscape;
  this.pointIndex = pointIndex;
  this.point = point;
  if (!Label.pointerMesh) {
    var mesh = new Pex.Mesh();
    mesh.addAttrib("position", [0, 0, 0, 0, 1, 0], 3);
    mesh.setIndices([0, 1]);
    Label.pointerMesh = mesh;
  }
  if (!Label.pointerShader) {
    Label.pointerShader = new Pex.Shader(
      fs.readFileSync('shaders/basic.vert', 'utf8'),
      fs.readFileSync('shaders/solidColor.frag', 'utf8')
    )
  }
  if (!Label.textMesh) {
    Label.textMesh = Pex.Mesh.buildPlaneXY(0.2, 0.025, 2, 2);
  }
  if (!Label.textShader) {
    Label.textShader = new Pex.Shader(
      fs.readFileSync('shaders/textured.vert', 'utf8'),
      fs.readFileSync('shaders/textured.frag', 'utf8')
    )
  }

  var canvas = new plask.SkCanvas.create(256, 32);
  var paint = new plask.SkPaint();

  paint.setStyle(paint.kFillStyle);
  paint.setFlags(paint.kAntiAliasFlag);
  paint.setTextSize(24);
  paint.setFontFamily('Helvetica');
  paint.setStrokeWidth(0);  // Scale invariant.
  paint.setColor(255, 255, 255, 255);

  canvas.drawColor(0, 0, 0, 0, paint.kClearMode); //transparent
  canvas.drawText(paint, str, 10, 32);

  this.tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2DSkCanvas(gl.TEXTURE_2D, 0, canvas);
  gl.generateMipmap(gl.TEXTURE_2D);

  canvas.dispose();
}

/*
vec3 camPos = vec3(0, 0, -1000);
//vec3 r = vec3(invModelViewMatrix[0].x, invModelViewMatrix[0].y, invModelViewMatrix[0].z);
//vec3 u = vec3(invModelViewMatrix[1].x, invModelViewMatrix[1].y, invModelViewMatrix[1].z);
vec3 r = vec3(1, 0, 0);
vec3 u = vec3(0, 1, 0);
vec3 dir(0,0,-1);

for(int i=0; i<positions.size(); i++) {
	vec3 pos = positions[i];
	camPos = vec3(0, 0, pos.z);
	vec3 objToCamProj = normalize(vec3(camPos.x - pos.x, 0, camPos.z - pos.z));
	vec3 lookAt = vec3(0,0,1);
	vec3 auxUp = cross(lookAt, objToCamProj);
	float angleCosine = dot(lookAt, objToCamProj);
	mat4 m = mat4::identityMatrix();
	if ((angleCosine < 0.99990) && (angleCosine > -0.9999)) {
		m *= mat4::rotationMatrix(auxUp, acos(angleCosine)*180/3.14);
	}
	vec3 objToCam = normalize(camPos - pos);
	angleCosine = dot(objToCamProj,objToCam);

	if ((angleCosine < 0.99990) && (angleCosine > -0.9999)) {
		if (objToCam[1] < 0) {
			m *= mat4::rotationMatrix(vec3(1,0,0), acos(angleCosine)*180/3.14);
		}
		else {
			m *= mat4::rotationMatrix(vec3(-1,0,0), acos(angleCosine)*180/3.14);
		}
	}

	normalBuf[i*4+0] = m * (- (r + u) * vec3(size*stretch, size, size));
	normalBuf[i*4+1] = m * (  (r - u) * vec3(size*stretch, size, size));
	normalBuf[i*4+2] = m * (  (r + u) * vec3(size*stretch, size, size));
	normalBuf[i*4+3] = m * (- (r - u) * vec3(size*stretch, size, size));

	positionBuf[i*4+0] = pos + normalBuf[i*4+0];
	positionBuf[i*4+1] = pos + normalBuf[i*4+1];
	positionBuf[i*4+2] = pos + normalBuf[i*4+2];
	positionBuf[i*4+3] = pos + normalBuf[i*4+3];
}
*/

Label.prototype.draw = function(camera) {
  Label.pointerShader.bind();
  Label.pointerShader.set("color", this.point.color);
  var pointPos = this.landscape.getScanningPointPos(this.pointIndex);
  //pointPos.x = this.point.x - 0.5;
  //pointPos.y = 0.1;
  //pointPos.z = this.point.y - 0.5;
  Label.pointerMesh.updateAttrib("position", [pointPos.x, pointPos.y, pointPos.z, pointPos.x, pointPos.y+0.1, pointPos.z]);
  Label.pointerMesh.draw(Label.pointerShader, camera, gl.LINES);

  gl.enable(gl.BLEND);
  gl.disable(gl.DEPTH_TEST);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  Label.textShader.bind();
  Label.textShader.set("texture", 0, this.tex);
  Label.textShader.set("color", this.point.color);
  Label.textShader.set("color", [1,1,1,1]);

  Label.textMesh.position.x = pointPos.x;
  Label.textMesh.position.y = pointPos.y + 0.1;
  Label.textMesh.position.z = pointPos.z;
  Label.textMesh.draw(Label.textShader, camera);
  gl.disable(gl.BLENDING);
  gl.enable(gl.DEPTH_TEST);
}

//--------------------------------------------------------------------

plask.simpleWindow({
  settings: {
    width: 1440,
    height: 900,
    type: '3d',  // Create an OpenGL window.
    vsync: true,  // Prevent tearing.
    multisample: true,  // Anti-alias.
    fullscreen: false,
    center: false
  },
  bluetoothDataSource: null,
  landscape: null,
  landscapeShader: null,
  landscapeLineShader: null,
  camera: null,
  scanDataIndex: 0,
  drawRectCamera: null,
  drawRectMesh: null,
  drawRectShader: null,
  drawImageTexture: null,
  titleCanvas: null,
  titlePaint: null,
  labelCanvas: null,
  labelPaint: null,
  labels: null,
  bgSphere: null,
  mousePos: {x:0, y:0},
  fadeoutTotalTime: 4,
  fadeoutTime: 0,
  fading: false,
  drawRect: function(x, y, w, h) {
    if (!this.drawRectMesh) {
      this.drawRectMesh = new Pex.Mesh.buildPlane2D(10, 10, 100, 100);
    }
    else {
      var vertices = [];
      vertices.push(x);
      vertices.push(y);
      vertices.push(x);
      vertices.push(y + h);
      vertices.push(x + w);
      vertices.push(y + h);
      vertices.push(x + w);
      vertices.push(y);
      this.drawRectMesh.updateAttrib("position", vertices);
    }
    if (!this.drawRectShader) {
      this.drawRectShader = new Pex.Shader(
        fs.readFileSync('shaders/flat.vert', 'utf8'),
        fs.readFileSync('shaders/flat.frag', 'utf8')
      )
    }
    if (!this.drawRectCamera) {
      this.drawRectCamera = new Pex.OrthographicCamera(this.width, this.height);
    }

    this.drawRectShader.bind();
    this.drawRectShader.set("texture", 0);
    this.drawRectMesh.draw(this.drawRectShader, this.drawRectCamera);
  },
  drawColorRect: function(color, x, y, w, h) {
    if (!this.drawRectMesh) {
      this.drawRectMesh = new Pex.Mesh.buildPlane2D(10, 10, 100, 100);
    }
    else {
      var vertices = [];
      vertices.push(x);
      vertices.push(y);
      vertices.push(x);
      vertices.push(y + h);
      vertices.push(x + w);
      vertices.push(y + h);
      vertices.push(x + w);
      vertices.push(y);
      this.drawRectMesh.updateAttrib("position", vertices);
    }
    if (!this.drawColorRectShader) {
      this.drawColorRectShader = new Pex.Shader(
        fs.readFileSync('shaders/flat.vert', 'utf8'),
        fs.readFileSync('shaders/solidColor.frag', 'utf8')
      )
    }
    if (!this.drawRectCamera) {
      this.drawRectCamera = new Pex.OrthographicCamera(this.width, this.height);
    }

    this.drawColorRectShader.bind();
    this.drawColorRectShader.set("color", color);
    this.drawRectMesh.draw(this.drawColorRectShader, this.drawRectCamera);
  },
  drawImage: function(canvas, x, y, w, h) {
    //var canvas = new plask.SkCanvas('lena.jpg');
    w = w || canvas.width;
    h = h || canvas.height;
    if (!this.drawImageTexture) {

      this.drawImageTexture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.drawImageTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      //this.drawImageTexture = Pex.Texture2D.genNoise(128, 128);
      //this.drawImageTexture = gl.createTexture();
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.drawImageTexture);
    //console.log(canvas.width + " " + canvas.height);
    //gl.texImage2DSkCanvas(gl.TEXTURE_2D, 0, canvas); //NoFlip

    gl.texImage2DSkCanvasNoFlip(gl.TEXTURE_2D, 0, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.drawRect(x, y, w, h);
    gl.bindTexture(gl.TEXTURE_2D, 0);
  },
  init: function() {
    gl = this.gl;
    var self = this;
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 1.0);

    this.framerate(30);
    Pex.Time.init();

    this.bluetoothDataSource = new BluetoothDataSource2011();
    this.bluetoothDataSource.on("scanningPointsComplete", function(points) {
      self.landscape = new Landscape(points);
    });
    this.bluetoothDataSource.loadClusters();

    this.camera = new Pex.PerspectiveCamera(90, this.width / this.height, 0.1, 100);
    this.camera.position = new PreGL.Vec3(0, 0.5, 1.);
    this.camera.target = new PreGL.Vec3(0, 0, 0);
    this.camera.updateMatrices();
    this.cameraOrbiter = new CameraOrbiter(this.camera);
    this.cameraOrbiter.distance = 1;

    this.landscapeShader = new Pex.Shader(
      fs.readFileSync('shaders/landscape.vert', 'utf8'),
      fs.readFileSync('shaders/landscape.frag', 'utf8')
    );
    this.landscapeLineShader = new Pex.Shader(
      fs.readFileSync('shaders/basic.vert', 'utf8'),
      fs.readFileSync('shaders/solidColor.frag', 'utf8')
    );

    this.titleCanvas = new plask.SkCanvas.create(1024, 256);
    this.titlePaint = new plask.SkPaint();
    this.titlePaint.setStyle(this.titlePaint.kFillStyle);
    this.titlePaint.setFlags(this.titlePaint.kAntiAliasFlag);
    this.titlePaint.setTextSize(16);
    this.titlePaint.setFontFamily('Helvetica');
    this.titlePaint.setStrokeWidth(0);  // Scale invariant.
    this.titlePaint.setColor(255, 255, 255, 255);

    this.labelCanvas = new plask.SkCanvas.create(128, 16);
    this.labelPaint = new plask.SkPaint();
    this.labelPaint.setStyle(this.titlePaint.kFillStyle);
    this.labelPaint.setFlags(this.titlePaint.kAntiAliasFlag);
    this.labelPaint.setTextSize(12);
    this.labelPaint.setFontFamily('Helvetica');
    this.labelPaint.setStrokeWidth(0);  // Scale invariant.
    this.labelPaint.setColor(255, 255, 255, 255);

    this.tweetCanvas = new plask.SkCanvas.create(350, 150);
    this.tweetPaint = new plask.SkPaint();
    this.tweetPaint.setStyle(this.titlePaint.kFillStyle);
    this.tweetPaint.setFlags(this.titlePaint.kAntiAliasFlag);
    this.tweetPaint.setTextSize(14);
    this.tweetPaint.setFontFamily('Helvetica');
    this.tweetPaint.setStrokeWidth(0);  // Scale invariant.
    this.tweetPaint.setColor(255, 255, 255, 255);

    this.tweetTitlePaint = new plask.SkPaint();
    this.tweetTitlePaint.setStyle(this.titlePaint.kFillStyle);
    this.tweetTitlePaint.setFlags(this.titlePaint.kAntiAliasFlag);
    this.tweetTitlePaint.setTextSize(16);
    this.tweetTitlePaint.setFontFamily('Helvetica');
    this.tweetTitlePaint.setStrokeWidth(0);  // Scale invariant.
    this.tweetTitlePaint.setColor(255, 80, 0, 255);

    this.on('mouseMoved', function(e) {
      this.mousePos.x = e.x;
      this.mousePos.y = e.y;
    });

    this.twitterDataSource = new TwitterDataSource();
  },
  updateTitle: function(latestScan, progress) {
    this.titleCanvas.drawColor(0, 0, 0, 0, this.titlePaint.kClearMode); //transparent

    this.titlePaint.setTextSize(30);
    this.titlePaint.setColor(255, 80, 0, 255);
    this.titleCanvas.drawText(this.titlePaint, "ROSKILDE FESTIVAL ACTIVITY", 20, 35);

    this.titlePaint.setTextSize(16);
    this.titlePaint.setColor(255, 255, 255, 255);
    this.titleCanvas.drawText(this.titlePaint, "NUMBER OF MOBILE PHONES WITH ACTIVE BLUETOOTH", 20, 55);

    this.titlePaint.setColor(255, 255, 255, 255);
    this.titlePaint.setTextSize(56);
    this.titleCanvas.drawText(this.titlePaint, latestScan.date.getDayName() + " @ " + latestScan.date.toString("H:mm"), 20, 120);
    this.titlePaint.setTextSize(8);
    this.titlePaint.setColor(255, 255, 255, 100);
    this.titleCanvas.drawRect(this.titlePaint, 5, 17, 6, 123);
    this.titlePaint.setColor(255, 255, 255, 255);
    this.titleCanvas.drawRect(this.titlePaint, 5, 17, 6, 17 + (123 - 17) * progress);
    this.titlePaint.setColor(255, 255, 255, 255);
  },
  nextTweet: null,
  nextTweetTime: 0,
  nextTweetTotalTime: 5,
  updateTweet: function() {
    if (this.nextTweetTime > 0) {
      this.nextTweetTime += Pex.Time.delta;
    }

    if (this.nextTweetTime > this.nextTweetTotalTime) {
      this.nextTweet.image.dispose();
      this.nextTweet = null;
    }
    if (this.twitterDataSource && this.twitterDataSource.tweets && this.twitterDataSource.tweets.length > 0) {
      if (!this.nextTweet) {
        //console.log("Getting next tweet");
        this.nextTweetTime = 0;
        var randomIndex = Math.floor(this.twitterDataSource.tweets.length * Math.random());
        this.nextTweet = this.twitterDataSource.tweets[randomIndex];
        var self = this;
        loadImage(this.nextTweet.user_photo, function(path) {
          try {
            //console.log("Creating image");
            self.nextTweet.image = plask.SkCanvas.createFromImage(path);
            self.nextTweetTime = 0.01;
          }
          catch(e) {
            console.log("Image error - restart");
            self.nextTweet = null;
            self.nextTweetTime = 0;
          }
        });
      }
    }
    this.tweetCanvas.drawColor(0, 0, 0, 0, this.titlePaint.kClearMode); //transparent
    this.tweetCanvas.drawColor(0, 0, 0, 50);
    if (this.nextTweet && this.nextTweet.image) {
      this.tweetCanvas.drawText(this.tweetTitlePaint, this.nextTweet.username, 10, 20);
      this.tweetCanvas.drawCanvas(this.tweetPaint, this.nextTweet.image, 10, 30, 10+48, 30+48);
      var txt = decodeURIComponent(this.nextTweet.text);
      var dy = 40;
      while(txt.length > 40) {
        var n = Math.min(txt.length, 40)
        var t = txt.substr(0, n).trim(" ");
        this.tweetCanvas.drawText(this.tweetPaint, t, 70, dy);
        txt = txt.substr(n);
        dy += 20;
      }
      this.tweetCanvas.drawText(this.tweetPaint, txt, 70, dy);
    }
  },
  drawLabels: function() {
    var pos = this.mousePos;
    for(var i=0; i<clusterCaptionPoints.length; i++) {
      var scanningPointPos = new PreGL.Vec3(0, 0, 0);
      for(var j=0; j<clusterCaptionPointsList[i].length; j++) {
        var idx = clusterCaptionPointsList[i][j];
        var pos = this.landscape.getScanningPointPos(idx);
        scanningPointPos.add(pos);
      }

      scanningPointPos.scale(1/clusterCaptionPointsList[i].length);
      //scanningPointPos = this.landscape.getScanningPointPos(clusterCaptionPoints[i]);

      if (i == 5) {
        scanningPointPos.x -= 0.05;
        scanningPointPos.z -= 0.05;
      }
      scanningPointPos.y = 0; //prevent jumping
      pos = this.camera.getScreenPos(scanningPointPos, this.width, this.height);
      //this.labelCanvas.drawColor(clusterColors[i][0], clusterColors[i][1], clusterColors[i][2], 255);
      this.labelCanvas.drawColor(0, 0, 0, 0, this.labelPaint.kClearMode); //transparent
      this.labelPaint.setColor(clusterColors[i][0], clusterColors[i][1], clusterColors[i][2], 255);
      this.labelCanvas.drawRect(this.labelPaint, 0, 0, clusterCaptionWidth[i] + 1, 16);
      //console.log("clusterTextColors.length: " + clusterTextColors.length + " <- " + i);
      this.labelPaint.setColor(clusterTextColors[i][0], clusterTextColors[i][1], clusterTextColors[i][2], 255)
      //this.labelPaint.setColor(255, 255, 255, 255)
      this.labelCanvas.drawText(this.labelPaint, clusterNames[i].toUpperCase(), 6, 12);
      //this.drawRect(pos.x, pos.y, 5, 5);
      this.drawImage(this.labelCanvas, pos.x - this.labelCanvas.width/3, pos.y);
    }
  },
  draw: function() {
    Pex.Time.update();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    if (this.cameraOrbiter) {
      var orbiterPosition = this.cameraOrbiter.getPosition();
      orbiterPosition.x += Pex.Time.delta * 10;
      orbiterPosition.y = 65 + Math.sin(Pex.Time.seconds) * 10;
      this.cameraOrbiter.setPosition(orbiterPosition);
    }

    if (this.landscape) {
        if (!this.scansData || this.scansData.length == 0) {
          this.scansData = this.bluetoothDataSource.scansData;
        }
        if (this.scansData.length > 0 && Pex.Time.frameNumber % framesPerIteration == 0 && this.scanDataIndex < this.scansData.length) {
          var firstScan = this.scansData[0];
          var latestScan = this.scansData[this.scanDataIndex];
          var newestScan = this.scansData[this.scansData.length - 1];
          var totalTimeSpan = new TimeSpan(newestScan.date - firstScan.date);
          var totalHours = (totalTimeSpan.getDays() * 24 + totalTimeSpan.getHours());

          //console.log("ScanDataIndex: " + this.scanDataIndex + "/" + this.scansData.length);
          var displayedTimeSpan = new TimeSpan(this.scansData[this.scanDataIndex].date - firstScan.date);
          var displayedHours = (displayedTimeSpan.getDays() * 24 + displayedTimeSpan.getHours());

          var timeSpan = new TimeSpan(new Date() - latestScan.date);
          var hoursToNow = (timeSpan.getDays() * 24 + timeSpan.getHours());
          if (hoursToNow > 6) {
            framesPerIteration = minFramesPerIteration;
            landscapeMorphSpeed = maxLandscapeMorphSpeed;
          }
          else {
            framesPerIteration = maxFramesPerInteration;
            landscapeMorphSpeed = minLandscapeMorphSpeed;
          }

          var newestScan = this.scansData[this.scansData.length - 1];
          this.landscape.setTarget(latestScan.values);
          //this.updateTitle(latestScan, displayedHours/totalHours);

          this.scanDataIndex++;
        }

        this.landscapeShader.bind();
        this.landscape.draw(this.landscapeShader, this.landscapeLineShader, this.camera);

        if (!this.bgSphere) {
          this.bgSphere = new BgSphere();
        }
        this.bgSphere.draw(this.camera);
    }

    this.updateTweet();

    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    this.drawImage(this.titleCanvas, 50, 50);
    this.drawImage(this.tweetCanvas, 700, 60);

    if (this.landscape) {
      this.drawLabels();
    }

    if (this.scanDataIndex == this.scansData.length) {
      this.fading = true;
    }

    if (this.fading) {
      var fadeOutAlpha = 0;
      this.fadeoutTime += Pex.Time.delta;
      if (this.fadeoutTime < this.fadeoutTotalTime) {
        fadeOutAlpha = this.fadeoutTime/this.fadeoutTotalTime
      }
      else if (this.fadeoutTime < this.fadeoutTotalTime * 2) {
        this.scanDataIndex = 0;
        this.scansData = this.bluetoothDataSource.scansData;
        fadeOutAlpha = 1.0 - (this.fadeoutTime - this.fadeoutTotalTime)/this.fadeoutTotalTime;
      }
      else {
        this.fadeoutTime = 0;
        this.fading = false;
      }

      gl.blendFunc(gl.ONE_MINUS_SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      this.drawColorRect([0, 0, 0, fadeOutAlpha], 0, 0, this.width, this.height);
    }
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
  }
});