(function () {
  'use strict';

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
      on,
      off,
      isOn,
      setActivityState,
      getActivityState,
      setDetector,
      clearDetector
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
    function on(type = "", cb = false) {
      if (!detectors[type] && !detectors[type].size) {
        throw new Error("eventlisteners.on needs to have detector set with this event type!");
      }

      detectors[type].on(_createEventListenerWrapper("Map" + type, cb));
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
    function off(type = "", cb = false) {
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
    function isOn(type = "", cb = false) {
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
    function getActivityState(type = "") {
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
    function setDetector(type = "", cbOn = () => {}, cbOff = () => {}) {
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
    function clearDetector(type = "") {
      /* remove all event listeners before we empty the data */
      activeEventListeners[type].forEach(cb => {
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
      return (...args) => {
        /**
         * @event Event gets fired when the specific eventListener trigger. The name consists of "Map" + the given event type, like such:
         * "MapDrag"
         */
        mapEvents.publish(type);
        cb(...args);
      };
    }
  }
})();