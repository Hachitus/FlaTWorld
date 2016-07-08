(function simpleFogOfWar() {
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
  function setupSimpleFogOfWar() {
    const VIEWPORT_MULTIPLIER = 0.4;
    const baseRendererOptions = {
      transparent: true,
      autoResize: true,
    };
    const baseFilter = new MapDataManipulator([{
      type: 'filter',
      object: 'object',
      property: 'type',
      value: 'unit',
    }]);
    const maskSprite = new PIXI.Sprite();
    let FoWOverlay;
    let alpha;
    let map;
    let FoWRenderer;
    let texture;
    let maskContainer;
    let FoWCB;

    return {
      // These two are required by all plugins
      init,
      pluginName: 'simpleFogOfWar',

      getFoWRenderer,
      getMaskContainer,

      activateFogOfWar,
      refreshFoW,
      getFoWObjectArray,
      calculateCorrectCoordinates,
    };
    /**
     * Ínitialize as a plugin. Done by the Flatworld class.
     *
     * After plugin has been initialized by the flatworld, you must still call initFogOfWar to
     * start showing it.
     *
     * @todo the -200 offset is quite crappy, we should make some universal thing in utils, that
     * can be used here and in getViewportArea-method etc.
     *
     * @method init
     * @param  {Map} givenMap     Instance of Map
     */
    function init(givenMap) {
      map = givenMap;
      map.activateFogOfWar = activateFogOfWar;
      const mapRenderer = map.getRenderer();
      const coordinates = {
        x: -200,
        y: -200,
        width: (mapRenderer.width + 200 + (mapRenderer.width / 2)) * map.getZoom(),
        height: (mapRenderer.height + 200 + (mapRenderer.height / 2)) * map.getZoom(),
      };
      const rendererOptions = Object.assign(
        baseRendererOptions, {
          resolution: mapRenderer.resolution,
        });

      setupRenderer(coordinates, rendererOptions);

      maskContainer = map.createSpecialLayer('FoWLayer');
      maskContainer.x = coordinates.x;
      maskContainer.y = coordinates.y;
    }

    function activateFogOfWar(cb, options = { alpha: 0.8 }, testing = false) {
      alpha = options.alpha;
      FoWCB = cb;

      utils.resize.resizePIXIRenderer(FoWRenderer, map.drawOnNextTick.bind(map));

      refreshFoW();
      setEvents();
    }

    function refreshFoW() {
      const staticLayer = map.getStaticLayer();
      resetFoW(FoWOverlay);

      const spriteArray = getFoWObjectArray(FoWCB);

      if (spriteArray.length > 0) {
        maskContainer.addChild(...spriteArray);
      }
      FoWRenderer.render(maskContainer);
      maskContainer.removeChildren();
      texture = PIXI.Texture.fromCanvas(FoWRenderer.view);
      maskSprite.texture = texture;

      texture.update();
      staticLayer.mask = maskSprite;
    }

    function getFoWObjectArray(cb, filter = baseFilter) {
      //map.getMovableLayer().updateTransform();

      return getCorrectObjects(filter).map(unit => cb(calculateCorrectCoordinates(unit)));
    }

    function calculateCorrectCoordinates(object) {
      return object.toGlobal(new PIXI.Point(0, 0));
    }

    /**
     * @param  {MapDataManipulator} filter    REQUIRED
     * @return {Array}                        Array of objects to be used for creating FoW
     */
    function getCorrectObjects(filter) {
      return map.getObjectsUnderArea(
        map.getViewportArea(false, VIEWPORT_MULTIPLIER),
        { filters: filter });
    }

    function setupRenderer(coordinates, resolution, rendererOptions) {
      // Create the fog that cover everything and create holes to it later:
      FoWOverlay = createOverlay(coordinates);
      // Clear old renderer IF it exists
      clearRenderer(FoWRenderer);
      // Create new renderer
      FoWRenderer = setRenderer(coordinates, rendererOptions);
    }

    function getMaskContainer() {
      return maskContainer;
    }

    function getFoWRenderer() {
      return FoWRenderer;
    }

    /** *************************************
    **************** PRIVATE ****************
    ****************************************/
    function setRenderer(coordinates, rendererOptions) {
      return new PIXI.WebGLRenderer(coordinates.width, coordinates.height, rendererOptions);
    }

    function clearRenderer(renderer) {
      // Reset earlier fog of war renderer, if present
      renderer && renderer.destroy && renderer.view && renderer.destroy(); // eslint-disable-line
    }
    function resetFoW(overlay) {
      texture && texture.destroy && texture.destroy(); // eslint-disable-line no-unused-expressions
      maskContainer.children && maskContainer.removeChildren(); // eslint-disable-line 
      maskContainer.addChild(overlay);
    }

    function createOverlay(coordinates) {
      const graphics = new PIXI.Graphics();

      graphics.clear();
      graphics.beginFill(0x000000, alpha);
      graphics.drawRect(coordinates.x, coordinates.y, coordinates.width, coordinates.height);
      graphics.endFill();

      return graphics;
    }
    function setEvents() {
      mapEvents.subscribe('mapResized', () => {
        utils.resize.resizePIXIRenderer(FoWRenderer, map.drawOnNextTick.bind(map));
      });
      mapEvents.subscribe('mapResized', refreshFoW);
      mapEvents.subscribe('mapMoved', refreshFoW);
    }
  }
}());
