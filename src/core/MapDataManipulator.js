import { mapLayers, objects, utils } from './index';

/*---------------------
--------- API ---------
----------------------*/
class MapDataManipulator {
  /**
   * Class to get a consistent standard for the engine to be able to filter objects, when
   * retrieving or sorting them. This is used when some method uses filters.
   *
   * You must provide an object that defines how the given objects should be filtered, when
   * constructing. The module will filter with every rule and object given and everything that
   * doesn't pass one of the given filters, will be dropped out.
   * 
   * The rules property must match the value. So for example given property
   * ['prop1', 'isBig'] and value: 'true', object like: 
   * {
   *  obj:
   *    prop1: {
   *      isBig: 'true'
   *    }
   * }
   * 
   * Would match this filter:
   * {
   *   type: 'filter',
   *   object: 'object',
   *   property: ['prop1', 'isBig'],
   *   value: 'true',
   * }
   * The filters are like this:
   * {
   *   type: 'filter',
   *   object: 'layer' | 'object',
   *   property: 'selectable', // THIS can also be an array, like: ['data', 'a'] => data.a
   *   value: true,
   *   matchAny: 'true' | falsy
   * }
   *
   * This class can only filter objects strictly. So that if any of the given filters fail, not objects of that type
   * are returned. matchAny-flag, prevents the filter to fail when one of the objects fail. So if you have a
   * layer-object and matchAny is present, if any of the given filters match, then the match is success. Normally
   * when any of the filters fail, the whole filter result fails for that type.
   *
   * For more information, please check the mapDataManipulatorSpec.js (test) for now.
   *
   * @namespace flatworld
   * @class MapDataManipulator
   * @constructor
   * @param {Array|Object} rules        REQUIRED. The rules that apply for this instance.
   * Multiple rules in Array or one as Object.
   **/
  constructor(rules = utils.general.requireParameter('MapDataManipulator', 'rules')) {
    this.rules = Array.isArray(rules) ? rules : [rules];
    this.classes = {
      layer: Object.keys(mapLayers).map((k) => mapLayers[k]),
      object: Object.keys(objects).map((k) => objects[k])
    };
  }
  /**
   * This has exceptional query, since it actually queries it's parent. Subcontainers have
   * really no useful values and they are dumb containers of objects, every data is on their parent container
   *
   * @method filter
   * @param  {Array | Object} objects     The objects that are being filtered
   * @return {Array}                      The found objects in an Array
   */
  filter(objects) {
    let found;

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
    this.rules = this.rules.concat(rules);
  }

  /**
   * remove a filter rule
   *
   * @method addRule
   * @param {} rules        Rules to add
   */
  removeRule(ruleToRemove) {
    this.rules = this.rules.filter(rule => JSON.stringify(rule) !== JSON.stringify(ruleToRemove));
  }

  /** @todo I think this should be implemented. But it's a small optimization so don't bother yet. Basically the idea is
   * to ONLY use the filters that each situation requires. Not iterate through the unneeded filters
   */
  getOnlyFiltersOf(/*type*/) { }

  /**
   * Checks if this filter instance is set to filter the given type.
   *
   * @param  {string} type   Type of the filter we want to check
   * @return {Boolean}
   */
  doesItFilter(type) {
    return this.rules.some(o => o.object === type);
  }
  /**
   * This is the actual method that runs through the rules and arranges the data
   *
   * @method _runRule
   * @private
   * @param {Array} [varname] [description]
   **/
  _runRule(object) {
    let ruleMatches = undefined;
    let matchedType;

    Object.keys(this.classes).forEach((type) => {
      const filtered = this.classes[type].filter((thisClass) => {
        return object instanceof thisClass;
      });

      matchedType = filtered.length ? type : matchedType;
    });

    for (const rules of Object.values(this.rules)) {
      let matchesAny = false;
      let properRules = rules.rules;

      if (rules.matchAny) {
        matchesAny = true;
      } else if (!Array.isArray(rules.rules)) {
        properRules = [rules];
      }

      for (const rule of Object.values(properRules)) {
        if (rule.type === 'filter') {
          if (rule.object !== matchedType) {
            continue;
          } else if (String(matchesAny) === 'true' && ruleMatches === true) {
            // Rule matching has succeeded once and we skip the rest
            break;
          } else if (String(matchesAny) !== 'true' && ruleMatches === false) {
            // Rule matching failed and all rules must match, since matchAny wasn't given!
            break;
          }

          // Previous conditions didn't match so we continue matching this rule.
          if (matchedType === 'layer') {
            ruleMatches = this._getObject(object, rule);
          } else if (matchedType === 'object') {
            ruleMatches = this._getObject(object, rule);
          }
        }
      }
      if (rules.matchAny && ruleMatches) {
        return object;
      }
    }

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
    let result = false;

    if (Array.isArray(rule.property)) {
      try {
        result = ''+MapDataManipulator.getPropertyWithArray(object, rule.property, 0) === ''+rule.value;
      } catch(e) {
        return false;
      }
    } else {
      result = object[rule.property] === rule.value;
    }
    
    return result;
  }

  static getPropertyWithArray(obj, array, index) {
    const currentProperty = array[index];
    const thisLevel = obj[currentProperty];

    if (array[index + 1]) {
      return MapDataManipulator.getPropertyWithArray(thisLevel, array, ++index);
    } else {
      return thisLevel;
    }
  }
}

MapDataManipulator.OBJECT_LAYER = 'layer';
MapDataManipulator.OBJECT_OBJECT = 'object';

/*---------------------
--------- API ---------
----------------------*/
export default MapDataManipulator;
