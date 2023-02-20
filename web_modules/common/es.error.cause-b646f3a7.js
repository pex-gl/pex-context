import { x as functionBindNative, y as functionUncurryThis, a as aCallable, j as isCallable, d as anObject, z as objectDefineProperty, i as isObject, r as classof, m as createNonEnumerableProperty, k as fails, A as createPropertyDescriptor, b as getBuiltIn, l as hasOwnProperty_1, o as objectIsPrototypeOf, B as copyConstructorProperties, C as descriptors, h as global_1, _ as _export } from './classof-6bb7363a.js';

var FunctionPrototype = Function.prototype;
var apply = FunctionPrototype.apply;
var call = FunctionPrototype.call;

// eslint-disable-next-line es/no-reflect -- safe
var functionApply = typeof Reflect == 'object' && Reflect.apply || (functionBindNative ? call.bind(apply) : function () {
  return call.apply(apply, arguments);
});

var functionUncurryThisAccessor = function (object, key, method) {
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    return functionUncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
  } catch (error) { /* empty */ }
};

var $String = String;
var $TypeError = TypeError;

var aPossiblePrototype = function (argument) {
  if (typeof argument == 'object' || isCallable(argument)) return argument;
  throw $TypeError("Can't set " + $String(argument) + ' as a prototype');
};

/* eslint-disable no-proto -- safe */




// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
// eslint-disable-next-line es/no-object-setprototypeof -- safe
var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = functionUncurryThisAccessor(Object.prototype, '__proto__', 'set');
    setter(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var defineProperty = objectDefineProperty.f;

var proxyAccessor = function (Target, Source, key) {
  key in Target || defineProperty(Target, key, {
    configurable: true,
    get: function () { return Source[key]; },
    set: function (it) { Source[key] = it; }
  });
};

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    objectSetPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable(NewTarget = dummy.constructor) &&
    NewTarget !== Wrapper &&
    isObject(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) objectSetPrototypeOf($this, NewTargetPrototype);
  return $this;
};

var $String$1 = String;

var toString_1 = function (argument) {
  if (classof(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
  return $String$1(argument);
};

var normalizeStringArgument = function (argument, $default) {
  return argument === undefined ? arguments.length < 2 ? '' : $default : toString_1(argument);
};

// `InstallErrorCause` abstract operation
// https://tc39.es/proposal-error-cause/#sec-errorobjects-install-error-cause
var installErrorCause = function (O, options) {
  if (isObject(options) && 'cause' in options) {
    createNonEnumerableProperty(O, 'cause', options.cause);
  }
};

var $Error = Error;
var replace = functionUncurryThis(''.replace);

var TEST = (function (arg) { return String($Error(arg).stack); })('zxcasd');
// eslint-disable-next-line redos/no-vulnerable -- safe
var V8_OR_CHAKRA_STACK_ENTRY = /\n\s*at [^:]*:[^\n]*/;
var IS_V8_OR_CHAKRA_STACK = V8_OR_CHAKRA_STACK_ENTRY.test(TEST);

var errorStackClear = function (stack, dropEntries) {
  if (IS_V8_OR_CHAKRA_STACK && typeof stack == 'string' && !$Error.prepareStackTrace) {
    while (dropEntries--) stack = replace(stack, V8_OR_CHAKRA_STACK_ENTRY, '');
  } return stack;
};

var errorStackInstallable = !fails(function () {
  var error = Error('a');
  if (!('stack' in error)) return true;
  // eslint-disable-next-line es/no-object-defineproperty -- safe
  Object.defineProperty(error, 'stack', createPropertyDescriptor(1, 7));
  return error.stack !== 7;
});

// non-standard V8
var captureStackTrace = Error.captureStackTrace;

var errorStackInstall = function (error, C, stack, dropEntries) {
  if (errorStackInstallable) {
    if (captureStackTrace) captureStackTrace(error, C);
    else createNonEnumerableProperty(error, 'stack', errorStackClear(stack, dropEntries));
  }
};

var wrapErrorConstructorWithCause = function (FULL_NAME, wrapper, FORCED, IS_AGGREGATE_ERROR) {
  var STACK_TRACE_LIMIT = 'stackTraceLimit';
  var OPTIONS_POSITION = IS_AGGREGATE_ERROR ? 2 : 1;
  var path = FULL_NAME.split('.');
  var ERROR_NAME = path[path.length - 1];
  var OriginalError = getBuiltIn.apply(null, path);

  if (!OriginalError) return;

  var OriginalErrorPrototype = OriginalError.prototype;

  // V8 9.3- bug https://bugs.chromium.org/p/v8/issues/detail?id=12006
  if ( hasOwnProperty_1(OriginalErrorPrototype, 'cause')) delete OriginalErrorPrototype.cause;

  if (!FORCED) return OriginalError;

  var BaseError = getBuiltIn('Error');

  var WrappedError = wrapper(function (a, b) {
    var message = normalizeStringArgument(IS_AGGREGATE_ERROR ? b : a, undefined);
    var result = IS_AGGREGATE_ERROR ? new OriginalError(a) : new OriginalError();
    if (message !== undefined) createNonEnumerableProperty(result, 'message', message);
    errorStackInstall(result, WrappedError, result.stack, 2);
    if (this && objectIsPrototypeOf(OriginalErrorPrototype, this)) inheritIfRequired(result, this, WrappedError);
    if (arguments.length > OPTIONS_POSITION) installErrorCause(result, arguments[OPTIONS_POSITION]);
    return result;
  });

  WrappedError.prototype = OriginalErrorPrototype;

  if (ERROR_NAME !== 'Error') {
    if (objectSetPrototypeOf) objectSetPrototypeOf(WrappedError, BaseError);
    else copyConstructorProperties(WrappedError, BaseError, { name: true });
  } else if (descriptors && STACK_TRACE_LIMIT in OriginalError) {
    proxyAccessor(WrappedError, OriginalError, STACK_TRACE_LIMIT);
    proxyAccessor(WrappedError, OriginalError, 'prepareStackTrace');
  }

  copyConstructorProperties(WrappedError, OriginalError);

  try {
    // Safari 13- bug: WebAssembly errors does not have a proper `.name`
    if (OriginalErrorPrototype.name !== ERROR_NAME) {
      createNonEnumerableProperty(OriginalErrorPrototype, 'name', ERROR_NAME);
    }
    OriginalErrorPrototype.constructor = WrappedError;
  } catch (error) { /* empty */ }

  return WrappedError;
};

/* eslint-disable no-unused-vars -- required for functions `.length` */





var WEB_ASSEMBLY = 'WebAssembly';
var WebAssembly = global_1[WEB_ASSEMBLY];

var FORCED = Error('e', { cause: 7 }).cause !== 7;

var exportGlobalErrorCauseWrapper = function (ERROR_NAME, wrapper) {
  var O = {};
  O[ERROR_NAME] = wrapErrorConstructorWithCause(ERROR_NAME, wrapper, FORCED);
  _export({ global: true, constructor: true, arity: 1, forced: FORCED }, O);
};

var exportWebAssemblyErrorCauseWrapper = function (ERROR_NAME, wrapper) {
  if (WebAssembly && WebAssembly[ERROR_NAME]) {
    var O = {};
    O[ERROR_NAME] = wrapErrorConstructorWithCause(WEB_ASSEMBLY + '.' + ERROR_NAME, wrapper, FORCED);
    _export({ target: WEB_ASSEMBLY, stat: true, constructor: true, arity: 1, forced: FORCED }, O);
  }
};

// https://tc39.es/ecma262/#sec-nativeerror
// https://github.com/tc39/proposal-error-cause
exportGlobalErrorCauseWrapper('Error', function (init) {
  return function Error(message) { return functionApply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('EvalError', function (init) {
  return function EvalError(message) { return functionApply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('RangeError', function (init) {
  return function RangeError(message) { return functionApply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('ReferenceError', function (init) {
  return function ReferenceError(message) { return functionApply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('SyntaxError', function (init) {
  return function SyntaxError(message) { return functionApply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('TypeError', function (init) {
  return function TypeError(message) { return functionApply(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('URIError', function (init) {
  return function URIError(message) { return functionApply(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('CompileError', function (init) {
  return function CompileError(message) { return functionApply(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('LinkError', function (init) {
  return function LinkError(message) { return functionApply(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('RuntimeError', function (init) {
  return function RuntimeError(message) { return functionApply(init, this, arguments); };
});

export { objectSetPrototypeOf as o };
