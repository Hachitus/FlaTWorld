(function () {
  'use strict';

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.mapEvents = setupMapEvents();

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * This module handles map events. Like informing map movement, object selection and other changes. Not that ALL the eventlisteners and
   * their callbacks will throw one event! But that event will have no extra parameters, so when you do special things, like selecting
   * objects on the map, you should throw another event when that happens and you can pass on the objects that were selected from the map.
   * Events atm:
   * - mapfullscreen - NO ARGUMENTS
   * - mapfullSize - NO ARGUMENTS
   * - mapdrag - NO ARGUMENTS
   * - mapzoomed - NO ARGUMENTS
   * - Mapselect - NO ARGUMENTS
   * - mapMoved
   * - mapResize
   * - mapFullscreeActivated
   *
   * @namespace flatworld
   * @class mapEvents
   * @return {Object}     subsribe and publish
   * @todo I want the pubsub module to go the ES6 way, not the only global exception!
   */
  function setupMapEvents () {
    const TIMER_FOR_SAME_TYPE = 50;
    var lastTimePublished = {};

    /*---------------------
    --------- API ---------
    ----------------------*/
    return {
      subscribe,
      publish
    };

    /*---------------------
    -------- PUBLIC -------
    ----------------------*/
    function subscribe(type, cb) {
      document.addEventListener(type, cb);
      lastTimePublished[type] = 0;
    }
    function publish(type, ...data) {
      var timestamp;

      timestamp = new Date().getTime();

      if ( (lastTimePublished[type] + TIMER_FOR_SAME_TYPE ) < timestamp) {
        let eventToDispatch;

        eventToDispatch = createCrossIeEvent(type);
        eventToDispatch.customData = data;

        document.dispatchEvent(eventToDispatch);
        lastTimePublished[type] = timestamp;
      }
    }
  }

  /*---------------------
  ------- PRIVATE -------
  ----------------------*/
  /**
   * Basically custom events polyfill for IE11.
   *
   * @private
   * @method createCrossIeEvent
   * @param {String}            type
   * @return {Event}            Created event object
   */
  function createCrossIeEvent(type) {
    var event;

    try {
      event = new Event(type);
    } catch (e) {
      event = document.createEvent('Event');
      event.initEvent(type, true, true);
    }

    return event;
  }
})();