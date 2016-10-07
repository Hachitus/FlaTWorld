(function () {
  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var { ObjectSpriteTerrain, ObjectSpriteUnit } = window.flatworld.objects;
  var { calcLongDiagonal, calcShortDiagonal, createHexagon } = window.flatworld.extensions.hexagons.utils;
  var PIXI = window.flatworld_libraries.PIXI;

  /*-----------------------
  -------- VARIABLES ------
  -----------------------*/
  var shape;

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

    const HEIGHT = Math.round(calcLongDiagonal(radius));
    const WIDTH = Math.round(calcShortDiagonal(radius));
    const SIDE = Math.round(radius);

    this.anchor.set(0.5, 0.5);
    this.areaHeight = this.HEIGHT = HEIGHT;
    this.areaWidth = this.WIDTH = WIDTH;
    this.SIDE = SIDE;
    this.ROW_HEIGHT = Math.round(HEIGHT * 0.75);

    /* Draw hexagon to test the hits with hitArea */
    this.hitArea = setAndGetShape(radius);
    this.hitTest = function (coords) {
      var localCoords;

      localCoords = this.toLocal(new PIXI.Point(coords.x, coords.y));

      return this.hitArea.contains(localCoords.x * this.scale.x, localCoords.y * this.scale.y);
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
      shape = createHexagon(radius);
    }

    return shape;
  }

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  window.flatworld.extensions.hexagons.objects = {
    ObjectHexaTerrain,
    ObjectHexaUnit
  };
})();
