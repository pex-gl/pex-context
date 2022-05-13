import { a as anObject, b as aCallable, f as functionCall, _ as _export } from './iterators-80846cd5.js';

// https://github.com/tc39/collection-methods
var collectionDeleteAll = function deleteAll(/* ...elements */) {
  var collection = anObject(this);
  var remover = aCallable(collection['delete']);
  var allDeleted = true;
  var wasDeleted;
  for (var k = 0, len = arguments.length; k < len; k++) {
    wasDeleted = functionCall(remover, collection, arguments[k]);
    allDeleted = allDeleted && wasDeleted;
  }
  return !!allDeleted;
};

// `Map.prototype.emplace` method
// https://github.com/thumbsupep/proposal-upsert
var mapEmplace = function emplace(key, handler) {
  var map = anObject(this);
  var get = aCallable(map.get);
  var has = aCallable(map.has);
  var set = aCallable(map.set);
  var value = (functionCall(has, map, key) && 'update' in handler)
    ? handler.update(functionCall(get, map, key), key, map)
    : handler.insert(key, map);
  functionCall(set, map, key, value);
  return value;
};

// `WeakMap.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'WeakMap', proto: true, real: true, forced: true }, {
  deleteAll: collectionDeleteAll
});

// `WeakMap.prototype.emplace` method
// https://github.com/tc39/proposal-upsert
_export({ target: 'WeakMap', proto: true, real: true, forced: true }, {
  emplace: mapEmplace
});

export { collectionDeleteAll as c, mapEmplace as m };
