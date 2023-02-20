import { z as getBuiltIn, _ as _export, g as getIteratorDirect, a as aCallable, m as anObject, n as functionCall, v as isObject, R as asyncIteratorClose, p as functionBindContext, w as wellKnownSymbol, L as objectCreate, u as objectDefineProperty } from './common/classof-a3d4c9bc.js';
import { i as iterate } from './common/iterate-54b5a051.js';
import typedArrayConcat from './typed-array-concat.js';
import { c as collectionDeleteAll, m as mapEmplace } from './common/map-emplace-0ed8f736.js';
import { s as speciesConstructor, a as arrayIterationFromLast } from './common/esnext.typed-array.with-b6f846b8.js';
import './common/object-set-prototype-of-eadd3696.js';

// https://github.com/tc39/proposal-iterator-helpers









var Promise = getBuiltIn('Promise');
var $TypeError = TypeError;

_export({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    var record = getIteratorDirect(this);
    var iterator = record.iterator;
    var next = record.next;
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    var counter = 0;
    aCallable(reducer);

    return new Promise(function (resolve, reject) {
      var ifAbruptCloseAsyncIterator = function (error) {
        asyncIteratorClose(iterator, reject, error, reject);
      };

      var loop = function () {
        try {
          Promise.resolve(anObject(functionCall(next, iterator))).then(function (step) {
            try {
              if (anObject(step).done) {
                noInitial ? reject($TypeError('Reduce of empty iterator with no initial value')) : resolve(accumulator);
              } else {
                var value = step.value;
                if (noInitial) {
                  noInitial = false;
                  accumulator = value;
                  loop();
                } else try {
                  var result = reducer(accumulator, value, counter);

                  var handler = function ($result) {
                    accumulator = $result;
                    loop();
                  };

                  if (isObject(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
                  else handler(result);
                } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
              }
              counter++;
            } catch (error2) { reject(error2); }
          }, reject);
        } catch (error) { reject(error); }
      };

      loop();
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers





var $TypeError$1 = TypeError;

_export({ target: 'Iterator', proto: true, real: true, forced: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    var record = getIteratorDirect(this);
    aCallable(reducer);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    var counter = 0;
    iterate(record, function (value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = reducer(accumulator, value, counter);
      }
      counter++;
    }, { IS_RECORD: true });
    if (noInitial) throw $TypeError$1('Reduce of empty iterator with no initial value');
    return accumulator;
  }
});

// `Map.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  deleteAll: collectionDeleteAll
});

// `Map.prototype.emplace` method
// https://github.com/thumbsupep/proposal-upsert
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  emplace: mapEmplace
});

var getMapIterator = function (it) {
  // eslint-disable-next-line es/no-map -- safe
  return functionCall(Map.prototype.entries, it);
};

// `Map.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  every: function every(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return !iterate(iterator, function (key, value, stop) {
      if (!boundFunction(value, key, map)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// `Map.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new (speciesConstructor(map, getBuiltIn('Map')))();
    var setter = aCallable(newMap.set);
    iterate(iterator, function (key, value) {
      if (boundFunction(value, key, map)) functionCall(setter, newMap, key, value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

// `Map.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  find: function find(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop(value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// `Map.prototype.findKey` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  findKey: function findKey(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop(key);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// `SameValueZero` abstract operation
// https://tc39.es/ecma262/#sec-samevaluezero
var sameValueZero = function (x, y) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return x === y || x != x && y != y;
};

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  includes: function includes(searchElement) {
    return iterate(getMapIterator(anObject(this)), function (key, value, stop) {
      if (sameValueZero(value, searchElement)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// `Map.prototype.keyOf` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  keyOf: function keyOf(searchElement) {
    return iterate(getMapIterator(anObject(this)), function (key, value, stop) {
      if (value === searchElement) return stop(key);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// `Map.prototype.mapKeys` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new (speciesConstructor(map, getBuiltIn('Map')))();
    var setter = aCallable(newMap.set);
    iterate(iterator, function (key, value) {
      functionCall(setter, newMap, boundFunction(value, key, map), value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

// `Map.prototype.mapValues` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  mapValues: function mapValues(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new (speciesConstructor(map, getBuiltIn('Map')))();
    var setter = aCallable(newMap.set);
    iterate(iterator, function (key, value) {
      functionCall(setter, newMap, key, boundFunction(value, key, map));
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

// `Map.prototype.merge` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, arity: 1, forced: true }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  merge: function merge(iterable /* ...iterables */) {
    var map = anObject(this);
    var setter = aCallable(map.set);
    var argumentsLength = arguments.length;
    var i = 0;
    while (i < argumentsLength) {
      iterate(arguments[i++], setter, { that: map, AS_ENTRIES: true });
    }
    return map;
  }
});

var $TypeError$2 = TypeError;

// `Map.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aCallable(callbackfn);
    iterate(iterator, function (key, value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, key, map);
      }
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    if (noInitial) throw $TypeError$2('Reduce of empty map with no initial value');
    return accumulator;
  }
});

// `Set.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  some: function some(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $TypeError$3 = TypeError;

// `Set.prototype.update` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  update: function update(key, callback /* , thunk */) {
    var map = anObject(this);
    var get = aCallable(map.get);
    var has = aCallable(map.has);
    var set = aCallable(map.set);
    var length = arguments.length;
    aCallable(callback);
    var isPresentInMap = functionCall(has, map, key);
    if (!isPresentInMap && length < 3) {
      throw $TypeError$3('Updating absent value');
    }
    var value = isPresentInMap ? functionCall(get, map, key) : aCallable(length > 2 ? arguments[2] : undefined)(key, map);
    functionCall(set, map, key, callback(value, key, map));
    return map;
  }
});

var defineProperty = objectDefineProperty.f;

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  defineProperty(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: objectCreate(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};

var $findLastIndex = arrayIterationFromLast.findLastIndex;


// `Array.prototype.findLastIndex` method
// https://github.com/tc39/proposal-array-find-from-last
_export({ target: 'Array', proto: true }, {
  findLastIndex: function findLastIndex(callbackfn /* , that = undefined */) {
    return $findLastIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables('findLastIndex');

/**
 * @module typedArrayConstructor
 */

const upperBounds = new Map();
upperBounds.set([Int8Array, Uint8Array], 255);
upperBounds.set([Int16Array, Uint16Array], 65535);
upperBounds.set([Int32Array, Uint32Array], 4294967295);
upperBounds.set([BigInt64Array, BigUint64Array], 2 ** 64 - 1);
const upperBoundsArray = Array.from(upperBounds.entries());

/**
 * Get a typed array constructor based on the hypothetical max value it could contain. Signed or unsigned.
 *
 * @alias module:typedArrayConstructor
 * @param {number} maxValue The max value expected.
 * @param {boolean} signed Get a signed or unsigned array.
 * @returns {(Uint8Array|Uint16Array|Uint32Array|BigInt64Array|Int8Array|Int16Array|Int32Array|BigInt64Array)}
 * @see [MDN TypedArray objects]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects}
 */
const typedArrayConstructor = (maxValue, signed) => {
  const value = signed ? Math.abs(maxValue) : Math.max(0, maxValue);
  return upperBoundsArray[upperBoundsArray.findLastIndex(([_, bound]) => value > Math[Math.sign(maxValue) === -1 ? "ceil" : "floor"](bound / (signed ? 2 : 1))) + 1][0][signed ? 0 : 1];
};

function merge(geometries) {
  const isTypedArray = !Array.isArray(geometries[0].positions);
  const CellsConstructor = isTypedArray ? typedArrayConstructor(geometries.reduce((sum, geometry) => sum + geometry.positions.length / (isTypedArray ? 3 : 1), 0)) : Array;
  const mergedGeometry = {
    cells: new CellsConstructor()
  };
  let vertexOffset = 0;
  for (let i = 0; i < geometries.length; i++) {
    const geometry = geometries[i];
    const vertexCount = geometry.positions.length / (isTypedArray ? 3 : 1);
    for (let attribute of Object.keys(geometry)) {
      if (attribute === "cells") {
        mergedGeometry.cells = isTypedArray ? typedArrayConcat(CellsConstructor, mergedGeometry.cells,
        // Add previous geometry vertex offset mapped via a new typed array
        // because new value could be larger than what current type supports
        new (typedArrayConstructor(vertexOffset + vertexCount))(geometry.cells).map(n => vertexOffset + n)) : mergedGeometry.cells.concat(geometry.cells.map(cell => cell.map(n => vertexOffset + n)));
      } else {
        const isAttributeTypedArray = !Array.isArray(geometry[attribute]);
        mergedGeometry[attribute] ||= isAttributeTypedArray ? new geometry[attribute].constructor() : [];
        mergedGeometry[attribute] = isAttributeTypedArray ? typedArrayConcat(mergedGeometry[attribute].constructor, mergedGeometry[attribute], geometry[attribute]) : mergedGeometry[attribute].concat(geometry[attribute]);
      }
    }
    vertexOffset += vertexCount;
  }
  return mergedGeometry;
}

export default merge;
