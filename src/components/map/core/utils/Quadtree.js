(function () {
  'use strict';

  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var QuadMod = require("/assets/lib/quadtree-js/quadtree-js-hitman");

  /*---------------------
  --------- API ---------
  ----------------------*/
  class Quadtree {
    /**
     * NOTE! NOT IN USE AT THE MOMENT. THIS WAS LESS EFFICIENT THAN USING SUBCONTAINERS, SO IT WILL BE USED IN THE FUTURE IF NEEDED.
     *
     * This class handles the API for quadtree to search for the wanted objects on the certain coordinates. After this
     * the map should do it's own - more precise - hit detections.
     *
     * @class utils.Quadtree
     * @constructor
     * @requires Quadtree-js. Though this base library can be changed easily
     *
     * @param {Object} options    options for the QuadModule
     * @param {Object} max        How many levels deep
     * @return                    Quadtree instance
     */
    constructor(options, max) {
      var { objects: max_objects, levels: max_levels } = max;

      this.quadtree = new QuadMod(options, max_objects, max_levels);
    }
    /**
     * Add an object to the quadtree.
     *
     * @method add
     * @param {Object} coords                       Coordinates on the global / canvas element.
     * @param {Integer} coords.x                    X coordinate
     * @param {Integer} coords.y                    Y coordinate
     * @param {Object} size                         You can use bounds for the object "hit" detection
     * @param {Integer} size.width                  Width (in pixels)
     * @param {Integer} size.height                 Height (in pixels)
     * @param {Object} data                         Objects extra custom data. This is optional.
     * @return                                      Quadtree instance
     */
    add(coords, size, data) {
      var objToAdd = _creteQuadtreeObject(coords, size, data);

      this.quadtree.insert(objToAdd);
    }
    /**
     * Remove an object from the quadtree.
     *
     * @method remove
     * @param {Object} coords                       Coordinates on the global / canvas element.
     * @param {Integer} coords.x                    X coordinate
     * @param {Integer} coords.y                    Y coordinate
     * @param {Object} size                         You can use bounds for the object "hit" detection
     * @param {Integer} size.width                  Width (in pixels)
     * @param {Integer} size.height                 Height (in pixels)
     * @param {Object} data                         Objects extra custom data. This is optional.
     * @param {Boolean} refresh                     Should we refresh the quadtree setting, after removal. Can take some
     * resources to execute. So we want this to be optional.
     * @return                                      Quadtree instance
     */
    remove(coords, size, data, refresh) {
      var objToRemove = _creteQuadtreeObject(coords, size, data);

      this.quadtree.removeObject(objToRemove);
      refresh && this.quadtree.cleanup();
    }
    /**
     * @method retrieve
     * @param {Object} coords                       Coordinates on the global / canvas element.
     * @param {Integer} coords.x                    X coordinate
     * @param {Integer} coords.y                    Y coordinate
     * @param {Object} size                         You can use bounds for the object "hit" detection
     * @param {Integer} size.width                  Width (in pixels)
     * @param {Integer} size.height                 Height (in pixels)
     */
    retrieve(coords, size = { width: 0, height: 0 } ) {
      const hitDimensions = {
        x: coords.x,
        y: coords.y,
        width: size.width,
        height: size.height
      };
      var objects = [];

      objects = this.quadtree.retrieve(hitDimensions).map((object) => {
        return object.data;
      });

      return objects;
    }
    /**
     * Move an object on the quadtree
     *
     * @method move
     * @param {Object} coords                       Coordinates on the global / canvas element.
     * @param {Integer} coords.x                    X coordinate
     * @param {Integer} coords.y                    Y coordinate
     * @param {Object} size                         You can use bounds for the object "hit" detection
     * @param {Integer} size.width                  Width (in pixels)
     * @param {Integer} size.height                 Height (in pixels)
     * @param {Object} data                         Objects extra custom data. This is optional.
     * @param {Boolean} to                          Should we refresh the quadtree setting, after removal. Can take some
     * resources to execute. So we want this to be optional.
     * @return {Boolean}                            True of false
     */
    move(coords, size, data, to) {
      var foundObject = this.findObject(coords, size, data);

      if (foundObject) {
        this.quadtree.removeObject(foundObject);
        foundObject.x = to.x;
        foundObject.y = to.y;
        this.quadtree.insert(foundObject);
        this.refreshAll();

        return true;
      }

      return false;
    }
    /**
     * refresh the whole quadtree setting. Can spend some resources.
     *
     * @method refreshAll
     */
    refreshAll() {
      this.quadtree.cleanup();
    }
    /**
     * Find an object by hitDetection from the quadtree setting.
     *
     * @method findObject
     * @param {Object} coords                       Coordinates on the global / canvas element.
     * @param {Integer} coords.x                    X coordinate
     * @param {Integer} coords.y                    Y coordinate
     * @param {Object} size                         You can use bounds for the object "hit" detection
     * @param {Integer} size.width                  Width (in pixels)
     * @param {Integer} size.height                 Height (in pixels)
     * @param {Object} data                         Objects extra custom data. This is optional.
     * @return {Object}                             Found object
     */
    findObject(coords, size, data) {
      var foundObject = this.retrieve(coords, size).filter(function(object) {
        return object.data === data ? true : false;
      });

      return foundObject;
    }
  }

  /*----------------------
  ------- PRIVATE --------
  ----------------------*/
  /**
   * @private
   * @static
   * @method _creteQuadtreeObject
     * @param {Object} coords             Coordinates on the global / canvas element.
     * @param {Integer} coords.x          X coordinate
     * @param {Integer} coords.y          Y coordinate
   * @param  {Object} size                You can use bounds for the object if you wish, instead of point / coordinates
   * @param  {Integer} size.width         Width (in pixels)
   * @param  {Integer} size.height        Height (in pixels)
   * @param  {Object} data                Extra data stored for the quadtree object
   * @return {Object}                     Added quadtree object
   */
  function _creteQuadtreeObject(coords, size = {width:0, height:0}, data = undefined) {
    var objToAdd = coords;

    if (coords.x === undefined && coords.y === undefined) {
      throw new Error("_createQuadtreeObject requires x and y coordinates as parameters");
    }
    objToAdd.width = size.width;
    objToAdd.height = size.height;
    objToAdd.data = data;

    return objToAdd;
  }

  window.flatworld.Quadtree = Quadtree;
})();