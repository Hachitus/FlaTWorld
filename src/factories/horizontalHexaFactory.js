(function () {
  'use strict';

  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var PIXI = window.flatworld_libraries.PIXI;
  var { Flatworld, utils, log }  = window.flatworld;
  var hexagonPlugin = window.flatworld.extensions.hexagons;

  /*---------------------
  --------- API ---------
  ---------------------*/
  window.flatworld.factories.hexaFactory = hexaFactory;

  /*---------------------
  ------- PUBLIC --------
  ----------------------*/
  /**
   * This constructs a whole horizontally aligned hexagonal map. Some polyfills are needed and added for IE11 (
   * http://babeljs.io/docs/usage/polyfill/ ). These are found in utils
   *
   * @class factories.horizontalHexaFactory
   * @requires PIXI in global space
   * @param {HTMLElement} canvasContainerElement  HTML Element. Container which will hold the generated canvas element
   * @param {Object} datas                        Object with mapDatas to construct the map structure
   * @param {Object} datas.map                    Holds all the stage, layer and object data needed to construct a full map
   * @param {Object} datas.game                   More general game data (like turn number, map size etc.)
   * @param {Object} datas.type                   Type data such as different unit types and their graphics (tank, soldier etc.)
   * @param {UITheme} UITheme                     An instance of the UITheme class that the map uses.
   * @param {Object} options                      Optional options
   * @param {Object} options.isHiddenByDefault    When we use mapMovement plugin, it is best to keep all the obejcts hidden at the beginnig.
   * @param {Function} options.trackFPSCB         Callback to track FPS
   **/
  function hexaFactory(canvasContainerElement, datas, options = {
        trackFPSCB: false,
        isHiddenByDefault: true,
        cache: false }) {
    console.log("============== Horizontal hexagonal Map factory started =============");
    const pixelRatio = utils.environmentDetection.getPixelRatio();
    const DATA_MAP = (typeof datas.map === "string") ? JSON.parse(datas.map) : datas.map;
    const DATA_TYPE = (typeof datas.type === "string") ? JSON.parse(datas.type) : datas.type;
    const DATA_GAME = (typeof datas.game === "string") ? JSON.parse(datas.game) : datas.game;
    const WINDOW_SIZE = utils.resize.getWindowSize();
    const mapOptions = {
      refreshEventListeners: true
    };
    /*---------------------
    ------ VARIABLES ------
    ----------------------*/
    const functionsInObj = {
      ObjectTerrain: hexagonPlugin.objects.ObjectHexaTerrain,
      ObjectUnit: hexagonPlugin.objects.ObjectHexaUnit
    };
    var mapProperties = {
      bounds: {
        x: 0,
        y: 0,
        width: WINDOW_SIZE.x,
        height: WINDOW_SIZE.y
      },
      rendererOptions: {
        resolution: pixelRatio, // We might need this later on, when doing mobile optimizations, for different pizel density devices
        autoResize: true,
        transparent: true,
        antialias: false // TEST. Only should work in chrome atm.?
      },
      subcontainers: {
        width: 500,
        height: 500,
        maxDetectionOffset: 100,
        isHiddenByDefault: options.isHiddenByDefault
      },
      trackFPSCB: options.trackFPSCB,
      cache: options.cache
    };
    var map = new Flatworld(canvasContainerElement, mapProperties, mapOptions );

    DATA_MAP.layers.forEach( layerData => {
      if (typeof layerData !== "object") {
        log.error("Problem in horizontalHexaFactory, with layerData:" + JSON.stringify(layerData));
        throw new Error("Problem in horizontalHexaFactory, with layerData:", layerData);
      }

      var renderer = map.getRenderer();
      var layerOptions = {
        name: layerData.name,
        coord: layerData.coord,
        drawOutsideViewport: {
          x: renderer.width,
          y: renderer.height
        },
        selectable: layerData.name === "unitLayer" ? true : false
      };
      var thisLayer;

      try {
        thisLayer = map.addLayer(layerOptions);

        layerData.objectGroups.forEach( objectGroup => {
          let spritesheetType = objectGroup.typeImageData;

          if (!spritesheetType) {
            log.error("Error with spritesheetType-data");
            return;
          }

          objectGroup.objects.forEach( object => {
            var objTypeData, objectOptions, texture, newObject;

            try {
              objTypeData = DATA_TYPE.objectData[spritesheetType][object.objType];
              if (!objTypeData) {
                log.error("Bad mapData for type:", spritesheetType, object.objType, object.name);
                throw new Error("Bad mapData for type:", spritesheetType, object.objType, object.name);
              }

              texture = PIXI.Texture.fromFrame(objTypeData.image);
              objectOptions = {
                data: {
                  typeData: objTypeData,
                  activeData: object.data
                },
                radius: DATA_GAME.hexagonRadius
              };

              newObject = new functionsInObj[objectGroup.type]( texture, object.coord, objectOptions );

              thisLayer.addChild(newObject);
            } catch (e) {
              log.error(e);
            }
          });
        });
      } catch (e) {
        log.error("Problem:" + JSON.stringify(layerData.type) + " ---- " + JSON.stringify(e.stack));
      }
    });

    map.moveMap(DATA_MAP.startPoint);

    return map;
  }
})();