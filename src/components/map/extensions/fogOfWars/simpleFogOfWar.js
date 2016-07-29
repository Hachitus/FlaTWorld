(function simpleFogOfWar() {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  const { PIXI } = window.flatworld_libraries;
  const { mapEvents, MapDataManipulator } = window.flatworld;

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
      object: 'layer',
      property: 'name',
      value: 'unitLayer',
    }]);
    let FoWOverlay;
    let alpha;
    let map;
    let texture;
    let maskContainer;
    let FoWCB;

    return {
      // These two are required by all plugins
      init,
      pluginName: 'simpleFogOfWar',

      getMaskContainer,

      activateFogOfWar,
      refreshFoW,
      getFoWObjectArray,
      calculateCorrectCoordinates,
    };
    /**
     * Ínitialize as a plugin. Done by the Flatworld class.
     *
     * After plugin has been initialized by the flatworld, you must still call activateFogOfWar to
     * start showing it.
     *
     * @todo the offsets are really bad! For some reason they are needed, I don't know where the
     * issue lies :(. We probably need an offset for the renderer in the end anyway, but now it
     * doesn't even work properly without them.
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
        x: 0,
        y: 0,
        width: (mapRenderer.width + 0 + (mapRenderer.width / 2)) * map.getZoom(),
        height: (mapRenderer.height + 0 + (mapRenderer.height / 2)) * map.getZoom(),
      };
      const rendererOptions = Object.assign(
        baseRendererOptions, {
          resolution: mapRenderer.resolution,
        });

      setupRenderer(coordinates, rendererOptions);

      maskContainer = map.createSpecialLayer('FoWMaskLayer');
      maskContainer.x = coordinates.x;
      maskContainer.y = coordinates.y;
    }

    function activateFogOfWar(cb, options = { alpha: 0.8 }) {
      alpha = options.alpha;
      FoWCB = cb;

      refreshFoW();
      setEvents();
    }

    function refreshFoW() {
      const renderer = map.getRenderer();
      const staticLayer = map.getStaticLayer();
      resetFoW(FoWOverlay);

      map.getMovableLayer().updateTransform();
      const spriteArray = getFoWObjectArray(FoWCB);

      if (spriteArray.length > 0) {
        maskContainer.addChild(...spriteArray);
      }
      const renderTexture = new PIXI.RenderTexture(new PIXI.BaseRenderTexture(renderer.width, renderer.height));
      renderer.render(maskContainer, renderTexture, true, null, false);

      staticLayer.mask = new PIXI.Sprite(renderTexture);
    }

    function getFoWObjectArray(cb, filter = baseFilter) {
      return getCorrectObjects(filter).map(object => cb(calculateCorrectCoordinates(object)));
    }

    function calculateCorrectCoordinates(object) {
      const coordinates = object.toGlobal(new PIXI.Point(0, 0));

      coordinates.x = Math.round(coordinates.x);
      coordinates.y = Math.round(coordinates.y);
      coordinates.anchor = object.anchor;
      coordinates.pivot = object.pivot;
      coordinates.scale = map.getZoom();

      return coordinates;
    }

    /**
     * @param  {MapDataManipulator} filter    REQUIRED
     * @return {Array}                        Array of objects to be used for creating FoW
     * @todo  REFACTOR
     */
    function getCorrectObjects(filter) {
      return map.getObjectsUnderArea(
        map.getViewportArea(false, VIEWPORT_MULTIPLIER),
        { filters: filter });
    }

    function setupRenderer(coordinates) {
      // Create the fog that cover everything and create holes to it later:
      FoWOverlay = createOverlay(coordinates);
    }

    function getMaskContainer() {
      return maskContainer;
    }

    /** *************************************
    **************** PRIVATE ****************
    ****************************************/
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
      mapEvents.subscribe('mapResized', refreshFoW);
      mapEvents.subscribe('mapResized', refreshFoW);
      mapEvents.subscribe('mapMoved', refreshFoW);
    }
  }
}());
