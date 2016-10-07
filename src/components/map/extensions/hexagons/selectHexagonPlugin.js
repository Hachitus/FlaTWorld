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
    return {
      init,
      pluginName: 'selectHexagonObject'
    };

    /**
     * @method  init
     * @param {Map} givenMap                  Instantiated Map class object
     * @param {Object} protectedProperties    Holds all the non-public properties to use
     * @param {Array} params                  Rest of the parameters
     */
    function init(params) {
      if (!params.isBlocked) {
        throw new Error('hexagon pathFinding plugin requires cb and filter properties')
      }

      this.mapInstance.hexagonIndexes = createHexagonDataStructure(this.mapInstance.getMovableLayer(), () => this.mapInstance.allMapObjects.terrainLayer);

      startClickListener(this.mapInstance, params.isBlocked);

      return Promise.resolve();
    }

    /*-----------------------
    -------- PRIVATE --------
    -----------------------*/
    /**
     * @private
     * @method startClickListener
     * @param {Map} map              Instantiated Map class object
     */
    function startClickListener(mapInstance, isBlocked) {
      return setupHexagonClick(mapInstance, isBlocked);
    }
  }

  function createHexagonDataStructure(movableLayer, getLayers) {
    const hexagonIndexes = {};
    const objArray = getLayers();
    let indexes;

    objArray.forEach(obj => {
      let correctCoords = obj.getMapCoordinates();

      indexes = utils.coordinatesToIndexes(correctCoords);

      hexagonIndexes[indexes.x] = hexagonIndexes[indexes.x] || {};
      hexagonIndexes[indexes.x][indexes.y] = obj;
    })

    return hexagonIndexes;
  }
})();
