import './common/es.error.cause-85d8db04.js';
import './common/web.dom-collections.iterator-72266c99.js';
import './common/esnext.iterator.map-88bfc258.js';
import { T as createCommonjsModule, c as commonjsGlobal, a1 as getDefaultExportFromNamespaceIfNotNamed } from './common/iterators-core-5c29a195.js';
import './common/esnext.typed-array.with-8b312403.js';
import './common/es.typed-array.float32-array-f5942f17.js';
import './common/to-string-03643265.js';
import './common/array-sort-332ddaea.js';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var alea = createCommonjsModule(function (module) {
  // A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
  // http://baagoe.com/en/RandomMusings/javascript/
  // https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
  // Original work is under MIT license -
  // Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
  //
  // Permission is hereby granted, free of charge, to any person obtaining a copy
  // of this software and associated documentation files (the "Software"), to deal
  // in the Software without restriction, including without limitation the rights
  // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  // copies of the Software, and to permit persons to whom the Software is
  // furnished to do so, subject to the following conditions:
  //
  // The above copyright notice and this permission notice shall be included in
  // all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  // THE SOFTWARE.
  (function (global, module, define) {
    function Alea(seed) {
      var me = this,
          mash = Mash();

      me.next = function () {
        var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32

        me.s0 = me.s1;
        me.s1 = me.s2;
        return me.s2 = t - (me.c = t | 0);
      }; // Apply the seeding algorithm from Baagoe.


      me.c = 1;
      me.s0 = mash(' ');
      me.s1 = mash(' ');
      me.s2 = mash(' ');
      me.s0 -= mash(seed);

      if (me.s0 < 0) {
        me.s0 += 1;
      }

      me.s1 -= mash(seed);

      if (me.s1 < 0) {
        me.s1 += 1;
      }

      me.s2 -= mash(seed);

      if (me.s2 < 0) {
        me.s2 += 1;
      }

      mash = null;
    }

    function copy(f, t) {
      t.c = f.c;
      t.s0 = f.s0;
      t.s1 = f.s1;
      t.s2 = f.s2;
      return t;
    }

    function impl(seed, opts) {
      var xg = new Alea(seed),
          state = opts && opts.state,
          prng = xg.next;

      prng.int32 = function () {
        return xg.next() * 0x100000000 | 0;
      };

      prng.double = function () {
        return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
      };

      prng.quick = prng;

      if (state) {
        if (typeof state == 'object') copy(state, xg);

        prng.state = function () {
          return copy(xg, {});
        };
      }

      return prng;
    }

    function Mash() {
      var n = 0xefc8249d;

      var mash = function (data) {
        data = String(data);

        for (var i = 0; i < data.length; i++) {
          n += data.charCodeAt(i);
          var h = 0.02519603282416938 * n;
          n = h >>> 0;
          h -= n;
          h *= n;
          n = h >>> 0;
          h -= n;
          n += h * 0x100000000; // 2^32
        }

        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
      };

      return mash;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function () {
        return impl;
      });
    } else {
      this.alea = impl;
    }
  })(commonjsGlobal,  module, // present in node.js
  typeof undefined == 'function'  // present with an AMD loader
  );
});

var xor128 = createCommonjsModule(function (module) {
  // A Javascript implementaion of the "xor128" prng algorithm by
  // George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper
  (function (global, module, define) {
    function XorGen(seed) {
      var me = this,
          strseed = '';
      me.x = 0;
      me.y = 0;
      me.z = 0;
      me.w = 0; // Set up generator function.

      me.next = function () {
        var t = me.x ^ me.x << 11;
        me.x = me.y;
        me.y = me.z;
        me.z = me.w;
        return me.w ^= me.w >>> 19 ^ t ^ t >>> 8;
      };

      if (seed === (seed | 0)) {
        // Integer seed.
        me.x = seed;
      } else {
        // String seed.
        strseed += seed;
      } // Mix in string seed, then discard an initial batch of 64 values.


      for (var k = 0; k < strseed.length + 64; k++) {
        me.x ^= strseed.charCodeAt(k) | 0;
        me.next();
      }
    }

    function copy(f, t) {
      t.x = f.x;
      t.y = f.y;
      t.z = f.z;
      t.w = f.w;
      return t;
    }

    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function () {
        return (xg.next() >>> 0) / 0x100000000;
      };

      prng.double = function () {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);

        return result;
      };

      prng.int32 = xg.next;
      prng.quick = prng;

      if (state) {
        if (typeof state == 'object') copy(state, xg);

        prng.state = function () {
          return copy(xg, {});
        };
      }

      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function () {
        return impl;
      });
    } else {
      this.xor128 = impl;
    }
  })(commonjsGlobal,  module, // present in node.js
  typeof undefined == 'function'  // present with an AMD loader
  );
});

var xorwow = createCommonjsModule(function (module) {
  // A Javascript implementaion of the "xorwow" prng algorithm by
  // George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper
  (function (global, module, define) {
    function XorGen(seed) {
      var me = this,
          strseed = ''; // Set up generator function.

      me.next = function () {
        var t = me.x ^ me.x >>> 2;
        me.x = me.y;
        me.y = me.z;
        me.z = me.w;
        me.w = me.v;
        return (me.d = me.d + 362437 | 0) + (me.v = me.v ^ me.v << 4 ^ (t ^ t << 1)) | 0;
      };

      me.x = 0;
      me.y = 0;
      me.z = 0;
      me.w = 0;
      me.v = 0;

      if (seed === (seed | 0)) {
        // Integer seed.
        me.x = seed;
      } else {
        // String seed.
        strseed += seed;
      } // Mix in string seed, then discard an initial batch of 64 values.


      for (var k = 0; k < strseed.length + 64; k++) {
        me.x ^= strseed.charCodeAt(k) | 0;

        if (k == strseed.length) {
          me.d = me.x << 10 ^ me.x >>> 4;
        }

        me.next();
      }
    }

    function copy(f, t) {
      t.x = f.x;
      t.y = f.y;
      t.z = f.z;
      t.w = f.w;
      t.v = f.v;
      t.d = f.d;
      return t;
    }

    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function () {
        return (xg.next() >>> 0) / 0x100000000;
      };

      prng.double = function () {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);

        return result;
      };

      prng.int32 = xg.next;
      prng.quick = prng;

      if (state) {
        if (typeof state == 'object') copy(state, xg);

        prng.state = function () {
          return copy(xg, {});
        };
      }

      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function () {
        return impl;
      });
    } else {
      this.xorwow = impl;
    }
  })(commonjsGlobal,  module, // present in node.js
  typeof undefined == 'function'  // present with an AMD loader
  );
});

var xorshift7 = createCommonjsModule(function (module) {
  // A Javascript implementaion of the "xorshift7" algorithm by
  // François Panneton and Pierre L'ecuyer:
  // "On the Xorgshift Random Number Generators"
  // http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf
  (function (global, module, define) {
    function XorGen(seed) {
      var me = this; // Set up generator function.

      me.next = function () {
        // Update xor generator.
        var X = me.x,
            i = me.i,
            t,
            v;
        t = X[i];
        t ^= t >>> 7;
        v = t ^ t << 24;
        t = X[i + 1 & 7];
        v ^= t ^ t >>> 10;
        t = X[i + 3 & 7];
        v ^= t ^ t >>> 3;
        t = X[i + 4 & 7];
        v ^= t ^ t << 7;
        t = X[i + 7 & 7];
        t = t ^ t << 13;
        v ^= t ^ t << 9;
        X[i] = v;
        me.i = i + 1 & 7;
        return v;
      };

      function init(me, seed) {
        var j,
            X = [];

        if (seed === (seed | 0)) {
          // Seed state array using a 32-bit integer.
          X[0] = seed;
        } else {
          // Seed state using a string.
          seed = '' + seed;

          for (j = 0; j < seed.length; ++j) {
            X[j & 7] = X[j & 7] << 15 ^ seed.charCodeAt(j) + X[j + 1 & 7] << 13;
          }
        } // Enforce an array length of 8, not all zeroes.


        while (X.length < 8) X.push(0);

        for (j = 0; j < 8 && X[j] === 0; ++j);

        if (j == 8) X[7] = -1;
        me.x = X;
        me.i = 0; // Discard an initial 256 values.

        for (j = 256; j > 0; --j) {
          me.next();
        }
      }

      init(me, seed);
    }

    function copy(f, t) {
      t.x = f.x.slice();
      t.i = f.i;
      return t;
    }

    function impl(seed, opts) {
      if (seed == null) seed = +new Date();

      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function () {
        return (xg.next() >>> 0) / 0x100000000;
      };

      prng.double = function () {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);

        return result;
      };

      prng.int32 = xg.next;
      prng.quick = prng;

      if (state) {
        if (state.x) copy(state, xg);

        prng.state = function () {
          return copy(xg, {});
        };
      }

      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function () {
        return impl;
      });
    } else {
      this.xorshift7 = impl;
    }
  })(commonjsGlobal,  module, // present in node.js
  typeof undefined == 'function'  // present with an AMD loader
  );
});

var xor4096 = createCommonjsModule(function (module) {
  // A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
  //
  // This fast non-cryptographic random number generator is designed for
  // use in Monte-Carlo algorithms. It combines a long-period xorshift
  // generator with a Weyl generator, and it passes all common batteries
  // of stasticial tests for randomness while consuming only a few nanoseconds
  // for each prng generated.  For background on the generator, see Brent's
  // paper: "Some long-period random number generators using shifts and xors."
  // http://arxiv.org/pdf/1004.3115v1.pdf
  //
  // Usage:
  //
  // var xor4096 = require('xor4096');
  // random = xor4096(1);                        // Seed with int32 or string.
  // assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
  // assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
  //
  // For nonzero numeric keys, this impelementation provides a sequence
  // identical to that by Brent's xorgens 3 implementaion in C.  This
  // implementation also provides for initalizing the generator with
  // string seeds, or for saving and restoring the state of the generator.
  //
  // On Chrome, this prng benchmarks about 2.1 times slower than
  // Javascript's built-in Math.random().
  (function (global, module, define) {
    function XorGen(seed) {
      var me = this; // Set up generator function.

      me.next = function () {
        var w = me.w,
            X = me.X,
            i = me.i,
            t,
            v; // Update Weyl generator.

        me.w = w = w + 0x61c88647 | 0; // Update xor generator.

        v = X[i + 34 & 127];
        t = X[i = i + 1 & 127];
        v ^= v << 13;
        t ^= t << 17;
        v ^= v >>> 15;
        t ^= t >>> 12; // Update Xor generator array state.

        v = X[i] = v ^ t;
        me.i = i; // Result is the combination.

        return v + (w ^ w >>> 16) | 0;
      };

      function init(me, seed) {
        var t,
            v,
            i,
            j,
            w,
            X = [],
            limit = 128;

        if (seed === (seed | 0)) {
          // Numeric seeds initialize v, which is used to generates X.
          v = seed;
          seed = null;
        } else {
          // String seeds are mixed into v and X one character at a time.
          seed = seed + '\0';
          v = 0;
          limit = Math.max(limit, seed.length);
        } // Initialize circular array and weyl value.


        for (i = 0, j = -32; j < limit; ++j) {
          // Put the unicode characters into the array, and shuffle them.
          if (seed) v ^= seed.charCodeAt((j + 32) % seed.length); // After 32 shuffles, take v as the starting w value.

          if (j === 0) w = v;
          v ^= v << 10;
          v ^= v >>> 15;
          v ^= v << 4;
          v ^= v >>> 13;

          if (j >= 0) {
            w = w + 0x61c88647 | 0; // Weyl.

            t = X[j & 127] ^= v + w; // Combine xor and weyl to init array.

            i = 0 == t ? i + 1 : 0; // Count zeroes.
          }
        } // We have detected all zeroes; make the key nonzero.


        if (i >= 128) {
          X[(seed && seed.length || 0) & 127] = -1;
        } // Run the generator 512 times to further mix the state before using it.
        // Factoring this as a function slows the main generator, so it is just
        // unrolled here.  The weyl generator is not advanced while warming up.


        i = 127;

        for (j = 4 * 128; j > 0; --j) {
          v = X[i + 34 & 127];
          t = X[i = i + 1 & 127];
          v ^= v << 13;
          t ^= t << 17;
          v ^= v >>> 15;
          t ^= t >>> 12;
          X[i] = v ^ t;
        } // Storing state as object members is faster than using closure variables.


        me.w = w;
        me.X = X;
        me.i = i;
      }

      init(me, seed);
    }

    function copy(f, t) {
      t.i = f.i;
      t.w = f.w;
      t.X = f.X.slice();
      return t;
    }

    function impl(seed, opts) {
      if (seed == null) seed = +new Date();

      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function () {
        return (xg.next() >>> 0) / 0x100000000;
      };

      prng.double = function () {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);

        return result;
      };

      prng.int32 = xg.next;
      prng.quick = prng;

      if (state) {
        if (state.X) copy(state, xg);

        prng.state = function () {
          return copy(xg, {});
        };
      }

      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function () {
        return impl;
      });
    } else {
      this.xor4096 = impl;
    }
  })(commonjsGlobal, // window object or global
   module, // present in node.js
  typeof undefined == 'function'  // present with an AMD loader
  );
});

var tychei = createCommonjsModule(function (module) {
  // A Javascript implementaion of the "Tyche-i" prng algorithm by
  // Samuel Neves and Filipe Araujo.
  // See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
  (function (global, module, define) {
    function XorGen(seed) {
      var me = this,
          strseed = ''; // Set up generator function.

      me.next = function () {
        var b = me.b,
            c = me.c,
            d = me.d,
            a = me.a;
        b = b << 25 ^ b >>> 7 ^ c;
        c = c - d | 0;
        d = d << 24 ^ d >>> 8 ^ a;
        a = a - b | 0;
        me.b = b = b << 20 ^ b >>> 12 ^ c;
        me.c = c = c - d | 0;
        me.d = d << 16 ^ c >>> 16 ^ a;
        return me.a = a - b | 0;
      };
      /* The following is non-inverted tyche, which has better internal
       * bit diffusion, but which is about 25% slower than tyche-i in JS.
      me.next = function() {
        var a = me.a, b = me.b, c = me.c, d = me.d;
        a = (me.a + me.b | 0) >>> 0;
        d = me.d ^ a; d = d << 16 ^ d >>> 16;
        c = me.c + d | 0;
        b = me.b ^ c; b = b << 12 ^ d >>> 20;
        me.a = a = a + b | 0;
        d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
        me.c = c = c + d | 0;
        b = b ^ c;
        return me.b = (b << 7 ^ b >>> 25);
      }
      */


      me.a = 0;
      me.b = 0;
      me.c = 2654435769 | 0;
      me.d = 1367130551;

      if (seed === Math.floor(seed)) {
        // Integer seed.
        me.a = seed / 0x100000000 | 0;
        me.b = seed | 0;
      } else {
        // String seed.
        strseed += seed;
      } // Mix in string seed, then discard an initial batch of 64 values.


      for (var k = 0; k < strseed.length + 20; k++) {
        me.b ^= strseed.charCodeAt(k) | 0;
        me.next();
      }
    }

    function copy(f, t) {
      t.a = f.a;
      t.b = f.b;
      t.c = f.c;
      t.d = f.d;
      return t;
    }

    function impl(seed, opts) {
      var xg = new XorGen(seed),
          state = opts && opts.state,
          prng = function () {
        return (xg.next() >>> 0) / 0x100000000;
      };

      prng.double = function () {
        do {
          var top = xg.next() >>> 11,
              bot = (xg.next() >>> 0) / 0x100000000,
              result = (top + bot) / (1 << 21);
        } while (result === 0);

        return result;
      };

      prng.int32 = xg.next;
      prng.quick = prng;

      if (state) {
        if (typeof state == 'object') copy(state, xg);

        prng.state = function () {
          return copy(xg, {});
        };
      }

      return prng;
    }

    if (module && module.exports) {
      module.exports = impl;
    } else if (define && define.amd) {
      define(function () {
        return impl;
      });
    } else {
      this.tychei = impl;
    }
  })(commonjsGlobal,  module, // present in node.js
  typeof undefined == 'function'  // present with an AMD loader
  );
});

var _nodeResolve_empty = {};

var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': _nodeResolve_empty
});

var require$$0 = /*@__PURE__*/getDefaultExportFromNamespaceIfNotNamed(_nodeResolve_empty$1);

var seedrandom = createCommonjsModule(function (module) {
  /*
  Copyright 2019 David Bau.
  
  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:
  
  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  
  */
  (function (global, pool, math) {
    //
    // The following constants are related to IEEE 754 limits.
    //
    var width = 256,
        // each RC4 output is 0 <= x < 256
    chunks = 6,
        // at least six RC4 outputs for each double
    digits = 52,
        // there are 52 significant digits in a double
    rngname = 'random',
        // rngname: name for Math.random and Math.seedrandom
    startdenom = math.pow(width, chunks),
        significance = math.pow(2, digits),
        overflow = significance * 2,
        mask = width - 1,
        nodecrypto; // node.js crypto module, initialized at the bottom.
    //
    // seedrandom()
    // This is the seedrandom function described above.
    //

    function seedrandom(seed, options, callback) {
      var key = [];
      options = options == true ? {
        entropy: true
      } : options || {}; // Flatten the seed string or build one from local entropy if needed.

      var shortseed = mixkey(flatten(options.entropy ? [seed, tostring(pool)] : seed == null ? autoseed() : seed, 3), key); // Use the seed to initialize an ARC4 generator.

      var arc4 = new ARC4(key); // This function returns a random double in [0, 1) that contains
      // randomness in every bit of the mantissa of the IEEE 754 value.

      var prng = function () {
        var n = arc4.g(chunks),
            // Start with a numerator n < 2 ^ 48
        d = startdenom,
            //   and denominator d = 2 ^ 48.
        x = 0; //   and no 'extra last byte'.

        while (n < significance) {
          // Fill up all significant digits by
          n = (n + x) * width; //   shifting numerator and

          d *= width; //   denominator and generating a

          x = arc4.g(1); //   new least-significant-byte.
        }

        while (n >= overflow) {
          // To avoid rounding up, before adding
          n /= 2; //   last byte, shift everything

          d /= 2; //   right using integer math until

          x >>>= 1; //   we have exactly the desired bits.
        }

        return (n + x) / d; // Form the number within [0, 1).
      };

      prng.int32 = function () {
        return arc4.g(4) | 0;
      };

      prng.quick = function () {
        return arc4.g(4) / 0x100000000;
      };

      prng.double = prng; // Mix the randomness into accumulated entropy.

      mixkey(tostring(arc4.S), pool); // Calling convention: what to return as a function of prng, seed, is_math.

      return (options.pass || callback || function (prng, seed, is_math_call, state) {
        if (state) {
          // Load the arc4 state from the given state if it has an S array.
          if (state.S) {
            copy(state, arc4);
          } // Only provide the .state method if requested via options.state.


          prng.state = function () {
            return copy(arc4, {});
          };
        } // If called as a method of Math (Math.seedrandom()), mutate
        // Math.random because that is how seedrandom.js has worked since v1.0.


        if (is_math_call) {
          math[rngname] = prng;
          return seed;
        } // Otherwise, it is a newer calling convention, so return the
        // prng directly.
        else return prng;
      })(prng, shortseed, 'global' in options ? options.global : this == math, options.state);
    } //
    // ARC4
    //
    // An ARC4 implementation.  The constructor takes a key in the form of
    // an array of at most (width) integers that should be 0 <= x < (width).
    //
    // The g(count) method returns a pseudorandom integer that concatenates
    // the next (count) outputs from ARC4.  Its return value is a number x
    // that is in the range 0 <= x < (width ^ count).
    //


    function ARC4(key) {
      var t,
          keylen = key.length,
          me = this,
          i = 0,
          j = me.i = me.j = 0,
          s = me.S = []; // The empty key [] is treated as [0].

      if (!keylen) {
        key = [keylen++];
      } // Set up S using the standard key scheduling algorithm.


      while (i < width) {
        s[i] = i++;
      }

      for (i = 0; i < width; i++) {
        s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];
        s[j] = t;
      } // The "g" method returns the next (count) outputs as one number.


      (me.g = function (count) {
        // Using instance members instead of closure state nearly doubles speed.
        var t,
            r = 0,
            i = me.i,
            j = me.j,
            s = me.S;

        while (count--) {
          t = s[i = mask & i + 1];
          r = r * width + s[mask & (s[i] = s[j = mask & j + t]) + (s[j] = t)];
        }

        me.i = i;
        me.j = j;
        return r; // For robust unpredictability, the function call below automatically
        // discards an initial batch of values.  This is called RC4-drop[256].
        // See http://google.com/search?q=rsa+fluhrer+response&btnI
      })(width);
    } //
    // copy()
    // Copies internal state of ARC4 to or from a plain object.
    //


    function copy(f, t) {
      t.i = f.i;
      t.j = f.j;
      t.S = f.S.slice();
      return t;
    }
    // flatten()
    // Converts an object tree to nested arrays of strings.
    //

    function flatten(obj, depth) {
      var result = [],
          typ = typeof obj,
          prop;

      if (depth && typ == 'object') {
        for (prop in obj) {
          try {
            result.push(flatten(obj[prop], depth - 1));
          } catch (e) {}
        }
      }

      return result.length ? result : typ == 'string' ? obj : obj + '\0';
    } //
    // mixkey()
    // Mixes a string seed into a key that is an array of integers, and
    // returns a shortened string seed that is equivalent to the result key.
    //


    function mixkey(seed, key) {
      var stringseed = seed + '',
          smear,
          j = 0;

      while (j < stringseed.length) {
        key[mask & j] = mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);
      }

      return tostring(key);
    } //
    // autoseed()
    // Returns an object for autoseeding, using window.crypto and Node crypto
    // module if available.
    //


    function autoseed() {
      try {
        var out;

        if (nodecrypto && (out = nodecrypto.randomBytes)) {
          // The use of 'out' to remember randomBytes makes tight minified code.
          out = out(width);
        } else {
          out = new Uint8Array(width);
          (global.crypto || global.msCrypto).getRandomValues(out);
        }

        return tostring(out);
      } catch (e) {
        var browser = global.navigator,
            plugins = browser && browser.plugins;
        return [+new Date(), global, plugins, global.screen, tostring(pool)];
      }
    } //
    // tostring()
    // Converts an array of charcodes to a string
    //


    function tostring(a) {
      return String.fromCharCode.apply(0, a);
    } //
    // When seedrandom.js is loaded, we immediately mix a few bits
    // from the built-in RNG into the entropy pool.  Because we do
    // not want to interfere with deterministic PRNG state later,
    // seedrandom will not call math.random on its own again after
    // initialization.
    //


    mixkey(math.random(), pool); //
    // Nodejs and AMD support: export the implementation as a module using
    // either convention.
    //

    if ( module.exports) {
      module.exports = seedrandom; // When in node.js, try using crypto package for autoseeding.

      try {
        nodecrypto = require$$0;
      } catch (ex) {}
    } else {
      // When included as a plain script, set up Math.seedrandom global.
      math['seed' + rngname] = seedrandom;
    } // End anonymous scope, and pass initial values.

  })( // global: `self` in browsers (including strict mode and web workers),
  // otherwise `this` in Node and other environments
  typeof self !== 'undefined' ? self : commonjsGlobal, [], // pool: entropy pool starts empty
  Math // math: package containing random, pow, and seedrandom
  );
});

//
// Usage:
//
// var seedrandom = require('seedrandom');
// var random = seedrandom(1); // or any seed.
// var x = random();       // 0 <= x < 1.  Every bit is random.
// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.
// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
// Period: ~2^116
// Reported to pass all BigCrush tests.
// xor128, a pure xor-shift generator by George Marsaglia.
// Period: 2^128-1.
// Reported to fail: MatrixRank and LinearComp.
// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
// Period: 2^192-2^32
// Reported to fail: CollisionOver, SimpPoker, and LinearComp.
// xorshift7, by François Panneton and Pierre L'ecuyer, takes
// a different approach: it adds robustness by allowing more shifts
// than Marsaglia's original three.  It is a 7-shift generator
// with 256 bits, that passes BigCrush with no systmatic failures.
// Period 2^256-1.
// No systematic BigCrush failures reported.
// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
// very long period that also adds a Weyl generator. It also passes
// BigCrush with no systematic failures.  Its long period may
// be useful if you have many generators and need to avoid
// collisions.
// Period: 2^4128-2^32.
// No systematic BigCrush failures reported.
// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
// number generator derived from ChaCha, a modern stream cipher.
// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
// Period: ~2^127
// No systematic BigCrush failures reported.
// The original ARC4-based prng included in this library.
// Period: ~2^1600

seedrandom.alea = alea;
seedrandom.xor128 = xor128;
seedrandom.xorwow = xorwow;
seedrandom.xorshift7 = xorshift7;
seedrandom.xor4096 = xor4096;
seedrandom.tychei = tychei;
var seedrandom$1 = seedrandom;

/*
 * A fast javascript implementation of simplex noise by Jonas Wagner

Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
Better rank ordering method by Stefan Gustavson in 2012.

 Copyright (c) 2021 Jonas Wagner

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
const F3 = 1.0 / 3.0;
const G3 = 1.0 / 6.0;
const F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
const G4 = (5.0 - Math.sqrt(5.0)) / 20.0;
const grad3 = new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1]);
const grad4 = new Float32Array([0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1, -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1, 1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1, -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0]);
/** Deterministic simplex noise generator suitable for 2D, 3D and 4D spaces. */

class SimplexNoise {
  /**
   * Creates a new `SimplexNoise` instance.
   * This involves some setup. You can save a few cpu cycles by reusing the same instance.
   * @param randomOrSeed A random number generator or a seed (string|number).
   * Defaults to Math.random (random irreproducible initialization).
   */
  constructor(randomOrSeed = Math.random) {
    const random = typeof randomOrSeed == 'function' ? randomOrSeed : alea$1(randomOrSeed);
    this.p = buildPermutationTable(random);
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);

    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }
  /**
   * Samples the noise field in 2 dimensions
   * @param x
   * @param y
   * @returns a number in the interval [-1, 1]
   */


  noise2D(x, y) {
    const permMod12 = this.permMod12;
    const perm = this.perm;
    let n0 = 0; // Noise contributions from the three corners

    let n1 = 0;
    let n2 = 0; // Skew the input space to determine which simplex cell we're in

    const s = (x + y) * F2; // Hairy factor for 2D

    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t; // Unskew the cell origin back to (x,y) space

    const Y0 = j - t;
    const x0 = x - X0; // The x,y distances from the cell origin

    const y0 = y - Y0; // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.

    let i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords

    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    else {
      i1 = 0;
      j1 = 1;
    } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6


    const x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords

    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords

    const y2 = y0 - 1.0 + 2.0 * G2; // Work out the hashed gradient indices of the three simplex corners

    const ii = i & 255;
    const jj = j & 255; // Calculate the contribution from the three corners

    let t0 = 0.5 - x0 * x0 - y0 * y0;

    if (t0 >= 0) {
      const gi0 = permMod12[ii + perm[jj]] * 3;
      t0 *= t0;
      n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;

    if (t1 >= 0) {
      const gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
      t1 *= t1;
      n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;

    if (t2 >= 0) {
      const gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
      t2 *= t2;
      n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
    } // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].


    return 70.0 * (n0 + n1 + n2);
  }
  /**
   * Samples the noise field in 3 dimensions
   * @param x
   * @param y
   * @param z
   * @returns a number in the interval [-1, 1]
   */


  noise3D(x, y, z) {
    const permMod12 = this.permMod12;
    const perm = this.perm;
    let n0, n1, n2, n3; // Noise contributions from the four corners
    // Skew the input space to determine which simplex cell we're in

    const s = (x + y + z) * F3; // Very nice and simple skew factor for 3D

    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);
    const t = (i + j + k) * G3;
    const X0 = i - t; // Unskew the cell origin back to (x,y,z) space

    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = x - X0; // The x,y,z distances from the cell origin

    const y0 = y - Y0;
    const z0 = z - Z0; // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.

    let i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords

    let i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } // X Y Z order
      else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } // X Z Y order
      else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } // Z X Y order

    } else {
      // x0<y0
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } // Z Y X order
      else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } // Y Z X order
      else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } // Y X Z order

    } // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.


    const x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords

    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords

    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords

    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3; // Work out the hashed gradient indices of the four simplex corners

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255; // Calculate the contribution from the four corners

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0.0;else {
      const gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
      t0 *= t0;
      n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0.0;else {
      const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
      t1 *= t1;
      n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0.0;else {
      const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
      t2 *= t2;
      n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0.0;else {
      const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
      t3 *= t3;
      n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
    } // Add contributions from each corner to get the final noise value.
    // The result is scaled to stay just inside [-1,1]

    return 32.0 * (n0 + n1 + n2 + n3);
  }
  /**
   * Samples the noise field in 4 dimensions
   * @param x
   * @param y
   * @param z
   * @returns a number in the interval [-1, 1]
   */


  noise4D(x, y, z, w) {
    const perm = this.perm;
    let n0, n1, n2, n3, n4; // Noise contributions from the five corners
    // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in

    const s = (x + y + z + w) * F4; // Factor for 4D skewing

    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);
    const l = Math.floor(w + s);
    const t = (i + j + k + l) * G4; // Factor for 4D unskewing

    const X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space

    const Y0 = j - t;
    const Z0 = k - t;
    const W0 = l - t;
    const x0 = x - X0; // The x,y,z,w distances from the cell origin

    const y0 = y - Y0;
    const z0 = z - Z0;
    const w0 = w - W0; // For the 4D case, the simplex is a 4D shape I won't even try to describe.
    // To find out which of the 24 possible simplices we're in, we need to
    // determine the magnitude ordering of x0, y0, z0 and w0.
    // Six pair-wise comparisons are performed between each possible pair
    // of the four coordinates, and the results are used to rank the numbers.

    let rankx = 0;
    let ranky = 0;
    let rankz = 0;
    let rankw = 0;
    if (x0 > y0) rankx++;else ranky++;
    if (x0 > z0) rankx++;else rankz++;
    if (x0 > w0) rankx++;else rankw++;
    if (y0 > z0) ranky++;else rankz++;
    if (y0 > w0) ranky++;else rankw++;
    if (z0 > w0) rankz++;else rankw++; // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
    // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
    // impossible. Only the 24 indices which have non-zero entries make any sense.
    // We use a thresholding to set the coordinates in turn from the largest magnitude.
    // Rank 3 denotes the largest coordinate.
    // Rank 2 denotes the second largest coordinate.
    // Rank 1 denotes the second smallest coordinate.
    // The integer offsets for the second simplex corner

    const i1 = rankx >= 3 ? 1 : 0;
    const j1 = ranky >= 3 ? 1 : 0;
    const k1 = rankz >= 3 ? 1 : 0;
    const l1 = rankw >= 3 ? 1 : 0; // The integer offsets for the third simplex corner

    const i2 = rankx >= 2 ? 1 : 0;
    const j2 = ranky >= 2 ? 1 : 0;
    const k2 = rankz >= 2 ? 1 : 0;
    const l2 = rankw >= 2 ? 1 : 0; // The integer offsets for the fourth simplex corner

    const i3 = rankx >= 1 ? 1 : 0;
    const j3 = ranky >= 1 ? 1 : 0;
    const k3 = rankz >= 1 ? 1 : 0;
    const l3 = rankw >= 1 ? 1 : 0; // The fifth corner has all coordinate offsets = 1, so no need to compute that.

    const x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords

    const y1 = y0 - j1 + G4;
    const z1 = z0 - k1 + G4;
    const w1 = w0 - l1 + G4;
    const x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords

    const y2 = y0 - j2 + 2.0 * G4;
    const z2 = z0 - k2 + 2.0 * G4;
    const w2 = w0 - l2 + 2.0 * G4;
    const x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords

    const y3 = y0 - j3 + 3.0 * G4;
    const z3 = z0 - k3 + 3.0 * G4;
    const w3 = w0 - l3 + 3.0 * G4;
    const x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords

    const y4 = y0 - 1.0 + 4.0 * G4;
    const z4 = z0 - 1.0 + 4.0 * G4;
    const w4 = w0 - 1.0 + 4.0 * G4; // Work out the hashed gradient indices of the five simplex corners

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const ll = l & 255; // Calculate the contribution from the five corners

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
    if (t0 < 0) n0 = 0.0;else {
      const gi0 = perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32 * 4;
      t0 *= t0;
      n0 = t0 * t0 * (grad4[gi0] * x0 + grad4[gi0 + 1] * y0 + grad4[gi0 + 2] * z0 + grad4[gi0 + 3] * w0);
    }
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
    if (t1 < 0) n1 = 0.0;else {
      const gi1 = perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32 * 4;
      t1 *= t1;
      n1 = t1 * t1 * (grad4[gi1] * x1 + grad4[gi1 + 1] * y1 + grad4[gi1 + 2] * z1 + grad4[gi1 + 3] * w1);
    }
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
    if (t2 < 0) n2 = 0.0;else {
      const gi2 = perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32 * 4;
      t2 *= t2;
      n2 = t2 * t2 * (grad4[gi2] * x2 + grad4[gi2 + 1] * y2 + grad4[gi2 + 2] * z2 + grad4[gi2 + 3] * w2);
    }
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
    if (t3 < 0) n3 = 0.0;else {
      const gi3 = perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32 * 4;
      t3 *= t3;
      n3 = t3 * t3 * (grad4[gi3] * x3 + grad4[gi3 + 1] * y3 + grad4[gi3 + 2] * z3 + grad4[gi3 + 3] * w3);
    }
    let t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
    if (t4 < 0) n4 = 0.0;else {
      const gi4 = perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32 * 4;
      t4 *= t4;
      n4 = t4 * t4 * (grad4[gi4] * x4 + grad4[gi4 + 1] * y4 + grad4[gi4 + 2] * z4 + grad4[gi4 + 3] * w4);
    } // Sum up and scale the result to cover the range [-1,1]

    return 27.0 * (n0 + n1 + n2 + n3 + n4);
  }

}
/**
 * Builds a random permutation table.
 * This is exported only for (internal) testing purposes.
 * Do not rely on this export.
 * @private
 */

function buildPermutationTable(random) {
  const p = new Uint8Array(256);

  for (let i = 0; i < 256; i++) {
    p[i] = i;
  }

  for (let i = 0; i < 255; i++) {
    const r = i + ~~(random() * (256 - i));
    const aux = p[i];
    p[i] = p[r];
    p[r] = aux;
  }

  return p;
}
/*
The ALEA PRNG and masher code used by simplex-noise.js
is based on code by Johannes Baagøe, modified by Jonas Wagner.
See alea.md for the full license.
*/

function alea$1(seed) {
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  let c = 1;
  const mash = masher();
  s0 = mash(' ');
  s1 = mash(' ');
  s2 = mash(' ');
  s0 -= mash(seed);

  if (s0 < 0) {
    s0 += 1;
  }

  s1 -= mash(seed);

  if (s1 < 0) {
    s1 += 1;
  }

  s2 -= mash(seed);

  if (s2 < 0) {
    s2 += 1;
  }

  return function () {
    const t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32

    s0 = s1;
    s1 = s2;
    return s2 = t - (c = t | 0);
  };
}

function masher() {
  let n = 0xefc8249d;
  return function (data) {
    data = data.toString();

    for (let i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      let h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }

    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };
}

function _classStaticPrivateFieldSpecSet(receiver, classConstructor, descriptor, value) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) { _classCheckPrivateStaticAccess(receiver, classConstructor); _classCheckPrivateStaticFieldDescriptor(descriptor, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classCheckPrivateStaticFieldDescriptor(descriptor, action) { if (descriptor === undefined) { throw new TypeError("attempted to " + action + " private static field before its declaration"); } }

function _classCheckPrivateStaticAccess(receiver, classConstructor) { if (receiver !== classConstructor) { throw new TypeError("Private static access of wrong provenance"); } }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }
/**
 * @typedef FBMOptions
 * @property {number} [octaves=8]
 * @property {number} [lacunarity=2]
 * @property {number} [gain=0.5]
 * @property {number} [frequency=1]
 * @property {number} [amplitude=gain]
 * @property {Function} [noise]
 */

class Random {
  /**
   * @private
   */

  /**
   * @private
   * @property {number} NOW Runtime performance.now() value.
   */

  /**
   * Creates an instance of Random
   * @param {string|number} [seed=Random.NOW + Random.#instanceCount]
   */
  constructor(_seed = Random.NOW + _classStaticPrivateFieldSpecGet(Random, Random, _instanceCount)) {
    var _Random$instanceCount;

    _defineProperty(this, "create", seed => new Random(seed));

    this.seed(_seed);
    _classStaticPrivateFieldSpecSet(Random, Random, _instanceCount, (_Random$instanceCount = +_classStaticPrivateFieldSpecGet(Random, Random, _instanceCount)) + 1), _Random$instanceCount;
  }
  /**
   * Create an instance of Random.
   * @param {string|number} [seed] If omitted, the global PRNG seed will be used and incremented for each local PRNG.
   * @returns {Random}
   */


  /**
   * Set the seed for the random number generator
   * @param {string} s Seed value
   */
  seed(s) {
    this.rng = seedrandom$1(s);
    this.simplex = new SimplexNoise(this.rng);
  }
  /**
   * Get a float between min and max. Defaults to:
   * - `0 <= x < 1` if no argument supplied
   * - `0 <= x < max` if only one argument supplied
   * @param {number} [min]
   * @param {number} [max]
   * @returns {number}
   */


  float(min, max) {
    if (arguments.length == 0) {
      min = 0;
      max = 1;
    } else if (arguments.length == 1) {
      max = min;
      min = 0;
    }

    return min + (max - min) * this.rng();
  }
  /**
   * Get an int between min and max. Defaults to:
   * - `0 <= x < Number.MAX_SAFE_INTEGER` if no argument supplied
   * - `0 <= x < max` if only one argument supplied
   * @param {number} [min]
   * @param {number} [max]
   * @returns {number}
   */


  int(min, max) {
    if (arguments.length == 0) {
      min = 0;
      max = Number.MAX_SAFE_INTEGER;
    } else if (arguments.length == 1) {
      max = min;
      min = 0;
    }

    return Math.floor(this.float(min, max));
  }
  /**
   * Get a vec2 included in a radius
   * @param {number} [r=1] radius
   * @returns {import("pex-math").vec2}
   */


  vec2(r = 1) {
    const x = 2 * this.rng() - 1;
    const y = 2 * this.rng() - 1;
    const rr = this.rng() * r;
    const len = Math.sqrt(x * x + y * y);
    return [rr * x / len, rr * y / len];
  }
  /**
   * Get a vec3 included in a radius
   * @param {number} [r=1] radius
   * @returns {import("pex-math").vec3}
   */


  vec3(r = 1) {
    const x = 2 * this.rng() - 1;
    const y = 2 * this.rng() - 1;
    const z = 2 * this.rng() - 1;
    const rr = this.rng() * r;
    const len = Math.sqrt(x * x + y * y + z * z);
    return [rr * x / len, rr * y / len, rr * z / len];
  }
  /**
   * Get a vec2 included in a rectangle
   * @param {number} rect rectangle
   * @returns {import("pex-math").vec2}
   */


  vec2InRect(rect) {
    return [rect[0][0] + this.rng() * (rect[1][0] - rect[0][0]), rect[0][1] + this.rng() * (rect[1][1] - rect[0][1])];
  }
  /**
   * Get a vec3 included in a rectangle bbox
   * @param {number} bbox rectangle bbox
   * @returns {import("pex-math").vec3}
   */


  vec3InAABB(bbox) {
    return [bbox[0][0] + this.rng() * (bbox[1][0] - bbox[0][0]), bbox[0][1] + this.rng() * (bbox[1][1] - bbox[0][1]), bbox[0][2] + this.rng() * (bbox[1][2] - bbox[0][2])];
  }
  /**
   * Returns a chance of an event occuring according to a given probability between 0 and 1.
   * @param {number} [probability=0.5] Float between 0 and 1.
   * @returns {boolean}
   */


  chance(probability = 0.5) {
    return this.rng() <= probability;
  }
  /**
   * Gets a random element from a list
   * @param {Array} list
   * @returns {*}
   */


  element(list) {
    return list[Math.floor(this.rng() * list.length)];
  }
  /**
   * Samples the noise field in 2 dimensions
   * @param {number} x
   * @param {number} y
   * @returns {number} in the interval [-1, 1]
   */


  noise2(x, y) {
    return this.simplex.noise2D(x, y);
  }
  /**
   * Samples the noise field in 3 dimensions
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {number} in the interval [-1, 1]
   */


  noise3(x, y, z) {
    return this.simplex.noise3D(x, y, z);
  }
  /**
   * Samples the noise field in 4 dimensions
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} w
   * @returns {number} in the interval [-1, 1]
   */


  noise4(x, y, z, w) {
    return this.simplex.noise4D(x, y, z, w);
  }
  /**
   * Fractional Brownian motion (also called fractal Brownian motion) noise. Default to 1/f noise with 8 octaves.
   * @param {FBMOptions} options
   * @param  {...number} d x, y, z?, w?
   * @returns {number} in the interval [-1, 1]
   */


  fbm({
    octaves = 8,
    lacunarity = 2,
    gain = 0.5,
    frequency = 1,
    amplitude = gain,
    noise
  }, ...d) {
    let value = 0;
    noise || (noise = this[`noise${d.length}`].bind(this));

    for (let i = 0; i < octaves; i++) {
      value += noise(...d.map(n => n * frequency)) * amplitude;
      frequency *= lacunarity;
      amplitude *= gain;
    }

    return value;
  }

}
/**
 * @module pex-random
 *
 * @summary
 * Export a Random instance using the global PRNG:
 * - The instance is seeded by `performance.now()`
 * - Call `random.seed("seed")` to overwrite the global PRNG: all other calls to `random.float()` will derive from the new seeded state.
 * - Call `random.create()` to create a local instance of Random with a separate unpredictable PRNG.
 * - Call `random.create("seed")` to create a local instance of Random with a separate predictable PRNG: all other calls to `random.float()` will derive from the new seeded state.
 */


var _instanceCount = {
  writable: true,
  value: 0
};

_defineProperty(Random, "NOW", performance.now());

var index = new Random();

export default index;