import './common/es.error.cause-c4c3fd35.js';
import { a as aCallable, _ as _export, l as functionCall } from './common/web.dom-collections.iterator-7ea8a356.js';
import './common/web.url.constructor-2bd3b55e.js';
import { p as perform, g as getIteratorDirect } from './common/esnext.iterator.map-e3ab2956.js';
import { i as iterate, a as asyncIteratorIteration } from './common/iterate-b9a2a58a.js';
import './common/array-sort-2272a817.js';

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aCallable(resolve);
  this.reject = aCallable(reject);
};

// `NewPromiseCapability` abstract operation
// https://tc39.es/ecma262/#sec-newpromisecapability
var f = function (C) {
  return new PromiseCapability(C);
};

var newPromiseCapability = {
	f: f
};

// `Promise.allSettled` method
// https://tc39.es/ecma262/#sec-promise.allsettled
_export({ target: 'Promise', stat: true }, {
  allSettled: function allSettled(iterable) {
    var C = this;
    var capability = newPromiseCapability.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var promiseResolve = aCallable(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        remaining++;
        functionCall(promiseResolve, C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = { status: 'fulfilled', value: value };
          --remaining || resolve(values);
        }, function (error) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = { status: 'rejected', reason: error };
          --remaining || resolve(values);
        });
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

// https://github.com/tc39/proposal-iterator-helpers

var $find = asyncIteratorIteration.find;

_export({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  find: function find(fn) {
    return $find(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers





_export({ target: 'Iterator', proto: true, real: true, forced: true }, {
  find: function find(fn) {
    var record = getIteratorDirect(this);
    aCallable(fn);
    return iterate(record, function (value, stop) {
      if (fn(value)) return stop(value);
    }, { IS_RECORD: true, INTERRUPTED: true }).result;
  }
});

const ok = async response => response.ok ? response : Promise.reject(new Error(`GET ${response.url} ${response.status} (${response.statusText})`));
/**
 * Load an item and parse the Response as text.
 * @function
 * @param {RequestInfo} url
 * @param {RequestInit} options
 * @returns {Promise<string>}
 */


const loadText = async (url, options = {}) => await (await ok(await fetch(url, options))).text();
/**
 * Load an item and parse the Response as json.
 * @function
 * @param {RequestInfo} url
 * @param {RequestInit} options
 * @returns {Promise<JSON>}
 */

const loadJson = async (url, options = {}) => await (await ok(await fetch(url, options))).json();
/**
 * Load an item and parse the Response as arrayBuffer.
 * @function
 * @param {RequestInfo} url
 * @param {RequestInit} options
 * @returns {Promise<ArrayBuffer>}
 */

const loadArrayBuffer = async (url, options = {}) => await (await ok(await fetch(url, options))).arrayBuffer();
/**
 * Load an item and parse the Response as blob.
 * @function
 * @param {RequestInfo} url
 * @param {RequestInit} options
 * @returns {Promise<Blob>}
 */

const loadBlob = async (url, options = {}) => await (await ok(await fetch(url, options))).blob();
/**
 * @typedef {Object} ImageOptions
 * @param {string} url
 * @param {...*} rest {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement#properties|HTMLImageElement#properties}
 */

/**
 * Load an item, parse the Response as blob and create a HTML Image.
 * @function
 * @param {string | ImageOptions} urlOrOpts
 * @param {RequestInit} options
 * @returns {Promise<HTMLImageElement>}
 */

const loadImage = async (urlOrOpts, options = {}) => {
  const img = new Image();
  let src = urlOrOpts;

  if (urlOrOpts.url) {
    const {
      url,
      ...rest
    } = urlOrOpts;
    src = url;

    try {
      Object.assign(img, rest);
    } catch (error) {
      return Promise.reject(new Error(error));
    }
  }

  const data = await loadBlob(src, options);
  return await new Promise((resolve, reject) => {
    img.addEventListener("load", function load() {
      img.removeEventListener("load", load);
      resolve(img);
    });
    img.addEventListener("error", function error() {
      img.removeEventListener("error", error);
      reject(img);
    });
    img.src = URL.createObjectURL(data);
  });
};
/**
 * @private
 */

const LOADERS_MAP = {
  text: loadText,
  json: loadJson,
  image: loadImage,
  blob: loadBlob,
  arrayBuffer: loadArrayBuffer
};
const LOADERS_MAP_KEYS = Object.keys(LOADERS_MAP);
/**
 * @typedef {Object} Resource
 * @property {string} [text]
 * @property {string} [json]
 * @property {string} [image]
 * @property {string} [binary]
 * @property {RequestInit} [options] {@link https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#parameters|Request#parameters}
 */

/**
 * @typedef {DOMString | Object | HTMLImageElement | Blob | ArrayBuffer} LoadedResource
 */

/**
 * Loads resources from a named map.
 * @function
 * @param {Object.<string, Resource>} resources
 * @returns {Promise<Object.<string, LoadedResource>>}
 *
 * @example
 * const resources = {
 *   hello: { text: "assets/hello.txt" },
 *   data: { json: "assets/data.json" },
 *   img: { image: "assets/tex.jpg" },
 *   blob: { blob: "assets/blob" },
 *   hdrImg: { arrayBuffer: "assets/tex.hdr", options: { mode: "no-cors" } },
 * };
 *
 * const res = await io.load(resources);
 * res.hello; // => DOMString
 * res.data; // => Object
 * res.img; // => HTMLImageElement
 * res.blob; // => Blob
 * res.hdrImg; // => ArrayBuffer
 */

const load = resources => {
  const names = Object.keys(resources);
  return Promise.allSettled(names.map(async name => {
    const res = resources[name];
    const loader = LOADERS_MAP_KEYS.find(loader => res[loader]);
    if (loader) return await LOADERS_MAP[loader](res[loader], res.options);
    return Promise.reject(new Error(`io.load: unknown resource type "${Object.keys(res)}".
Resource needs one of ${LOADERS_MAP_KEYS.join("|")} set to an url.`));
  })).then(values => Object.fromEntries(Array.from(values.map(v => v.value || v.reason), (v, i) => [names[i], v])));
};

export { load, loadArrayBuffer, loadBlob, loadImage, loadJson, loadText };
