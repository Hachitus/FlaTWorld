import { mapEvents, utils } from '../../core/';

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
const mapMovement = (function(debug = false) {
  const VIEWPORT_OFFSET = 0.2;
  const CHECK_INTERVAL = 20;
  const SUBCONTAINERS_TO_HANDLE_IN_TIMEOUT = 40;
  const queue = {};
  let viewportArea, offsetSize, mapInstance;

  return {
    init,
    pluginName: 'mapMovement',
    addAll,
    check,
    startEventListeners,
    _testObject: {
      isObjectOutsideViewport,
      checkAndSetSubcontainers,
      getViewportWithOffset,
      testRectangleIntersect,
      _setMap,
      setOffsetSize
    }
  };
  /**
   * Ínitialize as a plugin
   *
   * @method init
   * @param  {Map} map     Instance of Map
   */
  function init() {
    mapInstance = this.mapInstance;
    addAll(this.mapInstance);
    startEventListeners();
    this.mapInstance.drawOnNextTick();

    if (debug) {
      /**
       * For debugging. Shows the amount of currectly active and inactive subcontainers. Console.logs the data.
       * Also extends window object.
       *
       * @method window.FlaTWorld_mapMovement_subCheck
       * @static
       */
      window.FlaTWorld_mapMovement_subCheck = function () {
        mapInstance.getPrimaryLayers().forEach(layer => {
          const subcontainers = layer.getSubcontainers();
          const visibleContainers = subcontainers.filter(subcontainer => {
            return subcontainer.visible;
          });
          const invisibleContainers = subcontainers.filter(subcontainer => {
            return !subcontainer.visible;
          });

          const containerCoords = visibleContainers.reduce((all, cont2) => { all + cont2.x + ''; });
          window.flatworld.log.debug(
            'visible subcontainers: ' + visibleContainers.length + ', ' + containerCoords + '\n\ninvisible: ' +
            invisibleContainers.length);
        });
      };
      /**
       * For debugging. Sets all primaryLayers subcontainers on the map as visible = true.
       *
       * @method window.FlaTWorld_mapMovement_deactivate
       * @static
       */
      window.FlaTWorld_mapMovement_deactivate = function () {
        mapInstance.getPrimaryLayers().forEach(layer => {

          layer.getSubcontainers().forEach(subcontainer => {
            subcontainer.visible = false;
          });
        });
      };
    }

    return Promise.resolve();
  }
  /**
   * Ínitialize the plugin
   *
   * @method addAll
   * @param  {Map} map     Instance of Map
   */
  function addAll(mapInstance) {
    viewportArea = setupViewportArea(true, VIEWPORT_OFFSET);
    setOffsetSize(viewportArea);

    mapInstance.getPrimaryLayers().forEach(layer => {
      layer.getSubcontainers().forEach(subcontainer => {
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
      viewportArea = setupViewportArea(true, VIEWPORT_OFFSET);

      checkAndSetSubcontainers(viewportArea, mapInstance.getPrimaryLayers());
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
      setOffsetSize(viewportArea);
      check();
    }
    function zoomCb() {
      setOffsetSize(viewportArea);
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
    const globalArea = object.getSubcontainerArea({ toGlobal: false });

    const isOutside = !testRectangleIntersect(globalArea, viewportArea);

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
  async function checkAndSetSubcontainers(scaledViewport, primaryLayers) {
    const largerViewportAreaWithOffset = getViewportWithOffset(scaledViewport);
    let containersUnderChangedArea = [];

    primaryLayers = utils.general.chunkArray(primaryLayers, VIEWPORT_OFFSET);
    const promises = primaryLayers.map((theseLayers) => {
      const promise = new Promise((resolve, reject) => {
        try {
          window.setTimeout(function () {
            const foundSubcontainers = theseLayers.map((layer) => {
              return layer.getSubcontainersByCoordinates(largerViewportAreaWithOffset);
            });
            containersUnderChangedArea = containersUnderChangedArea.concat(foundSubcontainers);

            resolve(containersUnderChangedArea);
          });
        } catch (e) {
          reject(e);
        }
      });

      return promise;
    });

    await Promise.all(promises).then(() => {
        containersUnderChangedArea = utils.general.flatten2Levels(containersUnderChangedArea);

        const subcontainers = utils.general.chunkArray(containersUnderChangedArea, SUBCONTAINERS_TO_HANDLE_IN_TIMEOUT);

        const promises = subcontainers.map((thesesContainers) => {
          const promise = new Promise((resolve, reject) => {
            try {
              window.setTimeout(function () {
                resolve(thesesContainers.filter((thisContainer) => {
                  return thisContainer.visible = isObjectOutsideViewport(thisContainer, scaledViewport) ? false : true;
                }));
              });
            } catch (e) {
              reject(e);
            }
          });

          return promise;
        });

        return promises;
      }).then(() => {
        queue.processing = false;

        mapInstance.drawOnNextTick();
      }).catch((err) => {
        queue.processing = true;

        window.flatworld.log.debug(err);
      });
  }
  /**
   * Initializes the module variables viewportArea and offsetSize
   *
   * @private
   * @static
   * @method setupViewportArea
   * @return {totalViewportArea}              The total viewportArea
   */
  function setupViewportArea(isLocal = true, multiplier = 2) {
    return mapInstance.getViewportArea(isLocal, multiplier);
  }
  /**
   * Initializes the module variable offsetSize
   *
   * @private
   * @static
   * @method setOffsetSize
   * @return {totalViewportArea}              The total viewportArea
   */
  function setOffsetSize(viewportArea) {
    offsetSize = calculateOffset(viewportArea, { zoom: mapInstance.getZoom() });
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
    if(!offsetSize) {
      throw new Error('getViewportWithOffset requires module variable offsetSize to have been set');
    }

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
    return (a.x <= b.x + b.width &&
            b.x <= a.x + a.width &&
            a.y <= b.y + b.height &&
            b.y <= a.y + a.height);
  }
  /**
   * @private
   * @static
   * @method calculateOffset
   */
  function calculateOffset(viewportArea, options = { zoom: 1 }) {
    return Math.abs(viewportArea.width / options.zoom * VIEWPORT_OFFSET);
  }
  /**
   * @private
   * @static
   * @method _setMap
   */
  function _setMap(givenMap) {
    this.mapInstance = mapInstance = givenMap;
  }
})();

/*-----------------------
---------- API ----------
-----------------------*/
/* For debugging? This will show up if the plugin fails to load in Map.js */
export default mapMovement;
