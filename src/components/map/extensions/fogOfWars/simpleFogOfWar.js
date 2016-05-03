(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  const { PIXI } = window.flatworld_libraries;
  const { mapEvents, MapDataManipulator, utils } = window.flatworld;

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

    function initFogOfWar(shapeCB) {
      const maskContainer =  map.createSpecialLayer();
      const movableMaskContainer =  map.createSpecialLayer();
      const filter = new MapDataManipulator([{
          type: 'filter',
          object: 'object',
          property: 'type',
          value: 'unit'
        }]);
      const spriteArray = map.getObjectsUnderArea(map.getViewportArea(), filter).map((unit) => {
        return shapeCB(unit);
      });

      maskContainer.addChild.apply(maskContainer, spriteArray);

      const texture = map.getRenderer().generateTexture(maskContainer);
      const maski = new PIXI.Sprite(texture);
      movableMaskContainer.addChild(maski);
      
      map.getMovableLayer().addChild(movableMaskContainer);
      map.getMovableLayer().mask = maski;
    }
  }
})();