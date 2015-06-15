function forEachKeyValue(obj, cb) {
  Object.keys(obj).forEach(function(key) {
    cb(key, obj[key]);
  })
}

module.exports = forEachKeyValue;
