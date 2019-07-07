import * as PIXI from 'pixi.js';
import { Sound, mapEvents, MapDataManipulator, Preloader, extensions } from '../../src/bundle';
import UI from '../testAssets/js/UI/UI';
import UIThemes from '../testAssets/js/UI/themes/';
import hexaFactory from './hexaFactory';

const { baseEventlisteners, mapZoom, mapDrag, hexagons, mapMovement, fogOfWars, minimaps } = extensions;
const { simpleFogOfWar } = fogOfWars;
const pixelizedMinimap = minimaps.pixelizedMinimap;
const hexaUtils = hexagons.utils;

/* DATA FILES used for testing */
const gameData = window.gameData;
const typeData = window.typeData;
const graphicData = window.graphicData;

/** ===== CONFIGS ===== */
/* Note the y is 3/4 of the actual height */
const HEXAGON_RADIUS = gameData.hexagonRadius;
const X_PADDING = 20;
const Y_PADDING = 20;
const FOW_IMAGE = '/testAssets/images/FoW/hexagonFoW.png';

const UIs = {
  UIDefault: UIThemes.UIDefault,
}

const minimapCheckbox = document.getElementById('minimap');
const fowCheckbox = document.getElementById('fow');
let minimapCanvas;
let graphicsTheme;
let layerCount;

hexaUtils.hexagonMath.init(HEXAGON_RADIUS);
/* This will suppress the fetch errors and make later possible to emulate http-requests */
window.fetch = function () {
  return {
    then: function () {
      return window.fetch();
    },
    catch: function () {
      return {
        then: 1
      };
    }
  };
};

/* Start the whole functionality */
init()

function init() {
  window.FPSElement = document.createElement('div');
  window.FPSElement.style.position = 'absolute';
  window.FPSElement.style.left = '0px';
  window.FPSElement.style.top = '0px';
  window.FPSElement.style.backgroundColor = 'white';

  document.body.appendChild( window.FPSElement );

  const mapsizeElement = document.getElementById('hexaTiles');
  const UIThemeIndex = document.getElementById('UItheme').value;
  let currentMapSize, mapData;

  document.getElementById('testNotification').textContent = 'START THE TESTS BY SELECTING VALUES BELOW AND CLICKING START!';
  document.getElementById('changeValues').disabled = false;

  document.getElementById('changeValues').addEventListener('click', function() {
    graphicsTheme = document.getElementById('graphicsTheme').value;
    layerCount = document.getElementById('layerCount').value;
    document.getElementById('testNotification').style.display = 'none';
    currentMapSize = mapsizeElement.value;

    mapData = getMapData(currentMapSize);

    initFlatworld(mapData, {
      mapsize: currentMapSize,
      UITheme: UIs[UIThemeIndex],
      mapCanvas: document.getElementById('mapCanvas'),
      automatic: window.automaticTest,
      minimapCanvas: document.getElementById('minimapCanvas'),
      trackFPSCB: function (data) {
        const totalFPS = data.FPS;
        const totalTime = data.FPStime;
        const totalRenderTime = data.renderTime;
        const drawCount = data.drawCount;

        window.FPSElement.innerHTML = totalFPS + ' - ' + Math.round( ( totalRenderTime / totalTime * 100 ) ) + '%' + ' : ' + drawCount;
      }
    });
  });
}

/**************************************
****** GENERATE RANDOM MAP DATA *******
**************************************/
function getMapData(mapsize) {
  const TERRAIN_TYPE_COUNT = 7;
  const UNIT_TYPE_COUNT = 56;
  const coordMapsize = {
    x: mapsize,
    y: mapsize
  };
  const gridSize = {
    rows: Math.floor(coordMapsize.x / hexagons.utils.hexagonMath.calcShortDiagonal()),
    columns: Math.floor(coordMapsize.y / hexagons.utils.hexagonMath.calcLongDiagonal())
  };
  const gridSizeHalf = {
    rows: Math.floor(gridSize.rows / 2),
    columns: Math.floor(gridSize.columns / 2)
  };
  const hexagonGridCoordinates = {
    terrains: hexagons.utils.hexagonMath.createHexagonGridCoordinates(gridSize),
    units: hexagons.utils.hexagonMath.createHexagonGridCoordinates(gridSize),
    units2: hexagons.utils.hexagonMath.createHexagonGridCoordinates(gridSizeHalf)
  };
  const returnable = {
    gameID: '53837d47976fed3b24000005',
    turn: 1,
    startPoint: { x: 0, y: 0 },
    element: '#mapCanvas',
    layers: []
  };

  const terrainLayer = populateTerrainLayer(hexagonGridCoordinates.terrains, TERRAIN_TYPE_COUNT);
  const terrainLayer2 = populateTerrainLayer(hexagonGridCoordinates.terrains, TERRAIN_TYPE_COUNT);
  const unitLayer = populateUnitLayer(hexagonGridCoordinates.units, UNIT_TYPE_COUNT)
  const unitLayer2 = populateUnitLayer(hexagonGridCoordinates.units2, UNIT_TYPE_COUNT)    

  returnable.layers. push(terrainLayer);
  if (layerCount > 3) {
    returnable.layers. push(terrainLayer2);
  } 
  returnable.layers. push(unitLayer);
  if (layerCount > 2) {
    returnable.layers. push(unitLayer2);
  }

  return returnable;
}

async function initFlatworld(mapData, options) {
  const mapsize = options.mapsize;
  const mapCanvas = options.mapCanvas;
  const trackFPSCB = options.trackFPSCB;
  const UITheme = options.UITheme;
  const automatic = options.automatic;
  let map = {};
  const globalMap = {
    data: {}
  };
  const minimapSize = { x: 0, y: 0, width: 200, height: 200 };
  const pluginsToActivate = [{
    plugin: baseEventlisteners
  }, {
    plugin: mapZoom,
  }, {
    plugin: mapDrag,
  }, {
    plugin: hexagons.selectHexagonObject,
    parameters: _createHexagonParams()
  }, {
    plugin: mapMovement
  }];
  const sound = new Sound();

  if (minimapCheckbox.checked) {
    minimapCanvas = options.minimapCanvas;
    pluginsToActivate.push({
      plugin: pixelizedMinimap,
      dependencies: ['hexa']
    });
  }
  if (fowCheckbox.checked) {
    pluginsToActivate.push({
      plugin: simpleFogOfWar,
      parameters: _createFoWParams()
    });
  }

  /* This NEEDS to be set for the hexagon plugin to work correctly */
  hexagons.utils.hexagonMath.init(gameData.hexagonRadius);

  /* Determines how much stuff we show on screen for stress testing */
  // If either is even 1 pixel bigger than this, gets all black
  /* works with:
  x: 8118,
  y: 8107*/
  gameData.mapSize = {
    x: mapsize || 1000,
    y: mapsize || 1000
  };


  loadSounds();
  mapEvents.subscribe('objectsSelected', unitSelectedSound);
  mapEvents.subscribe('objectMove', unitOrderSound);
  mapEvents.subscribe('objectOrderFailed', objectOrderFailed);

  await preloadGameAssets([{
    name: 'terrains',
    url: graphicData[graphicsTheme].terrainBase.json,
    crossOrigin: true,
  }, {
    name: 'units',
    url: graphicData[graphicsTheme].unit.json,
    crossOrigin: true,
  }, {
    name: 'fow',
    url: FOW_IMAGE,
    crossOrigin: true,
  }]);

  onComplete();

  try {
    document.getElementById('testFullscreen').addEventListener('click', map.toggleFullScreen);

    const perfTestLoop = setupPerfTestLoop(map);

    if (automatic) {
      map.whenReady().then(function() {
        window.setTimeout(perfTestLoop);
      }).then(null, function(e) {
        // eslint-disable-next-line no-console
        console.log(e);
      })
      // eslint-disable-next-line no-console
        .catch(console.error)
    }
  } catch(e) {
    // eslint-disable-next-line no-console
    console.error('Map stressTest error: ', e);
  }

  function onComplete(/* loader, resources */) {
    try {
      window.worldMap = map = globalMap.data = hexaFactory(
        mapCanvas, {
          game: gameData,
          map: mapData,
          type: typeData,
          graphic: graphicData[graphicsTheme]
        },
        {
          trackFPSCB: trackFPSCB,
          isHiddenByDefault: true,
          scaleMode: PIXI.SCALE_MODES.NEAREST,
          minimapCanvas: minimapCanvas
        });
    } catch(e) {
      // eslint-disable-next-line no-console
      console.log('Error: ' + e.message);
      throw e;
    }

    const dialog_selection = document.getElementById('dialog_select');
    
    const initializedUITheme = new UITheme(dialog_selection, map, { elements: {
      select: '#dialog_select'
    }});
    const protectedProperties = {
      zoomLayer: map.getPrimaryLayers()[0].parent.parent,
      movableLayer: map.getPrimaryLayers()[0].parent,
    };
    UI(initializedUITheme, map, protectedProperties);

    map.init( pluginsToActivate, mapData.startPoint );

    const minimapUIImage = new PIXI.Sprite();
    const pixelRatio = minimapSize.width / map.getMapsize().x * hexaUtils.hexagonMath.calcLongDiagonal();
    function staticCB(obj) {
      let size = pixelRatio;
      let minimapColor = obj.minimapColor;

      /* We must divide the pixelRatio with two. Since this is the hexagons radius. Which means the hexagon is actually twice the given
        * radius in width and height.
        */
      if (obj.type === 'unit') {
        minimapColor = 0x55FF55;
        size = size / 2;
      }
      const minimapShape = obj.minimapShape || hexagons.utils.createHexagon.createVisibleHexagon(size / 2, { color: minimapColor });
      const globalPoints = _getCorrectGlobalCoords(obj);

      minimapShape.x = Math.floor(pixelRatio * globalPoints.x / hexaUtils.hexagonMath.calcShortDiagonal());
      minimapShape.y = Math.floor(pixelRatio * globalPoints.y / hexaUtils.hexagonMath.calcLongDiagonal());

      return minimapShape;
    }
    function dynamicCB(obj) {
      let size = pixelRatio;

      if (obj.type === 'unit') {
        size = size / 2;
      }
      const minimapShape = obj.minimapShape || hexagons.utils.createHexagon.createVisibleHexagon(size / 2, { color: obj.minimapColor });
      const globalPoints = obj.toGlobal(new PIXI.Point(obj.x,obj.y));

      const indexes = new PIXI.Point(hexaUtils.hexagonMath.coordinatesToIndexes(globalPoints));
      minimapShape.x = Math.floor(pixelRatio * indexes.x);
      minimapShape.y = Math.floor(pixelRatio * indexes.y);

      return minimapShape;
    }
    function coordinateConverterCB(globalCoordinates, toMinimap) {
      const minimapCoordinates = new PIXI.Point( globalCoordinates.x, globalCoordinates.y);

      if (toMinimap) {
        return minimapCoordinates;
      } else {
        const minimapCoords = {
          x: -minimapCoordinates.x / minimapSize.width * map.getMapsize().x,
          y: -minimapCoordinates.y / minimapSize.height * map.getMapsize().y
        };

        return minimapCoords;
      }
    }

    const minimapViewport = new PIXI.Graphics();
    const viewportArea = map.getViewportArea();
    const minimapViewportSize = {
      width: minimapSize.width * viewportArea.width / map.getMapsize().x,
      height: minimapSize.height * viewportArea.height / map.getMapsize().y
    };

    minimapViewport.lineStyle(5, 0xFFFFFF, 0.75);
    minimapViewport.drawRect(0, 0, minimapViewportSize.width, minimapViewportSize.height);
    minimapViewport.position = new PIXI.Point(X_PADDING, Y_PADDING);

    map.initMinimap(minimapUIImage, minimapSize, staticCB, dynamicCB, coordinateConverterCB, minimapViewport, {
      xPadding: X_PADDING, yPadding: Y_PADDING,
    });



    /* Activate the fullscreen button: */
    document.getElementById('testFullscreen').addEventListener('click', function () {
      map.toggleFullScreen();
    });

    const showFowCanvas = document.getElementById('showFowCanvas');
    if (showFowCanvas) {
      document.getElementById('showFowCanvas').addEventListener('click', function () {
        const coveringOverlay = new PIXI.Graphics();
        coveringOverlay.beginFill(0xFFFFFF, 1);
        coveringOverlay.drawRect(0, 0, 800, 800);
        coveringOverlay.endFill();
        simpleFogOfWar.getMaskContainer().children.shift(coveringOverlay);
        simpleFogOfWar.getFoWRenderer().render(simpleFogOfWar.getMaskContainer());
        document.body.appendChild(simpleFogOfWar.getFoWRenderer().view);
      });
    }

    return map.whenReady;
  }

  /* ====== private functions ====== */
  function unitSelectedSound() {
    sound.play('select');
  }
  function unitOrderSound() {
    sound.play('order');
  }
  function loadSounds() {
    sound.add( 'order', '/testAssets/sounds/confirm.wav', {
      volume: 0.50
    });
    sound.add( 'select', '/testAssets/sounds/what.wav', {
      volume: 0.5
    });
  }
}

/*---------------------
------- PRIVATE -------
---------------------*/
function objectOrderFailed(e) {
  alert('Issuing order failed. You should make this a proper test handle, not alert :P');
  // eslint-disable-next-line
  console.warn(e);
}
/* THESE GENERATE THE ACTUAL RANDOM MAP DATA */
function addBase_spriteLayerData(name, group, options) {
  options = options || {};
  const interactive = options.interactive || true;

  return {
    type: 'MapLayerParent',
    coord: { x: 0, y: 0 },
    name: name,
    group: group, // For quadTrees
    specials: [{
      interactive: interactive
    }],
    objectGroups: []
  };
}

function populateTerrainLayer(hexagonGrid, typeCount) {
  const layerData = addBase_spriteLayerData('terrainLayer', 'terrain');

  hexagonGrid.forEach(function (coordinates) {
    const x = coordinates.x;
    const y = coordinates.y;

    layerData.objectGroups.push({
      type: 'ObjectTerrain',
      name: 'Terrain', // For quadTrees and debugging
      typeImageData: 'terrainBase',
      objects: [{
        objType: Math.floor(Math.random() * typeCount),
        name:'random_' + Math.random(),
        _id: Math.random(),
        coord:{
          x: x,
          y: y
        },
        data: {},
        lastSeenTurn:Math.floor(Math.random() * 10)
      }]
    });
  });

  return layerData;
}

function populateUnitLayer(hexagonGrid, typeCount) {
  const layerData = addBase_spriteLayerData('unitLayer', 'unit');

  hexagonGrid.forEach(function (coordinates) {
    const x = coordinates.x;
    const y = coordinates.y;

    if (Math.random() > 0.6) {
      layerData.objectGroups.push({
        type: 'ObjectUnit',
        name: 'Unit', // For quadTrees and debugging
        typeImageData: 'unit',
        objects: [{
          objType: Math.floor(Math.random() * typeCount),
          name: 'random_' + Math.random(),
          _id: Math.random(),
          coord:{
            x: x,
            y: y
          },
          data: {
            FoW: ( Math.random() < 0.2 ) ? true : false,
            playerID: Math.floor(Math.random() * 10),
            hp: Math.floor(Math.random() * 100),
            someStuff: 'jalajajajajaja' + Math.random(),
            someStuff2: 'jalajajajajaja' + Math.random(),
            someStuff3: 'jalajajajajaja' + Math.random(),
            someStuff4: 'jalajajajajaja' + Math.random(),
            someStuff5: 'jalajajajajaja' + Math.random(),
            someStuff6: ('jalajajajajaja' + Math.random()).repeat(30)
          },
          lastSeenTurn:Math.floor(Math.random() * 10)
        }]
      });
    }
  });

  return layerData;
}

/* This function should really not be needed or if it really is, it should be elsewhere!
  * It iterates through all the x and y coordinates on this objects parent tree and adds them together. So practically it gets the global
  * coordinates
*/
function _getCorrectGlobalCoords(obj) {
  const coordinates = {
    x: obj.x,
    y: obj.y
  };

  if (obj.parent) {
    const parentCoords = _getCorrectGlobalCoords(obj.parent);
    coordinates.x += parentCoords.x;
    coordinates.y += parentCoords.y;
  }

  return coordinates;
}

function _createFoWParams() {
  /* ----------- FOW stuff ------------ */
  const fowTexture = new PIXI.Texture.from(FOW_IMAGE);
  const FoWFilter = function () {
    return new MapDataManipulator([{
      type: 'filter',
      object: MapDataManipulator.OBJECT_LAYER,
      property: 'name',
      value: 'unitLayer'
    },{
      type: 'filter',
      object: MapDataManipulator.OBJECT_OBJECT,
      property: ['data', 'activeData', 'FoW'],
      value: 'true'
    }])
  };
  function foWCallback(data) {
    const unitViewSprite = new PIXI.Sprite(fowTexture);

    unitViewSprite.anchor.set(data.anchor.x, data.anchor.y);
    //unitViewSprite.scale.set(data.scale, data.scale);
    unitViewSprite.position.set(data.x, data.y);

    return unitViewSprite;
  }

  return {
    cb: foWCallback,
    filter: FoWFilter
  };
  /* ----------- FOW stuff END------------ */
}

function _createHexagonParams() {
  return {
    pathWeight: (correctHexagon/* , selectedObject */) => {
      return +correctHexagon.data.typeData.movement;
    },
    getData: (object) => {
      return object.data.typeData;
    }
  };
}

function preloadGameAssets(...args) {
  const preload = new Preloader();

  preload.add(args);
  // eslint-disable-next-line no-console
  preload.onError.add(console.error);
  // eslint-disable-next-line no-console
  preload.onProgress.add(console.log);

  const loadingReadyPromise = new Promise((resolve, reject) => {
    preload.load();

    preload.onComplete.add(() => {
      resolve(true);
    });
    preload.onError.add(() => {
      reject(false);
    });    
  })

  return loadingReadyPromise;
}

function setupPerfTestLoop (map) {
  let direction = 1;
  let round = 0;
  const quantifier = 2;

  return function looper() {
    map.moveMap({
      x: direction === 1 ? -quantifier : quantifier,
      y: direction === 1 ? -quantifier : quantifier
    });

    if (map.getMapCoordinates().x > 500) {
      round += 1;
      direction = 1;
    } else if (map.getMapCoordinates().x < - 7000) {
      direction = 2;
    }

    if (round < 5) {
      window.setTimeout(looper);
    }
  };
}