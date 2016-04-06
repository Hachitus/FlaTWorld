(function () {
  'use strict';

  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var mapEvents = window.flatworld.mapEvents;
  var eventListeners = window.flatworld.eventListeners;
  var MapDataManipulator = window.flatworld.MapDataManipulator;
  var utils = window.flatworld.utils;
  var Hammer = window.flatworld_libraries.Hammer;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.extensions.minimaps.pixelizedMinimap = setupPixelizedMinimap();

  /*-----------------------
  -------- PUBLIC ---------
  -----------------------*/
  /**
   * Pixelized minimap works in situations, where you map a symmetrical map. E.g. hexagon or square based map.
   * It can only be created in sizes that match pixel squares (not sure what it is called). So basically object area on the minimap can be
   * either 1, 4, 9, 16 etc. pixels in size.
   *
   * After plugin has been initialized by the flatworld, you must still call initMinimap to start showing the minimap.
   *
   * @namespace flatworld.extensions.minimaps
   * @class pixelizedMinimap
   **/
  function setupPixelizedMinimap () {
    var paddingX = 0;
    var paddingY = 0;
    var map, minimap, minimapViewport, hammer, coordinateConverterCB, mapMoveTimestamp;

    return {
      init,
      pluginName: "pixelizedMinimap",
      initMinimap,
      _testObject: {

      }
    };
    /**
     * Ínitialize as a plugin. Done by the Flatworld class.
     *
     * @method init
     * @param  {Map} givenMap     Instance of Map
     */
    function init(givenMap) {
      map = givenMap;
      hammer = new Hammer.Manager(map.minimapCanvas);
      map.initMinimap = initMinimap;
      minimap = map.getMinimapLayer();
    }
    /**
     * initMinimap requires some data, to initialize and show the actual minimap.
     *
     * @param  {PIXI.DisplayObject} UIImage         The canvas image that you want to show around the UI element
     * @param  {Integer} {}.x                       x coordinate for the minimap layer
     * @param  {Integer} {}.y                       y coordinate for the minimap layer
     * @return {PIXI.Container}                     minimap layer
     */
    function initMinimap(UIImage, minimapSize, staticCB, dynamicCB, coordinateConvCB, givenMinimapViewport, {
          xPadding = 10,
          yPadding = 10 } = {}) {
      paddingX = xPadding;
      paddingY = yPadding;
      minimap.minimapSize = minimapSize;
      coordinateConverterCB = coordinateConvCB;
      //utils.mouse.disableContextMenu(map.getRenderer("minimap").view);
      setMinimapUI(UIImage);
      setupBackgroundLayer(staticCB);
      setupDynamicLayer(dynamicCB);
      _setMinimapArea(minimap.minimapSize.x, minimap.minimapSize.y, minimap.minimapSize.width, minimap.minimapSize.height);
      setupMinimapViewportEvents();
      setupMinimapClickEvent();
      minimapViewport = givenMinimapViewport;
      minimap.addChild(minimapViewport);

      mapEvents.publish("minimapInitialized", minimap);

      return minimap;
    }
    function setMinimapUI(UIImage) {
      minimap.addChild(UIImage);
    }
    /**
     * Sets up the layer that doesn't change, normally terrain layer. This layer is supposed to be unchanged during this play session, so
     * is is cached for efficiency.
     *
     * @param  {Function} staticCB   Callback that receives each object that is added to the map individually.
     */
    function setupBackgroundLayer(staticCB) {
      const filters = new MapDataManipulator({
        type: "filter",
        object: "layer",
        property: "staticLayer",
        value: true
      });
      var backgroundContainer = createMinimapLayer();

      map.getAllObjects({ filters }).forEach((obj) => {
        backgroundContainer.addChild(staticCB(obj));
      });

      backgroundContainer.cacheAsBitmap = true;

      minimap.addChild(backgroundContainer);
    }
    function setupDynamicLayer(updateCB) {
      const filters = new MapDataManipulator({
        type: "filter",
        object: "object",
        property: "static",
        value: false
      });
      var dynamicContainer = createMinimapLayer();

      map.getAllObjects({ filters }).forEach((obj) => {
        dynamicContainer.addChild(updateCB(obj));
      });

      minimap.addChild(dynamicContainer);
    }
    function setupMinimapViewportEvents() {
      mapEvents.subscribe("mapMoved", reactToMapMovement);
      mapEvents.subscribe("mapZoomed", reactToMapScale);
      mapEvents.subscribe("minimapClicked", moveViewport);
    }
    function reactToMapMovement() {
      if (mapMoveTimestamp - Date.now() > -5) {
        return;
      }

      var minimapCoordinates = coordinateConverterCB(map.getMovableLayer(), true);

      minimapViewport.x = minimapCoordinates.x;
      minimapViewport.y = minimapCoordinates.y;

      map.drawOnNextTick();
    }
    function reactToMapScale(e) {
      minimapViewport.scale.x += 0.1;
      minimapViewport.scale.y = 0.1;
    }
    function moveViewport(e) {
      var globalCoordinates = utils.mouse.eventData.getHAMMERPointerCoords(e);
      var mapCoordinates = new PIXI.Point( e.srcEvent.layerX, e.srcEvent.layerY);

      globalCoordinates = utils.mouse.coordinatesFromGlobalToRelative(globalCoordinates, map.minimapCanvas);

      /* We need to keep track when the map was moved, so we don't react to this movement */
      mapMoveTimestamp = Date.now();

      /* Select the center of the viewport rectangle */
      globalCoordinates.x -= Math.round(minimapViewport.width / 2);
      globalCoordinates.y -= Math.round(minimapViewport.height / 2);

      mapCoordinates = coordinateConverterCB(globalCoordinates, true);
      minimapViewport.x = mapCoordinates.x;
      minimapViewport.y = mapCoordinates.y;
      mapCoordinates = coordinateConverterCB(globalCoordinates, false);
      map.moveMap(mapCoordinates, { absolute: true, noEvent: true });

      map.drawOnNextTick();
    }
    function setupMinimapClickEvent() {
      var activeCB;
      var minimapClickDetector = {
        on: (cb) => {
          var tap = new Hammer.Tap();
          activeCB = cb;

          hammer.add(tap);
          hammer.on("tap", activeCB);
        },
        off: () => {
          hammer.on("tap", activeCB);
        }
      };

      eventListeners.setDetector("minimapClicked", minimapClickDetector.on, minimapClickDetector.off);

      eventListeners.on("minimapClicked", moveViewport);
    }
    /*-----------------------
    -------- PRIVATE --------
    -----------------------*/
    /**
     * Sets up the minimap area. Like correct position and renderer auto resizing.
     *
     * @param {Integer} x
     * @param {Integer} y
     * @param {Integer} width
     * @param {Integer} height
     */
    function _setMinimapArea( x, y, width, height ) {
      var _minimapRenderer = map.getRenderer("minimap");

      minimap.position = new PIXI.Point(x, y);
      _minimapRenderer.autoResize = true;
      _minimapRenderer.resize(width + (paddingX * 2), height + (paddingY * 2));

      map.drawOnNextTick();
    }
    /**
     * Creates minimap layer with proper starting coordinates
     *
     * @return {PIXI.Container}
     */
    function createMinimapLayer() {
      var container = new PIXI.Container();

      container.x = paddingX;
      container.y = paddingY;

      return container;
    }
  }
})();