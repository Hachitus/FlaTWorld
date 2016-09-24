"use strict";

(function () {
  window.flatworld_libraries = {};
  window.flatworld_libraries.PIXI = window.PIXI;
  window.flatworld_libraries.Q = window.Q;
  window.flatworld_libraries.Hammer = window.Hammer;
  window.flatworld_libraries.Hamster = window.Hamster;
  window.flatworld_libraries.Handlebars = window.Handlebars;
  window.flatworld_libraries.log = window.log;
  window.flatworld_libraries.Howler = window.Howl;
  window.flatworld_libraries.EventEmitter = window.EventEmitter;
  window.flatworld = {};
  window.flatworld.generalUtils = {};
  window.flatworld.log = {};
  window.flatworld.objects = {};
  window.flatworld.extensions = {};
  window.flatworld.mapLayers = {};
  window.flatworld.utils = {};
  window.flatworld.factories = {};
  window.flatworld.UIs = {};
  window.flatworld.UIs.default = {};
})();
"use strict";

(function () {
  /*---------------------
  --------- API ---------
  ----------------------*/
  var loglevel = window.flatworld_libraries.log;

  loglevel.enableAll();
  /**
   * @namespace flatworld
   * @class log
   * @requires loglevel.js for frontend logging, or something similar
   **/
  window.flatworld.log = {
    debug: function debug(e, errorText) {
      loglevel.debug(errorText, e);
    },
    error: function error(e, errorText) {
      loglevel.error(errorText, e);
    }
  };
})();
'use strict';

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
      arrayFind: arrayFind,
      objectAssign: objectAssign,
      es6String: es6String
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
          var list = Object(this);
          var length = list.length >>> 0;
          var thisArg = arguments[1];
          var value;

          for (var i = 0; i < length; i++) {
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
      if (typeof Object.assign != 'function') {
        (function () {
          Object.assign = function (target) {
            if (target === undefined || target === null) {
              throw new TypeError('Cannot convert undefined or null to object');
            }

            var output = Object(target);
            for (var index = 1; index < arguments.length; index++) {
              var source = arguments[index];
              if (source !== undefined && source !== null) {
                for (var nextKey in source) {
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

          var defineProperty = function () {
            // IE 8 only supports `Object.defineProperty` on DOM elements
            try {
              var object = {};
              var defineProperty = Object.defineProperty;
              var result = defineProperty(object, object, object) && defineProperty;
            } catch (error) {}
            return result;
          }();
          var repeat = function repeat(count) {
            if (this == null) {
              throw TypeError();
            }
            var string = String(this);
            // `ToInteger`
            var n = count ? Number(count) : 0;
            if (n != n) {
              // better `isNaN`
              n = 0;
            }
            // Account for out-of-bounds indices
            if (n < 0 || n == Infinity) {
              throw RangeError();
            }
            var result = '';
            while (n) {
              if (n % 2 == 1) {
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
        })();
      }
    }
  }
})();
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.generalUtils.arrays = setupArrays();

  /*-----------------------
  --------- PUBLIC --------
  -----------------------*/
  /**
   * Array manipulation
   *
   * @namespace flatworld.generalUtils
   * @class arrays
   */
  function setupArrays() {
    return {
      flatten2Levels: flatten2Levels,
      chunkArray: chunkArray
    };

    /**
     * Flattern 2 levels deep, 2-dimensional arrays. Credits: http://stackoverflow.com/a/15030117/1523545
     *
     * @method flatten2Levels
     * @param  {Array} arr        Array to flatten
     * @return {Array}            Flattened array
     */
    function flatten2Levels(arr) {
      var _ref;

      return (_ref = []).concat.apply(_ref, _toConsumableArray(arr));
    }
    /**
     * This function takes an array and slices it to proper chunks.
     *
     * @method chunkArray
     * @param {Array} array             The array to be chunked
     * @param {Integer} chunksize       size of the chunks
     * from: http://stackoverflow.com/a/34847417/1523545
     */
    function chunkArray(array, chunkSize) {
      var result = [];

      for (var i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, chunkSize + i));
      }

      return result;
    }
  }
})();
'use strict';

(function () {
  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.generalUtils.environmentDetection = setupEnvironmentDetection();

  /*-----------------------
  --------- PUBLIC --------
  -----------------------*/
  /**
   * @namespace flatworld.generalUtils
   * @class environmentDetections
   * @return {Object}                         Holds methods in this class
   */
  function setupEnvironmentDetection() {
    return {
      isMobile: isMobile,
      isTouchDevice: isTouchDevice
    };

    /**
     * Detect mobile environment
     *
     * @method isMobile
     * @return {Boolean}
     */
    function isMobile() {
      var screenSize = screen.width <= 640 || window.matchMedia && window.matchMedia('only screen and (max-width: 640px)').matches;
      var features = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

      return features && screenSize;
    }
  }
  /**
   * Detect if device supports touch events
   *
   * @method isMobile
   * @return {Boolean}
   */
  function isTouchDevice() {
    if ('ontouchstart' in document.documentElement) {
      return true;
    } else {
      return false;
    }
  }
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var _window$flatworld_lib = window.flatworld_libraries;
  var Q = _window$flatworld_lib.Q;
  var PIXI = _window$flatworld_lib.PIXI;

  /*-----------------------
  ---------- API ----------
  -----------------------*/

  var Preload = function () {
    /**
     * Preloads assets before initializing map.
     *
     * @namespace flatworld
     * @class Preload
     * @constructor
     * @requires Q for promises
     * @todo should you use PIXI here or just https://github.com/englercj/resource-loader straight?
     */

    function Preload(baseUrl) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? { concurrency: 15, crossOrigin: false } : arguments[1];

      _classCallCheck(this, Preload);

      var concurrency = options.concurrency;


      this.preloaderClass = new PIXI.loaders.Loader(baseUrl, concurrency);
    }
    /**
     * @method resolveOnComplete
     * @return {Promise} Return promise object, that will be resolved when the preloading is finished
     **/


    _createClass(Preload, [{
      key: 'resolveOnComplete',
      value: function resolveOnComplete() {
        var promise = Q.defer();

        this.preloaderClass.load();

        this.preloaderClass.once('complete', function (loader, resources) {
          promise.resolve(loader, resources);
        });

        return promise.promise;
      }
      /**
       * @method addResource
       **/

    }, {
      key: 'addResource',
      value: function addResource(resource) {
        this.preloaderClass.add(resource);
      }
      /**
       * Preload assets
       *
       * @method loadManifest
       **/

    }, {
      key: 'loadManifest',
      value: function loadManifest() {
        return this;
      }
      /**
       * Error handler if something goes wrong when preloading
       *
       * @method setErrorHandler
       **/

    }, {
      key: 'setErrorHandler',
      value: function setErrorHandler(errorCB) {
        this.preloaderClass.on('error', errorCB);

        return this;
      }
      /**
       * Progress handler for loading. You should look easeljs docs for more information
       *
       * @method setProgressHandler
       **/

    }, {
      key: 'setProgressHandler',
      value: function setProgressHandler(progressCB) {
        this.preloaderClass.on('error', progressCB);

        return this;
      }
      /**
       * Activate sound preloading also
       *
       * @method activateSound
       **/

    }, {
      key: 'activateSound',
      value: function activateSound() {
        this.preloaderClass.installPlugin();
      }
    }]);

    return Preload;
  }();

  window.flatworld.Preload = Preload;
})();
"use strict";

(function () {
  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.utils.dataManipulation = setupDataManipulation();

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * These are utils for manipulating the data, that our classes and functions use.
   *
   * @class utils.dataManipulation
   * @return {Object}      mapObjectsToArray, flattenArrayBy1Level
   */
  function setupDataManipulation() {
    /*---------------------
    ------- API ----------
    --------------------*/
    return {
      mapObjectsToArray: mapObjectsToArray,
      flattenArrayBy1Level: flattenArrayBy1Level
    };

    /*----------------------
    ------- PUBLIC ---------
    ----------------------*/
    /**
     * Changes the data from e.g. getting objects from the map based on coordinate. The data is like this normally:
     * {
     *   units: [{
     *     {... the objects datas ...}
     *   }]
     * }
     * We change it to this:
     * [
     *   [{
     *     {... the objects datas ...}
     *   }]
     * ]
     *
     * @method mapObjectsToArray
     * @param  {Object} objects       Object that holds objects
     * @return {Array}                Returns the transformed array
     */
    function mapObjectsToArray(objects) {
      return Object.keys(objects).map(function (objGroup) {
        return objects[objGroup];
      });
    }
    /**
     * @method flattenArrayBy1Level
     * @param  {Array} objects
     */
    function flattenArrayBy1Level(objects) {
      var merged = [];

      return merged.concat.apply(merged, objects);
    }
  }
})();
'use strict';

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var PIXI = window.flatworld_libraries.PIXI;

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.utils.effects = setupEffects();

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * This module will hold the most common graphical effects used in the map. It is still very stub as the development
   * hasn't proceeded to this stage yet.
   *
   * @class utils.effects
   * @return {Object}      init, _startDragListener
   */
  function setupEffects() {
    /*---------------------
    ------- API ----------
    --------------------*/
    return {
      dropShadow: dropShadow
    };

    /*----------------------
    ------- PUBLIC ---------
    ----------------------*/
    /**
     * @method dropShadow
     * @param  {Object} options
     */
    function dropShadow() {
      /*
      var shadow  = new PIXI.filters.DropShadowFilter();
        shadow.color  = options.color;
      shadow.distance = options.distance;
      shadow.alpha  = options.alpha;
      shadow.angle  = options.angle;
      shadow.blur   = options.blur;
        this.filters = [shadow];
      */

      var options = arguments.length <= 0 || arguments[0] === undefined ? { color: '#000000', distance: 5, alpha: 0.5, amgöe: 45, blur: 5 } : arguments[0];
    }
  }
})();
'use strict';

(function () {
  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.utils.mouse = setupMouseUtils();
  window.flatworld.utils.resize = setupResizeUtils();
  window.flatworld.utils.environmentDetection = setupEnvironmentDetection();
  window.flatworld.utils.general = setupGeneral();

  /**
   * @class utils.mouse
   * @return {Object}      isRightClick, eventData.getPointerCoords, eventData.getHAMMERPointerCoords, eventMouseCoords
   */
  function setupMouseUtils() {
    return {
      isRightClick: isRightClick,
      disableContextMenu: disableContextMenu,
      eventData: {
        getPointerCoords: getPointerCoords,
        getHAMMERPointerCoords: getHAMMERPointerCoords
      },
      coordinatesFromGlobalToRelative: coordinatesFromGlobalToRelative,
      eventMouseCoords: eventMouseCoords
    };

    /**
     * Detects if the mouse click has been the right mouse button
     *
     * @method isRightClick
     * @param {Event} e   The event where the click occured
     */
    function isRightClick(e) {
      return e.which === 3;
    }
    /**
     * Disabled the right click (or something else in mobile) context menu from appearing
     */
    function disableContextMenu(canvas) {
      canvas.addEventListener('contextmenu', function (e) {
        e.preventDefault();
      });
    }
    /**
     * @method getPointerCoords
     * @param  {Event} e    Event object
     * @return {Object}
     */
    function getPointerCoords(e) {
      return {
        x: e.offsetX,
        y: e.offsetY
      };
    }
    /**
     * @method getHAMMERPointerCoords
     * @param  {Event} e    Event object
     * @return {Object}
     */
    function getHAMMERPointerCoords(e) {
      return e.center;
    }
    /**
     * Transform coordinates that are in the window to become relative with the given element
     *
     * @param  {[type]} coordinates [description]
     * @param  {[type]} element     [description]
     * @return {[type]}             [description]
     */
    function coordinatesFromGlobalToRelative(coordinates, element) {
      var elementPosition = getElementPositionInWindow(element);

      return {
        x: coordinates.x - elementPosition.x,
        y: coordinates.y - elementPosition.y
      };
    }
    /**
     * Gets given elements position relative to window
     *
     * @param  {[type]} el [description]
     * @return {[type]}    [description]
     */
    function getElementPositionInWindow(el) {
      var xPos = 0;
      var yPos = 0;

      while (el) {
        if (el.tagName.toLowerCase() === 'body') {
          // deal with browser quirks with body/window/document and page scroll
          var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
          var yScroll = el.scrollTop || document.documentElement.scrollTop;

          xPos += el.offsetLeft - xScroll + el.clientLeft;
          yPos += el.offsetTop - yScroll + el.clientTop;
        } else {
          // for all other non-BODY elements
          xPos += el.offsetLeft - el.scrollLeft + el.clientLeft;
          yPos += el.offsetTop - el.scrollTop + el.clientTop;
        }

        el = el.offsetParent;
      }
      return {
        x: xPos,
        y: yPos
      };
    }

    /**
     * @method eventMouseCoords
     * @param  {Event} e    Event object
     * @return {Object}
     */
    function eventMouseCoords(e) {
      var pos = {
        x: 0,
        y: 0
      };

      if (!e) {
        e = window.event;
      }
      if (e.pageX || e.pageY) {
        pos.x = e.pageX;
        pos.y = e.pageY;
      } else if (e.clientX || e.clientY) {
        pos.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        pos.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      // posx and posy contain the mouse position relative to the document
      // Do something with this information
      return pos;
    }
  }
  /**
   * @class utils.resize
   * @return {Object}      toggleFullScreen, setToFullSize, getWindowSize
   */
  function setupResizeUtils() {
    return {
      toggleFullScreen: toggleFullScreen,
      setToFullSize: setToFullSize,
      getWindowSize: getWindowSize,
      resizePIXIRenderer: resizePIXIRenderer
    };

    /**
     * @method toggleFullScreen
     */
    function toggleFullScreen() {
      var elem = document.body; // Make the body go full screen.
      var isInFullScreen = document.fullScreenElement && document.fullScreenElement !== null || document.mozFullScreen || document.webkitIsFullScreen;

      isInFullScreen ? cancelFullScreen(document) : requestFullScreen(elem);

      return false;

      /*-------------------------
      --------- PRIVATE ---------
      -------------------------*/
      /* global ActiveXObject */
      function cancelFullScreen(el) {
        var requestMethod = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullscreen;
        if (requestMethod) {
          // cancel full screen.
          requestMethod.call(el);
        } else if (typeof window.ActiveXObject !== 'undefined') {
          // Older IE.
          var wscript = new ActiveXObject('WScript.Shell');
          wscript !== null && wscript.SendKeys('{F11}');
        }
      }
      function requestFullScreen(el) {
        // Supports most browsers and their versions.
        var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;

        if (requestMethod) {
          // Native full screen.
          requestMethod.call(el);
        } else if (typeof window.ActiveXObject !== 'undefined') {
          // Older IE.
          var wscript = new ActiveXObject('WScript.Shell');
          wscript !== null && wscript.SendKeys('{F11}');
        }
        return false;
      }
    }
    /**
     * Sets canvas size to maximum width and height on the browser, not using fullscreen
     *
     * @method setToFullSize
     * @param {HTMLElement} context        DOMElement Canvas context
     */
    function setToFullSize(context) {
      return function fullSize() {
        var size = getWindowSize();

        context.canvas.width = size.x;
        context.canvas.height = size.y;
      };
    }
    /**
     * Get browser windows size
     *
     * @method getWindowSize
     * @param {HTMLElement} context        DOMElement Canvas context
     */
    function getWindowSize() {
      return {
        x: window.innerWidth,
        y: window.innerHeight
      };
    }
    /**
     * Resizes the PIXI renderer to the current most wide and high element status. Basically
     * canvas size === window size.
     *
     * @static
     * @method resizeRenderer
     * @param {PIXI.WebGLRenderer} renderer   The renderer for the map
     * @param {Function} drawOnNextTick       Function that handles re-rendering canvas
     */
    function resizePIXIRenderer(renderer, drawOnNextTick) {
      var windowSize = getWindowSize();

      renderer.autoResize = true; // eslint-disable-line no-param-reassign
      renderer.resize(windowSize.x, windowSize.y);
      drawOnNextTick();
    }
  }
  /**
   * @class utils.environment
   * @return {Object}      getPixelRatio
   */
  function setupEnvironmentDetection() {
    return {
      getPixelRatio: getPixelRatio };

    /**
     * @method getPixelRatio
     * @requires Canvas element in the DOM. This needs to be found
     * @param  {HTMLElement} canvasElement       HTML canvas element
     * @return {Number}
     */
    // ,
    // isMobile,
    // isMobile_detectUserAgent
    function getPixelRatio(canvasElement) {
      var DPR = window.devicePixelRatio || 1;
      var ctx = canvasElement && canvasElement.getContext('2d') || document.createElement('canvas').getContext('2d');
      var bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;

      return DPR / bsr;
    }
  }
  /**
   * @class utils.general
   * @return {Object}      pixelEpsilonEquality
   */
  function setupGeneral() {
    var PIXEL_EPSILON = 0.01;

    return {
      pixelEpsilonEquality: epsilonEquality,
      fullsizeCanvasCSS: fullsizeCanvasCSS,
      requireParameter: requireParameter
    };

    /**
     * @method epsilonEquality
     * @param  {Number} x
     * @param  {Number} y
     */
    function epsilonEquality(x, y) {
      return Math.abs(x) - Math.abs(y) < PIXEL_EPSILON;
    }
    /**
     * Setup correct css for setting up fullsize (window size) canvas
     *
     * @param {Element} canvasElement
     */
    function fullsizeCanvasCSS(canvasElement) {
      canvasElement.style.position = 'absolute';
      canvasElement.style.display = 'block';
      canvasElement.style.left = '0px';
      canvasElement.style.top = '0px';
    }
    /**
     * Helper for creating required parameters
     *
     * @param {String} className Name of the function / class used
     * @param {String} paramName Name of the parameter that is required
     */
    function requireParameter(className, paramName) {
      throw new Error('Function \'' + className + '\' requires parameter ' + paramName);
    }
  }
})();
"use strict";

(function () {
  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.utils.shapes = {
    createSquare: createSquare
  };

  function createSquare() {
    var graphics = new PIXI.Graphics();

    graphics.lineStyle(2, 0x0000FF, 1);
    graphics.drawRect(50, 250, 100, 100);

    return graphics;
  }
})();
'use strict';

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var mapLog = window.flatworld.log;

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.mapAPI = setupMapAPI();

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * Singleton. Uses JSON only data flow
   *
   * @namespace flatworld
   * @class mapApi
   * @static
   */
  function setupMapAPI() {
    var APIs = {};

    /*---------------------
    --------- API ---------
    ----------------------*/
    return {
      get: get,
      post: post,
      add: add,
      remove: remove,
      update: update,
      getAllAPIs: getAllAPIs
    };

    /*---------------------
    -------- PUBLIC -------
    ----------------------*/
    /**
     * Get data from server
     *
     * @method get
     * @param  {String} name    The indentifier for this API call / endpoint
     * @param  {Array} params   Params that are sent to the callbacks that have been attached to handle this API data
     * @return {Promise}        ES6 native Promise as the API advances
     */
    function get(type, params) {
      return _doFetch('get', type, params);
    }
    /**
     * Send data to server
     *
     * @method post
     * @param  {String} name    The indentifier for this API call / endpoint
     * @param  {Array} params   Params that are sent to the callbacks that have been attached to handle this API data. E.g. at least the
     * POST data that will be sent to server needs to be set in the callback to the object.body property.
     * @return {Promise}        ES6 native Promise as the API advances
     */
    function post(type, params) {
      return _doFetch('post', type, params);
    }
    /**
     * Add a new mapApi endpoint
     *
     * @method add
     * @param {String}    type            Basically the name of the mapAPI. Like 'moveUnit'.
     * @param {Function}  cb              Callback that returns the data that is sent to this API endpoint. Callback gets these parameters
     * 1. request type: post, get etc.
     * 2. completeData: { baseUrl, cbs }
     * 3. params: params that were sent to the mapAPI function as extra, like in post(type, params)
     * HAS to return:
     * {}.body = the data to be sent
     * {}.url = url where the data is sent to
     * @param {String}    baseUrl         The url where the mapApi queries are sent to
     */
    function add(type, cb, baseUrl) {
      if (APIs[type]) {
        mapLog.debug('API endpoint already exists and has been defined ' + type + ', ' + baseUrl + ', ' + JSON.stringify(cb));
      }

      APIs[type] = {
        baseUrl: baseUrl,
        cbs: cb ? [cb] : []
      };
    }
    /**
     * Removes mapApi endpoint
     *
     * @method remove
     * @param {String}    type            Basically the name of the mapAPI. Like 'moveUnit'.
     */
    function remove(type) {
      if (!APIs[type]) {
        mapLog.debug('API endpoint not found for removing!');
      }

      delete APIs[type];
    }
    /**
     * Add a new mapApi endpoint
     *
     * @method update
     * @param {String}    type            Basically the name of the mapAPI. Like 'moveUnit'.
     * @param {Function}  cb              Callback that returns the data that is sent to this API endpoint
     * @param {Function}  what            The update made
     */
    function update(type, cb, what) {
      if (!APIs[type] || !APIs[type].cbs) {
        mapLog.debug('API endpoint not found for updating!');
      }

      APIs[type].cbs.push(cb);
    }
    /**
     * Does the actual fetch from the API endpoint
     *
     * @method _doFetch
     * @private
     * @param  {String} fetchType   post or get
     * @param  {String} type        name of the endpoint
     * @param  {Array} params       Params that are sent to the callbacks that have been attached to handle this API data. E.g. at least
     * the POST data that will be sent to server needs to be set in the callback to the object.body property.
     * @return {Promise}            The result of the fetch
     */
    function _doFetch(fetchType, type, params) {
      if (!APIs[type]) {
        mapLog.error('API endpoint for fetch not found: ' + fetchType + '/' + type + ', ' + (params ? params[0] : 'no params'));
        return;
      }

      var completeData = APIs[type];

      APIs[type].cbs.forEach(function (cb) {
        completeData = cb(fetchType, completeData, params);
      });

      return fetch(completeData.url, {
        method: fetchType,
        body: completeData.body
      }).then(function (response) {
        return response.json();
      }).then(function (json) {
        mapLog.debug('parsed json', json);
      }).catch(function (ev) {
        mapLog.debug('mapAPI http request failed', ev);
      });
    }
    /**
     * Just returns all API endpoint definitions to be checked or modified as pleased. Only for advanced use.
     *
     * @method getAllAPIs
     * @return {Object} returns object that hosts all the API endpoint definitions
     */
    function getAllAPIs() {
      return APIs;
    }
  }
})();
'use strict';

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var EventEmitter = window.flatworld_libraries.EventEmitter;

  /*---------------------
  --------- API ---------
  ----------------------*/

  window.flatworld.mapEvents = setupMapEvents();

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * This module handles map events. Like informing map movement, object selection and other
   * changes. Not that ALL the eventlisteners and their callbacks will throw one event!
   * But that event will have no extra parameters, so when you do special things, like selecting
   * objects on the map, you should throw another event when that happens and you can pass on
   * the objects that were selected from the map.
   * This uses https://github.com/primus/eventemitter3 and follows the nodeJS event
   * conventions: https://nodejs.org/api/events.html
   * Events atm:
   * - mapdrag
   * - mapzoomed
   * - objectsSelected (in hexagon extension units.js)
   * - mapMoved
   * - mapResize
   * @namespace flatworld
   * @class mapEvents
   * @return {Object}     subsribe and publish
   * @todo add mapfullscreen, mapfullSize and check if something is missing from the list
   */
  function setupMapEvents() {
    var TIMER_FOR_SAME_TYPE = 50;
    var lastTimePublished = {};
    var EE = new EventEmitter();

    /*---------------------
    --------- API ---------
    ----------------------*/
    return {
      subscribe: subscribe,
      publish: publish,
      debounce: debounce,
      removeAllListeners: EE.removeAllListeners.bind(EE)
    };

    /*---------------------
    -------- PUBLIC -------
    ----------------------*/
    function subscribe(type, cb) {
      EE.on(type, cb);
      lastTimePublished[type] = 0;
    }
    /**
     * publish
     * @param  {String}    type   Type can be string or an object with:
     * { name: String (required), cooldown: Int, debounce: Int }.
     * @param  {...[]} data       Can hold any data with rest of the parameters
     */
    function publish() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var datas = arguments[1];

      var timestamp = new Date().getTime();
      var realType = type.name || type;

      if (lastTimePublished[realType] + (type.cooldown || TIMER_FOR_SAME_TYPE) < timestamp) {
        lastTimePublished[realType] = timestamp;
        EE.emit(realType, datas);
      }
    }

    // Function from underscore.js
    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    function debounce(func, wait, immediate) {
      var timeout = void 0;

      return function () {
        var context = this,
            args = arguments;
        var later = function later() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }
  }
})();
'use strict';

(function () {
  /*-----------------------
  ------- VARIABLES -------
  -----------------------*/
  var stateOfEvents = {};
  var activeEventListeners = {};
  var detectors = {};

  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var mapEvents = window.flatworld.mapEvents;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.eventListeners = eventListenersModule();

  /*-----------------------
  -------- PUBLIC ---------
  -----------------------*/
  /**
   * This keeps all the event listeners and detectors in one class. You add detectors / event listener types with addDetector and you add
   * event listeners with on.
   *
   * @namespace flatworld
   * @class eventListeners
   */
  function eventListenersModule() {
    /*---------------------------
    ------------ API ------------
    ---------------------------*/
    return {
      on: on,
      off: off,
      isOn: isOn,
      setActivityState: setActivityState,
      getActivityState: getActivityState,
      setDetector: setDetector,
      clearDetector: clearDetector
    };

    /*---------------------------
    ----------- PUBLIC ----------
    ---------------------------*/
    /**
     * Activates the eventListener.
     *
     * @method on
     * @throws {Error}          General error, if detector for this event type has not been set.
     * @param  {String}  type   REQUIRED. The type of event. This type has been created with setDetector.
     * @param  {Boolean} cb     REQUIRED. Callback to do it's eventlistener magic.
     */
    function on() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var cb = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (!detectors[type] && !detectors[type].size) {
        throw new Error('eventlisteners.on needs to have detector set with this event type!');
      }

      detectors[type].on(_createEventListenerWrapper('Map' + type, cb));
      activeEventListeners[type] = activeEventListeners[type] || new Set();
      activeEventListeners[type].add(cb);
    }
    /**
     * Deactivates the eventListener. Callback is optional. If is not provided will remove all this types eventListeners
     *
     * @method off
     * @param  {String}  type   REQUIRED. The type of event. This type has been created with setDetector.
     * @param  {Boolean} cb     Callback to do it's eventlistener magic.
     */
    function off() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var cb = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      detectors[type].off(cb);
      cb ? activeEventListeners[type].delete(cb) : delete activeEventListeners[type];
    }
    /**
     * Activates the eventListener. Callback is optional. If is not provided will check if the eventlistener type has any listeners active.
     *
     * @method isOn
     * @param  {String}  type   REQUIRED. The type of event. This type has been created with setDetector.
     * @param  {Boolean} cb     Callback to do it's eventlistener magic.
     */
    function isOn() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var cb = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var answer;

      answer = cb ? activeEventListeners[type].has(cb) : !!activeEventListeners[type].size;

      return answer;
    }
    /**
     * Sets the state of the event. State is very important e.g. for fluent dragging and selecting. When we start to drag, we avoid
     * selecting units and vice versa, when we keep an event state tracking through this.
     *
     * @method setActivityState
     * @param {String} type        EventType
     * @param {Boolean} newState   The new state value
     */
    function setActivityState(type, newState) {
      stateOfEvents[type] = newState;
    }
    /**
     * get activity state of the event
     *
     * @method getActivityState
     * @param  {String} type   EventType
     * @return {Boolean}
     */
    function getActivityState() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      return stateOfEvents[type];
    }
    /**
     * Set event detector. If there is already detector of this type, we overwrite it.
     *
     * @method setDetector
     * @param {String}   type    Event type
     * @param {Function} cbOn    Callback which sets activates the detector
     * @param {Function} cbOff   Callback which sets deactivates the detector
     */
    function setDetector() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var cbOn = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
      var cbOff = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

      detectors[type] = {};
      detectors[type] = {
        on: cbOn,
        off: cbOff
      };
    }
    /**
     * Clear event detector. We also remove all possible eventlisteners set on this event type.
     *
     * @method clearDetector
     * @param {String}   type  Event type
     */
    function clearDetector() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      /* remove all event listeners before we empty the data */
      activeEventListeners[type].forEach(function (cb) {
        detectors[type].cbOff(cb);
      });

      /* remove all data / references to event listeners and detector */
      delete activeEventListeners[type];
      delete detectors[type];
    }

    /*-----------------------------
    ----------- PRIVATE -----------
    ------------------------------*/
    /**
     * This creates a wrapper for callback. The idea is to send map events from this wrapper for all events.
     *
     * @private
     * @static
     * @method _createEventListenerWrapper
     * @param  {String}   type   Event type
     * @param  {Function} cb     Event callback
     */
    function _createEventListenerWrapper(type, cb) {
      /* NOTE! There can be more than one arguments in an event. E.g. Hamster.js */
      return function () {
        /**
         * @event Event gets fired when the specific eventListener trigger. The name consists of "Map" + the given event type, like such:
         * "MapDrag"
         */
        mapEvents.publish(type);
        cb.apply(undefined, arguments);
      };
    }
  }
})();
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var PIXI = window.flatworld_libraries.PIXI;
  var generalUtils = window.flatworld.generalUtils;

  /*---------------------
  ------ VARIABLES ------
  ---------------------*/

  var _UIObjects = [];

  /*---------------------
  -------- EXPORT -------
  ---------------------*/

  var MapLayer = function (_PIXI$Container) {
    _inherits(MapLayer, _PIXI$Container);

    /**
     * Creates a basic layer for the Map. This type of layer can not hold subcontainers. Note that different devices and graphic cards can
     * only have specific size of bitmap drawn, and PIXI cache always draws a bitmap thus the default is: 4096, based on this site:
     * http://webglstats.com/ and MAX_TEXTURE_SIZE. This is important also when caching.
     *
     * @namespace flatworld.maplayers
     * @class MapLayer
     * @constructor
     * @param {Object} options                            optional options
     * @param {String} options.name                       Layers name, used for identifying the layer. Useful in debugging, but can be
     * used for finding correct layers too
     * @param  {Object} options.coord                   coord starting coords of layer. Relative to parent map layer.
     * @param  {Integer} options.coord.x         X coordinate
     * @param  {Integer} options.coord.y         Y coordinate
     * @param  {Object} options.specialLayer            Is this layer special (e.g. UILayer not included in normal operations)
     * @param  {Integer} options.specialLayer.x         X coordinate
     * @param  {Integer} options.specialLayer.y         Y coordinate
     **/

    function MapLayer() {
      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref$name = _ref.name;
      var name = _ref$name === undefined ? '' : _ref$name;
      var _ref$coord = _ref.coord;
      var coord = _ref$coord === undefined ? { x: 0, y: 0 } : _ref$coord;
      var _ref$specialLayer = _ref.specialLayer;
      var specialLayer = _ref$specialLayer === undefined ? false : _ref$specialLayer;
      var _ref$zoomLayer = _ref.zoomLayer;
      var zoomLayer = _ref$zoomLayer === undefined ? true : _ref$zoomLayer;
      var _ref$selectable = _ref.selectable;
      var selectable = _ref$selectable === undefined ? false : _ref$selectable;

      _classCallCheck(this, MapLayer);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MapLayer).call(this));

      Object.assign(_this, coord);

      /**
       * Layers name, used for identifying the layer. Useful in debugging, but can be used for finding correct layers too
       *
       * @attribute name
       * @type {String}
       */
      _this.name = '' + name;
      /**
       * Is this layer special (e.g. UILayer not included in normal operations)
       *
       * @attribute specialLayer
       * @type {Boolean}
       */
      _this.specialLayer = !!specialLayer;
      /**
       * Will this layer change dynamically or can we assume that this holds the same objects always, until game reload
       *
       * @attribute static
       * @type {Boolean}
       */
      _this.zoomLayer = !!zoomLayer;
      /**
       * Can you select objects from this layer. For example with Map.getObjectsUnderArea
       *
       * @attribute selectable
       * @type {Boolean}
       */
      _this.selectable = selectable;
      /**
       * Every added UIObject will be listed here for removal and updating. The indexes in the list provide the easy option to remove only
       * certain object from the UIObjects.
       *
       * @attribute UIObjectList
       * @type {Array}
       */
      _this.UIObjectList = {};
      return _this;
    }
    /**
     * Does this layer use subcontainers.
     *
     * @method hasSubcontainers
     * @return {Boolean} true = uses subcontainers.
     */


    _createClass(MapLayer, [{
      key: 'hasSubcontainers',
      value: function hasSubcontainers() {
        return this.subcontainersConfig.width && this.subcontainersConfig.height ? true : false;
      }
      /**
       * Move layer based on given amounts
       *
       * @method move
       * @param  {Object} coord            The amount of x and y coordinates we want the layer to move. I.e. { x: 5, y: 0 }. This would move
       * the map 5 pixels horizontally and 0 pixels vertically
       * @param  {Integer} coord.x         X coordinate
       * @param  {Integer} coord.y         Y coordinate
       **/

    }, {
      key: 'move',
      value: function move(coord) {
        this.x += coord.x;
        this.y += coord.y;
      }
      /**
       * set layer zoom
       *
       * @method setZoom
       * @param {Number} amount The amount that you want the layer to zoom.
       * @return {Number} The same amount that was given, except after transform to 2 decimals and type cast to Number
       * */

    }, {
      key: 'setZoom',
      value: function setZoom(amount) {
        this.scale.x = this.scale.y = +amount.toFixed(2);

        return this.scale.x;
      }
      /**
       * get layer zoom
       *
       * @method getZoom
       * @return {Boolean} current amount of zoom
       * */

    }, {
      key: 'getZoom',
      value: function getZoom() {
        return this.scale.x;
      }
      /**
      * get UIObjects on this layer, if there are any, or defaulty empty array if no UIObjects are active
      *
      * @method getUIObjects
      * @return {Array} current UIObjects
      * */

    }, {
      key: 'getUIObjects',
      value: function getUIObjects() {
        return _UIObjects;
      }
      /**
       * Get primary layers, that this layer holds as children. So basically all children that are not special layers (such as UI layers etc.)
       *
       * @method getPrimaryLayers
       * @return {Array}                            Primary children layers under this layer
       * */

    }, {
      key: 'getPrimaryLayers',
      value: function getPrimaryLayers() {
        var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var filters = _ref2.filters;

        return this.children.filter(function (thisChild) {
          if (filters && filters.doesItFilter("layer") && !filters.filter(thisChild).length || thisChild.specialLayer) {
            return false;
          }

          return true;
        });
      }
      /**
       * Get all objects that are this layers children or subcontainers children. Does not return layers, but the objects. Works on primary layer only currently. So can not seek for complicated children structure, seeks only inside subcontainers.
       *
       * @method getObjects
       * @return {Array}            All the objects (not layers) found under this layer
       * */

    }, {
      key: 'getObjects',
      value: function getObjects(filter) {
        var allObjects = [];
        var willFilter = filter && filter.doesItFilter("object");
        var objects = void 0;

        if (this.hasSubcontainers()) {
          this.getSubcontainers().forEach(function (subcontainer) {
            if (willFilter) {
              objects = subcontainer.children.filter(function (o) {
                return !!filter.filter(o).length;
              });
            } else {
              objects = subcontainer.children;
            }

            allObjects.push(objects);
          });
        }

        return generalUtils.arrays.flatten2Levels(allObjects);
      }
      /**
       * Create and add special layer, that holds UI effects in it. UILayer is normally positioned as movableLayers 3rd child. And the
       * actual UI stuff is added there.
       *
       * @method createUILayer
       * @param  {String} name          name of the layer
       * @param  {Object} coord         Coordinates of the layer
       * @param  {Integer} coord.x      X coordinate
       * @param  {Integer} coord.y      Y coordinate
       * @return {MapLayer}            The created UI layer
       **/

    }, {
      key: 'createUILayer',
      value: function createUILayer() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? 'default UI layer' : arguments[0];
        var coord = arguments.length <= 1 || arguments[1] === undefined ? { x: 0, y: 0 } : arguments[1];

        var layer = new MapLayer(name, coord);

        layer.specialLayer = true;
        this.addChild(layer);

        this.UILayer = layer;

        return layer;
      }
      /**
       * Return the UILayer. If no UILayer is yet created, will return undefined
       *
       * @method getUILayer
       * @return {MapLayer | undefined}
       */

    }, {
      key: 'getUILayer',
      value: function getUILayer() {
        return this.UILayer;
      }
      /**
       * Adds and object to this layers UILayer child. If an object with the same name already exists, we remove it automatically and replace
       * it with the new object given as parameter.
       *
       * @method addUIObject
       * @param {Object} object   The UI object to be added under this layer
       * @param {Object} UIName   Name of the UI object. This is important as you can use it to remove the UI object later or replace it.
       * @return {Array}          All the UIObjects currently on this layer
       */

    }, {
      key: 'addUIObject',
      value: function addUIObject(object, UIName) {
        var UILayer;
        _UIObjects = _UIObjects || [];

        /* We remove the old UIObject with the same name, if it exists. */
        if (UIName && this.UIObjectList[UIName]) {
          this.deleteUIObjects(UIName);
        }

        this.UIObjectList[UIName] = object;

        if (!this.getUILayer()) {
          UILayer = this.createUILayer();
        } else {
          UILayer = this.getUILayer;
        }

        this.UILayer.addChild(object);
        _UIObjects.push(object);

        return _UIObjects;
      }
      /**
       * If object is given, removes that object, otherwiseRemove all the UIObjects from this layer
       *
       * @method deleteUIObjects
       * @param {Object} object   If you wish to delete particular object
       * @return {Array} empty    UIObjects array
       * */

    }, {
      key: 'deleteUIObjects',
      value: function deleteUIObjects(UIName) {
        var _this2 = this;

        var UILayer = this.getUILayer();

        if (UIName) {
          var object = this.UIObjectList[UIName];

          UILayer.removeChild(object);
          object = null;
          return;
        }

        Object.keys(this.UIObjectList).map(function (index) {
          var object = _this2.UIObjectList[index];

          UILayer.removeChild(object);
          object = null;
        });

        return _UIObjects;
      }
    }]);

    return MapLayer;
  }(PIXI.Container);

  var MapLayerParent = function (_MapLayer) {
    _inherits(MapLayerParent, _MapLayer);

    /**
     * Layer designed to hold subcontainers. But can handle objects too. Different devices graphic cards can only have specific size of
     * bitmap drawn, and PIXI cache always draws a bitmap. Thus the default is: 4096, based on this site: http://webglstats.com/ and
     * MAX_TEXTURE_SIZE
     *
     * @class MapLayerParent
     * @constructor
     * @param {Object} options
     * @param {String} options.name                    name layer property name, used for identifiying the layer, usefull in debugging,
     * but used also otherwise too
     * @param  {Object} options.coord                  starting coords of layer. Relative to parent map layer.
     * @param  {Integer} options.coord.x               X coordinate
     * @param  {Integer} options.coord.y               Y coordinate
     * @param  {Object} options.subcontainers          Subontainer size. If given activated subcontainers, otherwise not.
     * @param  {Integer} options.subcontainers.width   width (in pixels)
     * @param  {Integer} options.subcontainers.height  height (in pixels)
     * @param {Boolean} options.specialLayer           Is this special layer or not.
     */

    function MapLayerParent() {
      var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref3$name = _ref3.name;
      var name = _ref3$name === undefined ? '' : _ref3$name;
      var _ref3$coord = _ref3.coord;
      var coord = _ref3$coord === undefined ? { x: 0, y: 0 } : _ref3$coord;
      var _ref3$subcontainers = _ref3.subcontainers;
      var subcontainers = _ref3$subcontainers === undefined ? { width: 0, height: 0, maxDetectionOffset: 100 } : _ref3$subcontainers;
      var _ref3$specialLayer = _ref3.specialLayer;
      var specialLayer = _ref3$specialLayer === undefined ? false : _ref3$specialLayer;
      var _ref3$zoomLayer = _ref3.zoomLayer;
      var zoomLayer = _ref3$zoomLayer === undefined ? true : _ref3$zoomLayer;
      var _ref3$selectable = _ref3.selectable;
      var selectable = _ref3$selectable === undefined ? false : _ref3$selectable;

      _classCallCheck(this, MapLayerParent);

      var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(MapLayerParent).call(this, arguments[0]));

      _this3.oldAddChild = _get(Object.getPrototypeOf(MapLayerParent.prototype), 'addChild', _this3).bind(_this3);
      _this3.subcontainersConfig = subcontainers;
      _this3.subcontainerList = [];
      _this3.selectable = selectable;
      _this3.specialLayer = specialLayer;
      return _this3;
    }
    /**
     * We override the PIXIs own addchild functionality. Since we need to support subcontainers in
     * addChild. We check subcontainers and
     * then we call the original (PIXIs) addChild
     *
     * @method addChild
     * @param {PIXI.DisplayObject} displayObject      PIXI.DisplayObject
     */


    _createClass(MapLayerParent, [{
      key: 'addChild',
      value: function addChild(displayObject) {
        if (this.hasSubcontainers()) {
          var correctContainer = setCorrectSubcontainer(displayObject, this);
          this.oldAddChild(correctContainer);
        } else {
          this.oldAddChild(displayObject);
        }

        return displayObject;
      }
      /**
       * Returns the configurations set for subcontainers.
       *
       * @method getSubcontainerConfigs
       */

    }, {
      key: 'getSubcontainerConfigs',
      value: function getSubcontainerConfigs() {
        return this.subcontainersConfig;
      }
      /**
       * Returns subcontainers based on the given coordinates. Can be applied through a MapDataManipulator filter also.
       *
       * @method getSubcontainersByCoordinates
       * @param  {Object} coordinates
       * @param  {Integer} coordinates.x                  X coordinate
       * @param  {Integer} coordinates.y                  Y coordinate
       * @param  {MapDataManipulator} options.filter      Filter for selecting only certain subcontainers
       */

    }, {
      key: 'getSubcontainersByCoordinates',
      value: function getSubcontainersByCoordinates(coordinates) {
        if (!this.hasSubcontainers()) {
          throw new Error('tried to retrieve subcontainers, when they are not present');
        }

        var foundSubcontainers;

        foundSubcontainers = _getClosestSubcontainers(this, coordinates);

        return foundSubcontainers;
      }
      /**
       * @method getSubcontainers
       */

    }, {
      key: 'getSubcontainers',
      value: function getSubcontainers() {
        return generalUtils.arrays.flatten2Levels(this.subcontainerList);
      }
    }]);

    return MapLayerParent;
  }(MapLayer);

  var MapSubcontainer = function (_PIXI$Container2) {
    _inherits(MapSubcontainer, _PIXI$Container2);

    /**
     * Subcontainers are containers that hold objects like units and terrain etc. under them. They have some restrictions atm. since they
     * are PIXI.ParticleContainers. But when needed we can extend MapLayers with another class which is subcontainer, but not
     * ParticleContainer at the present there is no need, so we won't extend yet. Subcontainers help the layers to make better movement of
     * the map, by making subcontainers visible or invisible and even helping with selecting objects on the map. Thus we don't need to use
     * our inefficient Quadtree. The intention was to use PIXI.ParticleContainer for this, but it seems it doesn't clean up the memory
     * afterwards the same way as normal Container.
     *
     * @private
     * @class MapSubcontainer
     * @constructor
     * @param  {Object} size              Subontainer size. If given activated subcontainers, otherwise not.
     * @param  {Integer} size.width       width (in pixels)
     * @param  {Integer} size.height      height (in pixels)
     */

    function MapSubcontainer(size) {
      _classCallCheck(this, MapSubcontainer);

      var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(MapSubcontainer).call(this));

      _this4.specialLayer = true;
      _this4.size = size;
      _this4.selectable = false;
      return _this4;
    }
    /**
     * Gets this subcontainers coordinates and size
     *
     * @method getSubcontainerArea
     * @param {Number} scale                              The size of scale the map currently has
     * @param {Boolean} options.toGlobal                  Do we get the global coordinates or local
     * @return {Object}                                   x, y, width and height returned inside object.
     */


    _createClass(MapSubcontainer, [{
      key: 'getSubcontainerArea',
      value: function getSubcontainerArea() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? { toGlobal: true } : arguments[0];

        var coordinates;

        coordinates = options.toGlobal ? this.toGlobal(new PIXI.Point(0, 0)) : this;

        return {
          x: Math.round(coordinates.x),
          y: Math.round(coordinates.y),
          width: Math.round(this.size.width),
          height: Math.round(this.size.height)
        };
      }
    }]);

    return MapSubcontainer;
  }(PIXI.Container);

  var MinimapLayer = function (_PIXI$Container3) {
    _inherits(MinimapLayer, _PIXI$Container3);

    /**
     * Subcontainers are containers that hold objects like units and terrain etc. under them. They have some restrictions atm. since they
     * are PIXI.ParticleContainers. But when needed we can extend MapLayers with another class which is subcontainer, but not
     * ParticleContainer at the present there is no need, so we won't extend yet. Subcontainers help the layers to make better movement of
     * the map, by making subcontainers visible or invisible and even helping with selecting objects on the map. Thus we don't need to use
     * our inefficient Quadtree. The intention was to use PIXI.ParticleContainer for this, but it seems it doesn't clean up the memory
     * afterwards the same way as normal Container.
     *
     * @private
     * @class MapSubcontainer
     * @constructor
     * @param  {Object} size              Subontainer size. If given activated subcontainers, otherwise not.
     * @param  {Integer} size.width       width (in pixels)
     * @param  {Integer} size.height      height (in pixels)
     */

    function MinimapLayer(size) {
      _classCallCheck(this, MinimapLayer);

      var _this5 = _possibleConstructorReturn(this, Object.getPrototypeOf(MinimapLayer).call(this));

      _this5.specialLayer = true;
      _this5.targetSize = size;
      _this5.selectable = false;
      return _this5;
    }

    return MinimapLayer;
  }(PIXI.Container);
  /*---------------------
  ------- PRIVATE -------
  ----------------------*/
  /**
   * Helper function for setting subcontainers to parent containers. Adds subcontainers when
   * needed. Subcontainers are not and can not be initialized at the start as we won't know the
   * size of the parent container. Container is always dynamic in size.
   *
   *
   * @method setCorrectSubcontainer
   * @private
   * @static
   * @method setCorrectSubcontainer
   * @param {PIXI.DisplayObject} displayObject
   * @param {Object} parentLayer
   */


  function setCorrectSubcontainer(displayObject, parentLayer) {
    var subcontainersConfig = parentLayer.subcontainersConfig;
    var subcontainerList = parentLayer.subcontainerList;

    var xIndex = Math.floor(displayObject.x / subcontainersConfig.width);
    var yIndex = Math.floor(displayObject.y / subcontainersConfig.height);
    var thisSubcontainer;

    subcontainerList[xIndex] = subcontainerList[xIndex] || [];
    thisSubcontainer = subcontainerList[xIndex][yIndex] = subcontainerList[xIndex][yIndex] || [];

    if (subcontainerList[xIndex][yIndex].length <= 0) {
      thisSubcontainer = new MapSubcontainer({
        x: xIndex * subcontainersConfig.width,
        y: yIndex * subcontainersConfig.height,
        width: subcontainersConfig.width,
        height: subcontainersConfig.height
      });

      subcontainerList[xIndex][yIndex] = thisSubcontainer;
      thisSubcontainer.x = xIndex * subcontainersConfig.width;
      thisSubcontainer.y = yIndex * subcontainersConfig.height;
      thisSubcontainer.visible = !subcontainersConfig.isHiddenByDefault;
    }

    displayObject.x -= thisSubcontainer.x;
    displayObject.y -= thisSubcontainer.y;
    subcontainerList[xIndex][yIndex].addChild(displayObject);

    return subcontainerList[xIndex][yIndex];
  }
  /**
   * Get the closest subcontainers of the given area.
   *
   * @method setCorrectSubcontainer
   * @private
   * @static
   * @method _getClosestSubcontainers
   * @param  {Object} layer                         Instance of PIXI.Container - The layer being used
   * @param  {Object} givenCoordinates              Coordinates or rectangle
   * @param  {Integer} givenCoordinates.x           x coordinate
   * @param  {Integer} givenCoordinates.y           y coordinate
   * @param  {Integer} givenCoordinates.width       width of the rectangle
   * @param  {Integer} givenCoordinates.height      height of the rectangle
   * @param  {Object} options                       Optional options.
   * @return {Array}                                Array of found subcontainers.
   */
  function _getClosestSubcontainers(layer, givenCoordinates) {
    var _layer$getSubcontaine = layer.getSubcontainerConfigs();

    var width = _layer$getSubcontaine.width;
    var height = _layer$getSubcontaine.height;
    var maxDetectionOffset = _layer$getSubcontaine.maxDetectionOffset;

    var coordinates = {
      x: givenCoordinates.x >= 0 ? givenCoordinates.x - maxDetectionOffset : -maxDetectionOffset,
      y: givenCoordinates.y >= 0 ? givenCoordinates.y - maxDetectionOffset : -maxDetectionOffset,
      width: (givenCoordinates.width || 0) + maxDetectionOffset * 2,
      height: (givenCoordinates.height || 0) + maxDetectionOffset * 2
    };
    var allFoundSubcontainers = [];
    var xIndex = Math.floor(coordinates.x / width);
    var yIndex = Math.floor(coordinates.y / height);
    var x2 = coordinates.width ? coordinates.x + coordinates.width : +coordinates.x;
    var y2 = coordinates.height ? coordinates.y + coordinates.height : +coordinates.y;
    var widthIndex = Math.floor(x2 / width);
    var heightIndex = Math.floor(y2 / height);
    var subcontainerList = layer.subcontainerList;

    for (var thisXIndex = xIndex; thisXIndex <= widthIndex; thisXIndex++) {
      if (thisXIndex >= 0 && subcontainerList && subcontainerList[thisXIndex]) {
        for (var thisYIndex = yIndex; thisYIndex <= heightIndex; thisYIndex++) {
          if (thisYIndex >= 0 && subcontainerList[thisXIndex][thisYIndex]) {
            allFoundSubcontainers.push(subcontainerList[thisXIndex][thisYIndex]);
          }
        }
      }
    }

    return allFoundSubcontainers;
  }

  window.flatworld.mapLayers = window.flatworld.mapLayers || {};
  window.flatworld.mapLayers.MapLayer = MapLayer;
  window.flatworld.mapLayers.MapLayerParent = MapLayerParent;
  window.flatworld.mapLayers.MinimapLayer = MinimapLayer;
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function mapDataManipulatorCreator() {
  /*-----------------------
  ------- VARIABLES -------
  -----------------------*/
  var mapLayers = window.flatworld.mapLayers;
  var objects = window.flatworld.objects;
  var utils = window.flatworld.utils;

  /*---------------------
  --------- API ---------
  ----------------------*/

  var MapDataManipulator = function () {
    /**
     * Class to get a consistent standard for the engine to be able to filter objects, when
     * etrieving or sorting them. This is used
     * when some method uses filters.
     *
     * You must provide an object that defines how the given objects should be filtered, when
     * constructing. The module will filter with every rule and object given and everything that
     * doesn't pass one of the given filters, will be dropped out.
     *
     * Given filters look something like this:
     * {
     *   type: 'filter',
     *   object: 'layer',
     *   property: 'selectable', // THIS can also be an array, like: ['data', 'a'] => data.a
     *   value: true,
     * }
     * For more information, please check the mapDataManipulatorSpec.js (test) for now.
     *
     * @namespace flatworld
     * @class MapDataManipulator
     * @constructor
     * @param {Array|Object} rules        REQUIRED. The rules that apply for this instance.
     * Multiple rules in Array or one as Object.
     **/

    function MapDataManipulator() {
      var rules = arguments.length <= 0 || arguments[0] === undefined ? utils.general.requireParameter('MapDataManipulator', 'rules') : arguments[0];

      _classCallCheck(this, MapDataManipulator);

      this.rules = Array.isArray(rules) ? rules : [rules];
      this.classes = {
        layer: Object.keys(mapLayers).map(function (k) {
          return mapLayers[k];
        }),
        object: Object.keys(objects).map(function (k) {
          return objects[k];
        })
      };
    }
    /**
     * This has exceptional query, since it actually queries it's parent. Subcontainers have
     * really no useful values and they are dumb
     * containers of objects, every data is on their parent container
     *
     * @method filter
     * @param  {Array | Object} objects     The objects that are being filtered
     * @return {Array}                      The found objects in an Array
     */


    _createClass(MapDataManipulator, [{
      key: 'filter',
      value: function filter(objects) {
        var _this = this;

        var found;

        if (!Array.isArray(objects)) {
          found = this._runRule(objects) ? [objects] : [];
        } else {
          found = objects.filter(function (object) {
            return _this._runRule(object);
          });
        }

        return found;
      }
      /**
       * adds a filter rule
       *
       * @method addRule
       * @param {} rules        Rules to add
       */

    }, {
      key: 'addRule',
      value: function addRule(rules) {
        this.rules.concat(rules);
      }

      /** @todo I think this should be implemented. But it's a small optimization so don't bother yet. Basically the idea is to ONLY use the filters that each situation requires. Not iterate through the unneeded filters */

    }, {
      key: 'getOnlyFiltersOf',
      value: function getOnlyFiltersOf() /*type*/{}

      /**
       * Checks if this filter instance is set to filter the given type.
       *
       * @param  {string} type   Type of the filter we want to check
       * @return {Boolean}
       */

    }, {
      key: 'doesItFilter',
      value: function doesItFilter(type) {
        return this.rules.some(function (o) {
          return o.object === type;
        });
      }
      /**
       * This is the actual method that runs through the rules and arranges the data
       *
       * @method _runRule
       * @private
       * @param {Array} [varname] [description]
       **/

    }, {
      key: '_runRule',
      value: function _runRule(object) {
        var _this2 = this;

        var ruleMatches = true;
        var matchedType;

        Object.keys(this.classes).forEach(function (type) {
          var filtered = _this2.classes[type].filter(function (thisClass) {
            return object instanceof thisClass;
          });

          matchedType = filtered.length ? type : matchedType;
        });

        this.rules.forEach(function (rule) {
          if (rule.type === 'filter') {
            if (rule.object !== matchedType) {
              return;
            }

            if (matchedType === 'layer') {
              ruleMatches = _this2._getObject(object, rule);
            } else if (matchedType === 'object') {
              ruleMatches = _this2._getObject(object, rule);
            }
          }
        });

        return ruleMatches;
      }
      /**
       * This is the actual method that runs through the rules and arranges the data
       *
       * @method _getObject
       * @private
       * @return {[type]} [description]
       **/

    }, {
      key: '_getObject',
      value: function _getObject(object, rule) {
        var result = false;

        if (Array.isArray(rule.property)) {
          try {
            result = '' + MapDataManipulator.getPropertyWithArray(object, rule.property, 0) === '' + rule.value;
          } catch (e) {
            return false;
          }
        } else {
          result = object[rule.property] === rule.value;
        }

        return result;
      }
    }], [{
      key: 'getPropertyWithArray',
      value: function getPropertyWithArray(obj, array, index) {
        var currentProperty = array[index];
        var thisLevel = obj[currentProperty];

        if (array[index + 1]) {
          return MapDataManipulator.getPropertyWithArray(thisLevel, array, ++index);
        } else {
          return thisLevel;
        }
      }
    }]);

    return MapDataManipulator;
  }();

  MapDataManipulator.OBJECT_LAYER = 'layer';
  MapDataManipulator.OBJECT_OBJECT = 'object';

  window.flatworld.MapDataManipulator = MapDataManipulator;
})();
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var mapLog = window.flatworld.log;

  /*---------------------
  ------ VARIABLES ------
  ----------------------*/
  var scope;

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * Main class for showing UI on the map, like unit selections, movements and such. Has nothing to do with showing off-map data, like
   * datagrams of the resources player has or other players status etc.
   * Good examples for what this shows are: selected units-list, selection highlight (like a circle on the selected unit), unit movement.
   * How it works is that this is basically the interface that shows what the UI theme class can (or must) implement.
   *
   * @namespace flatworld
   * @class UI
   * @static
   * @param {Object} UITheme        Module that will be used for the UI theme
   * @param {Map} givenMap          Map instance that is used
   * @return {Object}               UI module
  */
  function UI(UITheme, givenMap) {
    var map;

    /* SINGLETON MODULE */
    if (scope) {
      return scope;
    }

    if (!UITheme || !givenMap) {
      throw new Error('UI-module requires UITheme and map object, This is an singletong class, so it\'s possible it should have been ' + 'already called earlier');
    }

    map = givenMap;
    scope = {};

    /**
     * Responsible for showing what objects have been selected for inspection or if the player selects only one object, we hightlihgt it.
     * For example if there are several objects in one tile on the map and the player needs to be able to select one
     * specific unit on the stack. This is always defined in the UI theme-module Selecting one unit, highlight it, which means,
     * e.g. bringing the unit on top on the map and showing selection circle around it.
     *
     * @method showSelections
     * @static
     * @param  {Array|Object} objects           Objects that have been selected.
     * @param {Object} getDatas                 This is an object made of functions, that get wanted data from the object. For example if
     * you have objects name in object.data.specialData.name, then you have an object getDatas.name(), which retrieves this. This should be
     * standardized maybe in MapDataManipulator, so that we can change the template between different game setups easier. Lets say if one
     * game modification has different attributes than another, then maybe it should still have standard interface.
     * @param {Object} getDatas.name            Retrieves object name
     * @param {Object} {}                       Extra options
     * @param {MapDataManipulator} {}.filters   Filters objects
     * @param {Object} {}.options               Extra options that are passed to the UITheme class
     * @return {Boolean}
     *
     * @todo the getDatas function should be standardized, so that most UIs would work with most different setups.
     * */
    scope.showSelections = function (objects, getDatas) {
      var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var filters = _ref.filters;
      var UIThemeOptions = _ref.UIThemeOptions;

      if (filters) {
        objects = filters.filterObjects(objects);
      }

      objects = Array.isArray(objects) ? objects : [objects];

      if (objects.length === 1) {
        return UITheme.highlightSelectedObject(objects[0], getDatas, UIThemeOptions);
      } else if (objects.length > 1) {
        return UITheme.showSelections(objects, getDatas, UIThemeOptions);
      } else {
        // Delete the UI objects, as player clicked somewhere that doesn't have any selectable objects
        return UITheme.showSelections([]);
      }

      mapLog.error('No objects found' + objects.length);
      return [];
    };
    /**
     * Shows arrow or movement or what ever to indicate the selected unit is moving to the given location
     *
     * @method showUnitMovement
     * @static
     * @param {Object} object         Unit that the player wants to move
     * @param {Object} to             Coordinates where the unit is being moved to
     * @param {Object} options        Extra options. Like dropping a shadow etc.
     * */
    scope.showUnitMovement = function (objects, to) {
      var _ref2 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var UIThemeOptions = _ref2.UIThemeOptions;

      if (Array.isArray(objects) || (typeof objects === 'undefined' ? 'undefined' : _typeof(objects)) !== 'object' || objects === null) {
        mapLog.error('Object was an Array, should be plain object: ' + objects.length);
      }

      return UITheme.showUnitMovement(objects, to, UIThemeOptions);
    };

    /**
     * Adds a new method to this class
     *
     * @method extend
     * @static
     * @param  {String} newMethod   Name of the new method
     */
    scope.extend = function (newMethod) {
      scope[newMethod] = function () {
        UITheme[newMethod]();
      };
    };

    return scope;
  }

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.UI = UI;
})();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  /*---------------------
  --------- API ---------
  ----------------------*/

  var ObjectManager = function () {
    /**
     * this module is responsible for doing hitTesting, like returning the units on certain clicked coordinates or when objects or areas
     * collide with each other.
     *
     * @namespace flatworld
     * @class ObjectManager
     * @constructor
     * @todo It might be a good idea to make the hitDetection more extensive. Now it just uses point or rectangle / bounds to detect hits.
     * It could use sprites or forms.
     */

    function ObjectManager() {
      _classCallCheck(this, ObjectManager);
    }
    /**
     * Retrieve objects under certain coordinates or area, if size is given. Uses subcontainers when used, no other options yet.
     *
     * @method retrieve
     * @param {Object} allCoords                                The coordinates which we want to hitTest
     * @param {x:Integer, y:Integer} allCoords.globalCoords     Global coordinates on static layer / canvas
     * @param {x:Integer, y:Integer} allCoords.globalCoords.x
     * @param {x:Integer, y:Integer} allCoords.globalCoords.y
     * @param {Object} allCoords.localCoords                    Local coordiantes on movable layer
     * @param {x:Integer, y:Integer} allCoords.localCoords.x
     * @param {x:Integer, y:Integer} allCoords.localCoords.y
     * @param {string} type                                     type of the object / layer that we want to retrieve
     * @param {Object} options                                  optional options
     * @param {Array} options.subcontainers                     The subcontainers we match against
     * @param {Object} options.size                             Size of the rectangle area to match against, if we want to match rectangle
     * instead of one point
     * @param {Integer} options.size.width
     * @param {Integer} options.size.height
     * @return {Array}                                          matched objects
     *
     * @todo add checks for rectangles. Now we can only check with width = 0 && height = 0
     */


    _createClass(ObjectManager, [{
      key: "retrieve",
      value: function retrieve(allCoords) {
        var containers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
        var options = arguments.length <= 2 || arguments[2] === undefined ? { type: undefined, size: { width: 0, height: 0 } } : arguments[2];
        var size = options.size;
        var type = options.type;
        var globalCoords = allCoords.globalCoords;

        var foundObjs = [];

        if (containers.length > 0) {
          containers.forEach(function (container) {
            foundObjs = foundObjs.concat(container.children);
          });

          if (!size.width || !size.height) {
            foundObjs = filterChildren(globalCoords, foundObjs, type);
          }
        } else {
          return [];
        }

        return foundObjs;
      }
    }]);

    return ObjectManager;
  }();

  window.flatworld.ObjectManager = ObjectManager;
})();

function filterChildren(globalCoords) {
  var children = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
  var type = arguments.length <= 2 || arguments[2] === undefined ? undefined : arguments[2];

  return children.filter(function (obj) {
    if (type && type !== obj.type) {
      return false;
    }

    var isHit = obj.hitTest ? obj.hitTest(globalCoords) : true;

    return isHit;
  });
}
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var utils = window.flatworld.utils;
  var PIXI = window.flatworld_libraries.PIXI;
  var mapAPI = window.flatworld.mapAPI;
  var mapEvents = window.flatworld.mapEvents;

  /*-----------------------
  ---------- API ----------
  -----------------------*/

  var ObjectSprite = function (_PIXI$Sprite) {
    _inherits(ObjectSprite, _PIXI$Sprite);

    /**
     * The base class of all sprite objects
     *
     * @namespace flatworld.objects
     * @class ObjectSprite
     * @constructor
     * @extends PIXI.Sprite
     * @param {PIXI.Point} coords       the coordinate where the object is located at, relative to it's parent
     * @param {Object} {}
     * @param {Object} {}.data          objects data, that will be used in the game. It will not actually be mainly used
     * in graphical but rather things  like unit-data and city-data presentations etc.
     */

    function ObjectSprite(texture) {
      var coord = arguments.length <= 1 || arguments[1] === undefined ? { x: 0, y: 0 } : arguments[1];

      var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref$data = _ref.data;
      var data = _ref$data === undefined ? null : _ref$data;

      _classCallCheck(this, ObjectSprite);

      /* We need to round the numbers. If there are decimal values, the graphics will get blurry */

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ObjectSprite).call(this, texture));

      var exactCoords = {
        x: Math.round(coord.x),
        y: Math.round(coord.y)
      };
      _this.position.set(exactCoords.x, exactCoords.y);
      /**
       * Name of the object. Used mostly for debugging
       *
       * @attribute name
       * @type {String}
       */
      _this.name = 'Objects_sprite_' + _this.id;
      /**
       * Type of the object. Can be used for filtering, ordering or finding correct objects.
       *
       * @attribute type
       * @type {String}
       */
      _this.type = 'None';
      /**
       * Is the object highligtable.
       *
       * @attribute highlightable
       * @type {Boolean}
       */
      _this.highlightable = true;
      /**
       * Objects custom data. Holds unit statistics and most data. Like unit movement speed etc.
       *
       * @attribute data
       * @type {Object}
       */
      _this.data = data;
      /**
       * Object area width in pixels.
       *
       * @attribute areaWidth
       * @type {Number}
       */
      _this.areaWidth = _this.width;
      /**
       * Object area height in pixels.
       *
       * @attribute areaHeight
       * @type {Number}
       */
      _this.areaHeight = _this.height;
      /**
       * If this object is static. Meaning it's position won't be changed etc. This can be used e.g. in rendering the minimap. The static
       * objects and then the dynamic separately.
       *
       * @attribute static
       * @type {Boolean}
       */
      _this.static = true;
      /**
       * This is a color used to generate minimap functionality. Holds a color in hexadecimal
       *
       * @type {Number}
       */
      _this.minimapColor = 0xFF0000;
      return _this;
    }
    /**
     * Drawing the object
     *
     * @method innerDraw
     * @param {Number} x coordinate x
     * @param {Number} y coordinate y
     * @return this object instance
     */


    _createClass(ObjectSprite, [{
      key: 'innerDraw',
      value: function innerDraw(x, y) {
        this.fromFrame(this.currentFrame);
        this.x = x;
        this.y = y;

        return this;
      }
      /**
       * Draws new frame to animate or such
       *
       * @method drawNewFrame
       * @param {Number} x                coordinate x
       * @param {Number} y                coordinate y
       * @param {Number} newFrame         New frame number to animate to
       * @return this object instance
       */

    }, {
      key: 'drawNewFrame',
      value: function drawNewFrame(x, y, newFrame) {
        this.currentFrame = newFrame;

        return this.innerDraw(x, y);
      }
      /**
       * Get the area that is reserved for the graphical presenation of this object as a rectangle.
       *
       * @method getGraphicalArea
       * @param  {Object} options       toGlobal: Boolean. Should the method return global coordinates or local (movableLayer)
       * @return {AreaSize}               { x: Number, y: Number, width: Number, height: Number}
       */

    }, {
      key: 'getGraphicalArea',
      value: function getGraphicalArea() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? { toGlobal: true } : arguments[0];

        var coordinates;

        coordinates = options.toGlobal ? this.toGlobal(new PIXI.Point(0, 0)) : this;

        return {
          x: Math.round(coordinates.x),
          y: Math.round(coordinates.y),
          width: Math.round(this.width),
          height: Math.round(this.height)
        };
      }
      /**
       * Clone object
       *
       * @method clone
       * @param  {Object} renderer              PIXI renderer
       * @param  {Object} options               position: Boolean, anchor: Boolean
       * @return {Object}                       cloned object
       */

    }, {
      key: 'clone',
      value: function clone(renderer) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? { position: false, anchor: false, scale: false } : arguments[1];

        var newSprite = new PIXI.Sprite();

        newSprite.texture = renderer.generateTexture(this);

        options.anchor && newSprite.anchor.set(this.anchor.x, this.anchor.y);
        options.position && newSprite.position.set(this.x, this.y);
        options.scale && newSprite.scale.set(this.scale.x, this.scale.y);

        Reflect.setPrototypeOf(newSprite, this.constructor.prototype);

        return newSprite;
      }
    }]);

    return ObjectSprite;
  }(PIXI.Sprite);

  var ObjectSpriteTerrain = function (_ObjectSprite) {
    _inherits(ObjectSpriteTerrain, _ObjectSprite);

    /**
     * Terrain tile like desert or mountain, non-movable and cacheable. Normally, but not necessarily, these are
     * inherited, depending on the map type. For example you might want to add some click area for these
     *
     * @class ObjectSpriteTerrain
     * @constructor
     * @extends ObjectSprite
     * @param {Coordinates} coords        format: {x: Number, y: Number}. Coordinates for the object relative to it's parent
     * @param {object} data               This units custom data
     */

    function ObjectSpriteTerrain(texture, coords) {
      var _ref2 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref2$data = _ref2.data;
      var data = _ref2$data === undefined ? null : _ref2$data;

      _classCallCheck(this, ObjectSpriteTerrain);

      var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(ObjectSpriteTerrain).call(this, texture, coords, { data: data }));

      _this2.name = 'DefaultTerrainObject';
      _this2.type = 'terrain';
      _this2.highlightable = false;
      return _this2;
    }

    return ObjectSpriteTerrain;
  }(ObjectSprite);

  var ObjectSpriteUnit = function (_ObjectSprite2) {
    _inherits(ObjectSpriteUnit, _ObjectSprite2);

    /**
     * Map unit like infantry or worker, usually something with actions or movable. Usually these are extended, depending on the map type.
     * For example you might want to add some click area for these (e.g. hexagon)
     *
     * @class ObjectSpriteUnit
     * @constructor
     * @extends ObjectSprite
     * @requires graphics
     * @param {Object} coords               Coordinates for the object relative to it's parent
     * @param {Integer} coords.x            X coordinate
     * @param {Integer} coords.y            Y coordinate
     * @param {object} data                 This units data
     */

    function ObjectSpriteUnit(texture, coords) {
      var _ref3 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref3$data = _ref3.data;
      var data = _ref3$data === undefined ? null : _ref3$data;

      _classCallCheck(this, ObjectSpriteUnit);

      var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(ObjectSpriteUnit).call(this, texture, coords, { data: data }));

      _this3.name = 'DefaultUnitObjects';
      _this3.type = 'unit';
      /**
       * actions bound to this object. @todo THIS HAS NOT BEEN IMPLEMENTED YET!
       *
       * @attribute actions
       * @type {Object}
       */
      _this3.actions = {};
      return _this3;
    }
    /**
     * Execute action on units (move, attack etc.). @todo THIS HAS NOT BEEN IMPLEMENTED YET!
     *
     * @method  doAction
     * @param {String} type
     */


    _createClass(ObjectSpriteUnit, [{
      key: 'doAction',
      value: function doAction(type) {
        this.actions[type].forEach(function (action) {
          action();
        });
      }
      /**
       * Add certain action type. @todo THIS HAS NOT BEEN IMPLEMENTED YET!
       *
       * @method addActionType
       * @param {String} type
       */

    }, {
      key: 'addActionType',
      value: function addActionType(type) {
        this.actions[type] = this.actions[type] || [];
      }
      /**
       * Attach callback for the certain action type. @todo THIS HAS NOT BEEN IMPLEMENTED YET!
       *
       * @method addCallbackToAction
       * @param {String} type
       * @param {Function} cb
       */

    }, {
      key: 'addCallbackToAction',
      value: function addCallbackToAction(type, cb) {
        this.actions[type].push(cb);
      }
      /**
       * @method dropShadow
       */

    }, {
      key: 'dropShadow',
      value: function dropShadow() {
        var _utils$effects;

        return (_utils$effects = utils.effects).dropShadow.apply(_utils$effects, arguments);
      }
      /**
        * This is abstract method and needs to be implemented with a plugin. Core module has an implementation for this and if you
        * don't implement your own, I suggest you use it. You can attach any method to object if you wish. Like attack, siege, greet, talk.
        *
        * @method move
        * @requires  mapAPIa..('objectMove") to be declared
        * @attribute [name]
        */

    }, {
      key: 'move',
      value: function move(to) {
        mapEvents.publish('objectMove', this);
        mapAPI.post('objectMove', {
          id: this.id,
          from: {
            x: this.x,
            y: this.y
          },
          to: to
        });
      }
    }]);

    return ObjectSpriteUnit;
  }(ObjectSprite);

  window.flatworld.objects.ObjectSprite = ObjectSprite;
  window.flatworld.objects.ObjectSpriteTerrain = ObjectSpriteTerrain;
  window.flatworld.objects.ObjectSpriteUnit = ObjectSpriteUnit;
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var Q = window.flatworld_libraries.Q;
  var Howl = window.flatworld_libraries.Howler;
  var log = window.flatworld.mapLayers;

  /*---------------------
  --------- API ---------
  ----------------------*/

  var Sound = function () {
    function Sound() {
      _classCallCheck(this, Sound);

      this._allSounds = {};
    }
    /**
     * Add a sound to be used.
     *
     * @namespace flatworld
     * @method add
     * @param {String} name               Name / identifier
     * @param {String} urls               An array of urls or one url
     * @param {Object} options            *OPTIONAL*
     * @param {Booleam} options.loop      Wether the sound will be looped or not
     * @param {Object} options.volume     The volume of the sound (0 - 1)
     * @return {Object}                   Created instance of sound
     */


    _createClass(Sound, [{
      key: 'add',
      value: function add(name, url) {
        var options = arguments.length <= 2 || arguments[2] === undefined ? { loop: false, volume: 1 } : arguments[2];

        var ERROR_STRING = 'The sound "' + name + '" was unable to load!';
        var loop = options.loop;
        var volume = options.volume;


        this._allSounds[name] = {};
        this._allSounds[name] = new Howl({
          urls: [url],
          autoplay: false,
          loop: loop,
          volume: volume
        });

        return this._allSounds[name];
      }
      /**
       * Remove the sound from usage and memory
       *
       * @method remove
       * @param {String} name     Name / identifier of the sound to be removed
       */

    }, {
      key: 'remove',
      value: function remove(name) {
        delete this._allSounds[name];
      }
      /**
       * Start the sounds playback
       *
       * @method play
       * @param  {String} name      Name of the sound to play
       */

    }, {
      key: 'play',
      value: function play(name) {
        var promise = Q.defer();

        this._allSounds[name]._onend = function () {
          promise.resolve(true);
        };
        this._allSounds[name].play();
      }
      /**
       * stop sound playback
       *
       * @method stop
       * @param  {String} name      Name of the sound to stop playing
       */

    }, {
      key: 'stop',
      value: function stop(name) {
        this._allSounds[name].stop();
      }
      /**
       * Fade the sound in or out
       *
       * @method  fade
       * @param  {String} name            Name / identifier of the sound
       * @param  {Object} from            Volume to fade from
       * @param  {Object} to              Volume to fade to
       * @param  {Object} duration        Time in milliseconds to fade
       * @return {Promise}                Promise that resolves after fade is complete
       */

    }, {
      key: 'fade',
      value: function fade(name, from, to, duration) {
        var promise = Q.defer();
        var cb;
        cb = function cb() {
          promise.resolve(true);
        };

        this._allSounds[name].fade(from, to, duration, cb);

        return promise.promise;
      }
    }]);

    return Sound;
  }();

  window.flatworld.Sound = Sound;
})();
'use strict';

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var StateMachine = window.StateMachine;

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.mapStates = setupMapStates();

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * Finite state machine for the map. Uses this library and pretty much it's API https://github.com/jakesgordon/javascript-state-machine.
   *
   * @namespace flatworld
   * @class mapStates
   * @requires  state-machine library
   */
  function setupMapStates() {
    return StateMachine.create({
      initial: 'statusQuo',
      events: [
      /**
       * When multiple objects are represented as an option
       *
       * @method objectSelectDialog
       */
      { name: 'objectSelectDialog', from: ['statusQuo', 'objectSelected'], to: 'objectSelectDialogOpened' },
      /**
       * When the object is selected
       *
       * @method objectSelect
       */
      { name: 'objectSelect', from: ['statusQuo', 'objectSelected', 'objectSelectDialogOpened'], to: 'objectSelected' },
      /**
       * When situation is normal, nothing selected.
       *
       * @method normalize
       */
      { name: 'normalize', from: ['objectSelected', 'objectSelectDialogOpened'], to: 'statusQuo' },
      /**
       * When object is issued a move order
       *
       * @method objectOrder
       */
      { name: 'objectOrder', from: 'objectSelected', to: 'animatingObject' },
      /**
       * When object ends it's movement animation
       *
       * @method objectOrderEnd
       */
      { name: 'objectOrderEnd', from: 'animatingObject', to: 'objectSelected' },
      /**
       * The games main UI is opened and the map stays at the background, normally non-responsive
       *
       * @method UIOpen
       */
      { name: 'UIOpen', from: ['statusQuo', 'objectSelected', 'objectSelectDialogOpened'], to: 'mainUIOpened' },
      /**
       * Games main UI is closed and map is activated again
       *
       * @method UIClose
       */
      { name: 'UIClose', from: 'mainUIOpened', to: 'statusQuo' }] });
  }
})();
'use strict';

(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var _window$flatworld = window.flatworld;
  var mapEvents = _window$flatworld.mapEvents;
  var utils = _window$flatworld.utils;
  var mapStates = _window$flatworld.mapStates;
  var eventListeners = _window$flatworld.eventListeners;
  var _window$flatworld_lib = window.flatworld_libraries;
  var Hammer = _window$flatworld_lib.Hammer;
  var Hamster = _window$flatworld_lib.Hamster;

  /*-----------------------
  ---------- API ----------
  -----------------------*/

  window.flatworld.extensions.baseEventlisteners = baseEventlistenersModule();

  /*-----------------------
  -------- PUBLIC ---------
  -----------------------*/
  /**
   * Core plugin. Houses the default eventlisteners used in the map. When plugins are added to the map this class can be used for the
   * eventlistener management. Creates window.flatworld.setFullScreen function to be used when switching to fullscreen.
   *
   * @namespace flatworld
   * @class extensions.baseEventlisteners
   * @requires Hammer.js                    (for touch events)
   * @requires Hamster.js                   (for good cross-browser mousewheel events)
   * @event                                 mapEvents.publish('mapResized')
   * @param {HTMLElement} canvasElement     The canvas element we listen events from. Will try to search the first canvas in the DOM,
   * if none is provided
   */
  function baseEventlistenersModule() {
    var caches = {};
    var hammer, hamster, mapInstance;

    /*---------------------------
    ----------- API -------------
    ---------------------------*/
    return {
      init: init,
      toggleFullSize: toggleFullSize,
      toggleFullscreen: toggleFullscreen,
      toggleZoom: toggleZoom,
      toggleDrag: toggleDrag,
      toggleSelect: toggleSelect,
      toggleOrder: toggleOrder,
      toggleMouseTextSelection: toggleMouseTextSelection,

      /**
       * Plugins name
       *
       * @attribute pluginName
       * @type {String}
       */
      pluginName: 'baseEventlisteners'
    };

    /**
     * Initialize plugin
     *
     * @method init
     */
    function init(map) {
      var orderToggle = toggleOrder();
      var selectToggle = toggleSelect();

      mapInstance = map;
      hammer = new Hammer.Manager(map.canvas);
      hamster = new Hamster(map.canvas);

      eventListeners.setDetector('fullSize', toggleFullSize().on, toggleFullSize().off);
      eventListeners.on('fullSize', resizeCanvas);

      eventListeners.setDetector('fullscreen', toggleFullscreen().on, toggleFullscreen().off);
      map.setPrototype('setFullScreen', function () {
        eventListeners.on('fullscreen', _setFullScreen);
      });

      eventListeners.setDetector('zoom', toggleZoom().on, toggleZoom().off);
      eventListeners.setDetector('drag', toggleDrag().on, toggleDrag().off);
      eventListeners.setDetector('select', selectToggle.on, selectToggle.off);
      eventListeners.setDetector('order', orderToggle.on, orderToggle.off);
    }

    /**
     * Sets the canvas to fullsize as in the same size of the window / content area. But not fullscreen. Note that
     *
     * @method toggleFullSize
     */
    function toggleFullSize() {
      var activeCB;

      if (!caches['fullsize']) {
        caches['fullsize'] = {
          on: function on(cb) {
            activeCB = cb;

            window.addEventListener('resize', activeCB);
          },
          off: function off() {
            window.removeEventListener('resize', activeCB);
          }
        };
      }

      return caches['fullsize'];
    }
    /**
     * Sets the browser in fullscreen mode.
     *
     * @method toggleFullscreen
     * @param {Function} cb     Callback that fires when this event activates
     * @return {Boolean}        Return the state of this event
     */
    function toggleFullscreen() {
      var activeCB;

      if (!caches['fullscreen']) {
        caches['fullscreen'] = {
          on: function on(cb) {
            activeCB = cb;

            window.addEventListener('fullscreen', activeCB);
          },
          off: function off() {
            window.removeEventListener('fullscreen', activeCB);
          }
        };

        return caches['fullscreen'];
      }

      return caches['fullscreen'];
    }
    /**
     * Zoom the map. Mousewheel (desktop) and pinch (mobile)
     *
     * @method toggleZoom
     * @param {Function} cb         Callback that fires when this event activates
     * @return {Boolean}            Return the state of this event
     */
    function toggleZoom() {
      var activeCB;

      if (!caches['zoom']) {
        caches['zoom'] = {
          on: function on(cb) {
            var pinch = new Hammer.Pinch();
            activeCB = cb;

            hammer.add(pinch);
            hammer.on('pinch', activeCB);
            /* Hamster handles wheel events really nicely */
            hamster.wheel(activeCB);
          },
          off: function off() {
            hammer.on('pinch', activeCB);
            hamster.unwheel(activeCB);
          }
        };
      }

      return caches['zoom'];
    }
    /**
     * DragListener (normally used for moving the map)
     *
     * @method toggleDrag
     * @param {Function} cb     Callback that fires when this event activates
     * @return {Boolean}        Return the state of this event
     */
    function toggleDrag() {
      var activeCB;

      if (!caches['drag']) {
        caches['drag'] = {
          on: function on(cb) {
            var pan = new Hammer.Pan({
              pointers: 1,
              threshold: 5,
              direction: Hammer.DIRECTION_ALL });
            activeCB = cb;

            hammer.add(pan);
            hammer.on('pan', activeCB);
          },
          off: function off() {
            hammer.off('pan', activeCB);
          }
        };
      }

      return caches['drag'];
    }
    /**
     * Selecting something from the map
     *
     * @method toggleSelect
     * @param {Function} cb     Callback that fires when this event activates
     * @return {Boolean}        Return the state of this event
     */
    function toggleSelect() {
      var activeCB;

      if (!caches['select']) {
        caches['select'] = {
          on: function on(cb) {
            var tap = new Hammer.Tap();
            activeCB = cb;

            hammer.add(tap);
            hammer.on('tap', activeCB);
          },
          off: function off() {
            hammer.off('tap', activeCB);
          }
        };
      }

      return caches['select'];
    }
    /**
     * Selecting something from the map. With mouse you can use the default right click and in touch devices you can use continuous press
     * event (keeping the finger pressed on the screen for a preset time).
     *
     * @method toggleOrder
     * @param {Function} cb     Callback that fires when this event activates
     * @return {Boolean}        Return the state of this event
     */
    function toggleOrder() {
      var activeCB;

      if (!caches['order']) {
        caches['order'] = {
          on: function on(cb) {
            activeCB = cb;

            var press = new Hammer.Press();

            hammer.add(press);
            hammer.on('press', clickListener);
            /* We are detecting mouse right click here. This should be in utils */
            mapInstance.canvas.addEventListener('mouseup', function (e) {
              if (e.which === 3) {
                clickListener(e);
              }
            }, true);
          },
          off: function off() {
            hammer.off('press', clickListener);
            mapInstance.canvas.removeEventListener('mouseup', clickListener, true);
          }
        };
      }

      return caches['order'];

      function clickListener(e) {
        if (!utils.mouse.isRightClick(e) && e.type !== 'press') {
          return;
        }

        /* Check that finite state is correct and that if desktop, the user clicked right button */
        if (!mapStates.can('objectOrder') && (mapInstance.isSupportedTouch || utils.mouse.isRightClick(e))) {
          return false;
        }

        activeCB(e);
      }
    }
    /**
     * Deactivate the selection of text, by dragging
     *
     * @method toggleMouseTextSelection
     */
    function toggleMouseTextSelection() {
      var bodyStyles = document.getElementsByTagName('body')[0].style;

      bodyStyles.webkitTouchCallout = 'none';
      bodyStyles.webkitUserSelect = 'none';
      bodyStyles.khtmlUserSelect = 'none';
      bodyStyles.mozUserSelect = 'none';
      bodyStyles.msUserSelect = 'none';
      bodyStyles.userSelect = 'none';
    }

    /**
     * Activate the browsers fullScreen mode and expand the canvas to fullsize
     *
     * @private
     * @method _setFullScreen
     */
    function _setFullScreen() {
      utils.resize.toggleFullScreen();
      mapEvents.publish('mapResized');
      resizeCanvas();
    }
    /**
     * Resizes the canvas to the current most wide and high element status.
     * Basically canvas size === window size.
     *
     * @private
     * @method _resizeCanvas
     */
    function resizeCanvas() {
      utils.resize.resizePIXIRenderer(mapInstance.getRenderer(), mapInstance.drawOnNextTick.bind(mapInstance));
      mapEvents.publish('mapResized');
    }
  }
})();
'use strict';

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var eventListeners = window.flatworld.eventListeners;
  var utils = window.flatworld.utils;
  var mapStates = window.flatworld.mapStates;
  var mapLog = window.flatworld.log;

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.extensions.mapDrag = setupMap_drag();

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * Core plugin for the engine. Handles moving the map by dragging the map with mouse or touch event. Core plugins can always be
   * overwrote if needed.
   *
   * @class extensions.mapDrag
   * @requires Hammer.js - Mobile part requires
   * @return {Object}      init, _startDragListener
   */
  function setupMap_drag() {
    /* Function for setting and getting the mouse offset. Private functions declared bottom */
    var offsetCoords = _offsetCoords();
    var mapMoved = false;
    var eventListenerCB;

    /*--------------------
    ------- API ----------
    --------------------*/
    return {
      init: init,
      pluginName: 'mapDrag',
      _startDragListener: _startDragListener };

    /*---------------------
    -------- PUBLIC -------
    ----------------------*/
    /**
     * Required init functions for the plugin
     *
     * @method init
     * @param {Map} mapObj        The current instance of Map class
     * */
    /* Function revealed for testing */
    function init(map) {
      eventListenerCB = _startDragListener(map);

      /* Singleton should have been instantiated before, we only retrieve it with 0 params */
      eventListeners.on('drag', eventListenerCB);
    }

    /*---------------------
    -------- PRIVATE ------
    ----------------------*/
    /**
     * Mobile version. Starts the functionality, uses Hammer.js heavily for doing the drag. More simple and better than
     * desktop version, since we don't need to calculate the drag with several event listener, one is enough with Hammer
     *
     * @private
     * @static
     * @method _startDragListener
     * @param {Map} map           The current instance of Map class
     */
    function _startDragListener(map) {
      var initialized = false;

      return function startDrag(e) {
        var coords;

        if (eventListeners.getActivityState('zoom')) {
          return false;
        }
        coords = utils.mouse.eventData.getHAMMERPointerCoords(e);

        mapMoved = true;

        coords.x = Math.round(coords.x);
        coords.y = Math.round(coords.y);

        if (!initialized) {
          offsetCoords.setOffset({
            x: coords.x,
            y: coords.y
          });
          initialized = true;

          return;
        } else if (e.isFinal === true) {
          initialized = false;
          mapMoved = false;
        }

        _mapMovement(e, map, coords);
      };
    }

    /**
     * This handles offset Changes and setting data has map been moved based on it. Also
     * sets basic settings like preventDefault etc.
     *
     * @private
     * @static
     * @method _mapMovement
     * @param  {Event} e                        The event being dealt with
     * @param  {Map} map                        The current instance of Map class
     * @param  {Coordinates} coords             Current pointer coordinates
     */
    function _mapMovement(e, map, coords) {
      var offset, moved;

      offset = offsetCoords.getOffset();
      moved = {
        x: coords.x - offset.x,
        y: coords.y - offset.y
      };

      if (moved.x > 0 || moved.y > 0 || moved.x < 0 || moved.y < 0) {
        map.moveMap(moved);
      }

      if (e.isFinal) {
        mapMoved = false;
      }

      offsetCoords.setOffset({
        x: coords.x,
        y: coords.y
      });

      e.preventDefault();
    }
    /**
     * Function for setting and getting the mouse offset.
     * Offset is the distance from the left upper coordinates (global 0, 0 coordinates) on the canvas, to the current /
     * last known mouse coordinates
     *
     * @private
     * @static
     * @method _offsetCoords
     */
    function _offsetCoords() {
      var offsetCoords;

      return {
        setOffset: setOffset,
        getOffset: getOffset
      };

      function setOffset(coords) {
        return offsetCoords = coords;
      }
      function getOffset() {
        return offsetCoords;
      }
    }
  }
})();
'use strict';

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var eventListeners = window.flatworld.eventListeners;
  var utils = window.flatworld.utils;
  var log = window.flatworld.log;

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.extensions.mapZoom = setupMap_zoom();

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * Core plugin for the engine. Handles zooming for the map. Core plugins can always be overwrote if needed. Zooming happens when the
   * user scrolls the mousewheel or in mobile, pinches the screen.
   *
   * @class extensions.mapZoom
   * @return {Object}      init
   */
  function setupMap_zoom() {
    /*---------------------
    ------ VARIABLES ------
    ----------------------*/
    var TIMEOUT_AFTER_ZOOM = 40;
    var initialized = false;
    var mobileInitialized = false;
    var difference = {};
    var map;
    /**
     * Maximum and minimum amount, the player can zoom the map
     *
     * @attribute zoomLimit
     * @type {{ farther: Number, closer: Number }}
     */
    var zoomLimit = {
      farther: 0.4,
      closer: 2.5
    };
    /**
     * How much one step of zooming affects
     *
     * @attribute zoomModifier
     * @type {Number}
     */
    var zoomModifier = 0.1;

    /*---------------------
    --------- API ---------
    ---------------------*/
    return {
      init: init,
      pluginName: 'mapZoom'
    };

    /*---------------------
    ------- PUBLIC --------
    ----------------------*/
    /**
     * Required init functions for the plugin
     *
     * @method init
     * @param {Map} mapObj       instantiated Map class object
     *
     * @todo think through should setZoomLimits and setZoomModifier be in map.prototype?
     * But zoomLimit and modifier need to be setable in creation, init or later with setters
     **/
    function init(thisMap) {
      map = thisMap;
      map.setPrototype('zoomIn', zoomIn);
      map.setPrototype('zoomOut', zoomOut);
      map.setPrototype('setZoomLimits', setZoomLimits);
      map.setPrototype('setZoomModifier', setZoomModifier);

      /* Singleton should have been instantiated before, we only retrieve it with 0 params */
      eventListeners.on('zoom', unifiedEventCB);
    }

    /*----------------------------------------
    ------ PROTOTYPE extensions for map ------
    ----------------------------------------*/
    /**
     * How much one mouse wheel step zooms
     *
     * @method setZoomModifier
     * @param {Number} amount           How much one mouse wheel step zooms. Needs to be in between 0 - 0.5
     **/
    function setZoomModifier(amount) {
      if (!(amount > 0 || amount <= 0.5)) {
        throw new Error('Wrong zoom modifier! (needs to be >0 and <=0.5, given:' + amount);
      }
      zoomModifier = amount;

      return this;
    }
    /**
     * How much can be zoomed in maximum and minimum
     *
     * @method setZoomLimits
     * @param {Number} farther          (>1) How much one mouse wheel step zooms out
     * @param {Number} closer           (0 - 1) How much one mouse wheel step zooms in
     **/
    function setZoomLimits(farther, closer) {
      zoomLimit.farther = farther;
      zoomLimit.closer = closer;

      return this;
    }
    /**
     * Zoom in to the map
     *
     * @method zoomIn
     * @param {Number} amount how much map is zoomed in
     * */
    function zoomIn(amount) {
      var presentScale = this.getZoom();
      var IS_ZOOM_IN = true;

      return _zoom(this, presentScale, Math.abs(amount) || zoomModifier, IS_ZOOM_IN);
    }
    /**
     * Zoom out of the map
     *
     * @method zoomOut
     * @param {Number} amount how much map is zoomed out
     * */
    function zoomOut(amount) {
      var presentScale = this.getZoom();
      var IS_ZOOM_IN = false;

      amount = amount < 0 ? amount : -amount;

      return _zoom(this, presentScale, amount || -zoomModifier, IS_ZOOM_IN);
    }

    /*---------------------------
    ------ EVENT FUNCTIONS ------
    ---------------------------*/
    /**
     * This starts the correct eventListener for the current environment. Mousewheel and pinch differ quite dramatically
     * so we keep them as separate functions.
     *
     * @method unifiedEventCB
     * @param  {Event} e             Event object
     * @param  {Integer} delta       Hamster.js provided delta
     * @param  {Integer} deltaX      Hamster.js provided delta
     * @param  {Integer} deltaY      Hamster.js provided delta
     */
    function unifiedEventCB(e, delta, deltaX, deltaY) {
      if (delta) {
        handleZoomEventDesktop(e, delta, deltaX, deltaY);
      } else if (e.pointers) {
        if (!mobileInitialized) {
          mobileInitialized = true;
          setZoomModifier(zoomModifier * 0.5);
        }
        handleZoomEventMobile(e);
      }
    }
    /**
     * Setup desktop zoomEvent by currying. Internally: Sets up correct scale + moves map accordingly to zoom to the
     * current center coordinates
     *
     * @method handleZoomEventDesktop
     * @param  {Map} map             Map instance
     */
    function handleZoomEventDesktop(e, delta, deltaX, deltaY) {
      var mouseWheelDelta = deltaY;
      /* Scale changes when the map is drawn. We make calculations with the old scale before draw */
      var oldScale = map.getZoom();

      /* No nasty scrolling side-effects */
      e.preventDefault();

      if (mouseWheelDelta > 0) {
        if (map.zoomIn()) {
          map.moveMap(_calculateCenterMoveCoordinates(oldScale, true));
        }
      } else if (mouseWheelDelta < 0) {
        if (map.zoomOut()) {
          map.moveMap(_calculateCenterMoveCoordinates(oldScale));
        }
      }
    }
    /**
     * handleZoomEventMobile
     *
     * @method handleZoomEventMobile
     * @param  {Event} e
     */
    function handleZoomEventMobile(e) {
      var pointers = e.pointers;
      var coords = [{
        x: pointers[0].pageX,
        y: pointers[0].pageY
      }, {
        x: pointers[1].pageX,
        y: pointers[1].pageY
      }];
      var changeX = Math.abs(coords[0].x - coords[1].x);
      var changeY = Math.abs(coords[0].y - coords[1].y);

      e.preventDefault();

      try {
        if (!initialized) {
          difference = {
            x: changeX,
            y: changeY
          };
          eventListeners.setActivityState('zoom', true);
          initialized = true;

          return;
        } else if (e.eventType === 4 || e.eventType === 8) {
          /* e.eventType 4 = event canceled, e.eventType 8 = event finished */
          /* We don't want another event to be fired right after a pinch event. It makes the zoomign experience rather
           * bad if after zoom there is immediately an unexplainable drag and the map moves a bit
           * */
          window.setTimeout(function () {
            eventListeners.setActivityState('zoom', false);
          }, TIMEOUT_AFTER_ZOOM);
          initialized = false;
        }

        if (difference.x + difference.y < changeX + changeY) {
          if (map.zoomIn()) {
            map.moveMap(_calculateCenterMoveCoordinates(map.getZoom(), true));
          }
        } else {
          if (map.zoomOut()) {
            map.moveMap(_calculateCenterMoveCoordinates(map.getZoom()));
          }
        }

        difference = {
          x: changeX,
          y: changeY
        };
      } catch (ev) {
        log('Error! ', ev);
      }
    }

    /*---------------------
    ------- PRIVATE -------
    ---------------------*/
    /**
     * _isOverZoomLimit
     *
     * @private
     * @static
     * @method _isOverZoomLimit
     **/
    function _isOverZoomLimit(amount, isZoomIn) {
      if (isZoomIn && amount > zoomLimit.closer || !isZoomIn && amount < zoomLimit.farther) {
        return true;
      }

      return false;
    }
    /**
     * @private
     * @static
     * @method _calculateCenterMoveCoordinates
     **/
    function _calculateCenterMoveCoordinates(scale, isZoomIn) {
      var windowSize = utils.resize.getWindowSize();
      var halfWindowSize = {
        x: windowSize.x / 2 / scale,
        y: windowSize.y / 2 / scale
      };
      var realMovement = {
        x: halfWindowSize.x * (isZoomIn ? -zoomModifier : zoomModifier),
        y: halfWindowSize.y * (isZoomIn ? -zoomModifier : zoomModifier)
      };

      return realMovement;
    }
    /**
     * @private
     * @static
     * @method _zoom
     * @todo zoom should always product integers, not floats (this seems to happen)
     **/
    function _zoom(map, presentScale, amount, isZoomIn) {
      var newScale;

      if (!_isOverZoomLimit(presentScale, isZoomIn)) {
        newScale = map.setZoom(amount ? presentScale + amount : presentScale + zoomModifier);
      }

      return newScale;
    }
  }
})();
"use strict";

window.flatworld.extensions.hexagons = {};
window.flatworld.extensions.hexagons.utils = {};
window.flatworld.extensions.hexagons.eventlisteners = {};
'use strict';

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var mapLog = window.flatworld.log;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.extensions.hexagons.utils.init = init;
  window.flatworld.extensions.hexagons.utils.createHexagonGridCoordinates = createHexagonGridCoordinates;
  window.flatworld.extensions.hexagons.utils.getHexagonPoints = getHexagonPoints;
  window.flatworld.extensions.hexagons.utils.calcShortDiagonal = calcShortDiagonal;
  window.flatworld.extensions.hexagons.utils.calcLongDiagonal = calcLongDiagonal;
  window.flatworld.extensions.hexagons.utils.hexaHitTest = hexaHitTest;
  window.flatworld.extensions.hexagons.utils.getClosestHexagonCenter = getClosestHexagonCenter;
  window.flatworld.extensions.hexagons.utils.calculateIndex = calculateIndex;

  /*-----------------------
  ------- VARIABLES -------
  -----------------------*/
  var globalRadius, globalStartingPoint, globalOrientation;

  /**
   * Utility module, for making different calculations and tests when hexagon based grid map in use
   *
   * @namespace flatworld.extensions.hexagons
   * @class utils
   */
  /*-----------------------
  --------- PUBLIC --------
  -----------------------*/
  /**
   * Set hexagon radius
   *
   * @static
   * @method init
   * @param {Number} radius    The radius of the hexagon
   */
  function init(radius) {
    var startingPoint = arguments.length <= 1 || arguments[1] === undefined ? { x: 0, y: 0 } : arguments[1];

    var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var _ref$orientation = _ref.orientation;
    var orientation = _ref$orientation === undefined ? 'horizontal' : _ref$orientation;

    if (!radius) {
      mapLog.error('You need to pass radius as a parameter');
    }

    globalRadius = radius;
    globalStartingPoint = startingPoint;
    globalOrientation = orientation;
  }
  /**
   * @method
   * @static
   * @method getHexagonPoints
   * @param {Float} radius      radius of the hexagon
   * @param {object} options    extra options, like generating horizontal hexagon points and
   * how many decimals to round
  */
  function getHexagonPoints() {
    var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref2$radius = _ref2.radius;
    var radius = _ref2$radius === undefined ? globalRadius : _ref2$radius;
    var _ref2$orientation = _ref2.orientation;
    var orientation = _ref2$orientation === undefined ? 'horizontal' : _ref2$orientation;

    if (!radius) {
      mapLog.error('You need to define at least globalRadius for the hexagonMath utils class');
    }
    var OFFSET = orientation === 'horizontal' ? 0.5 : 0;
    var CENTER = {
      x: radius,
      y: radius
    };
    var angle = 2 * Math.PI / 6 * OFFSET;
    var x = CENTER.x * Math.cos(angle);
    var y = CENTER.y * Math.sin(angle);
    var points = [{ x: x, y: y }];

    for (var i = 1; i < 7; i++) {
      angle = 2 * Math.PI / 6 * (i + OFFSET);
      x = CENTER.x * Math.cos(angle);
      y = CENTER.y * Math.sin(angle);

      points.push({ x: x, y: y });
    }

    return points;
  }
  /**
   * Calculates the hexagons:
   * innerDiameter
   * - Vertical / Flat hexagons height
   * - Horizontal / pointy hexagons width
   *
   * @method calcLongDiagonal
   * @static
   * @param {Object} {}               *OPTIONAL*
   * @param {float} {}.radius         Usually the radius of the hexagon
   * @param {string} {}.type          If you provide something else than radius, where the calculation is based from
   */
  function calcShortDiagonal() {
    var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref3$radius = _ref3.radius;
    var radius = _ref3$radius === undefined ? globalRadius : _ref3$radius;
    var _ref3$floorNumbers = _ref3.floorNumbers;
    var floorNumbers = _ref3$floorNumbers === undefined ? true : _ref3$floorNumbers;

    var answer = radius * Math.sqrt(3);
    answer = floorNumbers ? Math.floor(answer) : answer;

    return answer;
  }
  /** Calculates the hexagons:
   * outerDiameter
   * - Vertical / Flat hexagons width
   * - Horizontal / pointy hexagons height
   *
   * @method calcLongDiagonal
   * @static
   * @param {Object} {}                 *OPTIONAL*
   * @param {float} {}.radius           Usually the radius of the hexagon
   * @param {string} {}.type            If you provide something else than radius, where the calculation is based from
   */
  function calcLongDiagonal() {
    var _ref4 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref4$radius = _ref4.radius;
    var radius = _ref4$radius === undefined ? globalRadius : _ref4$radius;
    var _ref4$floorNumbers = _ref4.floorNumbers;
    var floorNumbers = _ref4$floorNumbers === undefined ? true : _ref4$floorNumbers;

    var answer = radius * 2;
    answer = floorNumbers ? Math.floor(answer) : answer;

    return answer;
  }
  /** Calculates the hexagons distance between each other in y-coordinate, when orientation is horizontal
   *
   * @method calcSpecialDistance
   * @static
   * @param {Object} {}                   *OPTIONAL*
   * @param {float} {}.radius             Usually the radius of the hexagon
   */
  function calcSpecialDistance() {
    var _ref5 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref5$radius = _ref5.radius;
    var radius = _ref5$radius === undefined ? globalRadius : _ref5$radius;

    return calcLongDiagonal(radius) - radius / 2;
  }
  /**
   * Test do the given coordinates hit the hexagon, given by the points container / array
   *
   * @static
   * @method hexaHitTest
   * @param  {PIXI.Point[]} points             Array of PIXI.points
   * @param  {Object} hitCoords         The coordinates to test against
   * @param  {Integer} hitCoords.x      X coordinate
   * @param  {Integer} hitCoords.y      Y coordinate
   * @param  {Object} offsetCoords      *OPTIONAL* offsetCoordinates that are added to the hitCoordinates.
   * Separate because these are outside the
   * given array.
   * @param  {Integer} offsetCoords.x   X coordinate
   * @param  {Integer} offsetCoords.y   Y coordinate
   * @return {Boolean}                  Is the coordinate inside the hexagon or not
   */

  function hexaHitTest(points, hitCoords) {
    var offsetCoords = arguments.length <= 2 || arguments[2] === undefined ? { x: 0, y: 0 } : arguments[2];

    var realPolygonPoints = points.map(function (point) {
      return {
        x: point.x + offsetCoords.x,
        y: point.y + offsetCoords.y
      };
    });

    return _pointInPolygon(hitCoords, realPolygonPoints);
  }
  /**
   * Create Array that holds the coordinates for the size of hexagon grid we want to create.
   *
   * @method createHexagonGridCoordinates
   * @static
   * @param {Object} gridSize
   * @param {Object} gridSize.rows      The count of rows in the hexagon grid
   * @param {Object} gridSize.columns   The count of columns in the hexagon grid
   * @param {Object} {}                 *OPTIONAL* configurations in an object
   * @param {Number} {}.radius          The radius of hexagon. Basically the radius of the outer edges / circle of the hexagon.
   * @param {String} {}.orientation     Is it horizontal or vertical hexagon grid. Default: horizontal
   * @return {[]}                       Array that holds the coordinates for the hexagon grid, like [{x: ?, y: ?}]
   */
  function createHexagonGridCoordinates(gridSize) {
    var _ref6 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref6$radius = _ref6.radius;
    var radius = _ref6$radius === undefined ? globalRadius : _ref6$radius;
    var _ref6$orientation = _ref6.orientation;
    var orientation = _ref6$orientation === undefined ? 'horizontal' : _ref6$orientation;
    var rows = gridSize.rows;
    var columns = gridSize.columns;

    var gridArray = [];
    var shortDistance = calcShortDiagonal(radius);
    var longDistance = calcLongDiagonal(radius) - radius / 2;
    /* We set the distances of hexagons / hexagon rows and columns, depending are we building horizontal or vertical hexagon grid. */
    var rowHeight = orientation === 'horizontal' ? longDistance : shortDistance;
    var columnWidth = orientation === 'horizontal' ? shortDistance : longDistance;

    for (var row = 0; rows > row; row++) {
      for (var column = 0; columns > column; column++) {
        /* Se the coordinates for each hexagons upper-left corner on the grid */
        gridArray.push({
          x: Math.round(column * columnWidth + (orientation === 'horizontal' && (row === 0 || row % 2 === 0) ? 0 : -shortDistance / 2)),
          y: row * rowHeight
        });
      }
    }

    return gridArray;
  }
  /**
   * Calculates the closest hexagon center coordinates, for the given coordinates. So aligning the given coordinates to proper hexagon
   * coordinates
   *
   * @static
   * @method getClosestHexagonCenter
   * @requires init must have been called
   * @param {Object} coordinates              The coordinate where we want to find the closest hexagon center point
   */
  function getClosestHexagonCenter(coordinates) {
    var closestHexagonCenter = void 0;

    if (!globalOrientation || !globalRadius || !globalStartingPoint) {
      throw new Error('getClosestHexagonCenter requirements not filled');
    }

    if (globalOrientation === 'horizontal') {
      closestHexagonCenter = {
        x: Math.round(coordinates.x - coordinates.x % calcShortDiagonal(globalRadius) + calcShortDiagonal(globalRadius) / 2 + globalStartingPoint.x),
        y: Math.round(coordinates.y - coordinates.y % calcSpecialDistance(globalRadius) + calcLongDiagonal(globalRadius) / 2 + globalStartingPoint.y)
      };
    } else {
      closestHexagonCenter = {
        x: Math.floor(coordinates.x - coordinates.x % calcSpecialDistance(globalRadius) + globalStartingPoint.x),
        y: Math.floor(coordinates.y - coordinates.y % calcShortDiagonal(globalRadius) + globalStartingPoint.y)
      };
    }

    return closestHexagonCenter;
  }
  function calculateIndex(coordinates) {
    return {
      x: coordinates.x / calcShortDiagonal(),
      y: coordinates.y / calcLongDiagonal()
    };
  }
  /*-----------------------
  --------- PRIVATE -------
  -----------------------*/
  /**
   * credits to: https://github.com/substack/point-in-polygon
   * Tests whether the given point / coordinate is inside the given points. Assuming the points form a polygon
   *
   * @static
   * @private
   * @method _pointInPolygon
   * @param  {Object} point             The coordinates to test against
   * @param  {Integer} hitCoords.x      X coordinate
   * @param  {Integer} hitCoords.y      Y coordinate
   * @param  {Integer[]} vs             The points of the polygon to test [0] === x-point, [1] === y-point
   * @return {Boolean}                  Is the coordinate inside the hexagon or not
   */
  function _pointInPolygon(point, vs) {
    var x = point.x;
    var y = point.y;
    var inside = false;
    var xi = void 0,
        xj = void 0,
        yi = void 0,
        yj = void 0,
        intersect = void 0;

    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      xi = vs[i].x;
      yi = vs[i].y;
      xj = vs[j].x;
      yj = vs[j].y;
      intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;

      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  }
})();
'use strict';

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var PIXI = window.flatworld_libraries.PIXI;

  var getHexagonPoints = window.flatworld.extensions.hexagons.utils.getHexagonPoints;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.extensions.hexagons.utils.createHexagon = createHexagon;
  window.flatworld.extensions.hexagons.utils.createVisibleHexagon = createVisibleHexagon;

  /*-----------------------
  --------- PUBLIC --------
  -----------------------*/
  /**
   * This manages some utility functionalities for creating hexagons
   *
   * @class extensions.hexagons.utils
   */
  /**
   * Credits belong to: https://github.com/alforno-productions/HexPixiJs/blob/master/lib/hexPixi.js
   * Creates a hex shaped polygon that is used for the hex's hit area.
   *
   * @private
   * @static
   * @method createHexagon
   * @param {Number} radius           Radius of the hexagon
   * @param {Object} {}               *OPTIONAL*
   * @param {Object} {}.orientation   Is the heaxgon grid horizontal or vertical. Default: 'horizontal"
   * @return {PIXI.Polygon}           Hexagon shaped PIXI.Polygon object. That houses the hexagons corner points.
   */
  function createHexagon(radius) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref$orientation = _ref.orientation;
    var orientation = _ref$orientation === undefined ? 'horizontal' : _ref$orientation;

    var points = [];

    if (orientation !== 'horizontal') {
      throw new Error('Nothing else than horizontal supported so far!');
    }
    points = coordsToPixiPoints(radius);

    return new PIXI.Polygon(points);
  }
  /**
   * @private
   * @static
   * @method createVisibleHexagon
   * @method createVisibleHexagon
   * @param {Number} radius       Radius of the hexagon
   * @param {Object} options      Options, such as:
   *                              color: The fill color of the hexagon
   *                              isFlatTop (Boolean), is the heaxgon flat-topped
   * @return {PIXI.Graphics}      Graphics object that is shaped as hexagon, based on given radius and options.
   */
  function createVisibleHexagon(radius) {
    var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref2$color = _ref2.color;
    var color = _ref2$color === undefined ? 0xFF0000 : _ref2$color;
    var _ref2$isFlatTop = _ref2.isFlatTop;
    var isFlatTop = _ref2$isFlatTop === undefined ? false : _ref2$isFlatTop;

    var graphics = new PIXI.Graphics();
    var points = coordsToPixiPoints(radius, isFlatTop);

    graphics.beginFill(color, 1);
    graphics.drawPolygon(points, isFlatTop);
    graphics.endFill();

    return graphics;
  }

  /*-----------------------
  --------- PRIVATE -------
  -----------------------*/
  /**
   * Converts Array of x- and y-coordinates to new PIXI.Point coordinates
   *
   * @private
   * @static
   * @method coordsToPixiPoints
   * @method coordsToPixiPoints
   * @param  {Number} radius        Hexagons radius
   * @return {Array}                Array of PIXI.Point coordinates
   */
  function coordsToPixiPoints(radius) {
    return getHexagonPoints({ radius: radius }).map(function (point) {
      return new PIXI.Point(point.x, point.y);
    });
  }
})();
'use strict';

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var utils = window.flatworld.utils;
  var mapEvents = window.flatworld.mapEvents;
  var UI = window.flatworld.UI;
  var MapDataManipulator = window.flatworld.MapDataManipulator;
  var eventListeners = window.flatworld.eventListeners;
  var mapStates = window.flatworld.mapStates;
  var mapLog = window.flatworld.log;

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.extensions.hexagons.setupHexagonClick = _setupUnitsHexagonClick;

  /*---------------------
  ------- PUBLIC --------
  ----------------------*/
  /**
   * Handles the eventlistner for selecting objects on the map. THe actual logic for detecting the objects under mouse
   * etc. are in selectHexagonPlugin
   *
   * @class extensions.hexagons.setupHexagonClick
   * @requires Hammer.js. Some events are done with Hammer.js, so we need it to handle those events correctly
   * @event                 Mapselect and objectsSelected (objectsSelected will have parameter for the objects that were selected)
   * @param  {Map} map      The currently use Map instance
   * @return {Boolean}      True
   */
  function _setupUnitsHexagonClick(FTW) {
    var ui;

    if (!FTW) {
      throw new Error('eventlisteners initialization requires flatworld instance as a parameter');
    }

    ui = UI();

    eventListeners.on('select', tapListener);
    eventListeners.on('order', orderListener);

    return true;

    /*----------------------
    ------- PUBLIC ---------
    ----------------------*/
    /**
     * the listener that received the event object
     *
     * @private
     * @method tapListener
     * @param  {Event} e      Event object
     */
    function tapListener(e) {
      var globalCoords = utils.mouse.eventData.getHAMMERPointerCoords(e);
      var getData = {
        allData: function allData(object) {
          return object.data.typeData;
        }
      };
      var containerFilter = new MapDataManipulator({
        type: 'filter',
        object: 'layer',
        property: 'name',
        value: 'unitLayer'
      });
      var objects;

      mapStates.objectSelect();

      objects = FTW.getObjectsUnderArea(globalCoords, { filters: containerFilter });
      objects = utils.dataManipulation.mapObjectsToArray(objects);
      objects = utils.dataManipulation.flattenArrayBy1Level(objects);

      if (!objects.length) {
        FTW.currentlySelectedObjects = undefined;
        mapLog.debug('No objects found for selection!');
        // Delete the UI objects, as player clicked somewhere that doesn't have any selectable objects
        ui.showSelections([]);
        return;
      }

      FTW.currentlySelectedObjects = objects;
      mapEvents.publish('objectsSelected', objects);
      ui.showSelections(objects, getData);
      FTW.drawOnNextTick();
    }
    /**
     * This listener is for the situation, where we have an object and we issue an order / action to
     * that unit. For example to move from one hexagon to another.
     *
     * @private
     * @method orderListener
     * @param  {Event} e      Event object
     */
    function orderListener(e) {
      var globalCoords, selectedObject;

      if (!FTW.currentlySelectedObjects) {
        mapLog.debug('No objects selected for orders! ' + JSON.stringify(selectedObject));
        return;
      } else if (FTW.currentlySelectedObjects.length > 1) {
        mapLog.debug('the selected object is only supported to be one atm.' + JSON.stringify(FTW.currentlySelectedObjects));
        return;
      }

      selectedObject = FTW.currentlySelectedObjects[0];

      mapStates.objectOrder();

      if (FTW.isSupportedTouch) {
        globalCoords = utils.mouse.eventData.getHAMMERPointerCoords(e);
      } else {
        globalCoords = utils.mouse.eventData.getPointerCoords(e);
      }

      selectedObject.move(globalCoords);
      mapEvents.publish('objectMoves', selectedObject);

      ui.showUnitMovement(selectedObject, globalCoords);

      mapStates.objectOrderEnd();
      FTW.drawOnNextTick();
    }
  }
})();
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var _window$flatworld$obj = window.flatworld.objects;
  var ObjectSpriteTerrain = _window$flatworld$obj.ObjectSpriteTerrain;
  var ObjectSpriteUnit = _window$flatworld$obj.ObjectSpriteUnit;
  var _window$flatworld$ext = window.flatworld.extensions.hexagons.utils;
  var calcLongDiagonal = _window$flatworld$ext.calcLongDiagonal;
  var calcShortDiagonal = _window$flatworld$ext.calcShortDiagonal;
  var createHexagon = _window$flatworld$ext.createHexagon;

  var PIXI = window.flatworld_libraries.PIXI;

  /*-----------------------
  -------- VARIABLES ------
  -----------------------*/
  var shape;

  var ObjectHexaTerrain = function (_ObjectSpriteTerrain) {
    _inherits(ObjectHexaTerrain, _ObjectSpriteTerrain);

    /**
     * Terrain tile like desert or mountain, non-movable and cacheable. Normally, but not necessarily, these are inherited, depending on
     * the map type. For example you might want to add some click area for these
     *
     * @namespace flatworld.extensions.hexagons
     * @class ObjectHexaTerrain
     * @constructor
     * @param  {Object} coords
     * @param  {Integer} coords.x         X coordinate
     * @param  {Integer} coords.y         Y coordinate
     * @param {object} data               This units custom data
     * @param {Object} options            options.radius REQUIRED.
     * @param {Number} options.radius     REQUIRED. This is the radius of the game maps hexagon.
     */

    function ObjectHexaTerrain(texture) {
      var coords = arguments.length <= 1 || arguments[1] === undefined ? { x: 0, y: 0 } : arguments[1];

      var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var data = _ref.data;
      var radius = _ref.radius;
      var minimapColor = _ref.minimapColor;
      var minimapShape = _ref.minimapShape;

      _classCallCheck(this, ObjectHexaTerrain);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ObjectHexaTerrain).call(this, texture, coords, { data: data }));

      _this.name = 'DefaultTerrainObject_hexa';
      _this.minimapColor = minimapColor;
      _this.minimapShape = minimapShape;
      calculateHexa.call(_this, radius);
      return _this;
    }

    return ObjectHexaTerrain;
  }(ObjectSpriteTerrain);

  var ObjectHexaUnit = function (_ObjectSpriteUnit) {
    _inherits(ObjectHexaUnit, _ObjectSpriteUnit);

    /**
     * Map unit like infantry or worker, usually something with actions or movable. Usually these are extended, depending on the map type.
     * For example you might want to add some click area for these (e.g. hexagon)
     *
     * @class ObjectHexaUnit
     * @constructor
     * @param {Object} coords            This units coordinates, relative to it's parent container
     * @param {Integer} coords.x         X coordinate
     * @param {Integer} coords.y         Y coordinate
     * @param {object} data               This units custom data
     * @param {Object} options            options.radius REQUIRED
     * @param {Object} options.radius     REQUIRED. This is the radius of the game maps hexagon
     */

    function ObjectHexaUnit(texture) {
      var coords = arguments.length <= 1 || arguments[1] === undefined ? { x: 0, y: 0 } : arguments[1];

      var _ref2 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var data = _ref2.data;
      var radius = _ref2.radius;
      var minimapColor = _ref2.minimapColor;
      var minimapShape = _ref2.minimapShape;

      _classCallCheck(this, ObjectHexaUnit);

      var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(ObjectHexaUnit).call(this, texture, coords, { data: data }));

      _this2.name = 'DefaultUnitObjects_hexa';
      _this2.minimapColor = minimapColor;
      _this2.minimapShape = minimapShape;
      _this2.static = false;

      calculateHexa.call(_this2, radius);
      return _this2;
    }

    return ObjectHexaUnit;
  }(ObjectSpriteUnit);
  /*-----------------------
  --------- PRIVATE -------
  -----------------------*/
  /**
   * @private
   * @static
   * @method calculateHexa
   * @param {Number} radius       Hexagon radius
   */


  function calculateHexa(radius) {
    if (!radius) {
      throw new Error('Need radius!');
    }

    var HEIGHT = Math.round(calcLongDiagonal(radius));
    var WIDTH = Math.round(calcShortDiagonal(radius));
    var SIDE = Math.round(radius);

    this.anchor.set(0.5, 0.5);
    this.areaHeight = this.HEIGHT = HEIGHT;
    this.areaWidth = this.WIDTH = WIDTH;
    this.SIDE = SIDE;
    this.ROW_HEIGHT = Math.round(HEIGHT * 0.75);

    /* Draw hexagon to test the hits with hitArea */
    this.hitArea = setAndGetShape(radius);
    this.hitTest = function (coords) {
      var localCoords;

      localCoords = this.toLocal(new PIXI.Point(coords.x, coords.y));

      return this.hitArea.contains(localCoords.x, localCoords.y);
    };
  }
  /**
   * @private
   * @static
   * @method setAndGetShape
   * @param {Number} radius       Hexagon radius
   */
  function setAndGetShape(radius) {
    if (!shape) {
      shape = createHexagon(radius);
    }

    return shape;
  }

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.extensions.hexagons.objects = {
    ObjectHexaTerrain: ObjectHexaTerrain,
    ObjectHexaUnit: ObjectHexaUnit
  };
})();
'use strict';

(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var setupHexagonClick = window.flatworld.extensions.hexagons.setupHexagonClick;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.extensions.hexagons.selectHexagonObject = setupObject_select_hexagon();

  /*-----------------------
  -------- PUBLIC ---------
  -----------------------*/
  /**
   * Handles the selection of hexagons on the map
   *
   * @namespace flatworld.extensions.hexagons
   * @class selectHexagonObject
   * @return {Object}       Return methods inside object
   */
  function setupObject_select_hexagon() {
    var map = {};

    return {
      init: init,
      pluginName: 'selectHexagonObject'
    };

    /**
     * @method  init
     * @param {Map} givenMap         Instantiated Map class object
     */
    function init(givenMap) {
      map = givenMap;

      startClickListener(map);
    }

    /*-----------------------
    -------- PRIVATE --------
    -----------------------*/
    /**
     * @private
     * @method startClickListener
     * @param {Map} map              Instantiated Map class object
     */
    function startClickListener(map) {
      return setupHexagonClick(map);
    }
  }
})();
'use strict';

(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var mapEvents = window.flatworld.mapEvents;
  var arrays = window.flatworld.generalUtils.arrays;

  /*-----------------------
  ------- VARIABLES -------
  -----------------------*/

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  /* For debugging. This will show up if the plugin fails to load in Map.js */
  window.flatworld.extensions.mapMovement = setupMapMovement();

  /*-----------------------
  -------- PUBLIC ---------
  -----------------------*/
  /** This module manages visibility of the objects, based on are they visible to the player
   * on the canvas / viewport or outside of it. It does this by getting object from larger area
   * than the current viewport size and then checking if the subcontainers are actually inside the
   * viewport or not. If inside mark them visible, if outside mark then hidden.
   * This makes the map a lot faster and reliable resource-wise.
   *
   * @namespace flatworld.extensions
   * @class mapMovement
   **/
  function setupMapMovement() {
    var VIEWPORT_OFFSET = 0.2;
    var CHECK_INTERVAL = 20;
    var SUBCONTAINERS_TO_HANDLE_IN_TIMEOUT = 40;
    var queue = {};
    var debug = true;
    var map = void 0;
    var viewportArea = void 0;
    var offsetSize = void 0;

    return {
      init: init,
      pluginName: 'mapMovement',
      addAll: addAll,
      check: check,
      startEventListeners: startEventListeners,
      _testObject: {
        isObjectOutsideViewport: isObjectOutsideViewport,
        checkAndSetSubcontainers: checkAndSetSubcontainers,
        getViewportWithOffset: getViewportWithOffset,
        testRectangleIntersect: testRectangleIntersect,
        _setMap: _setMap
      }
    };
    /**
     * Ínitialize as a plugin
     *
     * @method init
     * @param  {Map} map     Instance of Map
     */
    function init(givenMap) {
      map = givenMap;

      addAll();
      startEventListeners();
      map.drawOnNextTick();

      if (debug) {
        /**
         * For debugging. Shows the amount of currectly active and inactive subcontainers. Console.logs the data.
         * Also extends window object.
         *
         * @method window.FlaTWorld_mapMovement_subCheck
         * @static
         */
        window.FlaTWorld_mapMovement_subCheck = function () {
          map.getPrimaryLayers().forEach(function (layer) {
            var subcontainers = layer.getSubcontainers();
            var visibleContainers, invisibleContainers;

            visibleContainers = subcontainers.filter(function (subcontainer) {
              return subcontainer.visible;
            });
            invisibleContainers = subcontainers.filter(function (subcontainer) {
              return !subcontainer.visible;
            });

            var containerCoords = visibleContainers.reduce(function (all, cont2) {
              all + cont2.x + '';
            });
            window.flatworld.log.debug('visible subcontainers: ' + visibleContainers.length + ', ' + containerCoords + '\n\ninvisible: ' + invisibleContainers.length);
          });
        };
        /**
         * For debugging. Sets all primaryLayers subcontainers on the map as visible = true.
         *
         * @method window.FlaTWorld_mapMovement_deactivate
         * @static
         */
        window.FlaTWorld_mapMovement_deactivate = function () {
          map.getPrimaryLayers().forEach(function (layer) {
            var subcontainers = layer.getSubcontainers();

            subcontainers.forEach(function (subcontainer) {
              subcontainer.visible = false;
            });
          });
        };
      }
    }
    /**
     * Ínitialize as a plugin
     *
     * @method addAll
     * @param  {Map} map     Instance of Map
     */
    function addAll() {
      var viewportArea;

      viewportArea = map.getViewportArea(true, 2);
      offsetSize = calculateOffset(viewportArea, { zoom: map.getZoom() });

      map.getPrimaryLayers().forEach(function (layer) {
        var subcontainers = layer.getSubcontainers();

        subcontainers.forEach(function (subcontainer) {
          subcontainer.visible = isObjectOutsideViewport(subcontainer, viewportArea) ? false : true;
        });
      });
    }
    /**
     * This one checks the that the objects that should currently be visible in the viewport area
     * are visible and outside
     * of the viewport objects are set .visible = false. This affect performance a lot. Basically
     * when the map moves, we
     * set a check in the future based on the given intervalCheck milliseconds. And immediately
     * after it we check if there
     * is another map movement. If there is we set another timeout. This works better with
     * timeouts.
     *
     * @method check
     * @param  {Map} map        The current Map instance
     * @return {Boolean}        True
     */
    function check() {
      if (queue.processing) {
        return false;
      }
      queue.processing = true;

      window.setTimeout(setupHandleViewportArea(), CHECK_INTERVAL);

      function setupHandleViewportArea() {
        viewportArea = map.getViewportArea(true, VIEWPORT_OFFSET);

        checkAndSetSubcontainers(viewportArea, map.getPrimaryLayers());
      }

      return;
    }
    /**
     * @method startEventListeners
     * @param  {Map} map     Instance of Map
     */
    function startEventListeners() {
      mapEvents.subscribe('mapMoved', moveCb);
      mapEvents.subscribe('mapResized', resizeCb);
      /* We change the scale factor ONLY if the map is zoomed. We reserve resources */
      mapEvents.subscribe('mapZoomed', zoomCb);

      function moveCb() {
        check();
      }
      function resizeCb() {
        offsetSize = calculateOffset(viewportArea, { zoom: map.getZoom() });
        check();
      }
      function zoomCb() {
        offsetSize = calculateOffset(viewportArea, { zoom: map.getZoom() });
        check();
      }
    }
    /*-----------------------
    -------- PRIVATE --------
    -----------------------*/
    /**
     * See if the given object or subcontainer is outside the given viewportarea. We check intersecting rectangles
     *
     * @private
     * @static
     * @method isObjectOutsideViewport
     * @param  {Object} object                  Object / layer we are testing
     * @param  {Object} viewportArea            ViewportArea location and size
     * @param  {Integer} viewportArea.x         X coordinate
     * @param  {Integer} viewportArea.y         Y coordinate
     * @param  {Integer} viewportArea.width     Viewports width (in pixels)
     * @param  {Integer} viewportArea.height    Viewports height (in pixels)
     * @param  {Boolean} hasParent              default = true
     * @return {Boolean}
     */
    function isObjectOutsideViewport(object, viewportArea) {
      var isOutside, globalArea;

      globalArea = object.getSubcontainerArea({ toGlobal: false });

      isOutside = !testRectangleIntersect(globalArea, viewportArea);

      return isOutside;
    }
    /**
     * Checks proper subcontainers and mark the correct ones visible or hidden
     *
     * @todo rename and generally refactor
     * @method checkAndSetSubcontainers
     * @param  {Object} scaledViewport    Viewportarea that has been scaled.
     * @param  {Array} primaryLayers      The primarylayers that we handle
     */
    function checkAndSetSubcontainers(scaledViewport, primaryLayers) {
      var containersUnderChangedArea = [];
      var promises, largerViewportAreaWithOffset;

      largerViewportAreaWithOffset = getViewportWithOffset(scaledViewport);

      primaryLayers = arrays.chunkArray(primaryLayers, VIEWPORT_OFFSET);
      promises = primaryLayers.map(function (theseLayers) {
        var promise = window.Q.defer();

        window.setTimeout(function () {
          var foundSubcontainers;

          foundSubcontainers = theseLayers.map(function (layer) {
            return layer.getSubcontainersByCoordinates(largerViewportAreaWithOffset);
          });
          containersUnderChangedArea = containersUnderChangedArea.concat(foundSubcontainers);

          promise.resolve(containersUnderChangedArea);
        });

        return promise.promise;
      });

      promises = window.Q.all(promises).then(function () {
        var subcontainers, promises;

        containersUnderChangedArea = arrays.flatten2Levels(containersUnderChangedArea);

        subcontainers = arrays.chunkArray(containersUnderChangedArea, SUBCONTAINERS_TO_HANDLE_IN_TIMEOUT);

        promises = subcontainers.map(function (thesesContainers) {
          var promise = window.Q.defer();

          window.setTimeout(function () {
            promise.resolve(thesesContainers.filter(function (thisContainer) {
              return thisContainer.visible = isObjectOutsideViewport(thisContainer, scaledViewport) ? false : true;
            }));
          });

          return promise.promise;
        });

        return promises;
      });
      window.Q.all(promises).then(function () {
        queue.processing = false;

        map.drawOnNextTick();
      }).then(null, function (err) {
        window.flatworld.log.debug(err);
      });
    }
    /**
     * forms the total viewport parameters based on the given ones.
     *
     * @private
     * @static
     * @method getViewportWithOffset
     * @param  {AreaSize} viewportArea          Given viewport area
     * @return {totalViewportArea}              The total viewportArea
     */
    function getViewportWithOffset(viewportArea) {
      return {
        x: Math.round(viewportArea.x - offsetSize),
        y: Math.round(viewportArea.y - offsetSize),
        width: Math.round(viewportArea.width + offsetSize * 2),
        height: Math.round(viewportArea.height + offsetSize * 2)
      };
    }
    /**
     * @private
     * @static
     * @method testRectangleIntersect
     */
    function testRectangleIntersect(a, b) {
      return a.x <= b.x + b.width && b.x <= a.x + a.width && a.y <= b.y + b.height && b.y <= a.y + a.height;
    }
    /**
     * @private
     * @static
     * @method calculateOffset
     */
    function calculateOffset(viewportArea) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? { zoom: 1 } : arguments[1];

      return Math.abs(viewportArea.width / options.zoom * VIEWPORT_OFFSET);
    }
    /**
     * @private
     * @static
     * @method _setMap
     */
    function _setMap(givenMap) {
      map = givenMap;
    }
  }
})();
"use strict";

window.flatworld.extensions.minimaps = {};
'use strict';

(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var mapEvents = window.flatworld.mapEvents;
  var eventListeners = window.flatworld.eventListeners;
  var MapDataManipulator = window.flatworld.MapDataManipulator;
  var utils = window.flatworld.utils;
  var Hammer = window.flatworld_libraries.Hammer;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.extensions.minimaps.pixelizedMinimap = setupPixelizedMinimap();

  /*-----------------------
  -------- PUBLIC ---------
  -----------------------*/
  /**
   * Pixelized minimap works in situations, where you map a symmetrical map. E.g. hexagon or square based map.
   * It can only be created in sizes that match pixel squares (not sure what it is called). So basically object area on the minimap can be
   * either 1, 4, 9, 16 etc. pixels in size.
   *
   * After plugin has been initialized by the flatworld, you must still call initMinimap to start showing the minimap.
   *
   * @namespace flatworld.extensions.minimaps
   * @class pixelizedMinimap
   **/
  function setupPixelizedMinimap() {
    var paddingX = 0;
    var paddingY = 0;
    var map, minimap, minimapViewport, hammer, coordinateConverterCB, mapMoveTimestamp, dynamicContainer;

    return {
      init: init,
      pluginName: 'pixelizedMinimap',
      initMinimap: initMinimap,
      _testObject: {}
    };
    /**
     * Ínitialize as a plugin. Done by the Flatworld class.
     *
     * @method init
     * @param  {Map} givenMap     Instance of Map
     */
    function init(givenMap) {
      map = givenMap;
      hammer = new Hammer.Manager(map.minimapCanvas);
      map.initMinimap = initMinimap;
      minimap = map.getMinimapLayer();
    }
    /**
     * initMinimap requires some data, to initialize and show the actual minimap.
     *
     * @param  {PIXI.DisplayObject} UIImage         The canvas image that you want to show around the UI element
     * @param  {Integer} {}.x                       x coordinate for the minimap layer
     * @param  {Integer} {}.y                       y coordinate for the minimap layer
     * @return {PIXI.Container}                     minimap layer
     */
    function initMinimap(UIImage, minimapSize, staticCB, dynamicCB, coordinateConvCB, givenMinimapViewport) {
      var _ref = arguments.length <= 6 || arguments[6] === undefined ? {} : arguments[6];

      var _ref$xPadding = _ref.xPadding;
      var xPadding = _ref$xPadding === undefined ? 10 : _ref$xPadding;
      var _ref$yPadding = _ref.yPadding;
      var yPadding = _ref$yPadding === undefined ? 10 : _ref$yPadding;

      paddingX = xPadding;
      paddingY = yPadding;
      minimap.minimapSize = minimapSize;
      coordinateConverterCB = coordinateConvCB;
      // utils.mouse.disableContextMenu(map.getRenderer('minimap').view);
      setMinimapUI(UIImage);
      setupBackgroundLayer(staticCB);
      setupDynamicLayer(dynamicCB);
      _setMinimapArea(minimap.minimapSize.x, minimap.minimapSize.y, minimap.minimapSize.width, minimap.minimapSize.height);
      setupMinimapViewportEvents();
      setupMinimapClickEvent();
      minimapViewport = givenMinimapViewport;
      minimap.addChild(minimapViewport);

      mapEvents.publish('minimapInitialized', minimap);

      return minimap;
    }
    function setMinimapUI(UIImage) {
      minimap.addChild(UIImage);
    }
    /**
     * Sets up the layer that doesn't change, normally terrain layer. This layer is supposed to be unchanged during this play session, so
     * is is cached for efficiency.
     *
     * @param  {Function} staticCB   Callback that receives each object that is added to the map individually.
     */
    function setupBackgroundLayer(staticCB) {
      var filters = new MapDataManipulator({
        type: 'filter',
        object: 'layer',
        property: 'zoomLayer',
        value: true
      });
      var backgroundContainer = createMinimapLayer();

      map.getAllObjects({ filters: filters }).forEach(function (obj) {
        backgroundContainer.addChild(staticCB(obj));
      });

      backgroundContainer.cacheAsBitmap = true;

      minimap.addChild(backgroundContainer);
    }
    function setupDynamicLayer(updateCB) {
      var filters = new MapDataManipulator({
        type: 'filter',
        object: 'object',
        property: 'static',
        value: false
      });
      dynamicContainer = createMinimapLayer();

      map.getAllObjects({ filters: filters }).forEach(function (obj) {
        dynamicContainer.addChild(updateCB(obj));
      });

      dynamicContainer.cacheAsBitmap = true;

      minimap.addChild(dynamicContainer);
    }
    function setupMinimapViewportEvents() {
      mapEvents.subscribe('mapMoved', reactToMapMovement);
      mapEvents.subscribe('mapZoomed', reactToMapScale);
      mapEvents.subscribe('minimapClicked', moveViewport);
    }
    function reactToMapMovement() {
      if (mapMoveTimestamp - Date.now() > -5) {
        return;
      }

      var minimapCoordinates = coordinateConverterCB(map.getMovableLayer(), true);

      minimapViewport.x = minimapCoordinates.x;
      minimapViewport.y = minimapCoordinates.y;

      map.drawOnNextTick();
    }
    function reactToMapScale() {
      minimapViewport.scale.x += 0.1;
      minimapViewport.scale.y = 0.1;
    }
    function moveViewport(datas) {
      var globalCoordinates = utils.mouse.eventData.getHAMMERPointerCoords(datas);
      var mapCoordinates = new PIXI.Point(datas.srcEvent.layerX, datas.srcEvent.layerY);

      globalCoordinates = utils.mouse.coordinatesFromGlobalToRelative(globalCoordinates, map.minimapCanvas);

      /* We need to keep track when the map was moved, so we don't react to this movement */
      mapMoveTimestamp = Date.now();

      /* Select the center of the viewport rectangle */
      globalCoordinates.x -= Math.round(minimapViewport.width / 2);
      globalCoordinates.y -= Math.round(minimapViewport.height / 2);

      mapCoordinates = coordinateConverterCB(globalCoordinates, true);
      minimapViewport.x = mapCoordinates.x;
      minimapViewport.y = mapCoordinates.y;
      mapCoordinates = coordinateConverterCB(globalCoordinates, false);
      map.moveMap(mapCoordinates, { absolute: true, noEvent: true });

      map.drawOnNextTick();
    }
    function setupMinimapClickEvent() {
      var activeCB;
      var minimapClickDetector = {
        on: function on(cb) {
          var tap = new Hammer.Tap();
          activeCB = cb;

          hammer.add(tap);
          hammer.on('tap', activeCB);
        },
        off: function off() {
          hammer.on('tap', activeCB);
        }
      };

      eventListeners.setDetector('minimapClicked', minimapClickDetector.on, minimapClickDetector.off);

      eventListeners.on('minimapClicked', moveViewport);
    }
    /*-----------------------
    -------- PRIVATE --------
    -----------------------*/
    /**
     * Sets up the minimap area. Like correct position and renderer auto resizing.
     *
     * @param {Integer} x
     * @param {Integer} y
     * @param {Integer} width
     * @param {Integer} height
     */
    function _setMinimapArea(x, y, width, height) {
      var _minimapRenderer = map.getRenderer('minimap');

      minimap.position = new PIXI.Point(x, y);
      _minimapRenderer.autoResize = true;
      _minimapRenderer.resize(width + paddingX * 2, height + paddingY * 2);

      map.drawOnNextTick();
    }
    /**
     * Creates minimap layer with proper starting coordinates
     *
     * @return {PIXI.Container}
     */
    function createMinimapLayer() {
      var container = new PIXI.Container();

      container.x = paddingX;
      container.y = paddingY;

      return container;
    }
    function updateMinimapLayer() {
      dynamicContainer.cacheAsBitmap = false;
      dynamicContainer.cacheAsBitmap = true;
    }
  }
})();
'use strict';

(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var mapEvents = window.flatworld.mapEvents;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.extensions.minimaps.scaledMinimap = setupScaledMinimap();

  /*-----------------------
  ------- VARIABLES -------
  -----------------------*/
  var _minimapLayer;

  /*-----------------------
  -------- PUBLIC ---------
  -----------------------*/
  /**
   *
   * @namespace flatworld.extensions.minimaps
   * @class scaledMinimap
   **/
  function setupScaledMinimap() {
    var map, minimap;

    return {
      init: init,
      pluginName: 'scaledMinimap',
      _testObject: {}
    };
    /**
     * Ínitialize as a plugin
     *
     * @method init
     * @param  {Map} map     Instance of Map
     */
    function init(givenMap) {
      map = givenMap;
      map.initMinimap = initMinimap;
      _minimapLayer = map.getMinimapLayer();
    }

    function initMinimap(_ref, UIImage, backgroundImage) {
      var width = _ref.width;
      var height = _ref.height;

      var _ref2 = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      var _ref2$x = _ref2.x;
      var x = _ref2$x === undefined ? 0 : _ref2$x;
      var _ref2$y = _ref2.y;
      var y = _ref2$y === undefined ? 0 : _ref2$y;

      var UITexture = PIXI.Texture.fromFrame(UIImage);

      _minimapLayer.targetSize.x = width;
      _minimapLayer.targetSize.y = height;
      setMinimapUI(UIImage);
      setupBackgroundLayer(backgroundImage);
      _setMinimapCoordinates(Math.round(x), Math.round(y));

      mapEvents.publish('minimapInitialized', minimap);
    }
    function setMinimapUI(UIImage) {
      var UITexture = PIXI.Texture.fromFrame(UIImage);
      var UISprite = new PIXI.Sprite(UITexture);

      map.getMinimapLayer().addChild(UISprite);
    }
    function setupBackgroundLayer(backgroundImage) {
      /* Setting width and height will scale the image */
      backgroundImage.width = _minimapLayer.targetSize.x / map.width;
      backgroundImage.height = _minimapLayer.targetSize.y / map.height;

      _minimapLayer.addChild(backgroundImage);
    }
    function setupDynamicLayer(updateCB) {}
    /*-----------------------
    -------- PRIVATE --------
    -----------------------*/
    function _setMinimapCoordinates(_ref3) {
      var x = _ref3.x;
      var y = _ref3.y;

      map.getMinimapLayer().position(new PIXI.Point(x, y));
    }
  }
})();
"use strict";

window.flatworld.extensions.fogOfWars = {};
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function simpleFogOfWar() {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var PIXI = window.flatworld_libraries.PIXI;
  var _window$flatworld = window.flatworld;
  var mapEvents = _window$flatworld.mapEvents;
  var generalUtils = _window$flatworld.generalUtils;
  var resize = window.flatworld.utils.resize;

  /*-----------------------
  ---------- API ----------
  -----------------------*/

  window.flatworld.extensions.fogOfWars.simpleFogOfWar = setupSimpleFogOfWar();

  /*-----------------------
  -------- PUBLIC ---------
  -----------------------*/
  /**
   * Simple fog of war works with circles around objects
   *
   * @namespace flatworld.extensions.fogOfWars
   * @class pixelizedMinimap
   **/
  function setupSimpleFogOfWar() {
    var maskSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
    var renderTexture = new PIXI.RenderTexture(new PIXI.BaseRenderTexture(resize.getWindowSize().x, resize.getWindowSize().y));
    var FoWOverlay = new PIXI.Graphics();
    var movableLayer = void 0;
    var zoomLayer = void 0;
    var mapRenderer = void 0;
    var map = void 0;
    var maskMovableContainer = void 0;
    var maskStageContainer = void 0;
    var FoWCB = void 0;
    var objectsForFoW = void 0;
    var color = void 0;

    return {
      // These two are required by all plugins
      init: init,
      pluginName: 'simpleFogOfWar',

      activateFogOfWar: activateFogOfWar,
      refreshFoW: refreshFoW,
      getFoWObjectArray: getFoWObjectArray,
      calculateCorrectCoordinates: calculateCorrectCoordinates,
      FOR_TESTS: {
        setObjectsForFoW: function setObjectsForFoW(o) {
          return objectsForFoW = o;
        }
      }
    };
    /**
     * Ínitialize as a plugin. Done by the Flatworld class.
     *
     * After plugin has been initialized by the flatworld, you must still call activateFogOfWar to
     * start showing it.
     *
     * @todo the offsets are really bad! For some reason they are needed, I don't know where the
     * issue lies :(. We probably need an offset for the renderer in the end anyway, but now it
     * doesn't even work properly without them.
     * can be used here and in getViewportArea-method etc.
     *
     * @method init
     * @param  {Map} givenMap     Instance of Map
     */
    function init(givenMap) {
      map = givenMap;
      map.activateFogOfWar = activateFogOfWar;
      movableLayer = map.getMovableLayer();
      zoomLayer = map.getZoomLayer();
      mapRenderer = map.getRenderer();

      maskStageContainer = map.createSpecialLayer('FoWStageMaskLayer');
      maskMovableContainer = map.createSpecialLayer('FoWMovableMaskLayer');
      maskMovableContainer.x = movableLayer.x;
      maskMovableContainer.y = movableLayer.y;
    }

    function activateFogOfWar(cb, filter) {
      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      color = options.color || 0x222222;
      FoWCB = cb;
      objectsForFoW = map.getPrimaryLayers({ filters: filter }).map(function (o) {
        return o.getObjects(filter);
      });
      objectsForFoW = generalUtils.arrays.flatten2Levels(objectsForFoW);

      createOverlay();

      setupFoW();
      setEvents();
    }

    function setupFoW() {
      var spriteArray = getFoWObjectArray(FoWCB);

      resetFoW(FoWOverlay);

      if (spriteArray.length > 0) {
        var _maskMovableContainer;

        (_maskMovableContainer = maskMovableContainer).addChild.apply(_maskMovableContainer, _toConsumableArray(spriteArray));
      }

      maskStageContainer.filterArea = new PIXI.Rectangle(0, 0, mapRenderer.width, mapRenderer.height);
      resizeFoW();

      zoomLayer.mask = maskSprite;

      map.registerPreRenderer('renderFoW', moveFoW);
    }

    function refreshFoW() {
      mapRenderer.render(maskStageContainer, renderTexture, true, null, false);

      maskSprite.texture = renderTexture;
    }

    function moveFoW() {
      maskMovableContainer.position = movableLayer.position;

      refreshFoW();
    }

    function zoomFoW() {
      maskStageContainer.scale.x = map.getZoom();
      maskStageContainer.scale.y = map.getZoom();

      createOverlay();
      refreshFoW();
    }

    function resizeFoW() {

      createOverlay();
      refreshFoW();
    }

    function getFoWObjectArray(cb) {
      return objectsForFoW.map(function (object) {
        return cb(calculateCorrectCoordinates(object));
      });
    }

    function calculateCorrectCoordinates(object) {
      var coordinates = object.toGlobal(new PIXI.Point(0, 0));

      coordinates.x = Math.round(coordinates.x);
      coordinates.y = Math.round(coordinates.y);
      coordinates.anchor = object.anchor;
      coordinates.pivot = object.pivot;
      coordinates.scale = map.getZoom();

      return coordinates;
    }

    /** *************************************
    **************** PRIVATE ****************
    ****************************************/
    function resetFoW() {
      maskMovableContainer.children && maskMovableContainer.removeChildren();
      maskStageContainer.children && maskStageContainer.removeChildren();
      maskStageContainer.addChild(FoWOverlay);
      maskStageContainer.addChild(maskMovableContainer);
    }

    function createOverlay() {
      var coordinates = {
        x: -100,
        y: -100,
        width: mapRenderer.width + 200 + mapRenderer.width / map.getZoom(),
        height: mapRenderer.height + 200 + mapRenderer.height / map.getZoom()
      };

      FoWOverlay.clear();
      FoWOverlay.beginFill(color);
      FoWOverlay.drawRect(coordinates.x, coordinates.y, coordinates.width, coordinates.height);
      FoWOverlay.endFill();
    }
    function setEvents() {
      mapEvents.subscribe('mapResized', resizeFoW);
      mapEvents.subscribe('mapZoomed', zoomFoW);
      /*mapEvents.subscribe('mapMoved', moveFoW);*/
    }
  }
})();
"use strict";

window.flatworld.UIs = window.flatworld.UIs || {};
window.flatworld.UIs.default = {};
window.flatworld.UIs.default.utils = {};
window.flatworld.UIs.default.layout = {};
'use strict';

(function () {
  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.UIs.default.utils.drawShapes = function () {
    return {
      normal: drawArrow,
      arced: drawArcedArrow,
      line: line
    };

    /* =============== Functions for drawing arrows ================ */

    // From the website: http://www.dbp-consulting.com/tutorials/canvas/CanvasArrow.html
    /*
      @param {int} x1,y1 - the line of the shaft starts here
      @param {int} x2,y2 - the line of the shaft ends here
      @param {int or function} style - type of head to draw
          0 - filled head with back a curve drawn with arcTo
              n.b. some browsers have an arcTo bug that make this look bizarre
          1 - filled head with back a straight line
          2 - unfilled but stroked head
          3 - filled head with back a curve drawn with quadraticCurveTo
          4 - filled head with back a curve drawn with bezierCurveTo
              function(ctx,x0,y0,x1,y1,x2,y2,style) - a function provided by the user to draw the head. Point (x1,y1) is the same as the end of the line, and (x0,y0) and (x2,y2) are the two back corners. The style argument is the this for the function. An example that just draws little circles at each corner of the arrow head is shown later in this document.
          default 3 (filled head with quadratic back)
      @param {int} which - which end(s) get the arrow
          0 - neither
          1 - x2,y2 end
          2 - x1,y1 end
          3 - (that's 1+2) both ends
          default 1 (destination end gets the arrow)
      @param {float} angle - the angle θ from shaft to one side of arrow head - default π/8 radians (22 1/2°, half of a 45°)
      @param {int} length - the distance d in pixels from arrow point back along the shaft to the back of the arrow head - default 10px
        Passing in a custom head drawing routine, ie:
      var headDrawer=function(ctx,x0,y0,x1,y1,x2,y2,style)
      {
          var radius=3;
          var twoPI=2*Math.PI;
          ctx.save();
          ctx.beginPath();
          ctx.arc(x0,y0,radius,0,twoPI,false);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x1,y1,radius,0,twoPI,false);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x2,y2,radius,0,twoPI,false);
          ctx.stroke();
          ctx.restore();
      }
        Modified to support easelJS (no context editing, instead graphics-object)
        */
    function drawArrow(shape, x1, y1, x2, y2, style, which, angle, d) {
      var graphics = shape.graphics,
          color = '#000',
          angle1,
          topx,
          topy,
          angle2,
          botx,
          boty;

      /* Ceason pointed to a problem when x1 or y1 were a string, and
          concatenation would happen instead of addition */
      if (typeof x1 === 'string') x1 = parseInt(x1, 10);
      if (typeof y1 == 'string') y1 = parseInt(y1, 10);
      if (typeof x2 == 'string') x2 = parseInt(x2, 10);
      if (typeof y2 == 'string') y2 = parseInt(y2, 10);
      style = typeof style != 'undefined' ? style : 3;
      which = typeof which != 'undefined' ? which : 1; // end point gets arrow
      angle = typeof angle != 'undefined' ? angle : Math.PI / 8;
      d = typeof d != 'undefined' ? d : 10;
      // default to using drawHead to draw the head, but if the style
      // argument is a function, use it instead
      var toDrawHead = typeof style != 'function' ? drawHead : style;

      /* For ends with arrow we actually want to stop before we get to the arrow
          so that wide lines won't put a flat end on the arrow. */
      var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
      var ratio = (dist - d / 3) / dist;
      var tox, toy, fromx, fromy;
      if (which & 1) {
        tox = Math.round(x1 + (x2 - x1) * ratio);
        toy = Math.round(y1 + (y2 - y1) * ratio);
      } else {
        tox = x2;
        toy = y2;
      }
      if (which & 2) {
        fromx = x1 + (x2 - x1) * (1 - ratio);
        fromy = y1 + (y2 - y1) * (1 - ratio);
      } else {
        fromx = x1;
        fromy = y1;
      }

      /* Original: Draw the shaft of the arrow
         ctx.beginPath();
         ctx.moveTo(fromx,fromy);
         ctx.lineTo(tox,toy);
         ctx.stroke(); */

      // Modified easelJS-version:
      graphics.beginStroke(color).moveTo(fromx, fromy).lineTo(tox, toy);

      // calculate the angle of the line
      var lineangle = Math.atan2(y2 - y1, x2 - x1);
      // h is the line length of a side of the arrow head
      var h = Math.abs(d / Math.cos(angle));

      if (which & 1) {
        // handle far end arrow head
        angle1 = lineangle + Math.PI + angle;
        topx = x2 + Math.cos(angle1) * h;
        topy = y2 + Math.sin(angle1) * h;
        angle2 = lineangle + Math.PI - angle;
        botx = x2 + Math.cos(angle2) * h;
        boty = y2 + Math.sin(angle2) * h;
        toDrawHead(graphics, topx, topy, x2, y2, botx, boty, style);
      }
      if (which & 2) {
        // handle near end arrow head
        angle1 = lineangle + angle;
        topx = x1 + Math.cos(angle1) * h;
        topy = y1 + Math.sin(angle1) * h;
        angle2 = lineangle - angle;
        botx = x1 + Math.cos(angle2) * h;
        boty = y1 + Math.sin(angle2) * h;
        toDrawHead(graphics, topx, topy, x1, y1, botx, boty, style);
      }

      return true;

      function drawHead(graphics, x0, y0, x1, y1, x2, y2, style) {
        var backdist;
        x0 = +x0, y0 = +y0, x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2;
        // all cases do this.
        graphics.beginStroke('#F00').moveTo(x0, y0).lineTo(x1, y1).lineTo(x2, y2);
        switch (style) {
          case 0:
            // curved filled, add the bottom as an arcTo curve and fill
            backdist = Math.sqrt((x2 - x0) * (x2 - x0) + (y2 - y0) * (y2 - y0));
            graphics.arcTo(x1, y1, x0, y0, 0.55 * backdist);
            graphics.fill();
            break;
          case 1:
            // straight filled, add the bottom as a line and fill.
            graphics.beginStroke('#F00').moveTo(x0, y0).lineTo(x1, y1).lineTo(x2, y2).lineTo(x0, y0).fill();
            break;
          case 2:
            // unfilled head, just stroke.
            break;
          case 3:
            // filled head, add the bottom as a quadraticCurveTo curve and fill
            var cpx = (x0 + x1 + x2) / 3;
            var cpy = (y0 + y1 + y2) / 3;
            graphics.beginFill().quadraticCurveTo(cpx, cpy, x0, y0);
            break;
          case 4:
            // filled head, add the bottom as a bezierCurveTo curve and fill
            var cp1x, cp1y, cp2x, cp2y;
            var shiftamt = 5;
            if (x2 === x0) {
              // Avoid a divide by zero if x2==x0
              backdist = y2 - y0;
              cp1x = (x1 + x0) / 2;
              cp2x = (x1 + x0) / 2;
              cp1y = y1 + backdist / shiftamt;
              cp2y = y1 - backdist / shiftamt;
            } else {
              backdist = Math.sqrt((x2 - x0) * (x2 - x0) + (y2 - y0) * (y2 - y0));
              var xback = (x0 + x2) / 2;
              var yback = (y0 + y2) / 2;
              var xmid = (xback + x1) / 2;
              var ymid = (yback + y1) / 2;

              var m = (y2 - y0) / (x2 - x0);
              var dx = backdist / (2 * Math.sqrt(m * m + 1)) / shiftamt;
              var dy = m * dx;
              cp1x = xmid - dx;
              cp1y = ymid - dy;
              cp2x = xmid + dx;
              cp2y = ymid + dy;
            }

            graphics.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x0, y0);
            graphics.fill();
            break;
        }
      }
    }
    function drawArcedArrow(graphics, x, y, r, startangle, endangle, anticlockwise, style, which, angle, d) {
      var sx, sy, lineangle, destx, desty;

      style = typeof style != 'undefined' ? style : 3;
      which = typeof which != 'undefined' ? which : 1; // end point gets arrow
      angle = typeof angle != 'undefined' ? angle : Math.PI / 8;
      d = typeof d != 'undefined' ? d : 10;
      // Old: ctx.save();
      graphics.beginPath();
      graphics.arc(x, y, r, startangle, endangle, anticlockwise);
      graphics.stroke();

      graphics.strokeStyle = 'rgba(0,0,0,0)'; // don't show the shaft
      if (which & 1) {
        // draw the destination end
        sx = Math.cos(startangle) * r + x;
        sy = Math.sin(startangle) * r + y;
        lineangle = Math.atan2(x - sx, sy - y);

        if (anticlockwise) {
          destx = sx + 10 * Math.cos(lineangle);
          desty = sy + 10 * Math.sin(lineangle);
        } else {
          destx = sx - 10 * Math.cos(lineangle);
          desty = sy - 10 * Math.sin(lineangle);
        }
        drawArrow(graphics, sx, sy, destx, desty, style, 2, angle, d);
      }
      if (which & 2) {
        // draw the origination end
        sx = Math.cos(endangle) * r + x;
        sy = Math.sin(endangle) * r + y;
        lineangle = Math.atan2(x - sx, sy - y);
        if (anticlockwise) {
          destx = sx - 10 * Math.cos(lineangle);
          desty = sy - 10 * Math.sin(lineangle);
        } else {
          destx = sx + 10 * Math.cos(lineangle);
          desty = sy + 10 * Math.sin(lineangle);
        }
        drawArrow(graphics, sx, sy, destx, desty, style, 2, angle, d);
      }
    }
    /* =============================== */

    function line(graphics, from, to) {
      var options = arguments.length <= 3 || arguments[3] === undefined ? { color: '#000000', style: 5 } : arguments[3];
      var color = options.color;
      var style = options.style;


      graphics.lineStyle(style, color);
      graphics.moveTo(from.x, from.y);
      graphics.lineTo(to.x, to.y);
      graphics.endFill();

      return graphics;
    }
  }();
})();
"use strict";

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var Handlebars = window.flatworld_libraries.Handlebars;

  window.flatworld.UIs = window.flatworld.UIs || {};
  window.flatworld.UIs.default = window.flatworld.UIs.default || {};
  window.flatworld.UIs.default.templates = {
    multiSelection: Handlebars.compile("\n      <span style='font-size:200%;display:block;margin-bottom:20px;'>\n        {{title}}\n      </span>\n      <ul>\n        {{#each objects}}\n        <li>\n          {{this.data.typeData.name}}\n        </li>\n        {{/each}}\n      </ul>"),
    singleSelection: Handlebars.compile("\n      <span style='font-size:200%;display:block;margin-bottom:20px;'>\n        {{title}}\n      </span>\n      <ul>\n        <li>\n          {{object.name}}\n        </li>\n      </ul>")
  };
})();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var PIXI = window.flatworld_libraries.PIXI;

  var templates = window.flatworld.UIs.default.templates;
  var createVisibleHexagon = window.flatworld.extensions.hexagons.utils.createVisibleHexagon;
  var drawShapes = window.flatworld.UIs.default.utils.drawShapes;
  var mapLog = window.flatworld.log;

  /*---------------------
  ------ VARIABLES ------
  ----------------------*/
  var styleSheetElement;
  var cssClasses;
  var elementList = {};

  /*---------------------
  --------- API ---------
  ----------------------*/

  var UIDefault = function () {
    /**
     * The simplest default UI implementation. Implemented UI functionalities for: showSelections, highlightSelectedObject
     *
     * @namespace flatworld.UIs
     * @class default
     * @constructor
     * @requires Handlebars
     * @requires hexagon extension
     * @param  {HTMLElement} modal      The modal used in this UI Theme
     * @param  {Flatworld} FTW          Instance of flatworld class
     * @param  {Object} options         optional options
     * @param  {Object} options.styles  styles for the UI
     */

    function UIDefault(modal, FTW) {
      var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref$radius = _ref.radius;
      var radius = _ref$radius === undefined ? 71 : _ref$radius;
      var _ref$styles = _ref.styles;
      var styles = _ref$styles === undefined ? '#F0F0F0' : _ref$styles;
      var elements = _ref.elements;

      _classCallCheck(this, UIDefault);

      this.RADIUS = radius;
      cssClasses = elements;
      styleSheetElement = this.addStyleElement();
      /* For testing. This is deeefinitely supposed to not be here, but it has stayed there for testing. */
      var createdCSS = '\n        ' + cssClasses.select + ' {\n          z-index: 9999;\n          opacity: 0.9;\n          position: fixed;\n          left: 0px;\n          bottom: 0px;\n          background-color: brown;\n          border: 1px solid rgb(255, 186, 148);;\n          border-bottom: 0px;\n          padding:15px;\n          margin-left:10px;\n        }';
      this.addCSSRulesToScriptTag(styleSheetElement, createdCSS);

      // Add a media (and/or media query) here if you'd like!
      // style.setAttribute('media', 'screen')
      // style.setAttribute('media', 'only screen and (max-width : 1024px)')

      this.FTW = FTW;
      this.modal = modal || document.getElementById('dialog_select');
      this.styles = styles;
    }
    /**
     * @method getTemplates
     * Required by the map/core/UI.js API
     */


    _createClass(UIDefault, [{
      key: 'setFlatworld',
      value: function setFlatworld(FTW) {
        this.FTW = FTW;
      }
      /**
       * @method getTemplates
       * Required by the map/core/UI.js API
       */

    }, {
      key: 'getTemplates',
      value: function getTemplates() {
        return templates;
      }
      /**
       * Required by the map.UI API
       *
       * @method showSelections
       * @param  {Object} objects     Objects that have been selected. See core.UI for more information
       * @param {Object} getDatas       See explanation in core.UI
       * @param {Object} options        Extra options
       */

    }, {
      key: 'showSelections',
      value: function showSelections(objects, getDatas, options) {
        var _this = this;

        var updateCB = this.FTW.drawOnNextTick.bind(this.FTW);
        var UILayer = this.FTW.getMovableLayer();
        var cb;

        /* We add the objects to be highlighted to the correct UI layer */
        // objectsToUI(UILayer, objects);

        if (objects && objects.length > 1) {
          cb = function cb() {
            _this.modal.innerHTML = templates.multiSelection({
              title: 'Objects',
              objects: objects
            });

            _this.showModal(_this.modal, cssClasses);

            _getElement('select').style.display = 'block';
          };
        } else if (objects && objects.length === 1) {
          cb = function cb() {
            _this.highlightSelectedObject(objects[0]);
          };
        } else {
          cb = function cb() {
            UILayer.deleteUIObjects();
            updateCB();
            mapLog.debug('Error occured selecting the objects on this coordinates! Nothing found');
          };
        }

        _getElement('select').style.display = 'none';
        cb();
      }
      /**
       * Required by the map.UI API
       *
       * @method highlightSelectedObject
       * @param  {Object} object        Object that has been selected. See core.UI for more information
       * @param {Object} getDatas       See explanation in core.UI
       * @param {Object} options        Extra options. Like dropping a shadow etc.
       */

    }, {
      key: 'highlightSelectedObject',
      value: function highlightSelectedObject(object, getDatas) {
        var options = arguments.length <= 2 || arguments[2] === undefined ? { shadow: { color: '0x0000', distance: 5, alpha: 0.55, angle: 45, blur: 5 } } : arguments[2];
        var shadow = options.shadow;

        var highlightableObject, objectDatas;

        objectDatas = getDatas.allData(object);

        this.modal.innerHTML = templates.singleSelection({
          title: 'Selected',
          object: {
            name: objectDatas.name
          }
        });
        this.showModal(this.modal, cssClasses);

        highlightableObject = this._highlightSelectedObject(object, this.FTW.getRenderer());

        highlightableObject.dropShadow({
          color: shadow.color,
          distance: shadow.distance,
          alpha: shadow.alpha,
          angle: shadow.angle,
          blur: shadow.blur
        });

        this.FTW.drawOnNextTick();

        _getElement('select').style.display = 'block';

        return highlightableObject;
      }
      /**
       * @method showUnitMovement
       * @param {PIXI.Point} to       Global coordinates that were clicked
       */

    }, {
      key: 'showUnitMovement',
      value: function showUnitMovement(object, to) {
        var UINAME = 'movementArrow';
        var localTo, localFrom, currentArrow;

        localTo = this.FTW.getMovableLayer().toLocal(to);
        localFrom = this.FTW.getMovableLayer().toLocal(object.toGlobal(new PIXI.Point(0, 0)));

        currentArrow = drawShapes.line(new PIXI.Graphics(), localFrom, localTo);

        this.FTW.removeUIObject(this.FTW.layerTypes.movableType.id, UINAME);

        this.FTW.addUIObject(this.FTW.layerTypes.movableType.id, currentArrow, UINAME);
        this.FTW.drawOnNextTick();
      }

      /*----------------------
      ------- PRIVATE --------
      ----------------------*/
      /**
       * @private
       * @static
       * @method _highlightSelectedObject
       * @param  {Object} object
       * @param  {MapLayer} movableLayer
       * @param  {PIXI.Renderer} renderer
       */

    }, {
      key: '_highlightSelectedObject',
      value: function _highlightSelectedObject(object, renderer) {
        var movableLayer = this.FTW.getMovableLayer();
        var clonedObject;

        clonedObject = object.clone(renderer, { anchor: true, scale: true });

        var coord = object.toGlobal(new PIXI.Point(0, 0));
        coord = movableLayer.toLocal(coord);

        this.createHighlight(clonedObject, { coords: coord });

        return clonedObject;
      }
      /**
       * @private
       * @static
       * @method createHighlight
       */

    }, {
      key: 'createHighlight',
      value: function createHighlight(object) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? { coords: new PIXI.Point(0, 0) } : arguments[1];

        var UI_CONTAINER_NAME = 'unit highlight';
        var movableLayer = this.FTW.getMovableLayer();
        var container = new this.FTW.createSpecialLayer('UILayer', { toLayer: movableLayer });
        var objCoords = {
          x: Number(object.x),
          y: Number(object.y)
        };
        var highlighterObject;

        highlighterObject = createVisibleHexagon(this.RADIUS, { color: '#F0F0F0' });
        highlighterObject.position.set(objCoords.x, objCoords.y);

        highlighterObject.alpha = 0.5;

        /* We add the children first to subcontainer, since it's much easier to handle the x and y in it, rather than
         * handle graphics x and y */
        container.addChild(highlighterObject);
        container.addChild(object);

        container.position = options.coords;

        this.FTW.removeUIObject(this.FTW.layerTypes.movableType.id);
        this.FTW.addUIObject(this.FTW.layerTypes.movableType.id, container, UI_CONTAINER_NAME);
      }
      /**
       * @method addCSSRulesToScriptTag
       *
       * @param {Object} sheet
       * @param {Object} rules
       */

    }, {
      key: 'addCSSRulesToScriptTag',
      value: function addCSSRulesToScriptTag(sheet, rules) {
        sheet.insertRule(rules, 0);
      }
      /**
       * @method addStyleElement
       */

    }, {
      key: 'addStyleElement',
      value: function addStyleElement() {
        var _styleElement = document.createElement('style');
        // WebKit hack :(
        _styleElement.appendChild(document.createTextNode(''));
        document.head.appendChild(_styleElement);

        return _styleElement.sheet;
      }
      /**
       * @method showModal
       *
       * @param {HTMLElement} modalElem
       * @param {Object} cssClasses
       * @todo make sure / check, that modalElem.classList.add gets added only once
       */

    }, {
      key: 'showModal',
      value: function showModal(modalElem, cssClasses) {
        modalElem.classList.add(cssClasses.select);
        /* Would be HTML 5.1 standard, but that might be a long way
          this.modal.show();*/
      }
    }]);

    return UIDefault;
  }();

  /*----------------------
  ------- PRIVATE --------
  ----------------------*/
  /**
   * @private
   * @static
   * @method _getElement
   * @param  {[type]} which [description]
   * @return {[type]}       [description]
   */


  function _getElement(which) {
    if (!elementList[which]) {
      var element = document.querySelector(cssClasses[which]);
      elementList[which] = element;
    }

    return elementList[which];
  }

  window.flatworld.UIs.default.init = UIDefault;
})();
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var _window$flatworld_lib = window.flatworld_libraries;
  var Q = _window$flatworld_lib.Q;
  var PIXI = _window$flatworld_lib.PIXI;
  var _window$flatworld = window.flatworld;
  var mapLayers = _window$flatworld.mapLayers;
  var ObjectManager = _window$flatworld.ObjectManager;
  var mapEvents = _window$flatworld.mapEvents;
  var generalUtils = _window$flatworld.generalUtils;
  var log = _window$flatworld.log;
  var utils = _window$flatworld.utils;

  /*---------------------
  ------ VARIABLES ------
  ----------------------*/

  var LAYER_TYPE_STATIC = 0;
  var LAYER_TYPE_MOVABLE = 1;
  var LAYER_TYPE_MINIMAP = 2;
  var VERSION = '0.0.0';
  var _renderers = {};
  var _drawMapOnNextTick = false;
  var isMapReadyPromises = [];
  var _privateRenderers = void 0;
  var _zoomLayer = void 0;
  var _movableLayer = void 0;
  var _minimapLayer = void 0;
  var ParentLayerConstructor = void 0;

  /*---------------------
  --------- API ---------
  ----------------------*/

  var Flatworld = function () {
    /**
     * Main class for the engine
     *
     * Initializes the whole structure and plugins and is used as primary API for all operations. This class is e.g. passed to every
     * plugin that get initialized with their init-method.
     *
     * You use the class by instantiating it (new) and then finishing initialization with init-method. Please see examples below.
     *
     * The biggest part of creating the map, is the data structure. There is a clear data structure that you can see from the
     * tests/data-folder, but the factory is responsible for creating the objects, so you can use your own factory implementation. So to
     * understand more, please see e.g. {{#crossLink 'flatworld.factories.hexaFactory'}}{{/crossLink}}.
     *
     * The map consists of layer on top of each other. The example is best understood when thinking typical war strategy game. The
     * structure is this:
     * 1. ZoomLayer: Handles things like scaling / zooming the map
     * 2. MovableLayer: Obviously handles movement of the map. Also is a good place to get map coordinates. Since getting global
     * coordinates won't help you much, half of the time.
     * 3. Different layers: like units, terrain, fog of war, UIs etc. Can also contains special layers like dynamically changed UIlayers.
     * 4. possible subcontainers (used for optimized object selection and map movement). Can also contains special layers like dynamically
     * changed UIlayers.
     * 5. Individual objects, like units, terrains, cities etc...
     *
     * Plugins can be added with activatePlugins-method by sending them to the class. Plugins must always implement init-method, which
     * receives Map instance. Plugins are not yet restricted what they can do and can add functionality without touching map or can modify
     * objects or their prototypes through access to Map instance.
     *
     * @example
     *     var map = new Map(divContainer, mapOptions );
     *     promises = map.init( gameData.pluginsToActivate, mapData.startPoint );
     *
     * A note on the UI part of the map. The UI is not the primary UI interface for the map, but instead it is the UI that is used when
     * interacting with the map and objects in it. So e.g. when user selects a unit on the map. How that unit is highlighted as selected
     * and what kind of possible info-box we show to the user regarding that object, movement of units etc.
     *
     * @namespace flatworld
     * @class Flatworld
     * @constructor
     * @requires PIXI.JS framework in global namespace
     * @requires Canvas (webGL support recommended) HTML5-element supported.
     * @requires Q for promises
     * @requires Hammer for touch events
     * @requires Hamster for mouse scroll events
     *
     * @param {HTMLElement} mapCanvas                       HTML element which will be container for the created canvas element.
     * @param {Object} [props]                              Extra properties
     * @param {Object} props.bounds                         Bounds of the viewport
     * @param {Integer} props.bounds.width                  Bound width
     * @param {Integer} props.bounds.height                 Bound height
     * @param {Object} [props.mapSize]                      The total mapSize
     * @param {Integer} props.mapSize.x                     x-axis
     * @param {Integer} props.mapSize.y                     y-axis
     * @param {Object} props.rendererOptions                Renderer options passed to PIXI.autoDetectRenderer
     * @param {Object} props.subcontainers                  Subcontainers size in pixels. If given, will activate subcontainers. If not
     * given or false, subcontainers are not used.
     * @param {Integer} props.subcontainers.width           Subcontainer width
     * @param {Integer} props.subcontainers.height          Subcontainer height
     * @param {FPSCallback} [trackFPSCB]                    Callback function for tracking FPS in renderer. So this is used for debugging
     * and optimizing.
     *
     * @return {Object}                                      New Map instance
     */

    function Flatworld() {
      var mapCanvas = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _ref$bounds = _ref.bounds;
      var bounds = _ref$bounds === undefined ? { width: 0, height: 0 } : _ref$bounds;
      var _ref$mapSize = _ref.mapSize;
      var mapSize = _ref$mapSize === undefined ? { x: 0, y: 0 } : _ref$mapSize;
      var _ref$rendererOptions = _ref.rendererOptions;
      var rendererOptions = _ref$rendererOptions === undefined ? { autoResize: true, antialias: false } : _ref$rendererOptions;
      var minimapCanvas = _ref.minimapCanvas;
      var _ref$subcontainers = _ref.subcontainers;
      var subcontainers = _ref$subcontainers === undefined ? {
        width: 0,
        height: 0,
        maxDetectionOffset: 0 } : _ref$subcontainers;
      var _ref$trackFPSCB = _ref.trackFPSCB;
      var // maxDetectionOffset default set later
      trackFPSCB = _ref$trackFPSCB === undefined ? false : _ref$trackFPSCB;
      var _ref$defaultScaleMode = _ref.defaultScaleMode;
      var defaultScaleMode = _ref$defaultScaleMode === undefined ? PIXI.SCALE_MODES.DEFAULT : _ref$defaultScaleMode;

      _classCallCheck(this, Flatworld);

      /* Check for the required parameters! */
      if (!mapCanvas) {
        throw new Error(this.constructor.name + ' needs canvas element!');
      }
      /* If the constructor was passed mapCanvas as a string and not as an Element, we get the element */
      if (typeof mapCanvas === 'string') {
        mapCanvas = document.querySelector(mapCanvas);
      }

      /* Make sure the mapCanvas is empty. So there are no nasty surprises */
      mapCanvas.innerHTML = '';
      /* Add the given canvas Element to the options that are passed to PIXI renderer */
      rendererOptions.view = mapCanvas;
      /* Create PIXI renderer. Practically PIXI creates its own canvas and does its magic to it */
      _renderers.main = new PIXI.WebGLRenderer(bounds.width, bounds.height, rendererOptions);
      _renderers.main.getResponsibleLayer = this.getZoomLayer;
      /* Create PIXI renderer for minimap */
      if (minimapCanvas) {
        _renderers.minimap = minimapCanvas ? new PIXI.WebGLRenderer(0, 0, { view: minimapCanvas, autoResize: true }) : undefined;
        _renderers.minimap.plugins.interaction.destroy();
        _renderers.minimap.getResponsibleLayer = this.getMinimapLayer;
      }
      /* We handle all the events ourselves through addEventListeners-method on canvas, so destroy pixi native method */
      _renderers.main.plugins.interaction.destroy();

      /* This defines which MapLayer class we use to generate layers on the map. Under movableLayer. These are layers like: Units,
       * terrain, fog of war, UIs etc. */
      ParentLayerConstructor = subcontainers.width && subcontainers.height && subcontainers.maxDetectionOffset ? mapLayers.MapLayerParent : mapLayers.MapLayer;

      /* These are the 2 topmost layers on the map:
       * - zoomLayer: Keeps at the same coordinates always and is responsible for holding map
       * scale value and possible
       * objects that do not move with the map. ZoomLayer has only one child: _movableLayer
       * - movableLayer: Moves the map, when the user commands. Can hold e.g. UI objects that move
       * with the map. Like
       * graphics that show which area or object is currently selected. */
      _zoomLayer = new mapLayers.MapLayer({ name: 'zoomLayer', coord: { x: 0, y: 0 } });
      _movableLayer = new mapLayers.MapLayer({ name: 'movableLayer', coord: { x: 0, y: 0 } });
      _minimapLayer = new mapLayers.MapLayer({ name: 'minimapLayer', coord: { x: 0, y: 0 } });
      _zoomLayer.addChild(_movableLayer);

      /* needed to make the canvas fullsize canvas with PIXI */
      utils.general.fullsizeCanvasCSS(_renderers.main.view);
      /* stop scrollbars of showing */
      mapCanvas.style.overflow = 'hidden';

      utils.mouse.disableContextMenu(_renderers.main.view);

      /* PIXI.SCALE_MODES.DEFAULT is officially a const, but since it's not ES6 we don't care :P.
       * Setting this separately in each
       * baseTexture, would seem stupid, so we do it like this for now. */
      this.defaultScaleMode = PIXI.SCALE_MODES.DEFAULT = defaultScaleMode;

      /* We cache the privateRenderers in array format to a module variable */
      _privateRenderers = Object.keys(_renderers).map(function (idx) {
        return _renderers[idx];
      });

      /**
       * canvas element that was generated and is being used by this new generated Map instance.
       *
       * @attribute canvas
       * @type {HTMLElement}
       * @required
       **/
      this.canvas = _renderers.main.view;
      /**
       * canvas element that was generated and is being used by this new generated Map instance.
       *
       * @attribute canvas
       * @type {HTMLElement}
       * @required
       **/
      this.minimapCanvas = _renderers.minimap ? _renderers.minimap.view : undefined;
      /**
       * @attribute mapSize
       * @type {x: Number, y: Number}
       * @optional
       **/
      this.mapSize = mapSize;
      /**
       * list of plugins that the map uses and are initialized
       * @see Map.activatePlugins
       *
       * @attribute plugins
       * @type {Set}
       **/
      this.plugins = new Set();
      /**
       * Subcontainers size that we want to generate, when layers use subcontainers.
       *
       * @attribute subcontainersConfig
       * @type {{width: Integer, height: Int, maxDetectionOffset: Int}}
       **/
      // Set default
      subcontainers.maxDetectionOffset = subcontainers.maxDetectionOffset || 100;
      this.subcontainersConfig = subcontainers;
      /**
       * Callback function that gets the current FPS on the map and shows it in DOM
       *
       * @attribute trackFPSCB
       * @type {Function}
       **/
      this.trackFPSCB = trackFPSCB;
      /**
       * ObjectManager instance. Responsible for retrieving the objects from the map, on desired
       * occasions. Like when the player clicks
       * the map to select some object. This uses subcontainers when present.
       *
       * @attribute objectManager
       * @type {ObjectManager}
       **/
      this.objectManager = new ObjectManager();
      /**
       * Set variable showing if the device supports touch or not.
       *
       * @attribute isTouch
       * @type {Boolean}
       **/
      this.isSupportedTouch = generalUtils.environmentDetection.isTouchDevice();
      /**
       * The object or objects that are currently selected for details and actions / orders. This gets set by other modules, like plugins.
       *
       * @attribute currentlySelectedObjects
       * @type {Array}
       **/
      this.currentlySelectedObjects = [];
      /**
       * Layer types. Can be extended, but the already defined types are supposed to be constants and not to be changed.
       *
       * @attribute layerTypes
       * @type {Object}
       */
      this.layerTypes = {
        staticType: {
          id: LAYER_TYPE_STATIC,
          layer: _zoomLayer
        },
        movableType: {
          id: LAYER_TYPE_MOVABLE,
          layer: _movableLayer
        },
        minimapType: {
          id: LAYER_TYPE_MINIMAP,
          layer: _minimapLayer
        }
      };
      /**
       * Self explanatory
       *
       * @attribute VERSION
       * @type {SEMVER}       http://semver.org/
       */
      this.VERSION = VERSION;

      /**
       * This holds callback functions executed before the actual map render is done
       * @type {Objects}
       */
      this.preRenderers = {};

      /**
       * Holds all the objects on the map. This is an alternative data structure to make some
       * operations easier. Basically it will be populated with the primaryLayers, this is done in
       * init method. More details there.
       */
      this.allMapObjects;
    }
    /**
     * This initializes the map and makes everything appear on the map and actually work. Also initializes the given plugins since
     * normally the plugins have to be activated before the map is shown.
     *
     * @method init
     * @param {String[]|Object[]} plugins                  Plugins to be activated for the map. Normally you should give the plugins here
     * instead of separately passing them to activatePlugins method. You can provide the module strings or module objects.
     * @param  {Object} coord                     Starting coordinates for the map.
     * @param  {Integer} coord.x                  X coordinate.
     * @param  {Integer} coord.y                  Y coordinate.
     * @param {Function} tickCB                   callback function for tick. Tick callback is initiated in every frame. So map draws
     * happen during ticks.
     * @param {Object} options                    Extra options.
     * @param {Boolean} options.fullsize          Do we set fullsize canvas or not at the beginning. Default: true
     * @return {Array}                            Returns an array of Promises. If this is empty / zero. Then there is nothing to wait
     * for, if it contains promises, you have to wait for them to finish for the plugins to work and map be ready.
     **/


    _createClass(Flatworld, [{
      key: 'init',
      value: function init() {
        var plugins = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
        var coord = arguments.length <= 1 || arguments[1] === undefined ? { x: 0, y: 0 } : arguments[1];
        var tickCB = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
        var options = arguments.length <= 3 || arguments[3] === undefined ? { fullsize: true } : arguments[3];

        var allPromises = [];

        options.fullsize && this.toggleFullsize();

        if (plugins.length) {
          allPromises = this.activatePlugins(plugins);
        }

        /* Sets the correct Map starting coordinates */
        coord && Object.assign(_movableLayer, coord);

        /* We activate the default tick for the map, but if custom tick callback has been given, we activate it too */
        this._defaultTick();
        tickCB && this.customTickOn(tickCB);
        isMapReadyPromises = allPromises;

        this.drawOnNextTick();

        /* Create data structures */
        this.allMapObjects = this._createArrayStructure();

        return allPromises || Promise.resolve();
      }
      /**
       * Returns a promise that resolves after the map is fully initialized
       *
       * @method whenReady
       * @return {Promise}        Promise that holds all the individual plugin loading promises
       **/

    }, {
      key: 'whenReady',
      value: function whenReady() {
        return Q.all(isMapReadyPromises);
      }
      /**
       * The correct way to update / redraw the map. Check happens at every tick and thus in every frame.
       *
       * @method drawOnNextTick
       **/

    }, {
      key: 'drawOnNextTick',
      value: function drawOnNextTick() {
        _drawMapOnNextTick = true;
      }
      /**
       * The correct way to update / redraw the map. Check happens at every tick and thus in every frame.
       *
       * @method drawOnNextTick
       **/

    }, {
      key: 'collectGarbage',
      value: function collectGarbage() {
        _privateRenderers.forEach(function (renderer) {
          return renderer.textureGC.run();
        });
      }
      /**
       * Add an UI object to the wanted layer.
       *
       * @method addUIObject
       * @param {Integer} layer           Type of the layer. this.layerTypes.STATIC.id or layerTypes.MOVABLE.id.
       * @param {Object | Array} object   The object to be attached as UI object.
       */

    }, {
      key: 'addUIObject',
      value: function addUIObject(layerType, objects, UIName) {
        var _this = this;

        if (Array.isArray(objects)) {
          objects.forEach(function (object) {
            _this._addObjectToUIlayer(layerType, object);
          });
        } else {
          this._addObjectToUIlayer(layerType, objects, UIName);
        }
      }
      /**
       * Remove an UI object to the wanted layer.
       *
       * @method removeUIObject
       * @param {Integer} layer       Type of the layer. layerTypes.STATIC of layerTypes.MOVABLE.
       * @param {String} objectName   The object to be attached as UI object.
       */

    }, {
      key: 'removeUIObject',
      value: function removeUIObject(layerType, UIName) {
        switch (layerType) {
          case LAYER_TYPE_STATIC:
            this.getZoomLayer().deleteUIObjects(UIName);
            break;
          case LAYER_TYPE_MOVABLE:
            this.getMovableLayer().deleteUIObjects(UIName);
            break;
        }
      }
      /**
       * Create a special layer, that can holds e.g. UI effects in it.
       *
       * @method createSpecialLayer
       * @param {String} name               name of the layer
       * @param {Object} options            Optional options.
       * @param {Object} options.coord      Coordinates of the layer
       * @param {Integer} options.coord.x   X coordinate
       * @param {Integer} options.coord.y   Y coordinate
       * @param {Object} options.toLayer    To which layer will this layer be added to as UILayer.
       *  Default false
       * @return {MapLayer}            The created UI layer
       **/

    }, {
      key: 'createSpecialLayer',
      value: function createSpecialLayer() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? 'default special layer' : arguments[0];
        var options = arguments.length <= 1 || arguments[1] === undefined ? {
          coord: {
            x: 0,
            y: 0 },
          toLayer: false } : arguments[1];

        var coord = options.coord || { x: 0, y: 0 };
        var layer = new mapLayers.MapLayer({ name: name, coord: coord });

        layer.specialLayer = true;
        options.toLayer && options.toLayer.addChild(layer);

        return layer;
      }
      /**
       * All parameters are passed to ParentLayerConstructor (normally constructor of MapLayer).
       *
       * @method addLayer
       * @uses MapLayer
       * @return {MapLayer}          created MapLayer instance
       **/

    }, {
      key: 'addLayer',
      value: function addLayer(layerOptions) {
        var newLayer = void 0;

        if (this.getSubcontainerConfigs() && layerOptions.subcontainers !== false) {
          layerOptions.subcontainers = this.getSubcontainerConfigs();
        }

        newLayer = new ParentLayerConstructor(layerOptions);
        this.getMovableLayer().addChild(newLayer);

        return newLayer;
      }
      /**
       * Just a convenience function (for usability and readability), for checking if the map uses
       * subcontainers.
       *
       * @method usesSubcontainers
       * @return {Boolean}
       **/

    }, {
      key: 'usesSubcontainers',
      value: function usesSubcontainers() {
        return !!(this.getSubcontainerConfigs().width && this.getSubcontainerConfigs().height);
      }
      /**
       * Returns current subcontainers configurations (like subcontainers size).
       *
       * @method getSubcontainerConfigs
       * @return {Object}
       **/

    }, {
      key: 'getSubcontainerConfigs',
      value: function getSubcontainerConfigs() {
        return this.subcontainersConfig;
      }
      /**
       * Get the size of the area that is shown to the player. More or less the area of the browser
       * window.
       *
       * @method getViewportArea
       * @param  {Boolean} isLocal                                                  Do we want to
       * use Map coordinates or global / canvas
       * coordinates. Default = false
       * @return {{x: Integer, y: Integer, width: Integer, height: Integer}}        x- and
       * y-coordinates and the width and height of the
       * viewport
       **/

    }, {
      key: 'getViewportArea',
      value: function getViewportArea() {
        var isLocal = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
        var multiplier = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        var layer = isLocal ? this.getMovableLayer() : this.getZoomLayer();
        var leftSideCoords = new PIXI.Point(0, 0);
        var rightSideCoords = new PIXI.Point(window.innerWidth, window.innerHeight);

        if (isLocal) {
          rightSideCoords = layer.toLocal(rightSideCoords);
          leftSideCoords = layer.toLocal(leftSideCoords);
        }

        var leftSide = {
          x: leftSideCoords.x,
          y: leftSideCoords.y
        };
        var rightSide = {
          x2: rightSideCoords.x,
          y2: rightSideCoords.y
        };

        var offset = {
          x: (Math.abs(rightSide.x2) - leftSide.x) * multiplier,
          y: (Math.abs(rightSide.y2) - leftSide.y) * multiplier
        };
        return {
          x: Math.round(leftSide.x - offset.x),
          y: Math.round(leftSide.y - offset.y),
          width: Math.round(Math.abs(Math.abs(rightSide.x2) - leftSide.x) + offset.x * 2),
          height: Math.round(Math.abs(Math.abs(rightSide.y2) - leftSide.y) + offset.y * 2)
        };
      }
      /**
       * Remove a primary layer from the map
       *
       * @method removeLayer
       * @param {MapLayer|PIXI.Container|PIXI.ParticleContainer} layer       The layer object to be
       * removed
       **/

    }, {
      key: 'removeLayer',
      value: function removeLayer(layer) {
        _movableLayer.removeChild(layer);

        return layer;
      }
      /**
       * return the mapsize as width and height
       *
       * @return {Object}       { x: Number, y: Number }
       */

    }, {
      key: 'getMapsize',
      value: function getMapsize() {
        return this.mapSize;
      }
      /**
       * Moves the map the amount of given x and y pixels. Note that this is not the destination coordinate, but the amount of movement that
       * the map should move. Internally it moves the movableLayer, taking into account necessary properties (like scale). Draws map after
       * movement.
       *
       * @method moveMap
       * @param {Object} coord                 The amount of x and y coordinates we want the map to move. I.e. { x: 5, y: 0 }. With this we
       * want the map to move horizontally 5 pixels and vertically stay at the same position.
       * @param {Integer} coord.x              X coordinate
       * @param {Integer} coord.y              Y coordinate
       * @param {Integer} absolute             If the given coordinates are not relative, like move map 1 pixel, but instead absolute, like
       * move map to coordinates { x: 1, y: 2 }. Defaults to false (relative).
       * @todo  the informcoordinates away and fix the issue they tried to fix!
       **/

    }, {
      key: 'moveMap',
      value: function moveMap(_ref2) {
        var _ref2$x = _ref2.x;
        var x = _ref2$x === undefined ? 0 : _ref2$x;
        var _ref2$y = _ref2.y;
        var y = _ref2$y === undefined ? 0 : _ref2$y;

        var _ref3 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var _ref3$absolute = _ref3.absolute;
        var absolute = _ref3$absolute === undefined ? false : _ref3$absolute;

        var realCoordinates = {
          x: Math.round(x / this.getZoomLayer().getZoom()),
          y: Math.round(y / this.getZoomLayer().getZoom())
        };

        if (absolute) {
          _movableLayer.position = new PIXI.Point(x, y);
        } else {
          _movableLayer.move(realCoordinates);
        }

        mapEvents.publish('mapMoved', realCoordinates);
        this.drawOnNextTick();
      }
      /**
       * Activate all plugins for the map. Iterates through the given plugins we wish to activate and does the actual work in activatePlugin-
       * method.
       *
       * @method pluginsArray
       * @param {Object[]} pluginsArray   Array that consists the plugin modules to be activated
       * @return {Promise}                Promise. If string are provided resolved those with System.import, otherwise resolves immediately.
       * */

    }, {
      key: 'activatePlugins',
      value: function activatePlugins() {
        var _this2 = this;

        var pluginsArray = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        var allPromises = [];

        /* Iterates over given plugins Array and calls their init-method, depeding if it is String or Object */
        pluginsArray.forEach(function (plugin) {
          if ((typeof plugin === 'undefined' ? 'undefined' : _typeof(plugin)) === 'object') {
            _this2.activatePlugin(plugin);
          } else {
            log.error('problem with initializing a plugin: ' + plugin.name);
          }
        });

        return allPromises;
      }
      /**
       * Activate plugin for the map. Plugins need .pluginName property and .init-method. Plugins init-method activates the plugins and we
       * call them in Map. Plugins init-metho receivse this (Map instance) as their only parameter.
       *
       * @method activatePlugin
       * @throws {Error} Throws a general error if there is an issue activating the plugin
       * @param {Object} plugin        Plugin module
       * */

    }, {
      key: 'activatePlugin',
      value: function activatePlugin(plugin) {
        try {
          if (!plugin || !plugin.pluginName || !plugin.init) {
            throw new Error('plugin, plugin.pluginName or plugin.init import is missing!');
          }

          this.plugins.add(plugin[plugin.pluginName]);
          if (this.plugins.has(plugin[plugin.pluginName])) {
            plugin.init(this);
          }
        } catch (e) {
          log.error('An error initializing plugin. JSON.stringify: "' + JSON.stringify(plugin) + '" ', e);
        }
      }
    }, {
      key: 'registerPreRenderer',
      value: function registerPreRenderer(name, callback) {
        if (!name && !callback) {
          throw new Error('name and callback required for registerPreRenderer');
        }

        this.preRenderers[name] = {
          cb: callback
        };
      }
    }, {
      key: 'removePreRenderer',
      value: function removePreRenderer(name) {
        delete this.preRenderers[name];
      }
      /**
       * Setting new prototype methods for the Map instance
       *
       * @method setPrototype
       * @param {String} property         The property you want to set
       * @param {*} value                 Value for the property
       */

    }, {
      key: 'setPrototype',
      value: function setPrototype(property, value) {
        var thisPrototype = Object.getPrototypeOf(this);

        thisPrototype[property] = value;
      }
      /**
       * Gets object under specific map coordinates. Using subcontainers if they exist, other
       * methods if not. If you provide type parameter, the method returns only object types that
       * match it.
       *
       * NOTE! At the moment filters only support layers! You can not give filters object: object and
       * expect them to be filtered. It will filter only layers (object: layer)!
       *
       * @todo This should work with object filtering too, but the issues regarding it are
       * efficiency (if there are many filter rules, we don't want to go through them twice?). Since
       * the way filters work now, we would have to filter layers first and then again objects.
       *
       * @method getObjectsUnderArea
       * @param  {Object} globalCoords            Event coordinates on the zoomLayer / canvas.
       * @param  {Integer} globalCoords.x         X coordinate
       * @param  {Integer} globalCoords.y         Y coordinate
       * @param  {Object} options                 Optional options
       * @param  {Object} options.filter          The filter to apply to subcontainers
       * @return {Array}                          Array of object found on the map.
       */

    }, {
      key: 'getObjectsUnderArea',
      value: function getObjectsUnderArea() {
        var globalCoords = arguments.length <= 0 || arguments[0] === undefined ? { x: 0, y: 0, width: 0, height: 0 } : arguments[0];

        var _ref4 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var _ref4$filters = _ref4.filters;
        var filters = _ref4$filters === undefined ? null : _ref4$filters;

        /* We need both coordinates later on and it's logical to do the work here */
        var allCoords = {
          globalCoords: globalCoords,
          localCoords: this.getMovableLayer().toLocal(new PIXI.Point(globalCoords.x, globalCoords.y))
        };
        var objects = [];

        allCoords.localCoords.width = globalCoords.width / this.getZoom();
        allCoords.localCoords.height = globalCoords.height / this.getZoom();

        if (this.usesSubcontainers()) {
          var allMatchingSubcontainers = this._getSubcontainersUnderArea(allCoords, { filters: filters });

          objects = this._retrieveObjects(allCoords, allMatchingSubcontainers);
        } else {
          var filteredContainers = this.getMovableLayer().children.filter(function (thisChild) {
            if (filters && !filters.filter(thisChild).length || thisChild.specialLayer) {
              return false;
            }

            return true;
          });

          objects = this._retrieveObjects(allCoords, filteredContainers);
        }

        if (filters && filters.doesItFilter("object")) {
          objects = filters.filter(objects);
        }

        return objects;
      }
      /**
       * This returns the normal parent layers that we mostly use for manipulation everything. MovableLayer and zoomLayer are built-in
       * layers designed to provide the basic functionalities like zooming and moving the map. These layers provide everything that extends
       * the map more.
       *
       * @method getPrimaryLayers
       * @param {MapDataManipulator} [{}.filters]         The mapDataManipulator instance, that you use for filtering.
       * @return {Object} Basically anything in the map that is used as a layer (not really counting subcontainers).
       */

    }, {
      key: 'getPrimaryLayers',
      value: function getPrimaryLayers() {
        var _ref5 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var filters = _ref5.filters;

        return this.getMovableLayer().getPrimaryLayers({ filters: filters });
      }
      /**
       * Get all objects on the map, from layers and subcontainers.
       *
       * @todo Not very intelligent atm. You need to make a recursive and smart retrieving of objects, so no matter how many layers or
       * layers there are, you always retrieve the end objects and the end of the path.
       *
       * @method getAllObjects
       * @param {MapDataManipulator} [{}.filters]         The mapDataManipulator instance, that you use for filtering.
       * @return {Array}                                  Array of found objects
       * */

    }, {
      key: 'getAllObjects',
      value: function getAllObjects() {
        var _ref6 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var filters = _ref6.filters;

        var allObjects = void 0;
        var theseObjs = void 0;

        allObjects = this.getPrimaryLayers({ filters: filters }).map(function (layer) {
          var allObjs = void 0;

          if (layer.hasSubcontainers()) {
            var subcontainers = layer.getSubcontainers();

            allObjs = subcontainers.map(function (subContainer) {
              theseObjs = subContainer.children.map(function (obj) {
                if (filters) {
                  return filters.filter(obj);
                }

                return obj;
              });

              return generalUtils.arrays.flatten2Levels(theseObjs);
            });
          } else {
            allObjs = layer.children.map(function (obj) {
              if (filters) {
                return filters.filter(obj);
              }

              return obj;
            });
          }

          return generalUtils.arrays.flatten2Levels(allObjs);
        });

        allObjects = generalUtils.arrays.flatten2Levels(allObjects);

        return allObjects;
      }
    }, {
      key: 'getMapCoordinates',
      value: function getMapCoordinates() {
        return {
          x: this.getMovableLayer().x,
          y: this.getMovableLayer().y
        };
      }
      /**
       * This returns the layer that is responsible for map zoom.  It handles zooming and normally
       * other non-movable operations.
       *
       * @method getZoomLayer
       * @return {MapLayer|PIXI.Container|PIXI.ParticleContainer}
       */

    }, {
      key: 'getZoomLayer',
      value: function getZoomLayer() {
        return _zoomLayer;
      }
      /**
       * Set map zoom. 1 = no zoom. <1 zoom out, >1 zoom in.
       *
       * @method setZoom
       * @param {Number} scale    The amount of zoom you want to set
       * @return {Number}         The amount of zoom applied
       */

    }, {
      key: 'setZoom',
      value: function setZoom(newScale) {
        this.getZoomLayer().setZoom(newScale);

        mapEvents.publish({ name: 'mapZoomed', cooldown: true }, { previousScale: this.getZoom(), newScale: newScale });

        return newScale;
      }
      /**
       * Get map zoom. 1 = no zoom. <1 zoom out, >1 zoom in.
       *
       * @method getZoom
       * @return {MapLayer|PIXI.Container|PIXI.ParticleContainer}
       */

    }, {
      key: 'getZoom',
      value: function getZoom() {
        return this.getZoomLayer().getZoom();
      }
      /**
       * Returns the PIXI renderer. Don't use this unless you must. For more advanced or PIXI specific cases.
       *
       * @method getRenderer
       * @return {PIXI.Renderer}
       */

    }, {
      key: 'getRenderer',
      value: function getRenderer(type) {
        return type === 'minimap' ? _renderers.minimap : _renderers.main;
      }
      /**
       * Returns movable layer. This layer is the one that moves when the player moves the map. So this is used for things that are relative
       * to the current map position the player is seeing. This can be used e.g. when you want to display some objects on the map or UI
       * elements, like effects that happen on certain point on the map.
       *
       * @method getMovableLayer
       * @return {MapLayer|PIXI.Container|PIXI.ParticleContainer}
       */

    }, {
      key: 'getMovableLayer',
      value: function getMovableLayer() {
        return _movableLayer;
      }
      /**
       * Return minimap layer. Holds minimap, if used in the game.
       *
       * @method getMinimapLayer
       */

    }, {
      key: 'getMinimapLayer',
      value: function getMinimapLayer() {
        return _minimapLayer;
      }
      /**
       * Removes the minimapLayer from the game.
       */

    }, {
      key: 'removeMinimapLayer',
      value: function removeMinimapLayer() {
        _minimapLayer = undefined;
      }
      /*---------------------------------------------
       ------- ABSTRACT APIS THROUGH PLUGINS --------
       --------------------------------------------*/
      /**
       * This is abstract method and needs to be implemented with a plugin. Core module has an implementation for this and if you don't
       * implement your own, I suggest you use it.
       *
       * @method zoomIn
       */

    }, {
      key: 'zoomIn',
      value: function zoomIn() {
        return 'notImplementedYet. Activate with plugin';
      }
      /**
       * This is abstract method and needs to be implemented with a plugin. Core module has an implementation for this and if you don't
       * implement your own, I suggest you use it.
       *
       * @method zoomOut
       */

    }, {
      key: 'zoomOut',
      value: function zoomOut() {
        return 'notImplementedYet. Activate with plugin';
      }
      /**
       * Resize the canvas to fill the whole browser content area. Defined by the baseEventlisteners-module (core modules plugin)
       *
       * @method toggleFullsize
       **/

    }, {
      key: 'toggleFullsize',
      value: function toggleFullsize() {
        return 'notImplementedYet. Activate with plugin';
      }
      /**
       * Toggles fullscreen mode. Defined by the baseEventlisteners-module (core modules plugin)
       *
       * @method toggleFullScreen
       **/

    }, {
      key: 'toggleFullScreen',
      value: function toggleFullScreen() {
        return 'notImplementedYet. Activate with plugin';
      }
      /**
       * Plugin will overwrite create this method. Method for actually activating minimap.
       *
       * @method initMinimap
       **/

    }, {
      key: 'initMinimap',
      value: function initMinimap() {
        return 'notImplementedYet. Activate with plugin';
      }
      /**
       * Plugin will overwrite create this method. Method for actually activating fog of war.
       *
       * @method activateFogOfWar
       **/

    }, {
      key: 'activateFogOfWar',
      value: function activateFogOfWar() {
        return 'notImplementedYet. Activate with plugin';
      }

      /*---------------------------------
      --------- PRIVATE METHODS ---------
      ---------------------------------*/
      /**
       * Retrieves the objects from ObjectManager, with the given parameters. Mostly helper functionality for getObjectsUnderArea
       *
       * @private
       * @method _retrieveObjects
       * @param {Object} allCoords                        REQUIRED
       * @param {Object} allCoords.globalCoords           REQUIRED
       * @param {Integer} allCoords.globalCoords.x        REQUIRED
       * @param {Integer} allCoords.globalCoords.y        REQUIRED
       * @param {Integer} allCoords.globalCoords.width    REQUIRED
       * @param {Integer} allCoords.globalCoords.height   REQUIRED
       * @param {Object} allCoords.localCoords            REQUIRED
       * @param {Integer} allCoords.localCoords.x         REQUIRED
       * @param {Integer} allCoords.localCoords.y         REQUIRED
       * @param {String} [{}.type]                        The type of objects we want
       * @param {Array} [{}.subcontainers]                Array of the subcontainers we will search
       * @return {Array}                                  Found objects
       */

    }, {
      key: '_retrieveObjects',
      value: function _retrieveObjects(allCoords) {
        var containers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

        var _ref7 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        var _ref7$type = _ref7.type;
        var type = _ref7$type === undefined ? '' : _ref7$type;

        return this.objectManager.retrieve(allCoords, containers, {
          type: type,
          size: {
            width: allCoords.globalCoords.width,
            height: allCoords.globalCoords.height
          }
        });
      }
      /**
       * This returns layers by filtering them based on certain attribute. Can be used with more higher order filtering
       *
       * @private
       * @method _getLayersWithAttributes
       * @param {String} attribute
       * @param {*} value
       * @return the current map instance
       **/

    }, {
      key: '_getLayersWithAttributes',
      value: function _getLayersWithAttributes(attribute, value) {
        return this.getMovableLayer().children[0].children.filter(function (layer) {
          return layer[attribute] === value;
        });
      }
      /**
       * Get subcontainers under certain point or rectangle
       *
       * @private
       * @method _getSubcontainersUnderPoint
       * @param  {[type]} globalCoords
       * @param {Object} options              Optional options.
       * @return {Array}                        All subcontainers that matched the critea
       */

    }, {
      key: '_getSubcontainersUnderArea',
      value: function _getSubcontainersUnderArea(allCoords) {
        var _ref8 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var filters = _ref8.filters;

        var primaryLayers = this.getPrimaryLayers({ filters: filters });
        var allMatchingSubcontainers = [];
        var thisLayersSubcontainers = void 0;

        primaryLayers.forEach(function (layer) {
          thisLayersSubcontainers = layer.getSubcontainersByCoordinates(allCoords.localCoords);
          allMatchingSubcontainers = allMatchingSubcontainers.concat(thisLayersSubcontainers);
        });

        return allMatchingSubcontainers;
      }
      /**
       * This handles the default drawing of the map, so that map always updates when drawOnNextTick === true. This tick
       * callback is always set and should not be removed or overruled
       *
       * @private
       * @method _defaultTick
       */

    }, {
      key: '_defaultTick',
      value: function _defaultTick() {
        var _this3 = this;

        var ONE_SECOND = 1000;
        var FPSCount = 0;
        var fpsTimer = new Date().getTime();
        var renderStart = void 0;
        var totalRenderTime = void 0;

        PIXI.ticker.shared.add(function () {
          if (_drawMapOnNextTick) {
            if (_this3.trackFPSCB) {
              renderStart = new Date().getTime();
            }

            Object.keys(_this3.preRenderers).forEach(function (i) {
              return _this3.preRenderers[i].cb();
            });
            _privateRenderers.forEach(function (renderer) {
              return renderer.render(renderer.getResponsibleLayer());
            });

            if (_this3.trackFPSCB) {
              totalRenderTime += Math.round(Math.abs(renderStart - new Date().getTime()));
            }

            _drawMapOnNextTick = false;
          }

          if (_this3.trackFPSCB) {
            FPSCount++;

            if (fpsTimer + ONE_SECOND < new Date().getTime()) {
              _this3.trackFPSCB({
                FPS: FPSCount,
                FPStime: fpsTimer,
                renderTime: totalRenderTime,
                drawCount: _renderers.main.drawCount
              });

              FPSCount = 0;
              totalRenderTime = 0;
              fpsTimer = new Date().getTime();
            }
          }
        });
      }
    }, {
      key: '_addObjectToUIlayer',
      value: function _addObjectToUIlayer(layerType, object, name) {
        switch (layerType) {
          case LAYER_TYPE_STATIC:
            this.getZoomLayer().addUIObject(object, name);
            break;
          case LAYER_TYPE_MOVABLE:
            this.getMovableLayer().addUIObject(object, name);
            break;
        }
      }
    }, {
      key: '_createArrayStructure',
      value: function _createArrayStructure() {
        var allObjects = {};

        this.getPrimaryLayers().forEach(function (layer) {
          allObjects[layer.name] = layer.getObjects();
        });

        return allObjects;
      }
    }]);

    return Flatworld;
  }();

  window.flatworld.Flatworld = Flatworld;
})();
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var PIXI = window.flatworld_libraries.PIXI;
  var _window$flatworld = window.flatworld;
  var Flatworld = _window$flatworld.Flatworld;
  var utils = _window$flatworld.utils;
  var log = _window$flatworld.log;

  var hexagonPlugin = window.flatworld.extensions.hexagons;

  /*---------------------
  --------- API ---------
  ---------------------*/
  window.flatworld.factories.hexaFactory = hexaFactory;

  /*---------------------
  ------- PUBLIC --------
  ----------------------*/
  /**
   * This constructs a whole horizontally aligned hexagonal map. Some polyfills are needed and added for IE11 (
   * http://babeljs.io/docs/usage/polyfill/ ). These are found in utils
   *
   * @class factories.hexaFactory
   * @requires PIXI in global space
   * @param {HTMLElement} mapCanvas              Canvas element used for the map
   * @param {Object} datas                       Object with mapDatas to construct the map structure
   * @param {Object} datas.map                   Holds all the stage, layer and object data needed to construct a full map
   * @param {Object} datas.game                  More general game data (like turn number, map size etc.)
   * @param {Object} datas.type                  Type data such as different unit types and their graphics (tank, soldier etc.)
   * @param {UITheme} UITheme                    An instance of the UITheme class that the map uses.
   * @param {Object} {}                          Optional options
   * @param {Object} {}.isHiddenByDefault        When we use mapMovement plugin, it is best to keep all the obejcts hidden at the beginnig.
   * @param {Function} {}.trackFPSCB             Callback to track FPS
   **/
  function hexaFactory(mapCanvas, datas) {
    var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var _ref$trackFPSCB = _ref.trackFPSCB;
    var trackFPSCB = _ref$trackFPSCB === undefined ? false : _ref$trackFPSCB;
    var _ref$isHiddenByDefaul = _ref.isHiddenByDefault;
    var isHiddenByDefault = _ref$isHiddenByDefaul === undefined ? true : _ref$isHiddenByDefaul;
    var minimapCanvas = _ref.minimapCanvas;
    var _ref$scaleMode = _ref.scaleMode;
    var scaleMode = _ref$scaleMode === undefined ? PIXI.SCALE_MODES.DEFAULT : _ref$scaleMode;

    log.debug('============== Hexagonal Map factory started =============');
    var pixelRatio = utils.environmentDetection.getPixelRatio();
    var DATA_MAP = typeof datas.map === 'string' ? JSON.parse(datas.map) : datas.map;
    var DATA_TYPE = typeof datas.type === 'string' ? JSON.parse(datas.type) : datas.type;
    var DATA_GAME = typeof datas.game === 'string' ? JSON.parse(datas.game) : datas.game;
    var DATA_GRAPHIC = typeof datas.graphic === 'string' ? JSON.parse(datas.graphic) : datas.graphic;
    var WINDOW_SIZE = utils.resize.getWindowSize();
    /*---------------------
    ------ VARIABLES ------
    ----------------------*/
    var functionsInObj = {
      ObjectTerrain: hexagonPlugin.objects.ObjectHexaTerrain,
      ObjectUnit: hexagonPlugin.objects.ObjectHexaUnit
    };
    var mapProperties = {
      mapSize: DATA_GAME.mapSize,
      bounds: {
        x: 0,
        y: 0,
        width: WINDOW_SIZE.x,
        height: WINDOW_SIZE.y
      },
      rendererOptions: {
        resolution: pixelRatio, // We might need this later on, when doing mobile optimizations, for different pizel density devices
        autoResize: true,
        transparent: true,
        antialias: false },
      // TEST. Only should work in chrome atm.?
      subcontainers: {
        width: 500,
        height: 500,
        maxDetectionOffset: 100,
        isHiddenByDefault: isHiddenByDefault
      },
      trackFPSCB: trackFPSCB,
      defaultScaleMode: scaleMode,
      minimapCanvas: minimapCanvas
    };
    var map = new Flatworld(mapCanvas, mapProperties);

    PIXI.SCALE_MODES.DEFAULT = 1;

    DATA_MAP.layers.forEach(function (layerData) {
      if ((typeof layerData === 'undefined' ? 'undefined' : _typeof(layerData)) !== 'object') {
        log.error('Problem in hexaFactory, with layerData:' + JSON.stringify(layerData));
        throw new Error('Problem in hexaFactory, with layerData:', layerData);
      }

      var renderer = map.getRenderer();
      var layerOptions = {
        name: layerData.name,
        coord: layerData.coord,
        drawOutsideViewport: {
          x: renderer.width,
          y: renderer.height
        },
        selectable: layerData.name === 'unitLayer' ? true : false
      };
      var thisLayer;

      try {
        thisLayer = map.addLayer(layerOptions);

        layerData.objectGroups.forEach(function (objectGroup) {
          var spritesheetType = objectGroup.typeImageData;

          if (!spritesheetType) {
            log.error('Error with spritesheetType-data');
            return;
          }

          objectGroup.objects.forEach(function (object) {
            var objTypeData, objectOptions, texture, newObject;

            try {
              objTypeData = DATA_TYPE[spritesheetType][object.objType];
              if (!objTypeData) {
                log.error('Bad mapData for type:', spritesheetType, object.objType, object.name);
                throw new Error('Bad mapData for type:', spritesheetType, object.objType, object.name);
              }

              texture = PIXI.Texture.fromFrame(objTypeData.image);
              objectOptions = {
                data: {
                  typeData: objTypeData,
                  activeData: object.data
                },
                radius: DATA_GAME.hexagonRadius,
                minimapColor: objTypeData.minimapColor,
                minimapSize: objTypeData.minimapSize
              };

              newObject = new functionsInObj[objectGroup.type](texture, object.coord, objectOptions);
              /** @todo This is here to test using higher resolution sprites, that would handle zooming more gracefully. This should not really be here, but rather as some kind of option or in the object classes that are extended */
              if (DATA_GRAPHIC[objectGroup.typeImageData].initialScale) {
                newObject.scale.x = DATA_GRAPHIC[objectGroup.typeImageData].initialScale;
                newObject.scale.y = DATA_GRAPHIC[objectGroup.typeImageData].initialScale;
              }

              thisLayer.addChild(newObject);
            } catch (e) {
              log.error(e);
            }
          });
        });
      } catch (e) {
        log.error('Problem:' + JSON.stringify(layerData.type) + ' ---- ' + JSON.stringify(e.stack));
      }
    });

    map.moveMap(DATA_GAME.startPoint);

    return map;
  }
})();