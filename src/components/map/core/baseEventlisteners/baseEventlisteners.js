(function () {
  'use strict';

  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var eventListeners = window.flatworld.eventListeners;
  var mapStates = window.flatworld.mapStates;
  var mapEvents = window.flatworld.mapEvents;
  var utils = window.flatworld.utils;
  var Hammer = window.flatworld_libraries.Hammer;
  var Hamster = window.flatworld_libraries.Hamster;

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
   * @param {HTMLElement} canvasElement     The canvas element we listen events from. Will try to search the first canvas in the DOM,
   * if none is provided
   */
  function baseEventlistenersModule() {
    var hammer, hamster, mapInstance;

    /*---------------------------
    ----------- API -------------
    ---------------------------*/
    return {
      init,
      toggleFullSize,
      toggleFullscreen,
      toggleZoom,
      toggleDrag,
      toggleSelect,
      toggleOrder,
      toggleMouseTextSelection,

      /**
       * Plugins name
       *
       * @attribute pluginName
       * @type {String}
       */
      pluginName: "baseEventlisteners"
    };

    /**
     * Initialize plugin
     *
     * @method init
     */
    function init(map) {
      const orderToggle = toggleOrder();
      const selectToggle = toggleSelect();

      mapInstance = map;
      hammer = new Hammer.Manager(map.canvas);
      hamster = new Hamster(map.canvas);

      eventListeners.setDetector("fullSize", toggleFullSize().on, toggleFullSize().off);
      eventListeners.setDetector("fullscreen", toggleFullscreen().on, toggleFullscreen().off);
      eventListeners.setDetector("zoom", toggleZoom().on, toggleZoom().off);
      eventListeners.setDetector("drag", toggleDrag().on, toggleDrag().off);
      eventListeners.setDetector("select", selectToggle.on, selectToggle.off);
      eventListeners.setDetector("order", orderToggle.on, orderToggle.off);

      eventListeners.on("fullSize", _resizeCanvas);
      map.setPrototype("setFullScreen", () => {
        eventListeners.on("fullscreen", _setFullScreen);
      });
    }

    /**
     * Sets the canvas to fullsize as in the same size of the window / content area. But not fullscreen. Note that
     *
     * @method toggleFullSize
     */
    function toggleFullSize() {
      var activeCB;

      return {
        on: (cb) => {
          activeCB = cb;

          window.addEventListener("resize", activeCB);
        },
        off: () => {
          window.removeEventListener("resize", activeCB);
        }
      };
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

      return {
        on: (cb) => {
          activeCB = cb;

          window.addEventListener("fullscreen", activeCB);
        },
        off: () => {
          window.removeEventListener("fullscreen", activeCB);
        }
      };
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

      return {
        on: (cb) => {
          var pinch = new Hammer.Pinch();
          activeCB = cb;

          hammer.add(pinch);
          hammer.on("pinch", activeCB);
          /* Hamster handles wheel events really nicely */
          hamster.wheel(activeCB);
        },
        off: () => {
          hammer.on("pinch", activeCB);
          hamster.unwheel(activeCB);
        }
      };
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

      return {
        on: (cb) => {
          var pan = new Hammer.Pan({
            pointers: 1,
            threshold: 5,
            direction:  Hammer.DIRECTION_ALL });
          activeCB = cb;

          hammer.add(pan);
          hammer.on("pan", activeCB);
        },
        off: () => {
          hammer.off("pan", activeCB);
        }
      };
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

      return {
        on: (cb) => {
          var tap = new Hammer.Tap();
          activeCB = cb;

          hammer.add(tap);
          hammer.on("tap", activeCB);
        },
        off: () => {
          hammer.off("tap", activeCB);
        }
      };
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

      return {
        on: (cb) => {
          activeCB = cb;

          var press = new Hammer.Press();

          hammer.add(press);
          hammer.on("press", clickListener);
          mapInstance.canvas.addEventListener("contextmenu", clickListener, true);
        },
        off: () => {
          hammer.off("press", clickListener);
          mapInstance.canvas.removeEventListener("contextmenu", clickListener, true);
        }
      };

      function clickListener(e) {
        /* Prevent right clicks default menu */
        e.preventDefault();

        /* Check that finite state is correct and that if desktop, the user clicked right button */
        if (! mapStates.can("objectOrder") && ( mapInstance.isSupportedTouch || utils.mouse.isRightClick(e))) {
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
      var bodyStyles = document.getElementsByTagName("body")[0].style;

      bodyStyles.webkitTouchCallout = "none";
      bodyStyles.webkitUserSelect = "none";
      bodyStyles.khtmlUserSelect = "none";
      bodyStyles.mozUserSelect = "none";
      bodyStyles.msUserSelect = "none";
      bodyStyles.userSelect = "none";
    }

    /**
     * Activate the browsers fullScreen mode and expand the canvas to fullsize
     *
     * @private
     * @method _setFullScreen
     */
    function _setFullScreen() {
      utils.resize.toggleFullScreen();
      mapEvents.publish("mapResized");
      _resizeCanvas();
    }
    /**
     * Resizes the canvas to the current most wide and high element status. Basically canvas size === window size.
     *
     * @private
     * @method _resizeCanvas
     */
    function _resizeCanvas() {
      var windowSize = utils.resize.getWindowSize();
      var _renderer = mapInstance.getRenderer();

      _renderer.autoResize = true;
      _renderer.resize(windowSize.x, windowSize.y);
      mapEvents.publish("mapResized");
      mapInstance.drawOnNextTick();
    }
  }
})();