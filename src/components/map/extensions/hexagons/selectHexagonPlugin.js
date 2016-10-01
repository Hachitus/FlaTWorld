(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  const { setupHexagonClick, utils } = window.flatworld.extensions.hexagons;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.extensions.hexagons.selectHexagonObject = setupObject_select_hexagon();
  window.flatworld.extensions.hexagons._tests.createHexagonDataStructure = createHexagonDataStructure;

  /*-----------------------
  -------- PUBLIC ---------
  -----------------------*/
  /**
   * Handles the selection of hexagons on the map
   *
   * @namespace flatworld.extensions.hexagons
   * @class selectHexagonObject
   * @return {Object}       Return methods inside object
   */
  function setupObject_select_hexagon() {
    var map = {};

    return {
      init,
      pluginName: 'selectHexagonObject',
    };

    /**
     * @method  init
     * @param {Map} givenMap         Instantiated Map class object
     */
    function init(givenMap) {
      map = givenMap;

      map.hexagonIndexes = createHexagonDataStructure(map.getMovableLayer(), map.allMapObjects.terrainLayer);

      startClickListener(map);
    }

    /*-----------------------
    -------- PRIVATE --------
    -----------------------*/
    /**
     * @private
     * @method startClickListener
     * @param {Map} map              Instantiated Map class object
     */
    function startClickListener(map) {
      return setupHexagonClick(map);
    }
  }

  function createHexagonDataStructure(movableLayer, objArray) {
    const hexagonIndexes = {};
    let indexes;

    objArray.forEach(obj => {
      let correctCoords = obj.getMapCoordinates();
      correctCoords.x += obj.getCenterCoordinates().x;
      correctCoords.y += obj.getCenterCoordinates().y;

      indexes = utils.coordinatesToIndexes(correctCoords);

      hexagonIndexes[indexes.x] = hexagonIndexes[indexes.x] || {};
      hexagonIndexes[indexes.x][indexes.y] = obj;
    })

    return hexagonIndexes;
  }
})();
