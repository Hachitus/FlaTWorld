(function () {
  /*---------------------
  ------- IMPORT --------
  ----------------------*/
  const { PIXI } = window.flatworld_libraries;
  const templates = window.flatworld.UIs.default.templates;
  const createVisibleHexagon = window.flatworld.extensions.hexagons.utils.createVisibleHexagon;
  const drawShapes = window.flatworld.UIs.default.utils.drawShapes;
  const mapLog = window.flatworld.log;

  /*---------------------
  ------ VARIABLES ------
  ----------------------*/
  const UINAME = 'movementArrow';
  let styleSheetElement;
  let cssClasses;
  const elementList = {};

  /*---------------------
  --------- API ---------
  ----------------------*/
  class UIDefault {
    /**
     * The simplest default UI implementation. Implemented UI functionalities for: showSelections, highlightSelectedObject
     *
     * @namespace flatworld.UIs
     * @class default
     * @constructor
     * @requires Handlebars
     * @requires hexagon extension
     * @param  {HTMLElement} modal      The modal used in this UI Theme
     * @param  {Flatworld} FTW          Instance of flatworld class
     * @param  {Object} options         optional options
     * @param  {Object} options.styles  styles for the UI
     */
    constructor(modal, FTW, { radius = 71, styles = '#F0F0F0', elements } = {}) {
      this.RADIUS = radius;
      cssClasses = elements;
      styleSheetElement = this.addStyleElement();
      /* For testing. This is deeefinitely supposed to not be here, but it has stayed there for testing. */
      const createdCSS = `
        ${cssClasses.select} {
          z-index: 9999;
          opacity: 0.9;
          position: fixed;
          left: 0px;
          bottom: 0px;
          background-color: brown;
          border: 1px solid rgb(255, 186, 148);;
          border-bottom: 0px;
          padding:15px;
          margin-left:10px;
        }`;
      this.addCSSRulesToScriptTag(styleSheetElement, createdCSS);

      // Add a media (and/or media query) here if you'd like!
      // style.setAttribute('media', 'screen')
      // style.setAttribute('media', 'only screen and (max-width : 1024px)')

      this.FTW = FTW;
      this.modal = modal || document.getElementById('dialog_select');
      this.styles = styles;
    }
    /**
     * @method getTemplates
     * Required by the map/core/UI.js API
     */
    setFlatworld(FTW) {
      this.FTW = FTW;
    }
    /**
     * @method getTemplates
     * Required by the map/core/UI.js API
     */
    getTemplates() {
      return templates;
    }
    /**
     * Required by the map.UI API
     *
     * @method showSelections
     * @param  {Object} objects     Objects that have been selected. See core.UI for more information
     * @param {Object} getDatas       See explanation in core.UI
     */
    showSelections(objects) {
      const updateCB = this.FTW.drawOnNextTick.bind(this.FTW);
      let cb;

      /* We add the objects to be highlighted to the correct UI layer */
      // objectsToUI(UILayer, objects);

      if (objects && objects.length > 1) {
        cb = () => {
          this.modal.innerHTML = templates.multiSelection({
            title: 'Objects',
            objects
          });

          this.showModal(this.modal, cssClasses);

          _getElement('select').style.display = 'block';
        };
      } else if (objects && objects.length === 1) {
        cb = () => {
          this.highlightSelectedObject(objects[0]);
        };
      } else {
        cb = () => {
          this.FTW.removeUIObject(this.FTW.layerTypes.movableType.id);
          updateCB();
          mapLog.debug('Error occured selecting the objects on this coordinates! Nothing found');
        };
      }

      _getElement('select').style.display = 'none';
      cb();
    }
    /**
     * Required by the map.UI API
     *
     * @method highlightSelectedObject
     * @param  {Object} object        Object that has been selected. See core.UI for more information
     * @param {Object} getDatas       See explanation in core.UI
     * @param {Object} options        Extra options. Like dropping a shadow etc.
     */
    highlightSelectedObject(object, getDatas, options = { shadow: { color: '0x0000', distance: 5, alpha: 0.55, angle: 45, blur: 5 } }) {
      const { shadow } = options;
      const objectDatas = getDatas.allData(object);
      const highlightableObject = this._highlightSelectedObject(object, this.FTW.getRenderer());

      this.modal.innerHTML = templates.singleSelection({
        title: 'Selected',
        object: {
          name: objectDatas.name
        }
      });
      this.showModal(this.modal, cssClasses);

      highlightableObject.dropShadow({
        color: shadow.color,
        distance: shadow.distance,
        alpha: shadow.alpha,
        angle: shadow.angle,
        blur: shadow.blur
      });

      this.FTW.drawOnNextTick();

      _getElement('select').style.display = 'block';

      return highlightableObject;
    }
    /**
     * @method showUnitMovement
     * @param { Object } object           The object that is being moved
     * @param {PIXI.Point | Array} to     Coordinates as an object or array of waypoints / 
     * coordinates where the unit is being moved to.
     */
    showUnitMovement(path) {
      if (!Array.isArray(path)) {
        throw new Error('showUnitMovement demands path array!');
      }

      const arrows = [];
      let prev;

      this.FTW.removeUIObject(this.FTW.layerTypes.movableType.id, UINAME);

      path.forEach((coord, index) => {
        if (index === 0) {
          prev = coord;
          return;          
        }

        arrows.push(this._createArrow(prev, coord));

        prev = coord;
      });
      this.FTW.addUIObject(this.FTW.layerTypes.movableType.id, arrows, UINAME);

      this.FTW.drawOnNextTick();
    }

    /*----------------------
    ------- PRIVATE --------
    ----------------------*/
    /**
     * @private
     * @static
     * @method _highlightSelectedObject
     * @param  {Object} object
     * @param  {MapLayer} movableLayer
     * @param  {PIXI.Renderer} renderer
     */
    _highlightSelectedObject(object, renderer) {
      const movableLayer = this.FTW._getMovableLayer();
      const clonedObject = object.clone(renderer, { anchor: true, scale: true });

      let coord = object.toGlobal(new PIXI.Point(0, 0));
      coord = this.FTW.getMapCoordinates(coord);

      this.createHighlight(clonedObject, { coords: coord });

      return clonedObject;
    }
    _createArrow(localFrom, localTo) {
      return drawShapes.line(new PIXI.Graphics(), localFrom, localTo);
    }
    /**
     * @private
     * @static
     * @method createHighlight
     */
    createHighlight(object, options = { coords: new PIXI.Point(0, 0) }) {
      const UI_CONTAINER_NAME = 'unit highlight';
      const movableLayer = this.FTW._getMovableLayer();
      const container = new this.FTW.createSpecialLayer('UILayer', { toLayer: this.FTW.layerTypes.movableType.id });
      const objCoords = {
        x: Number(object.x),
        y: Number(object.y)
      };
      const highlighterObject = createVisibleHexagon(this.RADIUS, { color: '#F0F0F0' });
      highlighterObject.position.set(objCoords.x, objCoords.y);

      highlighterObject.alpha = 0.5;

      /* We add the children first to subcontainer, since it's much easier to handle the x and y in it, rather than
       * handle graphics x and y */
      container.addChild(highlighterObject);
      container.addChild(object);

      container.position = options.coords;

      this.FTW.removeUIObject(this.FTW.layerTypes.movableType.id);
      this.FTW.addUIObject(this.FTW.layerTypes.movableType.id, container, UI_CONTAINER_NAME);
    }
    /**
     * @method addCSSRulesToScriptTag
     *
     * @param {Object} sheet
     * @param {Object} rules
     */
    addCSSRulesToScriptTag(sheet, rules) {
      sheet.insertRule(rules, 0);
    }
    /**
     * @method addStyleElement
     */
    addStyleElement() {
      const _styleElement = document.createElement('style');
      // WebKit hack :(
      _styleElement.appendChild(document.createTextNode(''));
      document.head.appendChild(_styleElement);

      return _styleElement.sheet;
    }
    /**
     * @method showModal
     *
     * @param {HTMLElement} modalElem
     * @param {Object} cssClasses
     * @todo make sure / check, that modalElem.classList.add gets added only once
     */
    showModal(modalElem, cssClasses) {
      modalElem.classList.add(cssClasses.select);
      /* Would be HTML 5.1 standard, but that might be a long way
        this.modal.show();*/
    }
  }

  /*----------------------
  ------- PRIVATE --------
  ----------------------*/
  /**
   * @private
   * @static
   * @method _getElement
   * @param  {[type]} which [description]
   * @return {[type]}       [description]
   */
  function _getElement(which) {
    if (!elementList[which]) {
      const element = document.querySelector(cssClasses[which]);
      elementList[which] = element;
    }

    return elementList[which];
  }

  window.flatworld.UIs.default.init = UIDefault;
})();
