(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  const mapEvents = window.flatworld.mapEvents;
  const { PIXI } = window.flatworld_libraries;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.extensions.minimaps.scaledMinimap = setupScaledMinimap();

  /*-----------------------
  ------- VARIABLES -------
  -----------------------*/
  let _minimapLayer;

  /*-----------------------
  -------- PUBLIC ---------
  -----------------------*/
  /**
   *
   * @namespace flatworld.extensions.minimaps
   * @class scaledMinimap
   **/
  function setupScaledMinimap() {
    let map, minimap;

    return {
      init,
      pluginName: 'scaledMinimap',
      _testObject: {

      }
    };
    /**
     * Ínitialize as a plugin
     *
     * @method init
     * @param  {Map} map     Instance of Map
     */
    function init(givenMap) {
      map = givenMap;
      map.initMinimap = initMinimap;
      _minimapLayer = map.getMinimapLayer();

      return Promise.resolve();
    }

    function initMinimap({ width, height }, UIImage, backgroundImage, { x = 0, y = 0 } = {}) {
      _minimapLayer.targetSize.x = width;
      _minimapLayer.targetSize.y = height;
      setMinimapUI(UIImage);
      setupBackgroundLayer(backgroundImage);
      _setMinimapCoordinates(Math.round(x), Math.round(y));

      mapEvents.publish('minimapInitialized', minimap);
    }
    function setMinimapUI(UIImage) {
      const UITexture = PIXI.Texture.from(UIImage);
      const UISprite = new PIXI.Sprite(UITexture);

      map.getMinimapLayer().addChild(UISprite);
    }
    function setupBackgroundLayer(backgroundImage) {
      /* Setting width and height will scale the image */
      backgroundImage.width = _minimapLayer.targetSize.x / map.width;
      backgroundImage.height = _minimapLayer.targetSize.y / map.height;

      _minimapLayer.addChild(backgroundImage);
    }
    /*-----------------------
    -------- PRIVATE --------
    -----------------------*/
    function _setMinimapCoordinates({ x, y }) {
      map.getMinimapLayer().position(new PIXI.Point(x, y));
    }
  }
})();
