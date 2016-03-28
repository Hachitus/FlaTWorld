(function () {
  'use strict';

  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var PIXI = window.flatworld_libraries.PIXI;

  /*---------------------
  --------- API ---------
  ----------------------*/
  window.flatworld.utils.effects = setupEffects();

  /*---------------------
  -------- PUBLIC -------
  ----------------------*/
  /**
   * This module will hold the most common graphical effects used in the map. It is still very stub as the development
   * hasn't proceeded to this stage yet.
   *
   * @class utils.effects
   * @return {Object}      init, _startDragListener
   */
  function setupEffects() {
    /*---------------------
    ------- API ----------
    --------------------*/
    return {
      dropShadow
    };

    /*----------------------
    ------- PUBLIC ---------
    ----------------------*/
    /**
     * @method dropShadow
     * @param  {Object} options
     */
    function dropShadow(options = { color: "#000000", distance: 5, alpha: 0.5, amgöe: 45, blur: 5 } ) {
        var shadow  = new PIXI.filters.DropShadowFilter();

        shadow.color  = options.color;
        shadow.distance = options.distance;
        shadow.alpha  = options.alpha;
        shadow.angle  = options.angle;
        shadow.blur   = options.blur;

        this.filters = [shadow];
      }
  }
})();