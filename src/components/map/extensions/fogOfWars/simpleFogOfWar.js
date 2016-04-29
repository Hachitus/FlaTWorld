(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var mapEvents = window.flatworld.mapEvents;
  var MapDataManipulator = window.flatworld.MapDataManipulator;
  var utils = window.flatworld.utils;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.extensions.fogOfWars.simpleFogOfWar = setupSimpleFogOfWar();

  /*-----------------------
  -------- PUBLIC ---------
  -----------------------*/
  /**
   * Simple fog of war works with circles around objects
   *
   * @namespace flatworld.extensions.fogOfWars
   * @class pixelizedMinimap
   **/
  function setupSimpleFogOfWar () {
    var map;

    return {
      init,
      pluginName: 'simpleFogOfWar',
      initFogOfWar
    };
    /**
     * Ínitialize as a plugin. Done by the Flatworld class.
     *
     * After plugin has been initialized by the flatworld, you must still call initFogOfWar to start showing it.
     *
     * @method init
     * @param  {Map} givenMap     Instance of Map
     */
    function init(givenMap) {
      map = givenMap;
      map.initFogOfWar = initFogOfWar;
    }

    function initFogOfWar(shapeCB, lineStyle = [0]) {
      let fogOfWarMask = new PIXI.Graphics();

      fogOfWarMask.lineStyle.apply(fogOfWarMask, lineStyle);
      fogOfWarMask.beginFill(0x000000, 0.1);
      shapeCB(fogOfWarMask);
      fogOfWarMask.endFill();

      map.getMovableLayer().addChild(fogOfWarMask);
      map.getMovableLayer().mask = fogOfWarMask;

    }
  }
})();