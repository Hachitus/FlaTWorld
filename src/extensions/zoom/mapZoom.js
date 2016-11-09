import { utils, log, eventListeners } from '../../core/index';

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
const mapZoom = (function() {
  /*---------------------
  ------ VARIABLES ------
  ----------------------*/
  const TIMEOUT_AFTER_ZOOM = 40;
  let initialized = false;
  let mobileInitialized = false;
  let difference = {};
  let map;
  /**
   * Maximum and minimum amount, the player can zoom the map
   *
   * @attribute zoomLimit
   * @type {{ farther: Number, closer: Number }}
   */
  const zoomLimit = {
    farther: 0.4,
    closer: 2.5
  };
  /**
   * How much one step of zooming affects
   *
   * @attribute zoomModifier
   * @type {Number}
   */
  let zoomModifier = 0.1;

  /*---------------------
  --------- API ---------
  ---------------------*/
  return {
    init,
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
  function init() {
    map = this.mapInstance;
    this.mapInstance.setPrototype('zoomIn', zoomIn);
    this.mapInstance.setPrototype('zoomOut', zoomOut);
    this.mapInstance.setPrototype('setZoomLimits', setZoomLimits);
    this.mapInstance.setPrototype('setZoomModifier', setZoomModifier);

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
    if (! (amount > 0 || amount <= 0.5)) {
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
    const presentScale = map.getZoom();
    const IS_ZOOM_IN = true;

    return _zoom(this, presentScale, Math.abs(amount) || zoomModifier, IS_ZOOM_IN);
  }
  /**
   * Zoom out of the map
   *
   * @method zoomOut
   * @param {Number} amount how much map is zoomed out
   * */
  function zoomOut(amount) {
    const presentScale = map.getZoom();
    const IS_ZOOM_IN = false;

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
    const mouseWheelDelta = deltaY;
    /* Scale changes when the map is drawn. We make calculations with the old scale before draw */
    const oldScale = map.getZoom();

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
    const pointers = e.pointers;
    const oldScale = map.getZoom();
    const coords = [{
      x: pointers[0].pageX,
      y: pointers[0].pageY
    }, {
      x: pointers[1].pageX,
      y: pointers[1].pageY
    }];
    const changeX = Math.abs(coords[0].x - coords[1].x);
    const changeY = Math.abs(coords[0].y - coords[1].y);

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
      } else if (e.eventType === 4 || e.eventType === 8) { /* e.eventType 4 = event canceled, e.eventType 8 = event finished */
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
          map.moveMap(_calculateCenterMoveCoordinates(oldScale, true));
        }
      } else {
        if (map.zoomOut()) {
          map.moveMap(_calculateCenterMoveCoordinates(oldScale));
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
    if ((isZoomIn && amount > zoomLimit.closer) || (!isZoomIn && amount < zoomLimit.farther)) {
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
    const windowSize = utils.resize.getWindowSize();
    const halfWindowSize = {
      x: (windowSize.x / 2) / scale,
      y: (windowSize.y / 2) / scale
    };
    const realMovement = {
      x: (halfWindowSize.x) * ((isZoomIn ? -zoomModifier : zoomModifier)),
      y: (halfWindowSize.y) * ((isZoomIn ? -zoomModifier : zoomModifier))
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
    let newScale;

    if (!_isOverZoomLimit(presentScale, isZoomIn)) {
      newScale = map.setZoom(amount ? presentScale + amount : presentScale + zoomModifier);
    }

    return newScale;
  }
})();

/*---------------------
--------- API ---------
----------------------*/
export default mapZoom;
