define(["fs", "path"], function(fs, path) {
  
  function FileScanner() {
    this.verbose = false;
    this.skipHiddenFiles = true;
    this.recursive = true;
    this.directoriesToScan = [];
    this.files = [];
  }
  
  FileScanner.prototype.scan = function(dir) {
    this.directoriesToScan.push(dir);
    this.scanNextDir();
    return this.files;
  }
  
  FileScanner.prototype.scanDir = function(dir, filter) {
    if (this.verbose) console.log("scanning " + dir);
    var files = fs.readdirSync(dir);

    for(var i=0; i<files.length; i++) {
      var file = dir + "/" + files[i];
      var stats = fs.statSync(file);
      if (stats.isDirectory() && this.recursive) {
        this.directoriesToScan.push(file);
      }
      else if (stats.isFile()) {
        this.scanFile(file, filter);
      }
    }
    this.scanNextDir();
  }

  FileScanner.prototype.scanFile = function(file) {
    if (this.verbose) console.log(file);
    if (this.skipHiddenFiles && path.basename(file).indexOf(".") == 0) {
      console.log("Skipping " + file);
      return;
    }
    this.files.push(file);
  }

  FileScanner.prototype.scanNextDir = function() {
    if (this.directoriesToScan.length == 0) {
      if (this.verbose) console.log("done");    
      return;
    }
    var dir = this.directoriesToScan.shift();
    this.scanDir(dir);
  }  
  
  return FileScanner;
});