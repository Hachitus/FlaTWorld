(function () {
  'use strict';

  /*-----------------------
  ------- VARIABLES -------
  -----------------------*/
  const mapLayers = window.flatworld.mapLayers;
  const objects = window.flatworld.objects;

  /*---------------------
  --------- API ---------
  ----------------------*/
  class MapDataManipulator {
    /**
     * Class to get a consistent standard for the engine to be able to filter objects, when retrieving or sorting them. This is used
     * when some method uses filters.
     *
     * @namespace flatworld
     * @class MapDataManipulator
     * @constructor
     * @param {Array|Object} rules        REQUIRED. The rules that apply for this instance. Multiple rules in Array or one as Object.
     **/
    constructor(rules) {
      this.rules = Array.isArray(rules) ? rules : [rules];
      this.classes = {
        layer: Object.keys(mapLayers).map((k) => mapLayers[k]),
        object: Object.keys(objects).map((k) => objects[k])
      };
    }
    /**
     * This has exceptional query, since it actually queries it's parent. Subcontainers have really no useful values and they are dumb
     * containers of objects, every data is on their parent container
     *
     * @method filter
     * @param  {Array | Object} objects     The objects that are being filtered
     * @return {Array}                      The found objects in an Array
     */
    filter(objects) {
      var found;

      if (!Array.isArray(objects)) {
        found = this._runRule(objects) ? [objects] : [];
      } else {
        found = objects.filter((object) => {
          return this._runRule(object);
        });
      }

      return found;
    }
    /**
     * adds a filter rule
     *
     * @method addRule
     * @param {} rules        Rules to add
     */
    addRule(rules) {
      this.rules.concat(rules);
    }
    /**
     * This is the actual method that runs through the rules and arranges the data
     *
     * @method _runRule
     * @private
     * @param {Array} [varname] [description]
     **/
    _runRule(object) {
      var ruleMatches, matchedType;

      Object.keys(this.classes).forEach((type) => {
        var filtered = this.classes[type].filter((thisClass) => {
          return object instanceof thisClass;
        });

        matchedType = filtered.length ? type : matchedType;
      });

      this.rules.forEach((rule) => {
        if (rule.type === "filter") {
          if (rule.object !== matchedType) {
            return;
          }

          if (matchedType === "layer") {
            ruleMatches = this._getObject(object, rule);
          } else if (matchedType === "object") {
            ruleMatches = this._getObject(object, rule);
          }
        }
      });

      return ruleMatches;
    }
    /**
     * This is the actual method that runs through the rules and arranges the data
     *
     * @method _getObject
     * @private
     * @return {[type]} [description]
     **/
    _getObject(object, rule) {
      return object[rule.property] === rule.value;
    }
  }

  window.flatworld.MapDataManipulator = MapDataManipulator;
})();