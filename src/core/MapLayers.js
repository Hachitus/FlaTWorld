import * as PIXI from 'pixi.js';
import { utils } from './index.js';

/*---------------------
------ VARIABLES ------
---------------------*/

/*---------------------
-------- EXPORT -------
---------------------*/
export class MapLayer extends PIXI.Container {
  /**
   * Creates a basic layer for the Map. This type of layer can not hold subcontainers. Note that different devices and graphic cards can
   * only have specific size of bitmap drawn, and PIXI cache always draws a bitmap thus the default is: 4096, based on this site:
   * http://webglstats.com/ and MAX_TEXTURE_SIZE. This is important also when caching.
   *
   * @namespace flatworld.maplayers
   * @class MapLayer
   * @constructor
   * @param {Object} options                            optional options
   * @param {String} options.name                       Layers name, used for identifying the layer. Useful in debugging, but can be
   * used for finding correct layers too
   * @param  {Object} options.coord                   coord starting coords of layer. Relative to parent map layer.
   * @param  {Integer} options.coord.x         X coordinate
   * @param  {Integer} options.coord.y         Y coordinate
   * @param  {Object} options.specialLayer            Is this layer special (e.g. UILayer not included in normal operations)
   * @param  {Integer} options.specialLayer.x         X coordinate
   * @param  {Integer} options.specialLayer.y         Y coordinate
   **/
  constructor({
      name = '',
      coord = { x: 0, y: 0 },
      specialLayer = false,
      zoomLayer = true,
      selectable = false } = {}) {
    super();

    Object.assign(this, coord);

    /**
     * Layers name, used for identifying the layer. Useful in debugging, but can be used for finding correct layers too
     *
     * @attribute name
     * @type {String}
     */
    this.name = '' + name;
    /**
     * Is this layer special (e.g. UILayer not included in normal operations)
     *
     * @attribute specialLayer
     * @type {Boolean}
     */
    this.specialLayer = !!specialLayer;
    /**
     * Will this layer change dynamically or can we assume that this holds the same objects always, until game reload
     *
     * @attribute static
     * @type {Boolean}
     */
    this.zoomLayer = !!zoomLayer;
    /**
     * Can you select objects from this layer. For example with Map.getObjectsUnderArea
     *
     * @attribute selectable
     * @type {Boolean}
     */
    this.selectable = selectable;
    /**
     * Every added UIObject will be listed here for removal and updating. The indexes in the list provide the easy option to remove only
     * certain object from the UIObjects.
     *
     * @attribute UIObjectList
     * @type {Array}
     */
    this.UIObjectList = {};
  }
  /**
   * Does this layer use subcontainers.
   *
   * @method hasSubcontainers
   * @return {Boolean} true = uses subcontainers.
   */
  hasSubcontainers() {
    return (this.subcontainersConfig && this.subcontainersConfig.width && this.subcontainersConfig.height) ? true : false;
  }
  /**
   * Move layer based on given amounts
   *
   * @method move
   * @param  {Object} coord            The amount of x and y coordinates we want the layer to move. I.e. { x: 5, y: 0 }. This would move
   * the map 5 pixels horizontally and 0 pixels vertically
   * @param  {Integer} coord.x         X coordinate
   * @param  {Integer} coord.y         Y coordinate
   **/
  move(coord) {
    this.x += coord.x;
    this.y += coord.y;
  }
  /**
   * set layer zoom
   *
   * @method setZoom
   * @param {Number} amount The amount that you want the layer to zoom.
   * @return {Number} The same amount that was given, except after transform to 2 decimals and type cast to Number
   * */
  setZoom(amount) {
    this.scale.x = this.scale.y = +amount.toFixed(2);

    return this.scale.x;
  }
  /**
   * get layer zoom
   *
   * @method getZoom
   * @return {Boolean} current amount of zoom
   * */
  getZoom() {
    return this.scale.x;
  }
  /**
   * Get primary layers, that this layer holds as children. So basically all children that are
   * not special layers (such as UI layers etc.)
   *
   * @method getPrimaryLayers
   * @param {MapDataManipulator} filters    Filters the children based on these rules
   * @param filters               
   * @return {Array}                        Primary children layers under this layer
   * */
  getPrimaryLayers({ filters } = {}) {
    return this.children.filter(thisChild => {
      if ((filters &&
          filters.doesItFilter("layer") &&
          !filters.filter(thisChild).length) ||
          thisChild.specialLayer) {
        return false;
      }

      return true;
    });
  }
  /**
   * Get all objects that are this layers children or subcontainers children. Does not return
   * layers, but the objects. Works on primary layer only currently. So can not seek for
   * complicated children structure, seeks only inside subcontainers.
   *
   * @method getObjects
   * @param {MapDataManipulator}  filter  filter for filtering correct objects
   * @return {Array}                      All the objects (not layers) found under this layer
   * */
  getObjects(filter) { // eslint-disable-line no-unused-vars
    throw new Error('Has to be implemented in child class');
  }
  /**
   * Create and add special layer, that holds UI effects in it. UILayer is normally positioned
   * as movableLayers 3rd child. And the
   * actual UI stuff is added there.
   *
   * @method createUILayer
   * @param  {String} name          name of the layer
   * @param  {Object} coord         Coordinates of the layer
   * @param  {Integer} coord.x      X coordinate
   * @param  {Integer} coord.y      Y coordinate
   * @return {MapLayer}            The created UI layer
   **/
  createUILayer(name = 'default UI layer', coord = { x: 0, y: 0 }) {
    const layer = new MapLayer(name, coord);

    layer.specialLayer = true;
    this.addChild(layer);

    this.UILayer = layer;

    return layer;
  }
  /**
   * Return the UILayer. If no UILayer is yet created, will return undefined
   *
   * @method getUILayer
   * @return {MapLayer | undefined}
   */
  getUILayer() {
    return this.UILayer;
  }
  /**
   * Adds and object to this layers UILayer child. If an object with the same name already exists, we remove it automatically and replace
   * it with the new object given as parameter.
   *
   * @method addUIObject
   * @param {Object} object   The UI object to be added under this layer
   * @param {Object} UIName   Name of the UI object. This is important as you can use it to remove the UI object later or replace it.
   * @return {Array}          All the UIObjects currently on this layer
   */
  addUIObject(object, UIName) {
    if (this.UIObjectList[UIName] && Array.isArray(this.UIObjectList[UIName])) {
      this.UIObjectList[UIName].push(object);
    } else if (this.UIObjectList[UIName]) {
      this.UIObjectList[UIName] = [this.UIObjectList[UIName]];
      this.UIObjectList[UIName].push(object);
    } else {
      this.UIObjectList[UIName] = object;
    }

    if (!this.getUILayer()) {
      this.UILayer = this.createUILayer();
    }

    this.UILayer.addChild(object);

    return this.UIObjectList;
  }
  /**
   * If object is given, removes that object, otherwiseRemove all the UIObjects from this layer
   *
   * @method deleteUIObjects
   * @param {Object} object   If you wish to delete particular object
   * @return {Array} empty    UIObjects array
   * */
  deleteUIObjects(UIName) {
    const UILayer = this.getUILayer() || this.createUILayer();

    if (UIName) {
      const object = this.UIObjectList[UIName];

      _removeObjectsFromLayer(object, UILayer);
      
      this.UIObjectList[UIName] = undefined;
      return;
    } else {
      Object.keys(this.UIObjectList).map((index) => {
        const object = this.UIObjectList[index];

        _removeObjectsFromLayer(object, UILayer);

        this.UIObjectList[index] = undefined;
      });
    }

    return this.UIObjectList;
  }
}

export class MapLayerParent extends MapLayer {
  /**
   * Layer designed to hold subcontainers. But can handle objects too. Different devices graphic cards can only have specific size of
   * bitmap drawn, and PIXI cache always draws a bitmap. Thus the default is: 4096, based on this site: http://webglstats.com/ and
   * MAX_TEXTURE_SIZE
   *
   * @class MapLayerParent
   * @constructor
   * @param {Object} options
   * @param {String} options.name                    name layer property name, used for identifiying the layer, usefull in debugging,
   * but used also otherwise too
   * @param  {Object} options.coord                  starting coords of layer. Relative to parent map layer.
   * @param  {Integer} options.coord.x               X coordinate
   * @param  {Integer} options.coord.y               Y coordinate
   * @param  {Object} options.subcontainers          Subontainer size. If given activated subcontainers, otherwise not.
   * @param  {Integer} options.subcontainers.width   width (in pixels)
   * @param  {Integer} options.subcontainers.height  height (in pixels)
   * @param {Boolean} options.specialLayer           Is this special layer or not.
   */
  constructor({
      name = '', // eslint-disable-line no-unused-vars
      coord = { x: 0, y: 0 }, // eslint-disable-line no-unused-vars
      subcontainers = { width: 0, height: 0, maxDetectionOffset: 100 },
      specialLayer = false,
      zoomLayer = true, // eslint-disable-line no-unused-vars
      selectable = false } = {}) {
    super(arguments[0]);

    this.oldAddChild = super.addChild.bind(this);
    this.subcontainersConfig = subcontainers;
    this.subcontainerList = [];
    this.selectable = selectable;
    this.specialLayer = specialLayer;
  }
  /**
   * We override the PIXIs own addchild functionality. Since we need to support subcontainers in
   * addChild. We check subcontainers and
   * then we call the original (PIXIs) addChild
   *
   * @method addChild
   * @param {PIXI.DisplayObject} displayObject      PIXI.DisplayObject
   */
  addChild(displayObject) {
    if (this.hasSubcontainers()) {
      const correctContainer = setCorrectSubcontainer(displayObject, this);
      this.oldAddChild(correctContainer);
    } else {
      this.oldAddChild(displayObject);
    }

    return displayObject;
  }
  /**
   * Get all objects that are this layers children or subcontainers children. Does not return layers, but the objects.
   * Works on primary layer only currently. So can not seek for complicated children structure, seeks only inside subcontainers.
   *
   * @method getObjects
   * @param {MapDataManipulator}  filter  filter for filtering correct objects
   * @return {Array}            All the objects (not layers) found under this layer
   * */
  getObjects(filter) {
    const allObjects = [];
    const willFilter = filter && filter.doesItFilter("object");      
    let objects;

    this.getSubcontainers().forEach(subcontainer => {
      if (willFilter) {
        objects = subcontainer.children.filter(o => !!filter.filter(o).length);
      } else {
        objects = subcontainer.children;
      }

      allObjects.push(objects);
    });

    return utils.general.flatten2Levels(allObjects);
  }
  /**
   * Returns the configurations set for subcontainers.
   *
   * @method getSubcontainerConfigs
   */
  getSubcontainerConfigs() {
    return this.subcontainersConfig;
  }
  /**
   * Returns subcontainers based on the given coordinates. Can be applied through a MapDataManipulator filter also.
   *
   * @method getSubcontainersByCoordinates
   * @param  {Object} coordinates
   * @param  {Integer} coordinates.x                  X coordinate
   * @param  {Integer} coordinates.y                  Y coordinate
   * @param  {MapDataManipulator} options.filter      Filter for selecting only certain subcontainers
   */
  getSubcontainersByCoordinates(coordinates) {
    if (!this.hasSubcontainers()) {
      throw new Error('tried to retrieve subcontainers, when they are not present');
    }

    const foundSubcontainers = _getClosestSubcontainers(this, coordinates);

    return foundSubcontainers;
  }
  /**
   * @method getSubcontainers
   */
  getSubcontainers() {
    return utils.general.flatten2Levels(this.subcontainerList);
  }
}

export class MapSubcontainer extends PIXI.Container {
  /**
   * This class is intended mostly for use with mapLayers, so an internal class. It is exported for
   * testing purposes.
   * 
   * Subcontainers are containers that hold objects like units and terrain etc. under them. They have some restrictions atm. since they
   * are PIXI.ParticleContainers. But when needed we can extend MapLayers with another class which is subcontainer, but not
   * ParticleContainer at the present there is no need, so we won't extend yet. Subcontainers help the layers to make better movement of
   * the map, by making subcontainers visible or invisible and even helping with selecting objects on the map. Thus we don't need to use
   * our inefficient Quadtree. The intention was to use PIXI.ParticleContainer for this, but it seems it doesn't clean up the memory
   * afterwards the same way as normal Container.
   *
   * @private
   * @class MapSubcontainer
   * @constructor
   * @param  {Object} size              REQUIRED. Defineds subontainer size.
   * @param  {Integer} size.width       width (in pixels)
   * @param  {Integer} size.height      height (in pixels)
   */
  constructor(size) {
    if (!size) {
      throw new Error('MapSubcontainer requires size parameter');
    }

    super();

    this.specialLayer = true;
    this.size = size;
    this.selectable = false;
  }
  /**
   * Gets this subcontainers coordinates and size
   *
   * @method getSubcontainerArea
   * @param {Number} scale                              The size of scale the map currently has
   * @param {Boolean} options.toGlobal                  Do we get the global coordinates or local
   * @return {Object}                                   x, y, width and height returned inside object.
   */
  getSubcontainerArea({ toGlobal = true } = {}) {
    const coordinates = toGlobal ? this.toGlobal(new PIXI.Point(0, 0)) : this;

    return {
      x: Math.round(coordinates.x),
      y: Math.round(coordinates.y),
      width: Math.round(this.size.width),
      height: Math.round(this.size.height)
    };
  }
}

export class MinimapLayer extends PIXI.Container {
  /**
   * Subcontainers are containers that hold objects like units and terrain etc. under them. They have some restrictions atm. since they
   * are PIXI.ParticleContainers. But when needed we can extend MapLayers with another class which is subcontainer, but not
   * ParticleContainer at the present there is no need, so we won't extend yet. Subcontainers help the layers to make better movement of
   * the map, by making subcontainers visible or invisible and even helping with selecting objects on the map. Thus we don't need to use
   * our inefficient Quadtree. The intention was to use PIXI.ParticleContainer for this, but it seems it doesn't clean up the memory
   * afterwards the same way as normal Container.
   *
   * @private
   * @class MapSubcontainer
   * @constructor
   * @param  {Object} size              Subontainer size. If given activated subcontainers, otherwise not.
   * @param  {Integer} size.width       width (in pixels)
   * @param  {Integer} size.height      height (in pixels)
   */
  constructor(size) {
    super();

    this.specialLayer = true;
    this.targetSize = size;
    this.selectable = false;
  }
}
/*---------------------
------- PRIVATE -------
----------------------*/
/**
 * Helper function for setting subcontainers to parent containers. Adds subcontainers when
 * needed. Subcontainers are not and can not be initialized at the start as we won't know the
 * size of the parent container. Container is always dynamic in size.
 *
 *
 * @method setCorrectSubcontainer
 * @private
 * @static
 * @method setCorrectSubcontainer
 * @param {PIXI.DisplayObject} displayObject
 * @param {Object} parentLayer
 */
function setCorrectSubcontainer(displayObject, parentLayer) {
  const { subcontainersConfig, subcontainerList } = parentLayer;
  const xIndex = Math.floor(displayObject.x / subcontainersConfig.width);
  const yIndex = Math.floor(displayObject.y / subcontainersConfig.height);
  let thisSubcontainer;

  subcontainerList[xIndex] = subcontainerList[xIndex] || [];
  thisSubcontainer = subcontainerList[xIndex][yIndex] = subcontainerList[xIndex][yIndex] || [];

  if (subcontainerList[xIndex][yIndex].length <= 0) {
    thisSubcontainer = new MapSubcontainer({
      x: xIndex * subcontainersConfig.width,
      y: yIndex * subcontainersConfig.height,
      width: subcontainersConfig.width,
      height: subcontainersConfig.height
    });

    subcontainerList[xIndex][yIndex] = thisSubcontainer;
    thisSubcontainer.x = xIndex * subcontainersConfig.width;
    thisSubcontainer.y = yIndex * subcontainersConfig.height;
    thisSubcontainer.visible = !subcontainersConfig.isHiddenByDefault;
  }

  displayObject.x -= thisSubcontainer.x;
  displayObject.y -= thisSubcontainer.y;
  subcontainerList[xIndex][yIndex].addChild(displayObject);

  return subcontainerList[xIndex][yIndex];
}
/**
 * Get the closest subcontainers of the given area.
 *
 * @method setCorrectSubcontainer
 * @private
 * @static
 * @method _getClosestSubcontainers
 * @param  {Object} layer                         Instance of PIXI.Container - The layer being used
 * @param  {Object} givenCoordinates              Coordinates or rectangle
 * @param  {Integer} givenCoordinates.x           x coordinate
 * @param  {Integer} givenCoordinates.y           y coordinate
 * @param  {Integer} givenCoordinates.width       width of the rectangle
 * @param  {Integer} givenCoordinates.height      height of the rectangle
 * @param  {Object} options                       Optional options.
 * @return {Array}                                Array of found subcontainers.
 */
function _getClosestSubcontainers(layer, givenCoordinates) {
  const { width, height, maxDetectionOffset } = layer.getSubcontainerConfigs();
  const coordinates = {
    x: givenCoordinates.x >= 0 ? givenCoordinates.x - maxDetectionOffset : -maxDetectionOffset,
    y: givenCoordinates.y >= 0 ? givenCoordinates.y - maxDetectionOffset : -maxDetectionOffset,
    width: (givenCoordinates.width || 0) + maxDetectionOffset * 2,
    height: (givenCoordinates.height || 0) + maxDetectionOffset * 2
  };
  const allFoundSubcontainers = [];
  const xIndex = Math.floor(coordinates.x / width);
  const yIndex = Math.floor(coordinates.y / height);
  const x2 = coordinates.width ? coordinates.x + coordinates.width : +coordinates.x;
  const y2 = coordinates.height ? coordinates.y + coordinates.height : +coordinates.y;
  const widthIndex = Math.floor(x2 / width);
  const heightIndex = Math.floor(y2 / height);
  const subcontainerList = layer.subcontainerList;

  for (let thisXIndex = xIndex; thisXIndex <= widthIndex; thisXIndex++) {
    if (thisXIndex >= 0 && subcontainerList && subcontainerList[thisXIndex]) {
      for (let thisYIndex = yIndex; thisYIndex <= heightIndex; thisYIndex++) {
        if (thisYIndex >= 0 && subcontainerList[thisXIndex][thisYIndex]) {
          allFoundSubcontainers.push(subcontainerList[thisXIndex][thisYIndex]);
        }
      }
    }
  }

  return allFoundSubcontainers;
}

function _removeObjectsFromLayer(object, layer) {
  if (Array.isArray(object)) {
    object.forEach(function (o) {
      layer.removeChild(o);
    });
  } else {
    layer.removeChild(object);
  }
}

/*---------------------
--------- API ---------
----------------------*/
export default {
  MapLayer,
  MapLayerParent,
  MinimapLayer
}
