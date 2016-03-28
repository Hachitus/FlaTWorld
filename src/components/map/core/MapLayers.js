(function () {
  'use strict';

  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  var PIXI = window.flatworld_libraries.PIXI;

  /*---------------------
  ------ VARIABLES ------
  ---------------------*/
  var _UIObjects = [];

  /*---------------------
  -------- EXPORT -------
  ---------------------*/
  class MapLayer extends PIXI.Container {
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
    constructor(options = {
        name: "",
        coord: { x: 0, y: 0 },
        specialLayer: false,
        selectable: false } ) {
      var { name, coord, specialLayer, selectable } = options;

      super();
      Object.assign(this, coord);

      /**
       * Layers name, used for identifying the layer. Useful in debugging, but can be used for finding correct layers too
       *
       * @attribute name
       * @type {String}
       */
      this.name = "" + name;
      /**
       * Is this layer special (e.g. UILayer not included in normal operations)
       *
       * @attribute specialLayer
       * @type {Boolean}
       */
      this.specialLayer = !!specialLayer;
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
      return this.subcontainersConfig ? true : false;
    }
    /**
     * Is this layer cached at the moment or not.
     *
     * @method isCached
     * @return {Boolean} true = is cached
     */
    isCached() {
      return this.cacheAsBitmap;
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
      this.drawThisChild = true;
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
     * get UIObjects on this layer, if there are any, or defaulty empty array if no UIObjects are active
     *
     * @method getUIObjects
     * @return {Array} current UIObjects
     * */
    getUIObjects() {
      return _UIObjects;
    }
    /**
     * Get primary layers, that this layer holds as children. So basically all children that are not special layers (such as UI layers etc.)
     *
     * @method getPrimaryLayers
     * @return {Array}                            Primary children layers under this layer
     * */
    getPrimaryLayers({ filters } = {}) {
      return this.children.filter(thisChild => {
        if ( (filters && !filters.filter(thisChild).length ) || thisChild.specialLayer ) {
          return false;
        }

        return true;
      });
    }
    /**
     * Get all objects that are this layers children or subcontainers children. Does not return layers, but the objects.
     *
     * @method getObjects
     * @return {Array}                            All the objects (not layers) found under this layer
     * */
    getObjects() {
      var allObjects = [];

      if (this.hasSubcontainers()) {
        this.subcontainerList.forEach(subcontainer => {
          allObjects.concat(subcontainer.children);
        });
      }

      return allObjects;
    }
    /**
     * @todo IMPLEMENT CACHE PROPERLY! TAKE SUBCONTAINERS INTO ACCOUNT!
     *
     * Sets layer cache on or off.
     *
     * @method setCache
     * @param {Boolean} status      true = activate cache, false = disable cache
     */
    setCache(status) {
      var toCacheStatus = status ? true : false;

      this.cacheAsBitmap = toCacheStatus;

      return toCacheStatus;
    }
    /**
     * Create and add special layer, that holds UI effects in it. UILayer is normally positioned as movableLayers 3rd child. And the
     * actual UI stuff is added there.
     *
     * @method createUILayer
     * @param  {String} name          name of the layer
     * @param  {Object} coord         Coordinates of the layer
     * @param  {Integer} coord.x      X coordinate
     * @param  {Integer} coord.y      Y coordinate
     * @return {MapLayer}            The created UI layer
     **/
    createUILayer(name = "default UI layer", coord = { x: 0, y: 0 }) {
      var layer = new MapLayer(name, coord);

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
      var UILayer;
      _UIObjects = _UIObjects || [];

      /* We remove the old UIObject with the same name, if it exists. */
      if (UIName && this.UIObjectList[UIName]) {
        this.deleteUIObjects(UIName);
      }

      this.UIObjectList[UIName] = object;

      if (!this.getUILayer()) {
        UILayer = this.createUILayer();
      } else {
        UILayer = this.getUILayer;
      }

      this.UILayer.addChild(object);
      _UIObjects.push( object );

      return _UIObjects;
    }
    /**
     * If object is given, removes that object, otherwiseRemove all the UIObjects from this layer
     *
     * @method deleteUIObjects
     * @param {Object} object   If you wish to delete particular object
     * @return {Array} empty    UIObjects array
     * */
    deleteUIObjects(UIName) {
      var UILayer = this.getUILayer();

      if (UIName) {
        let object = this.UIObjectList[UIName];

        UILayer.removeChild(object);
        object = null;
        return;
      }

      Object.keys(this.UIObjectList).map((index) => {
        let object = this.UIObjectList[index];

        UILayer.removeChild(object);
        object = null;
      });

      return _UIObjects;
    }
  }

  class MapLayerParent extends MapLayer {
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
    constructor(options = { name: "", coord: { x: 0, y: 0 }, subcontainers: false, specialLayer: false, selectable: false } ) {
      var { subcontainers, selectable, specialLayer } = options;

      super(options);

      this.oldAddChild = super.addChild.bind(this);
      this.subcontainersConfig = subcontainers;
      this.subcontainerList = [];
      this.selectable = selectable;
      this.specialLayer = specialLayer;
    }
    /**
     * We override the PIXIs own addchild functionality. Since we need to support subcontainers in addChild. We check subcontainers and
     * then we call the original (PIXIs) addChild
     *
     * @method addChild
     * @param {PIXI.DisplayObject} displayObject      PIXI.DisplayObject
     */
    addChild(displayObject) {
      if (this.hasSubcontainers()) {
        let correctContainer;
        correctContainer = setCorrectSubcontainer(displayObject, this);
        this.oldAddChild(correctContainer);
      } else {
        this.oldAddChild(displayObject);
      }

      return displayObject;
    }
    /**
     * Returns the configurations set for subcontainers.
     *
     * @method getSubcontainerConfigs
     */
    getSubcontainerConfigs () {
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
        throw new Error("tried to retrieve subcontainers, when they are not present");
      }

      var foundSubcontainers;

      foundSubcontainers = _getClosestSubcontainers(this, coordinates);

      return foundSubcontainers;
    }
    /**
     * @method getSubcontainers
     */
    getSubcontainers() {
      return this.subcontainerList;
    }
  }

  class MapSubcontainer extends PIXI.Container {
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
    getSubcontainerArea (options = { toGlobal: true } ) {
      var coordinates;

      coordinates = options.toGlobal ? this.toGlobal(new PIXI.Point(0, 0)) : this;

      return {
        x: Math.round( coordinates.x ),
        y: Math.round( coordinates.y ),
        width: Math.round( this.size.width ),
        height: Math.round( this.size.height )
      };
    }
    /**
     * Set cache on or off for this layer
     *
     * @method setCache
     * @param {Boolean} status      true = activate cache, false = disable cache
     */
    setCache(status) {
      var toCacheStatus = status ? true : false;

      this.cacheAsBitmap = toCacheStatus;

      return toCacheStatus;
    }
  }
  /*---------------------
  ------- PRIVATE -------
  ----------------------*/
  /**
   * Helper function for setting subcontainers to parent containers
   *
   * @method setCorrectSubcontainer
   * @private
   * @static
   * @method setCorrectSubcontainer
   * @param {PIXI.DisplayObject} displayObject
   * @param {Object} parentLayer
   */
  function setCorrectSubcontainer(displayObject, parentLayer) {
    var { subcontainersConfig, subcontainerList } = parentLayer;
    var xIndex = Math.floor( displayObject.x / subcontainersConfig.width );
    var yIndex = Math.floor( displayObject.y / subcontainersConfig.height );
    var thisSubcontainer;

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
      thisSubcontainer.visible = subcontainersConfig.isHiddenByDefault ? false : true;
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
    var { width, height, maxDetectionOffset } = layer.getSubcontainerConfigs ();
    var coordinates = {
      x: givenCoordinates.x >= 0 ? givenCoordinates.x - maxDetectionOffset : -maxDetectionOffset,
      y: givenCoordinates.y >= 0 ? givenCoordinates.y - maxDetectionOffset : -maxDetectionOffset,
      width: ( givenCoordinates.width || 0 ) + maxDetectionOffset * 2,
      height: ( givenCoordinates.height || 0 ) + maxDetectionOffset * 2
    };
    var allFoundSubcontainers = [];
    var xIndex = Math.floor( coordinates.x / width );
    var yIndex = Math.floor( coordinates.y / height );
    var x2 = coordinates.width ? coordinates.x + coordinates.width :  +coordinates.x;
    var y2 = coordinates.height ? coordinates.y + coordinates.height :  +coordinates.y;
    var widthIndex = Math.floor( x2 / width );
    var heightIndex = Math.floor( y2 / height );
    var subcontainerList = layer.subcontainerList;

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

  window.flatworld.mapLayers = window.flatworld.mapLayers || {};
  window.flatworld.mapLayers.MapLayer = MapLayer;
  window.flatworld.mapLayers.MapLayerParent = MapLayerParent;
})();