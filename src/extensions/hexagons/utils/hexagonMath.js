import { mapLog } from '../../../core/';

/*-----------------------
------- VARIABLES -------
-----------------------*/
let globalRadius, globalStartingPoint, globalOrientation;

/**
 * Utility module, for making different calculations and tests when hexagon based grid map in use
 *
 * @namespace flatworld.extensions.hexagons
 * @class utils
 */
/*-----------------------
--------- PUBLIC --------
-----------------------*/
/**
 * Set hexagon radius
 *
 * @static
 * @method init
 * @param {Number} radius    The radius of the hexagon
 */
function init(radius, startingPoint = { x: 0, y: 0 }, { orientation = 'horizontal' } = {}) {
  if (!radius) {
    mapLog.error('You need to pass radius as a parameter');
  }

  globalRadius = radius;
  globalStartingPoint = startingPoint;
  globalOrientation = orientation;
}
/**
 * @method
 * @static
 * @method getHexagonPoints
 * @param {Float} radius      radius of the hexagon
 * @param {object} options    extra options, like generating horizontal hexagon points and
 * how many decimals to round
*/
function getHexagonPoints({ radius = globalRadius, orientation = globalOrientation } = {}) {
  const OFFSET = orientation === 'horizontal' ? 0.5 : 0;
  const CENTER = {
    x: radius,
    y: radius
  };
  const points = [];
  let angle = 2 * Math.PI / 6 * OFFSET;
  let x = CENTER.x * Math.cos(angle);
  let y = CENTER.y * Math.sin(angle);
  points.push({ x, y });

  for (let i = 1; i < 7; i++) {
    angle = 2 * Math.PI / 6 * (i + OFFSET);
    x = CENTER.x * Math.cos(angle);
    y = CENTER.y * Math.sin(angle);

    points.push({ x, y });
  }

  return points;
}
/**
 * Calculates the hexagons:
 * innerDiameter
 * - Vertical / Flat hexagons height
 * - Horizontal / pointy hexagons width
 *
 * @method calcShortDiagonal
 * @static
 * @param {Object} {}               *OPTIONAL*
 * @param {float} {}.radius         Usually the radius of the hexagon
 * @param {string} {}.type          If you provide something else than radius, where the calculation is based from
 */
function calcShortDiagonal({ radius = globalRadius, floorNumbers = true } = {}) {
  let answer = radius * Math.sqrt(3);
  answer = floorNumbers ? Math.floor(answer) : answer;

  return answer;
}
/** Calculates the hexagons:
 * outerDiameter
 * - Vertical / Flat hexagons width
 * - Horizontal / pointy hexagons height
 *
 * @method calcLongDiagonal
 * @static
 * @param {Object} {}                 *OPTIONAL*
 * @param {float} {}.radius           Usually the radius of the hexagon
 * @param {string} {}.type            If you provide something else than radius, where the calculation is based from
 */
function calcLongDiagonal({ radius = globalRadius, floorNumbers = true } = {}) {
  let answer = radius * 2;
  answer = floorNumbers ? Math.floor(answer) : answer;

  return answer;
}
/** Calculates the hexagons distance between each other in y-coordinate, when orientation is horizontal
 *
 * @method calcSpecialDistance
 * @static
 * @param {Object} {}                   *OPTIONAL*
 * @param {float} {}.radius             Usually the radius of the hexagon
 */
function calcSpecialDistance({ radius = globalRadius } = {}) {
  return calcLongDiagonal(radius) - radius / 2;
}
/**
 * Test do the given coordinates hit the hexagon, given by the points container / array
 *
 * @static
 * @method hexaHitTest
 * @param  {PIXI.Point[]} points             Array of PIXI.points
 * @param  {Object} hitCoords         The coordinates to test against
 * @param  {Integer} hitCoords.x      X coordinate
 * @param  {Integer} hitCoords.y      Y coordinate
 * @param  {Object} offsetCoords      *OPTIONAL* offsetCoordinates that are added to the hitCoordinates.
 * Separate because these are outside the
 * given array.
 * @param  {Integer} offsetCoords.x   X coordinate
 * @param  {Integer} offsetCoords.y   Y coordinate
 * @return {Boolean}                  Is the coordinate inside the hexagon or not
 */

function hexaHitTest(points, hitCoords, offsetCoords = { x: 0, y: 0 }) {
  const realPolygonPoints = points.map(point => {
    return {
      x: point.x + offsetCoords.x,
      y: point.y + offsetCoords.y
    };
  });

  return _pointInPolygon(hitCoords, realPolygonPoints);
}
/**
 * Create Array that holds the coordinates for the size of hexagon grid we want to create.
 *
 * @method createHexagonGridCoordinates
 * @static
 * @param {Object} gridSize
 * @param {Object} gridSize.rows      The count of rows in the hexagon grid
 * @param {Object} gridSize.columns   The count of columns in the hexagon grid
 * @param {Object} {}                 *OPTIONAL* configurations in an object
 * @param {Number} {}.radius          The radius of hexagon. Basically the radius of the outer edges / circle of the hexagon.
 * @param {String} {}.orientation     Is it horizontal or vertical hexagon grid. Default: horizontal
 * @return {[]}                       Array that holds the coordinates for the hexagon grid, like [{x: ?, y: ?}]
 */
function createHexagonGridCoordinates(gridSize, { radius = globalRadius, orientation = globalOrientation } = {}) {
  const { rows, columns } = gridSize;
  const gridArray = [];
  const shortDistance = calcShortDiagonal(radius);
  const longDistance = calcLongDiagonal(radius) - radius / 2;
  /* We set the distances of hexagons / hexagon rows and columns, depending are we building horizontal or vertical hexagon grid. */
  const rowHeight = orientation === 'horizontal' ? longDistance : shortDistance;
  const columnWidth = orientation === 'horizontal' ? shortDistance : longDistance;

  for (let row = 0; rows > row; row++) {
    for (let column = 0; columns > column; column++) {
      /* Se the coordinates for each hexagons upper-left corner on the grid */
      gridArray.push({
        x: Math.round((column * columnWidth) +
          (orientation === 'horizontal' && (row === 0 || row % 2 === 0) ? 0 : -shortDistance / 2)),
        y: row * rowHeight
      });
    }
  }

  return gridArray;
}
/**
 * This converts pixel-based coordinates to hexagon indexes. Uses axial coordinate system
 * (http://www.redblobgames.com/grids/hexagons/)
 * @param  {Object} coordinates           Coordinates with x and y
 * @param  {Object} options.startingPoint Starting point coordinates with x and y
 * @return {Object}                       Index coordinates with x and y
 */
function coordinatesToIndexes(coordinates, { startingPoint = globalStartingPoint } = {}) {
  const indexes = {
    x: Math.floor((coordinates.x - startingPoint.x) / calcShortDiagonal()),
    y: Math.floor((coordinates.y - startingPoint.y) / calcSpecialDistance())
  };

  indexes.x -= Math.floor(coordinates.y / (calcSpecialDistance() * 2));

  return indexes;
}
/**
 * This converts hexagon indexes to pixel-based coordinates. Uses axial coordinate system
 * (http://www.redblobgames.com/grids/hexagons/)
 * @param  {Object} indexes               Coordinates with x and y
 * @param  {Object} options.startingPoint Starting point coordinates with x and y
 * @return {Object}                       Pixel coordinates with x and y
 */
function indexesToCoordinates(indexes, { startingPoint = globalStartingPoint } = {}) {
  const coordinates = {
    x: Math.floor((indexes.x * calcShortDiagonal()) + startingPoint.x),
    y: Math.floor((indexes.y * calcSpecialDistance()) + startingPoint.y)
  };

  coordinates.x += Math.floor(indexes.y * (calcShortDiagonal() / 2));

  return coordinates;
}

/*-----------------------
--------- PRIVATE -------
-----------------------*/
/**
 * credits to: https://github.com/substack/point-in-polygon
 * Tests whether the given point / coordinate is inside the given points. Assuming the points form a polygon
 *
 * @static
 * @private
 * @method _pointInPolygon
 * @param  {Object} point             The coordinates to test against
 * @param  {Integer} hitCoords.x      X coordinate
 * @param  {Integer} hitCoords.y      Y coordinate
 * @param  {Integer[]} vs             The points of the polygon to test [0] === x-point, [1] === y-point
 * @return {Boolean}                  Is the coordinate inside the hexagon or not
 */
function _pointInPolygon(point, vs) {
  const x = point.x;
  const y = point.y;
  let inside = false;
  let xi, xj, yi, yj, intersect;

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    xi = vs[i].x;
    yi = vs[i].y;
    xj = vs[j].x;
    yj = vs[j].y;
    intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/*-----------------------
---------- API ----------
-----------------------*/
export {
  init,
  createHexagonGridCoordinates,
  getHexagonPoints,
  calcShortDiagonal,
  calcLongDiagonal,
  calcSpecialDistance,
  hexaHitTest,
  coordinatesToIndexes,
  indexesToCoordinates,
};
