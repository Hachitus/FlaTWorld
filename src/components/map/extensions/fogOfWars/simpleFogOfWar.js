(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  const { PIXI } = window.flatworld_libraries;
  const { mapEvents, MapDataManipulator, utils, eve } = window.flatworld;
  const baseEventlisteners = window.flatworld.extensions;

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
    const rendererOptions = {
      transparent: true,
      autoResize: true
    }
    const FoWOverlay = new PIXI.Graphics();
    const baseFilter = new MapDataManipulator([{
        type: 'filter',
        object: 'object',
        property: 'type',
        value: 'unit'
      }]);
    let alpha, map, FoWRenderer, texture, maskContainer, movableMaskContainer, FoWCB;

    return {
      init,
      pluginName: 'simpleFogOfWar',
      activate,
      resetFoW,
      refreshFoW,
      setupAndUpdateMask,
      getFoWObjectArray,
      setCanvasSize
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
      map.initFogOfWar = activate;

      // Reset earlier fog of war renderer, if present
      FoWRenderer && FoWRenderer.destroy && FoWRenderer.destroy();

      // Create new renderer & set it's size correct
      setCanvasSize();

      // It's a hidden renderer used for mask only
      FoWRenderer.view.style.visible = "hidden";

      maskContainer =  map.createSpecialLayer();
      movableMaskContainer =  map.createSpecialLayer();
    }

    function activate(cb, options = { alpha: 0.5 }) {
      alpha = options.alpha;
      FoWCB = cb;
      refreshFoW();
      setEvents();
    }

    function setEvents() {
      mapEvents.subscribe('mapResized', setCanvasSize);
      mapEvents.subscribe('mapResized', refreshFoW);
      mapEvents.subscribe('mapMoved', refreshFoW);
    }

    function resetFoW() {
      texture && texture.destroy && texture.destroy();
      maskContainer.children && maskContainer.removeChildren();
      movableMaskContainer.children && movableMaskContainer.removeChildren();
    }

    function refreshFoW() {
      //map.getMovableLayer().mask = null;
      _resizeCanvas();
      resetFoW();

      const spriteArray = getFoWObjectArray(FoWCB);

      maskContainer.addChild(FoWOverlay);
      maskContainer.addChild(...spriteArray);
      FoWRenderer.render(maskContainer);
      texture = PIXI.Texture.fromCanvas(FoWRenderer.view);
      let mask = new PIXI.Sprite(texture);

      setupAndUpdateMask(mask);
    }

    function setupAndUpdateMask(mask) {
      movableMaskContainer.addChild(mask);
      
      map.getMovableLayer().addChild(movableMaskContainer);

      texture.update();

      map.getMovableLayer().mask = mask;
    }

    function getFoWObjectArray(cb, filter = baseFilter) {
      return map.getObjectsUnderArea(map.getViewportArea(), { filters: filter }).map((unit) => {
        let correctCoords;

        correctCoords = unit.localToLocal(unit.x, unit.y, map.getMovableLayer());
        // correctCoords = {
        //   x: unit.x + (unit.anchor.x * unit.width),
        //   y: unit.y + (unit.anchor.y * unit.height)
        // }

        //correctCoords.x = Math.random() * 1000;
        //correctCoords.y = Math.random() * 1000;

        return cb(correctCoords);
      });
    }

    function setCanvasSize() {
      let mapRenderer = map.getRenderer();
      let coordinates = {
        x: -200,
        y: -200,
        width: (mapRenderer.width + 200 + (mapRenderer.width / 2)) * map.getZoom(),
        height: (mapRenderer.height + 200 +(mapRenderer.height / 2)) * map.getZoom(),
      }
      rendererOptions.resolution = mapRenderer.resolution;
      FoWRenderer = new PIXI.WebGLRenderer(coordinates.width, coordinates.height, rendererOptions);
      FoWOverlay.clear();
      FoWOverlay.beginFill(0x999999, alpha);
      FoWOverlay.drawRect(coordinates.x, coordinates.y, coordinates.width, coordinates.height);
      FoWOverlay.endFill();
    }

    /**
     * Resizes the canvas to the current most wide and high element status. Basically canvas size === window size.
     *
     * @private
     * @method _resizeCanvas
     */
    function _resizeCanvas() {
      var windowSize = utils.resize.getWindowSize();

      FoWRenderer.autoResize = true;
      FoWRenderer.resize(windowSize.x, windowSize.y);
      map.drawOnNextTick();
    }
  }
})();