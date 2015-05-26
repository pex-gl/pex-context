var fs = require('fs');
var util = require('util');
var stream = require('stream');
var es = require('event-stream');

function loadTXTByLine(file, callback, endCallback, limit) {
  var lineNumber = 0;
  var s = fs.createReadStream(file)
  .pipe(es.split())
  .pipe(es.mapSync(function(line) {
      ++lineNumber;
      s.pause();
      if (callback(line, lineNumber) === false) {
        return;
      }
      s.resume();

      if (limit && lineNumber >= limit) {
        s.end();
      }
    })
    .on('error', function(){
      console.log('loadTXTByLine error while reading file ' + file);
    })
    .on('end', function(){
      console.log('loadTXTByLine done reading ' + file);
      endCallback();
    })
  )
}

module.exports = loadTXTByLine;