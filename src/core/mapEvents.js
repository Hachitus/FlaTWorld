import { EventEmitter } from 'eventemitter3';

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
const mapEvents = (function() {
  const TIMER_FOR_SAME_TYPE = 50;
  const lastTimePublished = {};
  const EE = new EventEmitter();

  /*---------------------
  --------- API ---------
  ----------------------*/
  return {
    subscribe,
    publish,
    debounce,
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
  function publish(type = '', datas) {
    const timestamp = new Date().getTime();
    const realType = type.name || type;

    if ((lastTimePublished[realType] + (type.cooldown || TIMER_FOR_SAME_TYPE) < timestamp)) {
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
    let timeout;

    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    }
  }
})();

/*---------------------
--------- API ---------
----------------------*/
export default mapEvents;
