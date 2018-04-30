import * as PIXI from 'pixi.js';

/**
 * @class utils.mouse
 * @return {Object}      isRightClick, eventData.getPointerCoords, eventData.getHAMMERPointerCoords, eventMouseCoords
 */

/**
 * Detects if the mouse click has been the right mouse button
 *
 * @method isRightClick
 * @param {Event} e   The event where the click occured
 */
function isRightClick(e) {
  return e.which === 3;
}
/**
 * Disabled the right click (or something else in mobile) context menu from appearing
 */
function disableContextMenu(canvas) {
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
}
/**
 * @method getPointerCoords
 * @param  {Event} e    Event object
 * @return {PIXI.Point}
 */
function getPointerCoords(e) {
  return new PIXI.Point(e.offsetX, e.offsetY);
}
/**
 * @method getHAMMERPointerCoords
 * @param  {Event} e    Event object
 * @return {PIXI.Point}
 */
function getHAMMERPointerCoords(e) {
  // We need to remove the element position on the page from the center coordinates.
  const position = e.target.getBoundingClientRect();

  return new PIXI.Point(e.center.x - position.left, e.center.y - position.top);
}


function getGlobalCoordinates(e, isSupportedTouch) {
  return isSupportedTouch ? getHAMMERPointerCoords(e) : getPointerCoords(e);
}
/**
 * Transform coordinates that are in the window to become relative with the given element
 *
 * @param  {[type]} coordinates [description]
 * @param  {[type]} element     [description]
 * @return {[type]}             [description]
 */
export function coordinatesFromGlobalToRelative(coordinates, element) {
  const elementPosition = getElementPositionInWindow(element);

  return {
    x: coordinates.x - elementPosition.x,
    y: coordinates.y - elementPosition.y
  };
}
/**
 * Gets given elements position relative to window
 *
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
function getElementPositionInWindow(el) {
  let xPos = 0;
  let yPos = 0;

  while (el) {
    if (el.tagName.toLowerCase() === 'body') {
      // deal with browser quirks with body/window/document and page scroll
      const xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      const yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPos += (el.offsetTop - el.scrollTop + el.clientTop);
    }

    el = el.offsetParent;
  }
  return {
    x: xPos,
    y: yPos
  };
}

/**
 * @method eventMouseCoords
 * @param  {Event} e    Event object
 * @return {Object}
 */
export function eventMouseCoords(e) {
  const pos = {
    x: 0,
    y: 0
  };

  if (!e) {
    e = window.event;
  }
  if (e.pageX || e.pageY) {
    pos.x = e.pageX;
    pos.y = e.pageY;
  } else if (e.clientX || e.clientY) {
    pos.x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    pos.y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  // posx and posy contain the mouse position relative to the document
  // Do something with this information
  return pos;
}

/**
 * Deactivate the selection of text, by dragging
 *
 * @method toggleMouseTextSelection
 */
export function toggleMouseTextSelection(element = document.getElementsByTagName('body')[0]) {
  element.style.webkitTouchCallout = 'none';
  element.style.webkitUserSelect = 'none';
  element.style.khtmlUserSelect = 'none';
  element.style.mozUserSelect = 'none';
  element.style.msUserSelect = 'none';
  element.style.userSelect = 'none';
}

export default {
  isRightClick,
  disableContextMenu,
  eventData: {
    getPointerCoords,
    getHAMMERPointerCoords,
    getGlobalCoordinates
  },
  coordinatesFromGlobalToRelative,
  eventMouseCoords,
  toggleMouseTextSelection
};