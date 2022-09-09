import { j as functionUncurryThis, G as requireObjectCoercible, J as toIntegerOrInfinity, L as getBuiltIn, a as aCallable, e as anObject, g as functionCall, w as wellKnownSymbol, s as global_1, y as isCallable, f as fails, C as hasOwnProperty_1, E as createNonEnumerableProperty, _ as _export, a3 as iteratorsCore, Q as tryToString, r as lengthOfArrayLike, M as objectIsPrototypeOf } from './web.dom-collections.iterator-13a35a91.js';
import { t as toString_1, g as getIteratorDirect, b as asyncIteratorClose, k as anInstance, f as functionBindContext, d as getIteratorMethod, e as isArrayIteratorMethod, h as getIterator, n as iteratorClose } from './esnext.iterator.map-dd12ba51.js';

var charAt = functionUncurryThis(''.charAt);
var charCodeAt = functionUncurryThis(''.charCodeAt);
var stringSlice = functionUncurryThis(''.slice);

var createMethod = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString_1(requireObjectCoercible($this));
    var position = toIntegerOrInfinity(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = charCodeAt(S, position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = charCodeAt(S, position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING
          ? charAt(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod(true)
};

var $TypeError = TypeError;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

var doesNotExceedSafeInteger = function (it) {
  if (it > MAX_SAFE_INTEGER) throw $TypeError('Maximum allowed index exceeded');
  return it;
};

// https://github.com/tc39/proposal-iterator-helpers
// https://github.com/tc39/proposal-array-from-async








var createMethod$1 = function (TYPE) {
  var IS_TO_ARRAY = TYPE == 0;
  var IS_FOR_EACH = TYPE == 1;
  var IS_EVERY = TYPE == 2;
  var IS_SOME = TYPE == 3;
  return function (object, fn, target) {
    var record = getIteratorDirect(object);
    var Promise = getBuiltIn('Promise');
    var iterator = record.iterator;
    var next = record.next;
    var index = 0;
    var MAPPING = fn !== undefined;
    if (MAPPING || !IS_TO_ARRAY) aCallable(fn);

    return new Promise(function (resolve, reject) {
      var ifAbruptCloseAsyncIterator = function (error) {
        asyncIteratorClose(iterator, reject, error, reject);
      };

      var loop = function () {
        try {
          if (IS_TO_ARRAY && MAPPING) try {
            doesNotExceedSafeInteger(index);
          } catch (error5) { ifAbruptCloseAsyncIterator(error5); }
          Promise.resolve(anObject(functionCall(next, iterator))).then(function (step) {
            try {
              if (anObject(step).done) {
                if (IS_TO_ARRAY) {
                  target.length = index;
                  resolve(target);
                } else resolve(IS_SOME ? false : IS_EVERY || undefined);
              } else {
                var value = step.value;
                try {
                  if (MAPPING) {
                    Promise.resolve(IS_TO_ARRAY ? fn(value, index) : fn(value)).then(function (result) {
                      if (IS_FOR_EACH) {
                        loop();
                      } else if (IS_EVERY) {
                        result ? loop() : asyncIteratorClose(iterator, resolve, false, reject);
                      } else if (IS_TO_ARRAY) {
                        try {
                          target[index++] = result;
                          loop();
                        } catch (error4) { ifAbruptCloseAsyncIterator(error4); }
                      } else {
                        result ? asyncIteratorClose(iterator, resolve, IS_SOME || value, reject) : loop();
                      }
                    }, ifAbruptCloseAsyncIterator);
                  } else {
                    target[index++] = value;
                    loop();
                  }
                } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
              }
            } catch (error2) { reject(error2); }
          }, reject);
        } catch (error) { reject(error); }
      };

      loop();
    });
  };
};

var asyncIteratorIteration = {
  toArray: createMethod$1(0),
  forEach: createMethod$1(1),
  every: createMethod$1(2),
  some: createMethod$1(3),
  find: createMethod$1(4)
};

// https://github.com/tc39/proposal-iterator-helpers








var IteratorPrototype = iteratorsCore.IteratorPrototype;


var TO_STRING_TAG = wellKnownSymbol('toStringTag');

var NativeIterator = global_1.Iterator;

// FF56- have non-standard global helper `Iterator`
var FORCED =  !isCallable(NativeIterator)
  || NativeIterator.prototype !== IteratorPrototype
  // FF44- non-standard `Iterator` passes previous tests
  || !fails(function () { NativeIterator({}); });

var IteratorConstructor = function Iterator() {
  anInstance(this, IteratorPrototype);
};

if (!hasOwnProperty_1(IteratorPrototype, TO_STRING_TAG)) {
  createNonEnumerableProperty(IteratorPrototype, TO_STRING_TAG, 'Iterator');
}

if (FORCED || !hasOwnProperty_1(IteratorPrototype, 'constructor') || IteratorPrototype.constructor === Object) {
  createNonEnumerableProperty(IteratorPrototype, 'constructor', IteratorConstructor);
}

IteratorConstructor.prototype = IteratorPrototype;

_export({ global: true, constructor: true, forced: FORCED }, {
  Iterator: IteratorConstructor
});

var $TypeError$1 = TypeError;

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var ResultPrototype = Result.prototype;

var iterate = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_RECORD = !!(options && options.IS_RECORD);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = functionBindContext(unboundFunction, that);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose(iterator, 'normal', condition);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_RECORD) {
    iterator = iterable.iterator;
  } else if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (!iterFn) throw $TypeError$1(tryToString(iterable) + ' is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = lengthOfArrayLike(iterable); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && objectIsPrototypeOf(ResultPrototype, result)) return result;
      } return new Result(false);
    }
    iterator = getIterator(iterable, iterFn);
  }

  next = IS_RECORD ? iterable.next : iterator.next;
  while (!(step = functionCall(next, iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose(iterator, 'throw', error);
    }
    if (typeof result == 'object' && result && objectIsPrototypeOf(ResultPrototype, result)) return result;
  } return new Result(false);
};

export { asyncIteratorIteration as a, iterate as i, stringMultibyte as s };
