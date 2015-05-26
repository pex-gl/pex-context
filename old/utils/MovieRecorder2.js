var sys = require('pex-sys');
var glu = require('pex-glu');
var fs = require('fs');

var Time = sys.Time;
var IO = sys.IO;
var Context = glu.Context;

function MovieRecorder(path) {
  this.fps = 30;
  this.path = IO.getWorkingDirectory() + '/' + path;
  this.recordingPath = this.path;
  this.recording = false;
  this.frameNum = 0;
  this.totalTime = 0;
}

MovieRecorder.prototype.start = function () {
  this.recording = true;
  this.frameNum = 0;
  this.totalTime = 0;
  var path = this.path + '/' + this.getDateStr();
  console.log('Starting recording to ' + path);
  this.recordingPath = path;
  this.preparePath();
};

MovieRecorder.prototype.getDateStr = function () {
  var d = new Date();
  var dateStr = '';
  dateStr += d.getFullYear();
  dateStr += (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1);
  dateStr += (d.getDate() < 10 ? '0' : '') + d.getDate();
  dateStr += '-';
  dateStr += (d.getHours() < 10 ? '0' : '') + d.getHours();
  dateStr += (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  dateStr += (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
  return dateStr;
};

MovieRecorder.prototype.preparePath = function () {
  if (!fs.existsSync(this.path)) {
    console.log(this.path);
    fs.mkdirSync(this.path, 493);
  }
  fs.mkdirSync(this.recordingPath, 493);
};

MovieRecorder.prototype.getFramePath = function (frameNum, fileFormat) {
  var frameStr = '' + frameNum;
  var frameNumLen = 6;
  while (frameStr.length < frameNumLen) {
    frameStr = '0' + frameStr;
  }
  return this.recordingPath + '/' + frameStr + '.' + fileFormat;
};

MovieRecorder.prototype.stop = function () {
  this.recording = false;
};

MovieRecorder.prototype.isRecording = function () {
  return this.recording;
};

MovieRecorder.prototype.update = function () {
  if (!this.recording)
    return;
  //if (!this.recording) return;
  Time.delta = 1 / 30;
  this.totalTime += 1 / 30;
  Time.seconds = this.totalTime;
  if (this.recording)
    console.log(this.totalTime);
};

MovieRecorder.prototype.capture = function (fileFormat) {
  fileFormat = fileFormat || 'png';
  if (!this.recording)
    return;
  var frameFileName = this.getFramePath(this.frameNum++, fileFormat);
  var gl = Context.currentContext;
  if (this.frameNum >= 0) {
    gl.writeImage(fileFormat, frameFileName);
  }
};

module.exports = MovieRecorder;