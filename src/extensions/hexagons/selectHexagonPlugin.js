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
    if (!params.pathWeight || typeof params.pathWeight !== 'function') {
      throw new Error('hexagon pathFinding plugin requires parameter-object with pathWeight-property that is a callback')
    }

    this.mapInstance.hexagonIndexes = createHexagonDataStructure(() => this.mapInstance.allMapObjects.terrainLayer);

    setupHexagonClick(this.mapInstance, params.pathWeight, params.getData);

    return Promise.resolve();
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
