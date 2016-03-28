(function () {
  'use strict';

  /*-----------------------
  --------- IMPORT --------
  -----------------------*/
  var utils = window.flatworld.utils;
  var PIXI = window.flatworld_libraries.PIXI;
  var mapAPI = window.flatworld.mapAPI;
  var mapEvents = window.flatworld.mapEvents;

  /*-----------------------
  ---------- API ----------
  -----------------------*/
  class ObjectSprite extends PIXI.Sprite {
    /**
     * The base class of all sprite objects
     *
     * @namespace flatworld.objects
     * @class ObjectSprite
     * @constructor
     * @extends PIXI.Sprite
     * @param {PIXI.Point} coords       the coordinate where the object is located at, relative to it's parent
     * @param {Object} {}
     * @param {Object} {}.data          objects data, that will be used in the game. It will not actually be mainly used
     * in graphical but rather things  like unit-data and city-data presentations etc.
     */
    constructor(texture, coord = { x: 0, y: 0 }, { data = null } = {}) {
      super(texture);

      /* We need to round the numbers. If there are decimal values, the graphics will get blurry */
      let exactCoords = {
        x: Math.round(coord.x),
        y: Math.round(coord.y)
      };
      this.position.set(exactCoords.x,  exactCoords.y);
      /**
       * Name of the object. Used mostly for debugging
       *
       * @attribute
       * @type {String}
       */
      this.name = "Objects_sprite_" + this.id;
      /**
       * Type of the object. Can be used for filtering, ordering or finding correct objects.
       *
       * @attribute
       * @type {String}
       */
      this.type = "None";
      /**
       * Is the object highligtable.
       *
       * @attribute
       * @type {Boolean}
       */
      this.highlightable = true;
      /**
       * Objects custom data. Holds unit statistics and most data. Like unit movement speed etc.
       *
       * @attribute
       * @type {Object}
       */
      this.data = data;
      /**
       * Object area width in pixels.
       *
       * @attribute
       * @type {Number}
       */
      this.areaWidth = this.width;
      /**
       * Object area height in pixels.
       *
       * @attribute
       * @type {Number}
       */
      this.areaHeight = this.height;
    }
    /**
     * Drawing the object
     *
     * @method innerDraw
     * @param {Number} x coordinate x
     * @param {Number} y coordinate y
     * @return this object instance
     */
    innerDraw(x, y) {
      this.fromFrame ( this.currentFrame );
      this.x = x;
      this.y = y;

      return this;
    }
    /**
     * Draws new frame to animate or such
     *
     * @method drawNewFrame
     * @param {Number} x                coordinate x
     * @param {Number} y                coordinate y
     * @param {Number} newFrame         New frame number to animate to
     * @return this object instance
     */
    drawNewFrame(x, y, newFrame) {
      this.currentFrame = newFrame;

      return this.innerDraw(x, y);
    }
    /**
     * Get the area that is reserved for the graphical presenation of this object as a rectangle.
     *
     * @method getGraphicalArea
     * @param  {Object} options       toGlobal: Boolean. Should the method return global coordinates or local (movableLayer)
     * @return {AreaSize}               { x: Number, y: Number, width: Number, height: Number}
     */
    getGraphicalArea(options = { toGlobal: true } ) {
      var coordinates;

      coordinates = options.toGlobal ? this.toGlobal(new PIXI.Point(0,0)) : this;

      return {
        x: Math.round( coordinates.x ),
        y: Math.round( coordinates.y ),
        width: Math.round( this.width ),
        height: Math.round( this.height )
      };
    }
    /**
     * Coordinate conversion: localToLocal
     *
     * @method localToLocal
     * @param  {Number} x                  X coordinate
     * @param  {Number} y                  Y coordinate
     * @param  {Object} target             PIXI.DisplayObject. The DisplayObject where we should target the coordinates for
     * @return  {{PIXI.Point}} point       PIXI.Point. Coordinates.
     * @return {Coordinates}
     */
    localToLocal(x, y, target) {
      var globalCoords = this.toGlobal( { x, y } );
      var targetLocalCoords = target.toLocal( globalCoords );

      return targetLocalCoords;
    }
    /**
     * Clone object
     *
     * @method clone
     * @param  {Object} renderer              PIXI renderer
     * @param  {Object} options               position: Boolean, anchor: Boolean
     * @return {Object}                       cloned object
     */
    clone(renderer, options = { position: false, anchor: false }) {
      var newSprite = new PIXI.Sprite();

      newSprite.texture = this.generateTexture(renderer);

      if (options.anchor) {
        newSprite.anchor = Object.assign({}, this.anchor);
      }
      if (options.position) {
        newSprite.position = Object.assign({}, this.position);
      }

      return newSprite;
    }
  }

  class ObjectSpriteTerrain extends ObjectSprite {
    /**
     * Terrain tile like desert or mountain, non-movable and cacheable. Normally, but not necessarily, these are
     * inherited, depending on the map type. For example you might want to add some click area for these
     *
     * @class ObjectSpriteTerrain
     * @constructor
     * @extends ObjectSprite
     * @param {Coordinates} coords        format: {x: Number, y: Number}. Coordinates for the object relative to it's parent
     * @param {object} data               This units custom data
     */
    constructor(texture, coords, { data = null } = {}) {
      super(texture, coords, { data });

      this.name = "DefaultTerrainObject";
      this.type = "terrain";
      this.highlightable = false;
    }
  }

  class ObjectSpriteUnit extends ObjectSprite {
    /**
     * Map unit like infantry or worker, usually something with actions or movable. Usually these are extended, depending on the map type.
     * For example you might want to add some click area for these (e.g. hexagon)
     *
     * @class ObjectSpriteUnit
     * @constructor
     * @extends ObjectSprite
     * @requires graphics
     * @param {Object} coords               Coordinates for the object relative to it's parent
     * @param {Integer} coords.x            X coordinate
     * @param {Integer} coords.y            Y coordinate
     * @param {object} data                 This units data
     */
    constructor(texture, coords, { data = null } = {}) {
      super(texture, coords, { data });

      this.name = "DefaultUnitObjects";
      this.type = "unit";
      /**
       * actions bound to this object. @todo THIS HAS NOT BEEN IMPLEMENTED YET!
       *
       * @attribute actions
       * @type {Object}
       */
      this.actions = {};
    }
    /**
     * Execute action on units (move, attack etc.). @todo THIS HAS NOT BEEN IMPLEMENTED YET!
     *
     * @method  doAction
     * @param {String} type
     */
    doAction(type) {
      this.actions[type].forEach(action => {
        action();
      });
    }
    /**
     * Add certain action type. @todo THIS HAS NOT BEEN IMPLEMENTED YET!
     *
     * @method addActionType
     * @param {String} type
     */
    addActionType(type) {
      this.actions[type] = this.actions[type] || [];
    }
    /**
     * Attach callback for the certain action type. @todo THIS HAS NOT BEEN IMPLEMENTED YET!
     *
     * @method addCallbackToAction
     * @param {String} type
     * @param {Function} cb
     */
    addCallbackToAction(type, cb) {
      this.actions[type].push(cb);
    }
    /**
     * @method dropShadow
     */
    dropShadow(...args) {
      return utils.effects.dropShadow(...args);
    }
    /**
      * This is abstract method and needs to be implemented with a plugin. Core module has an implementation for this and if you
      * don't implement your own, I suggest you use it. You can attach any method to object if you wish. Like attack, siege, greet, talk.
      *
      * @method move
      * @requires  mapAPIa..("objectMove") to be declared
      * @attribute [name]
      */
    move(to) {
      mapEvents.publish("objectMove", this);
      mapAPI.post("objectMove", {
        id: this.id,
        from: {
          x: this.x,
          y: this.y
        },
        to
      });
    }
  }

  window.flatworld.objects.ObjectSprite = ObjectSprite;
  window.flatworld.objects.ObjectSpriteTerrain = ObjectSpriteTerrain;
  window.flatworld.objects.ObjectSpriteUnit = ObjectSpriteUnit;
})();