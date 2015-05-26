module.exports.sequence = function(start, end) {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  var result = [];
  for(var i=start; i<end; i++) {
    result.push(i);
  }
  return result;
};

module.exports.get = function(prop) {
  return function(o) {
    return o[prop];
  }
}

module.exports.notNull = function(o) {
  return o != null;
}

module.exports.trimToSlash = function(s) {
  return s.substr(s.lastIndexOf('/')+1);
}

module.exports.join = function(separator) {
  return function(list) {
    return list.join(separator);
  }
}

module.exports.last = function(list) {
  return list[list.length-1];
}

module.exports.first = function(list) {
  return list[0];
}

module.exports.zipMap = function(keys, values) {
  var map = {};
  keys.forEach(function(key, index) {
    map[key] = values[index];
  });
  return map;
};

module.exports.values = function(obj) {
  var result = [];
  for(var propertyName in obj) {
    result.push(obj[propertyName]);
  }
  return result;
};

module.exports.keys = function(obj) {
  var result = [];
  for(var propertyName in obj) {
    result.push(propertyName);
  }
  return result;
};

module.exports.flatten = function(list) {
  var result = [];
  for(var i=0; i<list.length; i++) {
    if (Array.isArray(list[i])) {
      result = result.concat(list[i]);
    }
    else {
      result.push(list[i]);
    }
  }
  return result;
};

module.exports.toNumber = function(value) {
  return Number(value);
}

module.exports.partition = function(list, count) {
  var result = [];
  var i = 0;
  while (i < list.length) {
    var step = 0;
    var group = [];
    while (step < count && i < list.length) {
      step++;
      group.push(list[i]);
      i++;
    }
    result.push(group);
  }
  return result;
};

module.exports.zip = function(lista, listb) {
  var result = [];
  var len = Math.min(lista.length, listb.length);
  for(var i=0; i<len; i++) {
    result.push([lista[i], listb[i]]);
  }
  return result;
}

module.exports.getValuesAt = function(list, indices) {
  return indices.map(function(i) {
    return list[i];
  });
}

module.exports.unique = function(list) {
  var results = [];
  list.forEach(function(value) {
    if (results.indexOf(value) == -1) {
      results.push(value);
    }
  });
  return results;
}

module.exports.countValues = function(list) {
  var resultsMap = {};
  list.forEach(function(value) {
    if (!resultsMap[value]) {
      resultsMap[value] = 0;
    }
    resultsMap[value]++;
  });
  return resultsMap;
}

module.exports.groupBy = function(list, prop) {
  var groups = {};
  list.forEach(function(item) {
    var value = item[prop];
    if (!groups[value]) groups[value] = [];
    groups[value].push(item);
  })
  return groups;
}

module.exports.forEachTwo = function(list, cb) {
  var n = list.length;
  for(var i=0; i<n; i+=2) {
    if (i + 2 < n) {
      cb(list[i], list[i+1]);
    }
  }
}

module.exports.forEachAndNext = function(list, cb) {
  var n = list.length;
  for(var i=0; i<n; i++) {
    if (i + 2 < n) {
      cb(list[i], list[i+1]);
    }
  }
}

module.exports.min = function(a, b) {
  return Math.min(a, b);
}

module.exports.max = function(a, b) {
  return Math.max(a, b);
}