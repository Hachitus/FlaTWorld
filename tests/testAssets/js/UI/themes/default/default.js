import * as PIXI from 'pixi.js';
import { log as mapLog } from '../../../../../../src/core/';
import * as templates from './layout/';
import { drawLine } from './utils/arrows';
import { createVisibleHexagon } from '../../../../../../src/extensions/hexagons/utils/createHexagon';

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
    this.modal = modal;
    this.styles = styles;
  }
  /**
   * Required by the map.UI API
   *
   * @method showSelections
   * @param  {Object} objects     Objects that have been selected. See core.UI for more information
   * @param {Object} getDatas       See explanation in core.UI
   */
  showSelections(objects, getDatas/*, UIThemeOptions*/) {
    let cb;

    /* We add the objects to be highlighted to the correct UI layer */
    // objectsToUI(UILayer, objects);

    if (objects && objects.length > 1) {
      cb = () => {
        this.showModal(objects, getDatas);
      };
    } else if (objects && objects.length === 1) {
      cb = () => {
        this.highlightSelectedObject(objects[0]);
        this.showModal(objects[0], getDatas);
      };
    } else {
      cb = () => {
        this.unSelect();
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
   * @param {Object} options        Extra options. Like dropping a shadow etc.
   */
  highlightSelectedObject(object, options = { shadow: { color: '0x0000', distance: 5, alpha: 0.55, angle: 45, blur: 5 } }) {
    const { shadow } = options;
    const highlightableObject = this._highlightSelectedObject(object, this.FTW.getRenderer());

    highlightableObject.dropShadow({
      color: shadow.color,
      distance: shadow.distance,
      alpha: shadow.alpha,
      angle: shadow.angle,
      blur: shadow.blur
    });

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
  }
  /**
   * Simply clear all selected objects and close object selection menus etc.
   *
   * @method unSelect
   */
  unSelect() {
    this.FTW.removeUIObject(this.FTW.layerTypes.movableType.id);
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
    const clonedObject = object.clone(renderer, { anchor: true, scale: true });

    let coord = object.toGlobal(new PIXI.Point(0, 0));
    coord = this.FTW.getMapCoordinates(coord);

    this.createHighlight(clonedObject, { coords: coord });

    return clonedObject;
  }
  _createArrow(localFrom, localTo) {
    return drawLine(new PIXI.Graphics(), localFrom, localTo);
  }
  /**
   * @private
   * @static
   * @method createHighlight
   */
  createHighlight(object, options = { coords: new PIXI.Point(0, 0) }) {
    const UI_CONTAINER_NAME = 'unit highlight';
    const container = this.FTW.createSpecialLayer('UILayer', { toLayer: this.FTW.layerTypes.movableType.id });
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

    this.FTW.removeUIObject(this.FTW.layerTypes.movableType.id, UI_CONTAINER_NAME);
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
   */
  showModal(data, getData, type = 'select') {
    //const objectDatas = getDatas.allData(object);
    if(Array.isArray(data)) {
      data = data.map(o => getData(o));
      this.modal.innerHTML = templates.multiSelection({
        title: 'Objects',
        data
      });
    } else {
      this.modal.innerHTML = templates.singleSelection({
        title: 'Selected',
        object: {
          name: getData(data).name
        }
      });
    }

    _getElement('select').style.display = 'block';

    if (!this.modal.classList.contains(cssClasses[type])) {
      this.modal.classList.add(cssClasses[type]);
    }
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

/*---------------------
--------- API ---------
----------------------*/
export default UIDefault;
