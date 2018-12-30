import * as Hammer from 'hammerjs';
import { default as Hamster } from 'hamsterjs';
import { mapEvents, utils, mapStates, eventListeners, log as mapLog } from '../../core/';

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
const baseEventlisteners = (function () {
  const caches = {};
  let hammer, hamster, mapInstance;

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
  function init() {
    mapInstance = this.mapInstance;
    const orderToggle = toggleOrder();
    const selectToggle = toggleSelect();

    hammer = new Hammer.Manager(this.mapInstance.canvas);
    hamster = new Hamster(this.mapInstance.canvas);

    eventListeners.setDetector('fullSize', toggleFullSize().on, toggleFullSize().off);
    eventListeners.on('fullSize', resizeCanvas);

    eventListeners.setDetector('fullscreen', toggleFullscreen().on, toggleFullscreen().off);
    this.mapInstance.setPrototype('setFullScreen', _setFullScreen);

    eventListeners.setDetector('zoom', toggleZoom().on, toggleZoom().off);
    eventListeners.setDetector('drag', toggleDrag().on, toggleDrag().off);
    eventListeners.setDetector('select', selectToggle.on, selectToggle.off);
    eventListeners.setDetector('order', orderToggle.on, orderToggle.off);

    return Promise.resolve();
  }

  /**
   * Sets the canvas to fullsize as in the same size of the window / content area. But not fullscreen. Note that
   *
   * @method toggleFullSize
   */
  function toggleFullSize() {
    let activeCB;

    if (!caches['fullsize']) {
      caches['fullsize'] = {
        on: (cb) => {
          activeCB = cb;

          window.addEventListener('resize', activeCB);
        },
        off: () => {
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
    let activeCB;

    if (!caches['fullscreen']) {
      caches['fullscreen'] = {
        on: (cb) => {
          activeCB = cb;

          window.addEventListener('fullscreen', activeCB);
        },
        off: () => {
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
    let activeCB;

    if (!caches['zoom']) {
      caches['zoom'] = {
        on: (cb) => {
          const pinch = new Hammer.Pinch({
            threshold: 0.08
          });
          activeCB = cb;

          hammer.add(pinch);
          hammer.on('pinch', activeCB);
          /* Hamster handles wheel events really nicely */
          hamster.wheel(activeCB);
        },
        off: () => {
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
    let activeCB;

    if (!caches['drag']) {
      caches['drag'] = {
        on: (cb) => {
          const pan = new Hammer.Pan({
            pointers: 1,
            threshold: 5,
            direction: Hammer.DIRECTION_ALL });
          activeCB = cb;

          hammer.add(pan);
          hammer.on('pan', activeCB);
        },
        off: () => {
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
    let activeCB;

    if (!caches['select']) {
      caches['select'] = {
        on: (cb) => {
          const tap = new Hammer.Tap();
          activeCB = cb;

          hammer.add(tap);
          hammer.on('tap', activeCB);
        },
        off: () => {
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
    let activeCB;

    if (!caches['order']) {
      caches['order'] = {
        on: (cb) => {
          activeCB = cb;

          const press = new Hammer.Press();

          hammer.add(press);
          hammer.on('press', pressListener);
          /* We are detecting mouse right click here */
          mapInstance.canvas.addEventListener('mouseup', (e) => {
            if (utils.mouse.isRightClick(e)) {
              pressListener(e);
            }
          }, true);
        },
        off: () => {
          hammer.off('press', pressListener);
          mapInstance.canvas.removeEventListener('mouseup', pressListener, true);
        }
      };
    }

    return caches['order'];

    function pressListener(e) {
      /* Check if desktop, the user clicked right button or pressed on mobile */
      if (!utils.mouse.isRightClick(e) && e.type !== 'press') {
        mapLog.debug(`pressListener activated when user didn't right click or press`)
        return;
      }

      /* Check that finite state is correct */
      if (! mapStates.can('objectOrder')) {
        mapLog.debug(`pressListener activated when objectOrder is not possible. Current state: ${mapStates.current}`)
        return false;
      }

      activeCB(e);
    }
  }

  /**
   * Activate the browsers fullScreen mode and expand the canvas to fullsize
   *
   * @private
   * @method _setFullScreen
   */
  function _setFullScreen() {
    utils.resize.toggleFullScreen();
    resizeCanvas();
    mapEvents.publish('mapResized');
  }
  /**
   * Resizes the canvas to the current most wide and high element status.
   * Basically canvas size === window size.
   *
   * @private
   * @method _resizeCanvas
   */
  function resizeCanvas() {
    utils.resize.resizePIXIRenderer(
      mapInstance.getRenderer(),
      mapInstance.drawOnNextTick.bind(mapInstance)
    );
    mapEvents.publish('mapResized');
  }
})();

/*-----------------------
---------- API ----------
-----------------------*/
export default baseEventlisteners;
