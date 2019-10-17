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
const selectHexagonObject = {
  pluginName: 'selectHexagonObject',
  init,
}

/**
 * @method  init
 * @param {Map} givenMap                  Instantiated Map class object
 * @param {Object} protectedProperties    Holds all the non-public properties to use
 * @param {Array} params                  Rest of the parameters. Like pathWeight (function), getTerrainLayerName(() => string),
 * getData(function)
 */
function init(params) {
  if (!params.pathWeight || typeof params.pathWeight !== 'function') {
    const error = new Error(`Hexagon plugin requires parameters property! This parameter must have "pathWeight"-property
      that is a callback, which returns the weight of the path for path finder. So it must be callback that return
      integer`, params);
    throw error;
  }

  this.mapInstance.hexagonIndexes = createHexagonDataStructure(() => this.mapInstance.allMapObjects[params.getTerrainLayerName()]);

  setupHexagonClick(this.mapInstance, params.pathWeight, params.getData);

  return Promise.resolve();
}

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
