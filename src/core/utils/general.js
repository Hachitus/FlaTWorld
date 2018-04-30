/**
 * @class utils.general
 * @return {Object}      pixelEpsilonEquality
 */
const PIXEL_EPSILON = 0.01;

/**
 * @method pixelEpsilonEquality
 * @param  {Number} x
 * @param  {Number} y
 * @return {Boolean}
 */
export function pixelEpsilonEquality(x, y) {
  return (Math.abs(x) - Math.abs(y)) < PIXEL_EPSILON;
}

/**
 * Helper for creating required parameters
 *
 * @param {String} className Name of the function / class used
 * @param {String} paramName Name of the parameter that is required
 * @throws {Error}
 */
export function requireParameter(className, paramName) {
  throw new Error(`Function '${className}' requires parameter '${paramName}'`);
}

/**
 * Flattern 2 levels deep, 2-dimensional arrays. Credits: http://stackoverflow.com/a/15030117/1523545
 *
 * @method flatten2Levels
 * @param  {Array} arr        Array to flatten
 * @return {Array}            Flattened array
 */
export function flatten2Levels(arr) {
  return [].concat(...arr).filter(function(n){ return n != undefined }); // eslint-disable-line eqeqeq
}
/**
 * This function takes an array and slices it to proper chunks.
 *
 * @method chunkArray
 * @param {Array} array             The array to be chunked
 * @param {Integer} chunksize       size of the chunks
 * @return {Array}
 * from: http://stackoverflow.com/a/34847417/1523545
 */
export function chunkArray(array, chunkSize) {
  const result = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, chunkSize + i));
  }

  return result;
}

/*---------------------
--------- API ---------
----------------------*/
export default {
  pixelEpsilonEquality,
  requireParameter,
  flatten2Levels,
  chunkArray
};
