import * as PIXI from 'pixi.js';
import { objects } from '../../core/index';
import {  hexagonMath, createHexagon } from './utils/';
const { ObjectSpriteTerrain, ObjectSpriteUnit } = objects;

/*-----------------------
-------- VARIABLES ------
-----------------------*/
let shape;

export class ObjectHexaTerrain extends ObjectSpriteTerrain {
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
  constructor(texture, coords = { x: 0, y: 0 }, { data, radius, minimapColor, minimapShape, anchor = 0.5 }) {
    super(texture, coords, { data });

    this.name = 'DefaultTerrainObject_hexa';
    this.minimapColor = minimapColor;
    this.minimapShape = minimapShape;
    // Set graphics to center of the hexa
    this.anchor.set(anchor, anchor);

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
        x: this.HEXA_WIDTH / 2,
        y: this.HEXA_HEIGHT / 2
      };
    }

    return this.coordinates.center;
  }
}

export class ObjectHexaUnit extends ObjectSpriteUnit {
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
  constructor(texture, coords = { x: 0, y: 0 }, { data, radius, minimapColor, minimapShape, anchor = 0.5 }) {
    super(texture, coords, { data });

    this.name = 'DefaultUnitObjects_hexa';
    this.minimapColor = minimapColor;
    this.minimapShape = minimapShape;
    this.static = false;
    // Set graphics to center of the hexa
    this.anchor.set(anchor, anchor);

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
        x: this.HEXA_WIDTH / 2,
        y: this.HEXA_HEIGHT / 2
      };
    }

    return this.coordinates.center;
  }
}
/**
 * @static
 * @method calculateHexa
 * @param {Number} radius       Hexagon radius
 */
export function calculateHexa(radius) {
  if (!radius) {
    throw new Error('Need radius!');
  }

  const HEXA_HEIGHT = Math.round(hexagonMath.calcLongDiagonal(radius));
  const HEXA_WIDTH = Math.round(hexagonMath.calcShortDiagonal(radius));
  const SIDE = Math.round(radius);

  this.areaHeight = this.HEXA_HEIGHT = HEXA_HEIGHT;
  this.areaWidth = this.HEXA_WIDTH = HEXA_WIDTH;
  this.SIDE = SIDE;
  this.ROW_HEIGHT = Math.round(HEXA_HEIGHT * 0.75);

  /* Draw hexagon to test the hits with hitArea */
  this.hitArea = setAndGetShape(radius);
  this.hitTest = function (coords) {
    const localCoords = this.toLocal(new PIXI.Point(coords.x, coords.y));

    return this.hitArea.contains(localCoords.x * this.scale.x, localCoords.y * this.scale.y);
  };
}
/*-----------------------
--------- PRIVATE -------
-----------------------*/
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

/*---------------------
--------- API ---------
----------------------*/
export default {
  ObjectHexaTerrain,
  ObjectHexaUnit
};
