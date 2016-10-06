/* POLYFILL (es6StringPolyfill)  IS NEEDED FOR IE11, maybe Symbol support or something missing:
 * http://babeljs.io/docs/usage/polyfill/
 * */

(function () {
  /***********************
  ******** IMPORT ********
  ***********************/
  var polyfills = window.flatworld.generalUtils.polyfills;
  var factories = window.flatworld.factories;
  var Preload = window.flatworld.Preload;
  var baseEventlisteners = window.flatworld.extensions.baseEventlisteners;
  var mapZoom = window.flatworld.extensions.mapZoom;
  var mapDrag = window.flatworld.extensions.mapDrag;
  var hexagons = window.flatworld.extensions.hexagons;
  var mapMovement = window.flatworld.extensions.mapMovement;
  var simpleFogOfWar = window.flatworld.extensions.fogOfWars.simpleFogOfWar;
  var pixelizedMinimap = window.flatworld.extensions.minimaps.pixelizedMinimap;
  var hexaUtils = window.flatworld.extensions.hexagons.utils;
  var Sound = window.flatworld.Sound;
  var mapEvents = window.flatworld.mapEvents;
  var mapAPI = window.flatworld.mapAPI;
  var UI = window.flatworld.UI;
  var MapDataManipulator = window.flatworld.MapDataManipulator;
  /* DATA FILES used for testing */
  var gameData = window.gameData;
  var typeData = window.typeData;
  var graphicData = window.graphicData;

  /** ===== CONFIGS ===== */
  /* Note the y is 3/4 of the actual height */
  var HEXAGON_RADIUS = gameData.hexagonRadius;
  var BASE_URL = '/requests/';
  var X_PADDING = 20;
  const Y_PADDING = 20;
  const FOW_IMAGE = '/testAssets/images/FoW/hexagonFoW.png';

  var minimapCheckbox = document.getElementById('minimap');
  var fowCheckbox = document.getElementById('fow');
  var minimapCanvas;
  var graphicsTheme;
  var layerCount;

  /* REQUIRED FOR IE11 */
  polyfills.arrayFind();
  polyfills.es6String();
  hexagons.utils.init(HEXAGON_RADIUS);
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
  (function () {
    window.FPSElement = document.createElement('div');
    window.FPSElement.style.position = 'absolute';
    window.FPSElement.style.left = '0px';
    window.FPSElement.style.top = '0px';
    window.FPSElement.style.backgroundColor = 'white';

    document.body.appendChild( window.FPSElement );

    var mapsizeElement = document.getElementById('hexaTiles');
    var UIThemeIndex = document.getElementById('UItheme').value;
    var minimapCanvas;
    var currentMapSize, mapData;

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
        UITheme: window.flatworld.UIs[UIThemeIndex],
        mapCanvas: document.getElementById('mapCanvas'),
        automatic: window.automaticTest,
        minimapCanvas: document.getElementById('minimapCanvas'),
        trackFPSCB: function (data) {
          var totalFPS = data.FPS;
          var totalTime = data.FPStime;
          var totalRenderTime = data.renderTime;
          var drawCount = data.drawCount;

          window.FPSElement.innerHTML = totalFPS + ' - ' + Math.round( ( totalRenderTime / totalTime * 100 ) ) + '%' + ' : ' + drawCount;
        }
      });
    });
  })();

  /**************************************
  ****** GENERATE RANDOM MAP DATA *******
  **************************************/
  function getMapData(mapsize) {
    var TERRAIN_TYPE_COUNT = 7;
    var UNIT_TYPE_COUNT = 56;
    var coordMapsize = {
      x: mapsize,
      y: mapsize
    };
    var gridSize = {
      rows: Math.floor(coordMapsize.x / hexagons.utils.calcShortDiagonal()),
      columns: Math.floor(coordMapsize.y / hexagons.utils.calcLongDiagonal())
    };
    var gridSizeHalf = {
      rows: Math.floor(gridSize.rows / 2),
      columns: Math.floor(gridSize.columns / 2)
    };
    var hexagonGridCoordinates = {
      terrains: hexagons.utils.createHexagonGridCoordinates(gridSize),
      units: hexagons.utils.createHexagonGridCoordinates(gridSize),
      units2: hexagons.utils.createHexagonGridCoordinates(gridSizeHalf)
    };
    var returnable = {
      gameID: '53837d47976fed3b24000005',
      turn: 1,
      startPoint: { x: 0, y: 0 },
      element: '#mapCanvas',
      layers: []
    };
    var terrainLayer, terrainLayer2, unitLayer, unitLayer2;

    terrainLayer = populateTerrainLayer(hexagonGridCoordinates.terrains, TERRAIN_TYPE_COUNT);
    terrainLayer2 = populateTerrainLayer(hexagonGridCoordinates.terrains, TERRAIN_TYPE_COUNT);
    unitLayer = populateUnitLayer(hexagonGridCoordinates.units, UNIT_TYPE_COUNT)
    unitLayer2 = populateUnitLayer(hexagonGridCoordinates.units2, UNIT_TYPE_COUNT)    

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

  function initFlatworld(mapData, options) {
    var mapsize = options.mapsize;
    var mapCanvas = options.mapCanvas;
    var trackFPSCB = options.trackFPSCB;
    var UITheme = options.UITheme;
    var automatic = options.automatic;
    var map = {};
    var globalMap = {
      data: {}
    };
    var minimapSize = { x: 0, y: 0, width: 200, height: 200 };
    var pluginsToActivate = [{
        plugin: baseEventlisteners
      }, {
        plugin: mapZoom,
      }, {
        plugin: mapDrag,
      }, {
        plugin: hexagons.selectHexagonObject,
        parameters: _createHexagonParams(globalMap)
      }, {
        plugin: mapMovement
      }
    ];
    var sound = new Sound();
    var preload;

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
    hexagons.utils.init(gameData.hexagonRadius);
    activateAPIs();

    /* Determines how much stuff we show on screen for stress testing */
    // If either is even 1 pixel bigger than this, gets all black
    /* works with:
    x: 8118,
    y: 8107*/
    gameData.mapSize = {
      x: mapsize || 1000,
      y: mapsize || 1000
    };

    preload = new Preload( '', { crossOrigin: false } );
    preload.addResource( graphicData[graphicsTheme].terrainBase.json );
    preload.addResource( graphicData[graphicsTheme].unit.json );
    preload.addResource( FOW_IMAGE );
    loadSounds();
    mapEvents.subscribe('objectsSelected', unitSelectedSound);

    preload.setErrorHandler(function(e) {
      console.log('preloader error:', e);
    });
    preload.setProgressHandler(function(progress) {
      console.log('progressing' + progress);
    });

    return preload.resolveOnComplete()
      .then(onComplete)
      .then(function (map) {
        return map.whenReady;
      }).then(function () {
        document.getElementById('testFullscreen').addEventListener('click', map.toggleFullScreen);

        var perfTestLoop = setupPerfTestLoop();

        if (automatic) {
          map.whenReady().then(function() {
            window.setTimeout(perfTestLoop);
          }).then(null, function(e) {
            console.log(e);
          });
        }

        function setupPerfTestLoop () {
          var direction = 1;
          var round = 0;
          var quantifier = 2;

          return function() {
            map.moveMap({
              x: direction === 1 ? -quantifier : quantifier,
              y: direction === 1 ? -quantifier : quantifier
            });

            if (map.getMovableLayer().x > 500) {
              round ++;
              direction = 1;
            } else if (map.getMovableLayer().x < - 7000) {
              direction = 2;
            }

            if (round < 5) {
              window.setTimeout(perfTestLoop);
            }
          };
        }
      })
      .catch(function (e) {
        console.log('Map stressTest error: ', e);
      });

    function onComplete(loader, resources) {
      window.worldMap = map = globalMap.data = factories.hexaFactory(
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

      var dialog_selection = document.getElementById('selectionDialog');
      var initializedUITheme = new UITheme.init(dialog_selection, map, { elements: {
          select: '#dialog_select'
        }});
      UI(initializedUITheme, map);

      map.init( pluginsToActivate, mapData.startPoint );

      var minimapUIImage = new PIXI.Sprite();
      var pixelRatio = minimapSize.width / map.getMapsize().x * hexaUtils.calcLongDiagonal();
      var staticCB = function (obj) {
        var size = pixelRatio;
        var minimapColor = obj.minimapColor;
        var minimapShape, globalPoints;

        /* We must divide the pixelRatio with two. Since this is the hexagons radius. Which means the hexagon is actually twice the given
         * radius in width and height.
         */
        if (obj.type === 'unit') {
          minimapColor = 0x55FF55;
          size = size / 2;
        }
        minimapShape = obj.minimapShape || hexagons.utils.createVisibleHexagon(size / 2, { color: minimapColor });
        globalPoints = _getCorrectGlobalCoords(obj);

        minimapShape.x = Math.floor(pixelRatio * globalPoints.x / hexaUtils.calcShortDiagonal());
        minimapShape.y = Math.floor(pixelRatio * globalPoints.y / hexaUtils.calcLongDiagonal());

        return minimapShape;
      };
      var dynamicCB = function (obj) {
        var minimapColor = obj.minimapColor;
        var size = pixelRatio;
        var minimapShape, globalPoints;

        if (obj.type === 'unit') {
          minimapColor = 0x55FF55;
          size = size / 2;
        }
        minimapShape = obj.minimapShape || hexagons.utils.createVisibleHexagon(size / 2, { color: obj.minimapColor });
        globalPoints = obj.toGlobal(new PIXI.Point(obj.x,obj.y));

        var indexes = new PIXI.Point(hexaUtils.coordinatesToIndexes(globalPoints));
        minimapShape.x = Math.floor(pixelRatio * indexes.x);
        minimapShape.y = Math.floor(pixelRatio * indexes.y);

        return minimapShape;
      };
      var coordinateConverterCB = function (globalCoordinates, toMinimap) {
        var minimapLayer = map.getMinimapLayer();
        var minimapCoordinates = new PIXI.Point( globalCoordinates.x, globalCoordinates.y);

        if (toMinimap) {
          return minimapCoordinates;
        } else {
          var minimapCoords = {
            x: -minimapCoordinates.x / minimapSize.width * map.getMapsize().x,
            y: -minimapCoordinates.y / minimapSize.height * map.getMapsize().y
          };

          return minimapCoords;
        }
      };

      var minimapViewport = new PIXI.Graphics();
      var viewportArea = map.getViewportArea();
      var minimapViewportSize = {
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
        map.setFullScreen();
      });

      var showFowCanvas = document.getElementById('showFowCanvas');
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

      return map;
    }

    /* ====== private functions ====== */
    function preloadErrorHandler(err) {
      console.log('PRELOADER ERROR', err );
    }
    function unitSelectedSound() {
      sound.play('cheer');
    }
    function loadSounds() {
      sound.add( 'cheer', '/testAssets/sounds/personCheering.mp3' );
    }
  }

  /*---------------------
  ------- PRIVATE -------
  ---------------------*/
  /* THESE GENERATE THE ACTUAL RANDOM MAP DATA */
  function addBase_spriteLayerData(name, group, options) {
    options = options || {};
    var interactive = options.interactive || true;

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
    var layerData = addBase_spriteLayerData('terrainLayer', 'terrain');

    hexagonGrid.forEach(function (coordinates) {
      var x = coordinates.x;
      var y = coordinates.y;

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
    var layerData = addBase_spriteLayerData('unitLayer', 'unit');

    hexagonGrid.forEach(function (coordinates) {
      var x = coordinates.x;
      var y = coordinates.y;

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

  function activateAPIs() {
    mapAPI.add(
      'objectMove',
      function (type, data, movementData) {
        if (type === 'get') {
          return {
            url: data.baseUrl + movementData.id
          };
        } else {
          return {
            url: data.baseUrl + movementData.id,
            body: JSON.stringify(movementData)
          };
        }
      },
      BASE_URL
    );
  }

  /* This function should really not be needed or if it really is, it should be elsewhere!
   * It iterates through all the x and y coordinates on this objects parent tree and adds them together. So practically it gets the global
   * coordinates
  */
  function _getCorrectGlobalCoords(obj) {
    var coordinates = {
      x: obj.x,
      y: obj.y
    };

    if (obj.parent) {
      var parentCoords = _getCorrectGlobalCoords(obj.parent);
      coordinates.x += parentCoords.x;
      coordinates.y += parentCoords.y;
    }

    return coordinates;
  }

  function _createFoWParams() {
    /* ----------- FOW stuff ------------ */
    var fowTexture = new PIXI.Texture.fromImage(FOW_IMAGE);
    const FoWFilter = () => new MapDataManipulator([{
        type: 'filter',
        object: MapDataManipulator.OBJECT_LAYER,
        property: 'name',
        value: 'unitLayer'
      },{
        type: 'filter',
        object: MapDataManipulator.OBJECT_OBJECT,
        property: ['data', 'activeData', 'FoW'],
        value: 'true'
      }]);
    function foWCallback(data) {
      const unitViewSprite = new PIXI.Sprite(fowTexture);

      unitViewSprite.anchor.set(data.anchor.x, data.anchor.y);
      //unitViewSprite.scale.set(data.scale, data.scale);
      unitViewSprite.position.set(data.x, data.y);

      return unitViewSprite;
    }

    return { cb: foWCallback, filter: FoWFilter };
    /* ----------- FOW stuff END------------ */
  }

  function _createHexagonParams(map) {
    return { isBlocked: (correctHexagon, selectedObject) => correctHexagon.data.typeData.movement };
  }

})();