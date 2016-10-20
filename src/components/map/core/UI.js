(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  const mapLog = window.flatworld.log;

  /*---------------------
  ------ VARIABLES ------
  ----------------------*/
  const scope = {};

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * Main class for showing UI on the map, like unit selections, movements and such. Has nothing
   * to do with showing off-map data, like
   * datagrams of the resources player has or other players status etc.
   * Good examples for what this shows are: selected units-list, selection highlight (like a
   * circle on the selected unit), unit movement.
   * How it works is that this is basically the interface that shows what the UI theme class can
   * (or must) implement.
   *
   * @namespace flatworld
   * @class UI
   * @static
   * @param {Object} UITheme        Module that will be used for the UI theme
   * @param {Map} givenMap          Map instance that is used
   * @throws {Error}                If either param isn't given or UITheme doesn't implement all
   * the requires methods, this class throws an error.
   * @return {Object}               UI module
  */
  function UI(UITheme, givenMap, protectedProperties) {

    /* SINGLETON MODULE */
    if (Object.keys(scope).length !== 0) {
      return scope;
    }

    if (!UITheme || !givenMap) {
      throw new Error(`UI-module requires UITheme and map object, This is a singleton class, so it's possible it should have been already called earlier`);
    }

    validateUITheme([
        'highlightSelectedObject',
        'showSelections',
        'showUnitMovement'
      ],
      UITheme);

    /**
     * Responsible for showing what objects have been selected for inspection or if the player selects only one object, we hightlihgt it.
     * For example if there are several objects in one tile on the map and the player needs to be able to select one
     * specific unit on the stack. This is always defined in the UI theme-module Selecting one unit, highlight it, which means,
     * e.g. bringing the unit on top on the map and showing selection circle around it.
     *
     * @method showSelections
     * @static
     * @param  {Array|Object} objects           Objects that have been selected.
     * @param {Object} getDatas                 This is an object made of functions, that get wanted data from the object. For example if
     * you have objects name in object.data.specialData.name, then you have an object getDatas.name(), which retrieves this. This should be
     * standardized maybe in MapDataManipulator, so that we can change the template between different game setups easier. Lets say if one
     * game modification has different attributes than another, then maybe it should still have standard interface.
     * @param {Object} getDatas.name            Retrieves object name
     * @param {Object} {}                       Extra options
     * @param {MapDataManipulator} {}.filters   Filters objects
     * @param {Object} {}.options               Extra options that are passed to the UITheme class
     * @return {Boolean}
     *
     * @todo the getDatas function should be standardized, so that most UIs would work with most different setups.
     * */
    scope.showSelections = function (objects, getDatas, { filters, UIThemeOptions } = {}) {
      if (filters) {
        objects = filters.filterObjects(objects);
      }

      let returnable;

      objects = Array.isArray(objects) ? objects : [objects];

      if (objects.length === 1) {
        returnable = UITheme.highlightSelectedObject(objects[0], getDatas, UIThemeOptions);
      } else if (objects.length > 1) {
        returnable = UITheme.showSelections(objects, getDatas, UIThemeOptions);
      } else {
        // Delete the UI objects, as player clicked somewhere that doesn't have any selectable objects
        returnable = UITheme.showSelections([]);
      }

      givenMap.drawOnNextTick();

      return returnable;
    };
    /**
     * Shows arrow or movement or what ever to indicate the selected unit is moving to the given location
     *
     * @method showUnitMovement
     * @static
     * @param {Object} object         Unit that the player wants to move
     * @param {Object | Array} to     Coordinates as an object or array of waypoints / coordinates
     * where the unit is being moved to.
     * @param {Object} options        Extra options. Like dropping a shadow etc.
     * */
    scope.showUnitMovement = function (to, { UIThemeOptions } = {}) {
      if (!Array.isArray(to)) {
        mapLog.error('Array expected for showUnitMovement');
      }

      const returnable = UITheme.showUnitMovement(to, UIThemeOptions);

      givenMap.drawOnNextTick();

      return returnable;
    };

    return scope;
  }

  function validateUITheme(allRequiredMethods, UITheme) {
    allRequiredMethods.forEach(method => {
      if (!UITheme[method]) {
        throw new Error(`UItheme module need to implement methods defined in flatword UI module`);
      }
    })
  }

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.UI = UI;
})();
