import * as PIXI from 'pixi.js';
import { Flatworld, utils, log, constants } from '../../src/core';
import { ObjectHexaTerrain, ObjectHexaUnit } from '../../src/extensions/hexagons/Objects';

/*---------------------
------- PUBLIC --------
----------------------*/
/**
 * This constructs a whole horizontally aligned hexagonal map. Some polyfills are needed and added for IE11 (
 * http://babeljs.io/docs/usage/polyfill/ ). These are found in utils
 *
 * @class factories.hexaFactory
 * @requires PIXI in global space
 * @param {HTMLElement} mapCanvas              Canvas element used for the map
 * @param {Object} datas                       Object with mapDatas to construct the map structure
 * @param {Object} datas.map                   Holds all the stage, layer and object data needed to construct a full map
 * @param {Object} datas.game                  More general game data (like turn number, map size etc.)
 * @param {Object} datas.type                  Type data such as different unit types and their graphics (tank, soldier etc.)
 * @param {UITheme} UITheme                    An instance of the UITheme class that the map uses.
 * @param {Object} {}                          Optional options
 * @param {Object} {}.isHiddenByDefault        When we use mapMovement plugin, it is best to keep all the obejcts hidden at the beginnig.
 * @param {Function} {}.trackFPSCB             Callback to track FPS
 **/
export default function hexaFactory(mapCanvas, datas, {
  trackFPSCB = false,
  isHiddenByDefault = true,
  minimapCanvas,
  scaleMode = constants.DEFAULT_SCALE_MODE } = {}) {
  log.debug('============== Hexagonal Map factory started =============');
  const pixelRatio = utils.environment.getPixelRatio();
  const DATA_MAP = (typeof datas.map === 'string') ? JSON.parse(datas.map) : datas.map;
  const DATA_TYPE = (typeof datas.type === 'string') ? JSON.parse(datas.type) : datas.type;
  const DATA_GAME = (typeof datas.game === 'string') ? JSON.parse(datas.game) : datas.game;
  const DATA_GRAPHIC = (typeof datas.graphic === 'string') ? JSON.parse(datas.graphic) : datas.graphic;
  const WINDOW_SIZE = utils.resize.getWindowSize();
  /*---------------------
  ------ VARIABLES ------
  ----------------------*/
  ObjectHexaUnit.prototype.getMovement = () =>  100;
  const functionsInObj = {
    ObjectTerrain: ObjectHexaTerrain,
    ObjectUnit: ObjectHexaUnit
  };
  const mapProperties = {
    mapSize: DATA_GAME.mapSize,
    bounds: {
      x: 0,
      y: 0,
      width: WINDOW_SIZE.x,
      height: WINDOW_SIZE.y
    },
    rendererOptions: {
      resolution: pixelRatio, // We might need this later on, when doing mobile optimizations, for different pizel density devices
      autoResize: true,
      backgroundAlpha: 0,
      antialias: false // TEST. Only should work in chrome atm.?
    },
    subcontainers: {
      width: 500,
      height: 500,
      maxDetectionOffset: 100,
      isHiddenByDefault
    },
    trackFPSCB,
    defaultScaleMode: scaleMode,
    minimapCanvas
  };
  const map = new Flatworld(mapCanvas, mapProperties);

  PIXI.settings.SCALE_MODE = 1;

  DATA_MAP.layers.forEach(layerData => {
    if (typeof layerData !== 'object') {
      log.error('Problem in hexaFactory, with layerData:' + JSON.stringify(layerData));
      throw new Error('Problem in hexaFactory, with layerData:', layerData);
    }

    const renderer = map.getRenderer();
    const layerOptions = {
      name: layerData.name,
      group: layerData.group,
      coord: layerData.coord,
      drawOutsideViewport: {
        x: renderer.width,
        y: renderer.height
      },
      selectable: layerData.group === 'unit' ? true : false
    };
    let thisLayer;

    try {
      thisLayer = map.addLayer(layerData.group, layerOptions);

      layerData.objectGroups.forEach(objectGroup => {
        const spritesheetType = objectGroup.typeImageData;

        if (!spritesheetType) {
          log.error('Error with spritesheetType-data');
          return;
        }

        objectGroup.objects.forEach(object => {
          let objTypeData, objectOptions, texture, newObject;

          try {
            objTypeData = DATA_TYPE[spritesheetType][object.objType];
            if (!objTypeData) {
              const error = new Error(
                `Bad mapData for type: ${spritesheetType.toString()} ${object.objType.toString()} ${object.name.toString()}`
              );
              log.error(error);
              throw error;
            }

            texture = PIXI.Texture.from(objTypeData.image);
            objectOptions = {
              data: {
                typeData: objTypeData,
                activeData: object.data
              },
              radius: DATA_GAME.hexagonRadius,
              minimapColor: objTypeData.minimapColor,
              minimapSize: objTypeData.minimapSize
            };

            newObject = new functionsInObj[objectGroup.type](texture, object.coord, objectOptions);
            /** @todo This is here to test using higher resolution sprites, that would handle zooming more gracefully. This should not 
             * really be here, but rather as some kind of option or in the object classes that are extended */
            if (DATA_GRAPHIC[objectGroup.typeImageData].initialScale) {
              newObject.scale.x = DATA_GRAPHIC[objectGroup.typeImageData].initialScale;
              newObject.scale.y = DATA_GRAPHIC[objectGroup.typeImageData].initialScale;
            }

            thisLayer.addChild(newObject);
          } catch (e) {
            log.error(e);
          }
        });
      });
    } catch (e) {
      log.error('Problem:' + JSON.stringify(layerData.type) + ' ---- ' + JSON.stringify(e.stack));
    }
  });

  map.moveMap(DATA_GAME.startPoint);

  return map;
}
