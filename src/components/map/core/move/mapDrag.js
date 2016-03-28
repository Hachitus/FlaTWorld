(function () {
  'use strict';

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
      init,
      pluginName: "mapDrag",
      _startDragListener /* Function revealed for testing */
    };

    /*---------------------
    -------- PUBLIC -------
    ----------------------*/
    /**
     * Required init functions for the plugin
     *
     * @method init
     * @param {Map} mapObj        The current instance of Map class
     * */
    function init(map) {
      eventListenerCB = _startDragListener(map);

      /* Singleton should have been instantiated before, we only retrieve it with 0 params */
      eventListeners.on("drag", eventListenerCB);
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
    function _startDragListener( map ) {
      var initialized = false;

      return function startDrag(e) {
        var coords;

        if (eventListeners.getActivityState("zoom")) {
          return false;
        }
        coords = utils.mouse.eventData.getHAMMERPointerCoords(e);

        mapMoved = true;

        coords.x = Math.round( coords.x );
        coords.y = Math.round( coords.y );

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
        setOffset,
        getOffset
      };

      function setOffset(coords) {
        return ( offsetCoords = coords );
      }
      function getOffset() {
        return offsetCoords;
      }
    }
  }
})();