function forEachKeyValue(obj, cb) {
  var index = 0;
  Object.keys(obj).forEach(function(key) {
    cb(key, obj[key], index++);
  })
}

module.exports = forEachKeyValue;
