(function () {
  'use strict';

  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var StateMachine = window.StateMachine;

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.mapStates = setupMapStates();

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * Finite state machine for the map. Uses this library and pretty much it's API https://github.com/jakesgordon/javascript-state-machine.
   *
   * @namespace flatworld
   * @class mapStates
   * @requires  state-machine library
   */
  function setupMapStates() {
    return StateMachine.create({
      initial: "statusQuo",
      events: [
        /**
         * When multiple objects are represented as an option
         *
         * @method objectSelectDialog
         */
        { name: "objectSelectDialog", from: [ "statusQuo", "objectSelected"], to: "objectSelectDialogOpened" },
        /**
         * When the object is selected
         *
         * @method objectSelect
         */
        { name: "objectSelect", from: [ "statusQuo", "objectSelected", "objectSelectDialogOpened"], to: "objectSelected" },
        /**
         * When situation is normal, nothing selected.
         *
         * @method normalize
         */
        { name: "normalize", from: [ "objectSelected", "objectSelectDialogOpened"], to: "statusQuo" },
        /**
         * When object is issued a move order
         *
         * @method objectOrder
         */
        { name: "objectOrder", from: "objectSelected", to: "animatingObject" },
        /**
         * When object ends it's movement animation
         *
         * @method objectOrderEnd
         */
        { name: "objectOrderEnd", from: "animatingObject", to: "objectSelected" },
        /**
         * The games main UI is opened and the map stays at the background, normally non-responsive
         *
         * @method UIOpen
         */
        { name: "UIOpen", from: ["statusQuo", "objectSelected", "objectSelectDialogOpened"], to: "mainUIOpened" },
        /**
         * Games main UI is closed and map is activated again
         *
         * @method UIClose
         */
        { name: "UIClose", from: "mainUIOpened", to: "statusQuo" }
    ]});
  }
})();