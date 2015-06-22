var loadText = require('./loadText');

function loadJSON(url, callback) {
  loadText(url, function(err, data) {
    if (err) {
      callback(err, null);
    }
    else {
      try {
        var json = JSON.parse(data);
        callback(null, json);
      }
      catch(e) {
        callback(e.toString(), null);
      }
    }
  })
}

module.exports = loadJSON;
