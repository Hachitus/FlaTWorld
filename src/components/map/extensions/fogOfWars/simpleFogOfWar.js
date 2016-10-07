(function simpleFogOfWar() {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  const { PIXI } = window.flatworld_libraries;
  const { mapEvents, generalUtils } = window.flatworld;
  const { resize } = window.flatworld.utils;

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
   * @class pixelizedMiniMap
   **/
  function setupSimpleFogOfWar() {
    const maskSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
    const renderTexture = new PIXI.RenderTexture(new PIXI.BaseRenderTexture(resize.getWindowSize().x, resize.getWindowSize().y));
    const FoWOverlay = new PIXI.Graphics();
    let movableLayer;
    let zoomLayer;
    let mapRenderer;
    let maskMovableContainer;
    let maskStageContainer;
    let FoWCB;
    let objectsForFoW;
    let color;
    let mapInstance;

    return {
      // These two are required by all plugins
      init,
      pluginName: 'simpleFogOfWar',

      activateFogOfWar,
      refreshFoW,
      getFoWObjectArray,
      calculateCorrectCoordinates,
      FOR_TESTS: {
        setObjectsForFoW: (o) => objectsForFoW = o
      }
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
     * @param  {Object} parameters    This plugin requires cb and filter properties!
     */
    function init(params) {
      if (!(params.cb || params.filter)) {
        throw new Error('SimpleFogOfWar plugin requires cb and filter properties')
      }
      mapInstance = this.mapInstance;
      movableLayer = this.mapInstance.getMovableLayer();
      zoomLayer = this.mapInstance.getZoomLayer();
      mapRenderer = this.mapInstance.getRenderer();

      maskStageContainer = this.mapInstance.createSpecialLayer('FoWStageMaskLayer');
      maskMovableContainer = this.mapInstance.createSpecialLayer('FoWMovableMaskLayer');
      maskMovableContainer.x = movableLayer.x;
      maskMovableContainer.y = movableLayer.y;

      activateFogOfWar(this.mapInstance, params.cb, params.filter);

      return Promise.resolve();
    }

    function activateFogOfWar(mapInstance, cb, filterCreator, options = {}) {
      color = options.color || 0x222222;
      FoWCB = cb;
      let filter = filterCreator();
      objectsForFoW = mapInstance.getPrimaryLayers({ filters: filter }).map(o => o.getObjects(filter));
      objectsForFoW = generalUtils.arrays.flatten2Levels(objectsForFoW);

      createOverlay();

      setupFoW();
      setEvents();
    }

    function setupFoW() {
      const spriteArray = getFoWObjectArray(FoWCB);

      resetFoW(FoWOverlay);

      if (spriteArray.length > 0) {
        maskMovableContainer.addChild(...spriteArray);
      }

      maskStageContainer.filterArea = new PIXI.Rectangle(0, 0, mapRenderer.width, mapRenderer.height);
      resizeFoW();

      zoomLayer.mask = maskSprite;

      mapInstance.registerPreRenderer('renderFoW', moveFoW);
    }

    function refreshFoW() {
      mapRenderer.render(maskStageContainer, renderTexture, true, null, false);

      maskSprite.texture = renderTexture;
    }

    function moveFoW() {
      maskMovableContainer.position = movableLayer.position;

      refreshFoW();
    }

    function zoomFoW() {
      maskStageContainer.scale.x = mapInstance.getZoom();
      maskStageContainer.scale.y = mapInstance.getZoom();

      createOverlay();
      refreshFoW();
    }

    function resizeFoW() {

      createOverlay();
      refreshFoW();
    }

    function getFoWObjectArray(cb) {
      return objectsForFoW.map(object => cb(calculateCorrectCoordinates(object)));
    }

    function calculateCorrectCoordinates(object) {
      const coordinates = object.toGlobal(new PIXI.Point(0, 0));

      coordinates.x = Math.round(coordinates.x);
      coordinates.y = Math.round(coordinates.y);
      coordinates.anchor = object.anchor;
      coordinates.pivot = object.pivot;
      coordinates.scale = mapInstance.getZoom();

      return coordinates;
    }

    /** *************************************
    **************** PRIVATE ****************
    ****************************************/
    function resetFoW() {
      maskMovableContainer.children && maskMovableContainer.removeChildren();
      maskStageContainer.children && maskStageContainer.removeChildren();
      maskStageContainer.addChild(FoWOverlay);
      maskStageContainer.addChild(maskMovableContainer);
    }

    function createOverlay() {
      const coordinates = {
        x: -100,
        y: -100,
        width: mapRenderer.width + 200 + (mapRenderer.width / mapInstance.getZoom()),
        height: mapRenderer.height + 200 + (mapRenderer.height / mapInstance.getZoom())
      };

      FoWOverlay.clear();
      FoWOverlay.beginFill(color);
      FoWOverlay.drawRect(coordinates.x, coordinates.y, coordinates.width, coordinates.height);
      FoWOverlay.endFill();
    }
    function setEvents() {
      mapEvents.subscribe('mapResized', resizeFoW);
      mapEvents.subscribe('mapZoomed', zoomFoW);
      /* mapEvents.subscribe('mapMoved', moveFoW); */
    }
  }
}());
