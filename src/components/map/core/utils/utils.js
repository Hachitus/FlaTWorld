(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  const { PIXI } = window.flatworld_libraries;

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
      isRightClick,
      disableContextMenu,
      eventData: {
        getPointerCoords,
        getHAMMERPointerCoords,
        getGlobalCoordinates
      },
      coordinatesFromGlobalToRelative,
      eventMouseCoords
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
      canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }
    /**
     * @method getPointerCoords
     * @param  {Event} e    Event object
     * @return {Object}
     */
    function getPointerCoords(e) {
      return new PIXI.Point(e.offsetX, e.offsetY);
    }
    /**
     * @method getHAMMERPointerCoords
     * @param  {Event} e    Event object
     * @return {Object}
     */
    function getHAMMERPointerCoords(e) {
      return new PIXI.Point(e.center.x, e.center.y);
    }


    function getGlobalCoordinates(e, isSupportedTouch) {
      return isSupportedTouch ? getHAMMERPointerCoords(e) : getPointerCoords(e);
    }
    /**
     * Transform coordinates that are in the window to become relative with the given element
     *
     * @param  {[type]} coordinates [description]
     * @param  {[type]} element     [description]
     * @return {[type]}             [description]
     */
    function coordinatesFromGlobalToRelative(coordinates, element) {
      const elementPosition = getElementPositionInWindow(element);

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
      let xPos = 0;
      let yPos = 0;

      while (el) {
        if (el.tagName.toLowerCase() === 'body') {
          // deal with browser quirks with body/window/document and page scroll
          const xScroll = el.scrollLeft || document.documentElement.scrollLeft;
          const yScroll = el.scrollTop || document.documentElement.scrollTop;

          xPos += (el.offsetLeft - xScroll + el.clientLeft);
          yPos += (el.offsetTop - yScroll + el.clientTop);
        } else {
          // for all other non-BODY elements
          xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
          yPos += (el.offsetTop - el.scrollTop + el.clientTop);
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
      const pos = {
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
      toggleFullScreen,
      setToFullSize,
      getWindowSize,
      resizePIXIRenderer
    };

    /**
     * @method toggleFullScreen
     */
    function toggleFullScreen() {
      const elem = document.body; // Make the body go full screen.
      const isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||
         (
         document.mozFullScreen || document.webkitIsFullScreen);

      isInFullScreen ? cancelFullScreen(document) : requestFullScreen(elem);

      return false;

      /*-------------------------
      --------- PRIVATE ---------
      -------------------------*/
      /* global ActiveXObject */
      function cancelFullScreen(el) {
        const requestMethod = el.cancelFullScreen ||
           el.webkitCancelFullScreen ||
           el.mozCancelFullScreen ||
           el.exitFullscreen;
        if (requestMethod) { // cancel full screen.
          requestMethod.call(el);
        } else if (typeof window.ActiveXObject !== 'undefined') { // Older IE.
          const wscript = new ActiveXObject('WScript.Shell');
          wscript !== null && wscript.SendKeys('{F11}');
        }
      }
      function requestFullScreen(el) {
        // Supports most browsers and their versions.
        const requestMethod = el.requestFullScreen ||
           el.webkitRequestFullScreen ||
           el.mozRequestFullScreen ||
           el.msRequestFullScreen;

        if (requestMethod) { // Native full screen.
          requestMethod.call(el);
        } else if (typeof window.ActiveXObject !== 'undefined') { // Older IE.
          const wscript = new ActiveXObject('WScript.Shell');
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
        const size = getWindowSize();

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
      const windowSize = getWindowSize();

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
      getPixelRatio // ,
      // isMobile,
      // isMobile_detectUserAgent
    };

    /**
     * @method getPixelRatio
     * @requires Canvas element in the DOM. This needs to be found
     * @param  {HTMLElement} canvasElement       HTML canvas element
     * @return {Number}
     */
    function getPixelRatio(canvasElement) {
      const DPR = window.devicePixelRatio || 1;
      const ctx = (canvasElement && canvasElement.getContext('2d')) || document.createElement('canvas').getContext('2d');
      const bsr = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;

      return DPR / bsr;
    }
  }
  /**
   * @class utils.general
   * @return {Object}      pixelEpsilonEquality
   */
  function setupGeneral() {
    const PIXEL_EPSILON = 0.01;

    return {
      pixelEpsilonEquality: epsilonEquality,
      fullsizeCanvasCSS,
      requireParameter,
      toggleMouseTextSelection,
      isWebglSupported
    };

    /**
     * @method epsilonEquality
     * @param  {Number} x
     * @param  {Number} y
     */
    function epsilonEquality(x, y) {
      return (Math.abs(x) - Math.abs(y)) < PIXEL_EPSILON;
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
      throw new Error(`Function '${className}' requires parameter ${paramName}`);
    }

    /**
     * Deactivate the selection of text, by dragging
     *
     * @method toggleMouseTextSelection
     */
    function toggleMouseTextSelection(element = document.getElementsByTagName('body')[0]) {
      element.style.webkitTouchCallout = 'none';
      element.style.webkitUserSelect = 'none';
      element.style.khtmlUserSelect = 'none';
      element.style.mozUserSelect = 'none';
      element.style.msUserSelect = 'none';
      element.style.userSelect = 'none';
    }
    /**
     * Detects wether webGL is supported or not
     *
     * @author alteredq / http://alteredqualia.com/
     * @author author mr.doob / http://mrdoob.com/
     * From three.js: https://github.com/mrdoob/three.js/blob/master/examples/js/Detector.js
     */
    function isWebglSupported() {
      try {
        var canvas = document.createElement( 'canvas' );

        return !! ( window.WebGLRenderingContext &&
          ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
      } catch ( e ) {
        return false;
      }
    }
  }
})();
