import * as Hammer from 'hammerjs';
import { default as Hamster } from 'hamsterjs';
import { utils, mapStates, eventListeners, log as mapLog, mapEvents } from '../../core/';
import { eventMouseCoords } from '../../core/utils/mouse';

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
 * @event mapFullSize,mapFullscreen       The event listeners publish their events accordingly (more info in mapEvent module)
 * @param {HTMLElement} canvasElement     The canvas element we listen events from. Will try to search the first canvas in the DOM,
 * if none is provided
 */
const baseEventlisteners = (function () {
  const caches = {};
  const allPressCbs = new Map();
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

    hammer = new Hammer.Manager(this.mapInstance.canvas);
    hamster = new Hamster(this.mapInstance.canvas);

    const orderToggle = toggleOrder();
    const selectToggle = toggleSelect();

    eventListeners.setDetector('fullSize', toggleFullSize().on, toggleFullSize().off, ['mapFullSize', 'mapResized']);
    eventListeners.on('fullSize', mapInstance.resizeCanvasToFullSize.bind(mapInstance));

    eventListeners.setDetector('fullscreen', toggleFullscreen().on, toggleFullscreen().off, ['mapFullscreen', 'mapResized']);
    eventListeners.on('fullscreen', mapInstance.toggleFullScreen.bind(mapInstance));

    eventListeners.setDetector('zoom', toggleZoom().on, toggleZoom().off, ['mapZoomed']);
    eventListeners.setDetector('drag', toggleDrag().on, toggleDrag().off, ['mapMoved']);
    eventListeners.setDetector('select', selectToggle.on, selectToggle.off, ['objectSelectd']);
    eventListeners.setDetector('order', orderToggle.on, orderToggle.off, ['orderIssued']);

    return Promise.resolve();
  }

  /**
   * When the canvas is set to fullsize the same size of the window / content area. Retaining the window mode
   * (not fullscreen).
   *
   * @method toggleFullSize
   */
  function toggleFullSize() {
    const allCBs = new Set();

    if (!caches['fullsize']) {
      window.addEventListener('resize', () => {
        allCBs.forEach(cb => cb());
        mapEvents.publish('mapResized');
        mapEvents.publish('mapFullSize');
      });

      caches['fullsize'] = {
        on: (cb) => {
          allCBs.add(cb);
        },
        off: (cb) => {
          allCBs.delete(cb);
        },
        offAll: () => {
          allCBs.clear();
        }
      };

      return caches['fullsize'];
    }

    return caches['fullsize'];
  }
  /**
   * Happens when the browser is set to fullscreen
   *
   * @method toggleFullscreen
   * @return {Boolean}        { on: Function(Function), off: Function(Function), offAll: Function() }
   */
  function toggleFullscreen() {
    const allCBs = new Set();

    if (!caches['fullscreen']) {
      window.addEventListener('fullscreen', () => {
        allCBs.forEach(cb => cb())
        mapEvents.publish('mapResized');
        mapEvents.publish('mapFullscreen');
      });

      caches['fullscreen'] = {
        on: (cb) => {
          allCBs.add(cb);
        },
        off: (cb) => {
          allCBs.delete(cb);
        },
        offAll: () => {
          allCBs.clear();
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
    if (!caches['zoom']) {
      const pinch = new Hammer.Pinch({
        threshold: 0.08
      });
      hammer.add(pinch);

      caches['zoom'] = {
        on: (cb) => {
          hammer.on('pinch', cb);
          /* Hamster handles wheel events really nicely */
          hamster.wheel(cb);
        },
        off: (cb) => {
          hammer.off('pinch', cb);
          hamster.unwheel(cb);
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
    if (!caches['drag']) {
      const pan = new Hammer.Pan({
        pointers: 1,
        threshold: 5,
        direction: Hammer.DIRECTION_ALL });
      hammer.add(pan);

      caches['drag'] = {
        on: (cb) => {
          hammer.on('pan', cb);
        },
        off: (cb) => {
          hammer.off('pan', cb);
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
    if (!caches['select']) {
      const tap = new Hammer.Tap();
      hammer.add(tap);

      caches['select'] = {
        on: (cb) => {
          hammer.on('tap', cb);
        },
        off: (cb) => {
          hammer.off('tap', cb);
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
    if (!caches['order']) {
      const press = new Hammer.Press();
      hammer.add(press);

      caches['order'] = {
        on: (cb) => {
          const wrappedCB = (e) => pressListener(e, cb);

          hammer.on('press', wrappedCB);
          /* We are detecting mouse right click here */
          const eventOff = mapInstance.canvas.addEventListener('mouseup', wrappedCB, true);

          allPressCbs.set(cb, [wrappedCB, eventOff]);
        },
        off: (cb) => {
          hammer.off('press', allPressCbs.get(cb)[0]);
          mapInstance.canvas.addEventListener('mouseup', allPressCbs.get(cb)[1]);
          allPressCbs.delete(cb);
        }
      };
    }

    return caches['order'];

    function pressListener(e, cb) {
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

      // We make the normal mouse click to follow Hammer event standard (.center). This could work some other
      // more standard and logical way? (since now we are tied to Hammer)
      if (utils.mouse.isRightClick(e)) {
        e.center = eventMouseCoords(e);
      }

      cb(e);
    }
  }
})();

/*-----------------------
---------- API ----------
-----------------------*/
export default baseEventlisteners;
