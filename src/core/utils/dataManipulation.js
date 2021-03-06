/*---------------------
-------- PUBLIC -------
----------------------*/
/**
 * These are utils for manipulating the data, that our classes and functions use.
 *
 * @class utils.dataManipulation
 * @return {Object}      mapObjectsToArray, flattenArrayBy1Level
 */

/**
 * Changes the data from e.g. getting objects from the map based on coordinate. The data is like this normally:
 * {
 *   units: [{
 *     {... the objects datas ...}
 *   }]
 * }
 * We change it to this:
 * [
 *   [{
 *     {... the objects datas ...}
 *   }]
 * ]
 *
 * @method mapObjectsToArray
 * @param  {Object} objects       Object that holds objects
 * @return {Array}                Returns the transformed array
 */
export function mapObjectsToArray(objects) {
  return Object.keys(objects).map(objGroup => {
    return objects[objGroup];
  });
}
/**
 * @method flattenArrayBy1Level
 * @param  {Array} objects
 */
export function flattenArrayBy1Level(objects) {
  const merged = [];

  return merged.concat.apply(merged, objects);
}

/*---------------------
--------- API ---------
----------------------*/
export default {
  mapObjectsToArray,
  flattenArrayBy1Level
};
