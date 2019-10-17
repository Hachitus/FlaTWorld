import * as PIXI from 'pixi.js';
import { mapLayers, ObjectManager, mapEvents, log, utils, constants } from './index';

/*---------------------
------ VARIABLES ------
----------------------*/
const LAYER_TYPE_STATIC = 0;
const LAYER_TYPE_MOVABLE = 1;
const LAYER_TYPE_MINIMAP = 2;
const _renderers = {};
const protectedProperties = {};
const currentlySelectedObjects = [];
let _drawMapOnNextTick = false;
let isMapReadyPromises = [];
let _privateRenderers, _zoomLayer, _movableLayer, _minimapLayer, ParentLayerConstructor;

/*---------------------
--------- API ---------
----------------------*/
class Flatworld {
  /**
   * Main class for the engine
   *
   * Initializes the whole structure and plugins and is used as primary API for all operations. This class is e.g. passed to every
   * plugin that get initialized with their init-method.
   *
   * You use the class by instantiating it (new) and then finishing initialization with init-method. Please see examples below.
   *
   * The biggest part of creating the map, is the data structure. There is a clear data structure that you can see from the
   * tests/data-folder, but the factory is responsible for creating the objects, so you can use your own factory implementation. So to
   * understand more, please see e.g. hexaFactory in tests/manual.
   *
   * The map consists of layer on top of each other. The example is best understood when thinking typical war strategy game. The
   * structure is this:
   * 1. ZoomLayer: Handles things like scaling / zooming the map
   * 2. MovableLayer: Obviously handles movement of the map. Also is a good place to get map coordinates. Since getting global
   * coordinates won't help you much, half of the time.
   * 3. Different layers: like units, terrain, fog of war, UIs etc. Can also contains special layers like dynamically changed UIlayers.
   * 4. possible subcontainers (used for optimized object selection and map movement). Can also contains special layers like dynamically
   * changed UIlayers.
   * 5. Individual objects, like units, terrains, cities etc...
   *
   * Plugins can be added with activatePlugins-method by sending them to the class. Plugins must always implement init-method, which
   * receives Map instance. Plugins are not yet restricted what they can do and can add functionality without touching map or can modify
   * objects or their prototypes through access to Map instance.
   *
   * @example
   *     var map = new Map(divContainer, mapOptions );
   *     promises = map.init( gameData.pluginsToActivate, mapData.startPoint );
   *
   * A note on the UI part of the map. The UI is not the primary UI interface for the map, but instead it is the UI that is used when
   * interacting with the map and objects in it. So e.g. when user selects a unit on the map. How that unit is highlighted as selected
   * and what kind of possible info-box we show to the user regarding that object, movement of units etc.
   *
   * @namespace flatworld
   * @class Flatworld
   * @constructor
   * @requires Canvas (webGL support recommended) HTML5-element supported.
   *
   * @param {HTMLElement} mapCanvas                       HTML element which will be container for the created canvas element.
   * @param {Object} [props]                              Extra properties
   * @param {Object} props.bounds                         Bounds of the viewport
   * @param {Integer} props.bounds.width                  Bound width
   * @param {Integer} props.bounds.height                 Bound height
   * @param {Object} [props.mapSize]                      The total mapSize
   * @param {Integer} props.mapSize.x                     x-axis
   * @param {Integer} props.mapSize.y                     y-axis
   * @param {Object} props.rendererOptions                Renderer options passed to PIXI.autoDetectRenderer
   * @param {Object} props.subcontainers                  Subcontainers size in pixels. If given, will activate subcontainers. If not
   * given or false, subcontainers are not used.
   * @param {Integer} props.subcontainers.width           Subcontainer width
   * @param {Integer} props.subcontainers.height          Subcontainer height
   * @param {FPSCallback} [trackFPSCB]                    Callback function for tracking FPS in renderer. So this is used for debugging
   * and optimizing.
   *
   * @return {Object}                                      New Map instance
   */
  constructor(
    mapCanvas = null, {
      bounds = { width: 0, height: 0 },
      mapSize = { x: 0, y: 0 },
      rendererOptions = { autoResize: true, antialias: false },
      minimapCanvas,
      subcontainers = {
        width: 100,
        height: 100,
        maxDetectionOffset: 0 // maxDetectionOffset default set later
      },
      trackFPSCB = false,
      defaultScaleMode = constants.DEFAULT_SCALE_MODE
    } = {},
    mouseTextSelection = false) {

    if (!utils.environment.isWebglSupported()) {
      const error = new Error('Webgl is not supported');
      log.error(error);
      throw error;
    }
    /* Check for the required parameters! */
    if (!mapCanvas) {
      const error = new Error(`${this.constructor.name} needs canvas element!`);
      log.error(error);
      throw error;
    }

    /* If the constructor was passed mapCanvas as a string and not as an Element, we get the element */
    if (typeof mapCanvas === 'string') {
      mapCanvas = document.querySelector(mapCanvas);
    }

    /* Make sure the mapCanvas is empty. So there are no nasty surprises */
    mapCanvas.innerHTML = '';
    /* Add the given canvas Element to the options that are passed to PIXI renderer */
    Object.assign(rendererOptions, bounds, {
      view: mapCanvas,
    });
    /* Create PIXI renderer. Practically PIXI creates its own canvas and does its magic to it */
    _renderers.main = new PIXI.Renderer(rendererOptions);
    _renderers.main.getResponsibleLayer = () => _zoomLayer;
    /* Create PIXI renderer for minimap */
    if (minimapCanvas) {
      _renderers.minimap = minimapCanvas ?
        new PIXI.Renderer({ width: 0, height: 0, view: minimapCanvas, autoResize: true }) :
        undefined;
      _renderers.minimap.plugins.interaction.destroy();
      _renderers.minimap.getResponsibleLayer = this.getMinimapLayer;
    }
    /* We handle all the events ourselves through addEventListeners-method on canvas, so destroy pixi native method */
    _renderers.main.plugins.interaction.destroy();

    /* This defines which MapLayer class we use to generate layers on the map. Under movableLayer. These are layers like: Units,
     * terrain, fog of war, UIs etc. */
    ParentLayerConstructor = mapLayers.MapLayerParent;

    /* These are the 2 topmost layers on the map:
     * - zoomLayer: Keeps at the same coordinates always and is responsible for holding map
     * scale value and possible
     * objects that do not move with the map. ZoomLayer has only one child: _movableLayer
     * - movableLayer: Moves the map, when the user commands. Can hold e.g. UI objects that move
     * with the map. Like
     * graphics that show which area or object is currently selected. */
    _zoomLayer = new mapLayers.MapLayer({ name: 'zoomLayer', coord: { x: 0, y: 0 } });
    _movableLayer = new mapLayers.MapLayer({ name: 'movableLayer', coord: { x: 0, y: 0 } });
    _minimapLayer = new mapLayers.MapLayer({ name: 'minimapLayer', coord: { x: 0, y: 0 } });
    _zoomLayer.addChild(_movableLayer);

    /* needed to make the canvas fullsize canvas with PIXI */
    utils.resize.fullsizeCanvasCSS(_renderers.main.view);
    /* stop scrollbars of showing */
    mapCanvas.style.overflow = 'hidden';

    utils.mouse.disableContextMenu(_renderers.main.view);

    // Disable the selection of text by dragging, from the whole body element
    !mouseTextSelection && utils.mouse.toggleMouseTextSelection();

    /* We cache the privateRenderers in array format to a module variable */
    _privateRenderers = Object.keys(_renderers).map(idx => _renderers[idx]);

    protectedProperties.zoomLayer = _zoomLayer;
    protectedProperties.movableLayer = _movableLayer;

    /* See PIXI.SCALE_MODES for */
    this.defaultScaleMode = PIXI.settings.SCALE_MODE = defaultScaleMode;
    /**
     * canvas element that was generated and is being used by this new generated Map instance.
     *
     * @attribute canvas
     * @type {HTMLElement}
     * @required
     **/
    this.canvas = _renderers.main.view;
    /**
     * canvas element that was generated and is being used by this new generated Map instance.
     *
     * @attribute canvas
     * @type {HTMLElement}
     * @required
     **/
    this.minimapCanvas = _renderers.minimap ? _renderers.minimap.view : undefined;
    /**
     * @attribute mapSize
     * @type {x: Number, y: Number}
     * @optional
     **/
    this.mapSize = mapSize;
    /**
     * list of plugins that the map uses and are initialized
     * @see Map.activatePlugins
     *
     * @attribute plugins
     * @type {Set}
     **/
    this.plugins = new Set();
    /**
     * Subcontainers size that we want to generate, when layers use subcontainers.
     *
     * @attribute subcontainersConfig
     * @type {{width: Integer, height: Int, maxDetectionOffset: Int}}
     **/
    // Set default
    subcontainers.maxDetectionOffset = subcontainers.maxDetectionOffset || 100;
    this.subcontainersConfig = subcontainers;
    /**
     * Callback function that gets the current FPS on the map and shows it in DOM
     *
     * @attribute trackFPSCB
     * @type {Function}
     **/
    this.trackFPSCB = trackFPSCB;
    /**
     * ObjectManager instance. Responsible for retrieving the objects from the map, on desired
     * occasions. Like when the player clicks
     * the map to select some object. This uses subcontainers when present.
     *
     * @attribute objectManager
     * @type {ObjectManager}
     **/
    this.objectManager = new ObjectManager();
    /**
     * Set variable showing if the device supports touch or not.
     *
     * @attribute isTouch
     * @type {Boolean}
     **/
    this.isSupportedTouch = utils.environment.isTouchDevice();
    /**
     * Layer types. Can be extended, but the already defined types are supposed to be constants and not to be changed.
     *
     * @attribute layerTypes
     * @type {Object}
     */
    this.layerTypes = {
      staticType: {
        id: LAYER_TYPE_STATIC
      },
      movableType: {
        id: LAYER_TYPE_MOVABLE
      },
      minimapType: {
        id: LAYER_TYPE_MINIMAP
      }
    };
    /**
     * Self explanatory
     *
     * @attribute VERSION
     * @type {SEMVER}       http://semver.org/
     */
    this.VERSION = constants.VERSION;

    /**
     * This holds callback functions executed before the actual map render is done
     * @type {Objects}
     */
    this.preRenderers = {};

    /**
     * Holds all the objects on the map. This is an alternative data structure to make some
     * operations easier. Basically it will be populated with the primaryLayers, It is populated as an object, that is
     * organized based on layers group-property. So when layer.group === 'terrain', allMapObjects.terrain will hold
     * those objects.
     */
    this.allMapObjects = {};
  }
  /**
   * This initializes the map and makes everything appear on the map and actually work. Also initializes the given plugins since
   * normally the plugins have to be activated before the map is shown.
   *
   * @method init
   * @param {String[]|Object[]} plugins                  Plugins to be activated for the map. Normally you should give the plugins here
   * instead of separately passing them to activatePlugins method. You can provide the module strings or module objects.
   * @param  {Object} coord                     Starting coordinates for the map.
   * @param  {Integer} coord.x                  X coordinate.
   * @param  {Integer} coord.y                  Y coordinate.
   * @param {Function} tickCB                   callback function for tick. Tick callback is initiated in every frame. So map draws
   * happen during ticks.
   * @param {Object} options                    Extra options.
   * @param {Boolean} options.fullsize          Do we set fullsize canvas or not at the beginning. Default: true
   * @return {Array}                            Returns an array of Promises. If this is empty / zero. Then there is nothing to wait
   * for, if it contains promises, you have to wait for them to finish for the plugins to work and map be ready.
   **/
  init(plugins = [], coord = { x: 0, y: 0 }, tickCB = null, options = { fullsize: true }) {
    if (!this.getPrimaryLayers().length) {
      throw new Error('You should have layers created for the map, before initializing the map');
    }

    options.fullsize && this.resizeCanvasToFullSize();

    this.getAllObjects().forEach(o => {
      if (o && o.initializeCoordinates) {
        o.initializeCoordinates(this);
      }
    })

    /* Create data structures. Need to be done before activating plugins */
    this.allMapObjects = this._createArrayStructure();

    /* Sets the correct Map starting coordinates */
    coord && Object.assign(_movableLayer, coord);

    isMapReadyPromises = plugins.length && this.initPlugins(plugins);

    /* We activate the default tick for the map, but if custom tick callback has been given, we activate it too */
    this._defaultTick();
    tickCB && this.customTickOn(tickCB);

    return isMapReadyPromises || Promise.resolve();
  }
  /**
   * Returns a promise that resolves after the map is fully initialized
   *
   * @method whenReady
   * @return {Promise}        Promise that holds all the individual plugin loading promises
   **/
  whenReady() {
    return Promise.all(isMapReadyPromises);
  }
  /**
   * The correct way to update / redraw the map. Check happens at every tick and thus in every frame.
   *
   * @method drawOnNextTick
   **/
  drawOnNextTick() {
    _drawMapOnNextTick = true;
  }
  /**
   * The correct way to update / redraw the map. Check happens at every tick and thus in every frame.
   *
   * @method drawOnNextTick
   **/
  collectGarbage() {
    _privateRenderers.forEach(renderer => renderer.textureGC.run());
  }
  /**
   * Add an UI object to the wanted layer.
   *
   * @method addUIObject
   * @param {Integer} layer           Type of the layer. this.layerTypes.STATIC.id or layerTypes.MOVABLE.id.
   * @param {Object | Array} object   The object to be attached as UI object.
   */
  addUIObject(layerType, objects, UIName) {
    if (Array.isArray(objects)) {
      objects.forEach((object) => {
        this._addObjectToUIlayer(layerType, object, UIName);
      });
    } else {
      this._addObjectToUIlayer(layerType, objects, UIName);
    }
  }
  /**
   * Remove an UI object to the wanted layer.
   *
   * @method removeUIObject
   * @param {Integer} layer       Type of the layer. layerTypes.STATIC of layerTypes.MOVABLE.
   * @param {String} objectName   The object to be attached as UI object.
   */
  removeUIObject(layerType, UIName) {
    switch (layerType) {
      case LAYER_TYPE_STATIC:
        _zoomLayer.deleteUIObjects(UIName);
        break;
      case LAYER_TYPE_MOVABLE:
        _movableLayer.deleteUIObjects(UIName);
        break;
    }
  }
  /**
   * Create a special layer, that can holds e.g. UI effects in it.
   *
   * @method createSpecialLayer
   * @param {String} name               name of the layer
   * @param {Object} options            Optional options.
   * @param {Object} options.coord      Coordinates of the layer
   * @param {Integer} options.coord.x   X coordinate
   * @param {Integer} options.coord.y   Y coordinate
   * @param {Object} options.toLayer    To which layer will this layer be added to as UILayer.
   *  Default false
   * @return {MapLayer}            The created UI layer
   **/
  createSpecialLayer(name = 'default special layer',
    options = {
      coord: {
        x: 0,
        y: 0 },
      toLayer: false }) {
    const coord = options.coord || { x: 0, y: 0 };
    const layer = new mapLayers.MapLayer({ name, coord });

    layer.specialLayer = true;

    switch (options.toLayer) {
      case LAYER_TYPE_STATIC:
        _zoomLayer.addChild(layer);
        break;
      case LAYER_TYPE_MOVABLE:
        _movableLayer.addChild(layer);
        break;
    }

    return layer;
  }
  /**
   * All parameters are passed to ParentLayerConstructor (normally constructor of MapLayer).
   *
   * @method addLayer
   * @param {Object} group        REQUIRED
   * @param {Object} layerOptions OPTIONAL
   * @uses MapLayer
   * @return {MapLayer}           created MapLayer instance
   **/
  addLayer(group, layerOptions) {
    if (!group) {
      throw new Error('Group is required for every layer');
    }
    if (this.getSubcontainerConfigs() && layerOptions.subcontainers !== false) {
      layerOptions.subcontainers = this.getSubcontainerConfigs();
    }

    const layersParameters = Object.assign({}, layerOptions, { group });

    const newLayer = new ParentLayerConstructor(layersParameters);
    _movableLayer.addChild(newLayer);

    return newLayer;
  }
  /**
   * Just a convenience function (for usability and readability), for checking if the map uses
   * subcontainers.
   *
   * @method usesSubcontainers
   * @return {Boolean}
   **/
  usesSubcontainers() {
    return !!(this.getSubcontainerConfigs().width && this.getSubcontainerConfigs().height);
  }
  /**
   * Returns current subcontainers configurations (like subcontainers size).
   *
   * @method getSubcontainerConfigs
   * @return {Object}
   **/
  getSubcontainerConfigs() {
    return this.subcontainersConfig;
  }
  /**
   * Get the size of the area that is shown to the player. More or less the area of the browser
   * window.
   *
   * @method getViewportArea
   * @param  {Boolean} isLocal                                                  Do we want to
   * use Map coordinates or global / canvas
   * coordinates. Default = false
   * @return {{x: Integer, y: Integer, width: Integer, height: Integer}}        x- and
   * y-coordinates and the width and height of the
   * viewport
   **/
  getViewportArea(isLocal = false, multiplier = 0) {
    const layer = isLocal ? _movableLayer : _zoomLayer;
    let leftSideCoords = new PIXI.Point(0, 0);
    let rightSideCoords = new PIXI.Point(window.innerWidth, window.innerHeight);

    if (isLocal) {
      rightSideCoords = layer.toLocal(rightSideCoords);
      leftSideCoords = layer.toLocal(leftSideCoords);
    }

    const leftSide = {
      x: leftSideCoords.x,
      y: leftSideCoords.y
    };
    const rightSide = {
      x2: rightSideCoords.x,
      y2: rightSideCoords.y
    };

    const offset = {
      x: (Math.abs(rightSide.x2) - leftSide.x) * multiplier,
      y: (Math.abs(rightSide.y2) - leftSide.y) * multiplier
    };
    return {
      x: Math.round(leftSide.x - offset.x),
      y: Math.round(leftSide.y - offset.y),
      width: Math.round(Math.abs(Math.abs(rightSide.x2) - leftSide.x) + offset.x * 2),
      height: Math.round(Math.abs(Math.abs(rightSide.y2) - leftSide.y) + offset.y * 2)
    };
  }
  /**
   * Remove a primary layer from the map
   *
   * @method removeLayer
   * @param {MapLayer|PIXI.Container|PIXI.ParticleContainer} layer       The layer object to be
   * removed
   **/
  removeLayer(layer) {
    _movableLayer.removeChild(layer);

    return layer;
  }
  /**
   * return the mapsize as width and height
   *
   * @return {Object}       { x: Number, y: Number }
   */
  getMapsize() {
    return this.mapSize;
  }
  /**
   * Moves the map the amount of given x and y pixels. Note that this is not the destination coordinate, but the amount of movement that
   * the map should move. Internally it moves the movableLayer, taking into account necessary properties (like scale). Draws map after
   * movement.
   *
   * @method moveMap
   * @param {Object} coord                 The amount of x and y coordinates we want the map to move. I.e. { x: 5, y: 0 }. With this we
   * want the map to move horizontally 5 pixels and vertically stay at the same position.
   * @param {Integer} coord.x              X coordinate
   * @param {Integer} coord.y              Y coordinate
   * @param {Integer} absolute             If the given coordinates are not relative, like move map 1 pixel, but instead absolute, like
   * move map to coordinates { x: 1, y: 2 }. Defaults to false (relative).
   **/
  moveMap({ x = 0, y = 0 }, { absolute = false } = {}) {
    const realCoordinates = {
      x: Math.round(x / _zoomLayer.getZoom()),
      y: Math.round(y / _zoomLayer.getZoom())
    };

    if (absolute) {
      _movableLayer.position = new PIXI.Point(x, y);
    } else {
      _movableLayer.move(realCoordinates);
    }

    mapEvents.publish('mapMoved');
    this.drawOnNextTick();
  }
  /**
   * Initializes all plugins for the map. Iterates through the given plugins we wish to
   * initialize and does the actual work in initPlugin-method.
    *
   * @method initPlugins
   * @param {Object[]} pluginsArray   Array that consists the plugin modules to be activated
   * @return {Promise}                Promise. If string are provided resolved those with System.import, otherwise resolves immediately.
   * */
  initPlugins(pluginsArray = []) {
    const allPromises = [];

    /* Iterates over given plugins Array and calls their init-method, depeding if it is String or Object */
    pluginsArray.forEach(data => {
      if (typeof data.plugin === 'object') {
        const params = {};
        data.parameters = data.parameters || {};

        Object.keys(data.parameters).forEach(i => {
          if (!data.parameters[i].bind) {
            throw new Error('All parameters to plugins must be functions with bind-method!');
          }

          params[i] = data.parameters[i].bind(data.plugin);
        });

        allPromises.push(this.initPlugin(data.plugin, params));
      } else {
        log.error(new Error(`Plugin '${data.plugin.pluginName}' was not an object`));
      }
    });

    return allPromises;
  }
  /**
   * Activate plugin for the map. Plugins need .pluginName property and .init-method. Plugins init-method activates the plugins and we
   * call them in Map. Plugins init-metho receivse this (Map instance) as their only parameter.
   *
   * @method initPlugin
   * @throws {Error} Throws a general error if there is an issue activating the plugin
   * @param {Object} plugin        Plugin module
   * */
  initPlugin(plugin, params = []) {
    let promise = Promise.resolve();

    try {
      if (!plugin || !plugin.pluginName || !plugin.init) {
        throw new Error('plugin, plugin.pluginName or plugin.init import is missing!');
      }

      this.plugins.add(plugin[plugin.pluginName]);
      if (this.plugins.has(plugin[plugin.pluginName])) {
        plugin.mapInstance = this;
        plugin._properties = protectedProperties;
        promise = plugin.init(params);
      }
    } catch (e) {
      e.message += ' INFO: An error initializing plugin. JSON.stringify: "' + plugin.pluginName + '" ';
      log.error(e);
      promise = Promise.reject();
    }

    return promise;
  }
  registerPreRenderer(name, callback) {
    if (!name && ! callback) {
      throw new Error('name and callback required for registerPreRenderer');
    }

    this.preRenderers[name] = {
      cb: callback
    };
  }
  removePreRenderer(name) {
    delete this.preRenderers[name];
  }
  /**
   * Setting new prototype methods for the Map instance
   *
   * @method setPrototype
   * @param {String} property         The property you want to set
   * @param {*} value                 Value for the property
   */
  setPrototype(property, value) {
    const thisPrototype = Object.getPrototypeOf(this);

    thisPrototype[property] = value;
  }
  /**
   * Gets object under specific map coordinates. Using subcontainers if they exist, other
   * methods if not. If you provide type parameter, the method returns only object types that
   * match it.
   *
   * NOTE! At the moment filters only support layers! You can not give filters object: object and
   * expect them to be filtered. It will filter only layers (object: layer)!
   *
   * @todo This should work with object filtering too, but the issues regarding it are
   * efficiency (if there are many filter rules, we don't want to go through them twice?). Since
   * the way filters work now, we would have to filter layers first and then again objects.
   *
   * @method getObjectsUnderArea
   * @param  {Object} globalCoords            Event coordinates on the zoomLayer / canvas.
   * @param  {Integer} globalCoords.x         X coordinate
   * @param  {Integer} globalCoords.y         Y coordinate
   * @param  {Object} options                 Optional options
   * @param  {Object} options.filter          The filter to apply to subcontainers
   * @return {Array}                          Array of object found on the map.
   */
  getObjectsUnderArea({ x = 0, y = 0, width = 0, height = 0 }, { filters = null } = {}) {
    const globalCoords = {
      x,
      y,
      width,
      height
    };
    /* We need both coordinates later on and it's logical to do the work here */
    const allCoords = {
      globalCoords,
      localCoords: _movableLayer.toLocal(new PIXI.Point(globalCoords.x, globalCoords.y))
    };
    let objects = [];

    allCoords.localCoords.width = globalCoords.width / this.getZoom();
    allCoords.localCoords.height = globalCoords.height / this.getZoom();

    /* if (this.usesSubcontainers()) {*/
    const allMatchingSubcontainers = this._getSubcontainersUnderArea(allCoords, { filters });

    objects = this._retrieveObjects(allCoords.globalCoords, allMatchingSubcontainers);

    if (filters && filters.doesItFilter("object")) {
      objects = filters.filter(objects);
    }

    return objects;
  }
  /**
   * This returns the normal parent layers that we mostly use for manipulation everything. MovableLayer and zoomLayer are built-in
   * layers designed to provide the basic functionalities like zooming and moving the map. These layers provide everything that extends
   * the map more.
   *
   * @method getPrimaryLayers
   * @param {MapDataManipulator} [{}.filters]         The mapDataManipulator instance, that you use for filtering.
   * @return {Object} Basically anything in the map that is used as a layer (not really counting subcontainers).
   */
  getPrimaryLayers({ filters } = {}) {
    return _movableLayer.getPrimaryLayers({ filters });
  }
  /**
   * Get all objects on the map, from layers and subcontainers.
   *
   * @todo Not very intelligent atm. You need to make a recursive and smart retrieving of objects, so no matter how many layers or
   * layers there are, you always retrieve the end objects and the end of the path.
   *
   * @method getAllObjects
   * @param {MapDataManipulator} [{}.filters]         The mapDataManipulator instance, that you use for filtering.
   * @return {Array}                                  Array of found objects
   * */
  getAllObjects({ filters } = {}) {
    let allObjects;
    let theseObjs;

    allObjects = this.getPrimaryLayers({ filters }).map((layer) => {
      let allObjs;

      if (layer.hasSubcontainers()) {
        const subcontainers = layer.getSubcontainers();

        allObjs = subcontainers.map((subContainer) => {
          theseObjs = subContainer.children.map((obj) => {
            if (filters) {
              return filters.filter(obj);
            }

            return obj;
          });

          return utils.general.flatten2Levels(theseObjs);
        });
      } else {
        return undefined;
      }

      return utils.general.flatten2Levels(allObjs);
    });

    allObjects = utils.general.flatten2Levels(allObjects);

    return allObjects;
  }
  /**
   * Set map zoom. 1 = no zoom. <1 zoom out, >1 zoom in.
   *
   * @method setZoom
   * @param {Number} scale    The amount of zoom you want to set
   * @return {Number}         The amount of zoom applied
   */
  setZoom(newScale) {
    _zoomLayer.setZoom(newScale);

    mapEvents.publish({ name: 'mapZoomed', cooldown: true }, { previousScale: this.getZoom(), newScale });

    return newScale;
  }
  /**
   * Get map zoom. 1 = no zoom. <1 zoom out, >1 zoom in.
   *
   * @method getZoom
   * @return {MapLayer|PIXI.Container|PIXI.ParticleContainer}
   */
  getZoom() {
    return _zoomLayer.getZoom();
  }
  /**
   * Returns the PIXI renderer. Don't use this unless you must. For more advanced or PIXI specific cases.
   *
   * @method getRenderer
   * @return {PIXI.Renderer}
   */
  getRenderer(type) {
    return type === 'minimap' ? _renderers.minimap : _renderers.main;
  }
  /**
   * BEING DEPRECATED. ONLY USED IN UNIT TESTS
   */
  _getMovableLayer() {
    return _movableLayer;
  }
  // toGlobal is there to check if the "coordinates" are a PIXI object and we can use that
  getMapCoordinates(coordinates = constants.ZERO_COORDINATES, revert = false) {
    if (coordinates.toGlobal) {
      return _movableLayer.toLocal(constants.ZERO_COORDINATES, coordinates);
    } else  if (revert) {
      return _movableLayer.position;
    } else {
      return _movableLayer.toLocal(coordinates);
    }
  }
  /**
   * Return minimap layer. Holds minimap, if used in the game.
   *
   * @method getMinimapLayer
   */
  getMinimapLayer() {
    return _minimapLayer;
  }
  /**
   * Removes the minimapLayer from the game.
   */
  removeMinimapLayer() {
    _minimapLayer = undefined;
  }

  /**
   * The objects that are currently selected for details and actions / orders. This gets set by other modules, like plugins.
   *
   * @attribute currentlySelectedObjects
   * @type {Array}
   **/
  get currentlySelectedObjects() {
    return currentlySelectedObjects;
  }
  set currentlySelectedObjects(newObjects) {
    if (newObjects.length && !(newObjects[0] instanceof PIXI.Sprite)) {
      log.warn('currentlySelectedObjects need to be an empty array or array of PIXI.Sprites');
    }
    currentlySelectedObjects.length = 0;
    currentlySelectedObjects.push(...newObjects);
    mapEvents.publish('objectsSelected', newObjects)
  }
  /*---------------------------------------------
   ------- ABSTRACT APIS THROUGH PLUGINS --------
   --------------------------------------------*/
  /**
    * This is abstract method and needs to be implemented with a plugin. This is responsible for translating the object that we receive
    * from the map to actual object data
    *
    * @method getData
    */
  getData(/* object */) { return 'notImplementedYet. Activate with plugin'; }
  /**
    * This is abstract method and needs to be implemented with a plugin. Core module has an implementation for this and if you don't
    * implement your own, I suggest you use it.
    *
    * @method zoomIn
    */
  zoomIn() { return 'notImplementedYet. Activate with plugin'; }
  /**
    * This is abstract method and needs to be implemented with a plugin. Core module has an implementation for this and if you don't
    * implement your own, I suggest you use it.
    *
    * @method zoomOut
    */
  zoomOut() { return 'notImplementedYet. Activate with plugin'; }
  /**
   * Resize the canvas to fill the whole browser content area. Defined by the baseEventlisteners-module (core modules plugin)
   *
   * @method toggleFullScreen
   **/
  toggleFullScreen() {
    utils.resize.toggleFullScreen();
    this.resizeCanvasToFullSize();
  }
  /**
   * Resizes the canvas to the current most wide and high element status.
   * Basically canvas size === window size.
   *
   * @method resizeCanvasToFullSize
   */

  resizeCanvasToFullSize() {
    utils.resize.resizePIXIRenderer(
      this.getRenderer(),
      this.drawOnNextTick.bind(this)
    );
  }
  /**
   * Plugin will overwrite create this method. Method for actually activating minimap.
   *
   * @method initMinimap
   **/
  initMinimap() { return 'notImplementedYet. Activate with plugin'; }
  /**
   * Plugin will overwrite create this method. Method for actually activating fog of war.
   *
   * @method activateFogOfWar
   **/
  activateFogOfWar() { return 'notImplementedYet. Activate with plugin'; }

  /*---------------------------------
  --------- PRIVATE METHODS ---------
  ---------------------------------*/
  /**
   * Retrieves the objects from ObjectManager, with the given parameters. Mostly helper functionality for getObjectsUnderArea
   *
   * @private
   * @method _retrieveObjects
   * @param {Object} allCoords                        REQUIRED
   * @param {Object} allCoords.globalCoords           REQUIRED
   * @param {Integer} allCoords.globalCoords.x        REQUIRED
   * @param {Integer} allCoords.globalCoords.y        REQUIRED
   * @param {Integer} allCoords.globalCoords.width    REQUIRED
   * @param {Integer} allCoords.globalCoords.height   REQUIRED
   * @param {Object} allCoords.localCoords            REQUIRED
   * @param {Integer} allCoords.localCoords.x         REQUIRED
   * @param {Integer} allCoords.localCoords.y         REQUIRED
   * @param {String} [{}.type]                        The type of objects we want
   * @param {Array} [{}.subcontainers]                Array of the subcontainers we will search
   * @return {Array}                                  Found objects
   */
  _retrieveObjects(globalCoords, containers = [], { type = '' } = {}) {
    return this.objectManager.retrieve(globalCoords, containers, {
      type,
      size: {
        width: globalCoords.width,
        height: globalCoords.height
      }
    });
  }
  /**
   * This returns layers by filtering them based on certain attribute. Can be used with more higher order filtering
   *
   * @private
   * @method _getLayersWithAttributes
   * @param {String} attribute
   * @param {*} value
   * @return the current map instance
   **/
  _getLayersWithAttributes(attribute, value) {
    return _movableLayer.children[0].children.filter(layer => {
      return layer[attribute] === value;
    });
  }
  /**
   * Get subcontainers under certain point or rectangle
   *
   * @private
   * @method _getSubcontainersUnderPoint
   * @param  {[type]} globalCoords
   * @param {Object} options              Optional options.
   * @return {Array}                        All subcontainers that matched the critea
   */

  _getSubcontainersUnderArea(allCoords, { filters } = {}) {
    const primaryLayers = this.getPrimaryLayers({ filters });
    let allMatchingSubcontainers = [];
    let thisLayersSubcontainers;

    primaryLayers.forEach(layer => {
      thisLayersSubcontainers = layer.getSubcontainersByCoordinates(allCoords.localCoords);
      allMatchingSubcontainers = allMatchingSubcontainers.concat(thisLayersSubcontainers);
    });

    return allMatchingSubcontainers;
  }
  /**
   * This handles the default drawing of the map, so that map always updates when drawOnNextTick === true. This tick
   * callback is always set and should not be removed or overruled
   *
   * @private
   * @method _defaultTick
   */
  _defaultTick() {
    const ONE_SECOND = 1000;
    let FPSCount = 0;
    let fpsTimer = new Date().getTime();
    let renderStart;
    let totalRenderTime;

    PIXI.Ticker.shared.add(() => {
      if (_drawMapOnNextTick) {
        if (this.trackFPSCB) {
          renderStart = new Date().getTime();
        }

        Object.keys(this.preRenderers).forEach(i => this.preRenderers[i].cb());
        _privateRenderers.forEach(renderer => renderer.render(renderer.getResponsibleLayer()));

        if (this.trackFPSCB) {
          totalRenderTime += Math.round(Math.abs(renderStart - new Date().getTime()));
        }

        _drawMapOnNextTick = false;
      }

      if (this.trackFPSCB) {
        FPSCount++;

        if (fpsTimer + ONE_SECOND < new Date().getTime()) {
          this.trackFPSCB({
            FPS: FPSCount,
            FPStime: fpsTimer,
            renderTime: totalRenderTime,
            drawCount: _renderers.main.drawCount
          });

          FPSCount = 0;
          totalRenderTime = 0;
          fpsTimer = new Date().getTime();
        }
      }
    });
  }
  _addObjectToUIlayer(layerType, object, name) {
    switch (layerType) {
      case LAYER_TYPE_STATIC:
        _zoomLayer.addUIObject(object, name);
        break;
      case LAYER_TYPE_MOVABLE:
        _movableLayer.addUIObject(object, name);
        break;
    }
  }
  _createArrayStructure() {
    const allObjects = {};

    this.getPrimaryLayers().forEach(layer => {
      allObjects[layer.group] = layer.getObjects();
    });

    return allObjects;
  }
}

/*---------------------
--------- API ---------
----------------------*/
export default Flatworld;
