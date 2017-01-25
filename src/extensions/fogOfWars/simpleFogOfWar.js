import * as PIXI from 'pixi.js';
import {  mapEvents, utils } from '../../core/';
const { resize } = utils;

/*-----------------------
-------- PUBLIC ---------
-----------------------*/
/**
 * Simple fog of war works with hexagon sized holes around objects
 *
 * @namespace flatworld.extensions.fogOfWars
 * @class pixelizedMiniMap
 **/
const simpleFogOfWar = (function() {
  const maskSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
  const renderTexture = new PIXI.RenderTexture(new PIXI.BaseRenderTexture(resize.getWindowSize().x, resize.getWindowSize().y));
  const FoWOverlay = new PIXI.Graphics();
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
    if (!(params.cb && params.filter)) {
      throw new Error('SimpleFogOfWar plugin requires cb and filter properties')
    }
    mapInstance = this.mapInstance;
    zoomLayer = this._properties.zoomLayer;
    mapRenderer = this.mapInstance.getRenderer();

    maskStageContainer = this.mapInstance.createSpecialLayer('FoWStageMaskLayer');
    // We create a particle container, because it's faster for this purpose. We don't need any
    // fancy special effects for the container currently, so particle container works.
    maskMovableContainer = new PIXI.ParticleContainer();
    maskMovableContainer.position = mapInstance.getMapCoordinates(undefined, true);

    activateFogOfWar(this.mapInstance, params.cb, params.filter);

    return Promise.resolve();
  }

  function activateFogOfWar(mapInstance, cb, filterCreator, options = {}) {
    color = options.color || 0x222222;
    FoWCB = cb;
    const filter = filterCreator();
    // Get layers with filters. So it filters layers and objects
    objectsForFoW = mapInstance.getPrimaryLayers({ filters: filter }).map(o => o.getObjects(filter));
    objectsForFoW = utils.general.flatten2Levels(objectsForFoW);

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

    resizeFoW();

    zoomLayer.mask = maskSprite;

    mapInstance.registerPreRenderer('renderFoW', moveFoW);

    resizeFoW();
  }

  function refreshFoW() {
/*    var t0 = performance.now();*/
    mapRenderer.render(maskStageContainer, renderTexture, true, null, false);

    maskSprite.texture = renderTexture;
/*    var t1 = performance.now();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")*/
  }

  function moveFoW() {
    maskMovableContainer.position = mapInstance.getMapCoordinates(undefined, true);

    refreshFoW();
  }

  function zoomFoW() {
    maskStageContainer.scale.x = mapInstance.getZoom();
    maskStageContainer.scale.y = mapInstance.getZoom();

    createOverlay();
    refreshFoW();
  }

  function resizeFoW() {
    changeMaskSize();
    createOverlay();
    refreshFoW();
  }

  function changeMaskSize() {
    resize.resizePIXIRenderer(
      renderTexture,
      () => {}
    );

    //renderTexture.resize(resize.getWindowSize().x, resize.getWindowSize().y);
    maskSprite.width = resize.getWindowSize().x;
    maskSprite.height = resize.getWindowSize().y;
    // MaskSprites bounds create a filterArea to the zoomLayer as the maskSprite is a mask for it. This causes resizing not to work correctly, if the bounds are not changed and bounds are not updated without this call (for some reason just width and height change is not enough).
    maskSprite.getBounds();
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
})();

/*-----------------------
---------- API ----------
-----------------------*/
export default simpleFogOfWar;
