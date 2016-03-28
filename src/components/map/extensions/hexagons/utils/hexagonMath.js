(function () {
  'use strict';

  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var mapLog = window.flatworld.log;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.extensions.hexagons.utils.init = init;
  window.flatworld.extensions.hexagons.utils.createHexagonGridCoordinates = createHexagonGridCoordinates;
  window.flatworld.extensions.hexagons.utils.getHexagonPoints = getHexagonPoints;
  window.flatworld.extensions.hexagons.utils.calcShortDiagonal = calcShortDiagonal;
  window.flatworld.extensions.hexagons.utils.calcLongDiagonal = calcLongDiagonal;
  window.flatworld.extensions.hexagons.utils.hexaHitTest = hexaHitTest;
  window.flatworld.extensions.hexagons.utils.getClosestHexagonCenter = getClosestHexagonCenter;


  /*-----------------------
  ------- VARIABLES -------
  -----------------------*/
  var globalRadius, globalStartingPoint, globalOrientation;

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
   * @method setRadius
   * @param {Number} radius    The radius of the hexagon
   */
  function init(radius, startingPoint = { x: 0, y: 0}, { orientation = "horizontal" } = {}) {
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
  function getHexagonPoints({ radius = globalRadius, orientation = "horizontal" } = {}) {
    if (!radius) {
      mapLog.error("You need to define at least globalRadius for the hexagonMath utils class");
    }
    const OFFSET = orientation === "horizontal" ? 0.5 : 0;
    const CENTER = {
      x: radius,
      y: radius
    };
    var angle = 2 * Math.PI / 6 * OFFSET;
    var x = CENTER.x * Math.cos(angle);
    var y = CENTER.y * Math.sin(angle);
    var points = [];

    points.push({x, y});

    for (let i = 1; i < 7; i++) {
      angle = 2 * Math.PI / 6 * (i + OFFSET);
      x = CENTER.x * Math.cos(angle);
      y = CENTER.y * Math.sin(angle);

      points.push({x, y});
    }

    return points;
  }
  /**
   * Calculates the hexagons:
   * innerDiameter
   * - Vertical / Flat hexagons height
   * - Horizontal / pointy hexagons width
   *
   * @method calcLongDiagonal
   * @static
   * @param {Object} {}               *OPTIONAL*
   * @param {float} {}.radius         Usually the radius of the hexagon
   * @param {string} {}.type          If you provide something else than radius, where the calculation is based from
   */
  function calcShortDiagonal({ radius = globalRadius, floorNumbers = true } = {}) {
    var answer;

    answer = radius * Math.sqrt(3);
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
    var answer;

    answer = radius * 2;
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

  function hexaHitTest(points, hitCoords, offsetCoords = {x:0, y:0}) {
    var realPolygonPoints;

    realPolygonPoints = points.map(point => {
      return {
        x: point.x + offsetCoords.x,
        y: point.y + offsetCoords.y
      };
    });

    return pointInPolygon(hitCoords, realPolygonPoints);
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
  function createHexagonGridCoordinates(gridSize, { radius = globalRadius, orientation = "horizontal" } = {}) {
    const { rows, columns } = gridSize;
    var gridArray = [];
    var shortDistance = calcShortDiagonal(radius);
    var longDistance = calcLongDiagonal(radius) - radius / 2;
    var rowHeight, columnWidth;

    /* We set the distances of hexagons / hexagon rows and columns, depending are we building horizontal or vertical hexagon grid. */
    rowHeight = orientation === "horizontal" ? longDistance : shortDistance;
    columnWidth = orientation === "horizontal" ? shortDistance : longDistance;

    for (let row = 0; rows > row; row++) {
      for (let column = 0; columns > column; column++) {
        /* Se the coordinates for each hexagons upper-left corner on the grid */
        gridArray.push({
          x: Math.round(( column * columnWidth ) +
            ( orientation === "horizontal" && ( row === 0 || row % 2 === 0 ) ? 0 : -shortDistance / 2) ),
          y: row * rowHeight
        });
      }
    }

    return gridArray;
  }
  /**
   * Calculates the closest hexagon center coordinates, for the given coordinates. So aligning the given coordinates to proper hexagon
   * coordinates
   *
   * @static
   * @method getClosestHexagonCenter
   * @requires setRadius has to be set
   * @param {Object} coordinates              The coordinate where we want to find the closest hexagon center point
   */
  function getClosestHexagonCenter(coordinates) {
    var radius = globalRadius;
    var closestHexagonCenter;

    if (!globalOrientation || !radius || !globalStartingPoint) {
      throw new Error("getClosestHexagonCenter requirements not filled");
    }

    if (globalOrientation === "horizontal") {
      closestHexagonCenter = {
        x: Math.round( coordinates.x -
              ( coordinates.x % calcShortDiagonal(radius) ) +
              calcShortDiagonal(radius) / 2 + globalStartingPoint.x ),
        y: Math.round( coordinates.y -
              ( coordinates.y % calcSpecialDistance(radius) ) +
              calcLongDiagonal(radius) / 2 + globalStartingPoint.y )
      };
    } else {
      closestHexagonCenter = {
        x: Math.floor( coordinates.x - ( coordinates.x % calcSpecialDistance(radius) ) + globalStartingPoint.x ),
        y: Math.floor( coordinates.y - ( coordinates.y % calcShortDiagonal(radius) ) + globalStartingPoint.y )
      };
    }

    return closestHexagonCenter;
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
   * @method pointInPolygon
   * @param  {Object} point             The coordinates to test against
   * @param  {Integer} hitCoords.x      X coordinate
   * @param  {Integer} hitCoords.y      Y coordinate
   * @param  {Integer[]} vs             The points of the polygon to test [0] === x-point, [1] === y-point
   * @return {Boolean}                  Is the coordinate inside the hexagon or not
   */
  function pointInPolygon(point, vs) {
    var x = point.x;
    var y = point.y;
    var inside = false;
    var xi, xj, yi, yj, intersect;

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
})();