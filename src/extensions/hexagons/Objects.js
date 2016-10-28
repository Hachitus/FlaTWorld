import * as PIXI from 'pixi.js';
import { objects } from '../../core/index';
import {  hexagonMath, createHexagon } from './utils/';
const { ObjectSpriteTerrain, ObjectSpriteUnit } = objects;

/*-----------------------
-------- VARIABLES ------
-----------------------*/
let shape;

class ObjectHexaTerrain extends ObjectSpriteTerrain {
  /**
   * Terrain tile like desert or mountain, non-movable and cacheable. Normally, but not necessarily, these are inherited, depending on
   * the map type. For example you might want to add some click area for these
   *
   * @namespace flatworld.extensions.hexagons
   * @class ObjectHexaTerrain
   * @constructor
   * @param  {Object} coords
   * @param  {Integer} coords.x         X coordinate
   * @param  {Integer} coords.y         Y coordinate
   * @param {object} data               This units custom data
   * @param {Object} options            options.radius REQUIRED.
   * @param {Number} options.radius     REQUIRED. This is the radius of the game maps hexagon.
   */
  constructor(texture, coords = { x: 0, y: 0 }, { data, radius, minimapColor, minimapShape } = {}) {
    super(texture, coords, { data });

    this.name = 'DefaultTerrainObject_hexa';
    this.minimapColor = minimapColor;
    this.minimapShape = minimapShape;
    calculateHexa.call(this, radius);
  }
  /**
   * Overwrite super method
   * @method calculateHexa
   * @return {[type]} [description]
   */
  getCenterCoordinates() {
    if (!this.coordinates.center) {
      this.coordinates.center = {
        x: this.WIDTH / 2,
        y: this.HEIGHT / 2
      };
    }

    return this.coordinates.center;
  }
}

class ObjectHexaUnit extends ObjectSpriteUnit {
  /**
   * Map unit like infantry or worker, usually something with actions or movable. Usually these are extended, depending on the map type.
   * For example you might want to add some click area for these (e.g. hexagon)
   *
   * @class ObjectHexaUnit
   * @constructor
   * @param {Object} coords            This units coordinates, relative to it's parent container
   * @param {Integer} coords.x         X coordinate
   * @param {Integer} coords.y         Y coordinate
   * @param {object} data               This units custom data
   * @param {Object} options            options.radius REQUIRED
   * @param {Object} options.radius     REQUIRED. This is the radius of the game maps hexagon
   */
  constructor(texture, coords = { x: 0, y: 0 }, { data, radius, minimapColor, minimapShape } = {}) {
    super(texture, coords, { data });

    this.name = 'DefaultUnitObjects_hexa';
    this.minimapColor = minimapColor;
    this.minimapShape = minimapShape;
    this.static = false;

    calculateHexa.call(this, radius);
  }
  /**
   * Overwrite super method
   * @method calculateHexa
   * @return {[type]} [description]
   */
  getCenterCoordinates() {
    if (!this.coordinates.center) {
      this.coordinates.center = {
        x: this.WIDTH / 2,
        y: this.HEIGHT / 2
      };
    }

    return this.coordinates.center;
  }
}
/*-----------------------
--------- PRIVATE -------
-----------------------*/
/**
 * @private
 * @static
 * @method calculateHexa
 * @param {Number} radius       Hexagon radius
 */
function calculateHexa(radius) {
  if (!radius) {
    throw new Error('Need radius!');
  }

  const HEIGHT = Math.round(hexagonMath.calcLongDiagonal(radius));
  const WIDTH = Math.round(hexagonMath.calcShortDiagonal(radius));
  const SIDE = Math.round(radius);

  this.anchor.set(0.5, 0.5);
  this.areaHeight = this.HEIGHT = HEIGHT;
  this.areaWidth = this.WIDTH = WIDTH;
  this.SIDE = SIDE;
  this.ROW_HEIGHT = Math.round(HEIGHT * 0.75);

  /* Draw hexagon to test the hits with hitArea */
  this.hitArea = setAndGetShape(radius);
  this.hitTest = function (coords) {
    const localCoords = this.toLocal(new PIXI.Point(coords.x, coords.y));

    return bugFixedContains.call(this.hitArea, localCoords.x * this.scale.x, localCoords.y * this.scale.y);
  };
}
/**
 * @private
 * @static
 * @method setAndGetShape
 * @param {Number} radius       Hexagon radius
 */
function setAndGetShape(radius) {
  if (!shape) {
    shape = createHexagon.createHexagon(radius);
  }

  return shape;
}

/* THIS IS ONLY TEMPORARY FIX. The PIXIs own contains method had a bug introduced in v4.1.0 and
 * and that is the one npm retrieves, so I decided to add the old v4.0.0 version here as a
 * temporary fix. Can be removed after PIXI fixes it's bug. Githib ticket here:
 * https://github.com/pixijs/pixi.js/pull/3165
 */
function bugFixedContains (x, y)
{
  let inside = false;

  // use some raycasting to test hits
  // https://github.com/substack/point-in-polygon/blob/master/index.js
  const length = this.points.length / 2;

  for (let i = 0, j = length - 1; i < length; j = i++)
  {
    const xi = this.points[i * 2], yi = this.points[i * 2 + 1],
      xj = this.points[j * 2], yj = this.points[j * 2 + 1],
      intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect)
    {
      inside = !inside;
    }
  }

  return inside;
}

/*---------------------
--------- API ---------
----------------------*/
export {
  ObjectHexaTerrain,
  ObjectHexaUnit
};
