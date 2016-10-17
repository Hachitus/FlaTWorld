(function () {
  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.generalUtils.polyfills = setupPolyfills();

  /*-----------------------
  -------- PUBLIC ---------
  -----------------------*/
  /**
   * Add polyfills for the map, as necessary. Easy to drop out.
   *
   * @namespace flatworld.generalUtils
   * @class polyfills
   * @return {Object} arrayFind, objectAssign
   */
  function setupPolyfills() {
    return {
      arrayFind,
      objectAssign,
      es6String
    };

    /**
     * @static
     * @method arrayFind
     */
    function arrayFind() {
      if (!Array.prototype.find) {
        Array.prototype.find = function (predicate) {
          if (this === null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
          }
          if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
          }
          const list = Object(this);
          const length = list.length >>> 0;
          const thisArg = arguments[1];
          let value;

          for (let i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
              return value;
            }
          }
          return undefined;
        };
      }
    }

    /**
     * Object.assign IE11 polyfill. Credits to Mozillas folk:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
     *
     * @method objectAssign
     * @static
     */
    function objectAssign() {
      if (typeof Object.assign != 'function') { // eslint-disable-line eqeqeq
        (function () {
          Object.assign = function (target) {
            if (target === undefined || target === null) {
              throw new TypeError('Cannot convert undefined or null to object');
            }

            const output = Object(target);
            for (let index = 1; index < arguments.length; index++) {
              const source = arguments[index];
              if (source !== undefined && source !== null) {
                for (const nextKey in source) {
                  if (source.hasOwnProperty(nextKey)) {
                    output[nextKey] = source[nextKey];
                  }
                }
              }
            }
            return output;
          };
        })();
      }
    }
    // purely for internet explorer. Though I think this issue is only in EI11,not in edge?
    function es6String() {
      /*! https://mths.be/repeat v0.2.0 by @mathias */
      if (!String.prototype.repeat) {
        (function () {
          'use strict'; // needed to support `apply`/`call` with `undefined`/`null`

          let result;

          const defineProperty = (function () {
            // IE 8 only supports `Object.defineProperty` on DOM elements
            try {
              const object = {};
              const defineProperty = Object.defineProperty;
              result = defineProperty(object, object, object) && defineProperty;
            } catch (error) {
              return result;
            }
            return result;
          }());
          const repeat = function (count) {
            if (this == null) { // eslint-disable-line eqeqeq
              throw TypeError();
            }
            let string = String(this);
            // `ToInteger`
            let n = count ? Number(count) : 0;
            if (n != n) { // eslint-disable-line eqeqeq
              n = 0;
            }
            // Account for out-of-bounds indices
            if (n < 0 || n == Infinity) { // eslint-disable-line eqeqeq
              throw RangeError();
            }
            let result = '';
            while (n) {
              if (n % 2 == 1) { // eslint-disable-line eqeqeq
                result += string;
              }
              if (n > 1) {
                string += string;
              }
              n >>= 1;
            }
            return result;
          };
          if (defineProperty) {
            defineProperty(String.prototype, 'repeat', {
              value: repeat,
              configurable: true,
              writable: true
            });
          } else {
            String.prototype.repeat = repeat;
          }
        }());
      }
    }
  }
})();
