'use strict';

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
  var Sound = window.flatworld.Sound;
  var mapEvents = window.flatworld.mapEvents;
  var mapAPI = window.flatworld.mapAPI;
  var UI = window.flatworld.UI;
  /* DATA FILES used for testing */
  var gameData = window.gameData;
  var typeData = window.typeData;

  /** ===== CONFIGS ===== */
  /* Note the y is 3/4 of the actual height */
  var HEXAGON_RADIUS = gameData.hexagonRadius;
  var BASE_URL = "/requests/";

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
    window.FPSElement = document.createElement("div");
    window.FPSElement.style.position = 'absolute';
    window.FPSElement.style.left = '0px';
    window.FPSElement.style.top = '0px';
    window.FPSElement.style.backgroundColor = 'white';

    document.body.appendChild( window.FPSElement );

    var mapsizeElement = document.getElementById("hexaTiles");
    var cacheElement = document.getElementById("cache");
    var UIThemeIndex = document.getElementById("UItheme").value;
    var cacheMap = true;
    var currentMapSize, mapData;

    document.getElementById("testNotification").textContent = "START THE TESTS BY SELECTING VALUES BELOW AND CLICKING START!";
    document.getElementById("changeValues").disabled = false;

    document.getElementById("changeValues").addEventListener("click", function() {
      document.getElementById("testNotification").style.display = "none";
      currentMapSize = mapsizeElement.value;
      cacheMap = cacheElement.checked;

      mapData = getMapData(currentMapSize);

      initFlatworld(mapData, {
        mapsize: currentMapSize,
        cache: cacheMap,
        UITheme: window.flatworld.UIs[UIThemeIndex],
        canvasContainer: document.getElementById("mapCanvasContainer"),
        automatic: window.automaticTest,
        trackFPSCB: function (data) {
          var totalFPS = data.FPS;
          var totalTime = data.FPStime;
          var totalRenderTime = data.renderTime;
          var drawCount = data.drawCount;

          window.FPSElement.innerHTML = totalFPS + " - " + Math.round( ( totalRenderTime / totalTime * 100 ) ) + "%" + " : " + drawCount;
        }
      });
    });
  })();

  /**************************************
  ****** GENERATE RANDOM MAP DATA *******
  **************************************/
  function getMapData(mapsize) {
    var TERRAIN_TYPE_COUNT = 5;
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
    var terrainLayer, terrainLayer2;

    terrainLayer = populateTerrainLayer(hexagonGridCoordinates.terrains, TERRAIN_TYPE_COUNT);
    terrainLayer2 = populateTerrainLayer(hexagonGridCoordinates.terrains, TERRAIN_TYPE_COUNT);

    return {
      gameID: "53837d47976fed3b24000005",
      turn: 1,
      startPoint: { x: 0, y: 0 },
      element: "#mapCanvas",
      layers: [
      terrainLayer,
      terrainLayer2,
      populateUnitLayer(hexagonGridCoordinates.units, UNIT_TYPE_COUNT),
      populateUnitLayer(hexagonGridCoordinates.units2, UNIT_TYPE_COUNT)
      ]
    };
  }

  function initFlatworld(mapData, options) {
    var { mapsize, canvasContainer, trackFPSCB, UITheme, cache, automatic} = options;
    var map = {};
    var globalMap = {
      data: {}
    };
    var pluginsToActivate = [
      baseEventlisteners,
      mapZoom,
      mapDrag,
      hexagons.selectHexagonObject,
      mapMovement
    ];
    var sound = new Sound();
    var preload;

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

    preload = new Preload( "", { crossOrigin: false } );
    preload.addResource( typeData.graphicData.terrainBase.json );
    preload.addResource( typeData.graphicData.unit.json );
    loadSounds();
    mapEvents.subscribe("objectsSelected", unitSelectedSound);

    preload.setErrorHandler(function(e) {
      console.log("preloader error:", e);
    });
    preload.setProgressHandler(function(progress) {
      console.log("progressing" + progress);
    });

    return preload.resolveOnComplete()
      .then(onComplete)
      .then(function (map) {
        return map.whenReady;
      }).then(function () {
        document.getElementById("testFullscreen").addEventListener("click", map.toggleFullScreen);

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
        console.log("Map stressTest error: ", e);
      });

    function onComplete(loader, resources) {
      window.worldMap = map = globalMap.data = factories.hexaFactory(
        canvasContainer, {
          game: gameData,
          map: mapData,
          type: typeData
        },
        {
          trackFPSCB: trackFPSCB,
          isHiddenByDefault: true,
          cache: options.cache
        });

      var dialog_selection = document.getElementById("selectionDialog");
      var initializedUITheme = new UITheme.init(dialog_selection, map, { elements: {
          select: "#dialog_select"
        }});
      UI(initializedUITheme, map);

      map.init( pluginsToActivate, mapData.startPoint );

      /* Activate the fullscreen button: */
      document.getElementById("testFullscreen").addEventListener("click", function () {
        map.setFullScreen();
      });

      return map;
    }

    /* ====== private functions ====== */
    function preloadErrorHandler(err) {
      console.log("PRELOADER ERROR", err );
    }
    function unitSelectedSound() {
      sound.play("cheer");
    }
    function loadSounds() {
      sound.add( "cheer", "/tests/testAssets/sounds/personCheering.mp3" );
    }
  }

  /*---------------------
  ------- PRIVATE -------
  ---------------------*/
  /* THESE GENERATE THE ACTUAL RANDOM MAP DATA */
  function addBase_spriteLayerData(name, group, options) {
    options = options || {};
    var interactive = options.interactive || true;
    var cache = options.cache || true;

    return {
      type: "MapLayerParent",
      coord: { x: 0, y: 0 },
      name: name,
      group: group, // For quadTrees
      specials: [{
        interactive: interactive
      }],
      options: {
        cache: cache
      },
      objectGroups: []
    };
  }

  function populateTerrainLayer(hexagonGrid, typeCount) {
    var layerData = addBase_spriteLayerData("terrainLayer", "terrain");

    hexagonGrid.forEach(function (coordinates) {
      var { x, y } = coordinates;

      layerData.objectGroups.push({
        type: "ObjectTerrain",
        name: "Terrain", // For quadTrees and debugging
        typeImageData: "terrainBase",
        objects: [{
          objType: Math.floor(Math.random() * typeCount),
          name:"random_" + Math.random(),
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
    var layerData = addBase_spriteLayerData("unitLayer", "unit");

    hexagonGrid.forEach(function (coordinates) {
      var { x, y } = coordinates;

      layerData.objectGroups.push({
        type: "ObjectUnit",
        name: "Unit", // For quadTrees and debugging
        typeImageData: "unit",
        objects: [{
          objType: Math.floor(Math.random() * typeCount),
          name: "random_" + Math.random(),
          _id: Math.random(),
          coord:{
            x: x,
            y: y
          },
          data: {
            playerID: Math.floor(Math.random() * 10),
            hp: Math.floor(Math.random() * 100),
            someStuff: "jalajajajajaja" + Math.random(),
            someStuff2: "jalajajajajaja" + Math.random(),
            someStuff3: "jalajajajajaja" + Math.random(),
            someStuff4: "jalajajajajaja" + Math.random(),
            someStuff5: "jalajajajajaja" + Math.random(),
            someStuff6: ("jalajajajajaja" + Math.random()).repeat(30)
          },
          lastSeenTurn:Math.floor(Math.random() * 10)
        }]
      });
    });

    return layerData;
  }

  function activateAPIs() {
    mapAPI.add(
      "objectMove",
      function (type, data, movementData) {
        if (type === "get") {
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
})();