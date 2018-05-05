import { setupHexagonClick } from './eventListeners/units';
import { hexagonMath } from './utils/';

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
const selectHexagonObject = (function() {
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

    this.mapInstance.hexagonIndexes = createHexagonDataStructure(() => this.mapInstance.allMapObjects.terrainLayer);

    startClickListener(this.mapInstance, params.isBlocked, params.getData);

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
  function startClickListener(mapInstance, isBlocked, getData) {
    return setupHexagonClick(mapInstance, isBlocked, getData);
  }
})();

function createHexagonDataStructure(getLayers) {
  const hexagonIndexes = {};
  const objArray = getLayers();
  let indexes;

  objArray.forEach(obj => {
    const correctCoords = obj.getMapCoordinates();

    indexes = hexagonMath.coordinatesToIndexes(correctCoords);

    hexagonIndexes[indexes.x] = hexagonIndexes[indexes.x] || {};
    hexagonIndexes[indexes.x][indexes.y] = obj;
  })

  return hexagonIndexes;
}

/*-----------------------
---------- API ----------
-----------------------*/
const _tests = {
  createHexagonDataStructure
};
export {
  selectHexagonObject,
  _tests
};
